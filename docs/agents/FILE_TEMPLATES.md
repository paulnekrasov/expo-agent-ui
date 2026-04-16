# File Templates

Use these templates when reseeding or refreshing the workflow files.

Keep the headers stable.
Keep the terminology stable.

## `PHASE_STATE.md`

```md
# PHASE STATE
Updated: YYYY-MM-DD
Active Phase: Phase X - Name
Active Stage: Stage Y - Name
Active File: path/to/file.ts

## Completed this session

- [x] ...

## Baseline repo status

- [x] ...
- [ ] ...

## In progress

- [ ] ...

## Blocked

- [ ] ...

## Next agent must start with

1. ...
2. ...

## Suggested next target

- ...
```

## `TASK.md`

```md
# TASK SPECIFICATION
Created by: role or agent name
Date: YYYY-MM-DD
Roadmap Phase: Phase X - Name
Pipeline Stage: Stage Y - Name
Research Layer: Layer N or multiple layers

## Objective

One sentence only.

## Acceptance criteria

- [ ] ...
- [ ] ...

## Files to touch

- `path/to/file.ts`

## Reference docs to read before starting

- `docs/reference/...`

## Known traps

- ...

## Out of scope

- ...
```

## `REVIEW.md`

```md
# REVIEW REPORT
Reviewer session date: YYYY-MM-DD
Roadmap Phase: Phase X - Name
Pipeline Stage: Stage Y - Name
Task status: open | needs fixes | clear

## Findings

### R-001 [BUG] Short title
File: path/to/file.ts
Reference: docs/reference/... or project rule
Why it matters: ...
Fix direction: ...

### R-002 [ACTIVE_STAGE_GAP] Short title
File: path/to/file.ts
Reference: ...
Why it matters: ...
Fix direction: ...
```

## `HANDOFF.md`

```md
# HANDOFF NOTE
From: role or agent name
To: next role or next agent
Session date: YYYY-MM-DD

## What I did

- ...

## What I found

- ...

## What the next agent must do first

- ...

## What the next agent must not do

- ...

## Confidence level on current build

- Phase 1 / Parser Foundation: NN%
- Phase 2 / Resolver: NN%
```
