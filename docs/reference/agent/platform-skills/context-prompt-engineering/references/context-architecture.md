# Context Architecture Reference

> Load this file when designing the full information environment for an agent or prompt —
> including memory systems, retrieval patterns, context window management, degradation
> phenomena, and multi-agent coordination.
> Sources: Anthropic effective context engineering, muratcankoylan context-engineering-collection,
> charon-fan self-improving-agent, PromptingGuide.ai context guide, Fractal/BigDataBoutique blogs,
> APXML short-term memory course material.

---

## Foundational Framing

Context is not the prompt. Context is the **complete information state** visible to the model:

```
Context = system_prompt
        + tool_definitions
        + retrieved_documents
        + conversation_history
        + working_memory (scratchpad)
        + agent_state (if applicable)
        + tool_outputs
        + final_user_message
```

Every element above competes for attention. The model does not treat all tokens equally.
Position, recency, structure, and signal density all modulate attention.

---

## The Attention Budget Principle (Anthropic)

The model's attention is a finite resource. Think of the context window as a budget:
- High-signal tokens (explicit instructions, key constraints, relevant code) → spend freely
- Low-signal tokens (redundant history, verbose tool outputs, filler prose) → minimize
- "Context rot" — accumulation of irrelevant or duplicated content — degrades downstream
  performance measurably, even within the same context window

**Practical corollary:** A 10k-token context with 90% relevant content outperforms a
100k-token context with 30% relevant content on most tasks.

---

## The Four Pillars (Fractal / Anthropic)

| Pillar | Question it answers | Key techniques |
|---|---|---|
| **Write** | What should the instructions say? | Structured prompts, role+task+constraints+format, examples |
| **Select** | What information belongs in context? | Just-in-time retrieval, relevance scoring, source pruning |
| **Compress** | How do we fit necessary info in fewer tokens? | Summarization, structured note-taking, diff-only updates |
| **Inject** | When and where does each piece of information enter? | Progressive loading, recency placement, delimiter isolation |

---

## Context Degradation Phenomena

These are failure modes to design around, not just to be aware of:

### Lost-in-the-Middle Effect
Information placed in the middle of long contexts is attended to less than information
at the beginning (primacy) or end (recency) of the context window.

**Mitigation strategies:**
- Place the most critical constraints at the **very beginning** of the system prompt
- Place the most recent / most actionable information at the **very end** of the user turn
- For retrieval: if you must include multiple documents, **re-rank** so the most relevant
  appear first AND last; sacrifice middle slots for lower-priority context

### U-Shaped Attention
A related phenomenon: attention forms a U-shape across position — strong at edges, weak
in the middle. Middle-positioned information is effectively "invisible" in very long contexts.

**Mitigation:** For documents > ~4k tokens that must be read entirely, break them into
chunks and retrieve per-chunk rather than loading the full document.

### Context Poisoning
Injecting incorrect, outdated, or misleading information into context causes confident
but wrong outputs — even when the model "knows" the correct answer from training.

**Mitigation:**
- Validate retrieved content before injection (schema check, date freshness, source trust)
- Explicitly instruct: "If the provided context contradicts your knowledge, flag the
  contradiction rather than silently choosing one."
- Never inject unverified user-controlled content directly into the system prompt

### Distraction Effect
Including tangentially related content increases the probability that the model focuses
on the wrong parts. More context is not always better.

**Mitigation:** For each retrieval, ask: "Is this document necessary for the current
sub-task?" If yes → inject. If maybe → don't inject by default, retrieve on demand.

### Instruction Dilution
Very long system prompts cause instruction-following fidelity to drop. Instructions buried
in a 10k-token system prompt are obeyed less reliably than the same instructions in a
focused 1k-token prompt.

**Mitigation:**
- Keep system prompt focused on the current task level ("right altitude" — Anthropic)
- Move background context to retrieved documents, not the system prompt
- Repeat the 1–3 most critical constraints immediately before the user message

---

## Memory Architecture

From `self-improving-agent` (charon-fan) + Anthropic context engineering:

### Tier 1 — Working Memory (In-Context)
- **What:** Current task state, scratchpad reasoning, immediate sub-task results
- **Lifetime:** Single context window / single turn
- **Token cost:** High (every byte costs attention budget)
- **Pattern:** Use structured JSON or XML for scratchpad; discard when task completes

```xml
<working_memory>
  <current_task>Implementing auth middleware</current_task>
  <completed_steps>
    <step>Defined User schema</step>
    <step>Wrote JWT validation function</step>
  </completed_steps>
  <next_step>Integrate middleware with Express router</next_step>
  <open_questions>Should refresh tokens be stored in Redis or DB?</open_questions>
</working_memory>
```

### Tier 2 — Episodic Memory (External, Session-Scoped)
- **What:** Past task histories, outcomes, errors encountered, corrections made
- **Storage:** External file, database, or vector store
- **Retrieval:** On-demand, by similarity or recency
- **Pattern:** Write after each task; retrieve at start of related tasks

**Episode record format:**
```json
{
  "episode_id": "ep_2025-03-25_auth-refactor",
  "task": "Refactor authentication module to use JWT",
  "outcome": "DONE_WITH_CONCERNS",
  "what_worked": "Isolating token validation into a pure function",
  "what_failed": "Initial implementation stored tokens in memory, not persistent store",
  "correction": "Switched to Redis-backed session store",
  "pattern_extracted": "Always clarify token storage backend before implementation",
  "evolution_marker": "[UPDATE] auth-pattern: require storage backend decision upfront",
  "timestamp": "2025-03-25T14:32:00Z"
}
```

### Tier 3 — Semantic Memory (External, Long-Term)
- **What:** Abstracted patterns, learned heuristics, evolved skill rules, domain knowledge
- **Storage:** External file or structured knowledge base
- **Retrieval:** At session start for relevant domains; updated periodically
- **Pattern:** Updated by self-improving-agent loop; versioned

**Semantic memory record format:**
```json
{
  "pattern_id": "pat_auth_storage",
  "domain": "backend_auth",
  "rule": "Before implementing authentication, always confirm: (1) token storage backend, (2) token expiry policy, (3) refresh token strategy",
  "confidence": 0.95,
  "derived_from": ["ep_2025-03-25_auth-refactor", "ep_2025-02-10_oauth-impl"],
  "last_updated": "2025-03-25T15:00:00Z",
  "version": 3
}
```

### Memory System Comparison

| Attribute | Working | Episodic | Semantic |
|---|---|---|---|
| Scope | Current task | Past tasks | Generalised rules |
| Persistence | Session | Multi-session | Long-term |
| Token cost to use | High (in-context) | Low (retrieve snippet) | Low (retrieve rule) |
| Update frequency | Continuously | After each task | Periodically (batch) |
| Best for | Scratchpad, state | "What happened last time" | "What always works" |

---

## Retrieval Patterns (Just-in-Time Context Injection)

The goal: inject context at the moment it is needed, not before.

### Pattern 1 — Task-Triggered Retrieval
```
At the start of each sub-task:
  1. Identify what type of task this is (e.g., "database schema design")
  2. Query semantic memory for rules matching this task type
  3. Query episodic memory for recent episodes of the same type
  4. Inject only the top-K (K ≤ 3) results into the current context
  5. Discard after the sub-task completes
```

### Pattern 2 — Chunk-Based Document Retrieval (RAG)
Rather than loading full documents, retrieve chunks ranked by relevance:

```
User query → embed query → cosine similarity against document chunks
           → retrieve top-K chunks → inject in order of relevance
           → place most relevant chunk LAST (recency advantage)
```

**Chunk sizing guideline:** 256–512 tokens per chunk for most documents.
For code: chunk by function/class boundary, not by token count.

### Pattern 3 — Filesystem-as-Memory
From `context-engineering-collection` (muratcankoylan): Use the filesystem as an external
memory store that persists across agent runs and can be inspected by humans.

```
.agent-memory/
├── working/
│   └── current-task.json        ← wiped after task completion
├── episodes/
│   └── 2025-03-25-auth.json     ← written after task, never overwritten
├── semantic/
│   └── backend-patterns.json    ← versioned, periodically updated
└── index.json                   ← index of all episodes by domain + date
```

**Agent instruction for filesystem memory:**
```
At the start of each session:
  1. Read .agent-memory/index.json to find relevant past episodes
  2. Load the 2 most recent relevant episodes from .agent-memory/episodes/
  3. Load applicable semantic rules from .agent-memory/semantic/

At the end of each task:
  1. Write a new episode record to .agent-memory/episodes/
  2. If a new pattern was learned, update the relevant semantic file
  3. Update .agent-memory/index.json with the new episode entry
```

### Pattern 4 — Tool Output Compression
Tool outputs are often verbose. Compress before injecting:

```
Raw tool output → extract only fields relevant to current task
               → format as structured summary (not raw JSON dump)
               → inject compressed version; discard raw
```

Example: A database query returning 500 rows → summarise as:
`"Query returned 500 rows; relevant subset (matching user_id=42): 3 rows: {…}"`

---

## Context Compression Techniques

### Summarization (Periodic)
After every N turns (e.g., N=10), replace raw conversation history with a structured summary:

```
[CONVERSATION SUMMARY — turns 1–10]
- User goal: Refactor the payment module to use Stripe v3 API
- Decisions made: Use async handlers; keep existing error codes
- Progress: Auth endpoint done; charge endpoint in progress
- Open issues: Webhook verification not yet implemented
- Next step: Implement webhook handler
```

Retain the summary; discard the raw turns. Inject summary at the top of the context for
future turns.

### Structured Note-Taking (Anthropic pattern)
Rather than relying on conversation history for state, maintain explicit structured notes:

```xml
<agent_notes>
  <goal>Migrate payment module to Stripe v3</goal>
  <completed>auth_endpoint, charge_endpoint</completed>
  <in_progress>webhook_handler</in_progress>
  <decisions>
    <decision>Use async handlers throughout (agreed turn 3)</decision>
    <decision>Preserve existing error codes (agreed turn 5)</decision>
  </decisions>
  <blockers>Webhook secret not yet provided by user</blockers>
</agent_notes>
```

Update notes after every significant step. Notes replace the need to re-read long histories.

### Diff-Only Updates
When working on code, only inject the diff (what changed), not the full file:

```
Previous state: {function signature + docstring only}
Change applied: Added null-check on line 14; see diff below
{unified diff}
```

This keeps code context lean without losing traceability.

---

## Multi-Agent Context Coordination

From `subagent-driven-development` (obra/superpowers) +
`context-engineering-collection` (muratcankoylan):

### Context Isolation Rule
Each subagent receives a **minimal, fresh context** containing only:
1. Its specific task description
2. The input artifacts it needs (relevant files, schema, prior results)
3. Its output format and destination
4. Its status reporting protocol

Never give a subagent the full conversation history or the parent agent's working memory.

### Shared State via Files (not in-context)
When multiple subagents must share state:
- Use files, not context: subagent A writes to `output-a.json`; subagent B reads it
- Never inject subagent A's full context into subagent B
- The orchestrator reads outputs and decides what (compressed) information to pass forward

### Orchestrator Context Budget
The orchestrator agent must itself manage its context budget:
- Receive: task statuses (DONE / NEEDS_CONTEXT / BLOCKED) — short
- Receive: error summaries — not full stack traces
- Receive: diffs — not full file contents
- Maintain: its own structured notes about overall plan progress

### Synchronization Pattern for Parallel Agents
```
1. Orchestrator identifies N independent tasks
2. Dispatches N subagents simultaneously with isolated contexts
3. Waits for all N status reports
4. Resolves any BLOCKED or NEEDS_CONTEXT by injecting missing info
5. Merges results by reading output files (not by re-running subagents)
6. Updates plan status; dispatches next batch
```

---

## Sub-Agent Architecture for Long-Horizon Tasks (Anthropic)

For tasks spanning many steps or many context windows:

```
Session 1:  [Orchestrator] → reads plan → dispatches subagent batch 1
            [Subagent 1a] → completes task 1a → writes output → DONE
            [Subagent 1b] → completes task 1b → writes output → DONE
            [Orchestrator] → reads outputs → updates notes → end session

Session 2:  [Orchestrator] → reads notes + plan → dispatches batch 2
            … continues …
```

Each new session, the orchestrator re-reads its structured notes (not the full history)
to reconstruct state. This keeps the orchestrator's context fresh across session boundaries.

---

## Context Engineering Evaluation Rubric

Use this to audit any agent's context design:

```
Signal quality:
  □ Is every element in the context necessary for the current sub-task?
  □ Is the most critical constraint placed first AND last?
  □ Is tool output compressed to relevant fields only?
  □ Is conversation history replaced with structured summaries after N turns?

Retrieval:
  □ Is context injected just-in-time (not front-loaded)?
  □ Are retrieved chunks ranked and limited (top-K, not all)?
  □ Are stale or irrelevant documents excluded?

Memory:
  □ Is working memory structured and wiped after task completion?
  □ Are episodes written immediately after task completion?
  □ Are semantic patterns updated on a regular cadence?
  □ Is the memory index maintained for efficient retrieval?

Multi-agent:
  □ Does each subagent receive only its minimal necessary context?
  □ Is shared state passed via files, not in-context injection?
  □ Does the orchestrator use structured notes, not raw history?

Security:
  □ Is user-controlled content isolated from the instruction space?
  □ Are retrieved documents validated before injection?
  □ Are tool outputs sanitised before being re-injected?
```
