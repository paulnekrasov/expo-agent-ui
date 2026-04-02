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

The packaging recipe is consistent and well-established: **`"type": "module"` + `"bin"` pointing to a hashbanged `dist/index.js` + `"files": ["dist"]`** is the universal pattern across all official MCP servers. For Claude Code integration, **`.mcp.json` at project root** is the correct shareable config location (not `.claude/mcp.json`), while `~/.claude.json` handles local and user scopes. The most common gotcha is Windows needing `cmd /c npx` instead of bare `npx`. The MCP SDK remains at v1.29.0 for production use with v2 still in pre-alpha. For `swiftui-preview-mcp` specifically, the recommended `.mcp.json` users would commit to their repo is simply `{"mcpServers": {"swiftui-preview": {"type": "stdio", "command": "npx", "args": ["-y", "swiftui-preview-mcp"]}}}`.