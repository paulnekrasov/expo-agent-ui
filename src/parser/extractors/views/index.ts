import type { Node as SyntaxNode } from "web-tree-sitter";

import {
  makeConditionalContent,
  makeCustomView,
  makeGroup,
  makeUnknown,
} from "../../../ir/builders";
import type { ConditionExpr, ViewNode } from "../../../ir/types";
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
import {
  parseFormCall,
  parseSecureFieldCall,
  parseTextFieldCall,
  parseToggleCall,
} from "./forms";
import { parseImageCall } from "./image";
import { parseLabelCall } from "./label";
import {
  parseForEachCall,
  parseLazyHGridCall,
  parseLazyVGridCall,
  parseListCall,
  parseSectionCall,
} from "./lists";
import {
  parseNavigationLinkCall,
  parseNavigationStackCall,
} from "./navigation";
import {
  parseGeometryReaderCall,
  parseScrollViewCall,
} from "./scroll";
import { parseSpacerCall } from "./spacer";
import {
  parseHStackCall,
  parseVStackCall,
  parseZStackCall,
} from "./stacks";
import { parseTextCall } from "./text";

const SWIFTUI_BUILTIN_VIEW_NAMES = new Set([
  "AsyncImage",
  "Button",
  "Capsule",
  "Circle",
  "Color",
  "ConfirmationDialog",
  "ContextMenu",
  "DatePicker",
  "Divider",
  "Ellipse",
  "Form",
  "ForEach",
  "GeometryReader",
  "Group",
  "HStack",
  "Image",
  "Label",
  "LazyHGrid",
  "LazyHStack",
  "LazyVGrid",
  "LazyVStack",
  "Link",
  "List",
  "Menu",
  "NavigationLink",
  "NavigationStack",
  "NavigationView",
  "Path",
  "Picker",
  "ProgressView",
  "Rectangle",
  "RoundedRectangle",
  "ScrollView",
  "Section",
  "SecureField",
  "Sheet",
  "Slider",
  "Spacer",
  "Stepper",
  "TabItem",
  "TabView",
  "Text",
  "TextField",
  "Toggle",
  "Toolbar",
  "ToolbarItem",
  "VStack",
  "ZStack",
]);

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

function parseConditionComparisonValue(raw: string): unknown {
  const trimmed = raw.trim();
  if (trimmed === "true") {
    return true;
  }

  if (trimmed === "false") {
    return false;
  }

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  const numeric = Number(trimmed);
  if (Number.isFinite(numeric)) {
    return numeric;
  }

  return trimmed;
}

function parseConditionExpression(
  node: SyntaxNode,
  context: ParseSourceContext
): ConditionExpr {
  const raw = getNodeText(node, context).trim();

  if (node.type === "prefix_expression" && raw.startsWith("!")) {
    const target = node.childForFieldName("target");
    if (target) {
      return {
        kind: "not",
        operand: parseConditionExpression(target, context),
      };
    }
  }

  const navigationPath = getNavigationPath(node, context);
  if (
    node.type === "navigation_expression" &&
    navigationPath.endsWith(".isEmpty")
  ) {
    return {
      kind: "isEmpty",
      binding: navigationPath.slice(0, -".isEmpty".length),
    };
  }

  const comparisonMatch = raw.match(
    /^(.+?)\s*(==|!=|>|<)\s*(.+)$/
  );
  if (comparisonMatch) {
    const left = comparisonMatch[1];
    const op = comparisonMatch[2];
    const right = comparisonMatch[3];
    if (!left || !op || !right) {
      return {
        kind: "binding",
        name: raw,
      };
    }

    return {
      kind: "comparison",
      left: left.trim(),
      op: op as "==" | "!=" | ">" | "<",
      right: parseConditionComparisonValue(right),
    };
  }

  return {
    kind: "binding",
    name: raw,
  };
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

  const thenChildren = parseViewNodesFromStatements(
    statementsNodes[0] ?? null,
    context
  );
  const elseChildren = parseViewNodesFromStatements(
    statementsNodes[1] ?? null,
    context
  );
  const activeChildren =
    literalCondition === false ? elseChildren : thenChildren;
  const condition: ConditionExpr = conditionNode
    ? parseConditionExpression(conditionNode, context)
    : {
        kind: "binding",
        name: getNodeText(node, context),
      };

  return withSourceRange(
    makeConditionalContent(condition, activeChildren),
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
    case "Form":
      return parseFormCall(call, context, parseViewNode);
    case "Image":
      return parseImageCall(call, context);
    case "Label":
      return parseLabelCall(call, context);
    case "List":
      return parseListCall(call, context, parseViewNode);
    case "ForEach":
      return parseForEachCall(call, context, parseViewNode);
    case "LazyVGrid":
      return parseLazyVGridCall(call, context, parseViewNode);
    case "LazyHGrid":
      return parseLazyHGridCall(call, context, parseViewNode);
    case "Section":
      return parseSectionCall(call, context, parseViewNode);
    case "NavigationLink":
      return parseNavigationLinkCall(
        call,
        context,
        parseViewNode
      );
    case "NavigationStack":
      return parseNavigationStackCall(
        call,
        context,
        parseViewNode
      );
    case "ScrollView":
      return parseScrollViewCall(call, context, parseViewNode);
    case "GeometryReader":
      return parseGeometryReaderCall(
        call,
        context,
        parseViewNode
      );
    case "SecureField":
      return parseSecureFieldCall(
        call,
        context,
        parseViewNode
      );
    case "Spacer":
      return parseSpacerCall(call, context);
    case "TextField":
      return parseTextFieldCall(
        call,
        context,
        parseViewNode
      );
    case "Toggle":
      return parseToggleCall(call, context, parseViewNode);
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
    case "Form":
    case "Image":
    case "Label":
    case "List":
    case "ForEach":
    case "LazyVGrid":
    case "LazyHGrid":
    case "Section":
    case "NavigationLink":
    case "NavigationStack":
    case "ScrollView":
    case "GeometryReader":
    case "SecureField":
    case "Spacer":
    case "TextField":
    case "Toggle":
      return parseKnownViewCall(call, context);
    default:
      if (SWIFTUI_BUILTIN_VIEW_NAMES.has(call.calleeName)) {
        return withSourceRange(
          makeUnknown(call.calleeName, getNodeText(call.node, context)),
          call.node
        );
      }

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
