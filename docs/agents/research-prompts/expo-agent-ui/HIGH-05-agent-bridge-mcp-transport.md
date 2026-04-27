# Research Prompt: Agent Bridge, MCP, Runtime Transport

Copy and paste this whole prompt into a fresh research agent.

```text
Role / context:
You are a staff agent-tooling and protocol engineer. You are researching how Expo Agent UI
should connect a running Expo app to local agent tools and an MCP server without making
screenshots or coordinates the primary interface.

Current date: 2026-04-26.

Repository context:
- Read `docs/agents/EXPO_AGENT_SKILL_REBUILD_PLAN.md` first.
- The product needs structured tools such as `inspectTree`, `getState`, `tap`, `input`,
  `scroll`, `navigate`, `runFlow`, and `observeEvents`.
- The tool layer should be local and free for the semantic-control path.
- It should interoperate with Expo MCP, not duplicate or replace Expo's own MCP server.

Task:
Research the current agent bridge and MCP architecture options.
This prompt combines these high-priority knowledge gaps:
1. Current Expo MCP local capability model and how to avoid duplicating it badly.
2. MCP TypeScript SDK current API and packaging shape.
3. Best local transport from app runtime to agent server: WebSocket, Metro middleware,
   devtools hook, custom Expo module, or another proven option.

Primary questions to answer:
1. What does Expo MCP currently provide?
   Cover local development, EAS integration, paid plan requirements, iOS simulator
   constraints, Android support, screenshots, app control, and project tooling.
2. Which Expo MCP capabilities should Agent UI reuse or interoperate with?
3. Which capabilities are unique to Agent UI because they rely on semantic tree control?
4. What does the current MCP specification require for:
   - tools
   - resources
   - prompts
   - stdio transport
   - JSON-RPC messages
   - structured outputs
   - errors
5. What is the current `@modelcontextprotocol/sdk` TypeScript server API?
   Include server creation, tool registration, schema validation, stdio transport,
   package entry points, and npx usage.
6. What package shape should `packages/mcp-server` use?
   Include CLI binary, ESM/CJS considerations, TypeScript build output, and package exports.
7. What transport should connect the running app to the local server?
   Evaluate:
   - WebSocket from app to local server
   - HTTP polling
   - Server-Sent Events
   - Metro middleware
   - React Native DevTools hook
   - Expo module / native bridge
   - simulator automation
8. How can tools dispatch actions to mounted semantic nodes reliably?
9. How should the system handle multiple devices, multiple app sessions, reconnects,
   hot reload, and stale semantic node IDs?
10. What is the minimum viable bridge for v0?

Source policy:
- Use official Expo MCP docs first.
- Use MCP official spec and TypeScript SDK docs/source first for protocol claims.
- Use Expo, React Native, Metro, and DevTools docs for transport claims.
- Use third-party examples only as secondary evidence.
- Cite every claim with URL and access date.

Hard constraints:
- Do not build a paid-service dependency into the semantic-control path.
- Do not make screenshots or coordinates the primary interface.
- Do not expose unimplemented tools as stable.
- Do not require a custom native module for v0 unless research proves it is necessary.
- Do not write production implementation code.

Required output:
Write a Markdown research report intended to become:
`docs/reference/agent/mcp-transport-architecture.md`

Use exactly this structure:

# Agent Bridge, MCP, And Runtime Transport Research

## Executive Summary
- 5-10 bullets with direct architecture decisions.

## Expo MCP Capability Map
Table columns:
- Capability
- Expo MCP support
- Requirements / limitations
- Should Agent UI interoperate?
- Should Agent UI implement separately?
- Source URL

## MCP TypeScript SDK Findings
Cover:
- package name
- server setup
- tool registration
- schema validation
- stdio transport
- resources
- prompts
- error handling
- npx packaging
- source URL

## Proposed Agent UI Tool Surface
For each tool:
- name
- input schema
- output schema
- required runtime support
- failure modes
- whether v0 or later

Tools to cover:
- `inspectTree`
- `getState`
- `tap`
- `input`
- `scroll`
- `navigate`
- `runFlow`
- `observeEvents`
- `waitFor`

## Transport Options Matrix
Table columns:
- Transport option
- How it works
- Managed workflow compatibility
- Bare workflow compatibility
- iOS support
- Android support
- Web support
- Reliability
- Security risk
- Implementation complexity
- Recommendation

## Session And Device Model
Explain:
- how the server discovers app sessions
- how it identifies devices/simulators
- how reconnect works
- how hot reload affects state
- how stale IDs are handled
- how multiple app sessions are handled

## V0 Architecture Recommendation
Give a concrete bridge design for the first implementation stage.

## Open Questions And Blockers
List unresolved items as checkboxes.

## Source Index
For every source, include title, URL, access date, and supported claim.

## Final Recommendation
Give the concrete Stage 4 and Stage 5 implementation recommendation.

Final status token:
End with exactly one of:
DONE
DONE_WITH_CONCERNS
NEEDS_CONTEXT
BLOCKED
```

