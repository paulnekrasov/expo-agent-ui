# SwiftUI Preview – Layer 2 web-tree-sitter Extras (Logging, Progress, Node Helpers)

## Session Header

Research Layer: 2 — web-tree-sitter TypeScript API  
Task: Extend the Layer 2 reference with parser logging and timeout/progress hooks plus richer Node/Tree helpers relevant to the SwiftUI Preview extension.  
Sources: web-tree-sitter parser documentation for version 0.25.x (Tessl mirror), web-tree-sitter core types docs, unified API typings and examples showing Node/Tree properties and methods.[^1][^2][^3][^4]
Scope: `Parser.setLogger`/`getLogger`, parse `ParseOptions.progressCallback` and `includedRanges`, deprecated `getTimeoutMicros`/`setTimeoutMicros`, Node helpers (`text`, positions, parent/children/siblings, error/missing/changed flags, descendant search), and Tree helpers (`copy`, `rootNodeWithOffset`, `walk`).

***

## Parser Logging and Progress Hooks

### Logging configuration

```typescript
// API: Parser.setLogger / Parser.getLogger
// Source: npm-web-tree-sitter parser documentation (Tessl mirror)
class Parser {
  /**
   * Set the logging callback for parser operations
   * @param callback - Log callback function, true for console logging, or null to disable
   * @returns Parser instance for chaining
   */
  setLogger(callback: LogCallback | boolean | null): this;

  /**
   * Get the parser's current logger
   * @returns Current log callback or null if not set
   */
  getLogger(): LogCallback | null;
}
```

Usage pattern for this project:
- During development, set `parser.setLogger(true)` or pass a custom `(message, isLex) => void` logger to inspect parsing behavior and diagnose grammar/language-version issues when loading `tree-sitter-swift.wasm` or parsing problematic Swift files.[^1]
- In production builds of the extension, disable logging with `parser.setLogger(null)` to avoid performance overhead and noisy console output.[^1]

⚠ WINDOWS: Logging writes to the JS runtime’s console; in a VS Code extension this means the extension host console, which can be viewed via the Developer Tools. There are no Windows-specific issues, but high-volume logs can slow down the UI; keep logging disabled except when debugging parsing problems.[INFERRED — verify]

### Progress and cancellation

```typescript
// API: Parser.parse with ParseOptions
// Source: npm-web-tree-sitter parser documentation (Tessl mirror)
interface ParseOptions {
  /** Array of ranges to include when parsing */
  includedRanges?: Range[];
  /** Progress callback for monitoring parsing */
  progressCallback?: (state: ParseState) => void;
}

interface ParseState {
  /** Current byte offset in document */
  currentOffset: number;
  /** Whether parser has encountered an error */
  hasError: boolean;
}

// Deprecated timeout API
// Source: npm-web-tree-sitter parser documentation (Tessl mirror)
class Parser {
  /**
   * @deprecated Use progressCallback in parse options instead
   * Get the duration in microseconds that parsing is allowed to take
   */
  getTimeoutMicros(): number;

  /**
   * @deprecated Use progressCallback in parse options instead
   * Set the maximum duration in microseconds for parsing
   */
  setTimeoutMicros(timeout: number): void;
}
```

Usage pattern for this project:
- Prefer `progressCallback` in the `parse` options for monitoring long parses, updating a status indicator, or implementing cooperative cancellation based on `currentOffset`/`hasError`.[^1]
- Avoid relying on `setTimeoutMicros` for cancellation in modern versions; ecosystem issues indicate timeout behavior changed across releases, and the docs now mark these methods as deprecated.[^5][^1]
- Use `includedRanges` if the extension ever needs to parse only parts of a file (for example, only view bodies or a specific region), reducing work in large Swift files.[^1]

Extractor / extension implication:
- The preview pipeline can keep the core extractor synchronous but should expose a higher-level parse wrapper that accepts a cancellation token or timeout budget and wires it to `progressCallback` and `Parser.reset()` when parsing should be aborted or restarted.[^1]

***

## Node Helpers – Text, Positions, Structure, and Errors

The unified API typings and Deno/web-tree-sitter wrappers align on a common `Node` / `SyntaxNode` surface that matches web-tree-sitter’s behavior.[^2][^3]

```typescript
// API: Node (SyntaxNode-like)
// Source: Unified Tree-sitter API typings and web-tree-sitter usage examples
interface Node {
  // Identity and text
  tree: Tree;
  type: string;
  text: string;

  // Positions and indices
  startPosition: Point;
  endPosition: Point;
  startIndex: number;
  endIndex: number;

  // Tree relations
  parent: Node | null;
  children: Node[];
  namedChildren: Node[];
  childCount: number;
  namedChildCount: number;
  firstChild: Node | null;
  firstNamedChild: Node | null;
  lastChild: Node | null;
  lastNamedChild: Node | null;
  nextSibling: Node | null;
  nextNamedSibling: Node | null;
  previousSibling: Node | null;
  previousNamedSibling: Node | null;

  // Status helpers
  hasChanges(): boolean;
  hasError(): boolean;
  isMissing(): boolean;

  // Basic queries
  toString(): string;
  child(index: number): Node | null;
  namedChild(index: number): Node | null;

  // Cursor entry
  walk(): TreeCursor;
}
```

Usage implications for SwiftUI Preview:
- Use `text` plus `startPosition`/`endPosition` for quick extraction of view identifiers, argument strings, and for mapping nodes back to VS Code ranges when highlighting layout errors or selection overlays.[^6][^2]
- Favor `namedChildren` / `namedChild` for traversal in most extractor logic, since Layer 1 grammar notes already rely on named node types (for example `call_expression`, `lambda_literal`) and usually do not need punctuation tokens.[^2]
- Use `hasError()` and `isMissing()` to short-circuit or downgrade preview fidelity when the Swift source is syntactically invalid in a region, avoiding misleading layout results.[^3][^2]

### Node descendant search helpers

```typescript
// Extended Node helpers (commonly exposed by web-tree-sitter wrappers)
// Source: Deno/web-tree-sitter wrapper API reference
interface Node {
  // Descendant search by type or position
  descendantsOfType(type: string | string[], startPosition?: Point, endPosition?: Point): Node[];
  descendantForIndex(index: number, endIndex?: number): Node;
  namedDescendantForIndex(index: number, endIndex?: number): Node;
  descendantForPosition(position: Point, endPosition?: Point): Node;
  namedDescendantForPosition(position: Point, endPosition?: Point): Node;

  // Field-based access
  childForFieldId(id: number): Node | null;
  childForFieldName(field: string): Node | null;
}
```

Usage implications:
- `descendantsOfType(['call_expression', 'lambda_literal'])` can be used for quick scans (for example locating all view-producing calls in a region), but primary extractor traversal should still be guided by the Layer 1 grammar expectations rather than broad queries.[^3]
- Position-based helpers (`descendantForPosition`) are ideal for mapping a cursor position in VS Code to the nearest SwiftUI view node, enabling features like “jump to view in preview” or view-outline selection syncing.[^3]
- `childForFieldName` is particularly useful when working with grammars that define strong fields (for example `body` on class declarations); even though `tree-sitter-swift` uses many positional children, this pattern is still relevant for other grammars or future extensions.[^2]

***

## Tree Helpers – Copies, Offsets, and Cursors

```typescript
// API: Tree
// Source: npm-web-tree-sitter tree-node documentation (Tessl mirror)
interface Tree {
  /** Create a shallow copy of the syntax tree (very fast operation) */
  copy(): Tree;

  /** Delete the syntax tree and free its resources */
  delete(): void;

  /** The language that was used to parse the syntax tree */
  language: Language;

  /** Get the root node of the syntax tree */
  get rootNode(): Node;

  /**
   * Get the root node with its position shifted forward by the given offset
   * @param offsetBytes - Byte offset to apply
   * @param offsetExtent - Point offset to apply
   * @returns Root node with adjusted position
   */
  rootNodeWithOffset(offsetBytes: number, offsetExtent: Point): Node;

  /**
   * Edit the syntax tree to keep it in sync with source code changes
   * @param edit - Description of the edit in both byte offsets and row/column coordinates
   */
  edit(edit: Edit): void;

  /**
   * Compare this tree to a new tree and get ranges where structure changed
   * @param other - New tree representing the same document after edits
   * @returns Array of ranges with syntactic structure changes
   */
  getChangedRanges(other: Tree): Range[];

  /**
   * Get a cursor for efficient tree traversal
   */
  walk(): TreeCursor;
}
```

Usage implications for SwiftUI Preview:
- Use `copy()` when a debugging or visualization feature needs to hold onto a tree snapshot while allowing the main pipeline to mutate or discard the current tree.[^7]
- Prefer `edit` + incremental `parse` to keep the preview in sync with small edits; then use `getChangedRanges` to limit which parts of the layout need to be recomputed.[^6][^7]
- `rootNodeWithOffset` is useful if you ever embed Swift code inside another language region (for example, SwiftUI previewing inside a Markdown or multi-language file) and need to compensate for document offsets.[^7]

***

## Quick Checklist for Layer 2 Use in the Extension

- Always call `Parser.init` once on startup (with `locateFile` configured to find WASM), then reuse `Parser` and `Language` instances.[^4][^1]
- Attach a logger only when debugging parsing issues, using `setLogger(true)` or a custom callback; otherwise leave it disabled.[^1]
- Use the `parse` options object for `includedRanges` and lightweight `progressCallback` monitoring instead of `setTimeoutMicros` in new code.[^5][^1]
- In Stage 2, base traversal on `Node.type`, `namedChildren`, and the Layer 1 grammar, reserving descendant helpers for UX features (selection mapping, global searches).[^2][^3]
- Drive incremental updates using `Tree.edit`, `parse` with `oldTree`, and `getChangedRanges` to scope re-layout, which will be critical for responsive previews on large Swift files.[^6][^7]

---

## References

1. [npm-web-tree-sitter@0.25.0 • tessl • Registry](https://tessl.io/registry/tessl/npm-web-tree-sitter/0.25.0/files/docs/parser.md) - Tree-sitter bindings for the web providing ... tessl/npm-web-tree-sitter. Tree-sitter bindings ... s...

2. [Unified tree-sitter API for Node.js and Web](https://gist.github.com/nachawati/351cba7c0b9adff2b75a2fafe3e73ac3) - tree: Tree;. type: string;. text: string;. startPosition: Point;. endPosition: Point;. startIndex: n...

3. [jeff-hykin/deno-tree-sitter: 💾 📦 ✅ Use the web- ...](https://github.com/jeff-hykin/deno-tree-sitter) - This is a patched+extended version of the web-tree-sitter made to be bundler-friendly and run on Den...

4. [0.25.0 • npm-web-tree-sitter • tessl • Registry](https://tessl.io/registry/tessl/npm-web-tree-sitter) - Web Tree-sitter provides WebAssembly bindings for the Tree-sitter parsing library, enabling incremen...

5. [`setTimeoutMicros` doesn't appear to work in the latest ...](https://github.com/tree-sitter/tree-sitter/issues/3341) - Problem The last version where setTimeoutMicros works in the web-tree-sitter package is 0.22.2. I've...

6. [Editing AST · tree-sitter tree-sitter · Discussion #2553](https://github.com/tree-sitter/tree-sitter/discussions/2553) - If there is a need to get a new edited AST then it's enough to call Tree-sitter parser again on the ...

7. [Tessl Tile for npm/web-tree-sitter@0.25.0](https://tessl.io/registry/tessl/npm-web-tree-sitter/0.25.0/files/docs/tree-node.md) - Tree-sitter bindings for the web providing WebAssembly-based incremental parsing of source code

