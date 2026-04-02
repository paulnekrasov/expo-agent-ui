# Pipeline Stage Debugging — SwiftUI Parser Adapter

## Overview

This file maps the generic systematic-debugging phases to the specific failure
modes of the SwiftUI Preview extension pipeline. Read `SKILL.md` first for the
four-phase process. This file tells you WHERE to look for each symptom.

---

## The Pipeline as a Debugging Lens

```
Swift source (.swift)
       │
  Stage 1: PARSER        web-tree-sitter → SyntaxNode tree
       │
  Stage 2: EXTRACTOR     SyntaxNode → ViewNode IR
       │
  Stage 3: RESOLVER      raw IR → resolved IR (stubs injected)
       │
  Stage 4: LAYOUT        ViewNode → LayoutResult (pos + sizes)
       │
  Stage 5: RENDERER      LayoutResult → canvas pixels
       │
  Stage 6: DEVICE        canvas + chrome → preview
       │
  Stage 7: INTERACTION   events → navigation state
```

Every bug belongs to exactly one stage. Narrowing to the stage IS the root cause
investigation. Do not skip this step.

---

## Symptom → Stage Map

| Symptom | Suspect stage | First file to check |
|---|---|---|
| `UnknownNode` in IR output | Stage 1 or 2 | Run `ast-inspect` on the failing snippet |
| Wrong view type extracted (e.g. `HStack` instead of `VStack`) | Stage 2 | The extractor for that view type |
| Modifier missing or wrong value | Stage 2 | The modifier extractor for that modifier |
| `@State` var not stubbed | Stage 3 | `src/resolver/stateStubber.ts` |
| Wrong layout size | Stage 4 | Layout engine for the parent container |
| Correct size but wrong position | Stage 4 | Placement logic in the parent container |
| Visual wrong color / font | Stage 5 | `src/renderer/iosColors.ts` or `fonts.ts` |
| Device chrome wrong shape | Stage 6 | `src/device/chrome.ts` |
| Navigation push not animating | Stage 7 | `src/navigation/transition.ts` |
| Extension fails to activate | Stage 0 | `src/extension/extension.ts` + OutputChannel |

---

## Stage 1 + 2: The Most Common Case — UnknownNode

`UnknownNode` means the extractor did not recognise the AST node type. This is
the correct fallback but it also hides the real bug.

**Diagnosis protocol:**

```
1. Reproduce: write a minimal Swift snippet that triggers the UnknownNode
   (e.g. a single Text("Hello") with one modifier)

2. Run ast-inspect on that snippet:
   → See ast-inspect.md for the exact commands

3. Compare the actual node.type in the tree against what the extractor expects.
   The #1 cause: wrong node type name. See INDEX.md node name traps table.

4. If node type is correct: check the field names.
   tree-sitter fields are accessed via node.childForFieldName("name")
   Wrong field name returns null silently.

5. If fields are correct: check the child index.
   Named vs anonymous children have different indices.
   Use node.namedChildren not node.children when you want named only.
```

**Defense-in-depth for extractors:**
- Layer 1: Log the raw `node.type` at extractor entry (OutputChannel)
- Layer 2: Assert field name exists before accessing it
- Layer 3: Always return `UnknownNode` rather than throwing
- Layer 4: Include `rawType` and `rawSource` in `UnknownNode` so the caller can log it

---

## Stage 4: Layout Bugs

Layout bugs are almost always one of:

1. **Wrong proposed size passed to child** — check the parent's `layout()` method
2. **Child ignores proposed size** — check the child's `layout()` return value
3. **`.frame` modifier applied in wrong order** — modifiers are an ordered array;
   check that the modifier flattener applied them in the correct sequence
4. **`maxWidth: .infinity` not expanding** — only expands when parent proposes
   a concrete width; check what the parent is proposing

**Minimal reproduction for layout bugs:**
Write a fixture Swift file with exactly the failing view in isolation. Assert the
expected `ConcreteSize` from the layout engine. Do not debug layout visually in
the renderer — debug it in unit tests with known proposed sizes.

---

## Stage Isolation Checklist

Before claiming a bug is in Stage X, verify the stage boundary:

```
Is the SyntaxNode tree correct?
  → tree-sitter parse <file.swift> — does it show the expected structure?
  → If wrong: the Swift source is the problem, not the extractor.

Is the ViewNode IR correct?
  → JSON.stringify the IR output from src/parser/index.ts
  → If wrong: Stage 2 extractor is the bug.

Is the resolved IR correct?
  → Check stubs: @State vars should have zero/false/"" defaults
  → If stubs missing: Stage 3 resolver is the bug.

Is the layout result correct?
  → Log the LayoutResult tree from src/layout/engine.ts
  → If sizes/positions wrong: Stage 4 is the bug.

Is the render correct?
  → Visual inspection or snapshot test
  → If visual wrong: Stage 5 is the bug.
```

---

## Applying Root Cause Tracing to This Codebase

From `root-cause-tracing.md` — trace backward:

```
Symptom: "Image renders as UnknownNode in the preview"

Step 1: Where does UnknownNode appear? → Stage 5 renderer renders it as gray box
Step 2: What feeds the renderer? → LayoutResult from Stage 4
Step 3: What feeds Stage 4? → Resolved IR from Stage 3
Step 4: What feeds Stage 3? → Raw IR from Stage 2 extractor
Step 5: Check Stage 2 extractor output → IR shows UnknownNode at extraction time
Step 6: Why does extractor produce UnknownNode?
        → The call_expression node for Image(systemName:) uses a labeled argument
        → The extractor was only checking for positional argument at index 0
        → It finds no named field "systemName" and falls through to UnknownNode

Root cause: Stage 2 — extractor not handling labeled argument form of Image()
Fix: Handle both Image("name") and Image(systemName: "name") in the extractor
```

**Key principle for this codebase:** Every `UnknownNode` is a bug report. Log
`rawType` and `rawSource` in the OutputChannel whenever one is created so you can
find them during manual testing.

---

## Applying Defense-in-Depth to This Codebase

After fixing a Stage 2 extractor bug, add validation at multiple layers:

```typescript
// Layer 1 — Entry: log what we received
function parseImageNode(node: SyntaxNode): ViewNode {
  log(`parseImageNode: node.type=${node.type}, text=${node.text.slice(0,40)}`);

  // Layer 2 — Business logic: explicit check for each known form
  const systemNameArg = findLabeledArgument(node, "systemName");
  const namedArg = findPositionalArgument(node, 0);

  if (!systemNameArg && !namedArg) {
    // Layer 3 — Graceful fallback: never throw, always return something
    logError(`parseImageNode: no recognisable argument form`, node.text);
    return makeUnknown("Image", node.text);
  }

  // ... extract and return ImageNode
}
```

---

## Condition-Based Waiting in Tests

The `condition-based-waiting.md` technique applies to async parser init:

```typescript
// BAD — arbitrary wait
await new Promise(r => setTimeout(r, 100));
expect(parser.isReady).toBe(true);

// GOOD — wait for the actual condition
await waitFor(() => parser.isReady, "parser WASM loaded", 5000);
expect(parser.isReady).toBe(true);
```

WASM loading is async and timing varies. Always use condition-based waiting in
parser setup tests.

---

## Quick Reference: Stage Error Handling Contract

```
Stage 1 (Parser)    catch all → UnknownNode + log         NEVER throw
Stage 2 (Extractor) catch all → UnknownNode + log         NEVER throw
Stage 3 (Resolver)  catch all → node unmodified + warn    NEVER throw
Stage 4 (Layout)    catch all → zero size + warn          NEVER throw
Stage 5 (Renderer)  catch all → red error box + message   NEVER throw
Stage 6 (Device)    catch all → content without chrome    NEVER throw
```

**If you see an uncaught exception from any stage:** That is always a bug.
Stages 1–6 must never surface exceptions to the caller.
