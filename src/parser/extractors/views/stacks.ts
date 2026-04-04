import type { Node as SyntaxNode } from "web-tree-sitter";

import {
  makeHStack,
  makeVStack,
  makeZStack,
} from "../../../ir/builders";
import type { ViewNode } from "../../../ir/types";
import {
  getStatementsNodeFromLambda,
  parseAlignmentValue,
  parseNumberLiteral,
  withSourceRange,
  type CallDetails,
  type ParseSourceContext,
} from "../shared";

type NestedViewParser = (
  node: SyntaxNode,
  context: ParseSourceContext
) => ViewNode;

function parseChildrenFromClosure(
  call: CallDetails,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): ViewNode[] {
  const lambdaNode = call.trailingClosures[0];
  if (!lambdaNode) {
    return [];
  }

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

export function parseVStackCall(
  call: CallDetails,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): ViewNode {
  const alignmentArgument = call.arguments.find(
    (argument) => argument.label === "alignment"
  );
  const spacingArgument = call.arguments.find(
    (argument) => argument.label === "spacing"
  );

  const alignment =
    (alignmentArgument &&
      parseAlignmentValue(alignmentArgument.value, context)) ??
    "center";
  const spacing = spacingArgument
    ? parseNumberLiteral(spacingArgument.value, context)
    : null;

  return withSourceRange(
    makeVStack(
      alignment,
      spacing,
      parseChildrenFromClosure(call, context, parseNestedView)
    ),
    call.node
  );
}

export function parseHStackCall(
  call: CallDetails,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): ViewNode {
  const alignmentArgument = call.arguments.find(
    (argument) => argument.label === "alignment"
  );
  const spacingArgument = call.arguments.find(
    (argument) => argument.label === "spacing"
  );

  const alignment =
    (alignmentArgument &&
      parseAlignmentValue(alignmentArgument.value, context)) ??
    "center";
  const spacing = spacingArgument
    ? parseNumberLiteral(spacingArgument.value, context)
    : null;

  return withSourceRange(
    makeHStack(
      alignment,
      spacing,
      parseChildrenFromClosure(call, context, parseNestedView)
    ),
    call.node
  );
}

export function parseZStackCall(
  call: CallDetails,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): ViewNode {
  const alignmentArgument = call.arguments.find(
    (argument) => argument.label === "alignment"
  );
  const alignment =
    (alignmentArgument &&
      parseAlignmentValue(alignmentArgument.value, context)) ??
    "center";

  return withSourceRange(
    makeZStack(
      alignment,
      parseChildrenFromClosure(call, context, parseNestedView)
    ),
    call.node
  );
}
