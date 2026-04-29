# Figma And Design-System Import Research

## Executive Summary
- Treat Figma import as a post-MVP accelerator for Agent UI primitives, not as a v0 design-to-code product.
- Use Figma REST file nodes for layout, layer names, component references, styles, bound variables, dev resources, and annotations; it exposes a document tree rooted at `DOCUMENT` and `CANVAS` pages. Source: https://developers.figma.com/docs/rest-api/files/ (accessed 2026-04-27).
- Use the Variables REST API for token synchronization only when the customer's plan, seat, permissions, and token scopes allow it; Figma documents Enterprise and scope requirements for variable read/write endpoints. Source: https://developers.figma.com/docs/rest-api/variables/ (accessed 2026-04-27).
- Use Code Connect to map Figma components to actual React or React Native components, then let Agent UI consume those mappings as hints for primitive/component selection. Source: https://developers.figma.com/docs/code-connect/ and https://developers.figma.com/docs/code-connect/react/ (accessed 2026-04-27).
- Use the Figma MCP server for agent-assisted design context retrieval when available, but do not make it mandatory: Figma documents remote server availability on all seats/plans, desktop server availability only for Dev or Full seats on paid plans, and write-to-canvas as remote-only beta/free-now usage-based-later behavior. Source: https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server (accessed 2026-04-29).
- Normalize imported tokens into an Agent UI design-token schema with primitive, semantic, component, and mode layers. Use the W3C Design Tokens Community Group 2025.10 format as the interchange model, not as the runtime API; the specification marks itself stable. Source: https://www.w3.org/community/reports/design-tokens/CG-FINAL-format-20251028/ (accessed 2026-04-29).
- Map Figma auto layout to `VStack` and `HStack` only when direction, spacing, padding, sizing, and child order are clear; otherwise import as a `SemanticView` or `ZStack` candidate needing review.
- Figma names, descriptions, component properties, variants, documentation links, MCP outputs, and Dev Resources can seed semantic IDs, labels, intents, and source links, but they must be treated as untrusted suggestions.
- Avoid pixel-perfect replay. Agent UI should preserve semantic structure and design-system intent, while letting Expo, React Native, and native platform components own final layout behavior.
- Remaining concerns are now explicit implementation gates: verify current Figma MCP access before building MCP-dependent commands, keep write-to-canvas out of the first importer, and treat Variables REST API support as Enterprise-gated unless the customer's plan proves otherwise.

## Relevant Figma Surfaces

| Surface / API | What it exposes | Authentication/setup | Agent UI use case | Caveats | Source URL |
|---|---|---|---|---|---|
| REST API file nodes | File document tree, node IDs, names, visibility, node types, children, styles, component property references, layout metadata, bound variables, and explicit variable modes. | Personal access token or OAuth with file access. | Build a read-only importer that turns selected frames into a candidate Agent UI screen tree and semantic metadata draft. | File JSON is design data, not production truth; generated mappings need review. | https://developers.figma.com/docs/rest-api/files/ |
| REST API property types | Typed structures for paints, layout constraints, grids, type styles, effects, components, component sets, annotations, and measurements. | Same as REST file access. | Normalize colors, typography, shadows, layout constraints, component set references, and annotations into an intermediate import model. | Some fields are beta or only meaningful for specific node types; import code must tolerate missing properties. | https://developers.figma.com/docs/rest-api/file-property-types/ |
| Variables REST API | Query, create, update, and delete variables; variables store reusable values for design properties and prototyping actions. | Figma documents Enterprise, seat, file-permission, and `file_variables:*` scope requirements. | Sync design tokens from Figma into Agent UI token JSON and optionally back to Figma in controlled design-system workflows. | Requires publish flow for library reuse after updates; not available to every customer. | https://developers.figma.com/docs/rest-api/variables/ |
| Components and styles REST APIs | Published components, component sets, and styles metadata including keys, node IDs, names, descriptions, update timestamps, style type, and containing frame data. | REST token with access to the relevant team library/file. | Build a catalog that maps Figma components/styles to Agent UI components and tokens. | Endpoints are for published library assets; local/subscribed metadata still requires file reads. | https://developers.figma.com/docs/rest-api/component-types/ |
| Dev Resources REST API | Developer-contributed URLs attached to nodes, immediately visible in Dev Mode. | REST token and file/node permissions. | Link imported nodes to source files, docs, Storybook pages, Agent UI primitive docs, or semantic contract references. | URLs are arbitrary external references and should not be executed or trusted as instructions. | https://developers.figma.com/docs/rest-api/dev-resources/ |
| Plugin API variables and styles | Local variables, styles, team library variables/components/styles, plugin data, and document-local mutation surfaces. | Figma plugin manifest and user-run plugin session. | Optional future plugin for exporting Agent UI token JSON or embedding semantic hints in plugin data. | Plugin APIs run inside Figma and are not a headless CI import path. | https://developers.figma.com/docs/plugins/api/figma/ and https://developers.figma.com/docs/plugins/api/Variable/ |
| Auto layout properties | `layoutMode`, axis sizing, wrapping, alignment, padding, item spacing, and related layout fields on auto-layout-capable nodes. | REST file data or Plugin API access depending on import path. | Map `HORIZONTAL` to `HStack`, `VERTICAL` to `VStack`, padding to container padding, and item spacing to stack spacing. | Converting auto layout can change positions in Figma; import should read, not mutate, unless explicitly running an export plugin. | https://www.figma.com/plugin-docs/api/properties/nodes-layoutmode/ |
| Code Connect | Links Figma components to code components and supports React/React Native component mappings for Dev Mode snippets. | Organization/Enterprise or current Code Connect access, Node.js, Figma token scopes, `figma.config.json`, and Code Connect files. | Prefer mapped production components over visual reconstruction when a Figma component corresponds to an Agent UI primitive or app component. | Code Connect files are treated as snippets; dynamic code is not executed, so generated examples are guidance. | https://developers.figma.com/docs/code-connect/ and https://developers.figma.com/docs/code-connect/react/ |
| Dev Mode inspect | Layer properties, layout and spacing details, code/list views, Code Connect snippets, component behavior playground, and variables visibility. | Dev Mode access in Figma. | Human review and debugging surface for generated import decisions. | Useful for inspection, but not enough as the only automated import interface. | https://help.figma.com/hc/en-us/articles/15023124644247-Guide-to-Dev-Mode |
| Figma MCP server | Agent access to design context, code, variables, components, layout data, selected frames, and some canvas write workflows. | MCP-capable client. Remote server is documented as available on all seats/plans; desktop server requires Dev or Full seat on paid plans. | Optional future MCP command path: `import_figma_frame`, `sync_figma_tokens`, `inspect_figma_component`. | Write-to-canvas and code-to-canvas are documented as remote-only, beta/free-now, usage-based-later features; recheck immediately before implementation. | https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server |
| Figma MCP skills | Official Figma-provided skills include `figma-use`, `figma-code-connect-components`, `figma-create-design-system-rules`, `figma-create-new-file`, and `figma-implement-design`. | MCP server plus client skill support. Some skills have seat/plan limits. | Pattern reference for an Agent UI skill that sequences Figma context retrieval, primitive mapping, and review steps. | Skills do not add server capabilities; they package workflow instructions. Figma documents `figma-use` as Full/Dev seats on paid plans, with Dev seats read-only outside drafts. | https://help.figma.com/hc/en-us/articles/39166810751895-Figma-skills-for-MCP |
| W3C Design Tokens format | Vendor-neutral JSON format for design decisions, token types, references, groups, and tool interoperability. | No Figma dependency; use as schema inspiration. | Define Agent UI's token interchange format for colors, dimensions, typography, shadows, radii, and modes. | Community Group final report and not a W3C Recommendation, but the 2025.10 format module states it is stable. | https://www.w3.org/community/reports/design-tokens/CG-FINAL-format-20251028/ |

## Token Extraction Strategy

Agent UI should import tokens into a normalized JSON document before generating code. The importer should preserve Figma source metadata, token aliases, modes, and confidence levels.

Recommended schema shape:

```ts
type AgentUIDesignTokens = {
  source: {
    kind: "figma";
    fileKey: string;
    nodeId?: string;
    importedAt: string;
  };
  modes: Record<string, { id: string; name: string }>;
  primitive: TokenGroup;
  semantic: TokenGroup;
  component: TokenGroup;
};

type Token = {
  value: unknown;
  type: "color" | "dimension" | "typography" | "shadow" | "radius" | "spacing" | "opacity";
  description?: string;
  modeValues?: Record<string, unknown>;
  source?: {
    figmaVariableId?: string;
    figmaStyleKey?: string;
    figmaNodeId?: string;
    url?: string;
  };
  confidence: "exact" | "derived" | "needs_review";
};
```

Extraction rules:

- Colors: Prefer bound Figma variables where present, then paint/color styles, then raw solid paint values. Preserve opacity and mode-specific values. Gradient, image, emoji, video, and pattern paints should become `needs_review` tokens or asset references, not flat colors. Sources: https://developers.figma.com/docs/rest-api/variables/ and https://developers.figma.com/docs/rest-api/file-property-types/ (accessed 2026-04-27).
- Typography: Prefer text styles as composite tokens and preserve variables applied to style properties. The Figma help docs distinguish variables as raw reusable values and styles as composite property groups, which maps cleanly to primitive variables and semantic text styles. Source: https://help.figma.com/hc/en-us/articles/15871097384471 (accessed 2026-04-27).
- Spacing: Extract auto-layout `itemSpacing`, padding fields, layout grids, and number variables. Map only repeated or named values to tokens; one-off pixel values should stay local unless they match an existing spacing scale. Sources: https://www.figma.com/plugin-docs/api/properties/nodes-layoutmode/ and https://help.figma.com/hc/en-us/articles/31351261703063-FD4B-Auto-layout-fundamentals (accessed 2026-04-27).
- Radii: Extract corner-radius-like node properties from file data where available and normalize repeated values into `radius.*` tokens. NEEDS_VERIFICATION: confirm the exact current REST field coverage for independent corner radii before implementation.
- Shadows/elevation: Extract effects and bound variables. Preserve platform differences because React Native shadow behavior differs across iOS and Android; do not promise exact Figma shadow reproduction in v0.
- Component variants: Prefer Code Connect component mappings and Figma component properties over visual heuristics. Component sets and property definitions should map to props such as `variant`, `size`, `state`, and `tone`. Sources: https://developers.figma.com/docs/rest-api/component-types/ and https://developers.figma.com/docs/code-connect/react/ (accessed 2026-04-27).

Token tiers:

- Primitive: raw palette, type scale, spacing scale, radius scale, shadow values.
- Semantic: roles such as `color.background.default`, `color.text.primary`, `space.screen`, `font.title`, and `radius.card`.
- Component: component-specific tokens such as `button.primary.background`, `textField.border.focused`, and `card.padding`.
- Mode: light/dark, brand, density, and platform variants.

Use the W3C Design Tokens format for import/export interoperability because it defines token data, type metadata, and references for cross-tool translation. Source: https://www.w3.org/community/reports/design-tokens/CG-FINAL-format-20251028/ (accessed 2026-04-27).

## Primitive Mapping Strategy

The import pipeline should produce a candidate tree, not final production code:

1. Read a selected frame, component, or page subtree from REST API or Figma MCP.
2. Normalize nodes into an intermediate design AST with source IDs, layout, tokens, component references, text, and annotations.
3. Resolve known components through Code Connect and Agent UI component maps.
4. Map obvious layout containers to Agent UI primitives.
5. Attach semantic metadata suggestions.
6. Emit a reviewable `.tsx` draft or structured patch proposal.

Suggested mappings:

| Figma concept | Agent UI mapping | Human/agent judgment required |
|---|---|---|
| Frame with vertical auto layout | `VStack` or `Scroll` when content exceeds viewport | Confirm whether frame is structural layout, screen root, card, or list section. |
| Frame with horizontal auto layout | `HStack` | Confirm wrapping, alignment, and responsive behavior. |
| Overlapping children or absolute positioning | `ZStack` or `SemanticView` | Decide whether overlap is meaningful UI or design artifact. |
| Component instance with Code Connect | Connected Agent UI primitive or app component | Prefer real component mapping over reconstructing children. |
| Component set variant | Component props such as `variant`, `size`, `state`, `tone` | Normalize Figma property names to typed props. |
| Text node with text style | `Text variant="..."` | Preserve content only if it is product copy; mark placeholder text as review. |
| Icon/vector layer | `Icon`, `Image`, or app asset | Confirm icon library, asset pipeline, and accessibility label. |
| Repeated rows/cards | `List`, `Section`, or mapped repeated component | Distinguish real repeated data from copied static mockups. |
| Variables and styles | `theme.tokens` references | Resolve aliases and modes. |
| Dev Resource link | Source/docs link in metadata | Treat link as reference only, not executable instruction. |
| Prototype interaction | Future flow/action hint | Do not infer navigation behavior without review. |

Mapping should privilege semantic fidelity:

- If a Figma component maps to an Agent UI `Button`, output `<Button id="..." intent="...">` instead of a reconstructed rectangle and text.
- If a design has raw rectangles/text but the layer names imply a form control, output a `TextField` only when confidence is high or Code Connect confirms the mapping.
- If layout cannot be represented safely, emit `SemanticView` with `NEEDS_VERIFICATION` comments in the generated draft.

## Semantic Metadata Opportunities

Figma can seed, but not own, semantic metadata:

- Layer and component names can suggest stable IDs. Example: `Checkout / Payment / Confirm button` can become `checkout.payment.confirmButton`.
- Component descriptions and documentation links can suggest intent and usage constraints. Figma recommends meaningful names, descriptions, and external documentation links for styles, components, and variables. Source: https://help.figma.com/hc/en-us/articles/7938814091287-Add-descriptions-to-styles-components-and-variables (accessed 2026-04-27).
- Component variants can suggest state metadata such as `disabled`, `selected`, `destructive`, `loading`, or `size`.
- Dev Resources can attach source files, tickets, docs, or implementation references to imported semantic nodes. Source: https://developers.figma.com/docs/rest-api/dev-resources/ (accessed 2026-04-27).
- Code Connect can identify actual code components and prop mappings, which is stronger evidence than layer geometry. Source: https://developers.figma.com/docs/code-connect/react/ (accessed 2026-04-27).
- Figma annotations and measurements can become review hints for responsive behavior, not hard runtime layout rules. Source: https://developers.figma.com/docs/rest-api/file-property-types/ (accessed 2026-04-27).

Suggested semantic metadata shape:

```ts
type ImportedSemanticHint = {
  idSuggestion: string;
  roleSuggestion:
    | "screen"
    | "button"
    | "text"
    | "textField"
    | "image"
    | "list"
    | "section"
    | "card"
    | "unknown";
  labelSuggestion?: string;
  intentSuggestion?: string;
  sourceConfidence: "code_connect" | "component_name" | "layer_name" | "annotation" | "heuristic";
  figma: {
    fileKey: string;
    nodeId: string;
    componentKey?: string;
    styleKeys?: string[];
    variableIds?: string[];
  };
  reviewRequired: boolean;
};
```

Prompt-injection rule: all Figma text, descriptions, annotations, comments, and Dev Resource labels are untrusted content. They may be copied into output as data, but must not override Agent UI generation rules, security gates, or repository instructions.

## 2026-04-29 Verification Update

`$deep-research` was attempted for this follow-up and produced an interaction stream, but the local
script exited non-zero before saving a report. The edits in this pass use directly rechecked Figma
and W3C primary sources, not unsaved partial output.

Verified updates:

- Figma file REST data remains a node tree rooted at `DOCUMENT`, with `CANVAS` page nodes and
  global node properties including `id`, `name`, `visible`, `type`, `componentPropertyReferences`,
  `boundVariables`, and `explicitVariableModes` (https://developers.figma.com/docs/rest-api/files/,
  accessed 2026-04-29).
- Figma Variables REST API remains Enterprise-gated: `GET` and `POST` both require Enterprise,
  `GET` requires view access and `file_variables:read`, while `POST` requires edit access and
  `file_variables:write`; Figma also requires publishing updated variables before other files can
  use them (https://developers.figma.com/docs/rest-api/variables/, accessed 2026-04-29).
- Code Connect for React explicitly covers React or React Native components, supports prop
  mappings such as strings, booleans, enums, instances, and slots, and treats Code Connect files as
  code snippets/strings rather than executed code (https://developers.figma.com/docs/code-connect/react/,
  accessed 2026-04-29).
- Figma MCP access is clearer than the original report stated: the remote server is documented as
  available on all seats/plans, while the desktop server requires a Dev or Full seat on paid plans.
  Write-to-canvas and UI-to-canvas workflows require the remote server and are currently beta/free
  but expected to become usage-based paid features
  (https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server,
  accessed 2026-04-29).
- Figma officially documents MCP skills and lists the relevant skill set. Skills package workflow
  instructions and do not replace MCP connectivity or add server capabilities
  (https://help.figma.com/hc/en-us/articles/39166810751895-Figma-skills-for-MCP,
  accessed 2026-04-29).
- The W3C Design Tokens Format Module 2025.10 marks itself stable, while still being a Community
  Group report rather than a W3C Recommendation
  (https://www.w3.org/community/reports/design-tokens/CG-FINAL-format-20251028/,
  accessed 2026-04-29).

Resolved concern:

- Figma MCP access and write capability boundaries are no longer vague: read/context workflows can
  target the remote server broadly, desktop server support is paid-seat-gated, and write workflows
  should be excluded from Agent UI's first importer because they are remote-only beta and future
  usage-priced.

Remaining implementation gates:

- Build the first importer as read-only REST/Code Connect/MCP context ingestion; do not write to
  Figma or source files automatically.
- Add an auth preflight that reports missing Enterprise Variables API access, missing token scopes,
  and insufficient file permissions before token sync.
- Treat Figma MCP as optional acceleration. The base CLI should work from REST file/node data and
  Code Connect metadata without requiring MCP.
- Preserve prompt-injection isolation for every Figma-provided string, including names,
  descriptions, annotations, comments, Dev Resources, and MCP-generated summaries.

## Risks And Anti-Goals

- Overfitting to Figma geometry: pixel coordinates and fixed frame sizes can produce brittle React Native screens. Prefer auto-layout intent, tokens, and component mappings.
- False semantic confidence: a layer named `Button` may be decorative, stale, or copied from another screen. Require stable IDs and review before agent-controllable actions.
- Prompt injection from design content: designers or imported files can include text that looks like instructions. Treat all Figma-provided strings as data.
- Design-system drift: generated code can diverge if Figma and code tokens are not synchronized through a single source of truth.
- Access fragmentation: Variables REST API, Code Connect, Dev Mode, MCP, and write capabilities have different plan, seat, token, and setup requirements. Source: https://developers.figma.com/docs/rest-api/variables/ and https://developers.figma.com/docs/code-connect/ (accessed 2026-04-27).
- Optional tooling lock-in: Agent UI must remain usable without Figma, without Code Connect, and without Figma MCP.
- Android/iOS mismatch: Figma visual properties do not automatically map to native platform behavior or React Native layout details.
- Scope creep: do not turn Agent UI into a general Figma-to-code converter, a visual diff platform, or a design-system governance product for v0.
- Security of Dev Resources: URLs attached to nodes can link anywhere; import them as references only.
- NEEDS_VERIFICATION: Figma MCP server write-to-canvas access, beta status, and future pricing should be rechecked immediately before implementation because Figma labels the area as actively evolving.

Anti-goals:

- No pixel-perfect Figma import as an MVP goal.
- No mandatory private Figma-file access for Agent UI adoption.
- No automatic production patching from a design file.
- No trusting Figma text, descriptions, or comments as agent instructions.
- No bypass of semantic IDs, accessibility metadata, or Agent UI runtime contracts.
- No separate design-system framework parallel to Agent UI primitives.

## Future Roadmap

Useful after component layer:

- Token importer CLI: `agent-ui figma tokens pull --file <key>`.
- Primitive mapping reference for frames, auto layout, text styles, and component variants.
- Optional `figma-to-agent-ui` draft generator that emits reviewable JSX only.
- Code Connect mapping guide for Agent UI primitives.

Useful after semantic runtime:

- Semantic hint importer that proposes `id`, `label`, `role`, `intent`, and `testID` metadata.
- Validation script that compares imported semantic IDs against mounted runtime nodes.
- Design-token mode support for light/dark/brand themes.

Useful after MCP tools:

- MCP tool: `import_figma_selection` for selected frame to Agent UI draft.
- MCP tool: `inspect_figma_design_system` for components, variables, styles, and Code Connect availability.
- MCP tool: `compare_semantic_tree_to_figma` as a structural review, not visual diff.
- Agent skill reference: "Implement this Figma frame with Agent UI primitives" using Figma MCP plus local Agent UI tools.

Avoid:

- Fully automatic app generation from arbitrary Figma files.
- Visual screenshot comparison as the primary acceptance gate.
- Importing every layer as a component.
- Runtime dependency on Figma APIs.
- Requiring Code Connect or Figma MCP for base package usage.
- Writing to Figma or source code without explicit user approval and reviewable patch plans.

## Source Index

| Title | URL | Access date | Supported claim |
|---|---|---|---|
| Figma files | https://developers.figma.com/docs/rest-api/files/ | 2026-04-27 | Figma files are node trees; nodes expose IDs, names, visibility, children, component property references, and variable mode mappings. |
| REST API property types | https://developers.figma.com/docs/rest-api/file-property-types/ | 2026-04-27 | Figma file data includes typed paint, layout, style, component, annotation, and measurement structures. |
| Variables REST API | https://developers.figma.com/docs/rest-api/variables/ | 2026-04-27 | Variables can be queried and mutated through REST with plan, seat, permission, and token-scope requirements. |
| Components and styles | https://developers.figma.com/docs/rest-api/component-types/ | 2026-04-27 | Published components, component sets, and styles expose metadata useful for component catalogs and token/style mapping. |
| Dev Resources REST API | https://developers.figma.com/docs/rest-api/dev-resources/ | 2026-04-27 | Dev Resources attach developer-contributed URLs to nodes and are visible in Dev Mode. |
| Plugin API `figma` object | https://developers.figma.com/docs/plugins/api/figma/ | 2026-04-27 | Plugins can access styles, components, variables, and team library APIs within Figma. |
| Plugin API `Variable` | https://developers.figma.com/docs/plugins/api/Variable/ | 2026-04-27 | Variables represent design tokens with mode-specific values and metadata in plugin contexts. |
| Plugin API `layoutMode` | https://www.figma.com/plugin-docs/api/properties/nodes-layoutmode/ | 2026-04-27 | Auto-layout direction controls which spacing, padding, sizing, and alignment properties apply. |
| Auto layout fundamentals | https://help.figma.com/hc/en-us/articles/31351261703063-FD4B-Auto-layout-fundamentals | 2026-04-27 | Auto layout organizes and spaces child layers responsively and includes padding between children and parent frames. |
| Difference between variables and styles | https://help.figma.com/hc/en-us/articles/15871097384471 | 2026-04-27 | Variables are raw reusable values; styles are composite property groups; variables support modes and aliasing. |
| Add descriptions to styles, components, and variables | https://help.figma.com/hc/en-us/articles/7938814091287-Add-descriptions-to-styles-components-and-variables | 2026-04-27 | Names, descriptions, and documentation links provide design-system guidance for collaborators and developers. |
| Code Connect introduction | https://developers.figma.com/docs/code-connect/ | 2026-04-27 | Code Connect bridges codebase components with Figma Dev Mode and can improve MCP-guided implementation. |
| Code Connect for React | https://developers.figma.com/docs/code-connect/react/ | 2026-04-27 | Code Connect supports React and React Native mappings and treats snippets as strings rather than executing them. |
| Code Connect quickstart | https://www.figma.com/code-connect-docs/quickstart-guide/ | 2026-04-27 | Code Connect setup needs Node.js, token scopes, and configuration; platform support includes web/React, iOS, and Jetpack Compose. |
| Guide to Dev Mode | https://help.figma.com/hc/en-us/articles/15023124644247-Guide-to-Dev-Mode | 2026-04-27 | Dev Mode exposes layout, spacing, layer properties, Code Connect snippets, and component behavior inspection. |
| Guide to the Dev Mode MCP Server | https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Dev-Mode-MCP-Server | 2026-04-27 | Figma MCP can provide design context, code, variables, components, layout data, and agent workflows; server access varies. |
| Get started with the Figma MCP server | https://help.figma.com/hc/en-us/articles/39216419318551-Get-started-with-the-Figma-MCP-server | 2026-04-27 | Figma MCP lets agents read design context and, in some workflows, create/update Figma designs using existing design systems. |
| Figma skills for MCP | https://help.figma.com/hc/en-us/articles/39166810751895 | 2026-04-27 | Figma provides reusable MCP skills for Figma workflows, including Code Connect and design-system rules. |
| Design Tokens Format Module 2025.10 | https://www.w3.org/community/reports/design-tokens/CG-FINAL-format-20251028/ | 2026-04-27 | W3C DTCG defines a vendor-neutral format for token data, types, references, and interoperability. |
| Design Tokens Color Module 2025.10 | https://www.w3.org/community/reports/design-tokens/CG-FINAL-color-20251028/ | 2026-04-27 | W3C DTCG color module defines color token representation and component-specific token considerations. |
| Design Tokens Resolver Module 2025.10 | https://www.w3.org/community/reports/design-tokens/CG-FINAL-resolver-20251028/ | 2026-04-27 | W3C DTCG resolver module covers resolving design tokens across contexts such as modes/themes. |

## Final Recommendation

Post-MVP Figma support should be a three-layer import system:

1. Token sync: read Figma variables/styles and normalize them into Agent UI design tokens with primitive, semantic, component, and mode tiers.
2. Component mapping: use Code Connect and an Agent UI component map to prefer real primitives/components over visual reconstruction.
3. Semantic draft generation: import selected frames as reviewable Agent UI JSX plus semantic hints, with confidence markers and `NEEDS_VERIFICATION` on uncertain mappings.

Do not ship Figma import before the component layer, semantic runtime, and local agent tools are stable. The first implementation should be a read-only CLI/MCP-assisted draft generator, not automatic source mutation. Figma MCP and Code Connect are valuable accelerators, but the core package must remain independent of Figma access and must treat all design-file content as untrusted data.

DONE_WITH_CONCERNS
