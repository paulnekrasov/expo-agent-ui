# Maestro Semantic Flow Adapter

Status: planning reference
Access date for external-source claims: 2026-05-01

## Goal

Make Agent UI semantic flows exportable and runnable through Maestro without making Maestro a
required runtime dependency. Agent UI owns semantic understanding, flow authoring, redaction, and
healing proposals. Maestro owns native device execution, view hierarchy inspection, screenshots,
recordings, and CI/cloud execution when a project explicitly opts in.

## Non-Goals

- Do not replace the Agent UI semantic runtime or bridge with Maestro.
- Do not make Maestro, Maestro Cloud, Revyl, Appium, Detox, BrowserStack, Sauce, Applitools,
  Sherlo, or any visual provider a `packages/core` dependency.
- Do not use screenshots, coordinates, or visible text as the primary agent-control model.
- Do not silently fall back from semantic IDs to coordinates.
- Do not auto-upload recordings, screenshots, logs, or flow results to any cloud service.
- Do not implement Revyl as a dependency or require its cloud device farm.
- Do not expose Maestro-specific runtime behavior before Stage 4 bridge and Stage 5 MCP safety
  gates exist.

## Current External Tool Facts

Maestro is the preferred first external execution adapter because it is open source under Apache
2.0, supports React Native and Expo/EAS workflows, runs against compiled apps without app
instrumentation, and maps React Native `testID` values to Maestro `id` selectors. Maestro also
ships an MCP server through `maestro mcp`, with tools for device management, app launch, hierarchy
inspection, screenshots, flow execution, and command-level interactions.

Maestro Studio provides the useful authoring pattern to borrow: visual element selection,
automatic YAML generation, and interactive command execution. Maestro AI analysis exists, but it
routes through Maestro Cloud authentication, so Agent UI must not depend on it for local-first
flow generation.

Expo EAS Workflows provides pre-packaged `maestro` and `maestro-cloud` jobs. The local Agent UI
default should be Maestro CLI / Maestro MCP. EAS and Maestro Cloud are optional later lanes for
teams that already choose those services.

Revyl is useful as a UX reference, not as a dependency. The patterns to borrow locally are
natural-language flow authoring, step-level replay, visual editing with YAML sync, reusable flow
modules, self-healing suggestions, and unified reports. The parts to avoid are paid cloud lock-in,
proprietary agent orchestration, and mandatory remote device infrastructure.

## Layer Placement

| Layer | Responsibility |
|---|---|
| `packages/core` | Emit stable semantic IDs, accessibility props, `testID`, actions, state, privacy metadata, and event data. No Maestro imports. |
| `packages/mcp-server` | Expose Agent UI semantic MCP tools. Later, expose flow-generation and healing tools that can work with generated Maestro YAML, but keep runtime-control tools separate from external runner tools. |
| Future `packages/maestro-adapter` | Compile canonical Agent UI semantic flows to Maestro YAML, validate selectors, parse Maestro outputs, and produce healing proposals. This package may require the external `maestro` CLI or declare a narrow optional peer/peer-like dependency if an official Node package exists. |
| `packages/cli` | Provide commands such as `agent-ui export maestro`, `agent-ui maestro run`, `agent-ui maestro heal`, and `agent-ui replay`. Commands must fail gracefully when Maestro is not installed. |
| `skills/expo-agent-ui` | Teach agents to inspect the semantic tree first, generate canonical flows, export Maestro YAML, run Maestro optionally, and interpret failures safely. |

Do not put Maestro code in the app bundle. The app should be unaware of Maestro except for the
normal React Native `testID` and accessibility props already emitted by Agent UI primitives.

## Canonical Flow Source Of Truth

Agent UI flows stay canonical as semantic JSON. Maestro YAML is an export target.

```ts
type AgentUIFlow = {
  schemaVersion: "agentui.flow.v0";
  name: string;
  description?: string;
  app?: {
    appId?: string;
    expoGoUrl?: string;
    buildProfile?: string;
  };
  steps: AgentUIFlowStep[];
  privacy?: {
    redactionPolicy: "strict" | "fixture";
    uploadAllowed: boolean;
  };
};

type AgentUIFlowStep =
  | { kind: "launch"; mode: "expoGo" | "developmentBuild" | "standalone" }
  | { kind: "tap"; id: string; intent?: string; assertAfter?: AgentUIAssertion[] }
  | { kind: "input"; id: string; valueRef: string; submit?: boolean; assertAfter?: AgentUIAssertion[] }
  | { kind: "assertVisible"; id: string; label?: string }
  | { kind: "assertState"; id: string; state: Record<string, unknown> }
  | { kind: "waitFor"; id?: string; condition: string; timeoutMs?: number }
  | { kind: "scrollUntilVisible"; containerId?: string; targetId: string }
  | { kind: "snapshot"; name: string; cropToId?: string; ignoreIds?: string[] };
```

Flow authoring rules:

- Generate semantic flow JSON from the Agent UI semantic tree first.
- Compile to Maestro YAML only after the flow validates against current semantic metadata.
- Preserve every semantic ID in generated comments or metadata so failures can map back to Agent
  UI nodes.
- Never export raw secure input values. Use `valueRef` names, environment variables, or fixture
  values that are explicitly allowed by the redaction policy.
- Treat generated YAML as disposable output. The semantic flow and evidence bundle are the durable
  Agent UI artifacts.

## Semantic-To-Maestro Mapping

| Agent UI semantic step | Maestro export |
|---|---|
| `launch` with Expo Go | `openLink` to the development URL. Expo Go cannot use the app's own `appId` with `launchApp`. |
| `launch` with development/standalone build | `launchApp` with the bundle ID or package name. |
| `tap` by `id` | `tapOn: { id: "<semanticId>" }` |
| `input` by `id` | `tapOn: { id: "<semanticId>" }` followed by `inputText` or the best supported text-entry command for the target field. |
| `assertVisible` by `id` | `assertVisible: { id: "<semanticId>" }` |
| `waitFor` by `id` | Maestro wait/assert commands around the same `id`, with explicit timeout where supported. |
| `scrollUntilVisible` | `scrollUntilVisible` targeting `{ id: "<targetSemanticId>" }`; use visible text only as a secondary diagnostic selector. |
| `snapshot` with `cropToId` | `takeScreenshot` or `assertScreenshot` with a semantic-region crop where the target runner supports it. |

Selector rules:

- Prefer `id` selectors generated from Agent UI semantic IDs.
- Visible text is allowed only for human-facing assertions or exploratory flow drafts.
- `point` selectors are diagnostic fallback only and must be labelled as such in reports.
- Generated IDs must stay stable, unique, non-localized, and free of secrets or user data.

## Unified MCP Experience

The first integration should use two MCP servers side by side:

```json
{
  "mcpServers": {
    "agent-ui": {
      "command": "npx",
      "args": ["-y", "@agent-ui/mcp-server"]
    },
    "maestro": {
      "command": "maestro",
      "args": ["mcp"]
    }
  }
}
```

Agent workflow:

1. Use Agent UI MCP tools to inspect semantic sessions, screens, nodes, state, actions, privacy,
   and events.
2. Generate a canonical Agent UI flow from semantic IDs and intents.
3. Export the canonical flow to Maestro YAML.
4. Use Maestro MCP or CLI to launch the app, run the flow, capture screenshots/video/logs, and
   inspect the native hierarchy when needed.
5. Use Agent UI tools again to compare the failure or result against the semantic tree.
6. Produce a healing proposal or report with redacted evidence.

Do not build a nested Maestro MCP proxy into Agent UI until there is a proven client limitation.
A facade mode can be a later compatibility option, but the default should keep Agent UI and
Maestro as separate local MCP servers with clear tool ownership.

## Self-Healing Strategy

Self-healing is a proposal engine, not silent mutation.

Failure handling order:

1. Re-read the latest Agent UI semantic tree.
2. Check whether the failed `id` still exists on the same `screen`.
3. If missing, search candidates by `intent`, `type`, allowed `actions`, `label`, `screen`,
   nearby tree position, and recently unmounted nodes.
4. Inspect the Maestro hierarchy if the semantic tree and native hierarchy disagree.
5. Return a structured proposal:

```json
{
  "status": "PROPOSED",
  "failedStep": 4,
  "oldSelector": { "id": "checkout.pay" },
  "candidateSelector": { "id": "checkout.submitPayment" },
  "confidence": 0.91,
  "evidence": {
    "sameScreen": true,
    "sameIntent": true,
    "sameRole": "button",
    "sameAction": "tap",
    "labelChanged": true
  },
  "requiresHumanApproval": true,
  "reason": "Network/payment side-effect step cannot be auto-healed."
}
```

Auto-apply may be allowed only for non-mutating assertions at very high confidence. Taps, input,
network, payment, auth, destructive, and submit actions require explicit human approval.

## Revyl-Inspired Local Features

Borrow these UX patterns without depending on Revyl:

- Natural-language flow generation: agent converts a goal such as "build checkout flow" into a
  canonical semantic flow by inspecting Agent UI metadata.
- Visual flow replay: local report shows each step, semantic tree revision, Maestro command,
  result, screenshot path, log summary, and redacted event evidence.
- Visual editor with YAML sync: later DevTools/editor surface lets a developer select a semantic
  node and insert `tapOn`, `assertVisible`, or a canonical flow step.
- Reusable modules: semantic flows can call smaller flow files such as login, onboarding, and
  checkout address.
- Self-healing suggestions: reports explain why a selector failed and propose ID/intent-based
  fixes rather than hiding the change.
- Unified reporting: merge Agent UI semantic events with Maestro command output, screenshots,
  videos, and JUnit-style reports in a local evidence bundle.

## Stage Placement

- Stage 4: ensure bridge sessions expose semantic tree revisions, action metadata, event logs,
  and enough runtime/session metadata for later flow recording.
- Stage 5: document side-by-side Agent UI MCP and Maestro MCP usage. Add Agent UI MCP prompts or
  read-only helpers for semantic flow drafting only after the backing flow schema exists.
- Stage 8: teach the `skills/expo-agent-ui` skill how to generate semantic flows, export Maestro
  YAML, run Maestro optionally, and interpret failures safely.
- Stage 9: implement canonical semantic flows, Maestro export, local replay/evidence bundles,
  self-healing proposals, and optional CLI execution.
- Stage 10: document installation, optional Maestro setup, MCP config snippets, EAS workflow
  examples, troubleshooting, and privacy warnings.

## Implementation Gates

- Stage 3 node lookup by ID and runtime action dispatch must exist before reliable flow authoring.
- Stage 4 bridge redaction must run before semantic snapshots, logs, or events leave the app.
- Stage 5 MCP must keep stdout protocol-clean and expose only implemented capabilities.
- Fixture apps must prove Agent UI `testID` values are targetable as Maestro `id` selectors on
  iOS and Android before docs call Maestro export supported.
- Expo Go and compiled builds must have separate launch templates.
- Maestro adapter commands must fail with a clear `MAESTRO_UNAVAILABLE` diagnostic when the CLI
  or MCP server is not installed.
- Cloud execution must remain opt-in and must require `uploadAllowed: true` plus redacted
  evidence bundles.

## Source Index

- Maestro MCP Server: https://docs.maestro.dev/get-started/maestro-mcp
- Maestro React Native support: https://docs.maestro.dev/get-started/supported-platform/react-native
- Maestro core selectors: https://docs.maestro.dev/reference/selectors/core-selectors
- Maestro Studio overview: https://docs.maestro.dev/maestro-studio
- Maestro AI test analysis: https://docs.maestro.dev/maestro-flows/workspace-management/ai-test-analysis
- Expo EAS Workflows syntax, including Maestro jobs: https://docs.expo.dev/eas/workflows/syntax/
- Maestro GitHub repository and license: https://github.com/mobile-dev-inc/maestro
- Revyl product and docs, used only as UX reference: https://www.revyl.com/ and
  https://docs.revyl.ai/platform/Creating-New-Test

## Final Recommendation

Treat Maestro as Agent UI's first optional native execution adapter. Keep Agent UI semantic flows
as the source of truth, export Maestro YAML from stable semantic IDs, run Maestro through its MCP
server or CLI only when installed, and keep all Revyl-inspired authoring, replay, and self-healing
features local-first and redaction-gated.
