# Prompt Lifecycle & Optimization Reference

> Load this file when running a prompt optimization loop, setting up A/B tests,
> designing eval sets, writing assertions, tracking metrics, or running skill
> description optimization.
> Sources: skill-creator (Anthropics), prompt-engineering (giuseppe-trisciuoglio/developer-kit),
> OpenAI evaluation best practices, prompt-blueprint (thibaultyou), Anthropic skills guide.

---

## The Prompt as Engineering Artifact

Prompts are not one-and-done. They are versioned, tested, and improved like code.
A prompt with no test suite is a prompt with unknown reliability.

**Lifecycle stages:**
```
Draft → Baseline Test → Failure Analysis → Targeted Fix → A/B Test
  → Accept/Reject → Regression Check → Document → Deploy
  → Monitor → Failure Re-emerges? → Restart loop
```

---

## Stage 1 — Drafting

### The Minimum Viable Prompt
Start with the minimum that could work, then add only what is needed to fix failures.
Over-specified prompts accumulate dead weight that dilutes attention and can cause
unexpected interactions between constraints.

**Minimum viable structure:**
1. Role (1 sentence)
2. Task (1 sentence, verb + object)
3. Output format (1–5 lines)

Add constraints, examples, and reasoning instructions only when baseline testing
reveals that the minimum isn't sufficient.

### Prompt Versioning Convention
```
prompts/
├── task-name/
│   ├── v1.md          ← initial draft
│   ├── v2.md          ← after first iteration
│   ├── v3.md          ← current production
│   └── changelog.md   ← what changed and why
```

**Changelog entry format:**
```markdown
## v3 — 2025-03-25

### Changes
- Added CoT instruction after failure on multi-condition logic cases
- Tightened output schema to require `evidence` field (was previously optional)
- Removed verbose preamble that was consuming 200 tokens with no benefit

### Metrics (v2 → v3)
- Format compliance: 87% → 96%
- Task completion: 91% → 94%
- Avg output length: 620 tokens → 480 tokens (within spec)
```

---

## Stage 2 — Test Case Design

### Eval Set Composition
A well-constructed eval set covers all of:

| Category | % of set | Purpose |
|---|---|---|
| **Core happy path** | 30% | Validates baseline behaviour |
| **Edge cases** | 25% | Stress-tests boundary conditions |
| **Adversarial inputs** | 15% | Inputs designed to break the prompt |
| **Format stress** | 15% | Unusual input lengths, formats, languages |
| **Failure regression** | 15% | Cases previously failed; guard against re-emergence |

**Minimum set size:** 10 cases for initial validation; 30+ for pre-deployment confidence;
100+ for production-critical prompts.

### Eval JSON Schema

From `skill-creator` (Anthropics):
```json
{
  "skill_name": "your-skill-name",
  "version": "v3",
  "evals": [
    {
      "id": 1,
      "name": "core-happy-path-code-review",
      "prompt": "Review this Python function for correctness: def add(a, b): return a - b",
      "expected_output": "Should identify the bug: subtraction used instead of addition",
      "category": "core",
      "assertions": [
        {
          "type": "contains",
          "value": "subtraction",
          "description": "Identifies the wrong operator"
        },
        {
          "type": "contains",
          "value": "addition",
          "description": "States the correct operator"
        },
        {
          "type": "json_valid",
          "schema": {"type": "object", "required": ["issues", "summary"]},
          "description": "Output matches required schema"
        },
        {
          "type": "not_contains",
          "value": "looks good",
          "description": "Does not incorrectly pass the broken function"
        }
      ],
      "files": []
    }
  ]
}
```

### Assertion Types Reference

| Type | Use when | Example |
|---|---|---|
| `contains` | A key term or phrase must appear | `{"type": "contains", "value": "race condition"}` |
| `not_contains` | A term must NOT appear | `{"type": "not_contains", "value": "I cannot help"}` |
| `json_valid` | Output must parse as valid JSON matching schema | `{"type": "json_valid", "schema": {...}}` |
| `regex` | Output must match a pattern | `{"type": "regex", "pattern": "^\\{.*\\}$"}` |
| `length_lte` | Output must not exceed N tokens/chars | `{"type": "length_lte", "value": 500}` |
| `length_gte` | Output must be at least N tokens/chars | `{"type": "length_gte", "value": 50}` |
| `starts_with` | Output must begin with specific text | `{"type": "starts_with", "value": "{"}` |
| `ends_with` | Output must end with specific text | `{"type": "ends_with", "value": "}"}` |
| `no_markdown` | No markdown fences, headers, or bullets | Custom: not_contains each markdown marker |
| `human_review` | Subjective quality; requires rubric | Flag for manual inspection |

### Writing Good Test Cases (Skill-Creator Guidance)
- **Be substantive:** Simple one-liners don't stress-test skills; use realistic multi-sentence prompts
- **Be specific:** Include concrete details (file paths, values, domain terms) — not abstractions
- **Cover failure modes you've seen before:** Every past failure becomes a regression test
- **Include near-misses for trigger tests:** Cases that share keywords but should NOT trigger the skill

---

## Stage 3 — Baseline and Comparison

### Running A Baseline
Always compare a new prompt version against the previous one on the same eval set.

```
For each eval case:
  1. Run with old prompt → save output to /results/v2/eval-{id}/
  2. Run with new prompt → save output to /results/v3/eval-{id}/
  3. Grade both against the same assertions
  4. Compare: did new prompt pass cases old prompt failed? (wins)
              did new prompt fail cases old prompt passed? (regressions)
```

**Decision rule:** Accept a new prompt version if and only if:
- It produces more wins than regressions
- It does not regress on any previously-passing high-priority case
- Aggregate metric (pass rate, format compliance) moves in the positive direction

### Blind Comparison (for subjective tasks)
From `skill-creator` (Anthropics): For subjective quality (writing style, design critique):
1. Generate outputs from both versions labeled A and B (randomized)
2. Have a human (or independent LLM-as-judge) rate each output on a rubric without
   knowing which is which
3. Aggregate ratings; declare winner by majority preference
4. Only if winner is clear (≥60% preference) adopt the new version

**LLM-as-judge prompt template:**
```
You are evaluating two AI-generated outputs (A and B) for the following task:
{task description}

Output A:
{output_a}

Output B:
{output_b}

Rate each output on:
1. Task completion (1–5): Did it do what was asked?
2. Accuracy (1–5): Are all claims correct?
3. Format compliance (1–5): Does it match the required format?
4. Clarity (1–5): Is it easy to understand?

Then state: "My overall preference is A / B / Tie" and explain in 1–2 sentences why.
Do not explain both outputs; just state your preference and reason.
```

---

## Stage 4 — Failure Analysis

### Failure Categorisation

After running the eval set, categorise every failure:

| Category | Signal | Root cause approach |
|---|---|---|
| **Format drift** | Output doesn't match schema; wrong structure | Tighten format spec; add schema example |
| **Hallucination** | Factual claims not grounded in input | Add "base every claim on the provided content"; require evidence fields |
| **Missing constraint** | Prompt says X but model did Y | Constraint is ambiguous or buried; rewrite and/or move to top |
| **Wrong tone** | Style doesn't match target audience | Add explicit audience + tone definition; use example |
| **Truncation** | Output cuts off mid-response | Reduce task scope per call; increase token limit; use structured output |
| **Over-hedging** | Excessive caveats, refusals, disclaimers | Clarify intended use; add confidence-appropriate instruction |
| **Scope creep** | Model does more than asked | Add explicit "do not…" constraints; narrow task definition |
| **Injection failure** | Prompt ignores embedded instructions | Add anti-injection policy; isolate untrusted content |

### Root Cause → Fix Mapping

For each failure category, apply exactly one change at a time:

| Root cause | Change to apply |
|---|---|
| Format drift | Add or tighten output schema; add concrete example |
| Hallucination | Add `evidence` field requirement; add "cite the source" instruction |
| Missing constraint | Rewrite constraint in positive, specific terms; move to first position |
| Wrong tone | Add persona + audience sentence; add before/after example |
| Truncation | Split into two calls; use structured progressive output |
| Over-hedging | Specify acceptable confidence level; add "if in doubt, state your uncertainty in one sentence and proceed" |
| Scope creep | Add explicit exclusion list |
| Injection failure | Add privilege-separation delimiter + anti-injection instruction |

**One change at a time is non-negotiable.** Making multiple changes simultaneously
makes it impossible to attribute improvements or regressions to specific changes.

---

## Stage 5 — Metrics Tracking

### Core Metrics

| Metric | How to measure | Target |
|---|---|---|
| **Format compliance rate** | % of outputs that pass schema/format assertions | ≥95% for production |
| **Task completion rate** | % of outputs that accomplish the stated task (human or LLM judge) | ≥90% for production |
| **Hallucination rate** | % of outputs with claims not grounded in input (spot-check) | ≤5% for production |
| **Length compliance** | % of outputs within the specified length range | ≥90% |
| **Failure mode frequency** | Count per category per eval run | Tracked over time; must not grow |
| **Trigger accuracy** (for skills) | % of should-trigger queries that trigger; % of should-not-trigger that don't | Both ≥80% |

### Metric Tracking Template

```markdown
# Prompt Metrics — {skill-name}

| Date | Version | Format | Completion | Hallucination | Length | Notes |
|------|---------|--------|------------|---------------|--------|-------|
| 2025-03-01 | v1 | 72% | 81% | 12% | 68% | Initial baseline |
| 2025-03-10 | v2 | 87% | 88% | 8% | 84% | Added CoT; tightened schema |
| 2025-03-25 | v3 | 96% | 94% | 4% | 91% | Added evidence field |
```

---

## Stage 6 — Skill Description Optimization

The description field in SKILL.md frontmatter is the primary triggering mechanism.
Optimize it separately from content quality.

### Trigger Eval Query Design

Create 20 queries — mix of should-trigger and should-not-trigger:

**Should-trigger (8–10 queries):** Different phrasings of the same intent; include:
- Formal phrasing ("Please apply the X skill to…")
- Casual phrasing ("hey can u help me with…")
- Domain-specific terminology without naming the skill
- Edge cases and uncommon but valid uses
- Cases where this skill competes with another but should win

**Should-not-trigger (8–10 queries):** Near-misses that share keywords but need
a different skill or no skill at all. These should be genuinely tricky, not obviously
irrelevant.

**Good trigger query examples:**
```json
[
  {
    "query": "ok my boss wants me to make the prompt for our support bot less generic, it keeps saying stuff like 'i'm here to help' and giving vague answers instead of actually answering. she wants it to sound more expert and give specific steps",
    "should_trigger": true
  },
  {
    "query": "my claude code agent keeps going off and doing random stuff instead of sticking to what i asked. how do i make it more focused?",
    "should_trigger": true
  },
  {
    "query": "write me a python script that reads a csv and outputs a bar chart",
    "should_trigger": false
  },
  {
    "query": "help me debug this error: TypeError: Cannot read properties of undefined",
    "should_trigger": false
  }
]
```

**Bad trigger query examples (too easy — don't use):**
```json
[
  {"query": "please do prompt engineering", "should_trigger": true},
  {"query": "write a fibonacci function", "should_trigger": false}
]
```

### Description Optimization Loop

1. Measure trigger rate on eval set with current description
2. Identify failed cases (should-trigger but didn't, or vice versa)
3. Analyse: which phrases in the query caused the miss?
4. Rewrite description to include or exclude those phrase patterns
5. Re-measure; accept only if test set score improves
6. Repeat up to 5 iterations; select best description by held-out test score
   (not training score — avoid overfitting)

### Description Writing Heuristics

- **Be "pushy"** (skill-creator guidance): list synonymous phrases the user might say
- **Name the pain points**, not just the solution: "Use when outputs feel too generic,
  inconsistent, or hard to control" is better than "Use for prompt engineering"
- **Include domain terms**: if your skill handles code review, SQL, or API design,
  name those domains so they can pattern-match
- **Include negative triggers explicitly** if false positives are a problem:
  "Do NOT use for … (use X skill instead)"
- **Maximum ~150 words** for description; beyond this, triggering reliability can drop

---

## Few-Shot Example Selection Guidelines

From `prompt-engineering` (giuseppe-trisciuoglio/developer-kit):

### Selection Criteria (in priority order)
1. **Semantic diversity:** Examples should cover different sub-types of the task,
   not cluster around one common case
2. **Edge case coverage:** At least 1 example should demonstrate graceful handling
   of an edge case or unusual input
3. **Ordering:** Place the most task-relevant example **last** (recency effect)
4. **Class balance:** For classification tasks, include roughly equal examples per class
5. **Real over synthetic:** Prefer examples from actual production use; synthetic examples
   can embed artificial patterns the model overfits to
6. **Minimal:** 2–5 examples are usually optimal; more than 10 rarely helps and adds tokens

### Example Quality Checklist
```
For each example:
  □ Does it demonstrate the full input → output transformation?
  □ Does the output show ALL reasoning steps (for CoT examples)?
  □ Is the output in exactly the format you want the model to produce?
  □ Is the example representative of real inputs (not a toy case)?
  □ Is this example different from all others in a meaningful way?
```

---

## Production Deployment Checklist

Before deploying any prompt or skill to production:

```
Testing:
  □ Eval set has ≥30 cases (≥100 for high-stakes applications)
  □ All metric targets met (format ≥95%, completion ≥90%, hallucination ≤5%)
  □ Regression test passed against previous version
  □ Adversarial inputs tested (injection, jailbreak, edge cases)

Documentation:
  □ Changelog updated with version, changes, and metric deltas
  □ Known failure modes documented
  □ Expected use cases and anti-use-cases documented

Operations:
  □ Monitoring in place for format compliance and anomalous outputs
  □ Rollback plan defined (previous version saved and accessible)
  □ Token budget validated (worst-case input + output within limits)
  □ Rate limits and cost implications reviewed
```
