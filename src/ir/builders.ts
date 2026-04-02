// IR factory functions — use these instead of raw object literals
// to ensure every node always has the required BaseNode fields.

import type {
  ViewNode, Modifier,
  VStackNode, HStackNode, ZStackNode,
  TextNode, ButtonNode, ImageNode, AsyncImageNode, SpacerNode, DividerNode,
  ScrollViewNode, GeometryReaderNode,
  NavigationStackNode, NavigationViewNode, NavigationLinkNode,
  ListNode, ForEachNode, LazyVStackNode, LazyHStackNode,
  LazyVGridNode, LazyHGridNode, GridColumn, SectionNode,
  FormNode, GroupNode,
  TextFieldNode, SecureFieldNode, ToggleNode, PickerNode,
  SliderNode, StepperNode, DatePickerNode,
  MenuNode, ContextMenuNode,
  LabelNode, LinkNode,
  RectangleNode, CircleNode, CapsuleNode, RoundedRectangleNode, EllipseNode, PathNode,
  TabViewNode, TabItemNode,
  SheetNode, AlertNode, ConfirmationDialogNode,
  ToolbarNode, ToolbarItemNode,
  CustomViewNode, UnknownNode,
  Alignment,
} from "./types";

let _nextId = 0;
function nextId(): string {
  return `node_${(_nextId++).toString(36)}`;
}

export function resetIdCounter(): void {
  _nextId = 0;
}

function base(modifiers: Modifier[] = []): { modifiers: Modifier[]; id: string } {
  return { modifiers, id: nextId() };
}

export function makeVStack(
  alignment: Alignment = "center",
  spacing: number | null = null,
  children: ViewNode[] = [],
  modifiers: Modifier[] = []
): VStackNode {
  return { kind: "VStack", alignment, spacing, children, ...base(modifiers) };
}

export function makeHStack(
  alignment: Alignment = "center",
  spacing: number | null = null,
  children: ViewNode[] = [],
  modifiers: Modifier[] = []
): HStackNode {
  return { kind: "HStack", alignment, spacing, children, ...base(modifiers) };
}

export function makeZStack(
  alignment: Alignment = "center",
  children: ViewNode[] = [],
  modifiers: Modifier[] = []
): ZStackNode {
  return { kind: "ZStack", alignment, children, ...base(modifiers) };
}

export function makeText(
  content: string,
  isDynamic = false,
  modifiers: Modifier[] = []
): TextNode {
  return { kind: "Text", content, isDynamic, ...base(modifiers) };
}

export function makeButton(
  label: ViewNode,
  modifiers: Modifier[] = []
): ButtonNode {
  return { kind: "Button", label, role: null, ...base(modifiers) };
}

export function makeImage(
  source: ImageNode["source"],
  modifiers: Modifier[] = []
): ImageNode {
  return { kind: "Image", source, isResizable: false, contentMode: null, ...base(modifiers) };
}

export function makeSpacer(
  minLength: number | null = null,
  modifiers: Modifier[] = []
): SpacerNode {
  return { kind: "Spacer", minLength, ...base(modifiers) };
}

export function makeDivider(modifiers: Modifier[] = []): DividerNode {
  return { kind: "Divider", ...base(modifiers) };
}

export function makeScrollView(
  child: ViewNode,
  axes: ScrollViewNode["axes"] = "vertical",
  modifiers: Modifier[] = []
): ScrollViewNode {
  return { kind: "ScrollView", axes, showsIndicators: true, child, ...base(modifiers) };
}

export function makeNavigationStack(
  child: ViewNode,
  modifiers: Modifier[] = []
): NavigationStackNode {
  return { kind: "NavigationStack", child, ...base(modifiers) };
}

export function makeNavigationLink(
  label: ViewNode,
  destination: ViewNode,
  modifiers: Modifier[] = []
): NavigationLinkNode {
  return { kind: "NavigationLink", label, destination, ...base(modifiers) };
}

export function makeList(
  children: ViewNode[] = [],
  modifiers: Modifier[] = []
): ListNode {
  return { kind: "List", children, ...base(modifiers) };
}

export function makeForEach(
  isStatic: boolean,
  staticItems?: ViewNode[],
  stubChild?: ViewNode,
  modifiers: Modifier[] = []
): ForEachNode {
  return {
    kind: "ForEach",
    isStatic,
    ...(staticItems !== undefined && { staticItems }),
    ...(stubChild !== undefined && { stubChild }),
    ...base(modifiers),
  };
}

export function makeSection(
  children: ViewNode[],
  header: ViewNode | null = null,
  footer: ViewNode | null = null,
  modifiers: Modifier[] = []
): SectionNode {
  return { kind: "Section", header, footer, children, ...base(modifiers) };
}

export function makeForm(
  children: ViewNode[] = [],
  modifiers: Modifier[] = []
): FormNode {
  return { kind: "Form", children, ...base(modifiers) };
}

export function makeGroup(
  children: ViewNode[] = [],
  modifiers: Modifier[] = []
): GroupNode {
  return { kind: "Group", children, ...base(modifiers) };
}

export function makeTextField(
  label: string,
  placeholder = "",
  style: TextFieldNode["style"] = "roundedBorder",
  modifiers: Modifier[] = []
): TextFieldNode {
  return { kind: "TextField", label, placeholder, style, ...base(modifiers) };
}

export function makeSecureField(
  label: string,
  placeholder = "",
  modifiers: Modifier[] = []
): SecureFieldNode {
  return { kind: "SecureField", label, placeholder, ...base(modifiers) };
}

export function makeToggle(
  label: ViewNode,
  modifiers: Modifier[] = []
): ToggleNode {
  return { kind: "Toggle", label, isOn: false /* STUB: false */, ...base(modifiers) };
}

export function makePicker(
  label: string,
  style: PickerNode["style"] = "menu",
  children: ViewNode[] = [],
  modifiers: Modifier[] = []
): PickerNode {
  return { kind: "Picker", label, style, children, ...base(modifiers) };
}

export function makeSlider(
  minimum = 0,
  maximum = 1,
  modifiers: Modifier[] = []
): SliderNode {
  return {
    kind: "Slider",
    value: (minimum + maximum) / 2, // STUB: midpoint
    minimum, maximum, step: null,
    ...base(modifiers),
  };
}

export function makeStepper(
  label: ViewNode,
  modifiers: Modifier[] = []
): StepperNode {
  return { kind: "Stepper", label, value: 0 /* STUB: 0 */, ...base(modifiers) };
}

export function makeDatePicker(
  label: string,
  modifiers: Modifier[] = []
): DatePickerNode {
  return { kind: "DatePicker", label, displayedComponents: ["date"], ...base(modifiers) };
}

export function makeRectangle(modifiers: Modifier[] = []): RectangleNode {
  return { kind: "Rectangle", ...base(modifiers) };
}

export function makeCircle(modifiers: Modifier[] = []): CircleNode {
  return { kind: "Circle", ...base(modifiers) };
}

export function makeCapsule(modifiers: Modifier[] = []): CapsuleNode {
  return { kind: "Capsule", ...base(modifiers) };
}

export function makeRoundedRectangle(
  cornerRadius: number,
  style: RoundedRectangleNode["style"] = "continuous",
  modifiers: Modifier[] = []
): RoundedRectangleNode {
  return { kind: "RoundedRectangle", cornerRadius, style, ...base(modifiers) };
}

export function makeEllipse(modifiers: Modifier[] = []): EllipseNode {
  return { kind: "Ellipse", ...base(modifiers) };
}

export function makeTabView(
  children: ViewNode[] = [],
  modifiers: Modifier[] = []
): TabViewNode {
  return { kind: "TabView", children, ...base(modifiers) };
}

export function makeTabItem(
  label: ViewNode,
  child: ViewNode,
  systemImage: string | null = null,
  modifiers: Modifier[] = []
): TabItemNode {
  return { kind: "TabItem", label, child, systemImage, ...base(modifiers) };
}

export function makeGeometryReader(
  child: ViewNode,
  modifiers: Modifier[] = []
): GeometryReaderNode {
  return { kind: "GeometryReader", child, ...base(modifiers) };
}

export function makeNavigationView(
  child: ViewNode,
  modifiers: Modifier[] = []
): NavigationViewNode {
  return { kind: "NavigationView", child, ...base(modifiers) };
}

export function makeLazyVStack(
  alignment: Alignment = "center",
  spacing: number | null = null,
  children: ViewNode[] = [],
  modifiers: Modifier[] = []
): LazyVStackNode {
  return { kind: "LazyVStack", alignment, spacing, children, ...base(modifiers) };
}

export function makeLazyHStack(
  alignment: Alignment = "center",
  spacing: number | null = null,
  children: ViewNode[] = [],
  modifiers: Modifier[] = []
): LazyHStackNode {
  return { kind: "LazyHStack", alignment, spacing, children, ...base(modifiers) };
}

export function makeLazyVGrid(
  columns: GridColumn[],
  spacing: number | null = null,
  children: ViewNode[] = [],
  modifiers: Modifier[] = []
): LazyVGridNode {
  return { kind: "LazyVGrid", columns, spacing, children, ...base(modifiers) };
}

export function makeLazyHGrid(
  rows: GridColumn[],
  spacing: number | null = null,
  children: ViewNode[] = [],
  modifiers: Modifier[] = []
): LazyHGridNode {
  return { kind: "LazyHGrid", rows, spacing, children, ...base(modifiers) };
}

export function makeAsyncImage(
  url: string,
  modifiers: Modifier[] = []
): AsyncImageNode {
  return { kind: "AsyncImage", url, ...base(modifiers) }; // STUB: gray box + photo symbol
}

export function makeLabel(
  title: string,
  systemImage: string,
  modifiers: Modifier[] = []
): LabelNode {
  return { kind: "Label", title, systemImage, ...base(modifiers) };
}

export function makeLink(
  label: ViewNode,
  destination: string,
  modifiers: Modifier[] = []
): LinkNode {
  return { kind: "Link", label, destination, ...base(modifiers) };
}

export function makePath(modifiers: Modifier[] = []): PathNode {
  return { kind: "Path", stub: true, ...base(modifiers) }; // STUB: gray box labeled "Path"
}

export function makeMenu(
  label: ViewNode,
  children: ViewNode[] = [],
  modifiers: Modifier[] = []
): MenuNode {
  return { kind: "Menu", label, children, ...base(modifiers) };
}

export function makeContextMenu(
  child: ViewNode,
  menuItems: ViewNode[] = [],
  modifiers: Modifier[] = []
): ContextMenuNode {
  return { kind: "ContextMenu", child, menuItems, ...base(modifiers) };
}

export function makeSheet(
  content: ViewNode,
  modifiers: Modifier[] = []
): SheetNode {
  return { kind: "Sheet", content, ...base(modifiers) }; // STUB: not presented
}

export function makeAlert(
  title: string,
  modifiers: Modifier[] = []
): AlertNode {
  return { kind: "Alert", title, ...base(modifiers) }; // STUB: ignored
}

export function makeConfirmationDialog(
  title: string,
  modifiers: Modifier[] = []
): ConfirmationDialogNode {
  return { kind: "ConfirmationDialog", title, ...base(modifiers) }; // STUB: ignored
}

export function makeToolbar(
  items: ToolbarItemNode[],
  modifiers: Modifier[] = []
): ToolbarNode {
  return { kind: "Toolbar", items, ...base(modifiers) };
}

export function makeToolbarItem(
  placement: string,
  child: ViewNode,
  modifiers: Modifier[] = []
): ToolbarItemNode {
  return { kind: "ToolbarItem", placement, child, ...base(modifiers) };
}

export function makeCustomView(
  name: string,
  args: Record<string, unknown> = {},
  modifiers: Modifier[] = []
): CustomViewNode {
  return { kind: "CustomViewNode", name, args, ...base(modifiers) };
}

export function makeUnknown(
  rawType: string,
  rawSource = "",
  modifiers: Modifier[] = []
): UnknownNode {
  return { kind: "UnknownNode", rawType, rawSource, ...base(modifiers) };
}
