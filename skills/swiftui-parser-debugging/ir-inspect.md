# IR Inspection — ViewNode Tree

## Purpose

When Stage 2 output looks wrong, you need to see the exact ViewNode tree that
the extractor produced. This file provides patterns for printing, asserting,
and validating IR trees in tests and at runtime.

---

## Pretty-Printing the IR Tree

Add this utility to `src/ir/debug.ts` when debugging (remove or gate behind
a debug flag before shipping):

```typescript
// src/ir/debug.ts — DEBUGGING UTILITY, not production code
import type { ViewNode, Modifier } from "./types";

export function prettyPrintIR(nodes: ViewNode[], indent = 0): string {
  return nodes.map(n => prettyNode(n, indent)).join("\n");
}

function prettyNode(node: ViewNode, indent: number): string {
  const pad = "  ".repeat(indent);
  const mods = node.modifiers.length > 0
    ? ` [${node.modifiers.map(m => m.kind).join(", ")}]`
    : "";

  switch (node.kind) {
    case "VStack":
    case "HStack":
    case "ZStack":
      return [
        `${pad}${node.kind}(alignment:${node.alignment}${node.kind !== "ZStack" ? `, spacing:${node.spacing}` : ""})${mods}`,
        ...node.children.map(c => prettyNode(c, indent + 1)),
      ].join("\n");

    case "Text":
      return `${pad}Text("${node.content}"${node.isDynamic ? " [dynamic]" : ""})${mods}`;

    case "Image":
      const src = node.source.kind === "systemName"
        ? `systemName:"${node.source.name}"`
        : node.source.kind === "named"
        ? `"${node.source.name}"`
        : "unknown";
      return `${pad}Image(${src})${node.isResizable ? " .resizable()" : ""}${mods}`;

    case "Spacer":
      return `${pad}Spacer(${node.minLength ?? ""})${mods}`;

    case "ScrollView":
      return [
        `${pad}ScrollView(${node.axes})${mods}`,
        prettyNode(node.child, indent + 1),
      ].join("\n");

    case "NavigationStack":
      return [
        `${pad}NavigationStack${mods}`,
        prettyNode(node.child, indent + 1),
      ].join("\n");

    case "List":
    case "Form":
    case "Group":
      return [
        `${pad}${node.kind}${mods}`,
        ...node.children.map(c => prettyNode(c, indent + 1)),
      ].join("\n");

    case "ForEach":
      return `${pad}ForEach(${node.isStatic ? "static" : "dynamic/3 rows"})${mods}`;

    case "UnknownNode":
      return `${pad}⚠ UnknownNode(${node.rawType}) "${node.rawSource.slice(0, 40)}"`;

    default:
      return `${pad}${node.kind}${mods}`;
  }
}
```

**Usage in tests:**
```typescript
import { prettyPrintIR } from "../../src/ir/debug";

const nodes = await parseSwiftSnippet(source);
console.log(prettyPrintIR(nodes));
// Output:
// VStack(alignment: center spacing:8) [padding]
//   Text("Hello") [font, foregroundColor]
//   Spacer()
//   Text("World")
```

---

## Asserting IR Structure in Tests

Use `toMatchObject` for partial matching — check the fields you care about,
ignore fields you don't (like generated `id`):

```typescript
// Exact kind and content
expect(result[0]).toMatchObject({
  kind: "Text",
  content: "Hello",
  isDynamic: false,
});

// Container with children
expect(result[0]).toMatchObject({
  kind: "VStack",
  alignment: "leading",
  spacing: 8,
  children: expect.arrayContaining([
    expect.objectContaining({ kind: "Text", content: "Title" }),
    expect.objectContaining({ kind: "Spacer" }),
  ]),
});

// Modifier array (order matters — it is the layout order)
expect(result[0].modifiers).toEqual([
  { kind: "font", style: "title" },
  { kind: "foregroundColor", color: { kind: "system", name: "blue" } },
  { kind: "padding", edges: { kind: "all" }, amount: { kind: "unspecified" } },
]);

// No UnknownNodes anywhere in the tree
function assertNoUnknownNodes(nodes: ViewNode[]): void {
  for (const node of nodes) {
    expect(node.kind).not.toBe("UnknownNode");
    if ("children" in node) assertNoUnknownNodes(node.children as ViewNode[]);
    if ("child" in node) assertNoUnknownNodes([node.child as ViewNode]);
  }
}
assertNoUnknownNodes(result);
```

---

## Expected IR Shapes — Reference

### `Text("Hello")`
```json
{
  "kind": "Text",
  "content": "Hello",
  "isDynamic": false,
  "modifiers": [],
  "id": "node_0"
}
```

### `Text("Hello \(name)")`
```json
{
  "kind": "Text",
  "content": "Hello ${name}",
  "isDynamic": true,
  "modifiers": [],
  "id": "node_0"
}
```

### `VStack(alignment: .leading, spacing: 8) { Text("A"); Text("B") }`
```json
{
  "kind": "VStack",
  "alignment": "leading",
  "spacing": 8,
  "children": [
    { "kind": "Text", "content": "A", "isDynamic": false, "modifiers": [] },
    { "kind": "Text", "content": "B", "isDynamic": false, "modifiers": [] }
  ],
  "modifiers": []
}
```

### `Image(systemName: "star.fill")`
```json
{
  "kind": "Image",
  "source": { "kind": "systemName", "name": "star.fill" },
  "isResizable": false,
  "contentMode": null,
  "modifiers": []
}
```

### `.padding()` modifier (no argument)
```json
{ "kind": "padding", "edges": { "kind": "all" }, "amount": { "kind": "unspecified" } }
```

### `.padding(16)` modifier
```json
{ "kind": "padding", "edges": { "kind": "all" }, "amount": { "kind": "fixed", "value": 16 } }
```

### `.frame(maxWidth: .infinity)`
```json
{ "kind": "frame", "maxWidth": { "kind": "infinity" } }
```

### `.font(.title)`
```json
{ "kind": "font", "style": "title" }
```

### `.foregroundColor(.blue)`
```json
{ "kind": "foregroundColor", "color": { "kind": "system", "name": "blue" } }
```

---

## Validating IR Completeness

Check that nothing important fell through to `UnknownNode`:

```typescript
function countUnknownNodes(nodes: ViewNode[]): { count: number; types: string[] } {
  let count = 0;
  const types: string[] = [];

  function walk(node: ViewNode) {
    if (node.kind === "UnknownNode") {
      count++;
      types.push(node.rawType);
    }
    if ("children" in node) (node.children as ViewNode[]).forEach(walk);
    if ("child" in node) walk(node.child as ViewNode);
  }

  nodes.forEach(walk);
  return { count, types };
}

// In test
const { count, types } = countUnknownNodes(result);
if (count > 0) {
  console.log(`${count} UnknownNodes: ${types.join(", ")}`);
}
expect(count).toBe(0);
```

---

## Modifier Order Verification

Modifier order is semantically significant in SwiftUI.
`.padding().background()` ≠ `.background().padding()`.

Test that order is preserved:

```typescript
// Source: Text("Hi").padding().background(Color.red)
// Expected modifier array ORDER: [padding, background]
// (first modifier applied to the view = first in array)

const text = result[0];
expect(text.modifiers[0]?.kind).toBe("padding");
expect(text.modifiers[1]?.kind).toBe("background");
```

**Common mistake:** Extractor collects modifiers in AST order (outermost first =
last applied first) and forgets to reverse. Always reverse the collected array.

---

## Checking for Missing Fields

Use TypeScript's strict mode to catch missing fields at compile time, not
at runtime. But when debugging, also check at runtime:

```typescript
function validateViewNode(node: ViewNode): string[] {
  const errors: string[] = [];

  if (!node.kind) errors.push("missing kind");
  if (!node.id) errors.push("missing id");
  if (!Array.isArray(node.modifiers)) errors.push("modifiers is not an array");

  if (node.kind === "Text") {
    if (typeof node.content !== "string") errors.push("Text.content not a string");
  }

  if (node.kind === "VStack" || node.kind === "HStack") {
    if (!Array.isArray(node.children)) errors.push(`${node.kind}.children not an array`);
  }

  return errors;
}
```
