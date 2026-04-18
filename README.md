# SwiftUI Parser:

> Parse SwiftUI source -> extract the view tree -> approximate the layout -> render an Apple-native-feeling preview inside VS Code without a Mac.
>
> **Status: Archived.**

## The Delusion

I am a Product Designer moving into Design Engineering.

I wanted to build native SwiftUI apps, but I work on Windows.

The tight edit -> preview loop that makes UI work fast is broken by default outside the Apple ecosystem. Xcode previews require macOS. Cloud Macs cost money and add latency.

So I thought:
I will just build a custom AST parser, map tree-sitter nodes to an intermediate representation, and hack together a Canvas 2D rendering engine to emulate Apple's UI.

I spent days researching,  deep in the weeds of compiler mechanics, AST parsing, SwiftUI layout rules, and the Model Context Protocol (MCP).

Here is the brutal truth:

**I was building a fake car to learn how to drive.**

You cannot perfectly replicate Apple's closed-source layout engine in TypeScript. The undocumented quirks of SwiftUI's "propose, accept, place" negotiation will constantly break any approximation. A static AST-to-Canvas pipeline can give you a fast, useful, maybe 80% accurate structural preview. But the moment you introduce complex state, deep `GeometryReader` dependencies, or framework behavior that only exists at runtime, the Canvas starts lying to you.

My thoughts were like this : 

"works in the most approximate way possible like Expo emulators or other ones,"

Well.. this approach is a dead end.

## What This Project Actually Proved

This project was not a waste of time.

It proved three things:

1. SwiftUI is structured enough to parse statically with `tree-sitter-swift`.
2. An LLM can help build a serious, staged codebase when the context is rigorous enough.
3. The real leverage was not the preview engine. It was the context system that made the agents behave like disciplined engineers.

The parser mattered.
The research mattered.
The partial implementation mattered.

But the real artifact of this repository is the machine that built the machine.

## The Real Flex: Context Engineering

I did not sit there hand-writing all of this TypeScript myself.

I orchestrated agents. Mostly  Codex.

I force-fed them a project brief, a research index, pipeline stages, review rules, handoff files, bounded task specs, and a documentation corpus covering:

- tree-sitter node specs
- SwiftUI result-builder transforms
- layout contracts and stub rules
- iOS rendering constraints
- VS Code WebView packaging rules
- MCP protocol details

That changed the behavior of the models completely.

They stopped acting like autocomplete and started operating much closer to Principal Software Engineers with strong systems context and tighter execution discipline.

At least I felt like this when watching them doing this work. 

That is the real point of this repo:

> Start treating context like infrastructure. I have learned more about how to use AI than any tutorial will ever did for me

## The Architecture of Context

If you want to understand how to frontload AI models with research, constraints, architecture, and task memory, read the `docs/` folder before you read the code.

Start here:

- [`docs/CLAUDE.md`](docs/CLAUDE.md) - the detailed architectural brief and non-negotiable rules
- [`docs/reference/INDEX.md`](docs/reference/INDEX.md) - the router into the research corpus
- [`docs/agents/ORCHESTRATION.md`](docs/agents/ORCHESTRATION.md) - the workflow protocol
- [`docs/agents/PHASE_STATE.md`](docs/agents/PHASE_STATE.md) - live execution state outside chat history
- [`docs/agents/TASK.md`](docs/agents/TASK.md) - bounded task specs
- [`docs/agents/HANDOFF.md`](docs/agents/HANDOFF.md) - agent-to-agent continuity
- [`docs/agents/ROADMAP_CHECKLIST.md`](docs/agents/ROADMAP_CHECKLIST.md) - condensed execution roadmap

Those files are the system. The codebase makes a lot more sense once you read them in that order.

## What Is In The Repository Today

This repo is archived, but it is not empty.

What exists in the checked-in codebase:

- Stage 1 parser setup using `web-tree-sitter` and `tree-sitter-swift`
- Stage 2 extraction for major SwiftUI families including stacks, navigation, lists, forms, scroll containers, grids, and several modifier groups
- a typed IR contract in [`src/ir/types.ts`](src/ir/types.ts)
- parser fixtures and regression coverage under [`tests/parser`](tests/parser) and [`tests/fixtures/parser`](tests/fixtures/parser)
- resolver scaffolding under [`src/resolver`](src/resolver)
- a VS Code command that currently parses a Swift file and prints Stage 1/2 IR to the OutputChannel

What does not exist yet:

- a finished Stage 3 resolver
- a real layout engine
- a real canvas renderer
- device chrome and interactions
- the MCP surface that was planned for agents

So no, this repository is not a working SwiftUI preview product.

It is essentially ended up like: 

- a serious static parsing experiment
- a partially built architecture for a SwiftUI preview pipeline
- a research corpus
- an example of a disciplined agentic workflow

## How To Use This Repo Today

There are two real ways to use this repository.

### 1. Use it as a codebase to inspect

```bash
git clone https://github.com/paulnekrasov/swift-ui-parser
cd swift-ui-parser
git submodule update --init
npm install
npm test
npm run build
```

Useful commands:

```bash
npm run build
npm run watch
npm test
npm run diagnose:build-env
```

In VS Code, the registered command is:

```text
SwiftUI: Open Preview
```

Today that command does not render a device preview. It parses the active Swift file, extracts previewable SwiftUI roots into typed IR, and prints that IR into the VS Code OutputChannel.

### 2. Use it as a context-engineering case study

If you care more about agent orchestration than SwiftUI, this is the better path.

Read the docs first, then inspect:

- [`src/parser`](src/parser) for tree-sitter setup, AST walking, and extraction
- [`src/ir`](src/ir) for the contract between stages
- [`src/resolver`](src/resolver) for the scaffold of the next stage
- [`tests/parser`](tests/parser) for the behavioral surface the agents were coding against

Although technical thesis was not stupid, it merely was  bounded.

SwiftUI is unusually analyzable because it is declarative and that made static parsing viable)

But of coursethere is a hard ceiling:

- runtime behavior stays runtime behavior
- undocumented framework quirks stay undocumented
- closed-source layout rules stay closed-source
- visual fidelity without execution eventually collapses into approximation debt

You can absolutely build a structurally useful previewer this way.
But you cannot turn static analysis into Apple's runtime just by wanting it harder.

## Pivot
I am archiving this repository so I can lock in on much more important things for me.

## If You Want To Continue It

If you want to keep building this project, start with the docs, not the source tree.

Use this order:

1. [`docs/reference/INDEX.md`](docs/reference/INDEX.md)
2. [`docs/agents/ORCHESTRATION.md`](docs/agents/ORCHESTRATION.md)
3. [`docs/agents/PHASE_STATE.md`](docs/agents/PHASE_STATE.md)
4. [`docs/agents/HANDOFF.md`](docs/agents/HANDOFF.md)
5. [`docs/agents/ROADMAP_CHECKLIST.md`](docs/agents/ROADMAP_CHECKLIST.md)
6. [`docs/agents/TASK.md`](docs/agents/TASK.md), if it is populated

Then keep your work inside one pipeline stage at a time.

Do not mix parser, resolver, layout, and renderer work in one change.
That was one of the main guardrails that kept the agent workflow usable.

## Who This Repo Is For

Clone this repo if you want to study:

- compiler-adjacent architecture
- tree-sitter integration in TypeScript
- AST-to-IR extraction patterns
- staged system design
- how to discipline AI agents into building complex systems

Otherwise, go build something that actually solves real problems

It was the project that was supposed my problem but it didnt

## License Status

There is currently no `LICENSE` file in this repository.

So while the repository is public, do not assume an open-source license has been granted yet. Public source code is not the same thing as licensed source code.
