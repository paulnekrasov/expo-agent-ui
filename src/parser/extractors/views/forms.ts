import type { Node as SyntaxNode } from "web-tree-sitter";

import {
  makeForm,
  makeGroup,
  makeSecureField,
  makeText,
  makeTextField,
  makeToggle,
  makeUnknown,
} from "../../../ir/builders";
import type { ViewNode } from "../../../ir/types";
import {
  getNavigationPath,
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

function extractTextContent(view: ViewNode): string | null {
  const childText = (children: ViewNode[]): string | null => {
    const segments = children
      .map((child) => extractTextContent(child))
      .filter((segment): segment is string => Boolean(segment));

    return segments.length > 0 ? segments.join(" ").trim() : null;
  };

  switch (view.kind) {
    case "Text":
      return view.content;
    case "Label":
      return view.title;
    case "Group":
    case "HStack":
    case "VStack":
    case "ZStack":
      return childText(view.children);
    default:
      return null;
  }
}

function parseTextLikeContent(
  node: SyntaxNode,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): string | null {
  const parsedString = parseStringLiteral(node, context);
  if (parsedString) {
    return parsedString.content;
  }

  if (
    node.type === "simple_identifier" ||
    node.type === "navigation_expression"
  ) {
    return `\${${getNavigationPath(node, context)}}`;
  }

  if (
    node.type === "call_expression" ||
    node.type === "lambda_literal" ||
    node.type === "if_statement"
  ) {
    return extractTextContent(
      parseViewLikeNode(node, context, parseNestedView)
    );
  }

  return null;
}

function parseFormChildren(
  call: CallDetails,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): ViewNode[] | null {
  const contentNode =
    findArgument(call.trailingClosureArguments, null)?.value ??
    findArgument(call.arguments, "content")?.value ??
    null;
  if (contentNode?.type !== "lambda_literal") {
    return null;
  }

  return parseViewNodesFromStatements(
    getStatementsNodeFromLambda(contentNode),
    context,
    parseNestedView
  );
}

function parseToggleLabel(
  call: CallDetails,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): ViewNode | null {
  const titleArgument = findArgument(call.arguments, null)?.value ?? null;
  if (titleArgument) {
    const parsedTitle = parseTextLikeContent(
      titleArgument,
      context,
      parseNestedView
    );
    if (parsedTitle) {
      return withSourceRange(
        makeText(
          parsedTitle,
          parsedTitle.includes("${")
        ),
        titleArgument
      );
    }
  }

  const explicitLabelNode =
    findArgument(call.arguments, "label")?.value ??
    findArgument(call.trailingClosureArguments, "label")?.value ??
    findArgument(call.trailingClosureArguments, null)?.value ??
    null;

  return explicitLabelNode
    ? parseViewLikeNode(explicitLabelNode, context, parseNestedView)
    : null;
}

function parseFieldPrompt(
  call: CallDetails,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): string | null {
  const promptNode = findArgument(call.arguments, "prompt")?.value;
  if (!promptNode) {
    return null;
  }

  return parseTextLikeContent(promptNode, context, parseNestedView);
}

function parseFieldLabel(
  call: CallDetails,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): string | null {
  const titleLabel = findArgument(call.arguments, null)?.value;
  if (titleLabel) {
    const parsedTitle = parseTextLikeContent(
      titleLabel,
      context,
      parseNestedView
    );
    if (parsedTitle) {
      return parsedTitle;
    }
  }

  const labelNode =
    findArgument(call.arguments, "label")?.value ??
    findArgument(call.trailingClosureArguments, "label")?.value ??
    findArgument(call.trailingClosureArguments, null)?.value ??
    null;
  if (!labelNode) {
    return null;
  }

  return parseTextLikeContent(labelNode, context, parseNestedView);
}

function parseFieldPlaceholder(
  call: CallDetails,
  label: string,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): string {
  return (
    parseFieldPrompt(call, context, parseNestedView) ?? label
  );
}

export function parseFormCall(
  call: CallDetails,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): ViewNode {
  const children = parseFormChildren(call, context, parseNestedView);
  if (!children) {
    return withSourceRange(
      makeUnknown("Form", getNodeText(call.node, context)),
      call.node
    );
  }

  return withSourceRange(makeForm(children), call.node);
}

export function parseToggleCall(
  call: CallDetails,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): ViewNode {
  const isOnNode = findArgument(call.arguments, "isOn")?.value ?? null;
  const label = parseToggleLabel(call, context, parseNestedView);
  if (!isOnNode || !label) {
    return withSourceRange(
      makeUnknown("Toggle", getNodeText(call.node, context)),
      call.node
    );
  }

  return withSourceRange(makeToggle(label), call.node);
}

export function parseTextFieldCall(
  call: CallDetails,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): ViewNode {
  const textBinding = findArgument(call.arguments, "text")?.value ?? null;
  const label = parseFieldLabel(call, context, parseNestedView);
  if (!textBinding || !label) {
    return withSourceRange(
      makeUnknown("TextField", getNodeText(call.node, context)),
      call.node
    );
  }

  const placeholder = parseFieldPlaceholder(
    call,
    label,
    context,
    parseNestedView
  );

  return withSourceRange(
    makeTextField(label, placeholder),
    call.node
  );
}

export function parseSecureFieldCall(
  call: CallDetails,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): ViewNode {
  const textBinding = findArgument(call.arguments, "text")?.value ?? null;
  const label = parseFieldLabel(call, context, parseNestedView);
  if (!textBinding || !label) {
    return withSourceRange(
      makeUnknown("SecureField", getNodeText(call.node, context)),
      call.node
    );
  }

  const placeholder = parseFieldPlaceholder(
    call,
    label,
    context,
    parseNestedView
  );

  return withSourceRange(
    makeSecureField(label, placeholder),
    call.node
  );
}
