# Stage Isolation — Which Pipeline Stage Is Broken?

## Purpose

When the preview output is wrong, the bug belongs to exactly one stage. This
file gives you a deterministic binary-search protocol to find which one.

**Core principle:** Stages are pure functions with clear contracts. Test the
contract at each boundary — the first boundary that fails is the broken stage.

---

## The Isolation Protocol

Work top-down. Stop at the first stage that produces wrong output.

```
Stage 1 output correct? → No → Fix Stage 1 (parser/treeSitterSetup, astWalker)
       ↓ Yes
Stage 2 output correct? → No → Fix Stage 2 (extractors/views, extractors/modifiers)
       ↓ Yes
Stage 3 output correct? → No → Fix Stage 3 (resolver/stateStubber, modifierFlattener)
       ↓ Yes
Stage 4 output correct? → No → Fix Stage 4 (layout engine)
       ↓ Yes
Stage 5 output correct? → No → Fix Stage 5 (renderer/canvas)
       ↓ Yes
Stage 6 output correct? → No → Fix Stage 6 (device/chrome)
       ↓ Yes
Stage 7 output correct? → No → Fix Stage 7 (navigation/transition)
```

---

## Stage 1: Parser — Is the SyntaxNode tree correct?

**Contract:** Given a Swift source string, return a well-formed SyntaxNode tree.

**How to test:**

```bash
# Run tree-sitter parse on the exact source string causing the bug
cd C:/Users/Asus/OneDrive/Desktop/swift-ui-parser/tree-sitter-swift
cat > C:/Temp/debug.swift << 'EOF'
<paste the exact failing Swift snippet here>
EOF
tree-sitter parse C:/Temp/debug.swift
```

**Correct output:** A tree with no ERROR nodes.
**Incorrect output:** Tree contains `(ERROR ...)` nodes.

**If Stage 1 is broken:**
- The Swift source may be invalid (check for syntax errors)
- CRLF line endings not normalised (run `.replace(/\r\n/g, '\n')` before parsing)
- WASM not loaded — check OutputChannel for `treeSitterSetup` errors
- Grammar version mismatch between WASM and CLI

**Note:** If the tree is valid but has ERROR nodes in unexpected places, the
grammar may not support that Swift construct. This is a grammar limitation, not
your bug — produce `UnknownNode` and move on.

---

## Stage 2: Extractor — Is the ViewNode IR correct?

**Contract:** Given the SyntaxNode tree, return a correctly typed ViewNode array.

**How to test — add a temporary inspection point in `src/parser/index.ts`:**

```typescript
// TEMPORARY DEBUG — remove before commit
export async function parseSwiftFile(source: string): Promise<ViewNode[]> {
  const normalized = source.replace(/\r\n/g, "\n");
  const tree = await parser.parse(normalized);
  const nodes = extractViewNodes(tree.rootNode);

  // TEMP: log IR to OutputChannel
  log("=== Stage 2 IR output ===");
  log(JSON.stringify(nodes, null, 2));

  return nodes;
}
```

**What to look for:**
- `kind: "UnknownNode"` where you expected a specific view type → Stage 2 bug
- Missing modifier in `modifiers[]` array → Stage 2 modifier extractor bug
- Wrong field value (e.g. `spacing: null` when it should be `8`) → Stage 2 bug
- Correct kind but wrong child structure → Stage 2 bug

**Correct output example for `Text("Hello").padding()`:**
```json
[{
  "kind": "Text",
  "content": "Hello",
  "isDynamic": false,
  "modifiers": [{ "kind": "padding", "edges": { "kind": "all" }, "amount": { "kind": "unspecified" } }],
  "id": "node_0"
}]
```

---

## Stage 3: Resolver — Are stubs correctly injected?

**Contract:** Replace property wrapper references with stub values; flatten modifiers.

**How to test:**

```typescript
// TEMPORARY DEBUG — in src/resolver/index.ts
export function resolveViewTree(nodes: ViewNode[]): ViewNode[] {
  const resolved = nodes.map(n => resolveNode(n));
  log("=== Stage 3 resolved IR ===");
  log(JSON.stringify(resolved, null, 2));
  return resolved;
}
```

**What to look for:**
- `@State var count = 0` → `TextNode` with stub content `"0"` or `"false"` etc.
- Modifier order should be identical to Stage 2 output (Stage 3 does not reorder)
- `ForEach` over dynamic data → `isStatic: false`, `stubChild` should be set

**Common Stage 3 bugs:**
- `stateStubber.ts` not recognising the attribute name (e.g. `@StateObject` missed)
- Modifier flattener changing modifier order (it must not)

---

## Stage 4: Layout — Are sizes and positions correct?

**Contract:** Given a ViewNode tree and a proposed size, return a LayoutResult with
concrete sizes and positions for every node.

**How to test — write a unit test:**

```typescript
// tests/layout/vstack.test.ts
import { layoutVStack } from "../../src/layout/views/vstack";
import { makeVStack, makeText } from "../../src/ir/builders";

it("VStack with two Text children calculates correct height", () => {
  const node = makeVStack("center", 8, [
    makeText("Hello"),
    makeText("World"),
  ]);

  const proposed = { width: 393, height: 852 };
  const result = layoutVStack(node, proposed, defaultEnv);

  // Height = sum of children heights + spacing between them
  // Each Text("Hello") at body size = 17pt * 1.29 line height ≈ 22pt
  expect(result.size.height).toBeCloseTo(22 + 8 + 22, 0);
  expect(result.size.width).toBeLessThanOrEqual(393);
});
```

**What to look for:**
- Wrong `size.width` or `size.height` — check propose/accept contract
- Correct size but wrong `origin.x` or `origin.y` — check placement logic
- `.frame(maxWidth: .infinity)` not expanding — check that parent proposed a finite width

**Key: never debug layout visually. Write a test with known proposed size and
assert the concrete size. Visual debugging is Stage 5's domain.**

---

## Stage 5: Renderer — Is the visual output correct?

**Contract:** Given a LayoutResult, draw correct pixels on the WebView canvas.

**How to isolate:**
- Stage 4 layout test passes with correct sizes
- But the visual preview looks wrong

This is Stage 5. Check:
- `src/renderer/canvas.ts` — drawing calls match LayoutResult coordinates
- `src/renderer/iosColors.ts` — correct color token used for the component
- `src/renderer/fonts.ts` — correct font size/weight from SWIFTUI_FONT_SIZES table
- `src/renderer/sfSymbols.ts` — symbol name lookup returning null (renders `?` box)

**Common Stage 5 bugs:**
- Off-by-one on y coordinate (forgetting status bar inset)
- Text rendered with canvas font metrics instead of lookup table
- Color token wrong for current theme (light vs dark)

---

## Stage 6: Device Frame — Is the chrome correct?

**How to isolate:**
- Stage 5 content renders correctly in isolation
- But the device frame shape, notch, or safe area looks wrong

Check `src/device/chrome.ts` and `src/device/devices.ts`.

---

## Stage 7: Navigation — Is the transition correct?

**How to isolate:**
- Individual screens render correctly
- But push/pop animation does not play or plays wrong

Check `src/navigation/transition.ts` for:
- CSS cubic-bezier values (should be `0.42, 0, 0.58, 1.0`)
- Duration (should be 350ms)
- Transform values (outgoing: `translateX(-30%)`, incoming: `translateX(100%) → 0`)

---

## Minimal Reproduction Recipe

The fastest way to isolate a stage is to reduce the failing case to the
smallest possible input that still reproduces the bug.

```
Start: ContentView.swift — 200 lines, bug present

Step 1: Remove half the views. Bug still present?
        Yes → keep the smaller half
        No  → restore, remove the other half

Step 2: Remove modifiers. Bug still present?
        Yes → bug is in view structure, not modifiers
        No  → bug is in a specific modifier

Step 3: Replace complex values with literals.
        Change dynamic @State refs to hardcoded values.
        Bug still present?
        Yes → not a stub issue
        No  → Stage 3 bug in stateStubber

Repeat until you have a 1–5 line snippet that reliably triggers the bug.
THAT is the test fixture. Write it as a test before fixing.
```

---

## OutputChannel Logging Strategy

Each stage has a designated log prefix. This lets you filter the OutputChannel
to see exactly one stage at a time.

```typescript
// Stage 1
log("[S1] tree-sitter parse complete, rootNode.type=" + root.type);

// Stage 2
log("[S2] extracting node: " + node.type);
log("[S2] UnknownNode: " + rawType + " | " + rawSource.slice(0, 40));

// Stage 3
log("[S3] stubbing @State var: " + varName + " → " + stubValue);

// Stage 4
log("[S4] layout VStack proposed=" + JSON.stringify(proposed) + " result=" + JSON.stringify(result.size));

// Stage 5
log("[S5] render Text at (" + x + "," + y + ") size=" + w + "x" + h);
```

Filter in OutputChannel: type `[S2]` to see only Stage 2 output.

---

## When the Stage Is Unclear

If you cannot determine the stage from the symptoms:

1. Enable all stage logs simultaneously
2. Reproduce the bug manually in the preview
3. Read the OutputChannel top-to-bottom
4. The last correct log line tells you which stage failed

This is always faster than reading code speculatively.
