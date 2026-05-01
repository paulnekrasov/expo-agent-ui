# Expo Agent UI Research Status

## Executive Summary
- All five high-priority prompts, four medium-priority prompts, and all three low-priority prompts now have report files or seeded follow-up references under `docs/reference/**`.
- High-priority status tokens: `HIGH-01`, `HIGH-02`, `HIGH-03`, `HIGH-04`, and `HIGH-05` ended with `DONE`.
- Medium-priority status tokens: `MEDIUM-01` ended with `DONE`; `MEDIUM-02`, `MEDIUM-03`, and `MEDIUM-04` ended with `DONE_WITH_CONCERNS`.
- Low-priority status tokens: `LOW-01`, `LOW-02`, and `LOW-03` ended with `DONE_WITH_CONCERNS`.
- Stage 1 package foundation is sufficiently researched to proceed: target Expo SDK 55, use npm workspaces, keep config plugin optional, and keep native modules out of the core path.
- Stage 2 component primitives can proceed with React Native-first primitives, React Native accessibility metadata, stable semantic IDs mapped to `testID`, and optional future `@expo/ui/swift-ui` adapter boundaries.
- Stage 3 semantic runtime can proceed with the accessibility-backed semantic node contract, headless Jest/RNTL verification, redaction metadata, explicit action permissions, and flow validation without a simulator.
- Stage 4 agent bridge can proceed with explicit development-only gates, token pairing, loopback-first transport, redaction before serialization, deterministic tool authorization, and a WebSocket app-to-server bridge.
- Stage 5 MCP server can proceed on `@modelcontextprotocol/sdk` v1.x with static tool schemas, stdio transport, structured results, and no app-defined MCP tools.
- 2026-05-01 Maestro planning update: Maestro is now the preferred first optional external
  execution adapter for semantic flows. Agent UI remains the semantic source of truth; Maestro
  CLI/MCP, YAML, EAS jobs, and cloud execution remain optional generated/external lanes.
- Low-priority outputs are complete enough to preserve future strategy. Product direction changed on 2026-04-30: Android Compose is now a paired Stage 7 native adapter deliverable with SwiftUI, while Web DOM, Figma import, cloud flows, and visual comparison remain post-v0.
- Follow-up native preview research clarifies the product rule for EAS and visual editor work:
  EAS can build iOS SwiftUI artifacts on cloud Macs, but live iOS preview still requires an iOS
  runtime; side-by-side iOS SwiftUI and Android Compose preview is a multi-session editor problem,
  not a single-simulator feature.
- Deep-research was attempted by the low-priority researchers but blocked by missing `GOOGLE_API_KEY` / `GEMINI_API_KEY`; the reports were completed from official and primary web sources instead.
- Remaining concerns are implementation-scoping issues, not high-priority research blockers: Appium automation export, iOS physical-device bridge transport, Compose accessibility propagation, Figma MCP access tiers, and cloud-provider capability drift need verification during implementation or post-v0 research as applicable.

## Prompt Completion Matrix
| Priority | Prompt file | Output file | Status token | Key decision produced | Blockers / concerns |
|---|---|---|---|---|---|
| High | `HIGH-01-expo-package-foundation.md` | `docs/reference/expo/package-foundation.md` | `DONE` | Use Expo SDK 55 as baseline; JS-only core; npm workspaces; optional config plugin/native module path only when necessary. | None blocking. Keep package compatibility tables tied to Expo docs plus npm metadata. |
| High | `HIGH-02-expo-ui-swiftui-adapter.md` | `docs/reference/expo/expo-ui-swift-ui.md` | `DONE` | Keep `@expo/ui/swift-ui` as optional adapter/subpath; wrap only tested controls through `Host`; keep semantic registration in JavaScript. | None blocking. Beta status, no Expo Go, iOS/tvOS focus, and separate Android Compose surface are adapter constraints. |
| High | `HIGH-03-reanimated-motion-layer.md` | `docs/reference/motion/reanimated-4.md` | `DONE` | Build thin SwiftUI-style presets over Reanimated 4, Worklets, Gesture Handler, reduced-motion policy, and coarse semantic motion events. | None blocking. Expo-managed versus npm/bare setup differences are compatibility lanes and CLI doctor checks. |
| High | `HIGH-04-react-native-accessibility-semantics.md` | `docs/reference/react-native/accessibility-semantics.md` | `DONE` | Use React Native accessibility props as the semantic foundation; map semantic IDs to `testID`, not to user-facing labels. | None blocking. Platform-specific `testID` behavior should still be verified against compiled fixtures before automation export promises. |
| High | `HIGH-05-agent-bridge-mcp-transport.md` | `docs/reference/agent/mcp-transport-architecture.md` | `DONE` | Implement local stdio MCP plus app-to-server WebSocket bridge; interoperate with Expo MCP rather than depend on it. | None blocking. Session discovery, physical-device host setup, bridge security defaults, and redaction are implementation constraints. |
| Medium | `MEDIUM-01-navigation-adapters.md` | `docs/reference/react-native/navigation-adapters.md` | `DONE` | Implement explicit Expo Router and React Navigation adapters selected by provider config, using semantic `screenId` as the only stable agent target. | Expo Router route-tree/sitemap auto-discovery is post-v0 and `NEEDS_VERIFICATION`; v0 uses explicit mappings. |
| Medium | `MEDIUM-02-testing-devtools-automation.md` | `docs/reference/react-native/testing-and-devtools.md` | `DONE_WITH_CONCERNS` | Use Jest/RNTL as v0 semantic correctness authority; use Expo DevTools Plugins for live semantic inspection; use Maestro/Detox as optional post-v0 `testID` export targets after fixture smoke tests. | Appium export remains post-v0 until compiled fixtures prove a semantic ID locator that does not misuse `accessibilityLabel`; DevTools payload limits are handled with throttled summaries, subtree requests, and redacted diffs. |
| Medium | `MEDIUM-03-security-privacy-agent-control.md` | `docs/reference/agent/security-privacy.md` | `DONE_WITH_CONCERNS` | Enforce dev-only, fail-closed bridge startup; loopback-first transport; Android emulator and ADB reverse lanes; short-lived pairing token; redaction before serialization; static tool allowlists and per-node permissions. | iOS physical-device LAN/tunnel support remains gated on local-network permission and host-discovery verification; LAN/tunnel modes must be explicit unsafe modes. |
| Medium | `MEDIUM-04-eas-native-preview-workflows.md` | `docs/reference/expo/eas-native-preview.md` | `DONE_WITH_CONCERNS` | Use EAS as an iOS SwiftUI artifact build lane, but model live native preview as connected runtime sessions. Side-by-side native comparison requires one iOS runtime and one Android runtime. | EAS Workflows artifact capture, Expo Orbit scripting, remote Mac options, cost/privacy, and native accessibility inspection need implementation-time verification. |
| Low | `LOW-01-cross-platform-adapters.md` | `docs/reference/expo/cross-platform-adapters.md` | `DONE_WITH_CONCERNS` | Product update: keep React Native fallback as the shared baseline, but treat Android Compose as a paired Stage 7 native adapter with SwiftUI. Web DOM remains post-v0 over the same semantic registry. | Deep-research blocked by missing `GOOGLE_API_KEY` / `GEMINI_API_KEY`; `@expo/ui/jetpack-compose` is alpha, unavailable in Expo Go, and Compose accessibility propagation needs implementation-time verification. |
| Low | `LOW-02-figma-design-system-import.md` | `docs/reference/design/figma-design-system-import.md` | `DONE_WITH_CONCERNS` | Treat Figma import as a post-MVP token/component/semantic-hint pipeline, not a pixel-perfect design-to-code MVP feature. | Deep-research blocked by missing `GOOGLE_API_KEY` / `GEMINI_API_KEY`; Figma MCP write capabilities, access tiers, pricing, and some REST field coverage are moving surfaces marked `NEEDS_VERIFICATION`. |
| Low | `LOW-03-cloud-flows-visual-comparison.md` | `docs/reference/agent/cloud-flows-visual-comparison.md`; `docs/reference/agent/maestro-semantic-flow-adapter.md` | `DONE_WITH_CONCERNS` | Keep v0 local-first and semantic-first; make Maestro the first optional external execution adapter after semantic flows stabilize, then add Appium/WebdriverIO and visual providers only after redaction/artifact contracts stabilize. | Deep-research blocked by missing `GOOGLE_API_KEY` / `GEMINI_API_KEY`; Maestro fixture selector proof, cloud/pricing/provider capabilities, and Revyl-style UX parity remain implementation-time verification concerns. |

## Cross-Prompt Decisions
- Package dependency strategy: `expo`, `react`, and `react-native` are hard peer expectations for core; `react-native-reanimated` and `react-native-worklets` are peers for motion; `@expo/ui`, `expo-router`, and React Navigation remain optional peers/adapters.
- `@expo/ui` optional peer strategy: core Agent UI stays React Native-first. SwiftUI adapter imports `@expo/ui/swift-ui` only from an explicit adapter path and falls back outside supported platforms/build types.
- Reanimated setup strategy: Expo-managed apps use Expo SDK 55's bundled Reanimated `4.2.1` lane and `npx expo install`; bare/community apps must satisfy Reanimated 4 New Architecture, Worklets, Babel plugin, and rebuild requirements.
- JS-only v0 feasibility: package foundation, component primitives, semantic registry, navigation adapters, flow validation, app bridge, and MCP stdio server can start JS-only. Native modules are deferred until a proven capability gap appears.
- Runtime transport choice: use a development-only app outbound WebSocket to a local Node bridge/MCP process; use Expo MCP for docs, EAS, logs, screenshots, and simulator fallback checks.
- Navigation contract: agent tools target stable `screenId` values, not route names, file paths, group names, or labels. Expo Router and React Navigation adapters must delegate only to public navigation APIs and verify the final focused screen.
- Semantic/accessibility contract: actionable nodes require stable `id`, accessible label, normalized role/type, explicit actions, synchronized state/value, intent for high-impact actions, and default redaction for sensitive values.
- Testing contract: v0 correctness is headless first. Jest and React Native Testing Library validate registry behavior, component semantics, action dispatch, flow runner behavior, MCP schemas, and redaction without a simulator.
- DevTools contract: use Expo DevTools Plugins for a v0 semantic inspector because React Native core DevTools does not document a stable third-party extension API for this product surface.
- Security default policy: agent control is disabled outside development, localhost-bound by default, token-paired, capability-gated, origin-checked, privacy-redacted, and audited without sensitive payload logging.
- Automation interop contract: Agent UI owns canonical semantic flows. Maestro is the first
  optional external execution adapter and should use semantic IDs mapped to React Native `testID`
  and Maestro `id`; Detox and Appium remain later exports. Selector mappings must be verified
  against compiled fixture apps before docs promise stable behavior.
- Cross-platform adapter contract: React Native fallback primitives and semantic registry are the shared baseline. Native SwiftUI and Android Compose adapters are Stage 7 subpaths with capability flags and structured unsupported diagnostics; Web DOM remains a later adapter.
- Native preview contract: native adapters are platform-bound. EAS cloud Macs can build iOS
  SwiftUI artifacts, but interactive preview requires an iOS runtime. Side-by-side native
  comparison must connect multiple runtime sessions and compare semantic IDs, capabilities,
  diagnostics, and optional redacted screenshots.
- Design-system import contract: future Figma support should import tokens, component mappings, and semantic hints into Agent UI primitives; it must not bypass stable semantic IDs or treat design-file text as trusted instructions.
- Cloud validation contract: canonical Agent UI semantic flows and local recordings remain the source of truth; cloud tools and screenshot diff consume exported artifacts only after redaction and semantic assertions.
- Revyl-inspired UX contract: local Agent UI may borrow natural-language flow generation, visual
  replay, reusable modules, self-healing suggestions, and unified reports, but must not depend on
  Revyl or any paid cloud orchestration service.

## Implementation Decisions To Carry Forward
- Expo SDK package versions versus npm latest: reports distinguish Expo bundled versions from upstream npm latest versions. This matters for install docs and peer ranges. Keep compatibility tables generated from Expo docs, `npx expo install`, and npm metadata during implementation.
- Expo UI docs version skew: resolved for planning by using the SDK overview plus published `@expo/ui` package exports/types as source of truth for package-level claims.
- Reanimated managed versus bare setup: resolved as two setup lanes. Expo-managed docs say Babel setup is handled by `babel-preset-expo`; bare/community setup requires explicit `react-native-worklets/plugin`, native rebuilds, and New Architecture compatibility checks.
- Expo Router route discovery: Expo exposes hooks and diagnostic sitemap concepts, but the reports do not establish a stable public route metadata API for all app routes. This matters for `navigate(screenId)`. Recommended resolver: require explicit screen registration for v0 and defer auto-discovery.
- `testID` platform behavior: Maestro and Detox can target React Native `testID` through their documented `id`/`by.id` paths after fixture smoke tests; Appium still needs compiled fixture proof because its drivers document platform locator attributes rather than one React Native `testID` rule. Recommended resolver: ship no Appium export docs until the fixture proves semantic IDs are targetable without copying IDs into `accessibilityLabel`.
- Physical-device bridge transport: Android emulator can use `10.0.2.2`, and Android physical devices can use ADB reverse to keep the host bridge loopback-bound; iOS physical devices still need verified LAN/Bonjour/tunnel behavior and local-network permission handling. Recommended resolver: implement loopback and Android ADB reverse lanes first; keep LAN/tunnel explicit unsafe modes.
- MCP SDK version split: resolved for v0 by pinning `@modelcontextprotocol/sdk@1.x` and avoiding split v2 packages while they remain alpha.
- DevTools integration surface: Expo DevTools Plugins are documented for Expo apps, while React Native core DevTools third-party panel support remains unstable or unofficial. This matters for live semantic inspection. Recommended resolver: implement Expo plugin first, keep React Native DevTools/Rozenite as deferred options.
- Compose adapter maturity versus parity: Expo documents `@expo/ui/jetpack-compose` as alpha and Android-only. This matters for Android adapter promises. Recommended resolver after the 2026-04-30 product update: implement Compose as a Stage 7 paired native adapter with SwiftUI, while gating it on package export inspection, `Host` behavior, Android development builds, and TalkBack/accessibility propagation in a prototype.
- EAS build versus live runtime: EAS can produce iOS artifacts on cloud macOS infrastructure, but
  the docs do not turn that into a persistent local simulator for Windows/Linux development. This
  matters for visual editor promises. Recommended resolver: document artifact build, local/remote
  runtime, and cloud workflow capture as separate lanes.
- Figma import capability split: REST APIs, Code Connect, plugin APIs, and Figma MCP expose overlapping but differently permissioned design data. This matters for future import commands. Recommended resolver: start with read-only REST/token import plus Code Connect hints, then recheck MCP write/access capabilities immediately before implementation.
- Visual comparison provider scope: Maestro, BrowserStack/App Percy, Applitools, Sherlo, Sauce, and Chromatic cover different layers and platforms. This matters for future QA architecture. Recommended resolver: export canonical semantic flows to Maestro first, keep provider-specific visual adapters outside the core runtime, and keep Revyl-style UX patterns local-first rather than vendor-bound.

## MVP Blockers
- No Stage 1 package-foundation blocker remains.
- No Stage 2 React Native-first component primitive blocker remains.
- No Stage 3 semantic runtime blocker remains, provided redaction metadata and accessibility-backed semantics are part of the schema from the start.
- Stage 4 must define the concrete pairing/session-discovery UX before implementation. Loopback, Android emulator, and Android ADB reverse can be v0 lanes; LAN/tunnel modes must be explicit, warned, token-paired, redacted, and time-limited.
- Stage 4 must implement and test fail-closed development gating, token authentication, origin checks, per-node action permissions, and redaction before exposing any semantic bridge response.
- Stage 5 must pin MCP SDK v1.x, keep stdio stdout protocol-clean, expose only implemented tools, and keep app semantic data from defining or mutating MCP tool schemas.
- Device automation exports are not MVP blockers. Maestro export/execution belongs after semantic
  flow schema stability and fixture selector proof; Detox/Appium remain later exports.

## Non-Blocking Future Research
- Jetpack Compose adapter implementation proof with package export inspection, TalkBack validation, and Host sizing fixtures.
- Web/DOM adapter implementation proof for React Native Web role/ARIA mapping, keyboard focus, and browser automation interop.
- EAS/native preview proof for iOS simulator artifacts, Expo Orbit or CLI install scripting,
  remote Mac workflow, EAS Workflow screenshot/video capture, and multi-session editor UX.
- Figma/design-system import proof using a read-only token/component mapper and explicit prompt-injection defenses for design text.
- Maestro semantic-flow adapter proof: YAML export, optional MCP/CLI execution, local replay,
  evidence bundles, and self-healing proposals.
- Cloud flow recording, replay, screenshots, and visual comparison provider spikes after local semantic flow replay and redaction are stable.
- Rozenite or future React Native DevTools panel integration.
- Detox spec generation and Appium/WebDriver export.
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
- Created: `docs/reference/expo/eas-native-preview.md`
- Created: `docs/reference/design/figma-design-system-import.md`
- Created: `docs/reference/agent/cloud-flows-visual-comparison.md`
- Created: `docs/reference/agent/maestro-semantic-flow-adapter.md`
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
