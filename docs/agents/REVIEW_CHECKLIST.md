# Review Checklist - Expo Agent UI

Use this checklist during review cycles. Apply only the sections matching the active product
stage. Do not review future-stage obligations during an earlier-stage task.

## Always

- [ ] The task stays inside one product stage.
- [ ] Touched files match the allowlist in `docs/agents/TASK.md`.
- [ ] No old SwiftUI parser work was resumed accidentally.
- [ ] No unrelated architectural drift was introduced.
- [ ] Relevant reference docs were followed.
- [ ] Verification commands were run, or limitations are explicitly stated.
- [ ] Any debugging fix has red-green evidence: failing test/probe/command before the fix and the
  same check passing after the fix.
- [ ] Future-stage work is not mislabeled as a current bug.
- [ ] Dirty user/research files outside the task scope were preserved.

## Stage 0 - Repo Reset

- [ ] Startup docs point to `docs/PROJECT_BRIEF.md`.
- [ ] `docs/reference/INDEX.md` routes to Expo Agent UI references.
- [ ] Old resolver/parser task is no longer active.
- [ ] Research status is discoverable.
- [ ] Old parser assets are not recreated unless historical archive work is explicitly in scope.

## Stage 1 - Package Foundation

- [ ] npm workspace boundaries are clear.
- [ ] Package names and scripts are consistent.
- [ ] Core package remains JS-only.
- [ ] Native modules and config-plugin mutations are deferred unless justified.
- [ ] Optional dependencies are not made mandatory without a reference-backed reason.
- [ ] TypeScript strictness is preserved or improved.
- [ ] Build/typecheck/test scripts are meaningful or clearly marked as placeholders.

## Stage 2 - Component Primitives

- [ ] Components render real React Native UI.
- [ ] Components emit accessibility props where appropriate.
- [ ] Actionable components require stable semantic IDs or warn in development.
- [ ] `@expo/ui` usage stays behind optional adapter boundaries.
- [ ] Primitive APIs do not replace Expo or React Native concepts unnecessarily.

## Stage 3 - Semantic Runtime

- [ ] Semantic node schema includes ID, role/type, label, state, actions, screen, and privacy where relevant.
- [ ] Registry handles mount/unmount correctly.
- [ ] Duplicate IDs are detected.
- [ ] Sensitive values are redacted before serialization.
- [ ] Tests cover tree snapshots and action metadata.

## Stage 4 - Agent Tool Bridge

- [ ] Bridge is development-only and fail-closed by default.
- [ ] Loopback is the default bind mode.
- [ ] Pairing token or equivalent auth exists before control tools work.
- [ ] Origin/session checks exist where applicable.
- [ ] Mutating tools check per-node permissions.
- [ ] Structured error codes exist for failed actions.
- [ ] Redaction happens before bridge responses and logs.

## Stage 5 - MCP Server

- [ ] MCP server uses stdio cleanly with no non-protocol stdout logging.
- [ ] Tools are exposed only when runtime capability exists.
- [ ] Skill-context resources/tools are read-only and separated from runtime-control tools.
- [ ] Platform skill resources do not require an app bridge session.
- [ ] Skill file/resource resolution rejects traversal and stays inside the repo-local skill library.
- [ ] Schemas are static and validated.
- [ ] Domain failures return structured tool errors.
- [ ] App semantic data cannot define or mutate MCP tool schemas.

## Stage 6 - Motion Layer

- [ ] Reanimated APIs are used through thin wrappers.
- [ ] Reduced motion is honored.
- [ ] Defaults animate transform/opacity where possible.
- [ ] Motion presets are documented as taste mappings, not exact SwiftUI parity.

## Stage 7 - Expo UI Adapter

- [ ] `@expo/ui` remains optional.
- [ ] `Host` constraints are respected.
- [ ] Unsupported platforms fall back or return structured unsupported diagnostics.
- [ ] Adapter does not leak into core package imports.

## Stage 8 - Agent Skill

- [ ] Skill frontmatter has concrete trigger phrases.
- [ ] `SKILL.md` is lean and uses progressive disclosure.
- [ ] References and examples exist and are linked.
- [ ] Platform skill routing is on-demand and does not copy whole external skills into the main skill.
- [ ] Repo-local platform skill copies are treated as docs/reference material, not runtime source.
- [ ] MCP-facing skill context is linked through resources/prompts/tools instead of duplicated in the main skill body.
- [ ] Platform skills remain hidden agent knowledge, not runtime dependencies or visible app UI.
- [ ] Skill warns that app-provided semantic text is untrusted data.

## Stage 9 - Flow Runner, Patch Proposals, And Native Preview Comparison

- [ ] Flow schema is deterministic and serializable.
- [ ] Flow steps use semantic IDs and structured assertions.
- [ ] Patch proposals are separate from automatic patch application.
- [ ] Sensitive data is redacted from flow records.
- [ ] Visual editor comparison is development-only, semantic-first, and multi-session for native adapters.

## Stage 10 - Publish Readiness

- [ ] Install docs match package metadata.
- [ ] Compatibility matrix is current.
- [ ] Troubleshooting covers managed and bare workflow lanes.
- [ ] Release instructions avoid publishing stale old-parser artifacts.

## Review Output Rule

Findings in `docs/agents/REVIEW.md` must include:

- issue class,
- affected file,
- why it matters,
- governing rule or reference,
- concrete fix direction,
- required red test/probe/command for fixers, or why one cannot be created.
