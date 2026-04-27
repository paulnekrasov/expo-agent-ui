# Expo Agent UI Research Prompt Library

Status: research prompt library
Created: 2026-04-26
Source plan: `docs/agents/EXPO_AGENT_SKILL_REBUILD_PLAN.md`

These prompts are copy-paste ready for dedicated research agents. They convert the
`New Knowledge Needed` section of the rebuild plan into bounded research tasks.

Use them before implementing the Expo Agent UI rebuild. The prompts are intentionally
detailed because the target APIs are current, moving surfaces. Researchers must verify
against primary sources and must not rely on model memory.

## How To Use

1. Run high-priority prompts first.
2. Run medium-priority prompts only after the high-priority findings are captured.
3. Run low-priority prompts as future-facing research, not MVP blockers.
4. Save each result to the output path named inside the prompt.
5. Distill important findings into the new reference router when the repo reset begins.

## Prompt Inventory

### Coordinator

- `RESEARCH-COORDINATOR.md`
  Runs the full research sequence, assigns prompts, checks outputs, and tracks remaining gaps.

### High Priority

- `HIGH-01-expo-package-foundation.md`
  Expo SDK, package compatibility, config plugin layout, Expo Modules API, managed/bare workflow.
- `HIGH-02-expo-ui-swiftui-adapter.md`
  `@expo/ui/swift-ui` API surface, modifiers, `Host`, platform support, optional peer strategy.
- `HIGH-03-reanimated-motion-layer.md`
  Reanimated 4, worklets, gestures, layout transitions, reduced motion, SwiftUI-style preset mapping.
- `HIGH-04-react-native-accessibility-semantics.md`
  React Native accessibility semantics as the foundation for machine-readable UI metadata.
- `HIGH-05-agent-bridge-mcp-transport.md`
  Expo MCP, MCP TypeScript SDK, and local app-runtime-to-agent transport architecture.

### Medium Priority

- `MEDIUM-01-navigation-adapters.md`
  Expo Router and React Navigation integration for semantic navigation tools.
- `MEDIUM-02-testing-devtools-automation.md`
  React Native DevTools, React Native Testing Library, Maestro, Detox, Appium, and flow validation.
- `MEDIUM-03-security-privacy-agent-control.md`
  Development-only gates, local tool security, allowlisted actions, redaction, and secret exposure.

### Low Priority

- `LOW-01-cross-platform-adapters.md`
  Jetpack Compose through Expo UI, Android strategy, and Web/DOM adapter options.
- `LOW-02-figma-design-system-import.md`
  Figma/design-system import as a future layer over Agent UI primitives.
- `LOW-03-cloud-flows-visual-comparison.md`
  Cloud flow recording, replay, screenshots, and visual comparison as post-MVP capabilities.

## Shared Research Rules

Every prompt repeats its own rules, but these are the global defaults:

- Use official documentation first.
- Use package source, release notes, and typed APIs as secondary primary sources.
- Use reputable third-party sources only for gaps, and label them as secondary.
- Include citations for every claim that could change.
- Record exact dates, package versions, and source URLs.
- Mark uncertain conclusions as `NEEDS_VERIFICATION`.
- Do not edit production source code during research.
- Do not produce a raw link dump. Distill into implementation decisions.
- End with one status token: `DONE`, `DONE_WITH_CONCERNS`, `NEEDS_CONTEXT`, or `BLOCKED`.
