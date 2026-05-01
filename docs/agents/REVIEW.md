# REVIEW REPORT
Reviewer session date: 2026-04-27
Roadmap Phase: Phase 0 - Repo Reset And Cleanup
Product Stage: Stage 0 - Cleanup
Task status: passed with noted limitations

## Findings

No blocking findings for the cleanup pass.

## Verified

- Old parser, resolver, VS Code extension, tree-sitter, WASM, Canvas renderer, old tests, and old
  prompt-template surfaces were removed from active context.
- Old root-level SwiftUI preview research and planning markdown files under `docs/` were removed
  after their useful ideas were compressed into the new reference docs.
- New compact reference docs preserve reusable design ideas without reviving old implementation
  contracts.
- Repo-local agent definitions now route to Expo Agent UI product stages instead of parser stages.
- `docs/reference/INDEX.md` no longer points agents to old layer-based references.
- `AGENTS.md`, `README.md`, `PHASE_STATE.md`, `HANDOFF.md`, and runtime prompt status describe the
  cleanup as complete.

## Verification Commands

- `npm run typecheck --workspaces --if-present`
- `npm run build --workspaces --if-present`
- `npm test --workspaces --if-present`

## Limitations And Follow-Ups

- Remote old branches under `origin/dev/*` were not deleted.
- npm still reports moderate audit findings from the dependency graph; remediation is a separate
  dependency task.
- Stage 2 component primitives remain the active next implementation task.

---

# REVIEW REPORT
Reviewer session date: 2026-04-30
Roadmap Phase: Cross-stage workflow maintenance
Product Stage: Agent workflow / Stage 8 prework
Task status: clear

## Findings

No blocking findings for the scheduled automation prompt and systematic debugging integration.

## Verified

- `docs/agents/SCHEDULED_AUTOMATION_LOOP_PROMPT.md` now targets the Expo Agent UI lifecycle and no
  longer instructs scheduled runs to continue old SwiftUI Preview / VS Code extension work.
- The prompt preserves the exact legacy automation memory path
  `C:\Users\Asus\.codex\automations\swiftui-automous-agent-loop\memory.md`.
- `docs/reference/agent/platform-skills/systematic-debugging/SKILL.md` adapts the original global
  systematic debugging skill for Expo Agent UI stages and blocked verification.
- The skill is discoverable through the reference index, platform skill index, skill router, MCP
  skill surface, prompt rotation protocol, runtime prompt status, roadmap, and `AGENTS.md`.

## Verification Commands

- `git diff --check`
- `npm run typecheck --workspaces --if-present`
- Read-back verification of changed workflow docs.

## Limitations And Follow-Ups

- No source package code changed.
- Stage 2 component primitives remain the active next implementation task.

---

# REVIEW REPORT
Reviewer session date: 2026-04-30
Roadmap Phase: Phase 2 - Component Primitives
Product Stage: Stage 2 - Component Primitives
Task status: done with concerns

## Findings

No blocking findings for the first Stage 2 primitive slice.

## Verified

- `packages/core/src` exports `AgentUIProvider`, `Screen`, `VStack`, `HStack`, `ZStack`, `Spacer`,
  `Text`, and `Button`.
- The primitive layer is made of thin React Native wrappers and does not import `@expo/ui`, Expo
  Router, React Navigation, MCP SDK, native modules, or old parser assets.
- Shared primitive props cover stable `id`, `intent`, accessibility label, disabled/busy state,
  and default `id` to `testID` mapping.
- `Button` requires a typed stable `id`, maps accessibility role/state/label, and warns in
  development when actionable metadata is empty or unlabeled.
- Semantic registration is a typed provider/runtime boundary whose default runtime is a no-op;
  full semantic registry behavior remains deferred to Stage 3.
- The example app now renders a simple primitive screen through `@agent-ui/core`.

## Verification Commands

- `cmd.exe /c npm.cmd run typecheck --workspaces --if-present`
- `cmd.exe /c npm.cmd run build --workspaces --if-present`
- `cmd.exe /c npm.cmd test --workspaces --if-present`

All three exited `0` in this run.

## Limitations And Follow-Ups

- `@types/react` is not installed. A narrow local type declaration shim was added because this run
  did not have explicit approval to install new packages. Replace it with the proper React type
  dependency in an authorized dependency-management pass.
- Example app typecheck/build/test scripts remain placeholders until app source linking, Expo build
  target configuration, and a React Native test harness are added.

---

# REVIEW REPORT
Reviewer session date: 2026-04-30
Roadmap Phase: Phase 2 - Component Primitives
Product Stage: Stage 2 - Component Primitives
Task status: done with concerns

## Findings

No blocking findings for the `Image`, `Icon`, `Label`, `TextField`, and `SecureField` primitive
cluster.

## Verified

- `packages/core/src` exports the new Stage 2 primitives and their prop types.
- The primitives are React Native wrappers around `Image`, `Text`, `TextInput`, and `View`; core
  does not import `@expo/ui`, Expo Router, React Navigation, MCP SDK, native modules, or icon
  packages.
- `id` continues to map to `testID` by default.
- Non-decorative `Image` and `Icon` warn in development when no accessible label is provided.
- `TextField` and `SecureField` warn in development for missing stable IDs or labels.
- `SecureField` sets `secureTextEntry` and emits redacted semantic value metadata instead of raw
  secure values.
- The semantic runtime remains a typed no-op/deferred boundary; Stage 3 registry behavior was not
  implemented in this Stage 2 task.
- The example app renders the new primitive cluster in the simple example screen.

## Verification Commands

- `cmd /c npm.cmd run typecheck --workspaces --if-present`
- `cmd /c npm.cmd run build --workspaces --if-present`
- `cmd /c npm.cmd test --workspaces --if-present`
- `git diff --check`

All four exited `0` after a minimal TypeScript fix for `exactOptionalPropertyTypes`.

## Limitations And Follow-Ups

- `rg.exe` is still denied by the desktop runner, so this run used PowerShell search fallback. npm
  verification worked and this was not a `RUNNER_SANDBOX_BLOCKER`.
- `@types/react` remains uninstalled; the temporary local React declaration shim should be replaced
  in an authorized dependency-management pass.
- The example app verification scripts remain placeholders.
- `Icon` is dependency-free and renders text/glyph content until a future task chooses an optional
  icon package or adapter mapping.

---

# REVIEW REPORT
Reviewer session date: 2026-04-30
Roadmap Phase: Phase 2 - Component Primitives
Product Stage: Stage 2 - Component Primitives
Task status: done with concerns

## Findings

No blocking findings for the `Scroll`, `List`, `Section`, and `Form` primitive cluster.

## Verified

- `packages/core/src` exports the new Stage 2 primitives and their prop types.
- `Scroll` is a thin React Native `ScrollView` wrapper with `id` to `testID` mapping, accessible
  label passthrough, deferred semantic metadata, and a development warning for missing scroll IDs.
- `List`, `Section`, and `Form` are thin React Native `View` wrappers that preserve authored child
  order and emit deferred list/form hierarchy metadata without implementing Stage 3 tree snapshots.
- `Section` renders string headers/footers inside React Native `Text` and passes custom header/footer
  nodes through without forcing them into text nodes.
- Development warnings cover missing stable IDs or labels for scroll/list/form/section hierarchy.
- Core did not import `@expo/ui`, Expo Router, React Navigation, MCP SDK, native modules, old parser
  assets, or new dependencies.
- The example app now renders a simple settings-style screen using `Scroll`, `List`, `Section`, and
  `Form`.

## Verification Commands

- `cmd /c npm.cmd run typecheck --workspaces --if-present`
- `cmd /c npm.cmd run build --workspaces --if-present`
- `cmd /c npm.cmd test --workspaces --if-present`
- `git diff --check`

All four exited `0`.

## Limitations And Follow-Ups

- `@types/react` remains uninstalled; the temporary local React declaration shim should be replaced
  in an authorized dependency-management pass.
- The example app verification scripts remain placeholders.
- Full semantic tree snapshots, parent-child inspection, duplicate ID detection, and action dispatch
  remain Stage 3 work.

---

# REVIEW REPORT
Reviewer session date: 2026-04-30
Roadmap Phase: Phase 2 - Component Primitives
Product Stage: Stage 2 - Component Primitives / dependency-management review
Task status: dependency blockers fixed with residual concerns

## Findings

1. `BUG` / P1 / fixed: Missing real React typings made workspace automation partially false-green.
   `cmd /c npm.cmd run typecheck --workspaces --if-present` exited `0` only because the example
   app script was a placeholder. A direct `cmd /c npx.cmd tsc --noEmit -p packages/example-app/tsconfig.json`
   failed with JSX children errors on `AgentUIProvider`, `Screen`, `Label`, and `Button`. Fixed by
   adding workspace `@types/react@^19.2.14`, removing the temporary local React declaration shim,
   and changing the example app `typecheck` script to real `tsc`.
2. `BUG` / P1 / fixed: Expo SDK dependencies drifted from the SDK 55 validated set. Expo Doctor
   initially reported `expo` expected `~55.0.18` but found `55.0.17`, and `react-native` expected
   `0.83.6` but found `0.83.9`. A partial install then exposed duplicate React Native versions.
   Fixed by aligning the example app dependencies and core peer ranges to `expo@55.0.18` and
   `react-native@0.83.6`; Expo Doctor now passes all 18 checks.
3. `BUG` / P2 / fixed: Non-decorative `Icon` did not warn when `accessibilityLabel` was omitted
   because the warning path accepted the implementation `name` as a label. Fixed the warning so
   non-decorative icons require an explicit accessible label while preserving the current fallback
   render behavior.
4. `ACTIVE_STAGE_GAP` / P3 / open: The example app `build` and `test` scripts still return
   placeholder success. This is documented, but it still means workspace `build` and `test` do not
   prove an Expo build target or React Native test harness yet.
5. `SECURITY_GAP` / P3 / open: `npm audit --omit=dev --audit-level=moderate` reports moderate
   transitive advisories through Expo CLI/config tooling (`postcss` and `uuid` paths). The suggested
   forced audit fix would downgrade Expo to 49, so this requires a separate dependency/security
   pass rather than automatic remediation.

## Verified

- `cmd /c npm.cmd run typecheck --workspaces --if-present` exited `0`.
- `cmd /c npm.cmd run build --workspaces --if-present` exited `0`.
- `cmd /c npm.cmd test --workspaces --if-present` exited `0`.
- `cmd /c npx.cmd expo-doctor` in `packages/example-app` passed all 18 checks.
- `cmd /c npx.cmd tsc --noEmit -p packages/example-app/tsconfig.json` exited `0`.
- `cmd /c npm.cmd ls expo react react-native @types/react --workspace @agent-ui/example-app --depth=1`
  showed one deduplicated `react-native@0.83.6`, `expo@55.0.18`, `react@19.2.0`, and
  `@types/react@19.2.14`.
- `cmd /c npm.cmd pack --dry-run --workspace @agent-ui/core` completed and included `dist`,
  source, and `package.json`.
- `git diff --check` exited `0`.

## Limitations And Follow-Ups

- `rg.exe` is still unavailable in the desktop runner, so review search used PowerShell
  `Get-ChildItem` / `Select-String` fallback.
- No React Native Testing Library harness exists yet, so primitive behavior was checked by static
  review and TypeScript/build gates rather than rendered component assertions.

---

# REVIEW REPORT
Reviewer session date: 2026-04-30
Roadmap Phase: Phase 2 - Component Primitives
Product Stage: Stage 2 - Component Primitives / dependency and automation follow-up
Task status: remaining review findings fixed

## Findings

1. `ACTIVE_STAGE_GAP` / P3 / fixed: The example app `build` and `test` scripts were placeholders.
   Fixed by making `build` run a native Android Expo export and making `test` run Jest Expo Android
   with a React Native Testing Library smoke test against the example screen.
2. `SECURITY_GAP` / P3 / fixed: The moderate PostCSS advisory remained through Expo
   Metro/config tooling. Fixed with a root npm override to `postcss@8.5.12` after a clean
   dependency install.
3. `SECURITY_GAP` / P3 / fixed: The moderate uuid advisory remained through
   `xcode` / `@expo/config-plugins`. Fixed with a root npm override to `uuid@14.0.0`; a CommonJS
   compatibility probe confirmed `require("uuid").v4` and `xcode.project(...).generateUuid` are
   callable on the repo's Node runtime.
4. `BUG` / P3 / fixed: Clean install exposed a peer conflict because `react-test-renderer` was
   ranged as `^19.2.0`, allowing npm to select `19.2.5` while Expo SDK 55 pins `react@19.2.0`.
   Fixed by pinning `react-test-renderer` to `19.2.0`.
5. `TOOLING_GAP` / P3 / fixed: Newer TypeScript reported inherited `moduleResolution=node10` as
   deprecated in workspace tsconfigs. Fixed by moving the shared config to `module` /
   `moduleResolution` `Node16`.

## Verified

- `cmd /c npm.cmd run typecheck --workspaces --if-present` exited `0`.
- `cmd /c npm.cmd run build --workspaces --if-present` exited `0`.
- `cmd /c npm.cmd test --workspaces --if-present` exited `0`.
- `cmd /c npx.cmd expo-doctor` in `packages/example-app` passed all 18 checks.
- `cmd /c npm.cmd audit --omit=dev --audit-level=moderate` exited `0` with
  `found 0 vulnerabilities`.
- `cmd /c npm.cmd audit --audit-level=moderate` exited `0` with `found 0 vulnerabilities`.
- `git diff --check` exited `0`.

## Limitations And Follow-Ups

- `npm ls --all` reports the audit override packages as outside their original transitive ranges
  in this workspace, even though `npm install` and both audit commands accept the resolved graph.
- Remaining product concerns are Stage 3 boundaries: semantic tree snapshots, duplicate ID
  detection, and action dispatch are still intentionally deferred.

---

# REVIEW REPORT
Reviewer session date: 2026-04-30
Roadmap Phase: Phase 2 - Component Primitives
Product Stage: Stage 2 - Component Primitives / security and dependency-health follow-up
Task status: remaining P2/P3 findings fixed

## Findings

1. `SECURITY_GAP` / P2 / fixed: `AgentUIProvider` previously accepted a supplied runtime outside
   development and deferred primitive registration still called `registerPrimitive` with
   `global.__DEV__ = false`; the shared development helper also treated an absent dev flag as
   development. Fixed by making `isDevelopmentRuntime()` strict on `__DEV__ === true`, making the
   provider expose a no-op runtime outside development, and making deferred primitive registration
   return without registering unless the runtime is development. Permanent React Native Testing
   Library regression tests cover development registration, production fail-closed behavior, and
   absent-flag fail-closed behavior.
2. `TOOLING_GAP` / P3 / fixed: Root audit overrides cleared npm audit but made
   `npm ls --all --include-workspace-root` reject `postcss`, `jsdom`, and `uuid` as invalid
   transitive resolutions. Fixed by adding workspace-root dev dependency anchors for
   `expo@~55.0.18` and `jest-expo@~55.0.16`, which are already workspace tooling packages, so npm
   records the override packages as explicit `overridden` resolutions.
3. `SECURITY_GAP` / P3 / fixed: `@agent-ui/mcp-server` depended on `@modelcontextprotocol/sdk`
   before it implemented or imported MCP tools. Fixed by removing the unused runtime dependency
   from the package shell and updating package-foundation guidance to add the SDK in Stage 5 when
   server code imports it.

## TDD Red/Green Evidence

- Red: focused Jest probes reproduced primitive registration when `global.__DEV__ = false` and
  when the dev flag was absent.
- Green: `packages/example-app/app/agent-ui-provider.test.tsx` now passes with assertions for
  development registration, production no-registration behavior, and absent-flag no-registration
  behavior.
- Typecheck also caught a strict optional-property issue in the new test cleanup; the test now
  deletes `global.__DEV__` when it was originally absent instead of assigning `undefined`.

## Verified

- `cmd /c npm.cmd ci --dry-run` exited `0`.
- `cmd /c npm.cmd run typecheck --workspaces --if-present` exited `0`.
- `cmd /c npm.cmd run build --workspaces --if-present` exited `0`.
- `cmd /c npm.cmd test --workspaces --if-present` exited `0`.
- `cmd /c npm.cmd test --workspace @agent-ui/example-app -- --runInBand` exited `0`.
- `cmd /c npx.cmd expo-doctor` in `packages/example-app` passed all 18 checks.
- `cmd /c npm.cmd audit --omit=dev --audit-level=moderate` exited `0` with
  `found 0 vulnerabilities`.
- `cmd /c npm.cmd audit --audit-level=moderate` exited `0` with `found 0 vulnerabilities`.
- `cmd /c npm.cmd audit signatures` exited `0`; all audited packages had verified registry
  signatures.
- `cmd /c npm.cmd ls --all --include-workspace-root` exited `0`.
- `cmd /c npm.cmd ls postcss uuid jsdom --include-workspace-root` showed `postcss@8.5.12`,
  `uuid@14.0.0`, and `jsdom@23.2.0` as `overridden`.
- `cmd /c npm.cmd ls @modelcontextprotocol/sdk --all` showed an empty dependency tree.
- Package manifest and lockfile scans found no `@modelcontextprotocol/sdk` dependency.
- Forbidden-import scan of `packages/core/src` found no `@expo/ui`, Expo Router,
  React Navigation, MCP SDK, old parser, tree-sitter, WASM, VS Code, or Canvas renderer imports.
- `git diff --check` exited `0`.

## Limitations And Follow-Ups

- Stage 3 semantic tree snapshots, duplicate ID detection, and action dispatch remain intentionally
  deferred.
- Stage 5 should add `@modelcontextprotocol/sdk@1.x` when the MCP server implementation imports it.

---

# REVIEW REPORT
Reviewer session date: 2026-04-30
Roadmap Phase: Cross-stage workflow maintenance
Product Stage: Agent workflow / debugging rules
Task status: debugging rules updated

## Findings

No blocking findings for the TTD/TDD red-green debugging-rule integration.

## Verified

- The repo-local systematic debugging adapter now requires red-green evidence for debugging fixes:
  a failing test/probe/command before the fix and the same check passing after the fix.
- Orchestration, scheduled automation, prompt rotation, review checklist, startup rules, project
  brief, reference index, platform skill routing, platform skill MCP surface, platform skill index,
  and context-prompt-engineering scaffold all point to the same red-green requirement.
- Read-back search of the project rule surfaces found the new TTD/TDD red-green requirement in the
  expected files.
- `git diff --check` exited `0`.

## Limitations And Follow-Ups

- This was a documentation/rule update only; no package source changed for this request.
- Existing dirty package and dependency changes from the prior fix pass are still present in the
  working tree and were not reverted.

---

# REVIEW REPORT
Reviewer session date: 2026-04-30
Roadmap Phase: Cross-stage workflow maintenance
Product Stage: Agent workflow / repository hygiene
Task status: CRLF warning fixed

## Findings

No blocking findings for the line-ending cleanup.

## TDD Red/Green Evidence

- Red: a focused line-ending probe failed because `docs/reference/expo/package-foundation.md`
  contained CRLF line endings.
- Green: the same probe now reports `docs/reference/expo/package-foundation.md` is LF-only.

## Verified

- `git diff --check` exited `0` with no CRLF warning.

## Limitations And Follow-Ups

- This was a line-ending-only cleanup for the documented warning.

---

# REVIEW REPORT
Reviewer session date: 2026-04-30
Roadmap Phase: Phase 2 - Component Primitives
Product Stage: Stage 2 - Component Primitives
Task status: done with concerns

## Findings

No blocking findings for the `Toggle`, `Slider`, `Picker`, and `Stepper` primitive cluster.

## Verified

- `packages/core/src` exports the new Stage 2 control primitives and their prop types.
- `Toggle` wraps React Native `Switch`, maps `id` to `testID`, exposes role `switch`, checked
  accessibility state, and deferred checked semantic metadata.
- `Slider` exposes role `adjustable`, min/max/current accessibility values, increment/decrement
  accessibility actions, range clamping, and deferred range semantic metadata without adding a
  package dependency.
- `Picker` renders stable option rows with radio accessibility state, selected metadata, and stable
  option test IDs.
- `Stepper` exposes adjustable range metadata, visible increment/decrement press targets, and
  clamped range updates.
- Development warnings cover missing stable IDs or accessible labels on the new actionable
  controls, plus invalid picker option IDs/labels.
- Core did not import `@expo/ui`, Expo Router, React Navigation, MCP SDK, native modules, old
  parser assets, tree-sitter, WASM, VS Code, or Canvas renderer code.
- The example app renders the new control cluster and tests stable IDs, roles, checked state,
  selection state, range values, and stepper increment behavior.

## TDD Red/Green Evidence

- Red: workspace typecheck failed because the example app resolved `@agent-ui/core` through stale
  `dist` declarations that did not export the new controls.
- Green: rebuilding `@agent-ui/core` regenerated package output, and the same workspace typecheck
  passed.
- Red: focused example tests failed because `Toggle` was not queryable by role without an explicit
  accessibility element boundary.
- Green: `Toggle` now passes `accessible`, and the same focused test advanced.
- Red: focused example tests failed because hidden stepper press targets were excluded from
  `getByTestId`.
- Green: visible stepper press targets are no longer accessibility-hidden, and the same focused
  example test passed.

## Verification Commands

- `cmd /c npm.cmd run typecheck --workspaces --if-present` exited `0`.
- `cmd /c npm.cmd run build --workspaces --if-present` exited `0`.
- `cmd /c npm.cmd test --workspaces --if-present` exited `0`.
- `git diff --check` exited `0`.
- PowerShell forbidden-import scan of `packages/core/src` returned no matches.

## Limitations And Follow-Ups

- `Slider`, `Picker`, and `Stepper` are dependency-free React Native fallback controls. Optional
  native hosted equivalents belong in Stage 7 adapter work.
- Full semantic tree snapshots, duplicate ID detection, node lookup, and action dispatch remain
  Stage 3 work.

---

# REVIEW REPORT
Reviewer session date: 2026-04-30
Roadmap Phase: Cross-stage workflow maintenance
Product Stage: Agent workflow / runner environment
Task status: runner search tool fixed

## Findings

1. `BLOCKED` / P3 / fixed: `rg` resolved to
   `C:\Program Files\WindowsApps\OpenAI.Codex_26.422.9565.0_x64__2p2nqsd0c76g0\app\resources\rg.exe`,
   and Windows denied process creation from that packaged app resource path. The file itself was
   readable and the same binary executed normally after being copied outside `WindowsApps`, so the
   source issue was command resolution to the packaged resource path rather than a repo source,
   npm, PowerShell, or ripgrep binary defect. Fixed by creating the already-earlier PATH directory
   `C:\Users\Asus\AppData\Local\OpenAI\Codex\bin` and copying `rg.exe` there so `rg` resolves to
   the user-local executable first.

## TTD Red/Green Evidence

- Red: `rg --version` failed with `Access is denied` while resolving to the Codex bundled
  `WindowsApps` resource path.
- Diagnostic: `Get-Command rg -All` and `where.exe rg` showed only the bundled Codex resource
  entries before the fix; `Get-Acl` showed read/execute ACLs; `[System.IO.File]::OpenRead(...)`
  succeeded; copying the same binary to `.tmp-review\rg-copy-test.exe` and running it printed
  `ripgrep 15.1.0`.
- Green: `Get-Command rg -All` now lists
  `C:\Users\Asus\AppData\Local\OpenAI\Codex\bin\rg.exe` first, `rg --version` exits `0`, and
  `rg --files -g package.json` exits `0` with the workspace package manifests.

## Verified

- `rg --version` exited `0`.
- `rg --files -g package.json` exited `0`.
- `where.exe rg` now reports the user-local Codex bin copy before the packaged app resource path.

## Limitations And Follow-Ups

- No package source changed for this runner-environment fix.
- If Codex Desktop changes its PATH layout in a future update, re-run `Get-Command rg -All` before
  assuming the user-local copy still resolves first.

---

# REVIEW REPORT
Reviewer session date: 2026-04-30
Roadmap Phase: Phase 3 - Semantic Runtime
Product Stage: Stage 3 - Semantic Runtime
Task status: done with concerns

## Findings

No blocking findings for the first Stage 3 semantic node schema and registry lifecycle slice.

## Verified

- `packages/core/src/semantic.tsx` defines Stage 3 semantic node, state, value, action, privacy,
  registry, and snapshot contracts.
- `createAgentUISemanticRegistry()` implements the existing primitive registration runtime contract
  without adding dependencies or native/runtime bridge behavior.
- Registered primitives normalize into flat semantic nodes with stable or generated IDs, type,
  label, intent, state, actions, value, privacy metadata, and `children: []`.
- Unregister handles remove only their mounted primitive and are idempotent, including same-ID
  mounts.
- `AgentUIProvider` now creates an internal development registry by default while preserving
  fail-closed no-op behavior outside `__DEV__ === true`.
- Primitive busy state is carried into semantic state for actionable controls.
- `packages/example-app/app/semantic-registry.test.tsx` covers normalization, generated IDs,
  mount-specific unregister, provider unmount cleanup, and production fail-closed behavior.
- Core did not import `@expo/ui`, Expo Router, React Navigation, MCP SDK, native modules, old
  parser assets, tree-sitter, WASM, VS Code, or Canvas renderer code.

## TDD Red-Green Evidence

- Red: workspace typecheck failed because `packages/core/src/semantic.tsx` did not preserve
  TypeScript's optional `primitive.id` narrowing, and the example app still resolved
  `@agent-ui/core` from stale `dist` declarations.
- Green: ID normalization now uses an explicitly narrowed `primitiveId`,
  `cmd /c npm.cmd run build --workspace @agent-ui/core` regenerated declarations, and
  `cmd /c npm.cmd run typecheck --workspaces --if-present` passed.
- Red: after adding busy-state metadata, workspace typecheck failed because the example app again
  saw stale `AgentUISemanticPrimitive` declarations.
- Green: rebuilding `@agent-ui/core` regenerated declarations, and the same workspace typecheck
  passed.

## Verification Commands

- `cmd /c npm.cmd run typecheck --workspaces --if-present` exited `0`.
- `cmd /c npm.cmd test --workspace @agent-ui/example-app -- --runInBand` exited `0`; 3 suites and
  10 tests passed.
- `cmd /c npm.cmd run build --workspaces --if-present` exited `0`; the example app completed an
  Android Expo export to `.tmp-review/android-export`.
- `cmd /c npm.cmd test --workspaces --if-present` exited `0`.
- `git diff --check` exited `0`.
- PowerShell forbidden-import scan of `packages/core/src` returned no matches.
- `rg --version` exited `0`.

## Limitations And Follow-Ups

- The first Stage 3 snapshot is intentionally flat; parent-child hierarchy, screen/modal scoping,
  hidden subtree pruning, and virtualized-list visibility remain future Stage 3 tasks.
- Duplicate ID warnings, node lookup by ID, and runtime action dispatch are still intentionally
  deferred.
- Redaction metadata is carried through schema and primitive value normalization, but bridge/MCP
  serialization redaction enforcement remains future Stage 3/Stage 4 work.

---

# REVIEW REPORT
Reviewer session date: 2026-04-30
Roadmap Phase: Phase 3 - Semantic Runtime
Product Stage: Stage 3 - Semantic Runtime
Task status: done with concerns

## Findings

No blocking findings for the Stage 3 parent-child tree snapshot and duplicate-ID warning slice.

## Verified

- `packages/core/src/semantic.tsx` now reconstructs semantic snapshots as parent-child trees using
  internal mount keys and parent mount metadata rather than public semantic IDs.
- Screen roots preserve screen scope, and descendant nodes inherit the resolved screen scope.
- Default snapshots prune subtrees whose semantic state marks them hidden.
- Development duplicate-ID warnings are scoped by screen, and the same stable ID is allowed in
  different screen scopes.
- Generated ID metadata, generated node counts, mounted node counts, and mount-specific unregister
  behavior are preserved.
- Child-bearing primitives now provide semantic parent boundaries without importing optional
  adapters or future bridge/MCP dependencies.
- `packages/example-app/app/semantic-registry.test.tsx` covers rendered hierarchy, screen scoping,
  hidden pruning, duplicate warnings, and same-ID separate-screen behavior.
- Core did not import `@expo/ui`, Expo Router, React Navigation, MCP SDK, native modules, old
  parser assets, tree-sitter, WASM, VS Code, or Canvas renderer code.

## TDD Red-Green Evidence

- Red: workspace typecheck and the focused example test failed because `semantic.tsx` referenced
  `warnInDevelopment` without importing it, `Form` rendered a semantic boundary without a local
  `mountKey`, and the example app saw stale `@agent-ui/core` declarations.
- Green: importing `warnInDevelopment`, assigning the missing `Form` mount key, and rebuilding
  `@agent-ui/core` made the same commands pass.
- Red: a cleanup patch accidentally removed `mountKey` assignments from `Screen` and then `Stack`;
  the same workspace typecheck and focused example test failed on the missing variables.
- Green: restoring those assignments while leaving `Spacer` as a leaf registration made the same
  commands pass.

## Verification Commands

- `cmd /c npm.cmd run typecheck --workspaces --if-present` exited `0`.
- `cmd /c npm.cmd test --workspace @agent-ui/example-app -- --runInBand` exited `0`; 3 suites and
  14 tests passed.
- `cmd /c npm.cmd run build --workspaces --if-present` exited `0`; the example app completed an
  Android Expo export to `.tmp-review/android-export`.
- `cmd /c npm.cmd test --workspaces --if-present` exited `0`.
- `git diff --check` exited `0`.
- PowerShell forbidden-import scan of `packages/core/src` returned no matches.

## Limitations And Follow-Ups

- Node lookup by ID remains the next unchecked Stage 3 roadmap item.
- Runtime action dispatch remains intentionally deferred to a separate Stage 3 slice.
- Broader redaction enforcement before bridge/MCP serialization remains future Stage 3/Stage 4
  work.

---

# REVIEW REPORT
Reviewer session date: 2026-05-01
Roadmap Phase: Phase 3 - Semantic Runtime
Product Stage: Stage 3 - Semantic Runtime
Task status: done with concerns

## Findings

No blocking findings for the Stage 3 node lookup slice.

## Verified

- `packages/core/src/semantic.tsx` exposes `getNodeById(id, options?)` on the semantic registry.
- Lookup runs over the visible semantic tree, so screen scope is resolved consistently with
  `getSnapshot()` and hidden subtrees are absent by default.
- Lookup supports stable IDs and generated IDs, returns a deep clone, and returns `undefined` for
  missing, empty, hidden, or ambiguous unscoped IDs.
- Screen-scoped lookup can resolve the same stable ID in separate screen scopes without returning
  the wrong node.
- `packages/core/src/index.ts` exports the lookup options type.
- `packages/example-app/app/semantic-registry.test.tsx` covers successful lookup, generated-ID
  lookup, clone isolation, screen disambiguation, hidden subtree pruning, and missing/empty IDs.
- Core did not import `@expo/ui`, Expo Router, React Navigation, MCP SDK, native modules, old
  parser assets, tree-sitter, WASM, VS Code, or Canvas renderer code.

## TDD Red-Green Evidence

- Red: focused Jest failed with five expected lookup failures because `registry.getNodeById` was
  not implemented.
- Green: adding the registry lookup API made the same focused Jest command pass with 3 suites and
  19 tests.
- Red: workspace typecheck failed because strict indexed access kept `matches[0]` possibly
  undefined and the example app resolved stale `@agent-ui/core` declarations.
- Green: narrowing the matched node and rebuilding `@agent-ui/core` made the same workspace
  typecheck pass.

## Verification Commands

- `cmd /c npm.cmd run typecheck --workspaces --if-present` exited `0`.
- `cmd /c npm.cmd test --workspace @agent-ui/example-app -- --runInBand` exited `0`; 3 suites and
  19 tests passed.
- `cmd /c npm.cmd run build --workspaces --if-present` exited `0`; the example app completed an
  Android Expo export to `.tmp-review/android-export`.
- `cmd /c npm.cmd test --workspaces --if-present` exited `0`.
- `git diff --check` exited `0`.
- PowerShell forbidden-import scan of `packages/core/src` returned no matches.

## Limitations And Follow-Ups

- Runtime action dispatch remains the next Stage 3 semantic-runtime task.
- Bridge/MCP tool transport and broader bridge/MCP serialization redaction enforcement remain
  future stages.

---

# REVIEW REPORT
Reviewer session date: 2026-05-01
Roadmap Phase: Phase 3 - Semantic Runtime
Product Stage: Stage 3 - Semantic Runtime
Task status: done with concerns

## Findings

No blocking findings for the Stage 3 runtime action dispatch slice.

## Verified

- `packages/core/src/semantic.tsx` exposes `dispatchAction(id, action, options?)` on the semantic
  registry.
- Dispatch targets the same visible semantic tree used by snapshots and lookup, preserving screen
  scoping and hidden-subtree pruning.
- Dispatch returns structured failures for missing nodes, ambiguous IDs, unsupported actions,
  disabled/busy nodes, missing handlers, and handler failure.
- Local action handlers are stored on mounted records and are not exposed through snapshots or
  lookup nodes.
- Core primitive callback wiring exists for `Button`, `TextField`, `SecureField`, `Toggle`,
  `Slider`, `Picker`, and `Stepper`.
- `packages/core/src/index.ts` exports the dispatch result, handler, and option types.
- `packages/example-app/app/semantic-registry.test.tsx` covers dispatch success, structured
  refusal cases, screen-scoped dispatch, hidden pruning, missing handlers, and rendered primitive
  callback wiring.
- Core did not import `@expo/ui`, Expo Router, React Navigation, MCP SDK, native modules, old
  parser assets, tree-sitter, WASM, VS Code, or Canvas renderer code.

## TDD Red-Green Evidence

- Red: focused Jest failed with five expected `registry.dispatchAction is not a function` failures.
- Green: adding the dispatch API and local handlers made the same focused Jest command pass with 3
  suites and 24 tests.
- Red: workspace typecheck failed because the example app resolved stale built `@agent-ui/core`
  declarations without `dispatchAction` or `actionHandlers`.
- Green: rebuilding `@agent-ui/core` made the same workspace typecheck pass.

## Verification Commands

- `cmd /c npm.cmd run typecheck --workspaces --if-present` exited `0`.
- `cmd /c npm.cmd test --workspace @agent-ui/example-app -- --runInBand` exited `0`; 3 suites and
  24 tests passed.
- `cmd /c npm.cmd run build --workspaces --if-present` exited `0`; the example app completed an
  Android Expo export to `.tmp-review/android-export`.
- `cmd /c npm.cmd test --workspaces --if-present` exited `0`.
- `git diff --check` exited `0`.
- PowerShell forbidden-import scan of `packages/core/src` returned no matches.

## Limitations And Follow-Ups

- Dispatch is local and in-process only. Bridge authorization, token pairing, transport sessions,
  MCP tools, audit logs, and serialized redaction enforcement remain Stage 4 and Stage 5 work.
- Button semantic dispatch invokes existing `onPress` callbacks without a native press event; event
  dependent handlers can fail safely with `ACTION_HANDLER_FAILED`.
- `focus`, `submit`, `scroll`, and passive `observe` metadata can be declared before platform or
  bridge handlers exist; dispatch returns `ACTION_HANDLER_MISSING` until a local handler is wired.

---

# REVIEW REPORT
Reviewer session date: 2026-05-01
Roadmap Phase: Phase 4 - Agent Tool Bridge
Product Stage: Stage 4 - Agent Tool Bridge
Task status: done with concerns

## Findings

No blocking findings for the first Stage 4 bridge protocol and runtime-gate slice.

## Verified

- `packages/core/src/bridge.ts` defines public bridge protocol version, capability, transport-mode,
  execution-environment, config, gate-result, and structured result-code contracts.
- `createAgentUIBridgeGate(config?, options?)` remains pure JS and fail-closed by default.
- Bridge control enables only with explicit `enabled: true`, development mode, known non-standalone
  execution environment, non-empty pairing token, valid WebSocket URL, and accepted URL/transport
  policy.
- Default-disabled, non-development, standalone, unknown execution environment, missing token, LAN
  without unsafe opt-in, and tunnel mode all return structured disabled results.
- `AgentUIProvider` exposes the resolved gate through context and `useAgentUIBridge()` without
  opening a WebSocket, serializing semantic snapshots, or starting MCP tooling.
- Core did not import `expo-constants`, `@expo/ui`, Expo Router, React Navigation, MCP SDK, native
  modules, old parser assets, tree-sitter, WASM, VS Code, or Canvas renderer code.

## TDD Red-Green Evidence

- Red: focused Jest failed with six expected `createAgentUIBridgeGate is not a function` /
  `useAgentUIBridge is not a function` failures.
- Green: adding the bridge module, provider hook, and exports made the same focused Jest command
  pass with 7 tests.
- Red: workspace typecheck failed because the example app resolved stale built `@agent-ui/core`
  declarations without the new bridge exports and provider prop.
- Green: rebuilding `@agent-ui/core` regenerated declarations, and the same workspace typecheck
  passed.

## Verification Commands

- `cmd /c npm.cmd run typecheck --workspaces --if-present` exited `0`.
- `cmd /c npm.cmd test --workspace @agent-ui/example-app -- agent-ui-bridge.test.tsx --runInBand`
  exited `0`; 7 tests passed.
- `cmd /c npm.cmd run build --workspaces --if-present` exited `0`; the example app completed an
  Android Expo export to `.tmp-review/android-export`.
- `cmd /c npm.cmd test --workspaces --if-present` exited `0`; 4 suites and 31 tests passed.
- `git diff --check` exited `0`.
- PowerShell forbidden-import scan of `packages/core/src` returned no matches.

## Limitations And Follow-Ups

- This slice does not open sockets, perform pairing handshakes, validate WebSocket origins,
  maintain sessions, or write audit logs.
- Core intentionally accepts caller-supplied `executionEnvironment` instead of importing Expo
  Constants; the future app/adapter bridge layer must provide that runtime evidence.
- Next Stage 4 work should implement the loopback-first session/heartbeat/event-log contract while
  keeping MCP tools separate until Stage 5.
