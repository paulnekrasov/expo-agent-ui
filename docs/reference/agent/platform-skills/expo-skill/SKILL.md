---
name: expo-skill
description: General Expo app engineering guidance for building, debugging, upgrading, styling, data fetching, API routes, custom native modules, EAS workflows, development builds, store deployment, OTA update health, and Expo UI integrations. Use when Codex is working in an Expo, Expo Router, React Native, EAS, or Expo Modules codebase, or when the user asks for Expo-specific implementation, migration, CI/CD, deployment, or native UI help.
---

# Expo Skill

Use this skill as the entry point for Expo work. Start with the project shape, then load only the reference files that match the task.

Source references were mirrored from `https://skills.sh/expo/skills` and `https://github.com/expo/skills` on 2026-04-29.

## First Pass

Inspect the project before making Expo decisions:

- `package.json` for Expo SDK, React Native version, scripts, package manager, and libraries.
- `app.json`, `app.config.*`, `eas.json`, and `.eas/workflows/` when native config, builds, updates, workflows, or deployment are involved.
- `app/` for Expo Router structure; routes belong there, while shared components, utilities, hooks, types, and services should live outside it.
- `ios/`, `android/`, and `modules/` only when the project has generated native folders, custom native code, or local Expo modules.

Prefer the project's existing conventions over generic examples. When package behavior, Expo SDK compatibility, or EAS service behavior is version-sensitive, verify current official Expo documentation before changing commands or config.

## Default Expo Choices

- Try Expo Go first with `npx expo start` unless the task clearly requires a development build.
- Use a development build only for local native modules, app extensions, third-party native modules absent from Expo Go, or native config that cannot be represented in Expo config.
- Prefer Expo-maintained packages where applicable: `expo-image`, `expo-audio`, `expo-video`, `expo-router`, `expo-secure-store`, and `react-native-safe-area-context`.
- Avoid legacy APIs removed from React Native or replaced in Expo: `expo-av` for new audio/video work, `expo-permissions`, React Native `Picker`, `WebView`, `SafeAreaView`, and `AsyncStorage`.
- Use Expo Router navigation primitives rather than custom navigation shells when the app already uses Expo Router.
- Keep native mobile UI native: use React Native views, Expo Router, Expo packages, and platform conventions. Use DOM components only when intentionally embedding or migrating web UI.

## Reference Map

Load the narrowest matching file from `references/`:

- `building-native-ui.md`: Expo Router, native tabs, stacks, modals, sheets, app route structure, platform UI, animations, icons, media, storage, visual effects, WebGPU/Three.js, search, headers, and general native UI polish.
- `native-data-fetching.md`: `fetch`, API calls, React Query, SWR, errors, retries, caching, offline handling, and Expo Router loaders.
- `expo-tailwind-setup.md`: Tailwind CSS v4 in Expo with `react-native-css` and NativeWind v5.
- `upgrading-expo.md`: Expo SDK upgrades, dependency fixes, React 19, React Compiler, New Architecture, native tabs migration, and `expo-av` migrations.
- `expo-cicd-workflows.md`: EAS workflow YAML, CI/CD automation, `.eas/workflows/`, workflow fetching, and validation patterns.
- `expo-deployment.md`: EAS builds, EAS submit, TestFlight, App Store, Play Store, web hosting, app metadata, and release workflows.
- `expo-dev-client.md`: Local and cloud development clients, internal distribution, and when to use dev builds.
- `expo-api-routes.md`: Expo Router API routes, server endpoints, and EAS Hosting.
- `use-dom.md`: Expo DOM components, webview-backed migration, and sharing web code between web and native.
- `expo-module.md`: Expo Modules API, Swift/Kotlin native modules, native views, shared objects, config plugins, lifecycle hooks, and autolinking.
- `expo-ui-swift-ui.md`: `@expo/ui/swift-ui` SwiftUI views and modifiers inside Expo apps.
- `expo-ui-jetpack-compose.md`: `@expo/ui/jetpack-compose` Jetpack Compose views and modifiers inside Expo apps.
- `eas-update-insights.md`: EAS Update health checks, rollout metrics, crash rate, launches, installs, unique users, payload size, embedded-vs-OTA users, and CI gates for update health.

## Workflow

1. Identify whether the task is app UI, data, styling, upgrade, native code, dev client, CI/CD, deployment, API routes, DOM migration, or update health.
2. Read the matching reference file. If the task spans areas, read only the additional files needed.
3. Check the installed SDK and package versions before applying examples from references.
4. Make scoped edits that preserve the existing route structure, package manager, formatting, and build setup.
5. Validate with the lightest useful command: typecheck, lint, targeted tests, `npx expo-doctor`, `npx expo start`, workflow validation, or platform build commands as appropriate for the change.

## Implementation Guardrails

- Do not add custom native code when an Expo package or config plugin solves the requirement.
- Do not run `prebuild`, `expo run:ios`, `expo run:android`, or EAS build commands just to test ordinary JavaScript, routing, or styling changes.
- Do not move route files without removing stale route files that would create duplicate screens.
- Do not co-locate shared components or services in `app/`.
- Do not submit app store releases, publish OTA updates, change production EAS channels, or create credentials without explicit user confirmation at action time.
