# SwiftUI Preview – Layer 2 web-tree-sitter TypeScript API

## Session Header

Research Layer: 2 — web-tree-sitter TypeScript API  
Task: Collect exact TypeScript method signatures and usage notes for the web-tree-sitter API needed by the SwiftUI Preview extension: initialization sequence, core parsing methods, node traversal, tree cursor, query API, and high-level WASM loading behavior.  
Sources: web-tree-sitter TypeScript API documentation (Tessl registry mirror for `npm/web-tree-sitter@0.25.0`), npm package documentation for `@dqbd/web-tree-sitter` and `web-tree-sitter` (for usage examples and initialization patterns).[^1][^2][^3]
Scope: `Parser.init`, `Parser` constructor, `Parser.setLanguage`, `Parser.parse`; `Language.load` and core `Language` helpers; `Tree` and `Node` navigation methods; `Query` constructor and matching methods; `TreeCursor` navigation; core support types (`Point`, `Range`, `Edit`, `ParseCallback`, `ParseState`), and the basic `Parser.init → Language.load → parser.setLanguage` sequence.

***

## Initialization Sequence (High-Level)

TRANSFORM: web-tree-sitter initialization sequence  
  Input concept: Initialize the WebAssembly runtime, load a language grammar, and set up a parser that can be reused for Swift source.[^3][^1]
  Desugared to:
  ```typescript
  import { Parser, Language } from "web-tree-sitter";

  await Parser.init();
  const Swift = await Language.load("/path/to/tree-sitter-swift.wasm");

  const parser = new Parser();
  parser.setLanguage(Swift);

  const tree = parser.parse(sourceCode);
  ```
  AST / binding implication: The extension must call `Parser.init()` exactly once before any other web-tree-sitter API, then call the static `Language.load` to obtain a `Language` instance from a `.wasm` grammar file, then construct a `Parser` and bind it to that `Language` via `setLanguage` before parsing.[^3]
  Extractor rule: Stage 1/2 code should centralize initialization in an async bootstrap path (VS Code extension activation or WebView startup) so that all later parsing of SwiftUI files can reuse the same initialized `Parser` and `Language` instances, avoiding repeated WASM initialization and language loading.

⚠ WINDOWS: When running inside a VS Code extension on Windows, the `.wasm` path passed to `Language.load` must be a file URL or path that respects Windows path separators and VS Code’s `Uri` handling; use `vscode.Uri.joinPath(context.extensionUri, 'dist', 'tree-sitter-swift.wasm')` and `Language.load(uri.fsPath)` or an equivalent pattern.[INFERRED — verify against local extension runtime]

***

## Parser API

### Parser class

```typescript
// Method: Parser.init
// Source: web-tree-sitter TypeScript API documentation (Tessl mirror)
class Parser {
  static init(moduleOptions?: EmscriptenModule): Promise<void>;
  // Usage note: Must be awaited once before using any other Parser, Language, or parsing APIs.
  // Windows note: Pass a custom `locateFile` in `moduleOptions` if the VS Code extension needs
  //               to control where the `tree-sitter.wasm` core runtime is loaded from.[INFERRED — verify]

  // Method: constructor
  // Source: web-tree-sitter TypeScript API documentation
  constructor();
  // Usage note: Creates a new, stateful parser instance; call `setLanguage` before `parse`.
  // Windows note: No Windows-specific behavior; parser instances are pure JS objects.

  // Method: setLanguage
  // Source: web-tree-sitter TypeScript API documentation
  setLanguage(language: Language | null): this;
  // Usage note: Binds the parser to a specific language grammar; must be called before parsing.
  //             Passing `null` detaches the language.
  // Windows note: Ensure the `Language` was created from a `.wasm` file that is actually readable
  //               from the VS Code extension environment.

  // Method: parse
  // Source: web-tree-sitter TypeScript API documentation
  parse(callback: string | ParseCallback, oldTree?: Tree | null, options?: ParseOptions): Tree | null;
  // Usage note: Accepts either a source string or a `ParseCallback` that can lazily provide text;
  //             optionally accepts a previous Tree for incremental parsing.
  // Windows note: No Windows-specific behavior; caller is responsible for providing text in UTF-16
  //               JS strings consistent with offsets used elsewhere.
}
```

Extractor implication: For the SwiftUI Preview extension, Stage 1 should expose a thin wrapper around `Parser` that always enforces `Parser.init` and `setLanguage` before parsing, and that consistently passes the previous `Tree` to `parse` so that later features (like live preview updates) can exploit incremental parsing.[^3]

***

## Language API

```typescript
// Method: Language.load
// Source: web-tree-sitter TypeScript API documentation (Tessl mirror)
class Language {
  static load(input: string | Uint8Array): Promise<Language>;
  // Usage note: Loads a compiled Tree-sitter language from a WebAssembly module; `input` can be
  //             a URL/path string (web/Node) or a `Uint8Array` of WASM bytes.
  // Windows note: In VS Code, prefer passing a file system path derived from `vscode.Uri.fsPath`
  //               to avoid issues with backslashes and URI encoding.[INFERRED — verify]

  // Method: name
  // Source: web-tree-sitter TypeScript API documentation
  get name(): string | null;
  // Usage note: Returns the language name embedded in the WASM module; useful for diagnostics.

  // Method: abiVersion
  // Source: web-tree-sitter TypeScript API documentation
  get abiVersion(): number;
  // Usage note: Exposes the ABI version; can be compared to `LANGUAGE_VERSION` and
  //             `MIN_COMPATIBLE_VERSION` for compatibility checks.

  // Method: fieldIdForName
  // Source: web-tree-sitter TypeScript API documentation
  fieldIdForName(fieldName: string): number | null;
  // Usage note: Maps a field name (like "body" or "arguments") to its numeric ID for use in
  //             low-level APIs; primarily relevant when interoperating with query captures.

  // Method: idForNodeType
  // Source: web-tree-sitter TypeScript API documentation
  idForNodeType(type: string, named: boolean): number | null;
  // Usage note: Converts a node type string and named-flag into its numeric ID, mirroring
  //             `node-types.json` entries; useful for perf-sensitive code.
}
```

Extractor implication: Although the SwiftUI Preview extractor can operate purely on string node types, access to `fieldIdForName` and `idForNodeType` enables more efficient traversal or query-based extraction if needed for large files.[^3]

***

## Tree and Node Navigation

```typescript
// Method: Tree.rootNode
// Source: web-tree-sitter TypeScript API documentation
class Tree {
  get rootNode(): Node;
  // Usage note: Entry point to the syntax tree for all traversal and extraction logic.

  // Method: Tree.edit
  // Source: web-tree-sitter TypeScript API documentation
  edit(edit: Edit): void;
  // Usage note: Applies an edit (ranges and offsets) so that a subsequent `parse` call with this
  //             tree as `oldTree` can perform incremental parsing.

  // Method: Tree.getChangedRanges
  // Source: web-tree-sitter TypeScript API documentation
  getChangedRanges(other: Tree): Range[];
  // Usage note: Computes the ranges that differ between two trees; can be used to scope
  //             re-layout or re-rendering in the preview.
}

// Node navigation API (subset relevant to extractor)
// Source: web-tree-sitter TypeScript API documentation
class Node {
  get type(): string;
  // Usage note: Returns the node type string (for example "call_expression"); must exactly match
  //             names from `node-types.json`.

  get children(): (Node | null)[];
  // Usage note: Provides all child nodes including anonymous ones; order reflects source order.

  childForFieldName(fieldName: string): Node | null;
  // Usage note: Returns the child corresponding to a named field (for example "body" or
  //             "arguments") when the grammar defines such fields.

  descendantsOfType(types: string | string[]): (Node | null)[];
  // Usage note: Convenience for finding all descendants matching one or more node-type names.
}
```

Extractor implication: Stage 2 should use `node.type` plus `children` and `childForFieldName` for walking the tree according to the Layer 1 grammar reference, reserving `descendantsOfType` for one-off analyses (for example finding all `call_expression` nodes inside a view body) rather than as the primary traversal mechanism.[^3]

***

## Query API

```typescript
// Query construction and matching
// Source: web-tree-sitter TypeScript API documentation
class Query {
  // Method: constructor
  constructor(language: Language, source: string);
  // Usage note: Compiles an S-expression query string against a specific `Language`.

  // Method: matches
  matches(node: Node, options?: QueryOptions): QueryMatch[];
  // Usage note: Returns all pattern matches within a node, with captures grouped by pattern.

  // Method: captures
  captures(node: Node, options?: QueryOptions): QueryCapture[];
  // Usage note: Returns a flat list of captures (name + node) for simpler consumption.
}
```

Extractor implication: Queries can provide a declarative alternative to manual traversal for some tasks (for example detecting certain SwiftUI patterns), but given the tight coupling to `node-types.json` already documented in Layer 1, the initial extractor can rely on direct traversal and adopt queries only where they meaningfully simplify pattern matching.[^3]

***

## Tree Cursor API

```typescript
// TreeCursor navigation
// Source: web-tree-sitter TypeScript API documentation
class TreeCursor {
  // Method: currentNode
  get currentNode(): Node;
  // Usage note: Represents the node at the cursor’s current position.

  // Method: gotoFirstChild
  gotoFirstChild(): boolean;
  // Usage note: Moves to the first child of the current node; returns false if there is none.

  // Method: gotoNextSibling
  gotoNextSibling(): boolean;
  // Usage note: Moves to the next sibling of the current node; returns false at the end.

  // Method: gotoParent
  gotoParent(): boolean;
  // Usage note: Moves to the parent node; returns false if already at the root.
}
```

Extractor implication: For very large Swift files, using `TreeCursor` instead of `children` arrays can reduce allocations and improve performance. The SwiftUI Preview extractor can start with simpler `Node`-based traversal and later swap to cursors in hot paths (for example, walking top-level declarations).

***

## Core Types and Callbacks

```typescript
// Core structural types
// Source: web-tree-sitter TypeScript API documentation
interface Point {
  row: number;
  column: number;
}

interface Range {
  startPosition: Point;
  endPosition: Point;
  startIndex: number;
  endIndex: number;
}

interface Edit {
  startPosition: Point;
  oldEndPosition: Point;
  newEndPosition: Point;
  startIndex: number;
  oldEndIndex: number;
  newEndIndex: number;
}

interface ParseState {
  currentOffset: number;
  hasError: boolean;
}

type ParseCallback = (index: number, position: Point) => string | undefined;

type ProgressCallback = (progress: ParseState) => boolean;

type LogCallback = (message: string, isLex: boolean) => void;

const LANGUAGE_VERSION: number;
const MIN_COMPATIBLE_VERSION: number;
```

Extractor / extension implication: These types underpin incremental parsing (`Edit` and `Range`), streaming parsing (`ParseCallback`), and diagnostics (`LogCallback`). For the SwiftUI Preview extension, the most important immediate pieces are `Point`, `Range`, and `Edit` for mapping between VS Code document positions and Tree-sitter node positions.[^3]

***

## Version and Gotchas Notes

- The documented API is for a recent `web-tree-sitter` version (0.25.x at the Tessl mirror). Earlier versions used slightly different parse signatures and may lack some helpers like `descendantsOfType`.[^4][^3]
- The official npm docs for `@dqbd/web-tree-sitter` show the same initialization pattern (`await Parser.init(); const Lang = await Parser.Language.load('...'); parser.setLanguage(Lang);`) indicating that the static `init` and `Language.load` sequence is stable across maintained versions.[^1]
- Tree-sitter’s core library enforces ABI version compatibility between languages and runtimes; languages compiled with incompatible ABI versions will cause failures when loading or setting languages. The `abiVersion`, `LANGUAGE_VERSION`, and `MIN_COMPATIBLE_VERSION` constants exist to help detect and guard against such mismatches.[^3]

RESEARCH GAP: Precise list of breaking API changes across `web-tree-sitter` minor versions (for example from 0.20.x to 0.25.x).  
Suggested resolution: Compare the `tree-sitter.d.ts` or TypeScript API docs for the specific version used in the SwiftUI Preview project with the 0.25.x documentation cited here, and note any differences (especially in `parse` arguments and callback types).  
Reason this is uncertain: Public docs and mirrors focus on the latest version; historical signatures are not fully documented in one place.

---

## References

1. [@dqbd/web-tree-sitter](https://www.npmjs.com/package/@dqbd/web-tree-sitter) - Tree-sitter bindings for the web and edge runtime. Latest version: 0.20.8, last published: 2 years a...

2. [web-tree-sitter](http://www.npmjs.com/package/web-tree-sitter) - Tree-sitter bindings for the web. Latest version: 0.26.6, last published: 2 days ago. Start using we...

3. [Tessl Tile for npm/web-tree-sitter@0.25.0](https://tessl.io/registry/tessl/npm-web-tree-sitter/0.25.0) - Tree-sitter bindings for the web providing WebAssembly-based incremental parsing of source code

4. [dqbd/web-tree-sitter - A CDN for npm and GitHub](https://www.jsdelivr.com/package/npm/@dqbd/web-tree-sitter) - A free, fast, and reliable CDN for @dqbd/web-tree-sitter. Tree-sitter bindings for the web and edge ...

