import type { Node as SyntaxNode } from "web-tree-sitter";

import { makeGroup } from "../../../ir/builders";
import type {
  ColorValue,
  FontStyle,
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
  parseEdgeSet,
  parseNumberLiteral,
  parseSizeValue,
  parseStringLiteral,
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
    case "cornerRadius":
      return parseCornerRadiusModifier(call, context);
    case "opacity":
      return parseOpacityModifier(call, context);
    case "navigationTitle":
      return parseNavigationTitleModifier(call, context);
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
