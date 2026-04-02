# MCP server packaging and Claude Code configuration specs

**For a Node.js MCP server like `swiftui-preview-mcp` to work via `npx` and integrate with Claude Code, you need two things: a correctly structured npm package with ESM modules and a hashbang entry point, plus a properly scoped `.mcp.json` config file.** The official MCP servers repository provides a battle-tested template, and Claude Code supports three config scopes (local, project, user) with three transport types (stdio, HTTP, SSE). This report documents every required field and verified path, drawn from Anthropic's official docs, npm specifications, and the `modelcontextprotocol/servers` monorepo.

---

## Complete package.json for npx distribution

Below is the verified, annotated `package.json` for `swiftui-preview-mcp`, modeled on the exact patterns used by every official MCP server (`@modelcontextprotocol/server-filesystem`, `server-memory`, `server-sequential-thinking`):

```json
{
  "name": "swiftui-preview-mcp",
  "version": "1.0.0",
  "description": "MCP server for SwiftUI preview rendering",
  "license": "MIT",
  "type": "module",
  "bin": {
    "swiftui-preview-mcp": "./dist/index.js"
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc && shx chmod +x dist/*.js",
    "prepare": "npm run build",
    "watch": "tsc --watch"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.29.0",
    "zod": "^3.25.0"
  },
  "devDependencies": {
    "@types/node": "^22",
    "shx": "^0.3.4",
    "typescript": "^5.8"
  },
  "engines": {
    "node": ">=18"
  }
}
```

**Field-by-field justification:**

**`"type": "module"` is mandatory**, not optional. The `@modelcontextprotocol/sdk` package is ESM-only. Every official MCP server uses this setting. Without it, Node.js treats `.js` files as CommonJS and import statements fail.

**`"bin"` maps the npx command name to the compiled entry point.** When a user runs `npx swiftui-preview-mcp`, npm checks the `bin` field, finds the `swiftui-preview-mcp` key, and executes `dist/index.js`. The string shorthand (`"bin": "./dist/index.js"`) also works—it auto-maps to the package name—but the object form is explicit and preferred by all official servers.

**`"files": ["dist"]`** restricts the published tarball to only the compiled output. npm always includes `package.json`, `README`, and `LICENSE` regardless. Without this field, npm defaults to publishing everything, bloating the package with source TypeScript, tests, and config files.

**`"prepare": "npm run build"`** auto-builds on `npm install` and before `npm publish`, ensuring `dist/` always exists. The build script uses **`shx`** (a cross-platform shell utility) for `chmod +x` because native `chmod` doesn't exist on Windows.

**`zod` is a required peer dependency** of the MCP SDK. The SDK imports from `zod` internally and expects version 3.25+.

**`"engines": { "node": ">=18" }`** is advisory but recommended. The MCP SDK requires Node.js 18+ (20+ recommended for Web Crypto API). The npm docs confirm this field "is advisory only and will only produce warnings" unless `engine-strict` is set.

**The current `@modelcontextprotocol/sdk` version is `1.29.0`** (latest stable v1.x). A v2 exists but remains pre-alpha, split into `@modelcontextprotocol/server` and `@modelcontextprotocol/client`. v1.x remains the recommended production version with stable v2 anticipated in Q1 2026.

### The hashbang line is non-negotiable

The compiled `dist/index.js` **must** begin with this exact line:

```
#!/usr/bin/env node
```

The npm docs state explicitly: *"Please make sure that your file(s) referenced in `bin` starts with `#!/usr/bin/env node`; otherwise, the scripts are started without the node executable!"* TypeScript preserves this line during compilation, so place it at line 1 of `src/index.ts`:

```typescript
#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
```

Note that **import paths must include the `.js` extension** (e.g., `"@modelcontextprotocol/sdk/server/mcp.js"`)—this is required by NodeNext module resolution with ESM.

### Recommended tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "**/*.test.ts"]
}
```

The official MCP servers use `module: "NodeNext"` or `"Node16"`—both work. **`target: "ES2022"`** enables top-level await. Output directory is `dist/` (matching `"files": ["dist"]` in package.json).

---

## Claude Code MCP config: paths, scopes, and schemas

### Three config scopes with distinct storage locations

Claude Code supports **three scopes** for MCP server configuration. Understanding exactly where each lives resolves the `.mcp.json` vs `~/.claude.json` confusion:

| Scope | Storage location | Sharing model | Use case |
|-------|-----------------|---------------|----------|
| **Project** | **`.mcp.json` at repository root** | Version-controlled, shared with team | Team-standard tooling |
| **Local** (default) | `~/.claude.json` under project path key | Private to you, current project only | Personal dev servers, sensitive credentials |
| **User** | `~/.claude.json` top-level `mcpServers` key | Private to you, all projects | Personal utilities across all projects |

**Precedence order: Local > Project > User.** Local scope overrides project scope, which overrides user scope.

**The project-scoped `.mcp.json` file** sits at the root of your repository and is the recommended approach for distributing MCP server configs with a project. Its structure:

```json
{
  "mcpServers": {
    "swiftui-preview": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "swiftui-preview-mcp"],
      "env": {},
      "cwd": "."
    }
  }
}
```

Claude Code always prompts for confirmation before using project-scoped servers. This file supports **environment variable interpolation**: `${VAR}` and `${VAR:-default}` syntax works in `url`, `headers`, `env`, `command`, and `args` values.

**The local and user scopes** both live inside `~/.claude.json`, differentiated by nesting:

```json
{
  "mcpServers": {
    "user-scope-server": { "..." : "..." }
  },
  "projects": {
    "/path/to/your/project": {
      "mcpServers": {
        "local-scope-server": { "..." : "..." }
      }
    }
  }
}
```

### Known pitfalls with config paths

Several path variants **do not work** despite appearing logical. **`.claude/.mcp.json`** (inside a `.claude` subdirectory) has a confirmed bug causing only partial server loading. **`~/.claude/settings.json`** does not work for MCP servers. **`.claude/settings.local.json`** is silently ignored for MCP configuration. **`.claude/mcp.json`** in a non-git-repo project directory is silently skipped. The only reliable locations are **`.mcp.json` at project root** and **`~/.claude.json`** in the home directory.

---

## Full config schema for all transport types

### stdio transport (local processes)

```json
{
  "mcpServers": {
    "server-name": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "package-name", "--flag", "value"],
      "env": {
        "API_KEY": "sk-xxx",
        "DEBUG": "true"
      },
      "cwd": "/path/to/working/directory"
    }
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"stdio"` | Yes | Transport identifier |
| `command` | string | Yes | Executable to run (`"npx"`, `"node"`, `"python"`, `"uvx"`, `"docker"`) |
| `args` | string[] | No | Command-line arguments passed to the command |
| `env` | object | No | Environment variables (all values must be strings) |
| `cwd` | string | No | Working directory for the spawned process |

### HTTP transport (remote servers, recommended for cloud)

```json
{
  "mcpServers": {
    "remote-api": {
      "type": "http",
      "url": "https://api.example.com/mcp",
      "headers": {
        "Authorization": "Bearer ${API_TOKEN}"
      }
    }
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"http"` | Yes | Streamable HTTP transport |
| `url` | string | Yes | URL of the remote MCP endpoint |
| `headers` | object | No | HTTP headers to include with requests |
| `oauth` | object | No | OAuth 2.0 configuration (`clientId`, `callbackPort`) |

### SSE transport (deprecated)

SSE (Server-Sent Events) remains supported but is **deprecated in favor of HTTP**. The `MCP_TIMEOUT` environment variable does not apply to SSE connections.

---

## CLI commands for managing MCP servers

The `claude mcp` command family manages server configuration without manual file editing:

**`claude mcp add`** is the primary command. All option flags must appear before the server name:

```bash
# stdio transport (-- separates Claude flags from server command)
claude mcp add --transport stdio --scope project swiftui-preview -- npx -y swiftui-preview-mcp

# HTTP transport
claude mcp add --transport http --scope user remote-api https://api.example.com/mcp

# With environment variables and headers
claude mcp add --transport stdio --env API_KEY=sk-xxx -e DEBUG=true my-server -- npx -y my-package
```

| Flag | Description |
|------|-------------|
| `--transport <type>` | `stdio`, `http`, or `sse` |
| `--scope <scope>` | `local` (default), `project`, or `user` |
| `--env KEY=value` / `-e` | Set environment variables (repeatable) |
| `--header "Header: value"` / `-H` | Set HTTP headers |
| `--client-id` | OAuth client ID |
| `--client-secret` | OAuth client secret (stored in system keychain) |
| `--callback-port` | OAuth callback port |
| `--channels` | Enable MCP channel capability |

**`claude mcp add-json`** accepts raw JSON for complex configs:
```bash
claude mcp add-json swiftui-preview '{"type":"stdio","command":"npx","args":["-y","swiftui-preview-mcp"]}'
```

Other commands: **`claude mcp list`** shows configured servers, **`claude mcp get <name>`** shows details for one server, **`claude mcp remove <name>`** removes a server, **`claude mcp add-from-claude-desktop`** imports servers from Claude Desktop's config, and **`claude mcp serve`** exposes Claude Code itself as an MCP server.

---

## Hot reload, Windows, and operational caveats

### No config hot reload—restart required

**Editing `.mcp.json` or `~/.claude.json` requires restarting Claude Code.** The documentation is unambiguous: configuration changes don't take effect until restart. However, MCP servers can dynamically update their own tool lists by sending `list_changed` notifications—this triggers Claude Code to refresh capabilities from that server without disconnect. This is server-initiated dynamic tool updates, not user config reload. A feature request for `/mcp reload` exists but is not yet implemented. Third-party workarounds like `mcp-hot-reload` proxy wrappers can restart MCP server processes without restarting Claude Code.

### Windows requires cmd /c wrapper

On **native Windows** (not WSL), the `npx` command cannot be executed directly by Claude Code. The documented fix:

```bash
claude mcp add --transport stdio my-server -- cmd /c npx -y swiftui-preview-mcp
```

This produces the config:
```json
{
  "command": "cmd",
  "args": ["/c", "npx", "-y", "swiftui-preview-mcp"]
}
```

Without the `cmd /c` wrapper, Windows produces "Connection closed" errors because it cannot directly execute `npx`. **WSL works normally**—no wrapper needed, and config files live in the Linux filesystem at `~/.claude.json`.

### Additional operational parameters

**`MCP_TIMEOUT`** environment variable controls connection timeout (e.g., `MCP_TIMEOUT=10000 claude` for 10 seconds). Does not apply to SSE. **`MAX_MCP_OUTPUT_TOKENS`** controls output size—warning at **10,000 tokens**, hard limit at **25,000 tokens** by default. Both are configurable via environment variables.

### Enterprise managed configs

Enterprise deployments can use **`managed-mcp.json`** in system-wide directories. When present, users cannot add MCP servers through `claude mcp add` or configuration files. Supports `allowedMcpServers` and `deniedMcpServers` allow/deny lists.

---

## Conclusion

The packaging recipe is consistent and well-established: **`"type": "module"` + `"bin"` pointing to a hashbanged `dist/index.js` + `"files": ["dist"]`** is the universal pattern across all official MCP servers. For Claude Code integration, **`.mcp.json` at project root** is the correct shareable config location (not `.claude/mcp.json`), while `~/.claude.json` handles local and user scopes. The most common gotcha is Windows needing `cmd /c npx` instead of bare `npx`. The MCP SDK remains at v1.29.0 for production use with v2 still in pre-alpha. For `swiftui-preview-mcp` specifically, the recommended `.mcp.json` users would commit to their repo is simply `{"mcpServers": {"swiftui-preview": {"type": "stdio", "command": "npx", "args": ["-y", "swiftui-preview-mcp"]}}}`.# **Integration Architecture for swiftui-preview-mcp: Packaging, Distribution, and Claude Code Configuration**

The integration of native platform development tools into autonomous artificial intelligence coding environments requires a highly formalized bridging architecture. The Model Context Protocol (MCP) functions as this critical communication layer, establishing a standardized specification for large language models to interact safely and predictably with external context, discrete execution tools, and disparate data sources.1 To expose a specialized, deeply native utility—such as a SwiftUI preview renderer that interfaces with the macOS xcrun and xcodebuild toolchains—to an agentic command-line interface like Claude Code, the tool must be encapsulated within a robust executable lifecycle. This requires the utility to be packaged as a distributable binary, published via a package manager, and subsequently mapped within the host environment's highly specific topographical configuration hierarchy.2

The following exhaustive technical analysis details the exact specifications required to package the swiftui-preview-mcp server for frictionless distribution via npx. Furthermore, it definitively resolves ongoing architectural ambiguities regarding Claude Code configuration formats, resolving uncertainties surrounding file locations, transport selection mechanisms, Windows execution idiosyncrasies, and configuration hot-reloading protocols.2

## **Node.js Executable Distribution Mechanics**

To engineer an MCP server that developers can instantiate instantly via a command such as npx \-y swiftui-preview-mcp, the underlying project must be structurally defined as a Node.js command-line interface application.4 The npx utility, which stands for Node Package Execute, operates fundamentally as an executable resolution engine rather than a traditional package manager.4 When a user or an autonomous client invokes the npx command, the utility evaluates a strict, deterministic resolution heuristic. It first scans the local directory's node\_modules/.bin folder for matching binaries. If the requested executable is absent locally, it traverses up to the global npm installation cache. Finally, if the executable remains unresolved, npx queries the remote npm registry, downloads the compressed tarball into a temporary cache, extracts it, executes the binary, and subsequently purges the temporary files to maintain environment hygiene.4

For this resolution heuristic to successfully identify, download, and execute the SwiftUI preview server, the project's package.json file must contain specific metadata declarations that explicitly instruct the Node.js runtime and the npm ecosystem on how to expose the execution logic to the host operating system's environment variables.5

### **The package.json Specification and Architectural Constraints**

The package.json file serves as the absolute source of truth for the swiftui-preview-mcp application. For distribution to the public npm registry and subsequent execution via the npm exec or npx pathways, several fundamental fields are strictly mandatory, while others dictate the runtime interpretation of the server's codebase.6

The defining parameters of the package identity are governed by the name and version fields. These properties are entirely non-negotiable for published modules, as they synthesize to form an immutable identifier within the global registry.6 The assigned name must be entirely URL-safe, strictly constrained to a maximum of 214 characters, and devoid of any uppercase typography, as the string is directly translated into directory structures and web routing paths across the npm infrastructure.5 The version field must strictly adhere to semantic versioning standards parseable by the bundled node-semver utility, dictating how clients resolve compatibility.6

Equally critical for modern MCP implementations is the inclusion of the type field. By setting "type": "module", the manifest instructs the Node.js runtime to interpret all .js files within the package directory as ECMAScript modules (ESM), deprecating the legacy CommonJS module resolution algorithm.5 This constraint is a hard requirement for modern TypeScript-based MCP servers that rely on the official @modelcontextprotocol/sdk packages, which distribute exclusively utilizing ESM export signatures.8 Failure to declare the module type will result in catastrophic syntax errors during runtime initialization when Node.js attempts to parse standard import and export statements.7

The main and files fields serve to optimize the distribution artifact. The main attribute defines the programmatic entry point of the module, establishing the root logic path for internal evaluation.5 Conversely, the files array explicitly dictates which directories are bundled into the distributed tarball.9 By explicitly restricting the included assets to the compiled dist directory, developers prevent the accidental publication of raw TypeScript source files, local .env configurations, and heavy development dependencies, thereby dramatically reducing the package's network footprint and latency during npx ephemeral execution.9

However, the definitive operational field for command-line distribution is the bin property.4 The bin field accepts a map correlating arbitrary command names to local file paths containing the execution logic.5 When the npm ecosystem installs the package—either globally or locally—it parses this map and requests the host operating system to generate a symbolic link (in Unix-compliant environments) or a .cmd wrapper script (on Windows platforms), placing the link into the system's execution PATH.5 For the SwiftUI preview tool, the bin map maps the command string swiftui-preview-mcp directly to the compiled entry point at ./dist/index.js.5

Below is the required foundational configuration necessary to satisfy the npm registry and execute the MCP server natively via npx:

JSON

// package.json for swiftui-preview-mcp (npx distribution)  
// Source: npm bin documentation \+ MCP server examples  
{  
  "name": "swiftui-preview-mcp",  
  "version": "0.1.0",  
  "description": "MCP server for SwiftUI Preview — renders.swift files to PNG",  
  "type": "module",  
  "main": "dist/index.js",  
  "bin": {  
    "swiftui-preview-mcp": "./dist/index.js"  
  },  
  "scripts": {  
    "build": "tsc",  
    "start": "node dist/index.js"  
  },  
  "files": \["dist"\],  
  "dependencies": {  
    "@modelcontextprotocol/sdk": "^1.27.0"  
  }  
}

### **The Hashbang Execution Directive**

Declaring the executable mapping within the package.json represents only the structural definition of the command. For the operating system to successfully spawn the process, the entry point file itself must explicitly declare the interpreter required to parse the subsequent byte stream.9 In POSIX-compliant operating systems, and universally supported across Node.js runtime environments, this interpreter directive is declared via a "hashbang" or "shebang" sequence at the absolute first byte of the file.9

If the executable target—in this architecture, the dist/index.js file—omits this specialized character sequence, the host operating system's program loader will blindly attempt to execute the JavaScript abstract syntax as native shell script commands (such as bash or zsh), resulting in immediate syntax violation errors and catastrophic process failure.11 The hashbang unequivocally forces the program loader to pass the remaining file contents directly to the Node.js executable.11

The optimal and standardized implementation of this directive relies on the env utility to dynamically resolve the Node.js path:

JavaScript

// dist/index.js — required hashbang for npx execution  
// Source: npm bin documentation  
\#\!/usr/bin/env node

// ^ THIS LINE IS REQUIRED — without it, npx cannot execute the file as a script

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'  
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

//... rest of server setup

The specific usage of \#\!/usr/bin/env node instead of a rigidly hardcoded binary path (such as \#\!/usr/bin/node or \#\!/usr/local/bin/node) guarantees robust cross-platform compatibility.9 Because contemporary development environments heavily leverage Node Version Managers (NVM), containerized Docker runtimes, and varying operating system distributions, the absolute path to the Node executable is highly volatile.9 By invoking env, the execution environment searches the active $PATH variable at runtime to resolve the currently active Node.js interpreter, ensuring the MCP server launches reliably regardless of the user's specific systemic configuration.12

## **Claude Code Configuration Topology and Precedence**

With the swiftui-preview-mcp server properly packaged, hosted on the registry, and configured for seamless execution via npx, the focus shifts to the host application. Claude Code must be programmatically instructed on how to discover, spawn, and interface with the server process.2 Claude Code resolves MCP server connections through a highly granular, hierarchically structured configuration model that evaluates JSON definitions based on execution context, repository location, and user-level overrides.3

A persistent source of community friction and architectural ambiguity arises from the conflation of configuration strategies between Claude Code (the terminal-based autonomous agent) and Claude Desktop (the graphical user interface application). Claude Desktop relies upon a singular, monolithic configuration file typically located at \~/Library/Application Support/Claude/claude\_desktop\_config.json on macOS or %APPDATA%\\Claude\\claude\_desktop\_config.json on Windows.13 This file is completely independent of Claude Code's execution pathways.15 Claude Code entirely ignores the claude\_desktop\_config.json file unless specifically directed to import its definitions via the explicit claude mcp add-from-claude-desktop utility command.15

Instead, Claude Code leverages an intelligent scope resolution system, querying multiple distinct configuration files to build a composite array of available tools. These scopes are resolved in a strict order of precedence, allowing localized environments to safely override global or team-wide defaults.2

| Scope Designation | Physical File Location | Functional Applicability | Precedence Priority |
| :---- | :---- | :---- | :---- |
| **Local Scope** | \~/.claude.json (Internally mapped to project path) | Private configurations specific to a single local repository. Overrides shared team definitions. Prevents sensitive token leakage into version control. | 1 (Highest) 3 |
| **Project Scope** | .mcp.json (Located at the project root) | Shared team dependencies. Committed to Git to ensure uniform toolchain availability (e.g., standardizing the SwiftUI previewer) across all collaborating engineers. | 2 3 |
| **User Scope** | \~/.claude.json (Located in the user's home directory) | Universal availability. Tools and utilities that the user wishes to invoke across all isolated projects on the host machine without repetitive configuration. | 3 (Lowest) 3 |
| **Managed Scope** | managed-mcp.json (System-level administration paths) | Enterprise governance. IT-enforced allowlists or denylists deployed via MDM tools to strictly control autonomous agent capabilities across corporate fleets. | System Override 3 |

### **Resolving Configuration Ambiguities**

A critical uncertainty within the developer ecosystem concerns the exact nomenclature of the Project-level configuration file. Extensive documentation review confirms that Claude Code exclusively looks for a file explicitly named .mcp.json situated at the absolute root of the working repository.3 The assumption that this file should be housed within the .claude/ subdirectory (i.e., .claude/mcp.json) is factually incorrect; Claude Code will silently ignore any MCP definitions placed in that routing path, leading to severe debugging friction.16 General settings and agent definitions exist within the .claude/ directory, but the MCP configuration remains standalone at the repository root.16

The standard schema for integrating the SwiftUI server utilizes an mcpServers object block.3 This object requires developers to define the execution command, the accompanying runtime args, and the specific type of transport pipeline.3

The following implementation blocks detail the precise JSON schemas required to connect the SwiftUI server to Claude Code, explicitly answering the architectural uncertainties regarding file nomenclature:

JSON

// Claude Code MCP configuration  
// Source: Anthropic Claude Code MCP documentation  
// File location: \<one of the following — document which takes precedence\>

// Option A: Project-level config  
// File:.mcp.json (Verified:.claude/mcp.json is strictly ignored by Claude Code)  
{  
  "mcpServers": {  
    "swiftui-preview": {  
      "command": "npx",  
      "args": \["-y", "swiftui-preview-mcp"\],  
      "type": "stdio"  
    }  
  }  
}

// Option B: User-level config (all projects)  
// File: \~/.claude.json (Verified Windows path: %USERPROFILE%\\.claude.json)  
{  
  "mcpServers": {  
    "swiftui-preview": {  
      "command": "npx",  
      "args": \["-y", "swiftui-preview-mcp"\],  
      "type": "stdio"  
    }  
  }  
}

// Windows note: ⚠ On Windows, "command" MUST be "cmd"  
// and "args" MUST be \["/c", "npx", "-y", "swiftui-preview-mcp"\] to successfully spawn the process.

The configuration schema also natively supports sophisticated environment variable expansion directly within the JSON structures. By utilizing the ${VAR} syntax or the fallback ${VAR:-default} logic within the args or env properties, developers can dynamically inject execution paths without hardcoding sensitive configurations.3 For an advanced swiftui-preview-mcp deployment, this allows the injection of specific Xcode developer paths or simulator identifiers at runtime, bridging the gap between static JSON files and highly dynamic local iOS compilation environments.3

## **Native Windows Execution Idiosyncrasies**

While cross-platform distribution via npm ensures high compatibility, the actual process instantiation of Node.js binaries by autonomous CLI tools encounters severe friction on native Windows platforms.2 The architectural divergence originates in how the Windows kernel manages process creation compared to POSIX-compliant Unix systems.

### **The Shell Invocation Mandate**

On macOS and Linux architectures, configuring the MCP server with the "command": "npx" parameter maps seamlessly to an executable binary that the operating system can instantiate via standard POSIX execve() system calls.9 The operating system directly parses the hashbang directive in the linked script and launches the requisite interpreter.

Conversely, on native Windows installations, npx is fundamentally not a compiled executable binary (.exe). The Node.js installer on Windows provisions command-line utilities as intermediate batch scripts (e.g., npx.cmd) or PowerShell wrappers (e.g., npx.ps1).9 When an application constructed in Rust or Node.js—such as the Claude Code CLI—invokes the low-level Windows process creation API (CreateProcessW) attempting to execute "npx", the system call inherently fails because it lacks the capability to execute a .cmd wrapper directly without an underlying shell environment.19 Consequently, if a developer operates a Windows machine with a standard Linux-style configuration, Claude Code will emit an operational failure, warning that Windows requires a shell wrapper, and the swiftui-preview-mcp server will fail to boot.19

To securely circumvent this architectural barrier, the Windows configuration schema must explicitly invoke the Windows Command Prompt interpreter (cmd.exe) directly, passing the actual npx execution payload as an argument string.20 The configuration must be aggressively modified to define the "command" as "cmd", while moving the npx directive into the "args" array, immediately preceded by the /c flag.20 The /c flag strictly instructs the command interpreter to execute the subsequent string array as a command and then immediately terminate the shell process, preventing zombie shells from persisting in the background.20

| Operating System | Command Property | Arguments Array (args) | Technical Rationale |
| :---- | :---- | :---- | :---- |
| **macOS / Linux** | "npx" | \["-y", "swiftui-preview-mcp"\] | Direct POSIX execution of the symlinked binary script. |
| **Native Windows** | "cmd" | \["/c", "npx", "-y", "swiftui-preview-mcp"\] | Explicit shell invocation required to parse and execute the .cmd shim. |

### **Configuration Path Variations Across Windows Environments**

Beyond process execution, the physical pathing for user-level configurations presents another layer of complexity on Windows machines. The exact location of the global \~/.claude.json file mutates based on the shell context utilized to invoke Claude Code.22

When a developer operates within a native Windows shell, such as PowerShell or the Command Prompt, the user-scoped configuration file relies on the standard Windows profile routing, residing reliably at %USERPROFILE%\\.claude.json (resolving to C:\\Users\\username\\.claude.json).22

However, modern Windows development frequently relies on the Windows Subsystem for Linux (WSL). When Claude Code is executed within a WSL instance, the environment wholly bypasses the host Windows filesystem abstraction, adhering strictly to Linux conventions and generating the configuration at /home/username/.claude.json.22 It is an absolute operational mandate that configurations executed within WSL must reside within the virtualized Linux filesystem.24 Attempting to cross the virtualization boundary by pointing configurations to /mnt/c/Users/... will drastically degrade file read performance and frequently results in execution failures due to mismatched binary linking architectures.24

Furthermore, developers utilizing intermediate emulation shells, such as Git Bash on Windows, may encounter systemic duplication errors. Interacting with the same project repository via different shell environments (e.g., CMD versus Git Bash) can cause Claude Code to generate duplicate project entries within the \~/.claude.json file due to variations in path separator parsing (backslashes versus forward slashes) and drive letter casing, leading to fragmented trust approvals and disjointed configuration states.25

## **Transport Layer Architecture: Stdio versus HTTP**

The Model Context Protocol establishes two foundational transport mechanisms to govern the bidirectional flow of JSON-RPC data between the Claude Code client and the MCP server: Standard Input/Output (stdio) and Streamable HTTP.26 Claude Code is architecturally engineered to support both mechanisms natively, empowering developers to select the transport layer that best aligns with their server's scalability requirements and security posture.2 A legacy transport relying on Server-Sent Events (SSE) remains technically functional but is officially deprecated in favor of the optimized Streamable HTTP pattern.2

The architectural divergence between stdio and HTTP defines the deployment boundaries and lifecycle dynamics of the swiftui-preview-mcp server.27

### **The Process-Bound Stdio Transport**

When an MCP connection is configured with "type": "stdio", the system relies entirely on a localized, process-to-process communication paradigm.27 In this configuration, the Claude Code CLI functions as the overarching parent process. Upon encountering a tool request, Claude Code programmatically spawns the swiftui-preview-mcp server as a deeply isolated, local child subprocess.26

The technical mechanics of this interaction involve direct memory streaming. The child server listens for inbound JSON-RPC 2.0 requests—such as a command to compile a Swift view—directly from its standard input (stdin) pipeline.26 After executing the complex render logic against the local macOS SDKs, the server writes the strictly formatted JSON-RPC response payload directly back into its standard output (stdout) stream, which Claude Code captures, decodes, and interprets.26

The most critical engineering constraint of the stdio transport is the absolute necessity for stream purity. The MCP server process must never, under any circumstances, write unstructured data, debugging strings, or arbitrary telemetry to stdout.26 The pervasive use of native debugging functions, such as console.log() or print(), will instantly inject non-JSON payloads into the communication pipe. This data corruption irreparably breaks the JSON-RPC message framing, forcing the Claude Code client to sever the connection or crash entirely.28 To capture diagnostic telemetry, developers must explicitly route all logging output to standard error (stderr). Claude Code intelligently isolates the stderr stream, capturing the telemetry and writing it to localized, dedicated log files (e.g., mcp-server-swiftui-preview.log) without disrupting the primary data exchange.26

Despite these constraints, stdio is the unequivocally correct transport choice for the swiftui-preview-mcp tool. stdio servers execute with the direct permission scope of the invoking user, granting the subprocess unmitigated access to the local development filesystem, local Git index states, and crucially, the user's localized Xcode installation directories and compilation toolchains.27

### **The Decoupled Streamable HTTP Transport**

In stark contrast, configuring the transport as "type": "http" transforms the MCP implementation from a local, ephemeral script into an independent, scalable network service.26 Under the Streamable HTTP model, the lifecycle of the server is completely decoupled from the Claude Code client.27 The server operates as a continuously running background daemon or cloud-hosted API, exposing standardized endpoints designed to ingest HTTP POST and GET requests.26

While Claude Code fully supports this architecture for connecting to remote enterprise data warehouses, continuous integration systems, or cloud-hosted vector databases, it is fundamentally misaligned with the localized requirements of a SwiftUI renderer.27 The HTTP transport facilitates concurrent connections from thousands of distinct users and supports robust security middleware, including OAuth 2.0 flows and complex bearer token authorization defined within the configuration's "headers" property.3 However, it lacks intrinsic access to the local developer's hard drive and specific iOS compilation environment, making it structurally incompatible with a tool designed to render code actively being edited on a localized workstation.27

## **Lifecycle Management and Configuration Hot-Reloading**

The iterative development and operational maintenance of MCP servers historically suffered from acute lifecycle friction. When modifying the package.json logic, updating the server codebase, or altering parameters within the .mcp.json configuration file, developers were forced to abruptly terminate the active Claude Code session, forfeit their immediate conversational context, and re-execute the CLI agent to force a top-down re-evaluation of the environment state.31 Preserving conversational momentum while dynamically updating capabilities is paramount for agentic AI interactions.

A primary point of uncertainty regarding Claude Code involves its capacity to seamlessly hot-reload MCP configurations without requiring a hard process restart. The resolution to this question is highly nuanced, as Claude Code differentiates structurally between dynamic *tool updates* handled natively by the MCP protocol, and foundational *configuration updates* dictated by the host file system.

### **Protocol-Level Dynamic Updates**

At the core protocol layer, MCP possesses a highly sophisticated list\_changed notification specification.3 If the swiftui-preview-mcp server is actively running and detects internal state alterations—such as the developer dynamically adding a new SwiftUI view file, or the system resolving a new version of the Swift compiler—the server can autonomously emit a notifications/tools/list\_changed JSON-RPC message over the stdout stream.3

Upon intercepting this specific notification, Claude Code automatically pauses its agentic loop, queries the server for its updated array of capabilities, and seamlessly refreshes its internal memory of available tools, prompts, and resources.3 This powerful mechanism occurs instantaneously, completely transparently to the user, and requires no connection drops or application restarts, maintaining perfect conversational continuity while capabilities shift in real-time.3

### **Structural Configuration Reloading**

However, when the structural parameters of the server shift—such as updating the .mcp.json file to inject a new environment variable, alter execution arguments, or modify the underlying transport type—the list\_changed notification is entirely insufficient.31 A configuration change necessitates the literal termination and reconstruction of the spawned Node.js subprocess.

To manage configuration hot-reloading without forcing the user to exit the terminal entirely, the ecosystem has developed several distinct operational pathways:

1. **The Native Context Purge (/clear)**: While the community heavily requested a highly specific /reload-mcps slash command, native Claude Code handles configuration resets via the /clear command.32 Invoking /clear within the interactive REPL truncates the immediate conversational history, but crucially, it forces the Claude Code architecture to re-read all foundational settings files, including .mcp.json and \~/.claude.json, from the local disk.33 This re-initializes the MCP connections and spawns new subprocesses with the updated configurations, bypassing the heavy latency penalty of a complete Node.js initialization sequence.33  
2. **Total Session Restoration (/restart)**: For instances where the entire execution environment requires a pristine restart, but preserving the exact conversational context is critical, the /restart command is utilized.34 This command gracefully shuts down all subprocesses, caches the active session identifier, and immediately re-executes the Claude Code binary invoking the \--resume \<session-id\> flag.34 This performs a total topological re-read of all .mcp.json modifications while perfectly restoring the prior dialogue state.33  
3. **Proxy Middleware Architectures**: For engineers actively developing the inner logic of the swiftui-preview-mcp server itself, relying on native CLI commands introduces unacceptable friction. Advanced proxy wrapper tools, such as mcp-hot-reload and mcpmon, have emerged as the industry standard.35 These utilities inject a transparent middleware layer between Claude Code and the raw Swift rendering logic.35 Claude Code connects to the proxy tool via the stdio transport, entirely unaware of the abstraction.35 The proxy establishes a secondary stdio pipeline to the actual rendering server. When the proxy detects filesystem modifications to the server's source code, it violently kills and re-spawns the child rendering process.35 Crucially, the proxy buffers all incoming JSON-RPC traffic from Claude Code during the restart window, preventing the CLI agent from detecting a broken pipe and terminating the session.35 This provides true, frictionless hot-reloading for local MCP server development.35

### **Mitigating Context Window Bloat via Hub Architectures**

As autonomous agents leverage deeply complex native tools, the sheer volume of JSON schema data injected into the LLM's context window expands exponentially.37 An advanced server like swiftui-preview-mcp may expose dozens of interconnected tools—defining inputs for compilation flags, device UUIDs, resolution scaling, and abstract syntax tree parsing.38 In robust environments running multiple heavy MCP servers simultaneously, the tool schemas alone can consume thousands of tokens, directly degrading the model's reasoning latency, inducing cognitive bloat, and accelerating API cost constraints.37

To counteract this inevitable architectural strain, developers have pioneered MCP "Hub" multiplexers.37 These hubs sit between the raw MCP servers and Claude Code, consolidating complex, multi-step tool interactions into simplified, macro-level operations.37 Instead of exposing 28 granular iOS compilation tools to Claude Code, the hub exposes a single, abstracted tool. The hub executes the intricate web of subprocesses locally, orchestrating the schema complexities out of sight, and returns only the finalized base64 rendering back to the LLM.37 By shielding the agent from raw capability schemas, these hub wrappers have demonstrated the ability to reduce schema token consumption by over 90%, preserving the context window strictly for complex architectural reasoning rather than structural protocol bloat.37

## **Conclusion**

Engineering the swiftui-preview-mcp server to operate frictionlessly alongside Claude Code requires exacting precision across multiple distinct architectural domains. The foundational Node.js packaging layer demands strict adherence to the "type": "module" and "bin" configurations within the package.json, inextricably bound to a cross-platform Unix hashbang (\#\!/usr/bin/env node) that forces the host operating system to execute the payload properly via the npx resolution heuristic.5

Simultaneously, the integration into Claude Code mandates a profound understanding of configuration precedence. By discarding the flawed .claude/mcp.json assumption and definitively rooting shared team definitions in the .mcp.json file, developers establish a secure, version-controlled foundation for tool discovery.3 The architecture must subsequently bend to accommodate operating system rigidity, actively circumventing Windows process limitations by embedding the mandatory cmd /c shell wrapper into the execution arguments to guarantee successful subprocess instantiation.2

Finally, by deliberately selecting the stdio transport layer, developers ensure the server possesses the unmitigated local permissions required to interface with complex macOS compilation tools, while maintaining strict JSON-RPC stream hygiene by siloing diagnostic telemetry to stderr.27 When combined with intelligent hot-reloading proxy strategies and schema optimization hubs, these tightly integrated protocols forge a highly capable, continuously synchronized AI assistant environment that operates natively within the complex realities of modern software engineering.

#### **Джерела**

1. Specification \- Model Context Protocol, доступ отримано квітня 1, 2026, [https://modelcontextprotocol.io/specification/2025-06-18](https://modelcontextprotocol.io/specification/2025-06-18)  
2. Connect Claude Code to tools via MCP \- Claude Code Docs, доступ отримано квітня 1, 2026, [https://docs.anthropic.com/en/docs/claude-code/mcp](https://docs.anthropic.com/en/docs/claude-code/mcp)  
3. Connect Claude Code to tools via MCP \- Claude Code Docs, доступ отримано квітня 1, 2026, [https://code.claude.com/docs/en/mcp](https://code.claude.com/docs/en/mcp)  
4. Understanding npx How It Really Works \- DEV Community, доступ отримано квітня 1, 2026, [https://dev.to/luckychauhan/understanding-npx-how-it-really-works-5g3j](https://dev.to/luckychauhan/understanding-npx-how-it-really-works-5g3j)  
5. package.json \- npm Docs, доступ отримано квітня 1, 2026, [https://docs.npmjs.com/cli/v11/configuring-npm/package-json/](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/)  
6. package.json | npm Docs, доступ отримано квітня 1, 2026, [https://docs.npmjs.com/cli/v10/configuring-npm/package-json\#bin](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#bin)  
7. Modules: Packages | Node.js v25.8.2 Documentation, доступ отримано квітня 1, 2026, [https://nodejs.org/api/packages.html](https://nodejs.org/api/packages.html)  
8. package.json \- modelcontextprotocol/typescript-sdk \- GitHub, доступ отримано квітня 1, 2026, [https://github.com/modelcontextprotocol/typescript-sdk/blob/main/package.json](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/package.json)  
9. Packaging Rust Applications for the NPM Registry \- Orhun's Blog, доступ отримано квітня 1, 2026, [https://blog.orhun.dev/packaging-rust-for-npm/](https://blog.orhun.dev/packaging-rust-for-npm/)  
10. Demystifying npx. Understanding How Script Execution… | by HyunWoo Lee \- Medium, доступ отримано квітня 1, 2026, [https://medium.com/@l2hyunwoo/demystifying-npx-3d4ee54b43ca](https://medium.com/@l2hyunwoo/demystifying-npx-3d4ee54b43ca)  
11. package.json \- npm Docs, доступ отримано квітня 1, 2026, [https://docs.npmjs.com/cli/v7/configuring-npm/package-json/](https://docs.npmjs.com/cli/v7/configuring-npm/package-json/)  
12. Creating an NPM package that runs on command line \- DEV Community, доступ отримано квітня 1, 2026, [https://dev.to/nausaf/creating-an-npm-package-that-runs-on-command-line-with-npx-9a0](https://dev.to/nausaf/creating-an-npm-package-that-runs-on-command-line-with-npx-9a0)  
13. доступ отримано квітня 1, 2026, [https://modelcontextprotocol.io/docs/develop/connect-local-servers\#:\~:text=This%20action%20creates%20a%20new,APPDATA%25%5CClaude%5Cclaude\_desktop\_config.json](https://modelcontextprotocol.io/docs/develop/connect-local-servers#:~:text=This%20action%20creates%20a%20new,APPDATA%25%5CClaude%5Cclaude_desktop_config.json)  
14. github-mcp-server/docs/installation-guides/install-claude.md at main, доступ отримано квітня 1, 2026, [https://github.com/github/github-mcp-server/blob/main/docs/installation-guides/install-claude.md](https://github.com/github/github-mcp-server/blob/main/docs/installation-guides/install-claude.md)  
15. Claude Code MCP Servers: How to Connect, Configure, and Use Them \- Builder.io, доступ отримано квітня 1, 2026, [https://www.builder.io/blog/claude-code-mcp-servers](https://www.builder.io/blog/claude-code-mcp-servers)  
16. \[Bug\] MCP configuration file location detection and safety issues with .claude.json \#15797, доступ отримано квітня 1, 2026, [https://github.com/anthropics/claude-code/issues/15797](https://github.com/anthropics/claude-code/issues/15797)  
17. Documentation incorrect about MCP configuration file location · Issue \#4976 · anthropics/claude-code \- GitHub, доступ отримано квітня 1, 2026, [https://github.com/anthropics/claude-code/issues/4976](https://github.com/anthropics/claude-code/issues/4976)  
18. Claude Code settings \- Claude Code Docs, доступ отримано квітня 1, 2026, [https://code.claude.com/docs/en/settings](https://code.claude.com/docs/en/settings)  
19. Windows requires cmd /c wrapper for npx in .claude.json MCP servers · Issue \#390 \- GitHub, доступ отримано квітня 1, 2026, [https://github.com/SuperClaude-Org/SuperClaude\_Framework/issues/390](https://github.com/SuperClaude-Org/SuperClaude_Framework/issues/390)  
20. Claude Code MCP Setup Guide for Windows \- LobeHub, доступ отримано квітня 1, 2026, [https://lobehub.com/it/mcp/bunprinceton-claude-mcp-windows-guide](https://lobehub.com/it/mcp/bunprinceton-claude-mcp-windows-guide)  
21. claude mcp add on Windows expands /c flag to C:/ path · Issue \#25111 · anthropics/claude-code · GitHub, доступ отримано квітня 1, 2026, [https://github.com/anthropics/claude-code/issues/25111](https://github.com/anthropics/claude-code/issues/25111)  
22. Claude Code Configuration Files: Complete Guide to Settings, Permissions, MCP Servers & Scopes | Inventive HQ, доступ отримано квітня 1, 2026, [https://inventivehq.com/knowledge-base/claude/where-configuration-files-are-stored](https://inventivehq.com/knowledge-base/claude/where-configuration-files-are-stored)  
23. How do I configure Claude in a Windows Cygwin environment? : r/ClaudeAI \- Reddit, доступ отримано квітня 1, 2026, [https://www.reddit.com/r/ClaudeAI/comments/1q6yli0/how\_do\_i\_configure\_claude\_in\_a\_windows\_cygwin/](https://www.reddit.com/r/ClaudeAI/comments/1q6yli0/how_do_i_configure_claude_in_a_windows_cygwin/)  
24. The Complete Guide to Setting Global Instructions for Claude Code CLI \- Naqeeb ali Shamsi, доступ отримано квітня 1, 2026, [https://naqeebali-shamsi.medium.com/the-complete-guide-to-setting-global-instructions-for-claude-code-cli-cec8407c99a0](https://naqeebali-shamsi.medium.com/the-complete-guide-to-setting-global-instructions-for-claude-code-cli-cec8407c99a0)  
25. \[BUG\] Duplicate project entries in .claude.json due to Windows path format inconsistency \#19910 \- GitHub, доступ отримано квітня 1, 2026, [https://github.com/anthropics/claude-code/issues/19910](https://github.com/anthropics/claude-code/issues/19910)  
26. Transports \- Model Context Protocol, доступ отримано квітня 1, 2026, [https://modelcontextprotocol.io/specification/2025-03-26/basic/transports](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports)  
27. Dual-Transport MCP Servers: STDIO vs. HTTP Explained | by kumaran srinivasan | Medium, доступ отримано квітня 1, 2026, [https://medium.com/@kumaran.isk/dual-transport-mcp-servers-stdio-vs-http-explained-bd8865671e1f](https://medium.com/@kumaran.isk/dual-transport-mcp-servers-stdio-vs-http-explained-bd8865671e1f)  
28. Build an MCP server \- Model Context Protocol, доступ отримано квітня 1, 2026, [https://modelcontextprotocol.io/docs/develop/build-server](https://modelcontextprotocol.io/docs/develop/build-server)  
29. Connect to local MCP servers \- Model Context Protocol, доступ отримано квітня 1, 2026, [https://modelcontextprotocol.io/docs/develop/connect-local-servers](https://modelcontextprotocol.io/docs/develop/connect-local-servers)  
30. iOS SwiftUI Preview & REPL | Claude Code Skill \- MCP Market, доступ отримано квітня 1, 2026, [https://mcpmarket.com/tools/skills/ios-swiftui-preview-repl](https://mcpmarket.com/tools/skills/ios-swiftui-preview-repl)  
31. Feature Request: Add 'claude mcp reload' command to reload MCP servers without restarting \#36643 \- GitHub, доступ отримано квітня 1, 2026, [https://github.com/anthropics/claude-code/issues/36643](https://github.com/anthropics/claude-code/issues/36643)  
32. Feature Request: Add /reload-mcps Command for MCP Server Management · Issue \#2756 · anthropics/claude-code \- GitHub, доступ отримано квітня 1, 2026, [https://github.com/anthropics/claude-code/issues/2756](https://github.com/anthropics/claude-code/issues/2756)  
33. Feature Request: Add /reloadSettings command to reload configuration without restart · Issue \#5513 · anthropics/claude-code \- GitHub, доступ отримано квітня 1, 2026, [https://github.com/anthropics/claude-code/issues/5513](https://github.com/anthropics/claude-code/issues/5513)  
34. Feature Request: Add /restart command to reload MCP servers without losing session · Issue \#17675 · anthropics/claude-code \- GitHub, доступ отримано квітня 1, 2026, [https://github.com/anthropics/claude-code/issues/17675](https://github.com/anthropics/claude-code/issues/17675)  
35. data-goblin/claude-code-mcp-reload \- GitHub, доступ отримано квітня 1, 2026, [https://github.com/data-goblin/claude-code-mcp-reload](https://github.com/data-goblin/claude-code-mcp-reload)  
36. MCP Hot-Reload \- Servers, доступ отримано квітня 1, 2026, [https://mcpservers.org/servers/neilopet/mcp-server-hmr](https://mcpservers.org/servers/neilopet/mcp-server-hmr)  
37. I built an MCP hub that cuts Claude Code's schema tokens by 91% : r/ClaudeCode \- Reddit, доступ отримано квітня 1, 2026, [https://www.reddit.com/r/ClaudeCode/comments/1rrpy1s/i\_built\_an\_mcp\_hub\_that\_cuts\_claude\_codes\_schema/](https://www.reddit.com/r/ClaudeCode/comments/1rrpy1s/i_built_an_mcp_hub_that_cuts_claude_codes_schema/)  
38. Architecture overview \- Model Context Protocol, доступ отримано квітня 1, 2026, [https://modelcontextprotocol.io/docs/learn/architecture](https://modelcontextprotocol.io/docs/learn/architecture)