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
Status: Complete with deferred semantic-runtime concerns

- [x] Implement `AgentUIProvider`
- [x] Implement `Screen`
- [x] Implement `VStack`, `HStack`, `ZStack`, `Spacer`
- [x] Implement `Text`
- [x] Implement `Image`, `Icon`, `Label`
- [x] Implement `Button`
- [x] Implement `TextField`, `SecureField`
- [x] Implement `Scroll`, `List`, `Section`, `Form`
- [x] Implement `Toggle`, `Slider`, `Picker`, `Stepper`
- [x] Add initial accessibility prop mapping for the first primitive slice
- [x] Add initial stable semantic ID validation warning for `Button`
- [x] Extend accessibility prop mapping to remaining primitives
- [x] Extend stable semantic ID validation warnings to remaining actionable primitives
- [x] Add first example settings screen
- [x] Add first simple primitive example screen

## Phase 3 - Semantic Runtime

Product Stage: Stage 3 - Semantic Runtime
Status: Complete with deferred bridge/MCP concerns

- [x] Define `SemanticNode` schema
- [x] Implement registry mount/unmount
- [x] Implement parent-child tree snapshots
- [x] Implement duplicate ID warnings
- [x] Implement node lookup by ID
- [x] Implement runtime action dispatch
- [x] Implement action metadata
- [x] Implement privacy/redaction metadata
- [x] Add semantic registry tests

## Phase 4 - Agent Tool Bridge

Product Stage: Stage 4 - Agent Tool Bridge
Status: Complete with deferred MCP concerns

- [x] Define bridge protocol
- [x] Implement development-only runtime gate
- [x] Implement session model contracts
- [x] Implement hello/heartbeat envelope contracts
- [x] Implement pairing token validation shape
- [x] Implement in-memory event log contract
- [x] Implement loopback-first WebSocket bridge connection (hello/welcome, heartbeat, reconnect)
- [x] Implement bridge command dispatch against semantic registry
- [x] Implement pairing token flow (server-side handshake validation)
- [x] Implement `inspectTree`, `getState`, `tap`, `input`, `waitFor`, `observeEvents` tool contracts
- [x] Add structured request/response types
- [x] Add security/redaction tests

## Phase 5 - MCP Server

Product Stage: Stage 5 - MCP Server
Status: Complete

- [x] Add stdio MCP server package
- [x] Pin MCP SDK v1.x unless re-verified otherwise
- [x] Register only implemented tools (inspectTree, getState)
- [x] Register tap, input, observeEvents tools (second slice)
- [x] Register waitFor tool (third slice)
- [x] Register scroll, navigate, runFlow tools (sixth slice)
- [x] Add read-only resources for sessions, diagnostics
- [x] Add read-only resources for repo-local platform skills
- [x] Add skill-context lookup tools: `listPlatformSkills`, `getPlatformSkill`, `searchPlatformSkills`, `recommendPlatformSkills`
- [x] Keep skill-context tools separate from runtime-control tools and app-session requirements
- [x] Keep stdout protocol-clean
- [x] Add MCP schema tests

## Phase 6 - Motion Layer

Product Stage: Stage 6 - Motion Layer
Status: Complete

Three-tier architecture: Tier 1 Reanimated cross-platform (required), Tier 2 native iOS
SwiftUI motion adapter (optional, behind `@expo/ui/swift-ui`), Tier 3 native Android Jetpack
Compose motion adapter (optional, behind `@expo/ui/jetpack-compose`). Native adapter
implementations are Stage 7 work; Stage 6 defines contracts, capability flags, resolution
logic, and native preset mapping documentation.

### Slice 6.1 — Reanimated Cross-Platform Base

- [x] Add Reanimated preset mapping (spring, bouncy, snappy, easeInOut)
- [x] Add reduced motion policy (ReduceMotion.System default, central policy hook)
- [x] Add entering/exiting transition helpers (opacity, slide, scale)
- [x] Add layout transition helpers (smooth via LinearTransition)
- [x] Add gesture helper strategy (Gesture Handler for pan/drag, Pressable for taps)
- [x] Add coarse semantic motion events (started, completed, interrupted, gesture_committed)
- [x] Add Reanimated motion preset tests
- [x] Add reduced motion path tests
- [x] Add example-app motion demo screen

### Slice 6.2 — Native Motion Adapter Contracts

- [x] Define MotionAdapter interface with capability flags
- [x] Implement Reanimated adapter as default Tier 1
- [x] Add SwiftUI motion adapter stub with iOS capability flags
- [x] Add Compose motion adapter stub with Android capability flags
- [x] Add tier resolution logic (detect native adapter availability, fall back to Reanimated)
- [x] Add adapter resolution and fallback tests

### Slice 6.3 — Native Motion Mapping Documentation

- [x] Document iOS SwiftUI motion preset mapping (spring, transition, symbolEffect,
  sensoryFeedback, matchedGeometry, keyframes, phaseAnimator)
- [x] Document Android Compose motion preset mapping (animate*AsState, AnimatedVisibility,
  SharedTransitionLayout, spring, graphicsLayer, infiniteTransition)
- [x] Update Reanimated 4 reference to describe three-tier strategy
- [x] Add native adapter mapping contract tests
- [x] Add motion adapter diagnostic to MCP diagnostics

## Phase 7 - Expo UI Adapter

Product Stage: Stage 7 - Expo UI Adapter
Status: Complete — Slices 7.1, 7.2, and 7.3 complete

### Slice 7.1 — Native Adapter Contracts & Component Factories

- [x] Add explicit `@expo/ui/swift-ui` adapter path (`packages/core/src/swift-ui.ts`)
- [x] Add explicit `@expo/ui/jetpack-compose` adapter path (`packages/core/src/jetpack-compose.ts`)
- [x] Build the first native component subset for both adapters (6 SwiftUI + 4 Compose factories)
- [x] Add fallback behavior for unsupported platforms (React Native fallback + dev warnings)
- [x] Keep `@expo/ui` optional peer behind explicit adapter imports (no @expo/ui import in core)
- [x] Add SwiftUI and Jetpack Compose capability flags (14 SwiftUI + 29 Compose flags)
- [x] Add adapter tests (30 tests in native-adapters.test.tsx)

### Slice 7.2 — Native Module Detection & EAS Build Configuration

- [x] Implement `detectAgentUISwiftUINativeModule()` — Platform.OS + dynamic require, lazy cached
- [x] Implement `detectAgentUIComposeNativeModule()` — Platform.OS + dynamic require, lazy cached
- [x] Wire `isAvailable()` to detection on both adapter instances
- [x] Add `refreshAgentUISwiftUIAdapter()` and `refreshAgentUIComposeAdapter()` for test resets
- [x] Export 4 detection utilities from `packages/core/src/index.ts`
- [x] Document Host sizing conventions for SwiftUI and Jetpack Compose (JSDoc in adapter files)
- [x] Document EAS iOS development build profile (eas.json, simulator build, key points)
- [x] Document EAS Android Gradle cache configuration (`EAS_GRADLE_CACHE=1`, build profile, `FROM CACHE` verification)
- [x] Document development build requirements checklist
- [x] Add 20 detection/refresh/wiring tests (46 total in native-adapters.test.tsx)
- [x] Update MCP diagnostics nativeAdapters section (detectionMethod, availability, Gradle cache note)

### Slice 7.3 — Capability Flag Mapping & Remaining Component Factory Render Tests

- [x] Map detected capabilities to individual adapter flags (populate on success, reset on failure/refresh)
- [x] Change capabilities to mutable reference (direct object shared with adapter, not spread copy)
- [x] `refresh*()` resets both detection cache and capability flags
- [x] Add remaining component factory render tests: SwiftUI TextField/SecureField/Slider/Picker (8 tests)
- [x] Add remaining component factory render tests: Compose TextField/Slider (4 tests)
- [x] Add capability mapping tests: reference identity, pre/post-detection flags, refresh reset (8 tests)
- [x] 66 total native-adapters tests (was 46, +20). Workspace: 374 total (316 example-app + 58 mcp-server)

## Phase 8 - Agent Skill

Product Stage: Stage 8 - Agent Skill
Status: Complete

- [x] Create `skills/expo-agent-ui/SKILL.md` with YAML frontmatter and trigger phrases
- [x] Add reference: `references/components.md` — full prop tables for 19 primitives
- [x] Add reference: `references/semantics.md` — SemanticNode schema and ID conventions
- [x] Add reference: `references/tools.md` — 13 MCP tools with JSON schemas
- [x] Add reference: `references/flows.md` — flow schema, step types, security gate
- [x] Add reference: `references/patching.md` — patch proposal schema, change kinds
- [x] Add example: `examples/checkout-screen.tsx` — 7-field checkout with AgentUIProvider
- [x] Add example: `examples/settings-screen.tsx` — settings with Toggle/Picker/Slider
- [x] Add validation script: `scripts/validate-semantic-ids.js` — zero-dep semantic ID validator
- [x] Create `examples/flow.json` — canonical checkout happy-path flow (11 steps, fixture refs, approval gates)
- [x] Create `scripts/validate-skill.js` — progressive disclosure and skill structure validator
- [x] Validate skill against MCP server (all 374 tests pass, tool schemas match references)
- [x] Validate progressive disclosure (skill loads on demand, references resolve, routing table correct)

## Phase 9 - Flow Runner, Patch Proposals, And Native Preview Comparison

Product Stage: Stage 9 - Flow Runner, Patch Proposals, And Native Preview Comparison
Status: Complete

- [x] Define flow schema (Types in packages/core/src/flows.ts + schema in skills/references/flows.md)
- [x] Define semantic-to-Maestro YAML export contract (packages/cli/src/commands/export-maestro.ts, 7 step types to YAML mapping)
- [x] Implement local flow runner (createFlowRunner in packages/core/src/flows.ts, 7 step types, timeout, stopOnFailure)
- [x] Add optional Maestro adapter CLI path outside packages/core (export-maestro, maestro-run, maestro-heal commands)
- [x] Add assertions and wait conditions (validate/run asserts, waitFors with 4 condition kinds)
- [x] Define patch proposal schema (packages/core/src/patching.ts, 5 change kinds)
- [x] Define self-healing proposal schema for failed external flow selectors (packages/cli/src/commands/maestro-heal.ts)
- [x] Add local visual flow replay and evidence bundle format (flow runner returns structured results)
- [x] Define multi-session runtime metadata for future visual editor comparison (packages/mcp-server/src/native-preview.ts)
- [x] Define side-by-side iOS SwiftUI / Android Compose comparison constraints (computeCapabilityDiff, computeSemanticIdDiff, computeDiagnosticDiff)
- [x] Keep the visual editor development-only, semantic-first, and redaction-gated (all comparison redacts sensitive values)
- [x] Keep automatic source patching deferred (proposePatch tool requires explicit approval, autoApply is always false)

## Phase 10 - Publish Readiness

Product Stage: Stage 10 - Publish Readiness
Status: Complete

- [x] Rewrite README (1405 lines, 21 sections, full walkthrough)
- [x] Add compatibility matrix (docs/COMPATIBILITY.md, 75 lines)
- [x] Add install docs (docs/INSTALL.md, 194 lines)
- [x] Add local MCP config snippets (docs/MCP_CONFIG.md, 480 lines)
- [x] Add Maestro install, MCP, YAML export, and EAS workflow docs (integrated into README + MCP_CONFIG.md)
- [x] Add troubleshooting guide (docs/TROUBLESHOOTING.md, 434 lines)
- [x] Add release checklist (docs/RELEASE_CHECKLIST.md, 369 lines)

## Review Rule

When choosing work from this checklist:

- convert only one bullet cluster into `docs/agents/TASK.md`,
- keep the task inside one product stage,
- treat unchecked later-stage items as future work,
- preserve `DONE_WITH_CONCERNS` research notes as gates for the relevant implementation stage.
