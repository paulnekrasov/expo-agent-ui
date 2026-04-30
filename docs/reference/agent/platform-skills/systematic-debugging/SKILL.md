---
name: systematic-debugging
description: >
  Use before fixing bugs, test failures, build failures, blocked verification, runner
  environment errors, flaky async behavior, bridge/MCP failures, or unexpected Expo Agent UI
  behavior. This repo-local adapter preserves the original global systematic-debugging skill
  while mapping it to the Expo Agent UI stage workflow.
---

# Systematic Debugging For Expo Agent UI

This is a repo-local adapter for the global `systematic-debugging` skill. It is agent-side
reference material only. Do not import this file into `packages/core`, the example app, or the
mobile runtime.

## Source Principle Links

The original global skill remains the source of the debugging method:

| Principle | Global Source |
|---|---|
| Four-phase debugging and the iron law | `C:\Users\Asus\.codex\skills\systematic-debugging\SKILL.md` |
| Trace failures backward to the original trigger | `C:\Users\Asus\.codex\skills\systematic-debugging\root-cause-tracing.md` |
| Add validation at every relevant layer after root cause is known | `C:\Users\Asus\.codex\skills\systematic-debugging\defense-in-depth.md` |
| Replace arbitrary waits with condition-based waits | `C:\Users\Asus\.codex\skills\systematic-debugging\condition-based-waiting.md` |

## Iron Law

No fixes without root-cause investigation first.

For this repository, that means an agent must not change source files just because a package
script, Expo workflow, test, MCP command, bridge session, or scheduled runner failed. First capture
the exact command, exact error, current stage, affected package, and the smallest reproducible
condition.

## TTD/TDD Red-Green Rule

Every debugging fix must use a red-green loop after root cause investigation and before claiming
completion.

- Red first: add or run the smallest failing automated test that reproduces the bug before changing
  production code. If the stage has no harness yet, use the smallest one-off probe, package command,
  or script that fails for the same reason and record the exact failing output.
- Green next: make the smallest source/config change that fixes the root cause, then rerun the same
  red test or probe and show it now passes.
- Broaden after green: run the stage verification commands from `TASK.md` or the relevant package.
- No silent exceptions: if no meaningful red test or probe is possible, record why in `REVIEW.md`
  and `HANDOFF.md`, then use the narrowest manual reproduction plus the normal verification gates.
- Do not write only a post-fix test. A test that was never observed red is coverage, not debugging
  evidence.

## When To Use

Load this adapter before proposing or applying fixes for:

- TypeScript, build, package, or workspace failures.
- Expo or React Native dependency/version mismatches.
- React Native Testing Library, Jest, or future E2E failures.
- Flaky async behavior in the semantic runtime, bridge, MCP server, flow runner, or visual editor.
- Security, redaction, pairing-token, origin-check, or permission failures.
- Runner environment failures such as child-process denial, temp/cache write denial, or npm script
  execution errors.
- Any review finding classified as `BUG`, `ACTIVE_STAGE_GAP`, `SECURITY_GAP`, or `BLOCKED`.

Do not use this adapter as permission to broaden scope. The active `docs/agents/TASK.md` file still
defines the bounded task and file allowlist.

## Four Phases

### Phase 1 - Root Cause Investigation

Collect evidence before changing code:

- Read the complete error output, including file paths, line numbers, package names, and exit codes.
- Reproduce the failure with the smallest command from the active task or package.
- Check recent local changes with `git status --short --branch` and targeted diffs.
- Identify whether the failure is source behavior, missing dependency setup, or runner environment.
- For multi-component paths, record what crosses each boundary:
  - primitive props -> React Native props,
  - semantic node -> registry snapshot,
  - app bridge -> local Node bridge,
  - Node bridge -> MCP stdio server,
  - runtime prompt -> scheduled memory/state files.

### Phase 2 - Pattern Analysis

Compare against known-good local patterns:

- Use `docs/reference/INDEX.md` to open only the stage-specific reference docs.
- Compare package scripts and boundaries against Stage 1 package foundation.
- Compare primitive and semantic behavior against React Native accessibility references.
- Compare bridge/MCP behavior against the security and transport references.
- Compare scheduled-run behavior against `docs/agents/SCHEDULED_AUTOMATION_LOOP_PROMPT.md` and
  `docs/agents/PROMPT_ROTATION_PROTOCOL.md`.

### Phase 3 - Hypothesis And Minimal Test

State one falsifiable hypothesis:

```text
I think <specific cause> is the root cause because <evidence>.
The red reproduction is <failing test/probe/command>.
The green verification will rerun the same test/probe/command after the minimal fix.
```

Use the smallest test or command that can prove or disprove the hypothesis. Do not bundle multiple
fix attempts.

### Phase 4 - Implementation

Only after the hypothesis is supported:

- Add or update the smallest relevant test when the stage has a test harness, and observe it fail
  for the expected reason before changing production code.
- Fix the root cause, not only the visible symptom.
- Rerun the red test or probe and confirm it turns green.
- Avoid unrelated refactors.
- Run the verification commands from `TASK.md` or the stage reference.
- If three fix attempts fail or the fix requires crossing stage boundaries, stop and record an
  architecture or task-splitting concern in `REVIEW.md` and `HANDOFF.md`.

## Expo Agent UI Stage Mapping

| Stage | Common Failure Class | Required Debugging Evidence |
|---|---|---|
| Stage 1 - Package Foundation | Workspace scripts, package metadata, peer ranges | Exact npm command, package affected, expected script behavior, version source. |
| Stage 2 - Component Primitives | Prop mapping, accessibility, missing IDs, RN wrappers | Rendered prop expectations, primitive file path, accessibility/testID mapping. |
| Stage 3 - Semantic Runtime | Registry lifecycle, duplicate IDs, redaction | Node tree snapshot, mount/unmount trace, privacy metadata path. |
| Stage 4 - Agent Bridge | Dev gate, token pairing, loopback, authorization | Session state, capability check, redacted bridge payload, failure code. |
| Stage 5 - MCP Server | stdio protocol, tool schemas, resource lookup | stderr/stdout separation, schema input, structured error code, resource path normalization. |
| Stage 6 - Motion Layer | Reanimated setup, reduced motion, async transitions | Worklet/Reanimated setup evidence, reduced-motion setting, condition-based wait. |
| Stage 7 - Native Adapters | Platform availability, `@expo/ui` host behavior | Platform/runtime evidence, adapter capability flag, fallback behavior. |
| Stage 8 - Agent Skill | Prompt drift, missing references, skill routing | Trigger phrase, loaded reference path, scoped output, validation note. |
| Stage 9 - Flows/Preview | Flaky waits, screenshots, multi-session comparison | Semantic assertion, session metadata, redaction evidence, condition-based waits. |
| Stage 10 - Publish | Docs/package mismatch, release checks | Package metadata, install command, compatibility table source, release checklist output. |

## Runner Environment Classification

Scheduled runs must distinguish source failures from runner failures.

Classify as `RUNNER_SANDBOX_BLOCKER` only when current-run evidence shows child process execution,
npm, Jest, TypeScript, temp/cache writes, or required filesystem access is denied by the runner.

If npm, TypeScript, Jest, or build commands run normally and report source, dependency, or assertion
errors, treat that as active-task evidence, not a runner blocker.

Do not classify `rg.exe` access denial alone as a source blocker if PowerShell search and npm
verification still work. Fall back to `Get-ChildItem` plus `Select-String`, record the limitation,
and continue if the active task can still be verified.

## Completion Gate

Before marking a debugging-related task `DONE`, record:

- the failure reproduced or the reason it could not be reproduced,
- the root cause hypothesis and evidence,
- the red test/probe/command and its expected failure,
- the exact fix,
- the green rerun of the same test/probe/command,
- the exact verification commands and outcomes,
- remaining concerns, if any.

If verification cannot run, use `NEEDS_CONTEXT` or `BLOCKED` instead of `DONE`.
