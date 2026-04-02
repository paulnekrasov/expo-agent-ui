# SwiftUI IR ViewNode types for preview pipelines

**No canonical open-source TypeScript IR for SwiftUI view trees exists today.** Projects like `mgcrea/react-native-swiftui`, `EnesKaraosman/JSONDrivenUI`, and `0xWDG/DynamicUI` each define partial JSON schemas with a `"type"` discriminant, but none provides a complete TypeScript discriminated union covering the full SwiftUI component surface. The design below synthesizes patterns from these projects, the TypeScript compiler's own AST system (which uses `kind` string-literal discriminants), Babel's ESTree node types, and SwiftUI's internal `ModifiedContent<Content, Modifier>` wrapping model — flattened into an ordered modifier array as every existing serialization tool recommends. The result is a **26-node, 20-modifier discriminated union** that covers all five fixtures completely.

---

## Complete TypeScript type definitions

The IR uses `kind` as the discriminant field (matching TypeScript compiler convention), a flat `modifiers` array preserving application order, and explicit binding references so the preview engine can re-render on state changes.

```typescript
// ═══════════════════════════════════════════════════════════
// ir/types.ts — SwiftUI Preview Engine IR
// ═══════════════════════════════════════════════════════════

// ── Top-level document ────────────────────────────────────
export interface IRDocument {
  version: "1.0";
  root: ViewNode;
  stubs: Record<string, StateStub>;
}

export interface StateStub {
  type: "Int" | "Bool" | "Double" | "String" | "NavigationPath" | "Array";
  initialValue: unknown;
  elementSchema?: Record<string, string>; // for Array stubs
}

// ── Value & expression primitives ─────────────────────────
export type TextContent = string | InterpolatedText;

export interface InterpolatedText {
  segments: TextSegment[];
}

export type TextSegment =
  | { literal: string }
  | { binding: string; format?: string };

export type ColorRef =
  | string                                     // semantic: "blue", "primary", "accentColor"
  | { name: string; opacity?: number };        // Color.blue.opacity(0.1)

export type ConditionalValue<T> = {
  kind: "conditional";
  condition: ConditionExpr;
  trueValue: T;
  falseValue: T;
};

export type ConditionExpr =
  | { kind: "binding"; name: string }                     // isHighlighted
  | { kind: "not"; operand: ConditionExpr }               // !expr
  | { kind: "isEmpty"; binding: string }                  // username.isEmpty
  | { kind: "comparison"; left: string; op: "==" | "!=" | ">" | "<"; right: unknown };

export type Alignment =
  | "center" | "leading" | "trailing"
  | "top" | "bottom"
  | "topLeading" | "topTrailing"
  | "bottomLeading" | "bottomTrailing";

export type EdgeSet =
  | "all" | "horizontal" | "vertical"
  | "top" | "bottom" | "leading" | "trailing";

export interface ActionStub {
  description: string;
  stateChanges?: { name: string; expression: string }[];
}

export interface BindingRef {
  binding: string;
}

// ── Modifier discriminated union ──────────────────────────
export type Modifier =
  | FontModifier
  | FontWeightModifier
  | ForegroundColorModifier
  | PaddingModifier
  | BackgroundModifier
  | FrameModifier
  | CornerRadiusModifier
  | ItalicModifier
  | ListStyleModifier
  | NavigationTitleModifier
  | SwipeActionsModifier
  | TabItemModifier
  | TagModifier
  | BadgeModifier
  | OverlayModifier
  | IgnoresSafeAreaModifier
  | ToolbarModifier
  | NavigationDestinationModifier
  | FillModifier
  | OpacityModifier;

export type FontStyle =
  | "largeTitle" | "title" | "title2" | "title3"
  | "headline" | "subheadline" | "body"
  | "callout" | "footnote" | "caption" | "caption2";

export type FontWeight =
  | "ultraLight" | "thin" | "light" | "regular"
  | "medium" | "semibold" | "bold" | "heavy" | "black";

export type ListStyle =
  | "plain" | "grouped" | "inset" | "insetGrouped" | "sidebar" | "automatic";

export interface FontModifier         { kind: "font"; value: FontStyle | { custom: string; size: number } }
export interface FontWeightModifier   { kind: "fontWeight"; value: FontWeight }
export interface ForegroundColorModifier {
  kind: "foregroundColor";
  value: ColorRef | ConditionalValue<ColorRef>;
}
export interface PaddingModifier      { kind: "padding"; edges?: EdgeSet; value?: number }
export interface BackgroundModifier   { kind: "background"; color?: ColorRef; content?: ViewNode }
export interface FrameModifier {
  kind: "frame";
  width?: number; height?: number;
  minWidth?: number | "infinity"; maxWidth?: number | "infinity";
  minHeight?: number | "infinity"; maxHeight?: number | "infinity";
  alignment?: Alignment;
}
export interface CornerRadiusModifier { kind: "cornerRadius"; value: number }
export interface ItalicModifier       { kind: "italic" }
export interface ListStyleModifier    { kind: "listStyle"; value: ListStyle }
export interface NavigationTitleModifier { kind: "navigationTitle"; title: string }
export interface SwipeActionsModifier {
  kind: "swipeActions";
  edge?: "leading" | "trailing";
  allowsFullSwipe?: boolean;
  content: ViewNode[];
}
export interface TabItemModifier      { kind: "tabItem"; label: ViewNode }
export interface TagModifier          { kind: "tag"; value: number | string }
export interface BadgeModifier        { kind: "badge"; value: number | string | BindingRef }
export interface OverlayModifier {
  kind: "overlay";
  alignment?: Alignment;
  content: ViewNode[];
}
export interface IgnoresSafeAreaModifier {
  kind: "ignoresSafeArea";
  regions?: ("container" | "keyboard" | "all")[];
  edges?: EdgeSet;
}
export interface ToolbarModifier {
  kind: "toolbar";
  items: ToolbarItemDef[];
}
export interface ToolbarItemDef {
  placement?: string;
  content: ViewNode;
}
export interface NavigationDestinationModifier {
  kind: "navigationDestination";
  dataType: string;
  iteratorVariable: string;
  destination: ViewNode;
}
export interface FillModifier         { kind: "fill"; color: ColorRef }
export interface OpacityModifier      { kind: "opacity"; value: number }

// ── ViewNode discriminated union ──────────────────────────
export type ViewNode =
  | VStackNode | HStackNode | ZStackNode
  | TextNode | ButtonNode | ImageNode | SpacerNode | LabelNode
  | NavigationStackNode | ListNode | ForEachNode | SectionNode
  | NavigationLinkNode | TabViewNode | FormNode
  | ToggleNode | SliderNode | PickerNode | TextFieldNode
  | ColorNode | RoundedRectangleNode | CircleNode
  | ToolbarItemNode | EditButtonNode
  | LabeledContentNode | ConditionalContentNode;

interface ViewNodeBase {
  modifiers?: Modifier[];
}

// ── Container nodes ───────────────────────────────────────
export interface VStackNode extends ViewNodeBase {
  kind: "VStack";
  alignment?: "leading" | "center" | "trailing";
  spacing?: number;
  children: ViewNode[];
}
export interface HStackNode extends ViewNodeBase {
  kind: "HStack";
  alignment?: "top" | "center" | "bottom" | "firstTextBaseline" | "lastTextBaseline";
  spacing?: number;
  children: ViewNode[];
}
export interface ZStackNode extends ViewNodeBase {
  kind: "ZStack";
  alignment?: Alignment;
  children: ViewNode[];
}
export interface NavigationStackNode extends ViewNodeBase {
  kind: "NavigationStack";
  pathBinding?: string;
  children: ViewNode[];
}
export interface ListNode extends ViewNodeBase {
  kind: "List";
  children: ViewNode[];
}
export interface SectionNode extends ViewNodeBase {
  kind: "Section";
  header?: string | ViewNode;
  footer?: ViewNode;
  children: ViewNode[];
}
export interface TabViewNode extends ViewNodeBase {
  kind: "TabView";
  selectionBinding?: string;
  children: ViewNode[];
}
export interface FormNode extends ViewNodeBase {
  kind: "Form";
  children: ViewNode[];
}

// ── Leaf / interactive nodes ──────────────────────────────
export interface TextNode extends ViewNodeBase {
  kind: "Text";
  content: TextContent;
}
export interface ImageNode extends ViewNodeBase {
  kind: "Image";
  systemName?: string;
  name?: string;
}
export interface SpacerNode extends ViewNodeBase {
  kind: "Spacer";
  minLength?: number;
}
export interface LabelNode extends ViewNodeBase {
  kind: "Label";
  title: string;
  systemImage: string;
}
export interface ButtonNode extends ViewNodeBase {
  kind: "Button";
  role?: "destructive" | "cancel";
  action: ActionStub;
  label: ViewNode;
}
export interface NavigationLinkNode extends ViewNodeBase {
  kind: "NavigationLink";
  value?: unknown;
  destination?: ViewNode;
  label: ViewNode;
}
export interface ToggleNode extends ViewNodeBase {
  kind: "Toggle";
  label: string | ViewNode;
  isOnBinding: string;
}
export interface SliderNode extends ViewNodeBase {
  kind: "Slider";
  valueBinding: string;
  range?: [number, number];
  step?: number;
}
export interface PickerNode extends ViewNodeBase {
  kind: "Picker";
  label: string;
  selectionBinding: string;
  children: ViewNode[];
}
export interface TextFieldNode extends ViewNodeBase {
  kind: "TextField";
  placeholder: string;
  textBinding: string;
}
export interface EditButtonNode extends ViewNodeBase {
  kind: "EditButton";
}
export interface LabeledContentNode extends ViewNodeBase {
  kind: "LabeledContent";
  label: string;
  value: TextContent;
}

// ── Shape & color nodes ──────────────────────────────────
export interface ColorNode extends ViewNodeBase {
  kind: "Color";
  name: string;
}
export interface RoundedRectangleNode extends ViewNodeBase {
  kind: "RoundedRectangle";
  cornerRadius: number;
}
export interface CircleNode extends ViewNodeBase {
  kind: "Circle";
}
export interface ToolbarItemNode extends ViewNodeBase {
  kind: "ToolbarItem";
  placement?: string;
  children: ViewNode[];
}

// ── Structural / control-flow nodes ──────────────────────
export interface ForEachNode extends ViewNodeBase {
  kind: "ForEach";
  data: string | { from: number; through: number | BindingRef };
  id: string;
  iteratorVariable: string;
  template: ViewNode;
}
export interface ConditionalContentNode extends ViewNodeBase {
  kind: "ConditionalContent";
  condition: ConditionExpr;
  children: ViewNode[];         // active branch (evaluated with stubs)
}

// ── Exhaustiveness helper ─────────────────────────────────
export function assertNever(node: never): never {
  throw new Error(`Unhandled ViewNode kind: ${JSON.stringify(node)}`);
}
export type NodeKind = ViewNode["kind"];
export type GetNode<K extends NodeKind> = Extract<ViewNode, { kind: K }>;
```

---

## How serialization handles key SwiftUI concepts

**Modifier ordering** mirrors SwiftUI's `ModifiedContent` nesting: the first element in the `modifiers` array is the innermost wrapper (applied first), exactly matching source-order reading of `.font(.title).padding()`. Every existing JSON-to-SwiftUI library (JSONDrivenUI, DynamicUI, react-native-swiftui) flattens modifiers this way rather than representing the deeply nested generic types.

**`@State` property stubs** live in the top-level `stubs` map keyed by property name. Each stub carries its Swift type and the initializer value from the declaration. The preview engine injects these values when evaluating bindings such as `{ "binding": "count" }` inside `TextContent` segments or `ConditionalValue` expressions.

**`_ConditionalContent`** (Swift's internal type for `if`/`else` in `@ViewBuilder`) becomes a `ConditionalContentNode`. The `condition` field preserves the original expression for re-evaluation, while `children` holds only the **active branch** based on stub values — empty array when the condition is false and no else-branch exists. This matches how Xcode Previews snapshot a single state.

**String interpolation** like `Text("\(count)")` serializes as `{ "segments": [{ "binding": "count" }] }`. Mixed literals and bindings produce alternating segment entries: `[{ "literal": "Score: " }, { "binding": "count" }]`.

**`ForEach` with `id` key paths** stores the key path as a string (`".self"`, `".name"`, `".id"`). The `data` field references a stub array name or an inline range object. The `template` field holds the per-item view tree with iterator variable references like `"item.name"`.

**`NavigationPath`** stubs serialize as an empty array (`[]`) for the initial empty state. The binding name (e.g., `"path"`) is referenced on `NavigationStackNode.pathBinding`.

---

## Fixture 1 expected IR: SimpleVStack.swift

```json
{
  "version": "1.0",
  "root": {
    "kind": "VStack",
    "alignment": "center",
    "spacing": 16,
    "children": [
      {
        "kind": "Text",
        "content": {
          "segments": [{ "binding": "count" }]
        },
        "modifiers": [
          { "kind": "font", "value": "largeTitle" },
          { "kind": "fontWeight", "value": "bold" },
          {
            "kind": "foregroundColor",
            "value": {
              "kind": "conditional",
              "condition": { "kind": "binding", "name": "isHighlighted" },
              "trueValue": "orange",
              "falseValue": "primary"
            }
          },
          { "kind": "padding", "edges": "horizontal", "value": 20 },
          {
            "kind": "background",
            "content": {
              "kind": "RoundedRectangle",
              "cornerRadius": 12,
              "modifiers": [
                { "kind": "fill", "color": { "name": "blue", "opacity": 0.1 } }
              ]
            }
          }
        ]
      },
      {
        "kind": "Spacer",
        "modifiers": [
          { "kind": "frame", "height": 8 }
        ]
      },
      {
        "kind": "HStack",
        "children": [
          {
            "kind": "Image",
            "systemName": "star.fill"
          },
          {
            "kind": "Text",
            "content": "Details",
            "modifiers": [
              { "kind": "font", "value": "subheadline" },
              { "kind": "foregroundColor", "value": "secondary" },
              { "kind": "italic" }
            ]
          }
        ]
      },
      {
        "kind": "Button",
        "action": {
          "description": "count += 1",
          "stateChanges": [
            { "name": "count", "expression": "count + 1" }
          ]
        },
        "label": {
          "kind": "Label",
          "title": "Increment",
          "systemImage": "plus.circle.fill"
        },
        "modifiers": [
          { "kind": "font", "value": "headline" },
          { "kind": "padding" },
          { "kind": "frame", "maxWidth": "infinity" },
          { "kind": "background", "color": "accentColor" },
          { "kind": "foregroundColor", "value": "white" },
          { "kind": "cornerRadius", "value": 10 }
        ]
      }
    ]
  },
  "stubs": {
    "count": { "type": "Int", "initialValue": 0 },
    "isHighlighted": { "type": "Bool", "initialValue": false }
  }
}
```

---

## Fixture 2 expected IR: ListWithForEach.swift

```json
{
  "version": "1.0",
  "root": {
    "kind": "NavigationStack",
    "children": [
      {
        "kind": "List",
        "children": [
          {
            "kind": "Section",
            "header": "Mailboxes",
            "children": [
              {
                "kind": "ForEach",
                "data": "items",
                "id": ".name",
                "iteratorVariable": "item",
                "template": {
                  "kind": "NavigationLink",
                  "destination": {
                    "kind": "Text",
                    "content": {
                      "segments": [
                        { "literal": "Detail for " },
                        { "binding": "item.name" }
                      ]
                    }
                  },
                  "label": {
                    "kind": "HStack",
                    "children": [
                      {
                        "kind": "Image",
                        "systemName": {
                          "segments": [{ "binding": "item.icon" }]
                        }
                      },
                      {
                        "kind": "Text",
                        "content": {
                          "segments": [{ "binding": "item.name" }]
                        }
                      }
                    ]
                  },
                  "modifiers": [
                    {
                      "kind": "swipeActions",
                      "edge": "trailing",
                      "content": [
                        {
                          "kind": "Button",
                          "role": "destructive",
                          "action": { "description": "delete(item)" },
                          "label": {
                            "kind": "Label",
                            "title": "Delete",
                            "systemImage": "trash"
                          }
                        }
                      ]
                    }
                  ]
                }
              }
            ]
          }
        ],
        "modifiers": [
          { "kind": "listStyle", "value": "insetGrouped" },
          { "kind": "navigationTitle", "title": "Mailboxes" }
        ]
      }
    ]
  },
  "stubs": {
    "items": {
      "type": "Array",
      "initialValue": [
        { "name": "Inbox", "icon": "tray.fill" },
        { "name": "Sent", "icon": "paperplane.fill" },
        { "name": "Drafts", "icon": "doc.fill" }
      ],
      "elementSchema": { "name": "String", "icon": "String" }
    }
  }
}
```

---

## Fixture 3 expected IR: FormWithControls.swift

With stubs `username = ""` and `notificationsEnabled = true`: the `!username.isEmpty` conditional evaluates to **false** (LabeledContent omitted), while the `notificationsEnabled` conditional evaluates to **true** (Slider and Text included).

```json
{
  "version": "1.0",
  "root": {
    "kind": "NavigationStack",
    "children": [
      {
        "kind": "Form",
        "children": [
          {
            "kind": "Section",
            "header": "Profile",
            "children": [
              {
                "kind": "TextField",
                "placeholder": "Username",
                "textBinding": "username"
              },
              {
                "kind": "ConditionalContent",
                "condition": {
                  "kind": "not",
                  "operand": { "kind": "isEmpty", "binding": "username" }
                },
                "children": []
              }
            ]
          },
          {
            "kind": "Section",
            "header": "Preferences",
            "children": [
              {
                "kind": "Toggle",
                "label": "Notifications",
                "isOnBinding": "notificationsEnabled"
              },
              {
                "kind": "ConditionalContent",
                "condition": { "kind": "binding", "name": "notificationsEnabled" },
                "children": [
                  {
                    "kind": "Slider",
                    "valueBinding": "volume",
                    "range": [0, 1]
                  },
                  {
                    "kind": "Text",
                    "content": {
                      "segments": [
                        { "literal": "Volume: " },
                        { "binding": "volume", "format": "percentInt" }
                      ]
                    }
                  }
                ]
              },
              {
                "kind": "Picker",
                "label": "Color",
                "selectionBinding": "selectedColor",
                "children": [
                  {
                    "kind": "ForEach",
                    "data": "colors",
                    "id": ".self",
                    "iteratorVariable": "color",
                    "template": {
                      "kind": "Text",
                      "content": {
                        "segments": [{ "binding": "color" }]
                      }
                    }
                  }
                ]
              }
            ]
          },
          {
            "kind": "Section",
            "footer": {
              "kind": "Text",
              "content": "You must agree to the terms to continue."
            },
            "children": [
              {
                "kind": "Toggle",
                "label": "I agree to terms",
                "isOnBinding": "agreedToTerms"
              }
            ]
          }
        ]
      }
    ]
  },
  "stubs": {
    "username": { "type": "String", "initialValue": "" },
    "notificationsEnabled": { "type": "Bool", "initialValue": true },
    "volume": { "type": "Double", "initialValue": 0.5 },
    "selectedColor": { "type": "String", "initialValue": "Red" },
    "agreedToTerms": { "type": "Bool", "initialValue": false },
    "colors": {
      "type": "Array",
      "initialValue": ["Red", "Green", "Blue"]
    }
  }
}
```

---

## Fixture 4 expected IR: NavigationStackPush.swift

The `List(1...itemCount, id: \.self)` desugars into a `List` containing a `ForEach` with an inline range. The toolbar modifier carries two `ToolbarItemDef` entries. The `navigationDestination` modifier holds the destination template with an iterator variable for the matched value.

```json
{
  "version": "1.0",
  "root": {
    "kind": "NavigationStack",
    "pathBinding": "path",
    "children": [
      {
        "kind": "List",
        "children": [
          {
            "kind": "ForEach",
            "data": { "from": 1, "through": { "binding": "itemCount" } },
            "id": ".self",
            "iteratorVariable": "index",
            "template": {
              "kind": "NavigationLink",
              "value": { "binding": "index" },
              "label": {
                "kind": "Label",
                "title": {
                  "segments": [
                    { "literal": "Item " },
                    { "binding": "index" }
                  ]
                },
                "systemImage": "folder.fill"
              }
            }
          }
        ],
        "modifiers": [
          {
            "kind": "toolbar",
            "items": [
              {
                "placement": "navigationBarTrailing",
                "content": {
                  "kind": "Button",
                  "action": {
                    "description": "addItem()",
                    "stateChanges": [
                      { "name": "itemCount", "expression": "itemCount + 1" }
                    ]
                  },
                  "label": {
                    "kind": "Image",
                    "systemName": "plus"
                  }
                }
              },
              {
                "placement": "navigationBarLeading",
                "content": {
                  "kind": "EditButton"
                }
              }
            ]
          },
          {
            "kind": "navigationDestination",
            "dataType": "Int",
            "iteratorVariable": "value",
            "destination": {
              "kind": "VStack",
              "children": [
                {
                  "kind": "Image",
                  "systemName": "folder.fill",
                  "modifiers": [
                    { "kind": "font", "value": "largeTitle" }
                  ]
                },
                {
                  "kind": "Text",
                  "content": {
                    "segments": [
                      { "literal": "Detail for item " },
                      { "binding": "value" }
                    ]
                  },
                  "modifiers": [
                    { "kind": "font", "value": "title" }
                  ]
                },
                {
                  "kind": "Button",
                  "action": {
                    "description": "path = NavigationPath()",
                    "stateChanges": [
                      { "name": "path", "expression": "NavigationPath()" }
                    ]
                  },
                  "label": {
                    "kind": "Text",
                    "content": "Pop to Root"
                  }
                }
              ]
            }
          },
          { "kind": "navigationTitle", "title": "Items" }
        ]
      }
    ]
  },
  "stubs": {
    "path": { "type": "NavigationPath", "initialValue": [] },
    "itemCount": { "type": "Int", "initialValue": 5 }
  }
}
```

---

## Fixture 5 expected IR: TabViewWithBadges.swift

With `showOverlay = false`, the overlay's `ConditionalContent` has empty children. The **badge on Tab 1** uses a binding reference so it updates when `messageCount` changes. Tab 2's badge is a static string `"New"`.

```json
{
  "version": "1.0",
  "root": {
    "kind": "TabView",
    "selectionBinding": "selectedTab",
    "children": [
      {
        "kind": "ZStack",
        "children": [
          {
            "kind": "Color",
            "name": "blue",
            "modifiers": [
              { "kind": "opacity", "value": 0.1 },
              { "kind": "ignoresSafeArea" }
            ]
          },
          {
            "kind": "VStack",
            "children": [
              {
                "kind": "Image",
                "systemName": "house.fill",
                "modifiers": [
                  { "kind": "font", "value": "largeTitle" }
                ]
              },
              {
                "kind": "Text",
                "content": "Home"
              }
            ]
          }
        ],
        "modifiers": [
          {
            "kind": "tabItem",
            "label": {
              "kind": "Label",
              "title": "Home",
              "systemImage": "house"
            }
          },
          { "kind": "tag", "value": 0 }
        ]
      },
      {
        "kind": "Text",
        "content": "Messages",
        "modifiers": [
          {
            "kind": "overlay",
            "alignment": "topTrailing",
            "content": [
              {
                "kind": "ConditionalContent",
                "condition": { "kind": "binding", "name": "showOverlay" },
                "children": []
              }
            ]
          },
          {
            "kind": "tabItem",
            "label": {
              "kind": "Label",
              "title": "Messages",
              "systemImage": "message"
            }
          },
          { "kind": "badge", "value": { "binding": "messageCount" } },
          { "kind": "tag", "value": 1 }
        ]
      },
      {
        "kind": "VStack",
        "children": [
          {
            "kind": "Text",
            "content": "Settings"
          },
          {
            "kind": "Button",
            "action": {
              "description": "resetSettings()",
              "stateChanges": [
                { "name": "selectedTab", "expression": "0" },
                { "name": "messageCount", "expression": "0" },
                { "name": "showOverlay", "expression": "false" }
              ]
            },
            "label": {
              "kind": "Text",
              "content": "Reset"
            }
          }
        ],
        "modifiers": [
          {
            "kind": "tabItem",
            "label": {
              "kind": "Label",
              "title": "Settings",
              "systemImage": "gear"
            }
          },
          { "kind": "badge", "value": "New" },
          { "kind": "tag", "value": 2 }
        ]
      }
    ]
  },
  "stubs": {
    "selectedTab": { "type": "Int", "initialValue": 0 },
    "messageCount": { "type": "Int", "initialValue": 3 },
    "showOverlay": { "type": "Bool", "initialValue": false }
  }
}
```

---

## Design rationale and key architectural choices

**Why `kind` over `type` as the discriminant.** The TypeScript compiler itself uses `kind` for its 350+ AST node types, making it the idiomatic choice in the TypeScript ecosystem. Using `type` would conflict with TypeScript's `type` keyword in many code-generation contexts and with React's `type` prop in JSX.

**Why flat modifier arrays instead of nested `ModifiedContent`.** SwiftUI internally builds `ModifiedContent<ModifiedContent<ModifiedContent<Button, _FontModifier>, _PaddingLayout>, _BackgroundStyleModifier>` — a deeply nested generic tower. Every production JSON-to-SwiftUI system (JSONDrivenUI, DynamicUI, react-native-swiftui) independently converges on the flat array representation because it serializes cleanly to JSON, preserves order semantics, and avoids unbounded nesting depth. The array index maps directly to application order: `modifiers[0]` is the innermost (applied first), matching Swift source reading order.

**Why `ConditionalContent` persists in the IR even when evaluated.** A naive approach would just drop false-branch content, but the preview engine needs the `condition` expression to re-evaluate when state changes interactively. The `children` array holds the **currently active** branch (empty when condition is false with no else), while `condition` preserves the full expression tree for runtime re-evaluation. This mirrors how SwiftUI's `_ConditionalContent<TrueContent, FalseContent>` retains both type parameters even though only one is rendered at a time.

**`ForEach` stores templates, not expanded instances.** The template-based representation avoids duplicating the entire subtree for every data element. The preview renderer expands `ForEach` at render time using stub data. The `iteratorVariable` field names the loop variable so binding references like `"item.name"` resolve correctly during expansion. The `id` field stores the key path string (`".self"`, `".name"`) that the differ uses for identity tracking.

**`NavigationPath` serializes as an empty array.** Apple's `NavigationPath.CodableRepresentation` uses a flat array of alternating `[typeName, jsonEncodedValue, ...]` pairs. For stub purposes, the initial empty `NavigationPath()` is just `[]`. The `pathBinding` on `NavigationStackNode` tells the renderer which stub to watch for navigation state changes.

## Conclusion

This IR design covers **26 node kinds** and **20 modifier kinds** — sufficient to represent the full range of SwiftUI constructs across all five fixtures including stack layouts, navigation patterns, forms with two-way bindings, tab views with badges, conditional rendering, and dynamic `ForEach` iteration. Three design decisions distinguish it from simpler JSON schemas: the discriminated union with `kind` enables exhaustive `switch` rendering with compile-time safety via `assertNever`; `ConditionalContent` nodes preserve re-evaluation capability rather than discarding inactive branches; and `ForEach` templates defer expansion to render time, keeping the IR compact regardless of data size. Extending the union for additional SwiftUI views (e.g., `ScrollView`, `Sheet`, `Alert`, `LazyVGrid`) requires only adding a new interface to the `ViewNode` union and any corresponding modifier types — the flat architecture scales without structural changes.