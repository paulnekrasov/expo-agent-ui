# Research Layer 7 — MCP Protocol Specification for SwiftUI Preview MCP Server

## Overview

This report collects the authoritative Model Context Protocol (MCP) data types and behaviors needed for Stage 7 (Interaction / tools) of the SwiftUI Preview project, focusing on tool schemas, `tools/call` request/response types, image and error handling, initialization handshake, and distribution patterns for an `npx`-packaged MCP server.
Core normative definitions are taken from the MCP schema reference `schema.ts` for protocol version `2025-06-18`, with usage patterns cross-checked against the official MCP tools specification and the TypeScript SDK server guide.[^1][^2][^3]

## Initialization Handshake (Server Lifecycle Context)

### InitializeRequest and InitializeResult

```typescript
// MCP TYPE: InitializeRequest
// Source: https://modelcontextprotocol.io/specification/2025-06-18/schema
export interface InitializeRequest extends Request {
  method: "initialize";
  params: {
    protocolVersion: string;
    capabilities: ClientCapabilities;
    clientInfo: Implementation;
  };
}

// MCP TYPE: InitializeResult
// Source: https://modelcontextprotocol.io/specification/2025-06-18/schema
export interface InitializeResult extends Result {
  protocolVersion: string;
  capabilities: ServerCapabilities;
  serverInfo: Implementation;
  instructions?: string;
}

// Usage note: InitializeRequest is the very first JSON-RPC request from client to server, used to negotiate protocol version and capabilities; InitializeResult is the matching response.
```

The MCP schema defines `InitializeRequest` with `method: "initialize"` and parameters containing the client’s supported protocol version, capabilities, and implementation info. The server must respond with `InitializeResult`, indicating the protocol version it will use, its capabilities, and server metadata.[^4][^5][^1]

### InitializedNotification

```typescript
// MCP TYPE: InitializedNotification
// Source: https://modelcontextprotocol.io/specification/2025-06-18/schema
export interface InitializedNotification extends Notification {
  method: "notifications/initialized";
}

// Usage note: Sent by the client after a successful initialize/InitializeResult exchange to signal that it is ready for normal operation.
```

The lifecycle spec states that initialization must be the first interaction, with the client sending `initialize`, the server responding, and then the client sending a `notifications/initialized` notification before normal requests like `tools/list` or `tools/call` proceed. During this phase, both sides should avoid other feature requests except pings and, for the server, optional logging.[^6][^5][^7]

### JSON-RPC Envelope Types (for context)

```typescript
// MCP TYPE: JSONRPCRequest
// Source: https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/schema/2025-06-18/schema.ts
export interface JSONRPCRequest extends Request {
  jsonrpc: typeof JSONRPC_VERSION; // "2.0"
  id: RequestId;                   // string | number
}

// MCP TYPE: JSONRPCResponse
// Source: same as above
export interface JSONRPCResponse {
  jsonrpc: typeof JSONRPC_VERSION; // "2.0"
  id: RequestId;
  result: Result;
}

// MCP TYPE: JSONRPCError
// Source: same as above
export interface JSONRPCError {
  jsonrpc: typeof JSONRPC_VERSION; // "2.0"
  id: RequestId;
  error: {
    code: number;
    message: string;
    data?: unknown;
  };
}

// Usage note: All MCP messages, including tools/list and tools/call, are carried inside these JSON-RPC envelopes on the chosen transport (stdio or HTTP/SSE).
```

The MCP schema reuses JSON-RPC 2.0 envelopes (`jsonrpc: "2.0"`, `id`, `result` or `error`) for all request/response pairs, including tool calls, while notifications omit `id` and do not expect responses.[^5][^1]

## Tool Definition Schema (Tool, inputSchema, outputSchema)

### Tool Interface and ToolAnnotations

```typescript
// MCP TYPE: ToolAnnotations
// Source: https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/schema/2025-06-18/schema.ts
export interface ToolAnnotations {
  title?: string;
  readOnlyHint?: boolean;
  destructiveHint?: boolean;
  idempotentHint?: boolean;
  openWorldHint?: boolean;
}

// MCP TYPE: Tool
// Source: same as above
export interface Tool extends BaseMetadata {
  description?: string;
  inputSchema: {
    type: "object";
    properties?: { [key: string]: object };
    required?: string[];
  };
  outputSchema?: {
    type: "object";
    properties?: { [key: string]: object };
    required?: string[];
  };
  annotations?: ToolAnnotations;
  _meta?: { [key: string]: unknown };
}

// Usage note: Tool definitions are returned in tools/list; inputSchema and outputSchema are restricted JSON Schema fragments describing arguments and structured results, while annotations provide behavioral hints.
```

The MCP tools spec describes a Tool as a definition with `name`, optional `title`, `description`, `inputSchema`, optional `outputSchema`, and optional `annotations` that act as hints rather than hard guarantees. The schema file formalizes `inputSchema` and `outputSchema` as top-level JSON Schema objects with `type: "object"`, optional `properties` maps, and `required` string arrays, which is the contract a client uses to infer parameter types and structured result shapes.[^2][^8][^9][^1]

The `ToolAnnotations` interface allows servers to hint about mutability (`readOnlyHint`, `destructiveHint`), idempotence, and whether the tool interacts with an open world, enabling clients to drive UI and safety decisions while treating these flags as advisory.[^1][^2]

## Tool Listing (ListTools)

### ListToolsRequest and ListToolsResult

```typescript
// MCP TYPE: ListToolsRequest
// Source: https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/schema/2025-06-18/schema.ts
export interface ListToolsRequest extends PaginatedRequest {
  method: "tools/list";
}

// MCP TYPE: ListToolsResult
// Source: same as above
export interface ListToolsResult extends PaginatedResult {
  tools: Tool[];
}

// Usage note: Client issues tools/list after initialization (and on ToolListChangedNotification) to discover available tools, handling pagination via cursor/nextCursor fields from PaginatedRequest/PaginatedResult.
```

The tools spec shows discovery flows where the client sends `tools/list`, receives a list of Tool objects, and may repeat the request if `nextCursor` indicates more pages. The `PaginatedRequest` and `PaginatedResult` base types add an optional `cursor` to requests and an optional `nextCursor` to results, which the SwiftUI Preview host can ignore for small tool sets but must handle generically.[^9][^2][^1]

### ToolListChangedNotification

```typescript
// MCP TYPE: ToolListChangedNotification
// Source: https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/schema/2025-06-18/schema.ts
export interface ToolListChangedNotification extends Notification {
  method: "notifications/tools/list_changed";
}

// Usage note: Emitted by the server whenever its tool catalog changes; clients should respond by re-issuing tools/list to refresh cached Tool definitions.
```

The spec explicitly defines a `notifications/tools/list_changed` notification for servers to signal dynamic changes to their tool list, with clients expected to call `tools/list` again to retrieve the updated definitions.[^10][^1]

## Calling Tools (CallToolRequest / CallToolResult)

### CallToolRequest

```typescript
// MCP TYPE: CallToolRequest
// Source: https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/schema/2025-06-18/schema.ts
export interface CallToolRequest extends Request {
  method: "tools/call";
  params: {
    name: string;
    arguments?: { [key: string]: unknown };
  };
}

// Usage note: Sent by the client to invoke a specific tool by name, passing arguments that must conform to the tool's inputSchema.
```

The tools spec shows `tools/call` requests as standard JSON-RPC requests with `method: "tools/call"`, an `id`, and `params` containing the tool `name` and optional `arguments` object that the server validates against the Tool’s input schema. Protocol-level errors use JSON-RPC error responses when the method is unknown, the request fails the CallToolRequest schema, or the server does not support tools at all.[^11][^2][^1]

### CallToolResult

```typescript
// MCP TYPE: CallToolResult
// Source: https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/schema/2025-06-18/schema.ts
export interface CallToolResult extends Result {
  content: ContentBlock[];
  structuredContent?: { [key: string]: unknown };
  isError?: boolean;
}

// Usage note: Returned in JSON-RPC result for tools/call; content carries human-readable or media output, structuredContent carries machine-parseable JSON matching outputSchema, and isError indicates tool-level failure visible to the model.
```

The schema defines `CallToolResult` as a `Result` with `content` (array of `ContentBlock`), optional `structuredContent` JSON object matching any declared `outputSchema`, and optional `isError` flag that defaults to false if omitted. The tools spec emphasizes that domain errors from the tool—such as invalid inputs or downstream API failures—must be surfaced via `CallToolResult` with `isError: true`, not via JSON-RPC error responses, so the model can inspect and recover from them.[^2][^11][^1]

### ContentBlock and Media Types

```typescript
// MCP TYPE: ContentBlock
// Source: https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/schema/2025-06-18/schema.ts
export type ContentBlock =
  | TextContent
  | ImageContent
  | AudioContent
  | ResourceLink
  | EmbeddedResource;

// MCP TYPE: TextContent
// Source: same as above
export interface TextContent {
  type: "text";
  text: string;
  annotations?: Annotations;
  _meta?: { [key: string]: unknown };
}

// MCP TYPE: ImageContent
// Source: same as above
export interface ImageContent {
  type: "image";
  data: string;     // base64-encoded
  mimeType: string; // e.g., "image/png"
  annotations?: Annotations;
  _meta?: { [key: string]: unknown };
}

// MCP TYPE: AudioContent
// Source: same as above
export interface AudioContent {
  type: "audio";
  data: string;     // base64-encoded
  mimeType: string; // e.g., "audio/mpeg"
  annotations?: Annotations;
  _meta?: { [key: string]: unknown };
}

// MCP TYPE: ResourceLink
// Source: same as above
export interface ResourceLink extends Resource {
  type: "resource_link";
}

// MCP TYPE: EmbeddedResource
// Source: same as above
export interface EmbeddedResource {
  type: "resource";
  resource: TextResourceContents | BlobResourceContents;
  annotations?: Annotations;
  _meta?: { [key: string]: unknown };
}

// Usage note: Tool results can return plain text, base64-encoded images or audio, or references/embeddings of resources; all are wrapped in ContentBlock variants.
```

`ImageContent` and `AudioContent` both use a `data` field that is base64-encoded (`@format byte` in the schema) and a `mimeType` string that must describe the actual media type, such as `image/png` for PNG images. The TypeScript SDK server guide demonstrates returning arrays of `TextContent` in `CallToolResult` and explicitly documents `ResourceLink` outputs for large artifacts, which the client then retrieves via separate resource requests. For embedded binary resources, `BlobResourceContents` uses a base64-encoded `blob` field and `mimeType`, matching the pattern of `ImageContent` and `AudioContent` for binary transfers.[^3][^1]

### Base64-Encoded PNG from a Tool

For tools returning PNG previews from the SwiftUI Preview MCP server, the normative pattern is to use `ImageContent` items inside `CallToolResult.content` with `mimeType: "image/png"` and `data` containing the base64-encoded PNG bytes.[^3][^1]
Alternative designs that embed PNGs as `BlobResourceContents` (inside an `EmbeddedResource` content block) are also spec-compliant, but they introduce an extra level of indirection that is unnecessary if the image is already in-memory.[^1][^2]

## Error Handling Semantics

### Tool-Level vs Protocol-Level Errors

```typescript
// MCP TYPE: JSONRPCError (protocol-level)
// Source: https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/schema/2025-06-18/schema.ts
export interface JSONRPCError {
  jsonrpc: typeof JSONRPC_VERSION;
  id: RequestId;
  error: {
    code: number;
    message: string;
    data?: unknown;
  };
}

// MCP TYPE: CallToolResult.isError (tool-level)
// Source: same as above
export interface CallToolResult extends Result {
  content: ContentBlock[];
  structuredContent?: { [key: string]: unknown };
  isError?: boolean;
}

// Usage note: JSONRPCError indicates transport/protocol failures (unknown method, invalid params, server internal error), while CallToolResult.isError reports domain errors from the tool itself.
```

The tools spec and schema highlight two error channels: JSON-RPC error responses for protocol violations (unknown tools, malformed requests that fail schema validation, or unsupported tool capabilities) and `CallToolResult` with `isError: true` for semantic or operational errors inside a valid tool invocation. The spec explicitly notes that tool-originated errors should not be reported as MCP-level errors because this would hide them from the language model and prevent self-correction.[^11][^2][^1]

For the SwiftUI Preview server, this means shape or schema mismatches in the `tools/call` envelope should trigger JSON-RPC errors (e.g., `INVALID_PARAMS`), while issues like failed Swift static analysis, missing assets, or layout engine exceptions should be expressed inside `CallToolResult.content` with explanatory text and `isError: true`.

## MCP Server Initialization Handshake in Practice

### Lifecycle Summary

Authoritative lifecycle documentation describes three phases for MCP connections: initialization (negotiate protocol version and capabilities), discovery (list tools, resources, prompts), and operation (normal bidirectional messaging). Initialization must always come first, with an `initialize` request and response, followed by a `notifications/initialized` notification from the client; only then should `tools/list`, `resources/list`, or `prompts/list` be issued.[^12][^4][^5]

After initialization, the client typically sends `tools/list` to discover available tools, reads the `Tool` definitions and schema objects, and then issues `tools/call` requests as required, handling `CallToolResult` responses and any out-of-band notifications like logging or tool list changes.[^6][^2]

### Transports (stdio vs HTTP/SSE)

The TypeScript SDK server guide describes two primary transports: stdio (for local process-spawned servers like CLI tools or desktop integrations) and a Streamable HTTP transport for remote servers providing HTTP POST and optional SSE notifications. In both cases, the MCP handshake and all tools/list and tools/call messages are carried within JSON-RPC 2.0 envelopes as defined in the schema, and the SDK’s `McpServer` abstracts transport details away from handler code.[^5][^3]

For a SwiftUI Preview MCP server meant to be run via `npx` in local dev tools, stdio is the expected transport, matching how existing MCP servers are launched by hosts like Claude Code and editors integrating MCP.[^13][^3]

## Packaging and Distribution via `npx`

### Existing MCP Server Patterns

Multiple published MCP servers are distributed as npm packages and invoked via `npx`, using configuration entries like:

```json
"mcpServers": {
  "swift-patterns": {
    "command": "npx",
    "args": ["-y", "swift-patterns-mcp@latest"]
  }
}
```

and

```json
"mcpServers": {
  "apple-docs": {
    "command": "npx",
    "args": ["-y", "@kimsungwhee/apple-docs-mcp"]
  }
}
```

in host configuration files such as `.cursor/mcp.json`, `.mcp.json`, or `.vscode/mcp.json`. These patterns run the MCP server as a child process via `npx`, using `-y` to auto-confirm package installation and pinning by name (and optionally version) to the published npm artifact.[^14][^15][^13]

### Status of `swiftui-preview-mcp`

A search across MCP server registries and public packages shows existing SwiftUI- and iOS-related MCP servers (for example, an iOS preview MCP server and Swift patterns MCP server), but no authoritative reference to a published package named `swiftui-preview-mcp` or an `npx swiftui-preview-mcp` command. As of the latest search, there is no confirmed npm package or documentation under that exact name, so the concrete distribution details for a `swiftui-preview-mcp` package remain unspecified.[^16][^17][^13]

Given other MCP servers’ usage, the expected pattern would mirror the examples above—a host configuration using `"command": "npx"` and `"args": ["-y", "swiftui-preview-mcp@latest"]` or similar—but this must be treated as a design intention rather than a documented, deployed artifact until such a package exists in a public registry.[^13][^14]

## Summary of Normative Contracts for Stage 7

- Tool discovery uses `tools/list` with `ListToolsRequest` / `ListToolsResult` and `Tool` definitions, which embed JSON Schema-based `inputSchema` and optional `outputSchema` constrained to `type: "object"` with `properties` and `required` fields.[^2][^1]
- Tool invocation uses `tools/call` with `CallToolRequest` (name plus arguments) and returns `CallToolResult` (content blocks, optional structuredContent, optional isError), all within JSON-RPC 2.0 envelopes.[^11][^1]
- Media and large artifacts from tools are carried via `ContentBlock` variants: base64-encoded PNG previews use `ImageContent` with `mimeType: "image/png"`, while large files can be referenced via `ResourceLink` or embedded via `EmbeddedResource` using `TextResourceContents` or `BlobResourceContents`.[^3][^1]
- Errors are split between protocol-level `JSONRPCError` (for invalid or unsupported requests) and tool-level `CallToolResult.isError` plus explanatory content (for semantic failures), with the spec instructing servers to favor the latter for tool behavior issues so the model can see and react to them.[^2][^11]
- The server lifecycle requires an initialization handshake—`InitializeRequest`, `InitializeResult`, and a subsequent `InitializedNotification`—before discovery (`tools/list`) and operation (`tools/call`), and this handshake is independent of the underlying transport (stdio or HTTP/SSE).[^5][^1]
- Existing MCP servers distributed via `npx` demonstrate a consistent configuration pattern, but there is currently no authoritative, deployed package documented under the exact name `swiftui-preview-mcp`, so any such packaging details must be considered to-be-defined rather than established fact.[^14][^13]

---

## References

1. [modelcontextprotocol/schema/2025-06-18/schema.ts at main · modelcontextprotocol/modelcontextprotocol](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/schema/2025-06-18/schema.ts) - Specification and documentation for the Model Context Protocol - modelcontextprotocol/modelcontextpr...

2. [Tools - Model Context Protocol](https://modelcontextprotocol.io/specification/2025-06-18/server/tools)

3. [typescript-sdk/docs/server.md at main - GitHub](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/server.md) - The official TypeScript SDK for Model Context Protocol servers and clients - modelcontextprotocol/ty...

4. [Schema Reference - Model Context Protocol](https://modelcontextprotocol.io/specification/2025-06-18/schema) - InitializeRequest. interface InitializeRequest { method: “initialize ... notifications/initialized. ...

5. [Lifecycle - Model Context Protocol](https://modelcontextprotocol.io/specification/2025-03-26/basic/lifecycle)

6. [Understanding the Model Context Protocol (MCP): Architecture](https://nebius.com/blog/posts/understanding-model-context-protocol-mcp-architecture) - As LLM-powered agents become more complex, integrating them with tools, APIs, and private data sourc...

7. [stdio](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle)

8. [Model Context Protocol (MCP) - AI SDK](https://ai-sdk.dev/docs/ai-sdk-core/mcp-tools)

9. [Tools - Model Context Protocol （MCP）](https://modelcontextprotocol.info/specification/draft/server/tools/) - Protocol Revision: draft The Model Context Protocol (MCP) allows servers to expose tools that can be...

10. [Model Context Protocol (MCP) explained: A practical ... - CodiLime](https://codilime.com/blog/model-context-protocol-explained/) - Learn how MCP solves the NxM integration problem and standardizes tool discovery/calls for LLM apps,...

11. [Tools](https://modelcontextprotocol.io/specification/2025-11-25/server/tools) - Calling Tools. To invoke a tool, clients send a tools/call request: Request: Copy. { "jsonrpc": "2.0...

12. [Model Context Protocol (MCP) an overview - Philschmid](https://www.philschmid.de/mcp-introduction) - Overview of the Model Context Protocol (MCP) how it works, what are MCP servers and clients, and how...

13. [swift-patterns-mcp - LobeHub](https://lobehub.com/zh/mcp/efremidze-swift-patterns-mcp)

14. [Apple Developer Documentation Model Context Protocol Server - MCP Solutions](https://mcpsolutions.dev/server/apple-developer-documentation-model-context-protocol-server) - Apple Developer Documentation MCP Server - Access Apple's official developer docs, frameworks, APIs,...

15. [Apple Developer Documentation Model Context Protocol Server](https://mcpsolutions.dev/server/apple-developer-documentation-model-context-protocol-server/) - Apple Developer Documentation MCP Server - Access Apple's official developer docs, frameworks, APIs,...

16. [iOS 預覽MCP 伺服器](https://lobehub.com/zh-TW/mcp/noahzs-ios-preview-mcp) - 由 AI 驅動的 iOS UI 開發工具，讓 Claude Code 能夠建立 SwiftUI 介面並捕捉截圖以進行迭代審查。需要安裝 uv 的 FastMCP Python 套件。伺服器腳本路徑在 ...

17. [iOS Development & Preview REPL | Claude Code Skill - MCP Market](https://mcpmarket.com/tools/skills/ios-development-preview-repl)