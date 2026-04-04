import type { Node as SyntaxNode } from "web-tree-sitter";

import type {
  Alignment,
  EdgeSet,
  SizeValue,
  ViewNode,
} from "../../ir/types";

export interface ParseSourceContext {
  source: string;
}

export interface ParsedStringLiteral {
  content: string;
  isDynamic: boolean;
}

export interface CallArgument {
  label: string | null;
  value: SyntaxNode;
}

export interface CallDetails {
  node: SyntaxNode;
  callee: SyntaxNode;
  calleeName: string;
  arguments: CallArgument[];
  suffixes: SyntaxNode[];
  trailingClosures: SyntaxNode[];
}

export interface PendingModifier {
  name: string;
  call: CallDetails;
  node: SyntaxNode;
}

export function normalizeSwiftSource(source: string): string {
  return source.replace(/\r\n/g, "\n");
}

export function getNodeText(
  node: SyntaxNode,
  context: ParseSourceContext
): string {
  return context.source.slice(node.startIndex, node.endIndex);
}

export function getSourceRange(node: SyntaxNode): {
  start: number;
  end: number;
} {
  return {
    start: node.startIndex,
    end: node.endIndex,
  };
}

export function withSourceRange<T extends ViewNode>(
  node: T,
  syntaxNode: SyntaxNode
): T {
  return {
    ...node,
    sourceRange: getSourceRange(syntaxNode),
  };
}

export function getFirstNamedChildByType(
  node: SyntaxNode,
  type: string
): SyntaxNode | null {
  for (const child of node.namedChildren) {
    if (child.type === type) {
      return child;
    }
  }

  return null;
}

export function getNamedChildrenByType(
  node: SyntaxNode,
  type: string
): SyntaxNode[] {
  return node.namedChildren.filter((child) => child.type === type);
}

export function getStatementsNodeFromLambda(
  lambdaNode: SyntaxNode
): SyntaxNode | null {
  return getFirstNamedChildByType(lambdaNode, "statements");
}

export function getStatementsNodeFromComputedProperty(
  computedPropertyNode: SyntaxNode
): SyntaxNode | null {
  return getFirstNamedChildByType(computedPropertyNode, "statements");
}

export function getNavigationPath(
  node: SyntaxNode,
  context: ParseSourceContext
): string {
  switch (node.type) {
    case "simple_identifier":
    case "type_identifier":
    case "line_str_text":
      return getNodeText(node, context);
    case "prefix_expression": {
      const target = node.childForFieldName("target");
      return target ? getNavigationPath(target, context) : "";
    }
    case "navigation_expression": {
      const target = node.childForFieldName("target");
      const suffix = node.childForFieldName("suffix");
      const targetPath = target
        ? getNavigationPath(target, context)
        : "";
      const suffixPath = suffix
        ? getNavigationPath(suffix, context)
        : "";

      return targetPath ? `${targetPath}.${suffixPath}` : suffixPath;
    }
    case "navigation_suffix": {
      const suffix = node.childForFieldName("suffix");
      return suffix
        ? getNavigationPath(suffix, context)
        : getNodeText(node, context).replace(/^\./, "");
    }
    default:
      return getNodeText(node, context).replace(/^\./, "");
  }
}

export function getLastPathComponent(path: string): string {
  const segments = path.split(".");
  return segments[segments.length - 1] ?? path;
}

export function parseCallDetails(
  node: SyntaxNode,
  context: ParseSourceContext
): CallDetails {
  const callee = node.namedChild(0);
  if (!callee) {
    throw new Error("call_expression missing callee");
  }

  const suffixes = getNamedChildrenByType(node, "call_suffix");
  const argumentsList: CallArgument[] = [];
  const trailingClosures: SyntaxNode[] = [];

  for (const suffix of suffixes) {
    for (const child of suffix.namedChildren) {
      if (child.type === "value_arguments") {
        for (const argumentNode of child.namedChildren) {
          if (argumentNode.type !== "value_argument") {
            continue;
          }

          const labelNode = argumentNode.childForFieldName("name");
          const valueNode = argumentNode.childForFieldName("value");
          if (!valueNode) {
            continue;
          }

          const labelIdentifier =
            labelNode?.namedChild(0) ?? labelNode ?? null;

          argumentsList.push({
            label: labelIdentifier
              ? getNodeText(labelIdentifier, context)
              : null,
            value: valueNode,
          });
        }
      } else if (child.type === "lambda_literal") {
        trailingClosures.push(child);
      }
    }
  }

  return {
    node,
    callee,
    calleeName: getLastPathComponent(
      getNavigationPath(callee, context)
    ),
    arguments: argumentsList,
    suffixes,
    trailingClosures,
  };
}

export function parseNumberLiteral(
  node: SyntaxNode,
  context: ParseSourceContext
): number | null {
  if (
    node.type === "integer_literal" ||
    node.type === "real_literal"
  ) {
    const value = Number(getNodeText(node, context));
    return Number.isFinite(value) ? value : null;
  }

  if (node.type === "prefix_expression") {
    const value = Number(getNodeText(node, context));
    return Number.isFinite(value) ? value : null;
  }

  return null;
}

export function parseBooleanLiteral(
  node: SyntaxNode,
  context: ParseSourceContext
): boolean | null {
  if (node.type !== "boolean_literal") {
    return null;
  }

  const raw = getNodeText(node, context);
  if (raw === "true") {
    return true;
  }

  if (raw === "false") {
    return false;
  }

  return null;
}

export function parseSizeValue(
  node: SyntaxNode,
  context: ParseSourceContext
): SizeValue | null {
  const path = getNavigationPath(node, context);
  if (getLastPathComponent(path) === "infinity") {
    return { kind: "infinity" };
  }

  const numeric = parseNumberLiteral(node, context);
  if (numeric !== null) {
    return { kind: "fixed", value: numeric };
  }

  return null;
}

export function parseAlignmentValue(
  node: SyntaxNode,
  context: ParseSourceContext
): Alignment | null {
  const raw = getLastPathComponent(getNavigationPath(node, context));
  switch (raw) {
    case "center":
    case "leading":
    case "trailing":
    case "top":
    case "bottom":
    case "topLeading":
    case "topTrailing":
    case "bottomLeading":
    case "bottomTrailing":
      return raw;
    default:
      return null;
  }
}

export function parseEdgeSet(
  node: SyntaxNode,
  context: ParseSourceContext
): EdgeSet | null {
  const raw = getLastPathComponent(getNavigationPath(node, context));
  switch (raw) {
    case "all":
      return { kind: "all" };
    case "horizontal":
      return { kind: "horizontal" };
    case "vertical":
      return { kind: "vertical" };
    case "top":
      return { kind: "top" };
    case "bottom":
      return { kind: "bottom" };
    case "leading":
      return { kind: "leading" };
    case "trailing":
      return { kind: "trailing" };
    default:
      return null;
  }
}

export function parseStringLiteral(
  node: SyntaxNode,
  context: ParseSourceContext
): ParsedStringLiteral | null {
  if (
    node.type !== "line_string_literal" &&
    node.type !== "multi_line_string_literal"
  ) {
    return null;
  }

  let content = "";
  let isDynamic = false;

  for (const child of node.namedChildren) {
    if (
      child.type === "line_str_text" ||
      child.type === "multi_line_str_text"
    ) {
      content += getNodeText(child, context);
      continue;
    }

    if (
      child.type === "interpolated_expression" ||
      child.type === "interpolation"
    ) {
      const valueNode =
        child.childForFieldName("value") ?? child.namedChild(0);
      const valueText = valueNode
        ? getNodeText(valueNode, context)
        : "";
      content += `\${${valueText}}`;
      isDynamic = true;
    }
  }

  if (content.length === 0) {
    const raw = getNodeText(node, context);
    content = raw.replace(/^"/, "").replace(/"$/, "");
  }

  return { content, isDynamic };
}
