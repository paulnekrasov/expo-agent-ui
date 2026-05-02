# Release Checklist — Expo Agent UI

This document covers the complete release process for the Expo Agent UI monorepo, from
pre-release verification gates through npm publish and post-release validation.

Branch strategy: `codex/` prefix branches -> PR to `master`. Do not commit directly to `master`.

---

## 1. Pre-Release Verification Gates

Every release must pass all gates before version bumping. Run these in order:

### 1.1 TypeScript Typecheck (All Workspaces)

```sh
cmd /c npm.cmd run typecheck --workspaces --if-present
```

**Expected:** Exit code `0`, zero errors across all 5 packages (core, mcp-server, cli, expo-plugin, example-app).

**What this checks:** `tsc --noEmit` against each package's `tsconfig.json`. Catches `exactOptionalPropertyTypes` (TS2379), `noImplicitReturns` (TS7030), missing exports, type mismatches, and module resolution errors.

### 1.2 Build (All Workspaces)

```sh
cmd /c npm.cmd run build --workspaces --if-present
```

**Expected:** Exit code `0`. All 5 packages build successfully.

**What this checks:**
- `packages/core`: `tsc -p tsconfig.json` -> `dist/`
- `packages/mcp-server`: `tsc -p tsconfig.json && node scripts/copy-skills.js` -> `dist/` with 125 skill files in `dist/skills/`
- `packages/cli`: `tsc -p tsconfig.json` -> `dist/`
- `packages/expo-plugin`: `tsc -p tsconfig.json` -> `dist/`
- `packages/example-app`: `expo export --platform android --output-dir .tmp-review/android-export`

| Package | Build Output | Key Files |
|---|---|---|
| `@expo-agent-ui/core` | `dist/` | `index.js`, `index.d.ts` |
| `@expo-agent-ui/mcp-server` | `dist/` | `cli.js`, `index.js`, `dist/skills/` (125 files) |
| `@expo-agent-ui/cli` | `dist/` | `cli.js`, commands directory |
| `@expo-agent-ui/expo-plugin` | `dist/` | `index.js`, `app.plugin.js` (at package root) |
| `@expo-agent-ui/example-app` | `.tmp-review/android-export` | Android export artifacts |

### 1.3 Tests (All Workspaces)

```sh
cmd /c npm.cmd test --workspaces --if-present
```

**Expected:** Exit code `0`, all tests pass across all packages that define a `test` script.

**What this checks:**
- `@expo-agent-ui/example-app`: ~380 tests (semantic runtime, primitives, bridge, motion, native adapters, flows, patching)
- `@expo-agent-ui/mcp-server`: ~55 tests (listener, server, platform skills, tools, native preview)
- `@expo-agent-ui/cli`: ~22 tests (export-maestro, maestro-run, maestro-heal)
- `@expo-agent-ui/core` and `@expo-agent-ui/expo-plugin`: typecheck-only (no runtime test script defined)

### 1.4 Security Audit

```sh
cmd /c npm.cmd audit --audit-level=moderate
```

**Expected:** Exit code `0`, zero vulnerabilities at moderate or higher severity.

```sh
cmd /c npm.cmd audit signatures
```

**Expected:** All installed packages have verified registry signatures.

### 1.5 Git Diff Check

```sh
git diff --check
```

**Expected:** Exit code `0`. No whitespace errors (trailing whitespace, conflict markers, CRLF mismatches).

### 1.6 Skill Validation

```sh
node skills/expo-agent-ui/scripts/validate-skill.js
```

**Expected:** Exit code `0`, zero errors. Warnings are informative and do not block release.

**What this checks:**
- All required files present (SKILL.md, 5 references, 2 examples, flow.json, validate-semantic-ids.js)
- SKILL.md YAML frontmatter valid (name, description fields)
- Progressive disclosure: body between 30 and 500 lines, references have adequate content
- Prohibited patterns: no tree-sitter, SwiftUI parser, Canvas renderer, VS Code extension references
- flow.json structure valid: flow object, valid step types, no raw card numbers or CVV values
- Reference links in SKILL.md resolve to existing files
- Example screens have semantic IDs and AgentUIProvider

### 1.7 Package Graph Verification

```sh
cmd /c npm.cmd ls --all --include-workspace-root
```

**Expected:** Exit code `0`, correct dependency graph.

**Verify:**
- `@expo-agent-ui/mcp-server` depends on `@expo-agent-ui/core`
- `@expo-agent-ui/cli` depends on `@expo-agent-ui/mcp-server`
- `@expo-agent-ui/example-app` depends on `@expo-agent-ui/core`
- `@expo-agent-ui/expo-plugin` has no inter-package dependencies

---

## 2. Version Bump Procedure

### 2.1 Semver Decisions

Follow semver strictly for each package independently:

| Change Type | Semver |
|---|---|
| Breaking API changes (removed exports, changed function signatures, renamed tools) | Major |
| New features (new components, new MCP tools, new CLI commands) | Minor |
| Bug fixes, docs, internal refactors | Patch |

**Current status:** All packages are at version `0.1.0` and have been published.

### 2.2 Per-Package Version Bump

Each package's `version` field must be updated individually:

| Package | File | Current |
|---|---|---|
| `@expo-agent-ui/core` | `packages/core/package.json` | `"0.1.0"` |
| `@expo-agent-ui/mcp-server` | `packages/mcp-server/package.json` | `"0.1.0"` |
| `@expo-agent-ui/cli` | `packages/cli/package.json` | `"0.1.0"` |
| `@expo-agent-ui/expo-plugin` | `packages/expo-plugin/package.json` | `"0.1.0"` |

**Inter-package dependency versions:** When bumping, update the `dependencies` field in dependents:
- `packages/mcp-server/package.json`: `"@expo-agent-ui/core": "0.1.0"`
- `packages/cli/package.json`: `"@expo-agent-ui/mcp-server": "0.1.0"`
- `packages/example-app/package.json`: `"@expo-agent-ui/core": "0.1.0"`

**Comment format for version commits:**
```text
Stage 10 (Publish): bump @expo-agent-ui/core to 0.1.0
Stage 10 (Publish): bump @expo-agent-ui/mcp-server to 0.1.0
Stage 10 (Publish): bump @expo-agent-ui/cli to 0.1.0
Stage 10 (Publish): bump @expo-agent-ui/expo-plugin to 0.1.0
```

---

## 3. Changelog Generation

Create or update `CHANGELOG.md` at the repo root. For each released version:

### What to Include

- **Breaking changes:** Removed exports, renamed APIs, changed tool schemas, modified peer dependency ranges.
- **New features:** New primitives, new MCP tools, new CLI commands, new skill references, new flow step types.
- **Fixes:** Bug fixes with the error code or symptom resolved.
- **Known issues:** Deferred concerns carried forward (e.g., native adapter stubs, Maestro CLI gate, placeholders).

### Template

```markdown
## [0.1.0] - YYYY-MM-DD

### Added
- `@expo-agent-ui/core`: 19 SwiftUI-inspired component primitives with semantic registration
- `@expo-agent-ui/core`: semantic runtime with tree inspection, state snapshots, redacted values
- `@expo-agent-ui/core`: local agent tool bridge (WebSocket, pairing token, dev gate)
- `@expo-agent-ui/core`: Reanimated motion presets (spring, timing, transitions, gestures)
- `@expo-agent-ui/core`: native adapter contracts (SwiftUI tier 2, Compose tier 3)
- `@expo-agent-ui/core`: flow runner engine (7 step types, timeout, approval gates)
- `@expo-agent-ui/core`: patch proposal types (5 change kinds)
- `@expo-agent-ui/mcp-server`: stdio MCP server (13 tools, 13 resources, 6 prompts)
- `@expo-agent-ui/mcp-server`: platform skill resources (125 files in dist/skills/)
- `@expo-agent-ui/cli`: Maestro YAML export, run, heal commands
- `@expo-agent-ui/expo-plugin`: Expo config plugin shell
- `skills/expo-agent-ui/`: reusable agent skill with 5 references, 2 examples, flow.json

### Known Issues
- Native adapter detection returns `false` (no `@expo/ui` installed)
- `compareNativePreviews` returns placeholder (requires 2+ native sessions)
- `runMaestroFlow` returns `MAESTRO_UNAVAILABLE` (Maestro CLI not installed)
- Flow runner StepDispatcher is a contract type (per-step bridge dispatch deferred)
```

---

## 4. npm Publish Steps

Publish order is critical: core first, then dependents.

### 4.1 Publish `@expo-agent-ui/core`

```sh
cmd /c npm.cmd publish --access public --workspace=@expo-agent-ui/core
```

**Pre-flight checks for core:**
- `packages/core/dist/` exists and is current (run build first).
- `packages/core/src/` is included in `files` field.
- `peerDependencies` are correct: expo `~55.0.18`, react `19.2.0`, react-native `0.83.6`, react-native-reanimated `^4.0.0`, react-native-worklets `^0.8.0`.
- `peerDependenciesMeta` marks reanimated and worklets as optional.

### 4.2 Publish `@expo-agent-ui/mcp-server`

```sh
cmd /c npm.cmd publish --access public --workspace=@expo-agent-ui/mcp-server
```

**Pre-flight checks for mcp-server:**
- `packages/mcp-server/dist/` exists and is current.
- `packages/mcp-server/dist/skills/` exists with 125 skill files. Verify:
  ```sh
  dir packages\mcp-server\dist\skills /s /b | find /c "\"
  ```
  Should report at least 125 files.
- `bin` entry `agent-ui-mcp` points to `dist/cli.js`.
- `files` includes both `dist` and `dist/skills`.
- Dependency `@expo-agent-ui/core` version matches the published core version.

### 4.3 Publish `@expo-agent-ui/cli`

```sh
cmd /c npm.cmd publish --access public --workspace=@expo-agent-ui/cli
```

**Pre-flight checks for cli:**
- `packages/cli/dist/` exists and is current.
- `bin` entry `agent-ui` points to `dist/cli.js`.
- Dependency `@expo-agent-ui/mcp-server` version matches the published mcp-server version.
- Commands subdirectory included in dist.

### 4.4 Publish `@expo-agent-ui/expo-plugin`

```sh
cmd /c npm.cmd publish --access public --workspace=@expo-agent-ui/expo-plugin
```

**Pre-flight checks for expo-plugin:**
- `packages/expo-plugin/dist/` exists and is current.
- `packages/expo-plugin/app.plugin.js` exists at package root (required by Expo config plugin convention).
- `files` includes both `dist`, `src`, and `app.plugin.js`.
- `peerDependencies` declare `expo: ^55.0.0`.

### 4.5 Do Not Publish `@expo-agent-ui/example-app`

The example app is `"private": true` and must not be published. Verify:
```sh
cmd /c npm.cmd publish --dry-run --workspace=@expo-agent-ui/example-app
```
Should exit with error (private package cannot be published).

---

## 5. Package Files Check

Before publishing each package, verify these files exist:

| Package | Required Files |
|---|---|
| `@expo-agent-ui/core` | `dist/index.js`, `dist/index.d.ts`, `package.json`, `src/` |
| `@expo-agent-ui/mcp-server` | `dist/index.js`, `dist/cli.js`, `dist/skills/` (125 files), `package.json`, `src/` |
| `@expo-agent-ui/cli` | `dist/index.js`, `dist/cli.js`, `dist/commands/` (3 files), `package.json`, `src/` |
| `@expo-agent-ui/expo-plugin` | `dist/index.js`, `dist/index.d.ts`, `app.plugin.js`, `package.json`, `src/` |

**Check command for each package:**
```sh
cmd /c npm.cmd pack --dry-run --workspace=@expo-agent-ui/core
cmd /c npm.cmd pack --dry-run --workspace=@expo-agent-ui/mcp-server
cmd /c npm.cmd pack --dry-run --workspace=@expo-agent-ui/cli
cmd /c npm.cmd pack --dry-run --workspace=@expo-agent-ui/expo-plugin
```

---

## 6. Git Tag Format

After publishing all packages, create a single annotated tag for the release:

```sh
git tag -a v0.1.0 -m "Expo Agent UI v0.1.0: initial publish"
git push origin v0.1.0
```

**Tag naming:** `vX.Y.Z` matching the semver version published for all packages.

**When versions diverge across packages, tag the highest version number.** Add a note in tag message listing per-package versions.

---

## 7. GitHub Release Notes Template

Create a GitHub release at `https://github.com/paulnekrasov/swiftui-parser/releases/new` with tag `v0.1.0`.

### Title
```
Expo Agent UI v0.1.0
```

### Body Template

```markdown
## Packages

| Package | Version | npm |
|---|---|---|
| `@expo-agent-ui/core` | 0.1.0 | `npm install @expo-agent-ui/core` |
| `@expo-agent-ui/mcp-server` | 0.1.0 | `npm install @expo-agent-ui/mcp-server` |
| `@expo-agent-ui/cli` | 0.1.0 | `npm install @expo-agent-ui/cli` |
| `@expo-agent-ui/expo-plugin` | 0.1.0 | `npm install @expo-agent-ui/expo-plugin` |

## Highlights

- **19 component primitives** — SwiftUI-inspired VStack, HStack, ZStack, Text, Button, TextField, Toggle, Slider, Picker, Scroll, List, Section, Form, and more
- **Semantic runtime** — stable semantic IDs, tree inspection, state snapshots, redacted sensitive values
- **Agent tool bridge** — local WebSocket bridge with pairing token auth and dev-only gate
- **MCP server** — 13 tools (inspectTree, getState, tap, input, observeEvents, waitFor, scroll, navigate, runFlow, proposePatch, and 4 skill-context tools), 13 resources, 6 prompts
- **Flow runner** — 7 step types, approval gates, timeout, per-step results
- **Maestro integration** — YAML export, run, and self-healing commands via CLI
- **Motion layer** — Reanimated presets (spring, bouncy, snappy, easeInOut), transitions, reduced motion support
- **Native adapters** — SwiftUI (tier 2) and Jetpack Compose (tier 3) contracts with capability flags
- **Agent skill** — reusable skill with 5 references, 2 example screens, flow.json, validation scripts

## Quick Install

```sh
npx expo install @expo-agent-ui/core react-native-reanimated react-native-worklets
npx @expo-agent-ui/cli init
```

## MCP Setup

```json
{
  "mcpServers": {
    "agent-ui": {
      "command": "npx",
      "args": ["@expo-agent-ui/mcp-server"]
    }
  }
}
```

## Known Issues

- Native adapter detection returns `false` (no `@expo/ui` installed in workspace)
- `compareNativePreviews` returns placeholder (requires 2+ active native runtime sessions)
- `runMaestroFlow` returns `MAESTRO_UNAVAILABLE` (Maestro CLI not installed)
- Flow runner `StepDispatcher` is a contract type (per-step bridge dispatch deferred)

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for full details.
```

---

## 8. Post-Release Verification

### 8.1 Install from Registry

```sh
mkdir /tmp/agent-ui-smoke-test && cmd /c cd /tmp/agent-ui-smoke-test && npm init -y
npm install @expo-agent-ui/core @expo-agent-ui/mcp-server @expo-agent-ui/cli @expo-agent-ui/expo-plugin
```

### 8.2 Smoke Test — Core

```sh
node -e "const core = require('@expo-agent-ui/core'); console.log('Core loaded:', core.agentUICorePackage);"
```

**Expected:** Prints `Core loaded: @expo-agent-ui/core`.

### 8.3 Smoke Test — MCP Server

```sh
node -e "const mcp = require('@expo-agent-ui/mcp-server'); console.log('MCP loaded:', typeof mcp.createAgentUIMcpServer);"
```

**Expected:** Prints `MCP loaded: function`.

```sh
npx agent-ui-mcp --help
```

**Expected:** Help text, exit code `0`.

### 8.4 Smoke Test — CLI

```sh
npx agent-ui --help
```

**Expected:** Help text, exit code `0`.

### 8.5 Verify Platform Skills Are Bundled

```sh
node -e "
const path = require('path');
const fs = require('fs');
const pkg = require('@expo-agent-ui/mcp-server/package.json');
const skillsDir = path.join(path.dirname(require.resolve('@expo-agent-ui/mcp-server')), 'skills');
const count = fs.readdirSync(skillsDir, { recursive: true }).length;
console.log('Skills bundled:', count, 'files');
"
```

**Expected:** `Skills bundled: 125 files` (or higher).

---

## 9. Branch Strategy

### 9.1 Working Branches

Use the `codex/` branch prefix for all development work. The current rebuild branch is `codex/expo-agent-ui-rebuild`.

**Creating a release branch:**
```sh
git checkout codex/expo-agent-ui-rebuild
git checkout -b codex/expo-agent-ui-release-0.1.0
```

### 9.2 PR to Master

1. Push the release branch:
   ```sh
   git push -u origin codex/expo-agent-ui-release-0.1.0
   ```
2. Create a PR via GitHub from `codex/expo-agent-ui-release-0.1.0` to `master`.
3. PR title: `Release: Expo Agent UI v0.1.0`
4. Include the release notes body in the PR description.
5. After review, merge with a merge commit (not squash, not rebase, to preserve the tag history).
6. After merge, push the tag to `master`:
   ```sh
   git checkout master
   git pull
   git tag -a v0.1.0 -m "Expo Agent UI v0.1.0"
   git push origin v0.1.0
   ```

### 9.3 Never Commit Directly to Master

All changes flow through PRs from `codex/`-prefixed branches.

---

## 10. Commit Message Format

Use stage-scoped commit messages that match the roadmap checklist:

```text
Stage 10 (Publish): add troubleshooting guide and release checklist
Stage 10 (Publish): bump all packages to 0.1.0
Stage 10 (Publish): add CHANGELOG.md for v0.1.0
Stage 10 (Publish): add GitHub release notes
```

**Format:** `Stage <N> (<Label>): <description>`

| Stage | Label |
|---|---|
| 0 | Reset / Cleanup |
| 1 | Package |
| 2 | Primitives |
| 3 | Semantic Runtime |
| 4 | Bridge |
| 5 | MCP |
| 6 | Motion |
| 7 | Adapter |
| 8 | Skill |
| 9 | Flow Runner / Patch / Preview |
| 10 | Publish |

---

## Release Checklist Summary

- [ ] `cmd /c npm.cmd run typecheck --workspaces --if-present` — passes
- [ ] `cmd /c npm.cmd run build --workspaces --if-present` — passes
- [ ] `cmd /c npm.cmd test --workspaces --if-present` — passes
- [ ] `cmd /c npm.cmd audit --audit-level=moderate` — 0 vulns
- [ ] `git diff --check` — clean
- [ ] `node skills/expo-agent-ui/scripts/validate-skill.js` — 0 errors
- [ ] `cmd /c npm.cmd ls --all --include-workspace-root` — correct graph
- [ ] Version bump per package (`packages/*/package.json`)
- [ ] Inter-package dependency versions updated
- [ ] `CHANGELOG.md` written
- [ ] `npm pack --dry-run` per package — correct files
- [ ] Publish core, then mcp-server, cli, expo-plugin (in order)
- [ ] Git tag `vX.Y.Z` created and pushed
- [ ] GitHub release created with notes
- [ ] Post-release smoke test (install from registry, require each package)
- [ ] `dist/skills/` verified in published mcp-server tarball
- [ ] PR from `codex/` branch to `master`
