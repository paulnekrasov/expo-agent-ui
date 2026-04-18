# SwiftUI Preview

> Parse SwiftUI source -> extract the view tree -> approximate the layout -> render an Apple-native-feeling preview inside VS Code, on Windows, Linux, or macOS, without Xcode, without a Mac, and without a Swift runtime.

This repository is being published in public and archived in the middle of the build.
It is both:

- a real codebase for a cross-platform SwiftUI preview pipeline
- a record of an agentic software workflow built from research, constraints, and staged execution

It is not a polished product release. It is the work itself.

## Why this exists

I build real iOS apps.
I do it on Windows.

That means the tight edit -> preview loop that makes UI work fast is broken by default.
Xcode previews require macOS. Cloud Macs cost money and add latency. The official Swift tooling in VS Code still does not give you SwiftUI previews. If you write SwiftUI on Windows, you usually write blind, commit blind, and find out later on a device whether the layout was right.

This project started from a very simple need:

> I wanted a trustworthy SwiftUI preview loop without buying Apple hardware first.

The deeper realization came after that:

> AI coding agents can generate SwiftUI, but they are blind too.

An agent can write a `VStack`, a `Form`, a `NavigationStack`, or a complicated modifier chain, but without a visual feedback tool it cannot see whether the result is sensible. The human stays stuck as the rendering layer.

This repository is an attempt to close that gap.

## How it started

This project was not built in the usual way.

I was not sitting here hand-writing every subsystem from scratch in a normal editor workflow. The core work was building context: collecting the right source material, turning it into a usable reference library, defining stage boundaries, encoding non-negotiable rules, and then training agents against that context until they could operate with the discipline of senior engineers instead of autocomplete.

The important artifact was not just code. It was the operating system around the code:

- a project brief in [`docs/CLAUDE.md`](docs/CLAUDE.md)
- a routing index in [`docs/reference/INDEX.md`](docs/reference/INDEX.md)
- stage-aware execution rules in [`docs/agents/ORCHESTRATION.md`](docs/agents/ORCHESTRATION.md)
- live task state in [`docs/agents/PHASE_STATE.md`](docs/agents/PHASE_STATE.md)
- bounded task specs in [`docs/agents/TASK.md`](docs/agents/TASK.md)
- review and handoff memory in [`docs/agents/REVIEW.md`](docs/agents/REVIEW.md) and [`docs/agents/HANDOFF.md`](docs/agents/HANDOFF.md)

The workflow was deliberate:

1. Research the real source material instead of guessing.
2. Distill that research into reference docs the agents could navigate quickly.
3. Split the system into hard pipeline stages so parser work never leaked into layout work, layout never leaked into rendering, and every task stayed bounded.
4. Force the agents to work against explicit contracts, fallback behavior, and review checklists.
5. Keep durable memory in files instead of trusting chat history.

That is why this repository looks the way it does. It is code, but it is also a demonstration that with enough context engineering, review discipline, and execution structure, Codex and Claude Code can be pushed into a much more serious engineering mode.

## What the project is trying to build

The long-term architecture is a static SwiftUI preview pipeline:

```text
Swift source (.swift)
        |
        v
tree-sitter-swift (WASM)
        |
        v
AST walker + extractors
        |
        v
typed ViewNode IR
        |
        v
resolver
  - stub @State / @Binding
  - preserve modifier order
        |
        v
layout engine
  - propose -> accept -> place
        |
        v
Canvas renderer
  - iOS colors
  - typography tables
  - control chrome
        |
        v
device frame + VS Code WebView
        |
        v
eventually: MCP surface for AI agents
```

The key technical bet is simple:

- SwiftUI is declarative enough to parse statically.
- The view tree can be extracted without a Swift runtime.
- A useful approximation of SwiftUI layout can be reimplemented in TypeScript.
- Once that exists, the same engine can serve both humans in VS Code and AI agents through MCP.

## What is already in this repo

This repository is not empty theory. It already contains real implementation work.

Current state, based on the checked-in code and agent state files:

- Stage 1 parser setup exists using `web-tree-sitter` and `tree-sitter-swift`
- Stage 2 extraction exists for major SwiftUI families including stacks, navigation, lists, forms, scroll containers, grids, and several modifier groups
- the IR contract exists in [`src/ir/types.ts`](src/ir/types.ts)
- parser fixtures and regression tests exist under [`tests/parser`](tests/parser) and [`tests/fixtures/parser`](tests/fixtures/parser)
- resolver scaffolding exists under [`src/resolver`](src/resolver)
- the VS Code command exists and currently outputs extracted IR to the OutputChannel

What the checked-in code does today:

- opens a Swift file in VS Code
- parses it through tree-sitter
- extracts previewable SwiftUI roots into typed IR
- prints that IR for inspection

That means the repository is already useful as:

- a SwiftUI static parsing experiment
- a typed IR extraction codebase
- a documented agentic build process
- a foundation for a future renderer

## What is not implemented yet

The repository is still mid-flight. Important parts are not finished yet.

Not implemented yet in the current worktree:

- recursive Stage 3 resolver traversal across all current `ViewNode` shapes
- real state and binding stub injection
- modifier flattening semantics beyond the scaffold
- the Stage 4 layout engine
- the Stage 5 canvas renderer
- device chrome and preview interactions
- the MCP server surface

So if you clone this today, you are not getting a finished visual SwiftUI previewer.
You are getting the parser/extractor foundation, the architecture, the research corpus, and the agent workflow that built it.

## What this project does not do

These are design boundaries, not missing polish items.

### Permanent boundaries

- It does not execute Swift code.
- It does not require a Swift runtime.
- It does not call a remote Mac.
- It does not depend on Xcode.
- It does not use React, Electron UI frameworks, or a browser UI stack inside the preview.
- It does not try to become a full IDE.
- It does not aim for pixel-perfect Xcode parity.

### Honest current limitations

- It does not render a real visual preview yet in the current repository state.
- It does not resolve arbitrary custom view semantics.
- It does not evaluate business logic or runtime data flow.
- It does not replace actual device testing.
- It does not make UIKit or third-party Swift packages magically previewable through static analysis alone.

## Why tree-sitter instead of the Swift compiler

Because the whole point is to break the Mac dependency.

If the solution requires the Apple toolchain, the problem is still unsolved for the people this repository is for. `tree-sitter-swift` gives a real syntax tree in a portable form that works through WebAssembly. It is not semantic analysis, and it does not know everything the compiler knows, but it is enough to extract a large amount of structure from SwiftUI source without needing a simulator or a runtime.

That tradeoff is intentional.

## Why the workflow matters as much as the code

There are a lot of repositories where the code is the only artifact that survives.
This one is different.

The most reusable thing here may not be the parser. It may be the method:

- use a reference index so agents never guess sources
- keep architecture in a durable brief
- keep live execution state outside chat history
- constrain work by pipeline stage
- force review against active-stage checklists
- preserve bounded tasks and handoffs between agent sessions

If you are trying to build serious software with coding agents, this repository is meant to show what happens when you stop treating the model like a chatbot and start treating context like infrastructure.

## Repository map

Top-level areas worth reading first:

- [`docs/reference/INDEX.md`](docs/reference/INDEX.md) - the router into the research corpus
- [`docs/CLAUDE.md`](docs/CLAUDE.md) - the detailed architectural brief
- [`docs/agents/ORCHESTRATION.md`](docs/agents/ORCHESTRATION.md) - workflow protocol
- [`docs/agents/ROADMAP_CHECKLIST.md`](docs/agents/ROADMAP_CHECKLIST.md) - condensed execution roadmap
- [`src/parser`](src/parser) - tree-sitter setup, AST walking, view/modifier extraction
- [`src/ir`](src/ir) - shared type system and builders
- [`src/resolver`](src/resolver) - Stage 3 scaffold
- [`tests/parser`](tests/parser) - parser and extractor coverage

## Development

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

In VS Code, the extension command currently registered is:

```text
SwiftUI: Open Preview
```

At the moment, that command produces Stage 1/2 IR output rather than a rendered device preview.

## If you want to continue this project

Do not start by hacking randomly in `src/`.

Start here, in order:

1. [`docs/reference/INDEX.md`](docs/reference/INDEX.md)
2. [`docs/agents/ORCHESTRATION.md`](docs/agents/ORCHESTRATION.md)
3. [`docs/agents/PHASE_STATE.md`](docs/agents/PHASE_STATE.md)
4. [`docs/agents/HANDOFF.md`](docs/agents/HANDOFF.md)
5. [`docs/agents/ROADMAP_CHECKLIST.md`](docs/agents/ROADMAP_CHECKLIST.md)
6. [`docs/agents/TASK.md`](docs/agents/TASK.md) if it is populated

Then map your work to a single pipeline stage and stay inside it.

## Archive status

This repository is being archived publicly as an unfinished but serious build.

That is intentional.

I would rather publish the actual research, constraints, architecture, tests, partial implementation, and agent workflow than wait for a fake moment of completeness that may never come.

If this repository is useful, it will be useful for one of three reasons:

- you want to continue building the preview pipeline
- you want to study the parser and IR extraction approach
- you want to study how an agentic engineering workflow was designed and disciplined

## License status

There is currently no `LICENSE` file in this repository.

So while the repository is public, do not assume an open-source license has been granted yet.
If this project is meant to become formally open source, adding a license file is still a required step.
