# Research Prompt: Expo Package Foundation, Compatibility, Config Plugin, Modules API

Copy and paste this whole prompt into a fresh research agent.

```text
Role / context:
You are a staff-level Expo and React Native package research engineer. You are researching
the package foundation for a rebuild of an old SwiftUI parser repository into a new project:
a lightweight Expo + React Native library, optional Expo config plugin, local MCP-style agent
tool server, and agent skill. The product is called "Expo Agent UI" for now.

Current date: 2026-04-26.

Repository context:
- Read `docs/agents/EXPO_AGENT_SKILL_REBUILD_PLAN.md` first.
- The new product must sit on top of Expo. It must not replace Expo, React Native,
  Reanimated, Expo Router, `@expo/ui`, or Expo MCP.
- It must work with Expo managed and bare workflows.
- It should be npm-installable and low-friction.
- The config plugin should be optional unless native setup is actually required.

Task:
Research the current package-foundation decisions needed for the new Expo Agent UI rebuild.
This prompt combines these high-priority knowledge gaps:
1. Current Expo SDK package and peer dependency expectations.
2. Expo config plugin package layout for npm publishing.
3. Expo Modules API requirements if a native bridge is needed.
4. Managed workflow, bare workflow, prebuild, and Continuous Native Generation constraints.

Primary questions to answer:
1. What is the current stable Expo SDK as of 2026-04-26, and which React, React Native,
   TypeScript, Metro, and Node versions does it expect or support?
2. The rebuild plan mentions "Expo SDK 55+". Verify whether SDK 55 is current, future,
   or stale. If it is stale or unavailable, state the correct target and explain.
3. What should the package's peer dependency strategy be for:
   - `expo`
   - `react`
   - `react-native`
   - `react-native-reanimated`
   - `react-native-worklets`
   - `@expo/ui`
   - `expo-router`
4. What is the recommended npm workspace/package structure for:
   - `packages/core`
   - `packages/expo-plugin`
   - `packages/mcp-server`
   - `packages/cli`
   - `packages/example-app`
5. How should an Expo config plugin be packaged for npm consumption?
   Include `app.plugin.js`, package `exports`, plugin naming, plugin option schema,
   and how a consuming app adds it to `app.json` or `app.config.ts`.
6. What are the current rules for writing idempotent config plugins?
   Identify iOS and Android mutation APIs that are safe and common.
7. What does the Expo Modules API require if this project eventually needs a native bridge?
   Include iOS/Android source layout, TypeScript types, autolinking, build config,
   and managed/bare workflow implications.
8. Can the v0 semantic runtime be JS-only? Identify which proposed capabilities need no
   native module and which may require one.
9. How should a package support managed and bare workflows without requiring manual native
   edits for the core path?
10. What setup commands should a developer run for a clean install?
    Produce exact command candidates, but mark them as recommendations until implementation.

Source policy:
- Use official Expo docs first:
  - Expo SDK docs
  - Expo config plugin docs
  - Expo Modules API docs
  - Expo prebuild / CNG docs
  - Expo package publishing docs if available
- Use package source or release notes as primary evidence when docs are incomplete.
- Use npm package metadata only for version facts, not behavioral claims.
- Use third-party blog posts only for gaps and label them as secondary.
- Cite every claim that could change with a URL and access date.

Hard constraints:
- Do not write implementation code.
- Do not assume a version from memory.
- Do not recommend a native module unless the JS-only path cannot support the required capability.
- Do not recommend replacing Expo workflows.
- Do not recommend a package manager switch unless official docs make it clearly necessary.
- Do not produce a generic Expo tutorial. Focus on decisions for this project.

Required output:
Write a concise but complete Markdown research report intended to become:
`docs/reference/expo/package-foundation.md`

Use exactly this structure:

# Expo Package Foundation Research

## Executive Summary
- 5-10 bullets with the decisions the implementation team should make.

## Verified Version Matrix
Table columns:
- Surface
- Current version or supported range
- Source URL
- Notes / risk

Include Expo SDK, React, React Native, Node, TypeScript, Reanimated, Worklets,
Expo Router, `@expo/ui`, and MCP SDK if relevant.

## Recommended Package Layout
Show the proposed workspace tree and explain why each package exists.

## Peer Dependency Strategy
Table columns:
- Package
- Dependency type (`peerDependency`, `dependency`, `devDependency`, optional peer)
- Recommended range
- Reason
- Risk

## Config Plugin Findings
Cover:
- file layout
- `app.plugin.js`
- plugin options
- iOS mutation APIs
- Android mutation APIs
- idempotency rules
- managed vs bare implications
- when this project should avoid a config plugin

## Expo Modules API Findings
Cover:
- when a native module is needed
- source layout
- TypeScript surface
- autolinking
- prebuild / CNG behavior
- bare workflow behavior
- risks for this project

## JS-Only V0 Feasibility
Classify each proposed v0 capability as:
- JS-only
- likely JS-only with limitations
- requires native bridge
- unknown

Capabilities to classify:
- semantic registry
- `inspectTree`
- `tap(id)`
- `input(id, value)`
- `scroll(id)`
- `navigate(screen)`
- event log
- flow runner
- animation event reporting
- MCP server connection

## Install And Init Flow
Propose exact install/init commands and explain what each command would do.

## Open Questions
List unresolved items as checkboxes. Mark blockers explicitly.

## Source Index
For every source, include:
- title
- URL
- access date
- what fact it supports

## Final Recommendation
Give a concrete recommendation for Stage 1 package foundation.

Final status token:
End with exactly one of:
DONE
DONE_WITH_CONCERNS
NEEDS_CONTEXT
BLOCKED
```

