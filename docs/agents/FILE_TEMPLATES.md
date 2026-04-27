# File Templates

Use these templates when reseeding or refreshing workflow files.

Keep the headers stable. Keep terminology aligned with Expo Agent UI product stages.

## `PHASE_STATE.md`

```md
# PHASE STATE
Updated: YYYY-MM-DD
Active Phase: Phase X - Name
Active Stage: Stage Y - Name
Active File: path/to/file

## Completed This Session

- [x] ...

## Baseline Repo Status

- [x] ...
- [ ] ...

## In Progress

- [ ] ...

## Blocked

- [ ] ...

## Next Agent Must Start With

1. ...
2. ...

## Suggested Next Target

- ...
```

## `TASK.md`

```md
# TASK SPECIFICATION
Created by: role or agent name
Date: YYYY-MM-DD
Roadmap Phase: Phase X - Name
Product Stage: Stage Y - Name
Research Area: short domain name

## Objective

One sentence only.

## Status

ACTIVE_READY | BLOCKED | REVIEW_READY | COMPLETE

## Acceptance Criteria

- [ ] ...
- [ ] ...

## File Allowlist

- `path/to/file.ts`

## Reference Docs To Read Before Starting

- `docs/reference/...`

## Known Traps

- ...

## Out Of Scope

- ...

## Verification

- command or doc-only verification step
```

## `REVIEW.md`

```md
# REVIEW REPORT
Reviewer session date: YYYY-MM-DD
Roadmap Phase: Phase X - Name
Product Stage: Stage Y - Name
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

## What I Did

- ...

## What I Found

- ...

## What The Next Agent Must Do First

- ...

## What The Next Agent Must Not Do

- ...

## Confidence Level

- Phase X / Stage Y: NN%
```
