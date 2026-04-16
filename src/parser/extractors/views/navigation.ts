import type { Node as SyntaxNode } from "web-tree-sitter";

import {
  makeGroup,
  makeNavigationLink,
  makeNavigationStack,
  makeText,
  makeUnknown,
} from "../../../ir/builders";
import type { ViewNode } from "../../../ir/types";
import {
  getNodeText,
  getStatementsNodeFromLambda,
  parseStringLiteral,
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

function parseViewLikeNode(
  node: SyntaxNode,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): ViewNode {
  if (node.type === "lambda_literal") {
    return parseViewBuilderClosure(node, context, parseNestedView);
  }

  if (isViewExpressionNode(node)) {
    return parseNestedView(node, context);
  }

  return withSourceRange(
    makeUnknown(node.type, getNodeText(node, context)),
    node
  );
}

function findArgument(
  argumentsList: CallArgument[],
  label: string | null
): CallArgument | undefined {
  return argumentsList.find((argument) => argument.label === label);
}

function parseNavigationStackRoot(
  call: CallDetails,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): ViewNode | null {
  const rootNode =
    findArgument(call.trailingClosureArguments, null)?.value ??
    findArgument(call.arguments, "root")?.value;

  if (!rootNode) {
    return null;
  }

  return parseViewLikeNode(rootNode, context, parseNestedView);
}

function parseNavigationLinkDestination(
  call: CallDetails,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): ViewNode | null {
  const labeledTrailingLabel = findArgument(
    call.trailingClosureArguments,
    "label"
  );
  if (labeledTrailingLabel) {
    const multipleTrailingDestination = findArgument(
      call.trailingClosureArguments,
      null
    )?.value;
    if (multipleTrailingDestination) {
      return parseViewLikeNode(
        multipleTrailingDestination,
        context,
        parseNestedView
      );
    }
  }

  const destinationNode =
    findArgument(call.arguments, "destination")?.value ??
    findArgument(call.trailingClosureArguments, "destination")?.value;
  if (destinationNode) {
    return parseViewLikeNode(
      destinationNode,
      context,
      parseNestedView
    );
  }

  return null;
}

function parseNavigationLinkLabelFromUnlabeledArgument(
  call: CallDetails,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): ViewNode | null {
  const unlabeledArgument = findArgument(call.arguments, null);
  if (!unlabeledArgument) {
    return null;
  }

  const parsedString = parseStringLiteral(
    unlabeledArgument.value,
    context
  );
  if (parsedString) {
    return withSourceRange(
      makeText(parsedString.content, parsedString.isDynamic),
      unlabeledArgument.value
    );
  }

  return parseViewLikeNode(
    unlabeledArgument.value,
    context,
    parseNestedView
  );
}

function parseNavigationLinkLabel(
  call: CallDetails,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): ViewNode | null {
  const explicitLabelNode =
    findArgument(call.arguments, "label")?.value ??
    findArgument(call.trailingClosureArguments, "label")?.value;
  if (explicitLabelNode) {
    return parseViewLikeNode(
      explicitLabelNode,
      context,
      parseNestedView
    );
  }

  const destinationNode =
    findArgument(call.arguments, "destination")?.value ??
    findArgument(call.trailingClosureArguments, "destination")?.value;
  if (destinationNode) {
    const unlabeledTrailingClosure = findArgument(
      call.trailingClosureArguments,
      null
    )?.value;
    if (unlabeledTrailingClosure) {
      return parseViewLikeNode(
        unlabeledTrailingClosure,
        context,
        parseNestedView
      );
    }
  }

  const unlabeledLabel = parseNavigationLinkLabelFromUnlabeledArgument(
    call,
    context,
    parseNestedView
  );
  if (unlabeledLabel) {
    return unlabeledLabel;
  }

  const fallbackTrailingClosure = findArgument(
    call.trailingClosureArguments,
    null
  )?.value;
  if (fallbackTrailingClosure) {
    return parseViewLikeNode(
      fallbackTrailingClosure,
      context,
      parseNestedView
    );
  }

  return null;
}

export function parseNavigationStackCall(
  call: CallDetails,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): ViewNode {
  const child = parseNavigationStackRoot(
    call,
    context,
    parseNestedView
  );
  if (!child) {
    return withSourceRange(
      makeUnknown("NavigationStack", getNodeText(call.node, context)),
      call.node
    );
  }

  return withSourceRange(makeNavigationStack(child), call.node);
}

export function parseNavigationLinkCall(
  call: CallDetails,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): ViewNode {
  const destination = parseNavigationLinkDestination(
    call,
    context,
    parseNestedView
  );
  const label = parseNavigationLinkLabel(
    call,
    context,
    parseNestedView
  );
  if (!destination || !label) {
    return withSourceRange(
      makeUnknown("NavigationLink", getNodeText(call.node, context)),
      call.node
    );
  }

  return withSourceRange(
    makeNavigationLink(label, destination),
    call.node
  );
}
