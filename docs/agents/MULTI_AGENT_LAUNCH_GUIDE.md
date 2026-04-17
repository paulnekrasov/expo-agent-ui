# Multi-Agent Launch Guide

This file explains how to launch the workflow from one prompt and how to use multiple agents safely.

## The short version

Yes, you can launch the loop from one prompt.

The safest pattern is:

1. one coordinator,
2. one writer at a time,
3. reviewer and research helpers only in read-only parallel,
4. state passed through `docs/agents/*`.

## Best launch patterns

### Pattern A - Manual baton pass

Best when you want maximum control.

Order:

1. `stage-orchestrator`
2. `parser-implementer`
3. `phase-reviewer`
4. `issue-fixer`
5. `phase-reviewer`
6. `stage-orchestrator`

Use this when:

- the task is important,
- the scope is still changing,
- or you want to inspect each pass.

### Pattern B - Single-prompt loop launch

Best when you want to tell one coordinator to run the cycle.

Use [STAGE_2_MASTER_LOOP_PROMPT.md](C:/Users/Asus/OneDrive/Desktop/swift-ui-parser/docs/agents/STAGE_2_MASTER_LOOP_PROMPT.md).

If the findings span both Stage 1 parser-validation work and Stage 2 extraction work, use [PHASE_1_COMPLETION_MASTER_LOOP_PROMPT.md](C:/Users/Asus/OneDrive/Desktop/swift-ui-parser/docs/agents/PHASE_1_COMPLETION_MASTER_LOOP_PROMPT.md) instead.

The coordinator should:

- refresh `TASK.md`,
- run implementation,
- run review,
- run fix if needed,
- run final review,
- update `PHASE_STATE.md` and `HANDOFF.md`.

### Pattern C - Controlled parallel support

Best when you want speed without edit conflicts.

Allowed parallel combinations:

- `phase-reviewer` + `research-librarian`
- `phase-reviewer` + repo inspection
- `research-librarian` + fixture planning

Do not run in parallel:

- two writer agents on the same source tree slice,
- implementer + fixer together,
- implementer + another implementer in the same stage unless file ownership is explicitly disjoint.

### Pattern D - Scheduled automation loop

Best when you want the repo to be checked on a timer and the workflow to refresh itself.

Use [SCHEDULED_AUTOMATION_LOOP_PROMPT.md](C:/Users/Asus/OneDrive/Desktop/swift-ui-parser/docs/agents/SCHEDULED_AUTOMATION_LOOP_PROMPT.md).

Use [PROMPT_ROTATION_PROTOCOL.md](C:/Users/Asus/OneDrive/Desktop/swift-ui-parser/docs/agents/PROMPT_ROTATION_PROTOCOL.md) with it so the automation deletes and replaces only disposable runtime prompts, not the stable prompt library.

## Example single-prompt launch

```text
Use stage-orchestrator as the coordinator and run the Stage 2 loop for this repo.
Read the docs/agents state files first.
Keep the work inside Phase 1 / Stage 2 only.
Use the full Stage 2 issue backlog unless you need to narrow it.
If you can spawn specialist agents, use parser-implementer, phase-reviewer, and issue-fixer in sequence.
Keep one writer at a time.
Update TASK.md, REVIEW.md, PHASE_STATE.md, and HANDOFF.md before finishing.
```

## Example single-prompt launch for the full remaining Phase 1 backlog

```text
Use stage-orchestrator as the coordinator and run the Phase 1 completion loop for this repo.
Read the docs/agents state files first.
Stay inside Roadmap Phase 1 only.
Allow Stage 1 and Stage 2 tasks, but only one bounded task at a time.
If you can spawn specialist agents, use parser-implementer, phase-reviewer, and issue-fixer in sequence, and use research-librarian only for read-only support when blocked by missing references.
Keep one writer at a time.
Update TASK.md, REVIEW.md, PHASE_STATE.md, and HANDOFF.md before finishing.
```

## Example single-prompt launch with a narrow first target

```text
Use stage-orchestrator as the coordinator and run the Stage 2 loop for this repo.
Scope constraint: focus first on NavigationStack and NavigationLink extraction.
Read the docs/agents state files first.
Keep the work inside Phase 1 / Stage 2 only.
If you can spawn specialist agents, use parser-implementer, phase-reviewer, and issue-fixer in sequence.
Keep one writer at a time.
Update TASK.md, REVIEW.md, PHASE_STATE.md, and HANDOFF.md before finishing.
```

## Example scheduled automation launch

```text
Use stage-orchestrator as the coordinator and run the scheduled agent loop for this repo.
Read the docs/agents state files first.
Determine the active phase and stage from repo state rather than assuming them.
Run exactly one bounded task loop.
If the active task completed or changed, rotate the runtime prompt set under docs/agents/runtime-prompts/.
Update TASK.md, REVIEW.md, PHASE_STATE.md, HANDOFF.md, and RUNTIME_STATUS.md before finishing.
Keep one writer at a time.
```

## How the loop actually works

The “agents talking to each other” part is really file-based:

- `TASK.md` is the baton
- `REVIEW.md` is the reviewer output
- `HANDOFF.md` is the next-step note
- `PHASE_STATE.md` is the durable live state

That is what makes the loop stable across sessions.

## Rule of thumb

If you are unsure:

- launch with one coordinator prompt,
- let it choose one bounded Stage 2 task,
- and do not allow more than one writer at a time.
