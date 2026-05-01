# Repo-Local Platform Skills

This folder vendors the platform and agent-engineering skills that Expo Agent UI agents may load
on demand.

These files are reference material only. They are not package dependencies, runtime code, mobile UI
content, MCP tool schemas, or a replacement for the Stage 8 `skills/expo-agent-ui` deliverable.

## Load Order

1. Read `docs/PROJECT_BRIEF.md`, `docs/reference/INDEX.md`, and the active task state.
2. Read `docs/reference/agent/platform-skill-routing.md`.
3. Open only the repo-local skill below that matches the task.
4. Load the narrowest referenced sub-file inside that skill.
5. Summarize any decision into code, tests, docs, flow assertions, review notes, or patch
   proposals.

## Vendored Skills

| Skill | Local Entrypoint | Use When |
|---|---|---|
| Android ecosystem | `android-ecosystem-skill/SKILL.md` | Android-only scaffold, Jetpack Compose adapter, Material 3, Gradle/AGP, Android performance, Play release. |
| Apple ecosystem | `apple-ecosystem-app-building/SKILL.md` | iOS-only scaffold, SwiftUI adapter, Xcode, SwiftUI/UIKit, Apple performance, App Store release. |
| Native accessibility | `native-accessibility-engineering/SKILL.md` | React Native accessibility, VoiceOver, TalkBack, Dynamic Type, Switch Access, SwiftUI/Compose semantics. |
| Native app design engineering | `native-app-design-engineering/SKILL.md` | Native-feeling polish, motion, haptics, transitions, reduced motion, platform UI feel. |
| Expo | `expo-skill/SKILL.md` | Expo app structure, Expo Router, config plugins, EAS, dev clients, Expo UI, Expo Modules, deployment. |
| Context prompt engineering | `context-prompt-engineering/SKILL.md` | Prompt resources, task notes, agent workflows, handoffs, review notes, validation plans. |
| Systematic debugging | `systematic-debugging/SKILL.md` | Root-cause-first debugging for bugs, test/build failures, blocked verification, runner environment errors, bridge/MCP failures, and flaky async behavior, with TTD/TDD red-green evidence required for fixes. |
| Vercel React Native | `vercel-react-native-skills/SKILL.md` | React Native components, lists, images, animations, native deps, performance, monorepo guidance. |
| Vercel composition patterns | `vercel-composition-patterns/SKILL.md` | Component APIs, provider/context shape, compound components, avoiding boolean prop drift. |

## Source Snapshot

The initial snapshot was copied from:

- `C:\Users\Asus\OneDrive\Desktop\Agent_skills\Custom-skills\android-ecosystem-skill.zip`
- `C:\Users\Asus\OneDrive\Desktop\Agent_skills\Custom-skills\apple-ecosystem-app-building.zip`
- `C:\Users\Asus\OneDrive\Desktop\Agent_skills\Custom-skills\native-accessibility-engineering.zip`
- `C:\Users\Asus\OneDrive\Desktop\Agent_skills\Custom-skills\native-app-design-engineering-skill.zip`
- `C:\Users\Asus\.codex\skills\expo-skill`
- `C:\Users\Asus\.codex\skills\context-prompt-engineering`
- `C:\Users\Asus\.codex\skills\systematic-debugging`
- `C:\Users\Asus\.agents\skills\vercel-react-native-skills`
- `C:\Users\Asus\.codex\skills\vercel-composition-patterns`

Refresh these copies intentionally when the source skills change materially. Do not edit vendored
skill contents casually; prefer updating Agent UI routing notes unless the skill itself needs a
repo-local patch.
