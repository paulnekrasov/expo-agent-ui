# Serve-Sim Adapter Reference

## Overview

serve-sim (`https://github.com/EvanBacon/serve-sim`) is an open-source (Apache-2.0) tool by Evan
Bacon that turns any booted Apple Simulator into a browser-accessible interactive preview. It
captures the simulator framebuffer via `xcrun simctl io`, exposes a 60fps MJPEG video stream and a
WebSocket control channel, and serves a React-based preview UI.

Agent UI integrates with serve-sim as a **read-only, optional discovery layer**. The MCP server
can detect running serve-sim helpers and expose their endpoints as a resource. No runtime dependency
on serve-sim is added; no code from serve-sim is vendored or proxied.

## When To Use This Reference

- When an agent needs to understand what serve-sim is and how Agent UI relates to it.
- When implementing or extending the `agent-ui://serve-sim/sessions` MCP resource.
- When writing agent skill guidance that involves visual simulator preview alongside semantic tools.
- When evaluating future integration ideas (overlay, frame capture, combined middleware).

Do **not** use this reference for:
- Core semantic runtime or bridge work (use `mcp-transport-architecture.md`).
- Maestro flow export (use `maestro-semantic-flow-adapter.md`).
- EAS/native preview comparison (use `eas-native-preview.md`).

## Architecture: Complementary Roles

```
serve-sim (visual layer)        Agent UI (semantic layer)
─────────────────────           ─────────────────────────
MJPEG video stream              Semantic tree (JSON)
Pixel coordinates               Stable semantic IDs
Touch via WebSocket              Structured tap/input/scroll via MCP
Raw simctl log SSE               Typed semantic events
Shell execution (/exec)          No shell execution (by design)
Frame capture                    State snapshots
No app understanding             Deep app understanding
```

These layers are **additive, not overlapping**. serve-sim gives agents visual feedback; Agent UI
gives agents structured control. Neither replaces the other.

## How serve-sim Works

### Components

| Component | Role |
|---|---|
| `serve-sim-bin` (Swift) | Captures simulator framebuffer via `simctl io`, serves MJPEG stream and WebSocket control channel. One per device. |
| CLI (`npx serve-sim`) | Starts/manages Swift helpers, spawns preview server, supports `--detach`, `--list`, `--kill`. |
| Middleware (`serve-sim/middleware`) | Connect-style middleware mountable in Metro/Vite/Express. Reads helper state, serves preview HTML, exposes `/api`, `/logs` (SSE), `/appstate` (SSE), `/exec` (POST). |
| Preview client (`serve-sim-client`) | Preact/React browser UI rendering MJPEG stream with keyboard/mouse/gesture forwarding. |

### State Discovery

serve-sim writes one JSON state file per device helper to `$TMPDIR/serve-sim/server-<udid>.json`:

```json
{
  "pid": 12345,
  "port": 3100,
  "device": "AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE",
  "url": "http://localhost:3100",
  "streamUrl": "http://localhost:3100/stream",
  "wsUrl": "ws://localhost:3100/ws"
}
```

Agent UI reads these state files to discover sessions. This mirrors serve-sim's own middleware
logic (`readServeSimStates()`) but keeps it strictly read-only: no PID signals, no state file
deletion, no `/exec` proxying.

### Expo Integration Path

```js
// metro.config.js
const { simMiddleware } = require("serve-sim/middleware");
config.server.enhanceMiddleware = (metro) => {
  const app = connect();
  app.use(simMiddleware({ basePath: "/.sim" }));
  app.use(metro);
  return app;
};
```

This mounts the simulator preview at `http://localhost:8081/.sim`.

## Current Agent UI Integration

### MCP Resource: `agent-ui://serve-sim/sessions`

A read-only MCP resource that discovers running serve-sim sessions and returns their endpoints.

**Resource listing entry:**

```json
{
  "uri": "agent-ui://serve-sim/sessions",
  "name": "Serve-Sim Sessions",
  "description": "Discovered serve-sim iOS Simulator preview sessions...",
  "mimeType": "application/json"
}
```

**Response shape:**

```json
{
  "ok": true,
  "platformSupported": true,
  "stateDirectoryExists": true,
  "sessionCount": 1,
  "sessions": [
    {
      "device": "AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE",
      "port": 3100,
      "streamUrl": "http://localhost:3100/stream",
      "wsUrl": "ws://localhost:3100/ws",
      "url": "http://localhost:3100"
    }
  ]
}
```

**Behavior by platform:**

| Platform | `platformSupported` | `stateDirectoryExists` | `sessions` |
|---|---|---|---|
| macOS, serve-sim running | `true` | `true` | Populated |
| macOS, serve-sim not running | `true` | `false` | `[]` |
| Windows / Linux | `false` | `false` | `[]` |

The resource is always available in `resources/list`. No app session is required to read it.

### Implementation Location

| File | Purpose |
|---|---|
| `packages/mcp-server/src/serve-sim-discovery.ts` | State file reader and PID validation |
| `packages/mcp-server/src/cli.ts` | Resource registration and handler |
| `packages/mcp-server/src/index.ts` | Public type exports |

## Agent Workflow: Semantic-First With Visual Verification

When an agent has both Agent UI MCP and serve-sim available, the recommended workflow is:

### Phase 1 — Semantic Actions (Primary)

Use Agent UI MCP tools for all interactions:

1. `inspectTree` to understand the current screen structure.
2. `tap`, `input`, `scroll`, `navigate` by stable semantic IDs.
3. `getState` to verify state changes after actions.
4. `waitFor` to wait for conditions before proceeding.

### Phase 2 — Visual Verification (Secondary)

Use serve-sim visual preview only when needed:

1. Read `agent-ui://serve-sim/sessions` to discover available preview sessions.
2. Open the `streamUrl` or `url` to visually inspect the simulator.
3. Use visual evidence to debug layout, styling, animation, or clipping issues.
4. Never fall back to coordinate-based interaction when semantic IDs are available.

### Decision Gate

```
Can the task be completed with semantic IDs alone?
├── YES → Use only Agent UI MCP tools. No serve-sim needed.
└── NO (visual verification needed) →
    ├── Is serve-sim available? (check resource)
    │   ├── YES → Use visual preview for verification only.
    │   └── NO → Document visual verification as deferred.
    └── Never use serve-sim as the primary control channel.
```

## Security Constraints

### Hard Rules

- **Never proxy `/exec` through MCP.** serve-sim's middleware has an open shell-execution endpoint
  (`POST /.sim/exec`) that accepts arbitrary commands. Agent UI must never expose this through its
  MCP tools. This is a non-negotiable safety boundary.
- **Never forward or amplify CORS.** serve-sim uses `Access-Control-Allow-Origin: *` on its Swift
  helper. Agent UI does not relay or depend on this.
- **PID is diagnostic only.** The discovery module reads PIDs to validate helper liveness. PIDs are
  included in the response for diagnostics but must never be used for process control through MCP.
- **No sensitive data in visual streams.** The MJPEG stream may contain PII visible on screen.
  Agent UI does not capture, store, or transmit these frames. Any future frame capture for flow
  evidence must apply redaction rules from `security-privacy.md`.

### Verification Checklist

Before claiming serve-sim integration is working:

- [ ] `agent-ui://serve-sim/sessions` returns `{ ok: true }` on all platforms.
- [ ] On non-macOS, `platformSupported` is `false` and `sessions` is `[]`.
- [ ] No serve-sim dependency appears in any `package.json` in the workspace.
- [ ] No `/exec` proxy exists anywhere in Agent UI code.
- [ ] Tests pass on Windows (where serve-sim cannot run).

## Platform Constraints

| Constraint | Detail |
|---|---|
| **macOS only** | serve-sim requires `xcrun simctl`, available only on macOS with Xcode. |
| **iOS only** | Apple Simulator only. No Android Emulator support. |
| **Dev-only** | serve-sim is a development tool. Never expose in production builds. |
| **No app instrumentation** | serve-sim captures the simulator framebuffer externally. It works with any app. |
| **State file format** | `$TMPDIR/serve-sim/server-*.json` is not a documented API. Fail gracefully on unknown shapes. |

### Android Story

serve-sim is iOS-only by design. For Android:

- `adb shell screenrecord` and `scrcpy` provide frame capture.
- `adb shell input` provides touch/gesture input.
- No equivalent to serve-sim's integrated WebSocket control channel exists today.
- A future `serve-emu` (Android) adapter could share the same MCP resource shape.

## Future Integration Ideas (Not Implemented)

These ideas are documented for future stages. None are implemented yet.

| Idea | Stage | Description |
|---|---|---|
| Combined Metro middleware | 9 | Mount serve-sim preview and Agent UI bridge discovery on the same dev server. |
| MJPEG frame capture for flow evidence | 9 | Grab frames from the MJPEG stream during semantic flow execution as visual evidence. |
| Semantic overlay on preview | 9+ | Render semantic bounding boxes, IDs, and roles over the video stream. Requires `bounds` in semantic tree. |
| Agent skill guidance | 8 | Add serve-sim usage instructions to `skills/expo-agent-ui/SKILL.md`. |

## Anti-Patterns

| Anti-Pattern | Why It Fails | Correct Pattern |
|---|---|---|
| Using serve-sim coordinates for element targeting | Fragile, breaks on layout changes, cannot verify state | Use semantic IDs via `tap({ id: "..." })` |
| Proxying `/exec` through MCP | Exposes arbitrary shell execution to agents | Keep shell execution entirely outside Agent UI |
| Making serve-sim a required dependency | Breaks non-macOS developers, violates optionality rule | Runtime detection via state files only |
| Using visual stream as primary control model | Screenshots are evidence, not control | Semantic-first, visual for verification only |
| Forking or vendoring serve-sim | Creates maintenance burden, version drift | Use as external optional tool |
| Capturing frames without redaction | May contain PII visible on screen | Apply redaction rules before any storage |

## Source Index

| Source | URL | Access Date |
|---|---|---|
| serve-sim repository | https://github.com/EvanBacon/serve-sim | 2026-05-02 |
| serve-sim middleware source | `packages/serve-sim/src/middleware.ts` in the above repo | 2026-05-02 |
| serve-sim package.json | `packages/serve-sim/package.json` in the above repo | 2026-05-02 |
| Agent UI security-privacy reference | `docs/reference/agent/security-privacy.md` | 2026-05-02 |
| Agent UI MCP transport architecture | `docs/reference/agent/mcp-transport-architecture.md` | 2026-05-02 |
| Context prompt engineering patterns | `docs/reference/agent/platform-skills/context-prompt-engineering/references/` | 2026-05-02 |
