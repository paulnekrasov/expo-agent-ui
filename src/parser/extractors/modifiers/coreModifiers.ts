import type { Node as SyntaxNode } from "web-tree-sitter";

import { makeGroup } from "../../../ir/builders";
import type {
  EdgeInsets,
  ColorValue,
  FontStyle,
  ListStyle,
  Modifier,
  ViewNode,
} from "../../../ir/types";
import {
  getLastPathComponent,
  getNavigationPath,
  getNodeText,
  getStatementsNodeFromLambda,
  parseAlignmentValue,
  parseBooleanLiteral,
  parseCallDetails,
  parseEdgeSet,
  parseNumberLiteral,
  parseSizeValue,
  parseStringLiteral,
  withSourceRange,
  type CallDetails,
  type ParseSourceContext,
} from "../shared";

type NestedViewParser = (
  node: SyntaxNode,
  context: ParseSourceContext
) => ViewNode;

const FONT_STYLE_NAMES = new Set<FontStyle>([
  "largeTitle",
  "title",
  "title2",
  "title3",
  "headline",
  "body",
  "callout",
  "subheadline",
  "footnote",
  "caption",
  "caption2",
]);

const LIST_STYLE_NAMES = new Set<ListStyle>([
  "automatic",
  "plain",
  "grouped",
  "inset",
  "insetGrouped",
  "sidebar",
]);

const LIST_ROW_SEPARATOR_VISIBILITIES = new Set([
  "automatic",
  "visible",
  "hidden",
]);

const NAVIGATION_DESTINATION_ARGUMENT_LABELS = new Set([
  "for",
  "isPresented",
]);

type ToolbarItemViewNode = Extract<
  ViewNode,
  { kind: "ToolbarItem" }
>;

function getFirstArgument(call: CallDetails): SyntaxNode | null {
  return call.arguments[0]?.value ?? null;
}

function getCallRawArgs(
  call: CallDetails,
  context: ParseSourceContext
): string {
  return call.suffixes
    .map((suffix) => getNodeText(suffix, context))
    .join(" ");
}

function parseColorValue(
  node: SyntaxNode,
  context: ParseSourceContext
): ColorValue {
  const navigationPath = getNavigationPath(node, context);
  const rawName = getLastPathComponent(navigationPath);

  if (
    node.type === "prefix_expression" ||
    node.type === "simple_identifier"
  ) {
    return { kind: "system", name: rawName };
  }

  if (node.type === "navigation_expression") {
    if (
      navigationPath.startsWith("Color.") ||
      navigationPath.startsWith("UIColor.")
    ) {
      return { kind: "system", name: rawName };
    }

    return { kind: "unknown", raw: navigationPath };
  }

  return { kind: "unknown", raw: getNodeText(node, context) };
}

function parseFontModifier(
  call: CallDetails,
  context: ParseSourceContext
): Modifier {
  const argumentNode = getFirstArgument(call);
  if (!argumentNode) {
    return { kind: "unknown", name: "font", rawArgs: "" };
  }

  const styleName = getLastPathComponent(
    getNavigationPath(argumentNode, context)
  );

  if (FONT_STYLE_NAMES.has(styleName as FontStyle)) {
    return {
      kind: "font",
      style: styleName as FontStyle,
    };
  }

  return {
    kind: "unknown",
    name: "font",
    rawArgs: getCallRawArgs(call, context),
  };
}

function parseForegroundColorModifier(
  call: CallDetails,
  context: ParseSourceContext
): Modifier {
  const argumentNode = getFirstArgument(call);
  if (!argumentNode) {
    return {
      kind: "unknown",
      name: "foregroundColor",
      rawArgs: "",
    };
  }

  return {
    kind: "foregroundColor",
    color: parseColorValue(argumentNode, context),
  };
}

function parsePaddingModifier(
  call: CallDetails,
  context: ParseSourceContext
): Modifier {
  const firstArgument = call.arguments[0]?.value ?? null;
  const secondArgument = call.arguments[1]?.value ?? null;

  if (!firstArgument) {
    return {
      kind: "padding",
      edges: { kind: "all" },
      amount: { kind: "unspecified" },
    };
  }

  const numericAmount = parseNumberLiteral(firstArgument, context);
  if (numericAmount !== null) {
    return {
      kind: "padding",
      edges: { kind: "all" },
      amount: { kind: "fixed", value: numericAmount },
    };
  }

  const edges = parseEdgeSet(firstArgument, context);
  if (!edges) {
    return {
      kind: "unknown",
      name: "padding",
      rawArgs: getCallRawArgs(call, context),
    };
  }

  const amount = secondArgument
    ? parseSizeValue(secondArgument, context)
    : null;

  return {
    kind: "padding",
    edges,
    amount: amount ?? { kind: "unspecified" },
  };
}

function parseFrameModifier(
  call: CallDetails,
  context: ParseSourceContext
): Modifier {
  const modifier: Extract<Modifier, { kind: "frame" }> = {
    kind: "frame",
  };

  for (const argument of call.arguments) {
    if (!argument.label) {
      continue;
    }

    switch (argument.label) {
      case "width": {
        const value = parseSizeValue(argument.value, context);
        if (value) {
          modifier.width = value;
        }
        break;
      }
      case "height": {
        const value = parseSizeValue(argument.value, context);
        if (value) {
          modifier.height = value;
        }
        break;
      }
      case "minWidth": {
        const value = parseSizeValue(argument.value, context);
        if (value) {
          modifier.minWidth = value;
        }
        break;
      }
      case "maxWidth": {
        const value = parseSizeValue(argument.value, context);
        if (value) {
          modifier.maxWidth = value;
        }
        break;
      }
      case "minHeight": {
        const value = parseSizeValue(argument.value, context);
        if (value) {
          modifier.minHeight = value;
        }
        break;
      }
      case "maxHeight": {
        const value = parseSizeValue(argument.value, context);
        if (value) {
          modifier.maxHeight = value;
        }
        break;
      }
      case "alignment": {
        const value = parseAlignmentValue(argument.value, context);
        if (value) {
          modifier.alignment = value;
        }
        break;
      }
      default:
        break;
    }
  }

  return modifier;
}

function parseBackgroundViewContent(
  lambdaNode: SyntaxNode,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): ViewNode | null {
  const statementsNode = getStatementsNodeFromLambda(lambdaNode);
  if (!statementsNode) {
    return null;
  }

  const children = statementsNode.namedChildren
    .filter(
      (child) =>
        child.type === "call_expression" || child.type === "if_statement"
    )
    .map((child) => parseNestedView(child, context));

  if (children.length === 0) {
    return null;
  }

  if (children.length === 1) {
    return children[0] ?? null;
  }

  return makeGroup(children);
}

function parseViewBuilderChildren(
  lambdaNode: SyntaxNode,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): ViewNode[] {
  const statementsNode = getStatementsNodeFromLambda(lambdaNode);
  if (!statementsNode) {
    return [];
  }

  return statementsNode.namedChildren
    .filter(
      (child) =>
        child.type === "call_expression" || child.type === "if_statement"
    )
    .map((child) => parseNestedView(child, context));
}

function wrapViewBuilderChildren(
  children: ViewNode[],
  syntaxNode: SyntaxNode
): ViewNode | null {
  if (children.length === 0) {
    return null;
  }

  if (children.length === 1) {
    return children[0] ?? null;
  }

  return withSourceRange(makeGroup(children), syntaxNode);
}

function parseModifierViewArgument(
  node: SyntaxNode,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): ViewNode | null {
  if (node.type !== "call_expression" && node.type !== "if_statement") {
    return null;
  }

  return parseNestedView(node, context);
}

function parseBackgroundModifier(
  call: CallDetails,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): Modifier {
  const argumentNode = getFirstArgument(call);
  if (argumentNode) {
    if (argumentNode.type === "call_expression") {
      return {
        kind: "background",
        content: parseNestedView(argumentNode, context),
      };
    }

    return {
      kind: "background",
      content: parseColorValue(argumentNode, context),
    };
  }

  const closure = call.trailingClosures[0];
  if (!closure) {
    return {
      kind: "unknown",
      name: "background",
      rawArgs: "",
    };
  }

  const content = parseBackgroundViewContent(
    closure,
    context,
    parseNestedView
  );

  if (!content) {
    return {
      kind: "unknown",
      name: "background",
      rawArgs: getCallRawArgs(call, context),
    };
  }

  return {
    kind: "background",
    content,
  };
}

function parseOverlayModifier(
  call: CallDetails,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): Modifier {
  let alignment: "center" | "leading" | "trailing" |
    "top" | "bottom" |
    "topLeading" | "topTrailing" |
    "bottomLeading" | "bottomTrailing" = "center";
  let content: ViewNode | null = null;

  for (const argument of call.arguments) {
    if (argument.label === "alignment") {
      const parsedAlignment = parseAlignmentValue(
        argument.value,
        context
      );
      if (!parsedAlignment) {
        return {
          kind: "unknown",
          name: "overlay",
          rawArgs: getCallRawArgs(call, context),
        };
      }

      alignment = parsedAlignment;
      continue;
    }

    if (argument.label !== null) {
      return {
        kind: "unknown",
        name: "overlay",
        rawArgs: getCallRawArgs(call, context),
      };
    }

    content = parseModifierViewArgument(
      argument.value,
      context,
      parseNestedView
    );
    if (!content) {
      return {
        kind: "unknown",
        name: "overlay",
        rawArgs: getCallRawArgs(call, context),
      };
    }
  }

  if (!content) {
    const closure = call.trailingClosures[0];
    if (!closure) {
      return {
        kind: "unknown",
        name: "overlay",
        rawArgs: getCallRawArgs(call, context),
      };
    }

    content = parseBackgroundViewContent(
      closure,
      context,
      parseNestedView
    );
  }

  if (!content) {
    return {
      kind: "unknown",
      name: "overlay",
      rawArgs: getCallRawArgs(call, context),
    };
  }

  return {
    kind: "overlay",
    content,
    alignment,
  };
}

function parseCornerRadiusModifier(
  call: CallDetails,
  context: ParseSourceContext
): Modifier {
  const argumentNode = getFirstArgument(call);
  const radius = argumentNode
    ? parseNumberLiteral(argumentNode, context)
    : null;

  if (radius === null) {
    return {
      kind: "unknown",
      name: "cornerRadius",
      rawArgs: getCallRawArgs(call, context),
    };
  }

  return {
    kind: "cornerRadius",
    radius,
  };
}

function parseOpacityModifier(
  call: CallDetails,
  context: ParseSourceContext
): Modifier {
  const argumentNode = getFirstArgument(call);
  const value = argumentNode
    ? parseNumberLiteral(argumentNode, context)
    : null;

  if (value === null) {
    return {
      kind: "unknown",
      name: "opacity",
      rawArgs: getCallRawArgs(call, context),
    };
  }

  return {
    kind: "opacity",
    value,
  };
}

function parseNavigationTitleModifier(
  call: CallDetails,
  context: ParseSourceContext
): Modifier {
  const argumentNode = getFirstArgument(call);
  if (!argumentNode) {
    return {
      kind: "unknown",
      name: "navigationTitle",
      rawArgs: "",
    };
  }

  const parsedString = parseStringLiteral(argumentNode, context);
  if (parsedString) {
    return {
      kind: "navigationTitle",
      title: parsedString.content,
    };
  }

  return {
    kind: "navigationTitle",
    title: getNodeText(argumentNode, context),
  };
}

function parseFixedSizeModifier(
  call: CallDetails,
  context: ParseSourceContext
): Modifier {
  if (call.arguments.length === 0) {
    return {
      kind: "fixedSize",
      horizontal: true,
      vertical: true,
    };
  }

  let horizontal: boolean | null = null;
  let vertical: boolean | null = null;

  for (const argument of call.arguments) {
    if (argument.label !== "horizontal" && argument.label !== "vertical") {
      return {
        kind: "unknown",
        name: "fixedSize",
        rawArgs: getCallRawArgs(call, context),
      };
    }

    const value = parseBooleanLiteral(argument.value, context);
    if (value === null) {
      return {
        kind: "unknown",
        name: "fixedSize",
        rawArgs: getCallRawArgs(call, context),
      };
    }

    if (argument.label === "horizontal") {
      horizontal = value;
    } else {
      vertical = value;
    }
  }

  if (horizontal === null || vertical === null) {
    return {
      kind: "unknown",
      name: "fixedSize",
      rawArgs: getCallRawArgs(call, context),
    };
  }

  return {
    kind: "fixedSize",
    horizontal,
    vertical,
  };
}

function parseOffsetModifier(
  call: CallDetails,
  context: ParseSourceContext
): Modifier {
  let x = 0;
  let y = 0;

  for (const argument of call.arguments) {
    if (argument.label !== "x" && argument.label !== "y") {
      return {
        kind: "unknown",
        name: "offset",
        rawArgs: getCallRawArgs(call, context),
      };
    }

    const value = parseNumberLiteral(argument.value, context);
    if (value === null) {
      return {
        kind: "unknown",
        name: "offset",
        rawArgs: getCallRawArgs(call, context),
      };
    }

    if (argument.label === "x") {
      x = value;
    } else {
      y = value;
    }
  }

  return {
    kind: "offset",
    x,
    y,
  };
}

function parsePositionModifier(
  call: CallDetails,
  context: ParseSourceContext
): Modifier {
  let x = 0;
  let y = 0;

  for (const argument of call.arguments) {
    if (argument.label !== "x" && argument.label !== "y") {
      return {
        kind: "unknown",
        name: "position",
        rawArgs: getCallRawArgs(call, context),
      };
    }

    const value = parseNumberLiteral(argument.value, context);
    if (value === null) {
      return {
        kind: "unknown",
        name: "position",
        rawArgs: getCallRawArgs(call, context),
      };
    }

    if (argument.label === "x") {
      x = value;
    } else {
      y = value;
    }
  }

  return {
    kind: "position",
    x,
    y,
  };
}

function parseListStyleModifier(
  call: CallDetails,
  context: ParseSourceContext
): Modifier {
  const argumentNode = getFirstArgument(call);
  if (!argumentNode) {
    return {
      kind: "unknown",
      name: "listStyle",
      rawArgs: getCallRawArgs(call, context),
    };
  }

  const style = getLastPathComponent(
    getNavigationPath(argumentNode, context)
  );
  if (!LIST_STYLE_NAMES.has(style as ListStyle)) {
    return {
      kind: "unknown",
      name: "listStyle",
      rawArgs: getCallRawArgs(call, context),
    };
  }

  return {
    kind: "listStyle",
    style: style as ListStyle,
  };
}

function parseListRowSeparatorModifier(
  call: CallDetails,
  context: ParseSourceContext
): Modifier {
  let visibility: string | null = null;

  for (const argument of call.arguments) {
    if (argument.label === null) {
      if (visibility !== null) {
        return {
          kind: "unknown",
          name: "listRowSeparator",
          rawArgs: getCallRawArgs(call, context),
        };
      }

      const parsedVisibility = getLastPathComponent(
        getNavigationPath(argument.value, context)
      );
      if (!LIST_ROW_SEPARATOR_VISIBILITIES.has(parsedVisibility)) {
        return {
          kind: "unknown",
          name: "listRowSeparator",
          rawArgs: getCallRawArgs(call, context),
        };
      }

      visibility = parsedVisibility;
      continue;
    }

    if (argument.label !== "edges") {
      return {
        kind: "unknown",
        name: "listRowSeparator",
        rawArgs: getCallRawArgs(call, context),
      };
    }

    const parsedEdges = parseEdgeSet(argument.value, context);
    if (
      !parsedEdges ||
      (parsedEdges.kind !== "all" &&
        parsedEdges.kind !== "top" &&
        parsedEdges.kind !== "bottom")
    ) {
      return {
        kind: "unknown",
        name: "listRowSeparator",
        rawArgs: getCallRawArgs(call, context),
      };
    }
  }

  if (!visibility) {
    return {
      kind: "unknown",
      name: "listRowSeparator",
      rawArgs: getCallRawArgs(call, context),
    };
  }

  return {
    kind: "listRowSeparator",
    visibility,
  };
}

function parseEdgeInsetsValue(
  node: SyntaxNode,
  context: ParseSourceContext
): EdgeInsets | null {
  if (node.type !== "call_expression") {
    return null;
  }

  const call = parseCallDetails(node, context);
  if (call.calleeName !== "EdgeInsets") {
    return null;
  }

  let top: number | null = null;
  let leading: number | null = null;
  let bottom: number | null = null;
  let trailing: number | null = null;

  for (const argument of call.arguments) {
    const value = parseNumberLiteral(argument.value, context);
    if (value === null) {
      return null;
    }

    switch (argument.label) {
      case "top":
        top = value;
        break;
      case "leading":
        leading = value;
        break;
      case "bottom":
        bottom = value;
        break;
      case "trailing":
        trailing = value;
        break;
      default:
        return null;
    }
  }

  if (
    top === null ||
    leading === null ||
    bottom === null ||
    trailing === null
  ) {
    return null;
  }

  return {
    top,
    leading,
    bottom,
    trailing,
  };
}

function parseListRowInsetsModifier(
  call: CallDetails,
  context: ParseSourceContext
): Modifier {
  const argumentNode = getFirstArgument(call);
  if (!argumentNode) {
    return {
      kind: "unknown",
      name: "listRowInsets",
      rawArgs: getCallRawArgs(call, context),
    };
  }

  const insets = parseEdgeInsetsValue(argumentNode, context);
  if (!insets) {
    return {
      kind: "unknown",
      name: "listRowInsets",
      rawArgs: getCallRawArgs(call, context),
    };
  }

  return {
    kind: "listRowInsets",
    insets,
  };
}

function parseNavigationDestinationModifier(
  call: CallDetails,
  context: ParseSourceContext
): Modifier {
  const supportedArgument = call.arguments.find(
    (argument) =>
      argument.label !== null &&
      argument.label !== "destination"
  );
  const supportedLabel = supportedArgument?.label;

  if (
    !supportedArgument ||
    supportedLabel === undefined ||
    supportedLabel === null ||
    !NAVIGATION_DESTINATION_ARGUMENT_LABELS.has(supportedLabel)
  ) {
    return {
      kind: "unknown",
      name: "navigationDestination",
      rawArgs: getCallRawArgs(call, context),
    };
  }

  const hasDestinationClosure =
    call.trailingClosures.length > 0 ||
    call.arguments.some(
      (argument) =>
        argument.label === "destination" &&
        argument.value.type === "lambda_literal"
    );
  if (!hasDestinationClosure) {
    return {
      kind: "unknown",
      name: "navigationDestination",
      rawArgs: getCallRawArgs(call, context),
    };
  }

  return {
    kind: "navigationDestination",
    stub: true,
  };
}

function parseToolbarPlacement(
  call: CallDetails,
  context: ParseSourceContext
): string | null | undefined {
  let placement: string | null = null;

  for (const argument of call.arguments) {
    if (argument.label !== "placement" || placement !== null) {
      return undefined;
    }

    const parsedPlacement = getLastPathComponent(
      getNavigationPath(argument.value, context)
    );
    if (!parsedPlacement) {
      return undefined;
    }

    placement = parsedPlacement;
  }

  return placement;
}

function makeToolbarItemView(
  placement: string,
  child: ViewNode
): ToolbarItemViewNode {
  const toolbarItem: ToolbarItemViewNode = {
    kind: "ToolbarItem",
    placement,
    child,
    modifiers: [],
    id: `toolbar_item_${child.id}`,
  };

  if (child.sourceRange) {
    toolbarItem.sourceRange = child.sourceRange;
  }

  return toolbarItem;
}

function parseToolbarItemEntry(
  call: CallDetails,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): ViewNode[] | null {
  const closure = call.trailingClosures[0];
  if (call.trailingClosures.length !== 1 || !closure) {
    return null;
  }

  const placement = parseToolbarPlacement(call, context);
  if (placement === undefined) {
    return null;
  }

  const content = wrapViewBuilderChildren(
    parseViewBuilderChildren(
      closure,
      context,
      parseNestedView
    ),
    closure
  );
  if (!content) {
    return null;
  }

  return placement
    ? [makeToolbarItemView(placement, content)]
    : [content];
}

function parseToolbarItemGroupEntry(
  call: CallDetails,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): ViewNode[] | null {
  const closure = call.trailingClosures[0];
  if (call.trailingClosures.length !== 1 || !closure) {
    return null;
  }

  const placement = parseToolbarPlacement(call, context);
  if (placement === undefined) {
    return null;
  }

  const children = parseViewBuilderChildren(
    closure,
    context,
    parseNestedView
  );
  if (children.length === 0) {
    return null;
  }

  return placement
    ? children.map((child) => makeToolbarItemView(placement, child))
    : children;
}

function parseToolbarModifier(
  call: CallDetails,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): Modifier {
  const closure = call.trailingClosures[0];
  if (
    call.arguments.length > 0 ||
    call.trailingClosures.length !== 1 ||
    !closure
  ) {
    return {
      kind: "unknown",
      name: "toolbar",
      rawArgs: getCallRawArgs(call, context),
    };
  }

  const statementsNode = getStatementsNodeFromLambda(closure);
  if (!statementsNode) {
    return {
      kind: "unknown",
      name: "toolbar",
      rawArgs: getCallRawArgs(call, context),
    };
  }

  const items: ViewNode[] = [];

  for (const child of statementsNode.namedChildren) {
    if (
      child.type !== "call_expression" &&
      child.type !== "if_statement"
    ) {
      continue;
    }

    if (child.type === "call_expression") {
      const childCall = parseCallDetails(child, context);
      if (childCall.calleeName === "ToolbarItem") {
        const parsedItems = parseToolbarItemEntry(
          childCall,
          context,
          parseNestedView
        );
        if (!parsedItems) {
          return {
            kind: "unknown",
            name: "toolbar",
            rawArgs: getCallRawArgs(call, context),
          };
        }

        items.push(...parsedItems);
        continue;
      }

      if (childCall.calleeName === "ToolbarItemGroup") {
        const parsedItems = parseToolbarItemGroupEntry(
          childCall,
          context,
          parseNestedView
        );
        if (!parsedItems) {
          return {
            kind: "unknown",
            name: "toolbar",
            rawArgs: getCallRawArgs(call, context),
          };
        }

        items.push(...parsedItems);
        continue;
      }
    }

    items.push(parseNestedView(child, context));
  }

  if (items.length === 0) {
    return {
      kind: "unknown",
      name: "toolbar",
      rawArgs: getCallRawArgs(call, context),
    };
  }

  return {
    kind: "toolbar",
    items,
  };
}

export function parseCoreModifier(
  name: string,
  call: CallDetails,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): Modifier {
  switch (name) {
    case "font":
      return parseFontModifier(call, context);
    case "foregroundColor":
      return parseForegroundColorModifier(call, context);
    case "padding":
      return parsePaddingModifier(call, context);
    case "frame":
      return parseFrameModifier(call, context);
    case "background":
      return parseBackgroundModifier(call, context, parseNestedView);
    case "overlay":
      return parseOverlayModifier(call, context, parseNestedView);
    case "cornerRadius":
      return parseCornerRadiusModifier(call, context);
    case "opacity":
      return parseOpacityModifier(call, context);
    case "navigationTitle":
      return parseNavigationTitleModifier(call, context);
    case "fixedSize":
      return parseFixedSizeModifier(call, context);
    case "offset":
      return parseOffsetModifier(call, context);
    case "position":
      return parsePositionModifier(call, context);
    case "listStyle":
      return parseListStyleModifier(call, context);
    case "listRowSeparator":
      return parseListRowSeparatorModifier(call, context);
    case "listRowInsets":
      return parseListRowInsetsModifier(call, context);
    case "navigationDestination":
      return parseNavigationDestinationModifier(call, context);
    case "toolbar":
      return parseToolbarModifier(call, context, parseNestedView);
    case "disabled": {
      const argumentNode = getFirstArgument(call);
      const value = argumentNode
        ? parseBooleanLiteral(argumentNode, context)
        : null;

      if (value !== null) {
        return {
          kind: "disabled",
          value,
        };
      }

      break;
    }
    default:
      break;
  }

  return {
    kind: "unknown",
    name,
    rawArgs: getCallRawArgs(call, context),
  };
}
