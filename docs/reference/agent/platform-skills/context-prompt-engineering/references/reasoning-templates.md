# Reasoning Templates Reference

> Load this file when you need canonical templates, decision guidance, strengths/limitations,
> or common failure modes for any named reasoning technique.
> Source: neolabhq/context-engineering-kit `thought-based-reasoning`, Wei et al. 2022,
> Yao et al. 2023, ReAct paper, dair-ai Prompt Engineering Guide.

---

## Decision Matrix — Which Technique to Use

| Situation | First choice | Fall-back |
|---|---|---|
| Arithmetic, symbolic logic, word problems | CoT (few-shot) | Zero-shot CoT |
| No examples available | Zero-shot CoT | Self-consistency |
| Multiple valid solution paths exist | ToT | Self-consistency |
| Single high-stakes answer needed | Self-consistency | CoT |
| Agent must call external tools mid-reasoning | ReAct | Least-to-most |
| Hierarchically decomposable problem | Least-to-most | CoT |
| Arithmetic requiring computation | PAL | CoT |
| Long-horizon agent with memory | Reflexion | Self-improving-agent patterns |
| Need to auto-generate CoT examples | Auto-CoT | Few-shot CoT |
| Complex multi-step planning | ToT + least-to-most | Decompose into plan tasks |

---

## 1. Chain-of-Thought (CoT) — Wei et al. 2022

**When to use:** Multi-step arithmetic, logical deduction, commonsense reasoning, any task
where showing intermediate steps improves accuracy or verifiability.

**Mechanism:** Provide few-shot exemplars that include explicit intermediate reasoning steps.
The model mimics the reasoning pattern, not just the final answer format.

**Canonical few-shot template:**
```
Q: Roger has 5 tennis balls. He buys 2 more cans of tennis balls.
   Each can has 3 tennis balls. How many tennis balls does he have now?
A: Roger started with 5 balls.
   2 cans × 3 balls per can = 6 balls.
   5 + 6 = 11 balls.
   The answer is 11.

Q: {your actual question}
A: [model generates reasoning chain]
```

**Key rule:** The exemplar answer must show *all* reasoning steps, not just the result.
Skipping steps in the exemplar teaches the model to skip them too.

**Strengths:**
- Large, consistent gains on arithmetic and commonsense benchmarks
- Reasoning steps are inspectable and correctable
- Works well with GPT-4 class models even with 1–2 exemplars

**Limitations:**
- Requires well-crafted exemplars; poor exemplars degrade performance
- Long reasoning chains consume token budget
- Model may produce plausible-sounding but incorrect intermediate steps

**Common failure mode:** The model produces confident but wrong intermediate steps and
arrives at an incorrect conclusion. Mitigation: use self-consistency (sample 3–5 paths,
majority-vote the final answer).

---

## 2. Zero-Shot CoT

**When to use:** No examples available, or when few-shot examples would be too long.

**Canonical template:**
```
{question}

Let's think through this step by step.
```

**Variants that also work:**
- "Let's work through this carefully."
- "Think step by step before giving your final answer."
- "Before answering, reason out loud."

**Tip:** For final-answer extraction, add: "Therefore, the final answer is:"
This cues the model to separate its reasoning from its conclusion.

**Strengths:** Zero setup cost; often surprisingly effective.

**Limitations:** Less reliable than few-shot CoT; model may not always generate
the level of detail needed.

---

## 3. Self-Consistency — Wang et al. 2022

**When to use:** High-stakes single answers where correctness matters more than speed.
Works best combined with CoT.

**Mechanism:** Sample the model 3–10 times with the same CoT prompt (temperature > 0),
then take the majority-vote answer across all samples.

**Template (system-level instruction):**
```
You will answer the following question by reasoning step by step.
Generate your reasoning and final answer. I will ask you this question multiple times
and take the most common answer.

Question: {question}
```

**Why it works:** Different reasoning paths sometimes reach the same correct answer.
Errors tend to be inconsistent; correct answers cluster. The majority vote filters noise.

**Cost note:** Requires N × normal token budget. Use only when answer quality justifies it.

**Strengths:** Significantly improves accuracy over single-sample CoT on arithmetic benchmarks.

**Limitations:** Expensive; majority voting can be wrong when the dominant error is systematic.

---

## 4. Tree of Thoughts (ToT) — Yao et al. 2023

**When to use:** Problems that require search, planning, or exploration of multiple
solution branches. Canonical examples: Game of 24, creative writing with constraints,
multi-step planning.

**Performance:** 4% → 74% success on Game of 24 with GPT-4 (vs standard prompting).

**Mechanism:** Maintain a tree of "thoughts" (intermediate reasoning states). At each node,
generate multiple candidate continuations, evaluate them, and selectively expand the
most promising branches. Supports DFS, BFS, or beam search.

**Simple BFS ToT prompt template (single-turn approximation):**
```
Consider this problem: {problem}

Generate 3 different high-level approaches:
Approach A: {approach}  →  Evaluation: [feasibility 1-10, reasoning]
Approach B: {approach}  →  Evaluation: [feasibility 1-10, reasoning]
Approach C: {approach}  →  Evaluation: [feasibility 1-10, reasoning]

Select the most promising approach and explain why.
Then fully solve the problem using that approach, showing all steps.
```

**Multi-turn ToT (for complex problems — requires orchestration loop):**
```
Turn 1: "Generate 3 candidate next steps from the current state: {state}"
Turn 2: "Evaluate each step: which is most promising? Why?" 
Turn 3: "Expand the chosen step. What are the next 3 candidates?"
… repeat until solution found or depth limit reached …
```

**Strengths:** Enables deliberate exploration and backtracking; outperforms CoT on
planning-heavy tasks; intermediate evaluations surface errors early.

**Limitations:** Much higher token cost than CoT; requires orchestration logic for
true multi-turn tree search; overkill for most everyday tasks.

---

## 5. ReAct — Yao et al. (Google Research)

**When to use:** Agents that must call tools (search, code execution, API calls)
interleaved with reasoning.

**Mechanism:** Interleave Thought steps (internal reasoning) with Action steps (tool calls)
and Observation steps (tool outputs). The cycle repeats until the model has enough
information to produce a final answer.

**Canonical loop template:**
```
Thought 1: I need to find the current population of Tokyo.
Action 1: search("Tokyo population 2025")
Observation 1: Tokyo metropolitan area population is approximately 37.4 million.
Thought 2: I now have the population. I need the population of Jakarta to compare.
Action 2: search("Jakarta population 2025")
Observation 2: Jakarta population is approximately 10.8 million.
Thought 3: Tokyo is roughly 3.5x larger. I can now answer the question.
Final Answer: Tokyo (37.4M) is approximately 3.5 times larger than Jakarta (10.8M).
```

**System prompt addition for ReAct agents:**
```
You have access to the following tools: {tool_list}
To use a tool, write: Action: tool_name(arguments)
After each action, you will receive an Observation.
Always think before acting. Format your thoughts as: Thought: {reasoning}
When you have enough information, write: Final Answer: {answer}
```

**⚠️ Critical caveat (Verma et al. 2024):** ReAct's performance gains are partially
attributable to exemplar–query similarity rather than the interleaved reasoning pattern
itself. This means:
- In-distribution exemplars → strong performance
- Out-of-distribution queries → degraded performance
- Test your exemplars against the actual query distribution you expect

**Strengths:** Natural fit for tool-using agents; Thought steps are inspectable;
reduces hallucination on factual tasks by grounding in real tool outputs.

**Limitations:** Brittle to exemplar mismatch; verbose; tool latency compounds across turns.

---

## 6. Least-to-Most Prompting

**When to use:** Tasks that decompose naturally into sub-problems where solving smaller
problems helps solve larger ones. Good for hierarchical or compositional tasks.

**Two-phase structure:**

Phase 1 — Decompose:
```
To solve {complex problem}, what simpler sub-problems do we need to solve first?
List them in the order they should be solved.
```

Phase 2 — Solve progressively (each sub-problem's answer feeds the next):
```
Sub-problem 1: {sub-problem}
Answer: {answer-1}

Sub-problem 2: {sub-problem} [using answer-1]
Answer: {answer-2}

…

Final problem: {original problem} [using all previous answers]
Final Answer: {answer}
```

**Strengths:** Excellent for length generalisation (solving longer versions of problems
the model was shown on shorter ones); makes dependencies explicit.

**Limitations:** Requires upfront decomposition step which may itself need guidance;
decomposition errors propagate to all subsequent steps.

---

## 7. Program-Aided Language Models (PAL)

**When to use:** Problems requiring precise arithmetic, symbolic computation, sorting,
combinatorics, or any task where code is more reliable than natural language reasoning.

**Mechanism:** Instead of computing the answer in natural language, the model writes a
Python (or other) program that computes it, then the interpreter executes the program.

**Canonical template:**
```
# Q: Olivia has $23. She bought five bagels for $3 each.
# How much money does she have left?

# Solution:
money_initial = 23
bagels = 5
bagel_cost = 3
money_spent = bagels * bagel_cost
money_left = money_initial - money_spent
print(money_left)  # Answer: 8
```

**System prompt pattern:**
```
Solve the following math problem by writing a Python program.
Write only the program — no prose explanation.
The last line should print the final answer.

Problem: {problem}
```

**Strengths:** Offloads computation to an interpreter → eliminates arithmetic errors;
programs are unambiguous and inspectable.

**Limitations:** Requires code execution capability; fails on problems that can't be
expressed as programs; model may write syntactically incorrect code.

---

## 8. Auto-CoT

**When to use:** You need few-shot CoT examples but don't have manually written ones.
Auto-CoT generates them automatically.

**Two steps:**
1. Cluster diverse questions from a question bank using k-means on embeddings
2. For each cluster centroid, prompt the model with "Let's think step by step" to
   auto-generate a reasoning chain; use these as few-shot examples

**Quick approximation (single prompt):**
```
For each of the following diverse questions, generate a step-by-step solution.
These will be used as examples for solving similar questions.

Question 1: {diverse question 1}
Solution 1: Let's think step by step…

Question 2: {diverse question 2}
Solution 2: Let's think step by step…
```

Then use the generated Q+A pairs as few-shot exemplars for your actual task.

**Strengths:** Eliminates manual exemplar creation; diversity ensures broad coverage.

**Limitations:** Auto-generated chains may contain errors; quality depends on the
diversity of the source question bank.

---

## 9. Reflexion

**When to use:** Long-horizon agents that need to learn from their own failures across
turns or episodes. Requires external memory store.

**Mechanism:**
1. Agent attempts a task and produces an output
2. Agent evaluates its own output against success criteria (or receives external evaluation)
3. Agent writes a "reflection" — a natural language analysis of what went wrong and why
4. Reflection is stored in external memory
5. On next attempt, agent retrieves relevant reflections and uses them to avoid past mistakes

**Reflection prompt template:**
```
You just attempted the following task: {task}
Your output was: {output}
The evaluation result was: {success/failure + details}

Write a reflection (3–5 sentences) that:
1. Identifies the specific mistake or gap
2. Explains why it happened
3. States what you will do differently next time

Begin your reflection with: "I failed because..."
```

**Memory retrieval prompt:**
```
Before attempting this task, review your past reflections on similar tasks:
{retrieved_reflections}

Given these lessons, what will you do differently this time?
Plan your approach before executing.
```

**Strengths:** Enables learning from failure without model fine-tuning; reflections are
human-readable and debuggable; especially powerful for code generation and agentic tasks.

**Limitations:** Requires external memory infrastructure; reflection quality depends on
the model's ability to accurately self-evaluate; can accumulate stale or contradictory
reflections over time (requires pruning).

---

## Common Mistakes and Fixes

| Mistake | Why it happens | Fix |
|---|---|---|
| Using CoT for simple factual recall | CoT adds noise for questions with direct answers | Use zero-shot for simple questions; CoT only when steps help |
| Exemplars that skip reasoning steps | Laziness in prompt writing | Every exemplar answer must show ALL steps |
| ToT on straightforward tasks | Over-engineering | ToT is only worth the token cost for planning/search tasks |
| ReAct exemplars don't match your query distribution | Borrowed from tutorials | Write exemplars from your own task domain |
| Self-consistency on subjective tasks | Majority vote doesn't apply to style/creativity | Self-consistency is for tasks with objectively correct answers |
| PAL on qualitative tasks | Trying to turn everything into code | PAL works for computation; use CoT for qualitative reasoning |
| Reflexion without structured memory | Reflections get lost or contradicted | Always store reflections in a structured, retrievable format |
| Zero-shot CoT without final answer extraction cue | Model buries answer in reasoning text | Add: "Therefore, the final answer is:" as the last line |

---

## Reasoning Technique Selector (Flowchart)

```
Does the task require external tools or real-time data?
  └─ Yes → ReAct

Is the answer objectively correct/incorrect?
  ├─ No → CoT or ToT for structure; no self-consistency
  └─ Yes:
       Does it involve arithmetic or symbolic computation?
         └─ Yes → PAL (if interpreter available) else CoT
       Does it involve multiple valid solution paths?
         └─ Yes → ToT (if planning) or Self-Consistency (if single answer)
       Is it a decomposable hierarchy?
         └─ Yes → Least-to-most
       Is it a standard multi-step reasoning problem?
         └─ Yes (with examples) → CoT few-shot
         └─ Yes (no examples)  → Zero-shot CoT
       Is the agent running over multiple episodes with memory?
         └─ Yes → Reflexion
```
