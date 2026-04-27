# Expo Agent UI Research Status

## Executive Summary
- All five high-priority prompts, all three medium-priority prompts, and all three low-priority prompts now have report files under `docs/reference/**`.
- High-priority status tokens: `HIGH-01` and `HIGH-04` ended with `DONE`; `HIGH-02`, `HIGH-03`, and `HIGH-05` ended with `DONE_WITH_CONCERNS`.
- Medium-priority status tokens: `MEDIUM-01` ended with `DONE`; `MEDIUM-02` and `MEDIUM-03` ended with `DONE_WITH_CONCERNS`.
- Low-priority status tokens: `LOW-01`, `LOW-02`, and `LOW-03` ended with `DONE_WITH_CONCERNS`.
- Stage 1 package foundation is sufficiently researched to proceed: target Expo SDK 55, use npm workspaces, keep config plugin optional, and keep native modules out of the core path.
- Stage 2 component primitives can proceed with React Native-first primitives, React Native accessibility metadata, stable semantic IDs mapped to `testID`, and optional future `@expo/ui/swift-ui` adapter boundaries.
- Stage 3 semantic runtime can proceed with the accessibility-backed semantic node contract, headless Jest/RNTL verification, redaction metadata, explicit action permissions, and flow validation without a simulator.
- Stage 4 agent bridge can proceed only with explicit development-only gates, token pairing, loopback-first transport, redaction before serialization, and deterministic tool authorization.
- Stage 5 MCP server can proceed on `@modelcontextprotocol/sdk` v1.x with static tool schemas, stdio transport, structured results, and no app-defined MCP tools.
- Low-priority outputs are complete enough to preserve future strategy, but they do not change MVP scope: Compose, Web DOM, Figma import, cloud flows, and visual comparison remain post-v0.
- Deep-research was attempted by the low-priority researchers but blocked by missing `GOOGLE_API_KEY` / `GEMINI_API_KEY`; the reports were completed from official and primary web sources instead.
- Remaining concerns are implementation-scoping issues, not research blockers: Expo/Reanimated version skew, physical-device transport, native automation selector mapping, DevTools throughput, Compose accessibility propagation, Figma MCP access tiers, and cloud-provider capability drift need verification during implementation.

## Prompt Completion Matrix
| Priority | Prompt file | Output file | Status token | Key decision produced | Blockers / concerns |
|---|---|---|---|---|---|
| High | `HIGH-01-expo-package-foundation.md` | `docs/reference/expo/package-foundation.md` | `DONE` | Use Expo SDK 55 as baseline; JS-only core; npm workspaces; optional config plugin/native module path only when necessary. | None blocking. Keep package compatibility tables tied to Expo docs plus npm metadata. |
| High | `HIGH-02-expo-ui-swiftui-adapter.md` | `docs/reference/expo/expo-ui-swift-ui.md` | `DONE_WITH_CONCERNS` | Keep `@expo/ui/swift-ui` as optional adapter/subpath; wrap only tested controls through `Host`; keep semantic registration in JavaScript. | Beta status, no Expo Go, iOS/tvOS focus, separate Android Compose surface, and docs/version skew require adapter isolation. |
| High | `HIGH-03-reanimated-motion-layer.md` | `docs/reference/motion/reanimated-4.md` | `DONE_WITH_CONCERNS` | Build thin SwiftUI-style presets over Reanimated 4, Worklets, Gesture Handler, reduced-motion policy, and coarse semantic motion events. | Expo bundled Reanimated version differs from npm latest; bare/community setup needs explicit Worklets plugin; Reanimated 4 requires New Architecture. |
| High | `HIGH-04-react-native-accessibility-semantics.md` | `docs/reference/react-native/accessibility-semantics.md` | `DONE` | Use React Native accessibility props as the semantic foundation; map semantic IDs to `testID`, not to user-facing labels. | None blocking. Platform-specific `testID` behavior should still be verified against compiled fixtures before automation export promises. |
| High | `HIGH-05-agent-bridge-mcp-transport.md` | `docs/reference/agent/mcp-transport-architecture.md` | `DONE_WITH_CONCERNS` | Implement local stdio MCP plus app-to-server WebSocket bridge; interoperate with Expo MCP rather than depend on it. | Session discovery, physical-device host setup, bridge security defaults, and redaction needed medium follow-up. |
| Medium | `MEDIUM-01-navigation-adapters.md` | `docs/reference/react-native/navigation-adapters.md` | `DONE` | Implement explicit Expo Router and React Navigation adapters selected by provider config, using semantic `screenId` as the only stable agent target. | Expo Router route-tree/sitemap auto-discovery is post-v0 and `NEEDS_VERIFICATION`; v0 uses explicit mappings. |
| Medium | `MEDIUM-02-testing-devtools-automation.md` | `docs/reference/react-native/testing-and-devtools.md` | `DONE_WITH_CONCERNS` | Use Jest/RNTL as v0 semantic correctness authority; use Expo DevTools Plugins for live semantic inspection; keep Maestro/Detox/Appium optional and deferred. | Native automation selector mapping, especially Appium/RN `testID` versus `accessibilityLabel`, needs compiled fixture verification before export docs. |
| Medium | `MEDIUM-03-security-privacy-agent-control.md` | `docs/reference/agent/security-privacy.md` | `DONE_WITH_CONCERNS` | Enforce dev-only, fail-closed bridge startup; loopback-first transport; short-lived pairing token; redaction before serialization; static tool allowlists and per-node permissions. | Physical-device transport still needs a verified secure tunnel or explicit unsafe LAN mode before implementation promises it. |
| Low | `LOW-01-cross-platform-adapters.md` | `docs/reference/expo/cross-platform-adapters.md` | `DONE_WITH_CONCERNS` | Keep Agent UI v0 on React Native fallback plus optional iOS SwiftUI adapter; treat Android Compose and Web DOM as post-v0 adapters over the same semantic registry. | Deep-research blocked by missing `GOOGLE_API_KEY` / `GEMINI_API_KEY`; `@expo/ui/jetpack-compose` is alpha, unavailable in Expo Go, and Compose accessibility propagation needs implementation-time verification. |
| Low | `LOW-02-figma-design-system-import.md` | `docs/reference/design/figma-design-system-import.md` | `DONE_WITH_CONCERNS` | Treat Figma import as a post-MVP token/component/semantic-hint pipeline, not a pixel-perfect design-to-code MVP feature. | Deep-research blocked by missing `GOOGLE_API_KEY` / `GEMINI_API_KEY`; Figma MCP write capabilities, access tiers, pricing, and some REST field coverage are moving surfaces marked `NEEDS_VERIFICATION`. |
| Low | `LOW-03-cloud-flows-visual-comparison.md` | `docs/reference/agent/cloud-flows-visual-comparison.md` | `DONE_WITH_CONCERNS` | Keep v0 local-first and semantic-first; later export semantic flows to Maestro first, then Appium/WebdriverIO and visual providers after redaction/artifact contracts stabilize. | Deep-research blocked by missing `GOOGLE_API_KEY` / `GEMINI_API_KEY`; cloud/pricing/provider capabilities are moving targets and several claims are marked `NEEDS_VERIFICATION`. |

## Cross-Prompt Decisions
- Package dependency strategy: `expo`, `react`, and `react-native` are hard peer expectations for core; `react-native-reanimated` and `react-native-worklets` are peers for motion; `@expo/ui`, `expo-router`, and React Navigation remain optional peers/adapters.
- `@expo/ui` optional peer strategy: core Agent UI stays React Native-first. SwiftUI adapter imports `@expo/ui/swift-ui` only from an explicit adapter path and falls back outside supported platforms/build types.
- JS-only v0 feasibility: package foundation, component primitives, semantic registry, navigation adapters, flow validation, app bridge, and MCP stdio server can start JS-only. Native modules are deferred until a proven capability gap appears.
- Runtime transport choice: use a development-only app outbound WebSocket to a local Node bridge/MCP process; use Expo MCP for docs, EAS, logs, screenshots, and simulator fallback checks.
- Navigation contract: agent tools target stable `screenId` values, not route names, file paths, group names, or labels. Expo Router and React Navigation adapters must delegate only to public navigation APIs and verify the final focused screen.
- Semantic/accessibility contract: actionable nodes require stable `id`, accessible label, normalized role/type, explicit actions, synchronized state/value, intent for high-impact actions, and default redaction for sensitive values.
- Testing contract: v0 correctness is headless first. Jest and React Native Testing Library validate registry behavior, component semantics, action dispatch, flow runner behavior, MCP schemas, and redaction without a simulator.
- DevTools contract: use Expo DevTools Plugins for a v0 semantic inspector because React Native core DevTools does not document a stable third-party extension API for this product surface.
- Security default policy: agent control is disabled outside development, localhost-bound by default, token-paired, capability-gated, origin-checked, privacy-redacted, and audited without sensitive payload logging.
- Automation interop contract: Maestro, Detox, and Appium are optional future export targets. Their selector mappings must be verified against compiled fixture apps before docs promise stable behavior.
- Cross-platform adapter contract: React Native fallback primitives and semantic registry are the shared baseline. Native SwiftUI, Android Compose, and Web DOM adapters should be optional subpaths with capability flags and structured unsupported diagnostics.
- Design-system import contract: future Figma support should import tokens, component mappings, and semantic hints into Agent UI primitives; it must not bypass stable semantic IDs or treat design-file text as trusted instructions.
- Cloud validation contract: canonical Agent UI semantic flows and local recordings remain the source of truth; cloud tools and screenshot diff consume exported artifacts only after redaction and semantic assertions.

## Contradictions To Resolve
- Expo SDK package versions versus npm latest: reports distinguish Expo bundled versions from upstream npm latest versions. This matters for install docs and peer ranges. Recommended resolver: keep compatibility tables generated from Expo docs, `npx expo install`, and npm metadata during implementation.
- Expo UI docs version skew: overview, component pages, and package metadata can disagree at page level. This matters for adapter support claims. Recommended resolver: use SDK overview plus published `@expo/ui` package types as source of truth for package-level claims.
- Reanimated managed versus bare setup: Expo managed docs say Babel setup is handled by `babel-preset-expo`, while upstream bare/community setup requires explicit `react-native-worklets/plugin`. This matters for CLI `doctor` and README setup. Recommended resolver: document two setup lanes.
- Expo Router route discovery: Expo exposes hooks and diagnostic sitemap concepts, but the reports do not establish a stable public route metadata API for all app routes. This matters for `navigate(screenId)`. Recommended resolver: require explicit screen registration for v0 and defer auto-discovery.
- `testID` platform behavior: accessibility, testing, Maestro, Detox, and Appium reports point to different native selector surfaces. This matters for exported device automation. Recommended resolver: compile fixture apps and verify selector mappings before shipping export docs.
- Physical-device bridge transport: loopback is appropriate for simulator/emulator, but physical devices need a verified tunnel or explicit unsafe LAN mode. This matters for Stage 4 implementation scope. Recommended resolver: implement loopback-first v0 and research device-to-host setup during bridge implementation.
- MCP SDK version split: stable `@modelcontextprotocol/sdk@1.x` exists while split v2 packages are alpha. This matters for `packages/mcp-server`. Recommended resolver: pin v1 SDK for v0 and revisit v2 only after stable release.
- DevTools integration surface: Expo DevTools Plugins are documented for Expo apps, while React Native core DevTools third-party panel support remains unstable or unofficial. This matters for live semantic inspection. Recommended resolver: implement Expo plugin first, keep React Native DevTools/Rozenite as deferred options.
- Compose adapter maturity versus parity: Expo documents `@expo/ui/jetpack-compose` as alpha and Android-only, while SwiftUI adapter work is more directly aligned with the product's SwiftUI-inspired path. This matters for Android adapter promises. Recommended resolver: keep Compose post-v0 and verify package exports, Host behavior, and TalkBack/accessibility propagation in a prototype.
- Figma import capability split: REST APIs, Code Connect, plugin APIs, and Figma MCP expose overlapping but differently permissioned design data. This matters for future import commands. Recommended resolver: start with read-only REST/token import plus Code Connect hints, then recheck MCP write/access capabilities immediately before implementation.
- Visual comparison provider scope: Maestro, BrowserStack/App Percy, Applitools, Sherlo, Sauce, and Chromatic cover different layers and platforms. This matters for future QA architecture. Recommended resolver: export canonical semantic flows to Maestro first and keep provider-specific visual adapters outside the core runtime.

## MVP Blockers
- No Stage 1 package-foundation blocker remains.
- No Stage 2 React Native-first component primitive blocker remains.
- No Stage 3 semantic runtime blocker remains, provided redaction metadata and accessibility-backed semantics are part of the schema from the start.
- Stage 4 must define the concrete pairing/session-discovery UX before implementation. Loopback/simulator can be v0; physical-device LAN mode must be explicit and warned if not securely tunneled.
- Stage 4 must implement and test fail-closed development gating, token authentication, origin checks, per-node action permissions, and redaction before exposing any semantic bridge response.
- Stage 5 must pin MCP SDK v1.x, keep stdio stdout protocol-clean, expose only implemented tools, and keep app semantic data from defining or mutating MCP tool schemas.
- Device automation exports are not MVP blockers. They are post-v0 until selector mappings are verified in compiled fixtures.

## Non-Blocking Future Research
- Jetpack Compose adapter implementation proof with package export inspection, TalkBack validation, and Host sizing fixtures.
- Web/DOM adapter implementation proof for React Native Web role/ARIA mapping, keyboard focus, and browser automation interop.
- Figma/design-system import proof using a read-only token/component mapper and explicit prompt-injection defenses for design text.
- Cloud flow recording, replay, screenshots, and visual comparison provider spikes after local semantic flow replay and redaction are stable.
- Rozenite or future React Native DevTools panel integration.
- Maestro YAML export, Detox spec generation, and Appium/WebDriver export.
- Native adapter E2E matrix for `@expo/ui/swift-ui` and future Android adapters.
- Automatic Expo Router route-tree discovery and independent navigation-tree support.

## Reference Files Ready To Create
- Created: `docs/reference/expo/package-foundation.md`
- Created: `docs/reference/expo/expo-ui-swift-ui.md`
- Created: `docs/reference/motion/reanimated-4.md`
- Created: `docs/reference/react-native/accessibility-semantics.md`
- Created: `docs/reference/agent/mcp-transport-architecture.md`
- Created: `docs/reference/react-native/navigation-adapters.md`
- Created: `docs/reference/react-native/testing-and-devtools.md`
- Created: `docs/reference/agent/security-privacy.md`
- Created: `docs/reference/expo/cross-platform-adapters.md`
- Created: `docs/reference/design/figma-design-system-import.md`
- Created: `docs/reference/agent/cloud-flows-visual-comparison.md`
- Ready to derive during repo reset: `docs/reference/INDEX.md`
- Ready to derive during repo reset: `docs/reference/packaging/compatibility.md`
- Ready to derive during repo reset: `docs/reference/agent/semantic-tree-contract.md`
- Ready to derive during repo reset: `docs/reference/agent/tool-contract.md`
- Ready to derive during repo reset: `docs/reference/agent/flow-runner.md`
- Ready to derive during repo reset: `docs/reference/agent/patch-proposal-contract.md`

## Recommended Next Bounded Task
- Goal: Rewrite the project brief and reference router for the Expo Agent UI rebuild using the completed high-, medium-, and low-priority reports as source material.
- Non-goals: Do not implement package source code, delete old parser assets, install dependencies, run builds, or promote low-priority future adapters/import/cloud features into MVP scope.
- Files affected: `AGENTS.md`, `docs/PROJECT_BRIEF.md`, `docs/reference/INDEX.md`, `docs/agents/ROADMAP_CHECKLIST.md`, `docs/agents/PHASE_STATE.md`, `docs/agents/TASK.md`, `docs/agents/HANDOFF.md`, `docs/agents/REVIEW_CHECKLIST.md`.
- Verification: Read every changed file, confirm no old SwiftUI parser Stage 3 resolver task remains active, confirm the new roadmap points first to Stage 1 package foundation, and confirm the new reference router links the eleven created research reports.
- Acceptance criteria: The repo startup docs route agents to Expo Agent UI references; the old parser project is clearly marked as no longer the strategic target; the next bounded task is package foundation; Stage 4/5 security and transport concerns are preserved as implementation gates; low-priority adapter, Figma, and cloud findings are recorded as post-v0 strategy, not MVP blockers.

DONE_WITH_CONCERNS
