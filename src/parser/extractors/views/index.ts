import type { Node as SyntaxNode } from "web-tree-sitter";

import {
  makeCustomView,
  makeGroup,
  makeUnknown,
} from "../../../ir/builders";
import type { ViewNode } from "../../../ir/types";
import { parseCoreModifier } from "../modifiers/coreModifiers";
import {
  getLastPathComponent,
  getNavigationPath,
  getNodeText,
  getStatementsNodeFromLambda,
  parseBooleanLiteral,
  parseCallDetails,
  parseNumberLiteral,
  parseStringLiteral,
  withSourceRange,
  type CallDetails,
  type ParseSourceContext,
  type PendingModifier,
} from "../shared";
import { parseButtonCall } from "./button";
import { parseImageCall } from "./image";
import { parseSpacerCall } from "./spacer";
import {
  parseHStackCall,
  parseVStackCall,
  parseZStackCall,
} from "./stacks";
import { parseTextCall } from "./text";

function isModifierCall(
  call: CallDetails
): call is CallDetails & {
  callee: SyntaxNode;
} {
  if (call.callee.type !== "navigation_expression") {
    return false;
  }

  const target = call.callee.childForFieldName("target");
  return target?.type === "call_expression";
}

function unwindModifierChain(
  node: SyntaxNode,
  context: ParseSourceContext
): {
  baseCall: SyntaxNode;
  modifiers: PendingModifier[];
} {
  const pendingModifiers: PendingModifier[] = [];
  let currentNode = node;

  while (currentNode.type === "call_expression") {
    const call = parseCallDetails(currentNode, context);
    if (!isModifierCall(call)) {
      break;
    }

    const targetNode = call.callee.childForFieldName("target");
    const suffixNode = call.callee.childForFieldName("suffix");
    if (!targetNode || !suffixNode) {
      break;
    }

    pendingModifiers.push({
      name: getLastPathComponent(
        getNavigationPath(suffixNode, context)
      ),
      call,
      node: currentNode,
    });

    currentNode = targetNode;
  }

  pendingModifiers.reverse();
  return {
    baseCall: currentNode,
    modifiers: pendingModifiers,
  };
}

function applyModifiers(
  view: ViewNode,
  modifiers: PendingModifier[],
  context: ParseSourceContext
): ViewNode {
  if (modifiers.length === 0) {
    return view;
  }

  const parsedModifiers = modifiers.map((modifier) =>
    parseCoreModifier(
      modifier.name,
      modifier.call,
      context,
      parseViewNode
    )
  );

  return {
    ...view,
    modifiers: [...view.modifiers, ...parsedModifiers],
  };
}

function parsePrimitiveArgument(
  node: SyntaxNode,
  context: ParseSourceContext
): unknown {
  const parsedString = parseStringLiteral(node, context);
  if (parsedString) {
    return parsedString.content;
  }

  const numeric = parseNumberLiteral(node, context);
  if (numeric !== null) {
    return numeric;
  }

  const booleanValue = parseBooleanLiteral(node, context);
  if (booleanValue !== null) {
    return booleanValue;
  }

  return getNodeText(node, context);
}

function parseCustomViewCall(
  call: CallDetails,
  context: ParseSourceContext
): ViewNode {
  const args: Record<string, unknown> = {};

  call.arguments.forEach((argument, index) => {
    const key = argument.label ?? `arg${index}`;
    args[key] = parsePrimitiveArgument(argument.value, context);
  });

  return withSourceRange(
    makeCustomView(call.calleeName, args),
    call.node
  );
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

function parseIfStatement(
  node: SyntaxNode,
  context: ParseSourceContext
): ViewNode {
  const conditionNode = node.childForFieldName("condition");
  const statementsNodes = node.namedChildren.filter(
    (child) => child.type === "statements"
  );

  const literalCondition = conditionNode
    ? parseBooleanLiteral(conditionNode, context)
    : null;

  if (literalCondition === true) {
    return wrapBuilderChildren(
      parseViewNodesFromStatements(
        statementsNodes[0] ?? null,
        context
      ),
      node
    );
  }

  if (literalCondition === false) {
    return wrapBuilderChildren(
      parseViewNodesFromStatements(
        statementsNodes[1] ?? null,
        context
      ),
      node
    );
  }

  return wrapBuilderChildren(
    parseViewNodesFromStatements(
      statementsNodes[1] ?? null,
      context
    ),
    node
  );
}

function parseKnownViewCall(
  call: CallDetails,
  context: ParseSourceContext
): ViewNode {
  switch (call.calleeName) {
    case "VStack":
      return parseVStackCall(call, context, parseViewNode);
    case "HStack":
      return parseHStackCall(call, context, parseViewNode);
    case "ZStack":
      return parseZStackCall(call, context, parseViewNode);
    case "Text":
      return parseTextCall(call, context);
    case "Button":
      return parseButtonCall(call, context, parseViewNode);
    case "Image":
      return parseImageCall(call, context);
    case "Spacer":
      return parseSpacerCall(call, context);
    default:
      return withSourceRange(
        makeUnknown(call.calleeName, getNodeText(call.node, context)),
        call.node
      );
  }
}

function looksLikeCustomView(name: string): boolean {
  return /^[A-Z]/.test(name);
}

function parseBaseCall(
  call: CallDetails,
  context: ParseSourceContext
): ViewNode {
  switch (call.calleeName) {
    case "VStack":
    case "HStack":
    case "ZStack":
    case "Text":
    case "Button":
    case "Image":
    case "Spacer":
      return parseKnownViewCall(call, context);
    default:
      if (looksLikeCustomView(call.calleeName)) {
        return parseCustomViewCall(call, context);
      }

      return withSourceRange(
        makeUnknown(call.calleeName, getNodeText(call.node, context)),
        call.node
      );
  }
}

function parseCallExpression(
  node: SyntaxNode,
  context: ParseSourceContext
): ViewNode {
  const { baseCall, modifiers } = unwindModifierChain(node, context);
  const call = parseCallDetails(baseCall, context);
  const baseView = parseBaseCall(call, context);
  return applyModifiers(baseView, modifiers, context);
}

export function parseViewNode(
  node: SyntaxNode,
  context: ParseSourceContext
): ViewNode {
  try {
    switch (node.type) {
      case "call_expression":
        return parseCallExpression(node, context);
      case "if_statement":
        return parseIfStatement(node, context);
      default:
        return withSourceRange(
          makeUnknown(node.type, getNodeText(node, context)),
          node
        );
    }
  } catch {
    return withSourceRange(
      makeUnknown(node.type, getNodeText(node, context)),
      node
    );
  }
}

export function parseViewNodesFromStatements(
  statementsNode: SyntaxNode | null,
  context: ParseSourceContext
): ViewNode[] {
  if (!statementsNode) {
    return [];
  }

  return statementsNode.namedChildren
    .filter(
      (child) =>
        child.type === "call_expression" || child.type === "if_statement"
    )
    .map((child) => parseViewNode(child, context));
}

export function parseViewBuilderBody(
  lambdaNode: SyntaxNode,
  context: ParseSourceContext
): ViewNode[] {
  return parseViewNodesFromStatements(
    getStatementsNodeFromLambda(lambdaNode),
    context
  );
}
