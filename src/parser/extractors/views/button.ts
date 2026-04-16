import type { Node as SyntaxNode } from "web-tree-sitter";

import { makeButton, makeText, makeUnknown } from "../../../ir/builders";
import type { ViewNode } from "../../../ir/types";
import {
  getLastPathComponent,
  getNavigationPath,
  getNodeText,
  getStatementsNodeFromLambda,
  parseStringLiteral,
  withSourceRange,
  type CallDetails,
  type ParseSourceContext,
} from "../shared";

type NestedViewParser = (
  node: SyntaxNode,
  context: ParseSourceContext
) => ViewNode;

function parseButtonRole(
  call: CallDetails,
  context: ParseSourceContext
): "cancel" | "destructive" | null {
  const roleArgument = call.arguments.find(
    (argument) => argument.label === "role"
  );
  if (!roleArgument) {
    return null;
  }

  const roleName = getLastPathComponent(
    getNavigationPath(roleArgument.value, context)
  );
  if (roleName === "cancel" || roleName === "destructive") {
    return roleName;
  }

  return null;
}

function parseButtonLabelFromClosure(
  lambdaNode: SyntaxNode,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): ViewNode | null {
  const statementsNode = getStatementsNodeFromLambda(lambdaNode);
  const firstViewNode = statementsNode?.namedChildren.find(
    (child) =>
      child.type === "call_expression" || child.type === "if_statement"
  );

  return firstViewNode
    ? parseNestedView(firstViewNode, context)
    : null;
}

function parseButtonLabelFromExplicitClosure(
  call: CallDetails,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): ViewNode | null {
  const labelClosureArgument =
    call.trailingClosureArguments.find(
      (argument) => argument.label === "label"
    ) ??
    call.arguments.find(
      (argument) =>
        argument.label === "label" &&
        argument.value.type === "lambda_literal"
    );
  const labelClosure = labelClosureArgument?.value;
  if (!labelClosure) {
    return null;
  }

  return parseButtonLabelFromClosure(
    labelClosure,
    context,
    parseNestedView
  );
}

function parseButtonLabelFromUnlabeledTrailingClosure(
  call: CallDetails,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): ViewNode | null {
  const labelClosure = call.trailingClosureArguments.find(
    (argument) => argument.label === null
  )?.value;
  if (!labelClosure) {
    return null;
  }

  return parseButtonLabelFromClosure(
    labelClosure,
    context,
    parseNestedView
  );
}

function parseButtonLabelFromString(
  call: CallDetails,
  context: ParseSourceContext
): ViewNode | null {
  const titleArgument = call.arguments.find(
    (argument) => argument.label === null
  );
  if (!titleArgument) {
    return null;
  }

  const parsedString = parseStringLiteral(titleArgument.value, context);
  if (!parsedString) {
    return null;
  }

  return makeText(parsedString.content, parsedString.isDynamic);
}

export function parseButtonCall(
  call: CallDetails,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): ViewNode {
  const label =
    parseButtonLabelFromExplicitClosure(
      call,
      context,
      parseNestedView
    ) ??
    parseButtonLabelFromString(call, context) ??
    parseButtonLabelFromUnlabeledTrailingClosure(
      call,
      context,
      parseNestedView
    ) ??
    makeUnknown("ButtonLabel", getNodeText(call.node, context));

  const button = makeButton(label);
  button.role = parseButtonRole(call, context);

  return withSourceRange(button, call.node);
}
