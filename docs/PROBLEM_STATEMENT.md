# PROBLEM STATEMENT
## SwiftUI Preview — Cross-Platform Visual Rendering for Developers and AI Agents

> This document defines the problem being solved, the market evidence validating it,
> the competitive gap that enables it, and the strategic positioning that makes it
> defensible. It exists to keep the project's purpose clear across every build phase.

---

## 1. THE CORE PROBLEM IN ONE SENTENCE

**SwiftUI development is locked to Apple hardware — and AI agents writing SwiftUI code
are completely blind — because no tool exists that renders SwiftUI visuals from pure
source code without a Swift runtime.**

---

## 2. TWO USERS, ONE UNSOLVED PROBLEM

### User A — The Human Developer

A developer building a real iOS app on Windows (Eastern Europe, India, Southeast Asia,
or anywhere a MacBook costs 22–32% of annual income) has exactly zero good options for
UI feedback during development:

- **Xcode previews** require macOS, a Swift compiler, a simulator, and 16GB+ RAM with
  an SSD. Unavailable by definition on Windows.
- **Cloud Mac services** (MacStadium, AWS EC2 Mac, MacInCloud) cost $700–$27,000/year
  and introduce latency that kills the tight edit–preview loop.
- **Hackintosh / macOS VMs** are legally grey, fragile, and consume hours of setup time
  per machine.
- **The official VS Code Swift extension** (500K+ installs, maintained by the Swift
  open source team) explicitly states: *"SwiftUI previews are not available."*
- **JetBrains AppCode** — 11 years of effort, shut down December 2022. The stated
  reason: SwiftUI's declarative nature made their runtime-dependent approach untenable.
- **JetBrains Fleet** — attempted again, shut down December 2025. Users described
  Swift support as "basically a plain text editor."

The result: a developer writing SwiftUI on Windows **runs completely blind**. They write
code, commit it, wait until they can access a Mac (or pay for cloud time) to see what
their UI actually looks like. The feedback loop that makes UI development fast and
iterative is broken entirely.

Even Mac users are not safe. Apple's own developer forums overflow with threads about
Xcode preview crashes, slowness after adding Firebase, and corrupted preview states.
One Apple engineer admitted on the forums that the preview system was not designed or
tested for non-SSD setups. Developers regularly **disable previews entirely** and rely
on the simulator — a minutes-long compile-and-launch cycle — just to see a layout change.

### User B — The AI Coding Agent

Every AI coding agent — Claude Code, OpenAI Codex CLI, Cursor, Windsurf, Copilot
Workspace — can write Swift and SwiftUI code. None of them can see what they built.

When an agent generates a SwiftUI view, it has no mechanism to:
- Verify the layout renders as intended
- Check that modifier ordering produces the expected visual result
- Iterate on a design by comparing before/after states
- Catch obvious visual errors (clipped text, wrong padding, broken alignment) before
  presenting output to the developer

The agent writes code into a void. The developer must manually compile, run, and inspect
— then describe what went wrong in plain language — before the agent can try again.
This is not an agent limitation. It is a **missing tool in the ecosystem**. No MCP server,
no plugin, no API exists today that accepts SwiftUI source code and returns a visual
rendering. The tool simply does not exist.

---

## 3. WHY THE PROBLEM HAS STAYED UNSOLVED

The gap persists not because demand is absent — it is abundant and documented — but
because every prior attempt attacked the wrong layer of the stack.

**The standard approach:** install a Swift compiler → parse → compile → execute in a
simulator → capture the screen. This is how Xcode previews work. This is how AppCode
worked. This is how Fleet worked. This approach requires Apple's entire toolchain and
only runs on macOS.

**The insight that changes everything:** SwiftUI's declarative, composable syntax is
uniquely amenable to static analysis. Unlike UIKit — where layout emerges from imperative
mutation of a mutable object graph at runtime — SwiftUI views are **value types**
described by their source code. The view tree is deterministic from the AST. The layout
algorithm is formally documented (WWDC 2019 Session 237, WWDC 2022 Session 10056,
objc.io's 11-episode reimplementation series). The modifier contract is explicit and
ordered.

This means it is possible to:

1. Parse a `.swift` file into an AST using `tree-sitter` (no Swift runtime required,
   runs as WASM in any JavaScript environment)
2. Walk the AST and extract a typed intermediate representation of the view tree
3. Approximate SwiftUI's propose → accept → place layout algorithm in TypeScript
4. Render the result to HTML Canvas using iOS system colors and font metrics
5. Display it inside VS Code's WebView panel — on Windows, Linux, or macOS

The technical barriers are real but tractable. The key enabling conditions that
did not exist three years ago and now do:

- `tree-sitter-swift` grammar: production-ready, maintained, available as NPM package
- SwiftUI's layout protocol (WWDC 2022) formally documented the size negotiation contract
- objc.io, swiftui-lab.com, and WWDC sessions provide enough reference material to
  implement the layout algorithm without reverse-engineering
- `web-tree-sitter` WASM compilation enables the parser to run in Node.js and browsers
  without any native Swift tooling

No one has assembled these components because the problem was assumed to require runtime
execution. It does not.

---

## 4. THE MARKET EVIDENCE

### Scale of the locked-out population

- **59.2% of developers globally use Windows** (Stack Overflow survey, 65,437
  respondents across 185 countries, 2024). Only 31.8% use macOS.
- Among developers still learning — the next generation — macOS drops to **26.4%**.
  The gap is attributed explicitly to hardware cost.
- Apple reports **34 million registered Apple Developer accounts**.
- **5.2 million software developers in India alone** (2024), the world's largest
  developer talent pool, where a MacBook Pro represents 22–32% of median annual income.
- r/hackintosh: **74,810 members** seeking workarounds to Apple's hardware lock-in.
- `macOS-KVM` (macOS virtualization on Linux): **9,900 GitHub stars**.
- `xtool` (cross-platform Xcode replacement attempt): **4,700 stars within months**
  of launch — raw demand signal.

### Willingness to pay — validated by existing spend

Cloud Mac infrastructure services exist solely because developers will pay to access
macOS remotely:

| Service | Price | Annualized |
|---------|-------|------------|
| AWS EC2 Mac instance | ~$1.08/hour | $9,500–$27,000 |
| MacStadium bare metal | $139/month | $1,668 |
| MacInCloud | $35–65/month | $420–780 |

These costs are real and ongoing. They represent what the market is already spending
because no better solution exists. A tool that eliminates this expense entirely — or
reduces it to a one-time VS Code extension install — solves a problem with documented
negative ROI for the buyer.

### The Xcode preview problem is universal, not just a Windows issue

A 2025 Rentamac survey of 404 iOS developers found:

- **33% reported problems due to old or unavailable macOS hardware**
- Apple Developer Forums tag `xcode-previews` has hundreds of active threads on
  crashes, slowness, and broken states
- Firebase SDK, AWS SDK, and other common dependencies are documented as breaking
  Xcode previews consistently
- Multiple Apple engineer responses confirm the preview system is not tested on HDDs
  or non-optimal hardware configurations

The pain is not hypothetical. It is documented, widespread, and affects even developers
who own Macs.

### Market size

- **iOS Developer Services Market**: ~$15 billion (2024), projected $32.1B by 2033
  at 8.5% CAGR
- **Software Development Tools Market**: $6.4–7.5 billion, growing at 16–17% CAGR
- **AI Code Tools Market**: projected to reach $91B by 2035 at 27.65% CAGR
- **Addressable segment** (developers needing SwiftUI tooling outside macOS):
  estimated 2–5 million developers globally

---

## 5. COMPETITIVE LANDSCAPE — THE GAP IS REAL

No direct competitor exists. Every adjacent tool fails in a specific, identifiable way:

| Tool | Approach | Why It Fails This Problem |
|------|----------|--------------------------|
| Xcode Canvas | Compile + execute | Requires macOS + Swift runtime |
| AppCode | IDE with Swift LSP | Shut down Dec 2022; required macOS |
| Fleet (JetBrains) | Lightweight IDE | Shut down Dec 2025; no SwiftUI support |
| VS Code Swift extension | sourcekit-lsp | Explicitly no previews; requires macOS |
| Tokamak | SwiftUI-compatible WASM renderer | Archived; required Swift compiler (SwiftWasm) |
| SwiftCrossUI | SwiftUI-inspired framework | Different API; not actual SwiftUI |
| Appetize.io / BrowserStack | Cloud simulator streaming | $59–$2,500/month; streams compiled apps, not source |
| iSwift.dev | AI SwiftUI code generation | Generation tool, not iteration tool |
| Swift Playgrounds | Live preview on iPad | iPad only; no VS Code integration |
| RocketSim | Simulator enhancer | Requires Mac and Xcode |

**The slot that is empty:** a tool that accepts raw SwiftUI source code (no compilation,
no runtime, no macOS) and produces a visual rendering, runnable in VS Code on Windows.

JetBrains' two failed attempts over 13 years confirm this is not a niche that incumbents
will fill. Their approach was fundamentally wrong (runtime-dependent), not their effort.

---

## 6. THE SOLUTION — ARCHITECTURE SUMMARY

A VS Code extension that implements a full parse → extract → resolve → layout → render
pipeline entirely in TypeScript, running in Node.js on Windows:

```
Swift source file (.swift)
        │
        ▼
  web-tree-sitter WASM         — real AST, zero Swift runtime
        │
        ▼
  AST → IR Extractor           — typed ViewNode tree (discriminated union)
        │
        ▼
  Resolver                     — stub @State/@Binding, flatten modifiers
        │
        ▼
  Layout Engine                — SwiftUI propose → accept → place algorithm
        │
        ▼
  Canvas 2D Renderer           — iOS system colors, SF Symbols, Inter font
        │
        ▼
  Device Frame + WebView       — iPhone 16 Pro default, device selector dropdown
```

Key properties of this approach:

- **No Swift runtime.** The parser is a WASM binary. Everything else is TypeScript.
- **No macOS dependency.** Runs identically on Windows, Linux, and macOS.
- **No network calls.** Fully local. Works offline. No account required.
- **Approximate, not exact.** The goal is visual fidelity sufficient to trust
  during development — not pixel-perfect simulator output.
- **Graceful degradation.** Unknown views render as labelled placeholders.
  No single broken view crashes the preview.

---

## 7. THE AI AGENT POSITIONING — THE SECOND SURFACE

The VS Code extension serves human developers. An MCP server serves AI agents.
Both surfaces share the same rendering pipeline. This is not two products — it is
one rendering engine exposed through two transports.

### The gap agents face today

Every AI coding agent can generate SwiftUI code. None can verify what it looks like.
When Claude Code generates a settings screen, it has no mechanism to:
- Confirm the Toggle renders in the correct position
- Check that `.padding(.horizontal, 16)` produces the expected spacing
- Verify that a `NavigationLink` row has the expected chevron disclosure indicator
- Catch that a `Text` with `.lineLimit(1)` is clipping the label

The agent writes blind. The developer sees the result. The agent is told it is wrong.
The agent tries again. This loop is slow and fully dependent on the human as the
visual verification layer.

### What the MCP server provides

An MCP server wraps the rendering pipeline in a single tool that any compatible agent
can call:

```
Tool: render_swiftui
Input:
  source  — raw SwiftUI source string
  device  — device ID (default: "iphone16pro")
  theme   — "light" | "dark" (default: "light")

Output:
  image   — base64-encoded PNG of the rendered preview
  layout  — JSON tree of computed sizes and positions (optional)
  errors  — list of unknown/unresolved nodes (optional)
```

The agent generates SwiftUI → calls `render_swiftui` → sees the result → decides
whether it matches intent → iterates if not. This loop runs entirely inside the
agent's context window, with no human in the visual feedback path.

### Installation — one command per agent

```json
// Claude Code — .claude/mcp.json or claude_desktop_config.json
{
  "mcpServers": {
    "swiftui-preview": {
      "command": "npx",
      "args": ["swiftui-preview-mcp"]
    }
  }
}
```

The same package serves Claude Code, Codex CLI, Cursor, Windsurf, and any other
MCP-compatible agent. One codebase, one npm publish, multiple distribution channels.

### Why this changes the strategic positioning

Without the MCP surface, this is:
> "A VS Code extension for iOS developers who don't own a Mac."

With the MCP surface, this is:
> "The visual rendering layer that makes agentic iOS UI development possible."

The first framing is a workaround tool for a constrained segment. The second framing
is infrastructure. Infrastructure gets acquired at higher multiples by a wider set of
buyers, including AI companies that need their agents to close the visual feedback loop
on native UI code — not just web.

No tool in this position exists today. The MCP plugin registry is sparse. A SwiftUI
preview tool would stand out immediately in a space where agents are actively looking
for domain-specific visual verification tools.

---

## 8. ACQUISITION PATHS AND STRATEGIC VALUE

Three credible exit models, each with recent precedent.

### Model A — Solo builder → acqui-hire (OpenClaw pattern)

Peter Steinberger built an autonomous AI agent that reached 196,000 GitHub stars and
2 million users. OpenAI hired him directly in early 2026. His prior track record
(PSPDFKit: $116M from Insight Partners, used by Apple, Dropbox, SAP) established
credibility. The deal was for the individual, not a company.

The acqui-hire market for AI and developer tools talent has accelerated dramatically:

| Acquisition | Price | Per Person |
|-------------|-------|------------|
| Inflection AI → Microsoft | ~$650M (70 people) | ~$9.3M |
| Character.ai → Google (structured) | ~$2.7B | — |
| Windsurf team → Google | ~$2.4B | — |

Most likely acquirer for this project: **Microsoft**. VS Code is their product.
They acquired Xamarin (~$400M, cross-platform mobile including iOS), GitHub ($7.5B),
and npm (JavaScript package infrastructure). GitHub Copilot for Xcode launched in
public preview in 2024 — direct investment in Apple platform tooling. A SwiftUI
previewer fills the only remaining gap in the VS Code → Copilot → iOS developer
workflow.

JetBrains is the second most likely — they have no working SwiftUI tooling after
killing two products, and are publicly attempting to rebuild Swift support in
IntelliJ IDEA. Apple is unlikely: their acquisition pattern (TestFlight,
Buddybuild) demonstrates they acquire to deepen their walled garden, not bypass it.

### Model B — VS Code extension → platform acquisition

The path from popular extension to acquisition is narrow but documented.
What makes the difference between viral and acquired:

- Enterprise monetization or clear path to it
- Strategic platform fit — fills a gap in the acquirer's developer stack
- Defensible technology that is non-trivial to replicate in-house
- Team quality signal through technical depth of the work

Tabnine ($55–102M raised, 1M+ users) and DeepCode (acquired by Snyk) demonstrate
the pattern. Kite (500K users, shut down 2022) demonstrates what happens without
revenue. The lesson: user count is a necessary but not sufficient signal.
The MCP server creates a second monetization surface and broader distribution that
makes the "just popular" failure mode less likely.

### Model C — Open source → commercial → acquired

HashiCorp: open-source Terraform → license change → IPO at $14B peak → IBM
acquisition at $6.4B. GitLab: open core → IPO at ~$11B. The pattern is consistent:
dominant open-source tooling in a category, commercial features layered on top,
acquisition by a company that needs that category's user base.

For this project the open-core model would look like:
- Free: core preview rendering, basic device frames, VS Code extension
- Pro: additional devices, AI-assisted modifier suggestions, design-to-SwiftUI,
  cloud rendering for CI pipelines
- Enterprise: team shared preview states, Figma integration, design system validation

### The AI multiplier on all three models

AI features — particularly natural language to SwiftUI with instant preview —
do not change the project's core identity. The core is a rendering engine.
AI is an interface on top of it. But the AI angle transforms acquisition
attractiveness significantly:

- **Cursor**: $0 → $29.3B valuation in ~2.5 years
- **Cognition (Devin)**: $1M ARR → $73M ARR in 9 months, $10.2B valuation
- **Windsurf/OpenAI**: $3B offer (~75x ARR)
- **Galileo AI** (UI design generation): acquired by Google, May 2025

The AI code tools market commands **20–75x revenue multiples** versus 4–8x for
traditional SaaS developer tools. Adding AI features to a SwiftUI previewer does
not change what it is. It changes how acquirers categorize it — from "niche utility"
to "AI-native developer platform" — with significant impact on valuation multiple.

---

## 9. WHAT THIS PROJECT IS NOT

These constraints are deliberate and permanent. They define scope.

| What it is NOT | Why this boundary exists |
|----------------|--------------------------|
| A Swift simulator | Never executes Swift code. Pure AST analysis. |
| A replacement for Xcode | Approximate visual fidelity, not pixel-perfect. |
| A remote Mac connection | Fully local. No network dependency, no account. |
| A product for mass market | Personal tool first. Broadens only if it earns it. |
| A web framework | Renders SwiftUI syntax specifically. Not React, not Flutter. |
| A full IDE | One job: parse SwiftUI, render the result. Nothing more. |

---

## 10. THE NORTH STAR — SINGLE SENTENCE

> Parse any SwiftUI file → extract the full view tree → render an approximate but
> visually faithful, Apple-native-feeling preview in HTML/Canvas with device frame
> chrome — and expose that rendering as an MCP tool so AI agents can see what they
> built without a Mac, without Xcode, and without a human in the visual feedback loop.

---

## APPENDIX — KEY DATA POINTS AT A GLANCE

| Fact | Source |
|------|--------|
| 59.2% of developers use Windows globally | Stack Overflow 2024 (65,437 respondents) |
| 34 million registered Apple Developer accounts | Apple |
| iOS App Store generated ~$138B revenue (2025) | Apple |
| 5.2 million software developers in India | 2024 estimate |
| MacBook Pro = 22–32% of median Indian dev salary | Derived from public salary data |
| r/hackintosh: 74,810 members | Reddit |
| xtool (cross-platform Xcode replacement): 4,700 stars | GitHub |
| AppCode shutdown: December 2022 | JetBrains blog |
| Fleet shutdown: December 2025 | JetBrains / InfoWorld |
| VS Code Swift extension: 500K+ installs, no SwiftUI preview | VS Code Marketplace |
| AWS EC2 Mac: ~$1.08/hour | AWS pricing |
| MacStadium bare metal: $139/month | MacStadium |
| iOS Developer Services Market: $15B (2024) → $32.1B (2033) | Datahorizzon Research |
| Software Dev Tools Market: $6.4–7.5B at 16–17% CAGR | Mordor Intelligence |
| AI Code Tools Market: projected $91B by 2035 | OpenPR |
| Cursor valuation: $29.3B (Nov 2025) | CNBC |
| Windsurf/OpenAI offer: $3B (~75x ARR) | SmythOS / reporting |
| GitHub acquisition by Microsoft: $7.5B | SEC filing |
| Xamarin acquisition by Microsoft: ~$400M | Bloomberg |
| IBM acquires HashiCorp: $6.4B | IBM newsroom / SEC |
| Big Tech acqui-hire spend 2024–2025: $40B+ | Clera research |
| Tabnine funding: $55–102M raised | TechCrunch / CB Insights |

---

*Last updated: March 2026*
*Author: Personal project — not a product roadmap*
*Status: Phase 1 in progress (parser foundation)*
