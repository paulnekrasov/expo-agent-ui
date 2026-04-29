# Prompt and Context Engineering Patterns in Skills.sh and the Wider Ecosystem

## Full Skill Index with Prompt Engineering Assessment

This section indexes the most prominent skills surfaced on the skills.sh leaderboard at research time, grouped by repository, and categorizes each through a prompt‑engineering lens: **Direct** (explicitly about prompting/agent behavior), **Implicit** (strong instruction patterns but domain‑focused), **Negative** (contains instruction anti‑patterns), or **Not Relevant**.[^1]

### vercel-labs/skills and vercel-labs/agent-skills

| Skill | URL | Relevance | Notes |
| --- | --- | --- | --- |
| find-skills | https://skills.sh/vercel-labs/skills/find-skills | Direct | Teaches an agent how to interpret user intent, search skills.sh, prioritize high-signal skills (leaderboard first), and present options with clear metadata, which is essentially meta-prompt routing.[^2][^3] |
| vercel-react-best-practices | https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices | Implicit | Encodes patterns for React usage and structure; demonstrates concise “when to use” and sectional guidance that model prompts can mirror.[^4][^5] |
| web-design-guidelines | https://skills.sh/vercel-labs/agent-skills/web-design-guidelines | Implicit | Domain guide that uses checklists and structured sections (layout, hierarchy, accessibility); useful as a template for designing detailed, constraint‑rich prompts.[^6][^7] |
| vercel-composition-patterns | skills.sh/vercel-labs/agent-skills/vercel-composition-patterns | Implicit | Describes composition and code-organization patterns with explicit do/don’t examples—good example of instruction specificity. |
| vercel-react-native-skills | skills.sh/vercel-labs/agent-skills/vercel-react-native-skills | Implicit | Similar structure to other vercel-labs skills; reinforces modular, sectioned guidance. |
| deploy-to-vercel | skills.sh/vercel-labs/agent-skills/deploy-to-vercel | Not Relevant | Primarily deployment commands and steps; limited reusable prompt patterns beyond standard procedural instructions. |

### anthropics/skills

| Skill | URL | Relevance | Notes |
| --- | --- | --- | --- |
| skill-creator | https://skills.sh/anthropics/skills/skill-creator | Direct | End-to-end guide for designing, evaluating, and iterating skills; covers capturing user intent, progressive disclosure, output templates, and test-case design—essentially a meta‑prompt‑engineering manual.[^8][^9][^10] |
| template-skill | skills.sh/anthropics/skills/template-skill | Direct | Shows canonical SKILL.md structure with YAML front‑matter, “when to use,” and layered references; a strong reference for writing reusable meta-prompts. |
| frontend-design | https://skills.sh/anthropics/skills/frontend-design | Implicit | Encodes UI/UX heuristics in a structured way (sections, checklists, examples), demonstrating “prompt as design standard.”[^11] |
| pptx / docx / xlsx | skills.sh/anthropics/skills/pptx (and docx/xlsx variants) | Implicit | Show how to specify multi-step document workflows and output formats (sections, slide structure), useful as exemplars for output-spec prompts. |
| webapp-testing | skills.sh/anthropics/skills/webapp-testing | Implicit | Testing workflow skill with explicit phases and checklists; good reference for “phased reasoning” prompts. |
| algorithmic-art | skills.sh/anthropics/skills/algorithmic-art | Implicit | Uses constrained creative prompts (parameters, steps) to shape model output space. |
| web-artifacts-builder | skills.sh/anthropics/skills/web-artifacts-builder | Implicit | Demonstrates how to structure instructions for building multi‑file artifacts with clear responsibilities and file mapping. |
| theme-factory / brand-guidelines | skills.sh/anthropics/skills/theme-factory | Implicit | Turn fuzzy brand ideas into systematized tokens and rules; strong example of transforming vague input to structured spec. |
| internal-comms, canvas-design, mcp-builder, slack-gif-creator | skills.sh/anthropics/skills/* | Implicit | All follow a consistent, disciplined pattern: when‑to‑trigger, multi‑step workflows, and explicit output structures. |

### obra/superpowers

These are among the most sophisticated prompt/context-engineering skills in the library.[^12][^13]

| Skill | URL | Relevance | Notes |
| --- | --- | --- | --- |
| using-superpowers | https://skills.sh/obra/superpowers/using-superpowers | Direct | Defines a global instruction-priority scheme (user > skills > system), a decision graph for when to invoke skills, and anti‑rationalization patterns—essentially a meta-controller prompt for agents.[^14][^15] |
| brainstorming | skills.sh/obra/superpowers/brainstorming | Direct | Socratic design skill emphasizing question-batching, explicit spec formation, and file-backed design docs; a canonical example of structured discovery prompting.[^12] |
| writing-plans | https://skills.sh/obra/superpowers/writing-plans | Direct | Teaches agents to decompose work into 2–5 minute tasks with exact file paths, commands, TDD steps, and a mandated plan header; an exemplary decomposition and specification prompt.[^16][^17] |
| subagent-driven-development | https://skills.sh/obra/superpowers/subagent-driven-development | Direct | Encodes a multi-agent orchestration pattern: fresh subagent per task, explicit graph of states, and two-stage review (spec then quality) with clear status handling.[^18][^19] |
| executing-plans | skills.sh/obra/superpowers/executing-plans | Direct | Shows an alternative execution harness with explicit steps for loading, reviewing, and executing plan tasks while tracking state.[^20][^21] |
| systematic-debugging | https://skills.sh/obra/superpowers/systematic-debugging | Direct | Four-phase debugging workflow (root cause, pattern analysis, hypothesis, implementation) with iron laws, red flags, and escalation rules—chain-of-thought and decision gating encoded as instructions.[^22][^23][^24] |
| verification-before-completion | https://skills.sh/obra/superpowers/verification-before-completion | Direct | Hardens agents against “wishful” completion; mandates evidence before claims with a gate function and explicit anti‑rationalization table—an important pattern for reducing hallucinations.[^22] |
| dispatching-parallel-agents | skills.sh/obra/superpowers/dispatching-parallel-agents | Direct | Describes safe concurrent use of subagents, including task partitioning and synchronization; relevant to agentic orchestration prompts. |
| requesting-code-review / receiving-code-review | skills.sh/obra/superpowers/requesting-code-review | Direct | Turn code review into structured checklists and response protocols, good templates for rubric-based evaluation prompts.[^12] |
| finishing-a-development-branch | skills.sh/obra/superpowers/finishing-a-development-branch | Implicit | Wraps up multi-task work with final verification and clean-up; reinforces “no silent assumptions” pattern. |
| test-driven-development | skills.sh/obra/superpowers/test-driven-development | Direct | Encodes RED–GREEN–REFACTOR as mandatory workflow; great for teaching agents to write tests before code. |

### charon-fan/agent-playbook

| Skill | URL | Relevance | Notes |
| --- | --- | --- | --- |
| self-improving-agent | https://skills.sh/charon-fan/agent-playbook/self-improving-agent | Direct | Proposes a multi-memory architecture (semantic, episodic, working) and a self-improvement loop (experience extraction → pattern abstraction → skill updates), with explicit templates and evolution markers—an advanced context-engineering pattern.[^25][^24] |

### google-labs-code/stitch-skills

| Skill | URL | Relevance | Notes |
| --- | --- | --- | --- |
| enhance-prompt | https://skills.sh/google-labs-code/stitch-skills/enhance-prompt | Direct | Explicit prompt-engineering skill: transforms vague UI ideas into structured prompts via an “enhancement pipeline” table (Platform, Page Type, Structure, Style, Colors, Components) and examples of vague vs enhanced phrasings.[^26][^27][^28] |
| design-md | skills.sh/google-labs-code/stitch-skills/design-md | Implicit | Demonstrates how to turn design system knowledge into a single DESIGN.md artifact referenced by other prompts; strong example of offloading context into files. |
| stitch-loop | skills.sh/google-labs-code/stitch-skills/stitch-loop | Implicit | Encodes multi-iteration UI generation workflow; valuable for understanding iterative prompt loops. |
| remotion | skills.sh/google-labs-code/stitch-skills/remotion | Implicit | Similar structure to other domain skills: clear “when to use,” references, and sectioned guidance. |

### nextlevelbuilder/ui-ux-pro-max-skill

| Skill | URL | Relevance | Notes |
| --- | --- | --- | --- |
| ui-ux-pro-max | https://skills.sh/nextlevelbuilder/ui-ux-pro-max-skill/ui-ux-pro-max | Implicit | Highly structured “design intelligence” skill: defines actions, project types, elements, styles, topics, and a decision table for when to apply; excellent example of encoding a design assistant’s behavior and context-selection logic.[^29][^30][^31] |

### remotion-dev/skills

| Skill | URL | Relevance | Notes |
| --- | --- | --- | --- |
| remotion-best-practices | https://skills.sh/remotion-dev/skills/remotion-best-practices | Implicit | Domain knowledge base organized as rule files; demonstrates hierarchical reference design where the SKILL.md routes to narrower docs by need.[^32] |

### supercent-io/skills-template

This repository powers many similarly structured skills (security-best-practices, data-analysis, web-accessibility, workflow-automation, code-review, database-schema-design, backend-testing, technical-writing, api-documentation, api-design, performance-optimization, task-planning, responsive-design, testing-strategies, deployment-automation, monitoring-observability, copilot-coding-agent, git-workflow, file-organization, changelog-maintenance, etc.).

| Representative Skill | URL | Relevance | Notes |
| --- | --- | --- | --- |
| code-review | skills.sh/supercent-io/skills-template/code-review | Implicit | Uses explicit checklists and sections (readability, correctness, security, performance) and prescribes output structure, making it a strong example of rubric-based prompting. |
| technical-writing | skills.sh/supercent-io/skills-template/technical-writing | Implicit | Provides tone, structure, and clarity guidelines; shows how to specify voice and formatting demands. |
| api-documentation | skills.sh/supercent-io/skills-template/api-documentation | Implicit | Tightly defines sections (Overview, Authentication, Endpoints, Examples) that mirror ideal prompt output specs. |

### inferen-sh/skills

| Skill | URL | Relevance | Notes |
| --- | --- | --- | --- |
| prompt-engineering | https://skills.sh/inference-sh/skills/prompt-engineering | Direct | Compact but well-structured guide that defines a base prompt schema `[Role/Context] + [Task] + [Constraints] + [Output Format]` and then illustrates role prompting, task clarity (bad vs good examples), CoT phrasing, few-shot examples, output formatting, constraint setting, and multi-turn reasoning across code, text, and media generation.[^33] |

### giuseppe-trisciuoglio/developer-kit

| Skill | URL | Relevance | Notes |
| --- | --- | --- | --- |
| prompt-engineering | https://skills.sh/giuseppe-trisciuoglio/developer-kit/prompt-engineering | Direct | Deep, production-oriented prompt-engineering manual covering few-shot selection strategies, CoT scaffolds, optimization workflows with metrics and A/B testing, modular template architectures, and system prompt design; also encodes multi-step workflows for creating, optimizing, and scaling prompt systems with explicit QA standards.[^34] |

### muratcankoylan/agent-skills-for-context-engineering

| Skill | URL | Relevance | Notes |
| --- | --- | --- | --- |
| context-engineering-collection | https://skills.sh/muratcankoylan/agent-skills-for-context-engineering/context-engineering-collection | Direct | Collection skill that reframes context as full agent state (system instructions, tools, retrieved docs, history, outputs) and covers context degradation patterns, multi-agent coordination, memory architectures, filesystem-as-memory patterns, context compression, and evaluation frameworks—effectively a compact field guide to context engineering for production agents.[^35] |

### neolabhq/context-engineering-kit

| Skill | URL | Relevance | Notes |
| --- | --- | --- | --- |
| thought-based-reasoning | https://skills.sh/neolabhq/context-engineering-kit/thought-based-reasoning | Direct | Encyclopedic catalog of reasoning prompts (CoT, zero-shot CoT, self-consistency, ToT, least-to-most, ReAct, PAL, Auto-CoT, Reflexion) with when-to-use guidance, canonical templates, strengths/limitations, and a decision matrix—essentially a skill-encoded survey of modern reasoning and prompting techniques.[^36] |

### other notable repos

- **wshobson/agents** – Skills like tailwind-design-system, typescript-advanced-types, api-design-principles, python-performance-optimization, nodejs-backend-patterns encode best practices and can be reused as structured checklists and style guides (Implicit relevance).
- **pbakaus/impeccable** – Skills such as polish, critique, distill, arrange, and typeset show micro‑prompt patterns for text/design refinement (Implicit relevance).
- **expo/skills, antfu/skills, vercel/turborepo, excalidraw/excalidraw-diagram-generator** – Primarily domain best practices and generators; generally Implicit relevance (well-structured but not about prompting itself).

Across all sampled skills, there were few truly poor instruction patterns; most negative signals were minor, such as partial duplication or slightly vague summaries without explicit output schemas, rather than fundamentally harmful prompt structures.[^23][^1]


## Top 8–10 Skills for Prompt and Context Engineering

These skills are ranked by how much they teach about prompt design, context structuring, and agent behavior—either explicitly (Direct) or via very strong implicit patterns.

| Rank | Skill | URL | Why it made the list | Relevance | Difficulty |
| --- | --- | --- | --- | --- | --- |
| 1 | skill-creator | https://skills.sh/anthropics/skills/skill-creator | Comprehensive playbook for designing, iterating, and evaluating skills: captures user intent, interviews for edge cases, defines SKILL.md anatomy, progressive disclosure, example formatting, writing style, and test/eval loops—perfect for systematic prompt and skill design.[^8][^9][^10][^37] | Direct | Advanced |
| 2 | using-superpowers | https://skills.sh/obra/superpowers/using-superpowers | Establishes a global discipline for skill invocation: decision graph, instruction-priority ordering, mandatory skill checks, and red‑flag rationalizations; effectively a meta‑system prompt for multi-skill agents.[^14][^15][^13] | Direct | Intermediate |
| 3 | writing-plans | https://skills.sh/obra/superpowers/writing-plans | Canonical example of decomposition prompts: mandatory plan header, file‑level mapping, 2–5 minute task granularity, embedded TDD cycle, and review loops—perfect for learning structured planning prompts.[^16][^12][^17] | Direct | Intermediate |
| 4 | subagent-driven-development | https://skills.sh/obra/superpowers/subagent-driven-development | Demonstrates how to orchestrate subagents with isolated context, status protocols (DONE/NEEDS_CONTEXT/BLOCKED), and two-stage review; great for understanding agentic workflows and context slicing.[^18][^19][^38] | Direct | Advanced |
| 5 | systematic-debugging | https://skills.sh/obra/superpowers/systematic-debugging | Embeds a four-phase reasoning scaffold, including iron laws, pattern analysis, hypothesis test loops, architecture escalation, and red-flag phrases—one of the clearest examples of chain-of-thought and decision gating encoded as instructions.[^22][^23][^24][^39] | Direct | Intermediate |
| 6 | verification-before-completion | https://skills.sh/obra/superpowers/verification-before-completion | Focuses on evidence before claims, defining a gate function, common failures, and rationalization-prevention patterns; ideal for learning how prompts can enforce verification and reduce hallucinations.[^22][^23] | Direct | Intermediate |
| 7 | simple (Fun Brainstorming) | https://skills.sh/roin-orca/skills/simple | Shows how to do fast but disciplined ideation: batched clarifying questions, two-option trade‑off proposals, explicit convergence, and capture; an accessible template for “lightweight but structured” prompts.[^40][^41] | Direct | Beginner–Intermediate |
| 8 | enhance-prompt | https://skills.sh/google-labs-code/stitch-skills/enhance-prompt | Explicit prompt‑engineering skill that converts vague UI requests into Stitch‑ready prompts via a tabular enhancement pipeline, design-system integration, and examples of vague vs precise language.[^26][^27][^28][^42] | Direct | Intermediate |
| 9 | ui-ux-pro-max | https://skills.sh/nextlevelbuilder/ui-ux-pro-max-skill/ui-ux-pro-max | Rich example of domain design intelligence: enumerates triggers, scenarios, actions, styles, and decision tables for when/how to apply the skill—excellent for studying how to encode large design spaces into prompts.[^29][^30][^31][^43] | Implicit | Intermediate |
| 10 | find-skills | https://skills.sh/vercel-labs/skills/find-skills | Teaches meta‑routing: understand user need, consult leaderboard, search for skills, and present options with metadata and install commands; captures a generic “tool discovery” prompt pattern.[^4][^2][^3][^7] | Direct | Beginner |

Other near‑misses include self-improving-agent (for multi‑memory context design), skill-vetter (for security and safety patterns), and the newly analyzed prompt-engineering skills (inference-sh and developer-kit) and context-engineering-collection, which are excellent resources for focused deep dives once the top 10 patterns are understood.[^44][^25][^33][^34][^35]


## Combination Candidates: "Ultimate Prompt and Context Engineering Skill"

### Skills to Combine

An “ultimate” prompt and context engineering skill could be built by combining and refactoring the following:

- **skill-creator** – skill anatomy, capturing intent, progressive disclosure, eval loops.[^8][^9][^10]
- **using-superpowers** – global discipline for when and how skills apply, and instruction priority.[^14][^15]
- **writing-plans** – decomposition, task granularity, plan header, and handoff to execution.[^16]
- **subagent-driven-development** – multi-agent orchestration, context scoping, and review workflows.[^18][^19]
- **systematic-debugging** – phased reasoning and root-cause methodology.[^22][^24]
- **verification-before-completion** – verification gates and anti‑rationalization rules.[^22]
- **simple** – lightweight brainstorming, batched clarifying questions, and convergence loop.[^40][^41]
- **enhance-prompt** – explicit prompt‑enhancement pipeline and examples of vague vs precise phrasing.[^26][^28]
- **self-improving-agent** – multi-memory architecture and evolution markers for long‑term improvement.[^25]
- **skill-vetter** – security and safety vetting of prompts/skills.[^44]

### Proposed End-to-End Coverage

The merged “Ultimate Prompt and Context Engineering” skill would cover:

1. **Prompt Foundations** – principles of clarity, specificity, and structured output, with examples of good vs bad prompts in multiple domains.[^45][^46][^47]
2. **Discovery and Clarification** – when and how to brainstorm (simple + brainstorming), including batched questions, user intent capture, and aligning on success criteria.[^41][^40][^12]
3. **Planning and Decomposition** – using writing-plans patterns to define plan headers, file maps, and 2–5 minute tasks, plus how to embed verification steps inside plan tasks.[^17][^16]
4. **Execution and Orchestration** – when to choose single‑agent vs subagent-driven workflows, how to build prompts for implementer/spec/quality reviewers, and how to handle statuses like BLOCKED or NEEDS_CONTEXT.[^20][^19][^18]
5. **Reasoning Frameworks** – systematic-debugging’s four phases, CoT-style step‑by‑step reasoning, and tree-of-thought style branching for ambiguous tasks.[^48][^49][^50][^22]
6. **Verification and Guardrails** – verification-before-completion’s gate function, regression test prompts, and prompting agents to report evidence rather than beliefs.[^45][^22]
7. **Prompt Enhancement and Style** – enhance-prompt’s table-driven upgrades, plus examples for non‑UI domains (code, analysis, writing) using similar pipelines.[^51][^26]
8. **Context Engineering and Memory** – self-improving-agent’s semantic/episodic/working memory patterns and external context design (offloading to files, RAG docs, eval logs), plus context-engineering-collection’s framing of context as full agent state.[^52][^53][^35][^25]
9. **Skill and Prompt Lifecycle** – skill-creator inspired loops for drafting, evaluating, A/B testing, and refining prompts and skills over time.[^54][^9][^37]
10. **Security and Anti-Patterns** – skill-vetter’s vetting protocol, plus prompt-injection and jailbreak mitigation patterns.[^55][^56][^57][^58][^44]

### Suggested Title and Structure

**Proposed Title**

> **ultimate-prompt-and-context-engineering** – End-to-end discipline for designing, executing, and evolving safe, high‑leverage prompts and skills.

**Suggested SKILL.md Structure**

1. **Overview and Core Principles**
   - Clarity, specificity, verification, and context economy.
2. **When to Use This Skill**
   - Meta-skill: always in play when designing or modifying prompts/skills, or orchestrating multi-step work.
3. **Phase 1 – Clarify Intent and Constraints**
   - Discovery questions, batched clarifications, user‑approved goal statement.
4. **Phase 2 – Design Prompt/Skill Skeleton**
   - Role, “when to trigger,” output format, context requirements, constraints.
5. **Phase 3 – Decompose and Orchestrate**
   - Plan structure (if needed), single vs multi-agent selection, context slicing.
6. **Phase 4 – Implement and Verify**
   - Chain-of-thought or ToT templates, verification-before-completion gates, evidence reporting.
7. **Phase 5 – Evaluate and Improve**
   - Test cases, eval datasets, A/B prompt tests, metrics, semantic/episodic memory updates.
8. **Phase 6 – Secure and Harden**
   - Vetting protocol, prompt injection/jailbreak countermeasures, permission minimization.
9. **Reference Patterns and Examples**
   - Annotated prompt examples across domains (coding, analysis, design, support).


## External Research Findings

### Foundational Prompting Techniques

| Resource | Type | Core Insight | Community Signal |
| --- | --- | --- | --- |
| **Chain-of-Thought Prompting Elicits Reasoning in Large Language Models** (Wei et al., 2022) | Paper | Shows that providing few-shot exemplars with explicit intermediate reasoning (“chain of thought”) dramatically improves performance on arithmetic, commonsense, and symbolic reasoning benchmarks compared to standard prompting.[^48][^59][^50] | Highly cited (26k+ citations reported in summaries) and widely referenced as the core CoT paper.[^59][^60] |
| **Tree of Thoughts: Deliberate Problem Solving with Large Language Models** (Yao et al., 2023) | Paper | Generalizes CoT into a search over “thoughts” (textual states) using tree search; enables deliberate exploration, backtracking, and self‑evaluation, boosting success on planning and search tasks (e.g., 4% → 74% on Game of 24 with GPT‑4).[^61][^62][^49][^63][^64] | Thousands of citations; GitHub repo with prompts and code (princeton-nlp/tree-of-thought-llm).[^61][^62] |
| **ReAct: Synergizing Reasoning and Acting in Language Models** | Paper & docs | Introduces ReAct prompting, which interleaves “Thought” and “Act” steps so the model both reasons and calls tools (e.g., search) repeatedly, improving QA and decision making versus CoT-only or Act-only baselines.[^65][^66][^67] | Prominent in practitioner guides; later work has critiqued its foundations and highlighted exemplar‑similarity effects.[^68][^69] |
| **On the Brittle Foundations of ReAct Prompting for Agentic Large Language Models** (Verma et al., 2024) | Paper | Finds via sensitivity analysis that ReAct’s gains often come more from exemplar–query similarity than from interleaved reasoning, cautioning that prompt designers may inadvertently rely on instance-specific examples.[^68][^69] | Recent but already discussed widely in practitioner summaries. |
| **Prompt Engineering Guide / PromptingGuide.ai** (dair.ai) | Repo & guide | Curated collection of techniques (zero-shot, few-shot, CoT, self-consistency, ReAct, ToT, RAG, agents) with examples and references; serves as a “catalog” of prompting strategies.[^70][^71][^72] | 50k+ GitHub stars reported in community posts; widely cited as the “gold standard” guide.[^72] |
| **OpenAI Best Practices for Prompt Engineering with the OpenAI API** | Official docs | Presents rules of thumb: use latest models; put instructions first; separate instructions and context with delimiters; be specific about desired format, style, length; use examples; and iterate with evals.[^73][^45] | Official vendor guidance, updated over time and referenced in derivative guides and repos.[^54] |
| **Microsoft Azure OpenAI Prompt Engineering Techniques** | Official docs | Emphasizes being specific and descriptive, repeating key constraints (“double down”), and using analogies; also covers techniques like few‑shot examples and stepwise prompting.[^74] | Official cloud-provider documentation for production Azure OpenAI deployments. |

### Context Engineering and Memory Practices

| Resource | Type | Core Insight | Community Signal |
| --- | --- | --- | --- |
| **Context Engineering Guide** (PromptingGuide.ai) | Guide | Frames context engineering as designing how an LLM sees information: writing, selecting, compressing, and injecting context; includes example meta-prompts for decomposing research into subtasks with structured JSON output.[^53] | Part of the dair.ai ecosystem; referenced in blogs and courses as a go‑to context guide. |
| **Context Engineering: Feeding a Nutritious Diet to Your LLM** (Fractal) | Blog | Argues that “context engineering” (system prompt, user input, short/long‑term memory, tools) is supplanting naive prompt engineering; defines four pillars: write, select, compress, and inject context.[^52] | Thought-leadership piece from an applied AI consultancy; cited in discussions of production agent design. |
| **From Prompt Engineering to Context Engineering** (BigDataBoutique) | Blog | Explains how modern systems combine prompts with retrieved documents, tool outputs, and conversation history; stresses that surrounding context can matter more than the literal prompt.[^75] | Practitioner blog for data/ML engineers; connects to RAG and tool‑calling practices. |
| **Prompt Strategies for Short-Term Memory and Context Windows** (APXML course excerpt) | Course material | Covers context window limits, primacy/recency effects, rolling history windows, summarization, and explicit context injection, with concrete strategies such as maintaining rolling windows and periodically summarizing history.[^76] | Tied to a structured course on prompt engineering for agent workflows. |
| **Context-Aware Prompt Scaling: Key Concepts (Latitude)** | Blog | Highlights adjusting prompt length and structure to model token limits, advocates summarization and template-based prompts, and defines context window as “short‑term memory.”[^77] | Written by a company focused on AI reliability/monitoring; positioned as best-practice advice. |
| **Context Engineering: From Better Prompts to Better Thinking** | Blog | Emphasizes MCP and tool-driven retrieval for long-horizon tasks, showing how storing state off-window and retrieving on demand outperforms massive in-prompt histories.[^78] | Practitioner article tying context engineering to modern tool ecosystems. |
| **Effective context engineering for AI agents** (Anthropic) | Engineering blog | Defines context engineering as optimizing the utility of tokens in the context window under architectural and computational constraints, introduces “attention budget” and “context rot,” advocates minimal high-signal tokens, structured system prompts at the “right altitude,” token-efficient tools, curated few-shot examples, just-in-time retrieval, compaction, structured note-taking, and sub-agent architectures for long-horizon tasks.[^79] | Official Anthropic engineering post, widely referenced in LinkedIn summaries, YouTube explainers, and secondary blogs on context engineering.[^80][^81][^82][^83] |

### Anti-Patterns and Failure Modes

| Resource | Type | Core Insight | Community Signal |
| --- | --- | --- | --- |
| **Prompt Anti-Patterns — When More Instructions May Harm Model Performance** (OpenAI Community) | Community discussion | Documents that piling on vague constraints (“be concise,” “avoid speculation”) without concrete definitions or examples can degrade performance, and rephrases “avoid speculation” into a more precise behavioral spec.[^84] | Lively community thread among OpenAI users; reflects practical debugging experience rather than theory. |
| **Lakera – The Ultimate Guide to Prompt Engineering in 2026** | Blog | Emphasizes that ambiguity is a primary cause of bad outputs; recommends precise, structured, goal‑oriented phrasing and explicitly defining format, scope, tone, and length.[^47] | From a security/LLM-safety vendor; referenced in other blogs and talks. |
| **The 12 Prompt Engineering Techniques Every PM Should Use** | Long-form guide | Frames prompts as specifications rather than vague instructions and warns against naive patterns like generic “be helpful/ethical” prompts that do not constrain behavior meaningfully.[^85] | Product‑management focused audience; widely shared as a “masterclass” article. |
| **Prompt Injection vs. Jailbreaking: What's the Difference?** (LearnPrompting) | Blog | Distinguishes prompt injection (attacking app architecture by smuggling instructions) from jailbreaking (attacking model safety guardrails) with concrete examples and mitigations.[^57] | From the LearnPrompting.org project; common reference in security discussions. |
| **Prompt Injection vs Jailbreaking: What's the Difference?** (promptfoo) | Blog | Reinforces the injection vs jailbreak distinction, maps common jailbreak techniques (role-play, hypotheticals, encoding tricks), and focuses on how to test/defend applications.[^58] | From a testing/eval tool vendor; used in security and evaluation communities. |
| **LLM Vulnerability Series: Direct Prompt Injections and Jailbreaks** (Lakera) | Blog | Surveys jailbreak prompts (e.g., DAN) and recommends privilege control and input/output sanitization as guardrails.[^56] | Popular security blog series with concrete examples and defensive patterns. |
| **Prompt Injection Techniques: Jailbreaking via FlipAttack** (Keysight) | Blog | Describes FlipAttack, which uses flipped characters/words to disguise malicious prompts and shows high success rates against models and guardrails, underscoring the brittleness of naive filtering.[^86] | Based on a peer-reviewed paper and independent security research; shows up in vulnerability roundups. |
| **A Systematic Evaluation of Prompt Injection and Jailbreak Defenses** | Paper | Surveys mitigation strategies like system prompt hardening, behavior‑based anomaly detection, signed prompts, and rejection‑conditioned training, emphasizing that no single technique suffices.[^55] | Academic work aggregating and evaluating multiple defenses and frameworks. |

### Community Knowledge and Practitioner Toolkits

| Resource | Type | Core Insight | Community Signal |
| --- | --- | --- | --- |
| **dair-ai/Prompt-Engineering-Guide (GitHub)** | Repo | Central index of tutorials, papers, and example notebooks on prompting, RAG, and agents; links to PromptingGuide.ai as the canonical website.[^70][^71] | 50k+ GitHub stars and millions of users reported in community discussions.[^72][^87][^88] |
| **prompt-blueprint (OpenAI best practices distilled)** | Repo/guide | Translates OpenAI’s best-practices into a “prompt blueprint” with core principles (clear instructions, grounding context, break tasks down, “give the model time to think”), plus tool‑use patterns and systematic A/B testing guidance.[^54] | Used as an enterprise meta-prompt toolkit; aligns directly with OpenAI docs. |
| **A guide to OpenAI prompt engineering (eesel)** | Blog | Provides concrete before/after examples (e.g., generic “summarize this ticket” vs persona+audience+structured bullet list) and advocates treating prompts as job descriptions with format requirements.[^46] | Appears in search as a 2026 guide; referenced for non‑developer audiences. |
| **Prompt Engineering Guide (Myriam Tisler)** | Guide | 2025-oriented guide with best practices, input-output examples, and a cheat sheet; stresses concise prompts and “periodic recaps” for long contexts.[^89] | Independent but widely shared in blogs and newsletters. |
| **Context Engineering: Memory and Context Window (BigDataBoutique)** | Blog | Highlights that prompts are only a slice of the information environment, and focuses on external tools, retrieval, and agent state as core design problems.[^75] | Aimed at engineers building production systems; referenced in RAG/context talks. |
| **YouTube: Instruction Clarity and Output Formatting** | Video | Long-form explanation that treats prompts as specs, arguing that ambiguity, conflicting requirements, and unspecified formats expand the distribution of outputs; promotes explicit audience, structure, and formatting.[^90] | Educational video targeted at beginners; content aligns with other written guides. |

## Additional Skills from skills.sh Prompt/Context Searches

Targeted searches on skills.sh for “prompt-engineering” and “context-engineering” surface several additional skills that function as compact, high-signal textbooks on effective prompting and context design.[^33][^34][^35][^36]

- **inference-sh/skills – prompt-engineering.** Focuses on a simple but powerful base schema `[Role/Context] + [Task] + [Constraints] + [Output Format]`, then demonstrates role prompting, good vs bad task phrasing, explicit output-format prompts (JSON, bullet points), constraint setting (length limits, focus), and multi-turn reasoning and refinement; it also extends these patterns to image and video generation via domain-specific slot structures like `[Subject] + [Style] + [Composition] + [Lighting] + [Technical]`.[^33]
- **giuseppe-trisciuoglio/developer-kit – prompt-engineering.** Acts as a full-stack prompt-engineering framework: it formalizes few-shot example selection (semantic diversity, edge cases, ordering), CoT prompting with verification and self-consistency, rigorous optimization workflows with metrics and A/B tests, modular template architectures for system/user prompts, and system-prompt design checklists for behavior, outputs, safety, and constraints, along with three concrete workflows (create, optimize, scale) and explicit QA/performance standards for production use.[^34]
- **muratcankoylan/agent-skills-for-context-engineering – context-engineering-collection.** Encodes context engineering as a systems discipline: defines context as full agent state, describes degradation phenomena (lost-in-the-middle, U-shaped attention, poisoning, distraction), and provides patterns for multi-agent coordination, memory systems (vector vs graph vs filesystem), filesystem-as-memory techniques, tool design, context compression and optimization, and evaluation rubrics; it effectively bridges high-level context concepts with concrete agent-architecture patterns.[^35]
- **neolabhq/context-engineering-kit – thought-based-reasoning.** Serves as a skill-embedded survey of modern reasoning and prompting methods (CoT, zero-shot CoT, self-consistency, Tree of Thoughts, least-to-most, ReAct, PAL, Auto-CoT, Reflexion) with “when to use,” canonical templates, strengths/limitations, a decision matrix, best practices, and a table of common mistakes and fixes, making it especially valuable for learning how and when to apply each reasoning pattern in practice.[^36]

Together, these skills complement the earlier top-10 list by providing:

- **Concrete prompt blueprints** (inference-sh and developer-kit) that can be adapted directly into system or user prompts for many domains.
- **Context-architecture guidance** (context-engineering-collection) for multi-agent systems and production agents.
- **Reasoning-technique catalogs** (thought-based-reasoning) that map research papers into immediately usable prompt templates and selection heuristics.[^35][^36]


## Synthesis: Practical Field Guide

The following learning path blends the strongest skills from skills.sh with the best external resources into a practical, staged curriculum for prompt and context engineering.

### Stage 1 – Prompt Fundamentals and Clarity

1. **Study official best practices.**
   - Read OpenAI’s prompt engineering best-practices, focusing on instruction placement, delimiters, and specificity.[^73][^45]
   - Skim Microsoft’s Azure OpenAI prompt-engineering page for additional phrasing heuristics (be specific, be descriptive, double down).[^74]
2. **Walk through foundational guides.**
   - Use dair-ai’s Prompt-Engineering-Guide and PromptingGuide.ai to get a mental map of techniques (zero-shot, few-shot, CoT, self-consistency, ReAct, ToT).[^70][^71][^72]
   - Use prompt-blueprint to see these practices rendered as reusable meta-prompts and testing strategies.[^54]
3. **Practice clarity and structure.**
   - Apply examples from eesel’s prompt guide and Lakera’s 2026 guide to rewrite vague prompts into persona+goal+format prompts across domains you care about.[^46][^47]
   - Use enhance-prompt as a concrete pipeline for upgrading vague UI prompts to structured ones; generalize this table-driven approach to non‑UI tasks.[^28][^26]

**Goal for this stage:** You should be able to consistently write clear, specific prompts with explicit output formats and understand the main named techniques (CoT, ToT, ReAct) at a conceptual level.[^66][^49][^48]

### Stage 2 – Decomposition, Planning, and Reasoning Frameworks

1. **Learn to decompose tasks.**
   - Study writing-plans to see how complex engineering work is decomposed into 2–5 minute tasks with precise file paths, commands, and verification steps.[^16][^17]
   - Take a real multi-step project and write an “Implementation Plan” using the mandated header and task structure from the skill.[^16]
2. **Adopt systematic reasoning.**
   - Use systematic-debugging as a canonical chain-of-thought framework: always root-cause first, then pattern analysis, hypothesis, and minimal tests.[^24][^39][^22]
   - Map these phases to CoT and ToT ideas from the Wei and Yao papers to understand how textual reasoning can mirror scientific debugging.[^49][^48]
3. **Practice lightweight planning.**
   - Use simple (Fun Brainstorming) to handle smaller design or product questions where heavy process is overkill; follow its Discover→Propose→Converge→Capture loop.[^40][^41]

**Goal for this stage:** You should be able to turn messy user goals into structured plans or reasoning paths, choosing between heavy and lightweight processes depending on task complexity.[^85][^12]

### Stage 3 – Context Engineering and Multi-Agent Orchestration

1. **Understand context as more than just “the prompt.”**
   - Read context-engineering guides from PromptingGuide.ai, Fractal, BigDataBoutique, and Anthropic to internalize the ideas of writing, selecting, compressing, and injecting context, as well as concepts like attention budgets, context rot, compaction, structured note-taking, and sub-agent architectures.[^53][^75][^79][^52]
   - Study APXML’s material on short-term memory and context windows, especially primacy/recency and rolling-history strategies.[^76]
2. **Learn skill and tool routing.**
   - Use using-superpowers to define a strict “skills first” discipline (if there’s even a 1% chance a skill applies, invoke it) and to respect instruction priority (user > skills > system).[^15][^14]
   - Study find-skills to see how an agent should search skills.sh, prioritize popular and audited skills, and present installs and commands to the user.[^2][^3]
3. **Practice subagent orchestration and context engineering in skills.**
   - Dive into subagent-driven-development to learn how to split plans into tasks, assign them to implementer/spec/quality subagents, and manage statuses like DONE, DONE_WITH_CONCERNS, NEEDS_CONTEXT, and BLOCKED.[^19][^18]
   - Combine these patterns with context-engineering-collection’s framing of context fundamentals, degradation, filesystem-based memory, and compression/optimization techniques to design realistic multi-agent workflows.[^35]
4. **Experiment with reasoning techniques.**
   - Use thought-based-reasoning as a practical catalog of CoT, ToT, ReAct, PAL, least-to-most, and Reflexion templates, and cross-check them with the corresponding research papers; practice choosing techniques using its decision matrix and best-practice tips.[^65][^61][^48][^36]

**Goal for this stage:** You should be comfortable designing prompts that coordinate tools/skills, manage limited context windows, and orchestrate multiple agents or roles across a workflow, while selecting appropriate reasoning techniques for each task.[^77][^78][^35]

### Stage 4 – Verification, Safety, and Anti-Patterns

1. **Institutionalize verification.**
   - Adopt verification-before-completion to enforce that every “done” claim is backed by fresh evidence (commands run, outputs checked, tests passing), and embed its gate function into your own meta-prompts or system messages.[^23][^22]
   - Combine this with OpenAI’s advice on testing prompts systematically, using evaluation datasets and A/B testing (e.g., via OpenAI Evals or similar tooling).[^45][^54]
2. **Study and avoid prompt anti-patterns.**
   - Read the OpenAI community thread on prompt anti‑patterns to see concrete examples where extra constraints harm performance, and how to rewrite vague phrases like “avoid speculation” into precise behaviors.[^84]
   - Use Lakera’s and ProductManagement.ai’s guides to catalog common traps: vague instructions, conflicting constraints, and overly generic personas.[^47][^85]
3. **Harden against injection and jailbreaks.**
   - Combine skill-vetter’s permission and content-analysis patterns with research on prompt injection and jailbreaks to design safer system prompts and tool policies.[^56][^57][^86][^58][^55][^44]
   - Ensure prompts separate trusted instructions from untrusted user content (e.g., via delimiters or structured JSON) and avoid naive “ignore previous instructions” vulnerabilities.[^57][^55]

**Goal for this stage:** You should be able to design prompts and skills that not only perform well but also verify their own outputs, surface uncertainty, and resist straightforward injection/jailbreak attacks.[^55][^56]

### Stage 5 – Skill Design, Lifecycle, and Self-Improvement

1. **Design and iterate skills.**
   - Use skill-creator as your primary manual for building SKILL.md files: capture intent, define “when to trigger,” structure instructions, and set up evals and benchmarks.[^9][^10][^37]
   - Follow Anthropic’s complete guide to building skills for Claude for broader ecosystem context (tooling, eval-viewer, benchmarks).[^37][^91]
2. **Add memory and evolution.**
   - Use self-improving-agent to design semantic, episodic, and working memory structures for your agents, along with evolution and correction markers to track how skills change over time.[^25][^24]
   - Pair this with context-engineering practices: store long-term patterns and episodes outside the main prompt and retrieve only what’s relevant.[^78][^52]
3. **Establish a continuous improvement loop.**
   - Combine prompt-blueprint’s systematic testing and OpenAI’s evaluation advice with the eval loops in skill-creator and the external “Ultimate Prompt Engineering” guides.[^70][^47][^54]
   - Regularly review outputs for failure modes (hallucinations, missing constraints, formatting drift) and update prompts/skills accordingly.

**Goal for this stage:** You should be running prompt and skill development as a real engineering discipline: versioned, evaluated, improved over time, and supported by structured context and memory.

***

Taken together, the skills.sh library (especially the obra/superpowers, anthropics/skills, google-labs-code/stitch-skills, nextlevelbuilder/ui-ux-pro-max-skill families, and the prompt/context-focused skills added via targeted searches) plus the external research corpus form a rich set of concrete patterns and counter‑patterns for prompt and context engineering. Studying and then emulating these structures in your own SKILL.md files, system prompts, and application-level orchestration code is the most effective way to move from ad‑hoc prompting to a disciplined, reproducible practice.[^75][^29][^79][^1][^12][^34][^36][^54][^70][^33][^45][^35]

---

## References

1. [The Agent Skills Directory](https://skills.sh) - Skills Leaderboard · find-skills · vercel-react-best-practices · frontend-design · web-design-guidel...

2. [skills/skills/find-skills/SKILL.md at main · vercel-labs/skills](https://github.com/vercel-labs/skills/blob/main/skills/find-skills/SKILL.md) - The open agent skills tool - npx skills. Contribute to vercel-labs/skills development by creating an...

3. [find-skills • skills • vercel-labs • Skills • Registry](https://tessl.io/registry/skills/github/vercel-labs/skills/find-skills) - find-skills. Helps users discover and install agent skills when they ask ... npx tessl i github:verc...

4. [find-skills - OpenClaw Skill - OpenClaw Directory](https://openclawdir.com/skills/find-skills-bc436u) - Helps users discover and install agent skills when they ask

5. [vercel-labs/skills: The open agent skills tool - npx skills](https://github.com/vercel-labs/skills) - The open agent skills tool - npx skills. Contribute to vercel-labs/skills development by creating an...

6. [Top Agent Skills for March 13, 2026](https://mcpmarket.com/daily/skills/top-skill-list-march-13-2026) - Daily rankings of Agent Skills for Claude, ChatGPT & Codex sorted by GitHub stars. Also explore:Skil...

7. [I added Claude Code skills from GitHub's vercel-labs/skills ...](https://dev.classmethod.jp/en/articles/varcel-labs-skills/) - Share skills-lock.json to reproduce the same skills in different environments. Find skills at https:...

8. [Claude Code Skills I Use Every Day | Sachin Adlakha](https://www.sachinadlakha.us/blog/claude-code-skills) - Three Claude Code skills that changed how I build — UI/UX Pro Max for design, Mintlify for docs, and...

9. [skill-creator by anthropics/skills - Skills.sh](https://skills.sh/anthropics/skills/skill-creator) - Discover and install skills for AI agents.

10. [skills/skills/skill-creator/SKILL.md at main · anthropics/skills - GitHub](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md) - Public repository for Agent Skills. Contribute to anthropics/skills development by creating an accou...

11. [Skills.sh - The Open Agent Skills Ecosystem - Peter Miľovčík](https://publish.obsidian.md/petermilovcik/1+Notes/Skills.sh+-+The+Open+Agent+Skills+Ecosystem) - ... frontend-design --skill skill-creator # Install to specific agents ... Skills Leaderboard. The s...

12. [README.md - obra/superpowers](https://github.com/obra/superpowers/blob/main/README.md) - An agentic skills framework & software development methodology that works. - obra/superpowers

13. [obra/superpowers: An agentic skills framework ...](https://github.com/obra/superpowers) - using-superpowers - Introduction to the skills system. Philosophy. Test-Driven Development - Write t...

14. [SKILL.md - obra/superpowers](https://github.com/obra/superpowers/blob/main/skills/using-superpowers/SKILL.md) - using-superpowers · Use when starting any conversation - establishes how to find and use skills, req...

15. [using-superpowers | Skills Marketplace](https://lobehub.com/skills/obra-superpowers-using-superpowers) - Curl https://lobehub.com/skills/obra-superpowers-using-superpowers/skill.md, then follow the instruc...

16. [superpowers/skills/writing-plans/SKILL.md at main](https://github.com/obra/superpowers/blob/main/skills/writing-plans/SKILL.md) - An agentic skills framework & software development methodology that works. - superpowers/skills/writ...

17. [Maven Central: com.skillsjars ... - Sonatype](https://central.sonatype.com/artifact/com.skillsjars/obra__superpowers__writing-plans) - ... writing-plans</artifactId> <version>2026_02_21-e4a2375</version> ... obra/superpowers</url> <con...

18. [subagent-driven-development by obra/superpowers - Skills.sh](https://skills.sh/obra/superpowers/subagent-driven-development) - Discover and install skills for AI agents.

19. [SKILL.md - Subagent-Driven Development](https://github.com/obra/superpowers/blob/main/skills/subagent-driven-development/SKILL.md) - An agentic skills framework & software development methodology that works. - superpowers/skills/suba...

20. [executing-plans • superpowers • obra • Skills • Registry](https://tessl.io/registry/skills/github/obra/superpowers/executing-plans) - npx tessl i github:obra/superpowers@363923f --skill executing-plans ... superpowers:writing-plans - ...

21. [superpowers-executing-plans | Skills Marketplace | Cyrus](https://www.atcyrus.com/skills/superpowers-executing-plans) - superpowers:using-git-worktrees - REQUIRED: Set up isolated workspace before starting; superpowers:w...

22. [superpowers/skills/systematic-debugging/SKILL.md at main](https://github.com/obra/superpowers/blob/main/skills/systematic-debugging/SKILL.md) - An agentic skills framework & software development methodology that works. - superpowers/skills/syst...

23. [superpowers • obra • Skills • Registry - systematic-debugging](https://tessl.io/registry/skills/github/obra/superpowers/systematic-debugging/review) - systematic-debugging. Use when encountering any bug, test failure, or ... npx tessl i github:obra/su...

24. [Systematic Debugging Skill - Skills | AI Nexus](https://www.myaiexp.com/en/items/skills/systematic-debugging) - Systematic Debugging Skill - Always find root cause before attempting fixes - systematic approac ......

25. [Agent Skills Directory & Top Skills Leaderboard | AgentSkills](https://aiskillsshow.com) - Agent Skills ; frontend-design · anthropics ; find-skills · vercel-labs ; vercel-react-best-practice...

26. [enhance-prompt — Claude Code Skill | FastMCP](https://fastmcp.me/skills/details/1697/enhance-prompt) - ... stitch-skills/tree/main/skills/enhance-prompt. Skill Content. --- name: enhance-prompt descripti...

27. [enhance-prompt | Skills Marketplace · LobeHub](https://lobehub.com/skills/google-labs-code-stitch-skills-enhance-prompt)

28. [enhance-prompt by google-labs-code/stitch-skills](https://skills.sh/google-labs-code/stitch-skills/enhance-prompt) - Discover and install skills for AI agents.

29. [Skill for nextlevelbuilder/ui-ux-pro-max-skill - Skills.sh](https://skills.sh/nextlevelbuilder/ui-ux-pro-max-skill) - Discover and install skills for AI agents.

30. [ui-ux-pro-max-skill • nextlevelbuilder](https://tessl.io/registry/skills/github/nextlevelbuilder/ui-ux-pro-max-skill/ui-ux-pro-max) - ... search and examples. Install with Tessl CLI. npx tessl i github:nextlevelbuilder/ui-ux-pro-max-s...

31. [ui-ux-pro-max — Claude Code Skill | FastMCP](https://fastmcp.me/skills/details/191/ui-ux-pro-max) - nextlevelbuilder / ui-ux-pro-max ; Install skill for Codex · Project Local ($CWD/.codex/skills) · Us...

32. [find-skills by vercel-labs/skills - Skills.sh](https://skills.sh/vercel-labs/skills/find-skills) - Discover and install skills for AI agents.

33. [prompt-engineering by inference-sh/skills](https://skills.sh/inference-sh/skills/prompt-engineering) - Discover and install skills for AI agents.

34. [prompt-engineering by giuseppe-trisciuoglio/developer-kit - Skills.sh](https://skills.sh/giuseppe-trisciuoglio/developer-kit/prompt-engineering) - Discover and install skills for AI agents.

35. [context-engineering-collection by muratcankoylan/agent-skills-for ...](https://skills.sh/muratcankoylan/agent-skills-for-context-engineering/context-engineering-collection) - Discover and install skills for AI agents.

36. [thought-based-reasoning by neolabhq/context-engineering-kit](https://skills.sh/neolabhq/context-engineering-kit/thought-based-reasoning) - skills/neolabhq/context-engineering-kit/thought-based-reasoning. thought-based ... neolabhq/context-...

37. [[PDF] The Complete Guide to Building Skills for Claude | Anthropic](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf)

38. [com.skillsjars:obra__superpowers__subagent-driven ...](https://libraries.io/maven/com.skillsjars:obra__superpowers__subagent-driven-development) - Next up, once you say "go", it launches a subagent-driven-development ... obra/superpowers/refs/head...

39. [GitHub - obra/superpowers: An agentic skills framework & ...](https://www.linkedin.com/posts/kevinmohara_github-obrasuperpowers-an-agentic-skills-activity-7437667432636403714-F4Eb) - ... systematic-debugging — When something breaks, a four-phase methodology enforces root cause inves...

40. [Give Your AI a Design Brain — UI/UX Pro Max Skill - 워킹 레퍼런스](https://www.working-ref.com/en/reference/ui-ux-pro-max-skill) - (Optional) Save the design system. For consistent design across your project: python3 .claude/skills...

41. [https://raw.githubusercontent.com/roin-orca/skills...](https://raw.githubusercontent.com/roin-orca/skills/refs/heads/main/skills/simple/SKILL.md) - Scale detail to the task — a few sentences for simple work, more reasoning for complex decisions. - ...

42. [enhance-prompt - Skills](https://cc.jiekou.ai/skills/enhance-prompt) - enhance-prompt. $npx skills add google-labs-code/stitch-skills --skill enhance-prompt. SKILL.md. Enh...

43. [UI UX Pro Max - Design Intelligence for Claude Code](https://ui-ux-pro-max-skill.nextlevelbuilder.io) - Get started with UI UX Pro Max skill for Claude Code. Design intelligence at ... A nano project from...

44. [find-skill-sh | Skills Marketplace](https://lobehub.com/skills/ahostbr-kuroryuu-public-find-skill-sh)

45. [Best practices for prompt engineering with the OpenAI API | OpenAI Help Center](https://help.openai.com/en/articles/6654000-best-practices-for-prompt-engineering-with-openai-api) - How to give clear and effective instructions to OpenAI models

46. [A guide to OpenAI prompt engineering (2025)](https://www.eesel.ai/blog/openai-prompt-engineering) - A complete 2025 guide to OpenAI prompt engineering for non-developers. Learn core techniques, challe...

47. [The Ultimate Guide to Prompt Engineering in 2026](https://www.lakera.ai/blog/prompt-engineering-guide) - Ambiguity is one of the most common causes of poor LLM output. Instead of issuing vague instructions...

48. [Chain-Of-Thought Prompting Elicits Reasoning in Large ...](https://www.proceedings.com/content/068/068431-1800open.pdf) - Chain-of-Thought Prompting Elicits Reasoning in Large Language Models. Jason Wei. Xuezhi Wang. Dale ...

49. [Tree of Thoughts: Deliberate Problem Solving with Large Language ...](https://arxiv.org/abs/2305.10601) - Language models are increasingly being deployed for general problem solving across a wide range of t...

50. [Chain-of-Thought Prompting Elicits Reasoning in Large ...](https://arxiv.org/abs/2201.11903) - автор J Wei · 2022 · Цитовано в 26650 джерелах — Access Paper: View a PDF of the paper titled Chain-...

51. [Enhance Prompt — AI Coding Skill | Skills Playground](https://skillsplayground.com/skills/google-labs-code-stitch-skills-enhance-prompt/) - npx playbooks add skill google-labs-code/stitch-skills --skill enhance-prompt. Copy ... stitch-skill...

52. [Context Engineering: Feeding a nutritious diet to your LLM](https://fractal.ai/blog/prompt-engineering-to-context-engineering) - Learn why context engineering is replacing prompt engineering and how feeding LLMs structured contex...

53. [Context Engineering Guide](https://www.promptingguide.ai/guides/context-engineering-guide) - Prompt Engineering Guide. Courses. AboutAbout. CTRL K. GitHub (opens in a new ... context window of ...

54. [prompt-blueprint/guides/openai-best-practices__chatgpt-4_5.md at main · thibaultyou/prompt-blueprint](https://github.com/thibaultyou/prompt-blueprint/blob/main/guides/openai-best-practices__chatgpt-4_5.md) - Enterprise-grade prompt engineering toolkit: Distilled best practices, production-ready meta-prompts...

55. [A Systematic Evaluation of Prompt Injection and Jailbreak ... - arXiv.org](https://arxiv.org/html/2505.04806v1)

56. [LLM Vulnerability Series: Direct Prompt Injections and ...](https://www.lakera.ai/blog/direct-prompt-injections) - This blog post will focus on direct prompt injections, stay tuned for a follow-up article on indirec...

57. [Prompt Injection vs. Jailbreaking: What's the Difference?](https://learnprompting.org/blog/injection_jailbreaking) - Explore the key differences between prompt injection and jailbreaking in AI security.

58. [Prompt Injection vs Jailbreaking: What's the Difference?](https://www.promptfoo.dev/blog/jailbreaking-vs-prompt-injection/) - Prompt injection targets your application architecture—how you process external data. Jailbreaking t...

59. [Chain-of-Thought Prompting Elicits Reasoning in Large ...](https://webdocs.cs.ualberta.ca/~dale/papers/neurips22a.pdf) - автор J Wei · Цитовано в 26650 джерелах — Chain-of-Thought Prompting Elicits Reasoning in Large Lang...

60. [Chain of Thought Prompting Elicits Knowledge Augmentation](https://aclanthology.org/2023.findings-acl.408.pdf) - автор D Wu · 2023 · Цитовано в 54 джерелах — 2022. Chain of thought prompting elicits reasoning in l...

61. [Deliberate Problem Solving with Large Language Models](https://papers.nips.cc/paper_files/paper/2023/hash/271db9922b8d1f4dd7aaef84ed5ac703-Abstract-Conference.html) - автор S Yao · 2023 · Цитовано в 6223 джерелах — To surmount these challenges, we introduce a new fra...

62. [Tree of Thoughts: Deliberate Problem Solving with Large ...](https://huggingface.co/papers/2305.10601) - Tree of Thoughts: Deliberate Problem Solving with Large Language Models. Published on May 17, 2023. ...

63. [Tree of Thoughts: Deliberate Problem Solving with Large ...](https://proceedings.neurips.cc/paper_files/paper/2023/file/271db9922b8d1f4dd7aaef84ed5ac703-Paper-Conference.pdf) - автор S Yao · 2023 · Цитовано в 6223 джерелах — We thus propose the Tree of Thoughts. (ToT) framewor...

64. [Tree of Thoughts (ToT)](https://www.promptingguide.ai/techniques/tot) - ToT maintains a tree of thoughts, where thoughts represent coherent language sequences that serve as...

65. [ReAct prompting | Technology Radar](https://www.thoughtworks.com/radar/techniques/react-prompting) - ReAct prompting is a method for prompting LLMs intended to improve the accuracy of their responses o...

66. [ReAct - Prompt Engineering Guide](https://www.promptingguide.ai/techniques/react) - A Comprehensive Overview of Prompt Engineering

67. [Results](https://research.google/blog/react-synergizing-reasoning-and-acting-in-language-models/) - Posted by Shunyu Yao, Student Researcher, and Yuan Cao, Research Scientist, Google Research, Brain T...

68. [On the Brittle Foundations of ReAct Prompting for Agentic Large Language Models](https://bohrium.dp.tech/paper/arxiv/2405.13966)

69. [Brittle Foundations of ReAct Prompting](https://www.emergentmind.com/papers/2405.13966) - This paper shows that ReAct prompting’s benefits in agentic LLMs arise primarily from exemplar-query...

70. [dair-ai/Prompt-Engineering-Guide](https://github.com/dair-ai/prompt-engineering-guide) - Guides, papers, lessons, notebooks and resources for prompt engineering, context engineering, RAG, a...

71. [Prompt Engineering Guide](https://www.promptingguide.ai) - Prompt Engineering Guide. Prompt engineering is a relatively new discipline for developing and optim...

72. [Become a Prompt Engineer for FREE →Complete GitHub ...](https://www.reddit.com/r/letscodecommunity/comments/1rdmcij/become_a_prompt_engineer_for_free_complete_github/) - Core Guides & Comprehensive Resources 1- https://github.com/dair-ai/Prompt-Engineering-Guide The gol...

73. [Best practices for prompt engineering with the OpenAI API](https://help.openai.com/en/articles/6654000-best-practices-for-prompt-engineering-with-the-openai-api) - The official prompt engineering guide by OpenAI is usually the best place to start for prompting tip...

74. [Prompt engineering techniques - Azure OpenAI | Microsoft Learn](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/concepts/prompt-engineering) - Learn how to use prompt engineering to optimize your work with Azure OpenAI.

75. [Memory And Context Window...](https://bigdataboutique.com/blog/from-prompt-engineering-to-context-engineering) - Context engineering is the discipline of designing the full information environment an LLM receives ...

76. [Prompt Strategies for Short-Term Memory and Context ...](https://apxml.com/courses/prompt-engineering-agentic-workflows/chapter-5-managing-agent-memory-prompts/prompt-strategies-short-term-memory) - Prompt Engineering Guide, Anthropic, 2024 (Anthropic) - Official guide offering practical strategies...

77. [Context-Aware Prompt Scaling: Key Concepts - Latitude.so](https://latitude.so/blog/context-aware-prompt-scaling-key-concepts) - Latitude is the reliability layer for AI products: detect failures, measure performance, and automat...

78. [Context Engineering: From Better Prompts to Better Thinking](https://www.intelligentmachines.blog/post/context-engineering-from-better-prompts-to-better-thinking) - Designing the right context is what transforms powerful language models into reliable, grounded, and...

79. [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

80. [Anthropic's Guide to Context Engineering for AI Agents - LinkedIn](https://www.linkedin.com/posts/rakeshgohel01_effective-context-engineering-for-ai-agents-activity-7379133268954157057-YYhT) - Anthropic shared the best context engineering guide for AI Agents Here are the key points that every...

81. [Effective context engineering for AI agents | Richmond Alake](https://www.linkedin.com/posts/richmondalake_effective-context-engineering-for-ai-agents-activity-7386881837643603968-R-6K) - I am so sorry But we have to circle back to this. Anthropic’s take on Effective Context Engineering ...

82. [Effective Context Engineering for AI Agents (why agents still fail in practice)](https://www.youtube.com/watch?v=nkJXADeI62c) - Want to start freelancing? Let me help: https://go.datalumina.com/Fsm6CLA
Want to learn real AI Engi...

83. [Effective Context Engineering for AI Agents](https://www.youtube.com/watch?v=U4r2tsMfZ4Q) - After a few years of prompt engineering being the focus of attention in applied AI, a new term has c...

84. [Prompt Anti-Patterns — When More Instructions May Harm ...](https://community.openai.com/t/prompt-anti-patterns-when-more-instructions-may-harm-model-performance/1372460) - I understand now that vague phrases like “avoid speculation” don't work well for LLMs without very c...

85. [The 12 Prompt Engineering Techniques Every PM Should Use](https://www.productmanagement.ai/p/prompt-engineering) - Bad prompts try to produce good answers. Great prompts try to ... Avoid vague instructions like 'be ...

86. [Prompt Injection Techniques: Jailbreaking Large ...](https://www.keysight.com/blogs/en/tech/nwvs/2025/05/20/prompt-injection-techniques-jailbreaking-large-language-models-via-flipattack) - The finely crafted prompt contains both the prompt disguise and flipping guidance which together tri...

87. [GitHub - dair-ai/Prompt-Engineering-Guide ...](https://www.linkedin.com/posts/dariussingh_github-dair-aiprompt-engineering-guide-activity-7079684866983833600-1yUu) - The Prompt Engineering Guide by DAIR.AI is a comprehensive resource for getting into prompt engineer...

88. [GitHub - dair-ai/Prompt-Engineering-Guide](https://x.com/sudalairajkumar/status/1608683646025883650)

89. [Prompt Engineering Guide (2025): Best Practices & ...](https://myriamtisler.com/prompt-engineering-guide) - Prompt engineering guide for 2025 with best practices, input–output examples, enterprise-safe tips, ...

90. [87 Prompt Engineering Instruction Clarity and Output Formatting](https://www.youtube.com/watch?v=Mx-FWdGk_Zc) - Link to my YT channel SINSAVK AI FOR BEGINNERS
https://www.youtube.com/channel/UCWYy-VfH3A92kS4HNWZX...

91. [The Complete Guide to Building Skills for Claude | Anthropicresources.anthropic.com › hubfs › The-Complete-Guide-to-Building-Skill-f...](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf?hsLang=en)

