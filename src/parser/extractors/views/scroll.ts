import type { Node as SyntaxNode } from "web-tree-sitter";

import {
  makeGeometryReader,
  makeGroup,
  makeScrollView,
  makeUnknown,
} from "../../../ir/builders";
import type { ScrollViewNode, ViewNode } from "../../../ir/types";
import {
  getLastPathComponent,
  getNavigationPath,
  getNodeText,
  getStatementsNodeFromLambda,
  parseBooleanLiteral,
  withSourceRange,
  type CallArgument,
  type CallDetails,
  type ParseSourceContext,
} from "../shared";

type NestedViewParser = (
  node: SyntaxNode,
  context: ParseSourceContext
) => ViewNode;

function isViewExpressionNode(node: SyntaxNode): boolean {
  return (
    node.type === "call_expression" || node.type === "if_statement"
  );
}

function parseViewNodesFromStatements(
  statementsNode: SyntaxNode | null,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): ViewNode[] {
  if (!statementsNode) {
    return [];
  }

  return statementsNode.namedChildren
    .filter(isViewExpressionNode)
    .map((child) => parseNestedView(child, context));
}

function wrapBuilderChildren(
  children: ViewNode[],
  syntaxNode: SyntaxNode
): ViewNode {
  if (children.length === 0) {
    return withSourceRange(makeGroup([]), syntaxNode);
  }

  if (children.length === 1) {
    return children[0] ?? withSourceRange(makeGroup([]), syntaxNode);
  }

  return withSourceRange(makeGroup(children), syntaxNode);
}

function parseViewBuilderClosure(
  lambdaNode: SyntaxNode,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): ViewNode {
  const children = parseViewNodesFromStatements(
    getStatementsNodeFromLambda(lambdaNode),
    context,
    parseNestedView
  );

  return wrapBuilderChildren(children, lambdaNode);
}

function findArgument(
  argumentsList: CallArgument[],
  label: string | null
): CallArgument | undefined {
  return argumentsList.find((argument) => argument.label === label);
}

function parseAxisComponent(
  node: SyntaxNode,
  context: ParseSourceContext
): "vertical" | "horizontal" | null {
  switch (getLastPathComponent(getNavigationPath(node, context))) {
    case "vertical":
      return "vertical";
    case "horizontal":
      return "horizontal";
    default:
      return null;
  }
}

function parseScrollAxes(
  node: SyntaxNode,
  context: ParseSourceContext
): ScrollViewNode["axes"] | null {
  const directAxis = parseAxisComponent(node, context);
  if (directAxis) {
    return directAxis;
  }

  if (node.type !== "array_literal") {
    return null;
  }

  const axes = new Set<"vertical" | "horizontal">();
  for (const child of node.namedChildren) {
    const axis = parseAxisComponent(child, context);
    if (!axis) {
      return null;
    }

    axes.add(axis);
  }

  if (axes.has("vertical") && axes.has("horizontal")) {
    return "both";
  }

  if (axes.has("horizontal")) {
    return "horizontal";
  }

  if (axes.has("vertical")) {
    return "vertical";
  }

  return null;
}

function parseContainerChild(
  call: CallDetails,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser,
  viewName: string
): ViewNode | null {
  const contentNode =
    findArgument(call.trailingClosureArguments, null)?.value ??
    findArgument(call.arguments, "content")?.value ??
    null;

  if (contentNode?.type !== "lambda_literal") {
    return withSourceRange(
      makeUnknown(viewName, getNodeText(call.node, context)),
      call.node
    );
  }

  return parseViewBuilderClosure(
    contentNode,
    context,
    parseNestedView
  );
}

export function parseScrollViewCall(
  call: CallDetails,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): ViewNode {
  const child = parseContainerChild(
    call,
    context,
    parseNestedView,
    "ScrollView"
  );
  if (!child) {
    return withSourceRange(
      makeUnknown("ScrollView", getNodeText(call.node, context)),
      call.node
    );
  }

  const axesNode =
    findArgument(call.arguments, null)?.value ??
    findArgument(call.arguments, "axes")?.value ??
    null;
  const showsIndicatorsNode =
    findArgument(call.arguments, "showsIndicators")?.value ?? null;

  const axes = axesNode
    ? parseScrollAxes(axesNode, context) ?? "vertical"
    : "vertical";
  const showsIndicators = showsIndicatorsNode
    ? parseBooleanLiteral(showsIndicatorsNode, context) ?? true
    : true;

  return withSourceRange(
    makeScrollView(child, axes, showsIndicators),
    call.node
  );
}

export function parseGeometryReaderCall(
  call: CallDetails,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): ViewNode {
  const child = parseContainerChild(
    call,
    context,
    parseNestedView,
    "GeometryReader"
  );
  if (!child) {
    return withSourceRange(
      makeUnknown("GeometryReader", getNodeText(call.node, context)),
      call.node
    );
  }

  return withSourceRange(makeGeometryReader(child), call.node);
}
