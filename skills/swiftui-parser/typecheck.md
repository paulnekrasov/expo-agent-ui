# TypeScript Strict Mode — Patterns for This Codebase

## Purpose

This project uses TypeScript's three hardest strict flags:
- `strict: true` — enables noImplicitAny, strictNullChecks, strictFunctionTypes, etc.
- `noUncheckedIndexedAccess: true` — array/object index access returns `T | undefined`
- `exactOptionalPropertyTypes: true` — `{ x?: string }` disallows assigning `undefined` to `x`

This file covers every common error these flags produce and exactly how to fix
each one in this codebase specifically.

---

## Quick-Type Command

Run this to check types without doing a full build:

```bash
cd C:/Users/Asus/OneDrive/Desktop/swift-ui-parser
npx tsc --noEmit
```

This is faster than `npm run build`. Run it after every file change.

For a single file:
```bash
npx tsc --noEmit --incremental false src/parser/treeSitterSetup.ts
```

---

## `noUncheckedIndexedAccess` — Most Common Source of Errors

### What it does

Any array index or object key access now returns `T | undefined`:

```typescript
const arr: string[] = ["a", "b"];
const first = arr[0]; // type is string | undefined, NOT string
```

### Error: Object is possibly 'undefined'

```typescript
// ERROR
const children = node.namedChildren;
const firstChild = children[0].type; // Object is possibly 'undefined'

// FIX 1: Optional chaining
const firstChild = children[0]?.type;

// FIX 2: Explicit check (preferred when you need to act on the value)
const child = children[0];
if (!child) return makeUnknown("...", node.text);
const type = child.type;

// FIX 3: Non-null assertion (ONLY when you have structural proof it exists)
// Use sparingly — requires a comment explaining why it's safe
const child = children[0]!; // safe: node.namedChildCount > 0 checked above
```

### Iterating arrays safely

```typescript
// SAFE — for...of never has index issues
for (const child of node.namedChildren) {
  process(child); // child is SyntaxNode, never undefined
}

// SAFE — forEach
node.namedChildren.forEach(child => process(child));

// SAFE — find
const target = node.namedChildren.find(c => c.type === "value_argument");

// RISKY — direct index access
const first = node.namedChildren[0]; // type: SyntaxNode | undefined
// Always check before use
```

### Object property access

```typescript
// This also affects object literal index access
const modifierMap: Record<string, string> = { padding: "...", font: "..." };
const handler = modifierMap[name]; // type: string | undefined

// Fix: check before use
const handler = modifierMap[name];
if (!handler) return { kind: "unknown", name, rawArgs: "" };
```

---

## `exactOptionalPropertyTypes` — Second Most Common

### What it does

A property typed as `x?: string` may only be:
- Absent (the key does not exist on the object)
- A `string`

It may NOT be `undefined` — you cannot do `{ x: undefined }`.

### Error: Type 'undefined' is not assignable to type 'string'

```typescript
interface FrameModifier {
  kind: "frame";
  width?: SizeValue;   // optional — may be absent
}

// ERROR: assigning undefined explicitly
const mod: FrameModifier = { kind: "frame", width: undefined }; // Error

// FIX 1: Omit the property entirely (preferred)
const mod: FrameModifier = { kind: "frame" };

// FIX 2: Use a spread that conditionally includes the property
const width = extractWidth(node); // returns SizeValue | null
const mod: FrameModifier = {
  kind: "frame",
  ...(width !== null && { width }),
};
```

### Constructing optional fields conditionally

```typescript
// Pattern for building objects with optional fields
function makeFrameModifier(
  width: SizeValue | null,
  height: SizeValue | null
): Extract<Modifier, { kind: "frame" }> {
  return {
    kind: "frame",
    ...(width !== null && { width }),
    ...(height !== null && { height }),
  };
}
```

---

## `unknown` Instead of `any`

### Never use `any`. Use `unknown` and narrow.

```typescript
// ERROR pattern
function extractValue(node: SyntaxNode): any { // Never do this
  return node.text;
}

// CORRECT pattern
function extractValue(node: SyntaxNode): unknown {
  return node.text;
}

// Narrowing with type guards
function processNode(raw: unknown): ViewNode {
  if (typeof raw !== "object" || raw === null) {
    return makeUnknown("invalid", "");
  }
  if (!("kind" in raw) || typeof (raw as { kind: unknown }).kind !== "string") {
    return makeUnknown("no-kind", "");
  }
  // Now safe to use as ViewNode candidate
  return raw as ViewNode; // or better: use a proper type guard
}
```

### Type guards for ViewNode

The `src/ir/guards.ts` file has all the guards. Use them:

```typescript
import { isText, isVStack, isUnknown } from "../ir/guards";

function processNode(node: ViewNode): void {
  if (isText(node)) {
    // node is TextNode — all TextNode fields available
    console.log(node.content); // ✓
  }
  if (isVStack(node)) {
    // node is VStackNode
    node.children.forEach(processNode); // ✓
  }
}
```

---

## `web-tree-sitter` — Handling Nullable Returns

The `web-tree-sitter` API returns `SyntaxNode | null` from many calls.
TypeScript strict mode forces you to handle the null.

### Common null-returning methods

```typescript
node.childForFieldName("name")   // returns SyntaxNode | null
node.namedChild(0)               // returns SyntaxNode | null
node.parent                      // returns SyntaxNode | null
tree.rootNode                    // returns SyntaxNode (never null after parse)
```

### Patterns for handling null

```typescript
// Pattern 1: Optional chaining (read-only use)
const label = node.childForFieldName("label")?.text ?? "";

// Pattern 2: Early return with fallback (most common in extractors)
const suffix = node.childForFieldName("call_suffix");
if (!suffix) {
  return makeUnknown(node.type, node.text); // No call suffix = not a call expression
}

// Pattern 3: Null coalescing with a default
const alignment = node.childForFieldName("alignment")?.text ?? "center";

// Pattern 4: Type assertion after check (when returning from a function)
function requireField(node: SyntaxNode, field: string): SyntaxNode {
  const child = node.childForFieldName(field);
  if (!child) throw new Error(`Required field "${field}" missing on ${node.type}`);
  return child;
}
// Only use this in test helpers, never in production extractors (extractors never throw)
```

---

## Discriminated Union Narrowing

The `ViewNode` and `Modifier` types are discriminated unions on `kind`.
TypeScript narrows them correctly when you check `kind`:

```typescript
function renderNode(node: ViewNode): void {
  switch (node.kind) {
    case "Text":
      // node is TextNode here
      renderText(node.content, node.modifiers);
      break;
    case "VStack":
      // node is VStackNode here
      node.children.forEach(renderNode);
      break;
    // ...
    case "UnknownNode":
      // Always handle the fallback
      renderUnknown(node.rawType);
      break;
    default:
      // TypeScript will warn if you miss a case
      // Add this to catch missing cases at compile time:
      const _exhaustive: never = node;
      void _exhaustive;
  }
}
```

**The `never` exhaustive check is recommended** — it causes a compile error if
you add a new `ViewNode` variant but forget to handle it in the switch.

---

## Record Types and Index Signatures

```typescript
// Record<K, V> with noUncheckedIndexedAccess
const sizes: Record<FontStyle, number> = { ... };
const size = sizes["body"]; // type: number | undefined

// Fix when you KNOW the key is valid (it comes from the typed FontStyle union):
function getFontSize(style: FontStyle): number {
  const size = SWIFTUI_FONT_SIZES[style];
  // size is number | undefined due to noUncheckedIndexedAccess
  // But we know FontStyle is exhaustive — every key is present
  // TypeScript doesn't know that, so we must assert
  return size ?? 17; // Provide a sensible default (body size)
}

// Better: use a Map for guaranteed key existence
const FONT_SIZES = new Map<FontStyle, number>([
  ["body", 17],
  // ...
]);
const size = FONT_SIZES.get("body") ?? 17; // .get() returns T | undefined
```

---

## Common Error Messages and Their Fixes

| Error message | Cause | Fix |
|---|---|---|
| `Object is possibly 'undefined'` | `noUncheckedIndexedAccess` on array/object | Optional chain or explicit check |
| `Type 'undefined' is not assignable to type 'X'` | `exactOptionalPropertyTypes` | Omit the property instead of assigning `undefined` |
| `Type 'null' is not assignable to type 'X'` | Missing null check on `web-tree-sitter` return | Add `if (!result) return fallback` |
| `Argument of type 'X \| undefined' is not assignable to parameter of type 'X'` | Result of array index passed to function | Check for `undefined` before passing |
| `Property 'X' does not exist on type 'Y'` | Accessing a field on wrong ViewNode variant | Use the type guard from `ir/guards.ts` first |
| `Type 'string' is not assignable to type 'FontStyle'` | Using raw string where a union type is expected | Use `as FontStyle` only after validating it's in the union |

---

## Validating String Values Against Union Types

```typescript
// You have a raw string from the AST and need a FontStyle
const raw = node.text; // "title" — but TypeScript doesn't know it's a FontStyle

// Wrong — unsafe
const style = raw as FontStyle; // No runtime check

// Correct — validate first
const FONT_STYLES = new Set<FontStyle>([
  "largeTitle", "title", "title2", "title3",
  "headline", "body", "callout", "subheadline",
  "footnote", "caption", "caption2",
]);

function isFontStyle(s: string): s is FontStyle {
  return FONT_STYLES.has(s as FontStyle);
}

const style: FontStyle = isFontStyle(raw) ? raw : "body"; // Default to body
```
