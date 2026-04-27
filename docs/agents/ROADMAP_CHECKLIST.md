# Roadmap Checklist - Expo Agent UI

This is the distilled execution roadmap for the Expo Agent UI rebuild.

Use this file to choose the next bounded task. Do not use it as a research dump.

## Phase 0 - Repo Reset

Product Stage: Stage 0 - Repo Reset
Status: Complete

- [x] Add durable rebuild proposal: `docs/agents/EXPO_AGENT_SKILL_REBUILD_PLAN.md`
- [x] Create research prompt library under `docs/agents/research-prompts/expo-agent-ui/`
- [x] Capture research outputs under `docs/reference/**`
- [x] Rewrite `AGENTS.md` for Expo Agent UI
- [x] Create `docs/PROJECT_BRIEF.md`
- [x] Replace `docs/CLAUDE.md` with a compatibility shim
- [x] Replace `docs/reference/INDEX.md` with Expo Agent UI router
- [x] Rewrite `docs/agents/ORCHESTRATION.md` around product stages
- [x] Reset live state files away from old Stage 3 resolver task
- [x] Decide whether old parser assets are archived or deleted
- [x] Create and execute a dedicated cleanup/archive task for retired assets
- [x] Compress reusable design DNA into new Expo Agent UI reference docs
- [x] Remove old parser, resolver, VS Code extension, WASM, Canvas renderer, and old prompt assets

## Phase 1 - Package Foundation

Product Stage: Stage 1 - Package Foundation
Status: Complete

- [x] Convert root package metadata toward npm workspaces
- [x] Add `packages/core` package shell
- [x] Add `packages/expo-plugin` package shell
- [x] Add `packages/mcp-server` package shell
- [x] Add `packages/cli` package shell
- [x] Add `packages/example-app` shell
- [x] Add shared TypeScript config for workspace packages
- [x] Add package-level build/typecheck/test scripts
- [x] Verify exact peer dependency ranges from current Expo SDK 55 package metadata
- [x] Keep core runtime JS-only and avoid native modules

## Phase 2 - Component Primitives

Product Stage: Stage 2 - Component Primitives
Status: Next

- [ ] Implement `AgentUIProvider`
- [ ] Implement `Screen`
- [ ] Implement `VStack`, `HStack`, `ZStack`, `Spacer`
- [ ] Implement `Text`, `Image`, `Icon`, `Label`
- [ ] Implement `Button`, `TextField`, `SecureField`
- [ ] Implement `Scroll`, `List`, `Section`, `Form`
- [ ] Add accessibility prop mapping
- [ ] Add stable semantic ID validation warnings
- [ ] Add first example settings screen

## Phase 3 - Semantic Runtime

Product Stage: Stage 3 - Semantic Runtime
Status: Not started

- [ ] Define `SemanticNode` schema
- [ ] Implement registry mount/unmount
- [ ] Implement parent-child tree snapshots
- [ ] Implement duplicate ID warnings
- [ ] Implement node lookup by ID
- [ ] Implement action metadata
- [ ] Implement privacy/redaction metadata
- [ ] Add semantic registry tests

## Phase 4 - Agent Tool Bridge

Product Stage: Stage 4 - Agent Tool Bridge
Status: Not started

- [ ] Define bridge protocol
- [ ] Implement development-only runtime gate
- [ ] Implement loopback-first WebSocket bridge
- [ ] Implement pairing token flow
- [ ] Implement sessions and heartbeat
- [ ] Implement `inspectTree`, `getState`, `tap`, `input`, `waitFor`, `observeEvents`
- [ ] Add structured error codes
- [ ] Add security/redaction tests

## Phase 5 - MCP Server

Product Stage: Stage 5 - MCP Server
Status: Not started

- [ ] Add stdio MCP server package
- [ ] Pin MCP SDK v1.x unless re-verified otherwise
- [ ] Register only implemented tools
- [ ] Add read-only resources for sessions, tree, screens, flows, diagnostics
- [ ] Keep stdout protocol-clean
- [ ] Add MCP schema tests

## Phase 6 - Motion Layer

Product Stage: Stage 6 - Motion Layer
Status: Not started

- [ ] Add Reanimated preset mapping
- [ ] Add reduced motion policy
- [ ] Add layout transition helpers
- [ ] Add gesture helper strategy
- [ ] Add motion tests

## Phase 7 - Expo UI Adapter

Product Stage: Stage 7 - Expo UI Adapter
Status: Not started

- [ ] Add optional `@expo/ui/swift-ui` adapter path
- [ ] Wrap `Host` behavior safely
- [ ] Add fallback behavior for unsupported platforms
- [ ] Keep `@expo/ui` optional peer
- [ ] Add adapter tests

## Phase 8 - Agent Skill

Product Stage: Stage 8 - Agent Skill
Status: Not started

- [ ] Create `skills/expo-agent-ui/SKILL.md`
- [ ] Add component reference
- [ ] Add semantic ID reference
- [ ] Add MCP/tool reference
- [ ] Add flow examples
- [ ] Add validation script

## Phase 9 - Flow Runner And Patch Proposals

Product Stage: Stage 9 - Flow Runner And Patch Proposals
Status: Not started

- [ ] Define flow schema
- [ ] Implement local flow runner
- [ ] Add assertions and wait conditions
- [ ] Define patch proposal schema
- [ ] Keep automatic source patching deferred

## Phase 10 - Publish Readiness

Product Stage: Stage 10 - Publish Readiness
Status: Not started

- [ ] Rewrite README
- [ ] Add compatibility matrix
- [ ] Add install docs
- [ ] Add local MCP config snippets
- [ ] Add troubleshooting guide
- [ ] Add release checklist

## Review Rule

When choosing work from this checklist:

- convert only one bullet cluster into `docs/agents/TASK.md`,
- keep the task inside one product stage,
- treat unchecked later-stage items as future work,
- preserve `DONE_WITH_CONCERNS` research notes as gates for the relevant implementation stage.
