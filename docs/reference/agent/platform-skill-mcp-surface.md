# Platform Skill MCP Surface

This specification defines how repo-local platform skills may become MCP-facing context for Agent
UI. The goal is to make skill knowledge discoverable to agents without bundling it into the mobile
runtime or turning static instructions into unsafe mutating tools.

## Layer Boundary

| Layer | Allowed | Not Allowed |
|---|---|---|
| Mobile runtime | Runtime capabilities implemented by the app: semantic tree, state, actions, events, bridge diagnostics, redaction. | Bundled skill markdown, prompt libraries, platform research files, or model-facing instructions. |
| `packages/core` | Types and runtime APIs needed by the app. | Dependencies on repo-local skill files or skill lookup code. |
| `packages/mcp-server` | Read-only access to repo-local skill resources, prompt templates, and small selection/search tools. | Mutating app behavior based only on skill text, tool schemas generated from app data, stdout logging, or hidden network calls. |
| `skills/expo-agent-ui` | Lean skill instructions, references, examples, validation scripts, and links to repo-local platform skills. | Full copied platform skills in the main `SKILL.md` body. |
| Future optional package | A dedicated skill-library package may publish this reference set later. | Making it mandatory for core runtime adoption. |

## MCP Resource Model

Expose repo-local platform skills primarily as MCP resources. Resources are read-only,
application-provided context. They are selected by the agent or by helper tools, not automatically
injected into every prompt.

Initial resource URIs:

| Resource URI | Backing File Or Folder | Purpose |
|---|---|---|
| `agent-ui://platform-skills/index` | `docs/reference/agent/platform-skills/INDEX.md` | Catalog of available repo-local skills and loading rules. |
| `agent-ui://platform-skills/routing` | `docs/reference/agent/platform-skill-routing.md` | The router that maps tasks to skills. |
| `agent-ui://platform-skills/expo` | `docs/reference/agent/platform-skills/expo-skill/SKILL.md` | Expo implementation, EAS, config, Expo UI, and deployment entrypoint. |
| `agent-ui://platform-skills/react-native` | `docs/reference/agent/platform-skills/vercel-react-native-skills/SKILL.md` | React Native and Expo performance/UI entrypoint. |
| `agent-ui://platform-skills/composition` | `docs/reference/agent/platform-skills/vercel-composition-patterns/SKILL.md` | Component API and composition entrypoint. |
| `agent-ui://platform-skills/native-accessibility` | `docs/reference/agent/platform-skills/native-accessibility-engineering/SKILL.md` | Native and cross-platform accessibility entrypoint. |
| `agent-ui://platform-skills/native-design` | `docs/reference/agent/platform-skills/native-app-design-engineering/SKILL.md` | Native motion, polish, haptics, and design engineering entrypoint. |
| `agent-ui://platform-skills/android` | `docs/reference/agent/platform-skills/android-ecosystem-skill/SKILL.md` | Android ecosystem and Compose entrypoint. |
| `agent-ui://platform-skills/apple` | `docs/reference/agent/platform-skills/apple-ecosystem-app-building/SKILL.md` | Apple ecosystem and SwiftUI entrypoint. |
| `agent-ui://platform-skills/context-prompt-engineering` | `docs/reference/agent/platform-skills/context-prompt-engineering/SKILL.md` | Prompt, workflow, handoff, and validation-note entrypoint. |
| `agent-ui://platform-skills/systematic-debugging` | `docs/reference/agent/platform-skills/systematic-debugging/SKILL.md` | Root-cause debugging, blocked verification triage, TTD/TDD red-green evidence, and evidence-backed fix workflow. |

Later resource templates may expose sub-files:

```text
agent-ui://platform-skills/{skillName}
agent-ui://platform-skills/{skillName}/references/{referenceName}
agent-ui://platform-skills/{skillName}/rules/{ruleName}
```

Template resolution must stay inside `docs/reference/agent/platform-skills/` after path
normalization. Reject traversal, absolute paths, symlinks outside the repo, and non-text files.

## MCP Prompt Model

Expose prompts only when their backing references exist and the prompt has a narrow purpose.

Initial prompts:

| Prompt | Inputs | Loads | Output Intent |
|---|---|---|---|
| `choose_platform_skills` | `task`, optional `stage`, optional `platforms` | Routing reference and skill index | A short list of skill resources to load and why. |
| `plan_native_scaffold` | `scaffoldIntent`, optional `platform`, optional `stage` | Routing, Expo, React Native, accessibility, and platform-specific skill entrypoints | A scoped scaffold plan with non-goals and validation. |
| `review_accessibility_semantics` | `platform`, `screenOrComponent`, optional `codeContext` | Native accessibility plus React Native accessibility reference | Accessibility issues, fixes, and verification steps. |
| `prepare_visual_editor_notes` | `sessions`, optional `platforms`, optional `adapterCapabilities` | Routing, native preview, cloud-flow comparison, security | Development-only editor notes with redaction and multi-session constraints. |
| `write_agent_task_notes` | `task`, `stage`, optional `selectedSkills` | Context prompt engineering and active stage docs | Hidden notes for task scope, assumptions, checks, and handoff. |
| `debug_stage_failure` | `stage`, `commandOrSymptom`, optional `package`, optional `evidence` | Systematic debugging, active stage references, review checklist | A root-cause investigation plan, one falsifiable hypothesis, required red test/probe/command, green rerun target, and status classification. |

Prompts must return scoped plans or notes. They must not execute app actions or claim that
unimplemented runtime capabilities exist.

## MCP Tool Model

Use tools only for deterministic selection and retrieval. Skill tools are read-only and do not
mutate app state, package files, or skill files.

| Tool | Input | Output | Failure Codes |
|---|---|---|---|
| `listPlatformSkills` | optional `includeReferences: boolean` | `skills[]` with name, entrypoint, summary, available reference groups | `SKILL_INDEX_UNAVAILABLE` |
| `getPlatformSkill` | required `name`; optional `section`, `maxBytes` | skill metadata, entrypoint content or requested section, truncation metadata | `SKILL_NOT_FOUND`, `SECTION_NOT_FOUND`, `CONTENT_TOO_LARGE` |
| `searchPlatformSkills` | required `query`; optional `skillNames`, `limit`, `includeSnippets` | ranked matches with skill, file, heading, snippet, score | `QUERY_EMPTY`, `SEARCH_UNAVAILABLE` |
| `recommendPlatformSkills` | required `task`; optional `stage`, `platforms`, `scaffoldIntent` | selected skills, resource URIs, reasons, warnings | `TASK_EMPTY`, `STAGE_UNSUPPORTED` |

Tool rules:

- Do not expose mutating tools such as `applySkill`, `installSkill`, or `runSkill` in v0.
- Do not let app-provided semantic text define tool names, schemas, or resource URIs.
- Return `structuredContent` plus text fallback content.
- Use `isError: true` for tool execution failures; reserve protocol errors for malformed MCP
  requests or unknown tools.
- Log only to stderr; stdout remains MCP protocol-clean.

## Package Placement

Stage 5 may implement this in `packages/mcp-server` after the stdio server exists. The server may
read repo-local files from `docs/reference/agent/platform-skills/` during development and from a
packaged asset directory after publish readiness work defines the install layout.

Do not add this to `packages/core`. Do not require the example app to import platform skills.

Stage 8 should mirror this surface in `skills/expo-agent-ui` by linking to resources and prompts,
not by duplicating all platform skill content in the main skill body.

## Security And Privacy

- Treat all skill files as trusted repo-authored context, but all app-provided values as untrusted.
- Keep resources read-only.
- Sanitize paths before reading sub-files.
- Cap returned bytes and include truncation metadata.
- Prefer snippets and headings for search results; load full files only after selection.
- Do not include secrets from `.env`, app state, route params, logs, or bridge payloads in skill
  resources or prompt outputs.

## Implementation Gates

Before exposing the tools publicly:

- define the final packaged asset path for published MCP server usage,
- add tests for resource URI resolution and path traversal rejection,
- add tests for tool schemas and stable failure codes,
- verify stdout stays protocol-clean,
- verify the server can run without an app bridge connected,
- document that runtime-control tools and skill-context tools are separate capability groups.
