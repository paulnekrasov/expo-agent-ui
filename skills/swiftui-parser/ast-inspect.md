# AST Inspection — tree-sitter-swift

## Purpose

Before writing or fixing any Stage 1/2 extractor, you must know exactly what
AST tree-sitter produces for the Swift construct you are targeting. This file
is the complete guide to that inspection process.

**Core principle:** Never guess at node type names. Always verify with
`tree-sitter parse` before writing extractor code.

---

## Setup — One-Time

The `tree-sitter` CLI is installed globally (confirmed: 0.26.7).
The grammar lives at `tree-sitter-swift/` in the project root.

```bash
# Verify the CLI can parse Swift
cd C:/Users/Asus/OneDrive/Desktop/swift-ui-parser/tree-sitter-swift
echo 'Text("Hello")' > /tmp/test.swift
tree-sitter parse /tmp/test.swift
```

You should see a tree. If it fails, check that you are in the grammar directory.

---

## How to Inspect Any Swift Snippet

### Step 1 — Write the snippet to a temp file

```bash
# Write snippet to a temp file (always use .swift extension)
cat > /tmp/inspect.swift << 'EOF'
import SwiftUI

struct ContentView: View {
    var body: some View {
        Text("Hello, World!")
            .font(.title)
            .foregroundColor(.blue)
            .padding()
    }
}
EOF
```

### Step 2 — Parse it

```bash
cd C:/Users/Asus/OneDrive/Desktop/swift-ui-parser/tree-sitter-swift
tree-sitter parse /tmp/inspect.swift
```

### Step 3 — Parse with source positions (useful for debugging ranges)

```bash
tree-sitter parse --output-dot /tmp/inspect.swift  # for dot graph
```

---

## Reading the Parse Tree Output

tree-sitter output uses indentation to show the tree hierarchy.

```
(source_file [0, 0] - [9, 1]
  (import_declaration [0, 0] - [0, 13]
    (identifier) [0, 7] - [0, 13])
  (class_declaration [2, 0] - [8, 1]
    ...
    (function_declaration [3, 4] - [7, 5]
      ...
      (call_expression [4, 8] - [7, 16]
        (simple_identifier [4, 8] - [4, 12]) "Text"
        (call_suffix [4, 12] - [4, 27]
          (value_arguments [4, 12] - [4, 27]
            (value_argument [4, 13] - [4, 26]
              (line_string_literal [4, 13] - [4, 26]
                (string_literal_content [4, 14] - [4, 25]) "Hello, World!"))))
        ...))))
```

**Conventions:**
- `(node_type ...)` — named node — access via `node.namedChildren` or `node.childForFieldName()`
- `"text"` — anonymous token — these are literal characters/keywords, not named
- `[row, col] - [row, col]` — source range
- Indentation = nesting depth

**Named vs anonymous:**
```
node.children         → ALL children including anonymous tokens (punctuation, keywords)
node.namedChildren    → ONLY named children (the ones you care about in extractors)
node.childCount       → total including anonymous
node.namedChildCount  → named only
```

---

## Critical Patterns for SwiftUI Extractors

### 1. Simple view call — `Text("Hello")`

```
(call_expression
  (simple_identifier) "Text"
  (call_suffix
    (value_arguments
      (value_argument
        (line_string_literal
          (string_literal_content) "Hello")))))
```

**How to extract the string:**
```typescript
const callSuffix = node.childForFieldName("suffix");         // call_suffix
const args = callSuffix?.child(0);                           // value_arguments
const firstArg = args?.namedChild(0);                        // value_argument
const stringLit = firstArg?.namedChild(0);                   // line_string_literal
const content = stringLit?.namedChild(0)?.text ?? "";        // string_literal_content
```

### 2. Modifier chain — `.font(.title).padding()`

Each modifier wraps the previous expression:

```
(call_expression                         ← .padding() — outermost = last modifier
  (call_expression                       ← .font(.title) — inner = first modifier
    (simple_identifier) "Text"
    (call_suffix ...))
  (navigation_suffix
    (simple_identifier) "padding")
  (call_suffix
    (value_arguments)))
```

**Walking rule:** The outermost `call_expression` is the LAST modifier applied.
Walk right-to-left (from outermost to innermost), collect into array, then
reverse before storing.

```typescript
function extractModifierChain(node: SyntaxNode): [SyntaxNode, Modifier[]] {
  const modifiers: Modifier[] = [];
  let current = node;

  while (current.type === "call_expression") {
    const navSuffix = current.children.find(c => c.type === "navigation_suffix");
    if (!navSuffix) break; // No navigation_suffix = this is the root view call, not a modifier

    const modifierName = navSuffix.namedChild(0)?.text ?? "";
    const callSuffix = current.children.find(c => c.type === "call_suffix");
    const modifier = extractModifier(modifierName, callSuffix);
    modifiers.push(modifier);

    // Move inward
    current = current.namedChild(0)!;
  }

  modifiers.reverse(); // Outermost was last-applied → reverse for correct order
  return [current, modifiers]; // current is now the root view node
}
```

### 3. Trailing closure — `VStack { ... }`

```
(call_expression
  (simple_identifier) "VStack"
  (call_suffix
    (lambda_literal                       ← NOT "trailing_closure" — it's lambda_literal
      (lambda_function_type ...)
      (statements
        (call_expression ...)             ← child views are statements here
        (call_expression ...)))))
```

**Getting children from a ViewBuilder closure:**
```typescript
function extractViewBuilderChildren(lambdaNode: SyntaxNode): SyntaxNode[] {
  // lambda_literal > statements > [call_expression, if_statement, ...]
  const statements = lambdaNode.childForFieldName("statements");
  if (!statements) return [];
  return statements.namedChildren.filter(c =>
    c.type === "call_expression" ||
    c.type === "if_statement" ||
    c.type === "switch_statement"
  );
}
```

### 4. Labeled arguments — `VStack(alignment: .leading, spacing: 8)`

```
(call_expression
  (simple_identifier) "VStack"
  (call_suffix
    (value_arguments
      (value_argument
        label: (simple_identifier) "alignment"
        value: (navigation_expression
          (simple_identifier) "leading"))
      (value_argument
        label: (simple_identifier) "spacing"
        value: (integer_literal) "8"))))
```

**Accessing labeled arguments:**
```typescript
function findLabeledArgument(callSuffix: SyntaxNode, label: string): SyntaxNode | null {
  const args = callSuffix.namedChild(0); // value_arguments
  if (!args) return null;
  for (const arg of args.namedChildren) {
    // arg is value_argument
    const argLabel = arg.childForFieldName("label")?.text;
    if (argLabel === label) {
      return arg.childForFieldName("value") ?? null;
    }
  }
  return null;
}
```

### 5. Member expression — `.blue`, `Color.blue`

```
// .blue (implicit Color.)
(navigation_expression
  (simple_identifier) "blue")

// Color.blue (explicit)
(navigation_expression
  (type_identifier) "Color"
  (navigation_suffix
    (simple_identifier) "blue"))
```

**Normalising both forms:**
```typescript
function extractColorValue(node: SyntaxNode): ColorValue {
  if (node.type === "navigation_expression") {
    const parts = node.namedChildren.map(c => c.text);
    const name = parts[parts.length - 1] ?? ""; // Always the last identifier
    return { kind: "system", name };
  }
  return { kind: "unknown", raw: node.text };
}
```

### 6. Property declaration — `@State private var count: Int = 0`

```
(property_declaration                    ← NOT variable_declaration
  (attribute) "@State"
  (pattern_binding
    name: (simple_identifier) "count"
    type_annotation: (type_annotation
      (user_type (type_identifier) "Int"))
    initializer: (integer_literal) "0"))
```

**Key:** `property_declaration` not `variable_declaration`.
The attribute `@State` is a child of type `attribute`.

### 7. Conditional view — `if condition { ViewA() } else { ViewB() }`

```
(if_statement                            ← NOT if_expression
  condition: (simple_identifier) "condition"
  consequence: (function_body
    (statements
      (call_expression ...)))
  alternative: (else_clause
    (function_body
      (statements
        (call_expression ...)))))
```

**Stub rule:** Render the `else` branch (condition evaluates to false in preview).

### 8. String interpolation — `Text("Hello \(name)")`

```
(call_expression
  (simple_identifier) "Text"
  (call_suffix
    (value_arguments
      (value_argument
        (line_string_literal
          (string_literal_content) "Hello "
          (interpolation                  ← NOT interpolated_string_expression
            (simple_identifier) "name"))))))
```

**Extraction:**
```typescript
function extractStringLiteral(node: SyntaxNode): { content: string; isDynamic: boolean } {
  // node is line_string_literal
  let content = "";
  let isDynamic = false;

  for (const child of node.namedChildren) {
    if (child.type === "string_literal_content") {
      content += child.text;
    } else if (child.type === "interpolation") {
      content += "${" + child.text + "}";
      isDynamic = true;
    }
  }

  return { content, isDynamic };
}
```

---

## Debugging Workflow: Extractor Returns UnknownNode

```
1. Write the minimal Swift snippet that triggers the UnknownNode
   (one view, one modifier, nothing extra)

2. Run: tree-sitter parse /tmp/snippet.swift
   Save the full output

3. Find the node the extractor should be matching.
   What is its actual node.type?

4. Check INDEX.md node name traps table.
   Is the name you're using in the extractor the wrong one?

5. If node.type is correct, check field names.
   Print all field names: node.fields (or iterate node.namedChildren)
   Does childForFieldName("expectedField") return null?

6. If field names are correct, check for named vs anonymous children.
   Use node.namedChildren instead of node.children

7. Add a temporary log line at the top of the extractor:
   log(`[DEBUG] ${node.type}: ${node.text.slice(0, 60)}`);
   This confirms the extractor IS being called with the right node.

8. Fix the specific mismatch found. Run npm test. Remove debug log.
```

---

## Quick Command Reference

```bash
# Parse a file from the tree-sitter-swift directory
cd C:/Users/Asus/OneDrive/Desktop/swift-ui-parser/tree-sitter-swift
tree-sitter parse /path/to/file.swift

# Parse inline Swift (write to temp file first on Windows)
echo 'Text("Hello")' > C:/Temp/t.swift
tree-sitter parse C:/Temp/t.swift

# Parse with verbose output (shows all nodes including anonymous)
tree-sitter parse --cst /path/to/file.swift

# Check grammar tests (useful to see what parse trees look like)
tree-sitter test

# Parse and pipe to head for large files
tree-sitter parse /path/to/file.swift | head -80
```

---

## Node Type Quick-Reference Card

| Swift construct | tree-sitter node type |
|---|---|
| `Text("hello")` | `call_expression` |
| `"hello"` | `line_string_literal` |
| `"""multi"""` | `multi_line_string_literal` |
| `\(name)` inside string | `interpolation` |
| `42` | `integer_literal` |
| `3.14` | `real_literal` — NOT `float_literal` |
| `.blue` | `navigation_expression` |
| `Color.blue` | `navigation_expression` |
| `{ ... }` trailing closure | `lambda_literal` |
| `if x { } else { }` | `if_statement` — NOT `if_expression` |
| `for x in items { }` | `for_statement` — NOT `for_in_statement` |
| `var x = 0` (in view body) | `property_declaration` — NOT `variable_declaration` |
| `(a: 1, b: 2)` | `value_arguments` containing `value_argument` |
| `func foo()` | `function_declaration` |
| `struct Foo: View` | `class_declaration` (yes, struct uses this too) |
| `@State` | `attribute` |
| `.padding(16)` modifier | `navigation_suffix` inside outer `call_expression` |
