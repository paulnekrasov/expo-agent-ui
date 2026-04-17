// Stage-agnostic IR — single source of truth.
// All stages communicate through these types. Never bypass them.
// Extend when new view types are needed. Never remove existing variants.

// ─── Size values ────────────────────────────────────────────────────────────

export type SizeValue =
  | { kind: "fixed"; value: number }
  | { kind: "infinity" }
  | { kind: "unspecified" };

export type ColorValue =
  | { kind: "system"; name: string }          // .blue, .red, .primary, etc.
  | { kind: "rgb"; r: number; g: number; b: number; a: number }
  | { kind: "unknown"; raw: string };

export type ShapeStyle =
  | { kind: "color"; color: ColorValue }
  | { kind: "material"; name: string }
  | { kind: "hierarchical"; level: number }
  | { kind: "unknown"; raw: string };

export type Alignment =
  | "center" | "leading" | "trailing"
  | "top" | "bottom"
  | "topLeading" | "topTrailing"
  | "bottomLeading" | "bottomTrailing";

export type TextAlignment = "leading" | "center" | "trailing";

export type EdgeSet =
  | { kind: "all" }
  | { kind: "horizontal" }
  | { kind: "vertical" }
  | { kind: "top" }
  | { kind: "bottom" }
  | { kind: "leading" }
  | { kind: "trailing" }
  | { kind: "specific"; top: number; leading: number; bottom: number; trailing: number };

export interface EdgeInsets {
  top: number;
  leading: number;
  bottom: number;
  trailing: number;
}

export type ConditionExpr =
  | { kind: "binding"; name: string }
  | { kind: "not"; operand: ConditionExpr }
  | { kind: "isEmpty"; binding: string }
  | {
      kind: "comparison";
      left: string;
      op: "==" | "!=" | ">" | "<";
      right: unknown;
    };

export type FontStyle =
  | "largeTitle" | "title" | "title2" | "title3"
  | "headline" | "body" | "callout" | "subheadline"
  | "footnote" | "caption" | "caption2";

export type FontWeight =
  | "ultraLight" | "thin" | "light" | "regular"
  | "medium" | "semibold" | "bold" | "heavy" | "black";

export type FontDesign = "default" | "serif" | "rounded" | "monospaced";

export type ListStyle =
  | "automatic"
  | "plain"
  | "grouped"
  | "insetGrouped"
  | "inset"
  | "sidebar";

export type AnimationType =
  | { kind: "easeIn"; duration?: number }
  | { kind: "easeOut"; duration?: number }
  | { kind: "easeInOut"; duration?: number }
  | { kind: "linear"; duration?: number }
  | { kind: "spring" }
  | { kind: "bouncy" }
  | { kind: "snappy" }
  | { kind: "interactiveSpring" }
  | { kind: "unknown"; raw: string };

export type TransitionType =
  | { kind: "opacity" }
  | { kind: "slide" }
  | { kind: "scale" }
  | { kind: "move"; edge: "leading" | "trailing" | "top" | "bottom" }
  | { kind: "push"; from: "leading" | "trailing" | "top" | "bottom" }
  | { kind: "asymmetric"; insertion: TransitionType; removal: TransitionType }
  | { kind: "unknown"; raw: string };

// ─── Modifier union ──────────────────────────────────────────────────────────
// Order is sacred — always store as an ordered array, never flatten.
// Modifier chains in the AST: outermost call = last modifier applied.
// Walk right-to-left, collect, then reverse before storing.

export type Modifier =
  // Layout
  | { kind: "frame"; width?: SizeValue; height?: SizeValue;
      minWidth?: SizeValue; maxWidth?: SizeValue;
      minHeight?: SizeValue; maxHeight?: SizeValue;
      alignment?: Alignment }
  | { kind: "padding"; edges: EdgeSet; amount: SizeValue }
  | { kind: "offset"; x: number; y: number }
  | { kind: "position"; x: number; y: number }
  | { kind: "fixedSize"; horizontal: boolean; vertical: boolean }
  | { kind: "layoutPriority"; value: number }
  // Appearance
  | { kind: "foregroundColor"; color: ColorValue }
  | { kind: "foregroundStyle"; style: ShapeStyle }
  | { kind: "background"; content: ViewNode | ColorValue }
  | { kind: "overlay"; content: ViewNode; alignment: Alignment }
  | { kind: "opacity"; value: number }
  | { kind: "cornerRadius"; radius: number }
  | { kind: "clipShape"; shape: string }
  | { kind: "shadow"; color: ColorValue; radius: number; x: number; y: number }
  | { kind: "border"; color: ColorValue; width: number }
  | { kind: "tint"; color: ColorValue }
  | { kind: "blur"; radius: number }
  | { kind: "brightness"; value: number }
  | { kind: "contrast"; value: number }
  | { kind: "saturation"; value: number }
  // Typography
  | { kind: "font"; style: FontStyle; custom?: string }
  | { kind: "fontWeight"; weight: FontWeight }
  | { kind: "fontDesign"; design: FontDesign }
  | { kind: "lineLimit"; value: number | null }
  | { kind: "multilineTextAlignment"; alignment: TextAlignment }
  | { kind: "lineSpacing"; value: number }
  | { kind: "tracking"; value: number }
  | { kind: "kerning"; value: number }
  | { kind: "textCase"; value: "uppercase" | "lowercase" }
  | { kind: "bold" }
  | { kind: "italic" }
  | { kind: "underline" }
  | { kind: "strikethrough" }
  // Interaction
  | { kind: "onTapGesture"; stub: true }
  | { kind: "onLongPressGesture"; stub: true }
  | { kind: "disabled"; value: boolean }
  | { kind: "allowsHitTesting"; value: boolean }
  | { kind: "contentShape"; shape: string }
  // Navigation and presentation
  | { kind: "navigationTitle"; title: string }
  | { kind: "navigationBarTitleDisplayMode"; mode: string }
  | { kind: "navigationBarHidden"; value: boolean }
  | { kind: "navigationDestination"; stub: true }
  | { kind: "toolbar"; items: ViewNode[] }
  | { kind: "toolbarBackground"; stub: true }
  | { kind: "sheet"; isPresented: string; content: ViewNode }
  | { kind: "fullScreenCover"; isPresented: string; content: ViewNode }
  | { kind: "alert"; title: string; stub: true }
  // List and form
  | { kind: "listStyle"; style: ListStyle }
  | { kind: "listRowInsets"; insets: EdgeInsets }
  | { kind: "listRowSeparator"; visibility: string }
  | { kind: "listRowBackground"; content: ViewNode }
  | { kind: "formStyle"; style: string }
  | { kind: "labelStyle"; style: string }
  // Animation
  | { kind: "animation"; type: AnimationType; stub: true }
  | { kind: "transition"; type: TransitionType; stub: true }
  | { kind: "scaleEffect"; x: number; y: number; anchor: Alignment }
  | { kind: "rotationEffect"; angle: number }
  // Environment
  | { kind: "environment"; stub: true }
  | { kind: "environmentObject"; stub: true }
  | { kind: "preferredColorScheme"; scheme: "light" | "dark" }
  // Fallback — never dropped, never thrown
  | { kind: "unknown"; name: string; rawArgs: string };

// ─── Base node ───────────────────────────────────────────────────────────────

export interface BaseNode {
  kind: string;
  modifiers: Modifier[];
  id: string;
  sourceRange?: { start: number; end: number };
}

// ─── ViewNode union ──────────────────────────────────────────────────────────

export type ViewNode =
  // Layout containers
  | VStackNode | HStackNode | ZStackNode
  | ScrollViewNode | GeometryReaderNode
  // Navigation
  | NavigationStackNode | NavigationLinkNode | NavigationViewNode
  // Lists and collections
  | ListNode | ForEachNode | LazyVStackNode | LazyHStackNode
  | LazyVGridNode | LazyHGridNode | SectionNode
  // Forms and controls
  | FormNode | GroupNode
  | TextFieldNode | SecureFieldNode
  | ToggleNode | PickerNode
  | SliderNode | StepperNode | DatePickerNode
  | ButtonNode | MenuNode | ContextMenuNode
  // Content
  | TextNode | ImageNode | AsyncImageNode
  | LabelNode | LinkNode
  | SpacerNode | DividerNode
  // Shapes
  | RectangleNode | CircleNode | CapsuleNode
  | RoundedRectangleNode | EllipseNode | PathNode
  // Special
  | TabViewNode | TabItemNode
  | SheetNode | AlertNode | ConfirmationDialogNode
  | ToolbarNode | ToolbarItemNode
  | ConditionalContentNode
  | CustomViewNode
  | UnknownNode; // ALWAYS the final fallback — never omit this

// ─── Layout containers ───────────────────────────────────────────────────────

export interface VStackNode extends BaseNode {
  kind: "VStack";
  alignment: Alignment;
  spacing: number | null;
  children: ViewNode[];
}

export interface HStackNode extends BaseNode {
  kind: "HStack";
  alignment: Alignment;
  spacing: number | null;
  children: ViewNode[];
}

export interface ZStackNode extends BaseNode {
  kind: "ZStack";
  alignment: Alignment;
  children: ViewNode[];
}

export interface ScrollViewNode extends BaseNode {
  kind: "ScrollView";
  axes: "vertical" | "horizontal" | "both";
  showsIndicators: boolean;
  child: ViewNode;
}

export interface GeometryReaderNode extends BaseNode {
  kind: "GeometryReader";
  child: ViewNode;
}

// ─── Navigation ──────────────────────────────────────────────────────────────

export interface NavigationStackNode extends BaseNode {
  kind: "NavigationStack";
  child: ViewNode;
}

export interface NavigationViewNode extends BaseNode {
  kind: "NavigationView"; // deprecated but common
  child: ViewNode;
}

export interface NavigationLinkNode extends BaseNode {
  kind: "NavigationLink";
  label: ViewNode;
  destination: ViewNode;
  value?: string; // value-based navigation
}

// ─── Lists and collections ───────────────────────────────────────────────────

export interface ListNode extends BaseNode {
  kind: "List";
  children: ViewNode[];
}

export interface ForEachNode extends BaseNode {
  kind: "ForEach";
  isStatic: boolean;         // true = static literal array, false = dynamic (stub: 3 rows)
  staticItems?: ViewNode[];  // populated when isStatic = true
  stubChild?: ViewNode;      // template for dynamic stub rows
}

export interface LazyVStackNode extends BaseNode {
  kind: "LazyVStack";
  alignment: Alignment;
  spacing: number | null;
  children: ViewNode[];
}

export interface LazyHStackNode extends BaseNode {
  kind: "LazyHStack";
  alignment: Alignment;
  spacing: number | null;
  children: ViewNode[];
}

export interface LazyVGridNode extends BaseNode {
  kind: "LazyVGrid";
  columns: GridColumn[];
  spacing: number | null;
  children: ViewNode[];
}

export interface LazyHGridNode extends BaseNode {
  kind: "LazyHGrid";
  rows: GridColumn[];
  spacing: number | null;
  children: ViewNode[];
}

export interface GridColumn {
  kind: "fixed" | "flexible" | "adaptive";
  size: number | null;
  minimum: number | null;
  maximum: number | null;
  spacing: number | null;
}

export interface SectionNode extends BaseNode {
  kind: "Section";
  header: ViewNode | null;
  footer: ViewNode | null;
  children: ViewNode[];
}

// ─── Forms and controls ──────────────────────────────────────────────────────

export interface FormNode extends BaseNode {
  kind: "Form";
  children: ViewNode[];
}

export interface GroupNode extends BaseNode {
  kind: "Group";
  children: ViewNode[];
}

export interface TextFieldNode extends BaseNode {
  kind: "TextField";
  label: string;
  placeholder: string;
  style: "roundedBorder" | "plain" | "squareBorder";
}

export interface SecureFieldNode extends BaseNode {
  kind: "SecureField";
  label: string;
  placeholder: string;
}

export interface ToggleNode extends BaseNode {
  kind: "Toggle";
  label: ViewNode;
  isOn: boolean; // STUB: false
}

export interface PickerNode extends BaseNode {
  kind: "Picker";
  label: string;
  style: "menu" | "wheel" | "inline" | "segmented" | "navigationLink";
  children: ViewNode[];
}

export interface SliderNode extends BaseNode {
  kind: "Slider";
  value: number; // STUB: midpoint of range
  minimum: number;
  maximum: number;
  step: number | null;
}

export interface StepperNode extends BaseNode {
  kind: "Stepper";
  label: ViewNode;
  value: number; // STUB: 0
}

export interface DatePickerNode extends BaseNode {
  kind: "DatePicker";
  label: string;
  displayedComponents: string[];
}

export interface ButtonNode extends BaseNode {
  kind: "Button";
  label: ViewNode;
  role: "cancel" | "destructive" | null;
}

export interface MenuNode extends BaseNode {
  kind: "Menu";
  label: ViewNode;
  children: ViewNode[];
}

export interface ContextMenuNode extends BaseNode {
  kind: "ContextMenu";
  child: ViewNode;
  menuItems: ViewNode[];
}

// ─── Content ─────────────────────────────────────────────────────────────────

export interface TextNode extends BaseNode {
  kind: "Text";
  content: string;
  isDynamic: boolean; // true = contains \() interpolation → STUB substitution
}

export interface ImageNode extends BaseNode {
  kind: "Image";
  source:
    | { kind: "systemName"; name: string }
    | { kind: "named"; name: string }
    | { kind: "unknown" };
  isResizable: boolean;
  contentMode: "fit" | "fill" | null;
}

export interface AsyncImageNode extends BaseNode {
  kind: "AsyncImage"; // STUB: gray box + photo symbol
  url: string;
}

export interface LabelNode extends BaseNode {
  kind: "Label";
  title: string;
  systemImage: string;
}

export interface LinkNode extends BaseNode {
  kind: "Link";
  label: ViewNode;
  destination: string;
}

export interface SpacerNode extends BaseNode {
  kind: "Spacer";
  minLength: number | null;
}

export interface DividerNode extends BaseNode {
  kind: "Divider";
}

// ─── Shapes ──────────────────────────────────────────────────────────────────

export interface RectangleNode extends BaseNode { kind: "Rectangle" }
export interface CircleNode extends BaseNode { kind: "Circle" }
export interface CapsuleNode extends BaseNode { kind: "Capsule" }
export interface EllipseNode extends BaseNode { kind: "Ellipse" }

export interface RoundedRectangleNode extends BaseNode {
  kind: "RoundedRectangle";
  cornerRadius: number;
  style: "circular" | "continuous";
}

export interface PathNode extends BaseNode {
  kind: "Path";
  stub: true; // STUB: gray box labeled "Path"
}

// ─── Special ─────────────────────────────────────────────────────────────────

export interface TabViewNode extends BaseNode {
  kind: "TabView";
  children: ViewNode[];
}

export interface TabItemNode extends BaseNode {
  kind: "TabItem";
  label: ViewNode;
  systemImage: string | null;
  child: ViewNode;
}

export interface SheetNode extends BaseNode {
  kind: "Sheet"; // STUB: not presented
  content: ViewNode;
}

export interface AlertNode extends BaseNode {
  kind: "Alert"; // STUB: ignored
  title: string;
}

export interface ConfirmationDialogNode extends BaseNode {
  kind: "ConfirmationDialog"; // STUB: ignored
  title: string;
}

export interface ToolbarNode extends BaseNode {
  kind: "Toolbar";
  items: ToolbarItemNode[];
}

export interface ToolbarItemNode extends BaseNode {
  kind: "ToolbarItem";
  placement: string;
  child: ViewNode;
}

export interface ConditionalContentNode extends BaseNode {
  kind: "ConditionalContent";
  condition: ConditionExpr;
  children: ViewNode[];
}

export interface CustomViewNode extends BaseNode {
  kind: "CustomViewNode";
  name: string;
  args: Record<string, unknown>;
}

export interface UnknownNode extends BaseNode {
  kind: "UnknownNode";
  rawType: string;
  rawSource: string;
}
