// Type guards for every ViewNode variant.
// Use these instead of `node.kind === "..."` casts where you need narrowing.

import type {
  ViewNode, Modifier,
  VStackNode, HStackNode, ZStackNode,
  ScrollViewNode, GeometryReaderNode,
  NavigationStackNode, NavigationLinkNode, NavigationViewNode,
  ListNode, ForEachNode, LazyVStackNode, LazyHStackNode,
  LazyVGridNode, LazyHGridNode, SectionNode,
  FormNode, GroupNode,
  TextFieldNode, SecureFieldNode, ToggleNode, PickerNode,
  SliderNode, StepperNode, DatePickerNode,
  ButtonNode, MenuNode, ContextMenuNode,
  TextNode, ImageNode, AsyncImageNode,
  LabelNode, LinkNode, SpacerNode, DividerNode,
  RectangleNode, CircleNode, CapsuleNode,
  RoundedRectangleNode, EllipseNode, PathNode,
  TabViewNode, TabItemNode,
  SheetNode, AlertNode, ConfirmationDialogNode,
  ToolbarNode, ToolbarItemNode,
  ConditionalContentNode,
  CustomViewNode, UnknownNode,
} from "./types";

export const isVStack = (n: ViewNode): n is VStackNode => n.kind === "VStack";
export const isHStack = (n: ViewNode): n is HStackNode => n.kind === "HStack";
export const isZStack = (n: ViewNode): n is ZStackNode => n.kind === "ZStack";
export const isScrollView = (n: ViewNode): n is ScrollViewNode => n.kind === "ScrollView";
export const isGeometryReader = (n: ViewNode): n is GeometryReaderNode => n.kind === "GeometryReader";

export const isNavigationStack = (n: ViewNode): n is NavigationStackNode => n.kind === "NavigationStack";
export const isNavigationLink = (n: ViewNode): n is NavigationLinkNode => n.kind === "NavigationLink";
export const isNavigationView = (n: ViewNode): n is NavigationViewNode => n.kind === "NavigationView";

export const isList = (n: ViewNode): n is ListNode => n.kind === "List";
export const isForEach = (n: ViewNode): n is ForEachNode => n.kind === "ForEach";
export const isLazyVStack = (n: ViewNode): n is LazyVStackNode => n.kind === "LazyVStack";
export const isLazyHStack = (n: ViewNode): n is LazyHStackNode => n.kind === "LazyHStack";
export const isLazyVGrid = (n: ViewNode): n is LazyVGridNode => n.kind === "LazyVGrid";
export const isLazyHGrid = (n: ViewNode): n is LazyHGridNode => n.kind === "LazyHGrid";
export const isSection = (n: ViewNode): n is SectionNode => n.kind === "Section";

export const isForm = (n: ViewNode): n is FormNode => n.kind === "Form";
export const isGroup = (n: ViewNode): n is GroupNode => n.kind === "Group";
export const isTextField = (n: ViewNode): n is TextFieldNode => n.kind === "TextField";
export const isSecureField = (n: ViewNode): n is SecureFieldNode => n.kind === "SecureField";
export const isToggle = (n: ViewNode): n is ToggleNode => n.kind === "Toggle";
export const isPicker = (n: ViewNode): n is PickerNode => n.kind === "Picker";
export const isSlider = (n: ViewNode): n is SliderNode => n.kind === "Slider";
export const isStepper = (n: ViewNode): n is StepperNode => n.kind === "Stepper";
export const isDatePicker = (n: ViewNode): n is DatePickerNode => n.kind === "DatePicker";
export const isButton = (n: ViewNode): n is ButtonNode => n.kind === "Button";
export const isMenu = (n: ViewNode): n is MenuNode => n.kind === "Menu";
export const isContextMenu = (n: ViewNode): n is ContextMenuNode => n.kind === "ContextMenu";

export const isText = (n: ViewNode): n is TextNode => n.kind === "Text";
export const isImage = (n: ViewNode): n is ImageNode => n.kind === "Image";
export const isAsyncImage = (n: ViewNode): n is AsyncImageNode => n.kind === "AsyncImage";
export const isLabel = (n: ViewNode): n is LabelNode => n.kind === "Label";
export const isLink = (n: ViewNode): n is LinkNode => n.kind === "Link";
export const isSpacer = (n: ViewNode): n is SpacerNode => n.kind === "Spacer";
export const isDivider = (n: ViewNode): n is DividerNode => n.kind === "Divider";

export const isRectangle = (n: ViewNode): n is RectangleNode => n.kind === "Rectangle";
export const isCircle = (n: ViewNode): n is CircleNode => n.kind === "Circle";
export const isCapsule = (n: ViewNode): n is CapsuleNode => n.kind === "Capsule";
export const isRoundedRectangle = (n: ViewNode): n is RoundedRectangleNode => n.kind === "RoundedRectangle";
export const isEllipse = (n: ViewNode): n is EllipseNode => n.kind === "Ellipse";
export const isPath = (n: ViewNode): n is PathNode => n.kind === "Path";

export const isTabView = (n: ViewNode): n is TabViewNode => n.kind === "TabView";
export const isTabItem = (n: ViewNode): n is TabItemNode => n.kind === "TabItem";
export const isSheet = (n: ViewNode): n is SheetNode => n.kind === "Sheet";
export const isAlert = (n: ViewNode): n is AlertNode => n.kind === "Alert";
export const isConfirmationDialog = (n: ViewNode): n is ConfirmationDialogNode => n.kind === "ConfirmationDialog";
export const isToolbar = (n: ViewNode): n is ToolbarNode => n.kind === "Toolbar";
export const isToolbarItem = (n: ViewNode): n is ToolbarItemNode => n.kind === "ToolbarItem";
export const isConditionalContent = (n: ViewNode): n is ConditionalContentNode =>
  n.kind === "ConditionalContent";

export const isCustomView = (n: ViewNode): n is CustomViewNode => n.kind === "CustomViewNode";
export const isUnknown = (n: ViewNode): n is UnknownNode => n.kind === "UnknownNode";

// ─── Container helpers ───────────────────────────────────────────────────────
// Returns true for any node that has a `children` array.

export function isContainer(n: ViewNode): n is Extract<ViewNode, { children: ViewNode[] }> {
  return (
    isVStack(n) || isHStack(n) || isZStack(n) ||
    isLazyVStack(n) || isLazyHStack(n) ||
    isLazyVGrid(n) || isLazyHGrid(n) ||
    isList(n) || isSection(n) || isForm(n) || isGroup(n) ||
    isTabView(n) || isPicker(n) || isMenu(n) || isContextMenu(n) ||
    isConditionalContent(n)
  );
}

// Returns true for nodes with a single `child` (not `children`).
export function isSingleChildContainer(n: ViewNode): n is Extract<ViewNode, { child: ViewNode }> {
  return (
    isScrollView(n) || isGeometryReader(n) ||
    isNavigationStack(n) || isNavigationView(n)
  );
}

// ─── Modifier guards ─────────────────────────────────────────────────────────

export function isModifierKind<K extends Modifier["kind"]>(
  m: Modifier,
  kind: K
): m is Extract<Modifier, { kind: K }> {
  return m.kind === kind;
}
