import type { Node as SyntaxNode } from "web-tree-sitter";

import {
  makeForEach,
  makeGroup,
  makeList,
  makeSection,
  makeUnknown,
} from "../../../ir/builders";
import type { ViewNode } from "../../../ir/types";
import {
  getNodeText,
  getStatementsNodeFromLambda,
  parseBooleanLiteral,
  parseNumberLiteral,
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

type StaticItemValue = string | number | boolean;

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

function getLambdaParameterName(
  lambdaNode: SyntaxNode,
  context: ParseSourceContext
): string | null {
  const lambdaTypeNode = lambdaNode.childForFieldName("type");
  const parametersNode = lambdaTypeNode?.namedChildren.find(
    (child) => child.type === "lambda_function_type_parameters"
  );
  const lambdaParameterNode = parametersNode?.namedChildren.find(
    (child) => child.type === "lambda_parameter"
  );
  const nameNode =
    lambdaParameterNode?.childForFieldName("name") ?? null;

  return nameNode ? getNodeText(nameNode, context) : null;
}

function parseStaticItemValue(
  node: SyntaxNode,
  context: ParseSourceContext
): StaticItemValue | null {
  const parsedString = parseStringLiteral(node, context);
  if (parsedString && !parsedString.isDynamic) {
    return parsedString.content;
  }

  const parsedNumber = parseNumberLiteral(node, context);
  if (parsedNumber !== null) {
    return parsedNumber;
  }

  const parsedBoolean = parseBooleanLiteral(node, context);
  if (parsedBoolean !== null) {
    return parsedBoolean;
  }

  return null;
}

function parseRangeValues(
  node: SyntaxNode,
  context: ParseSourceContext
): number[] | null {
  const startNode = node.childForFieldName("start");
  const endNode = node.childForFieldName("end");
  if (!startNode || !endNode) {
    return null;
  }

  const start = parseNumberLiteral(startNode, context);
  const end = parseNumberLiteral(endNode, context);
  if (
    start === null ||
    end === null ||
    !Number.isInteger(start) ||
    !Number.isInteger(end)
  ) {
    return null;
  }

  const raw = getNodeText(node, context);
  const lastValue = raw.includes("..<") ? end - 1 : end;
  if (lastValue < start) {
    return [];
  }

  return Array.from(
    { length: lastValue - start + 1 },
    (_, index) => start + index
  );
}

function extractStaticItemValues(
  node: SyntaxNode,
  context: ParseSourceContext
): StaticItemValue[] | null {
  if (node.type === "array_literal") {
    const values: StaticItemValue[] = [];

    for (const child of node.namedChildren) {
      const parsedValue = parseStaticItemValue(child, context);
      if (parsedValue === null) {
        return null;
      }

      values.push(parsedValue);
    }

    return values;
  }

  if (node.type === "range_expression") {
    return parseRangeValues(node, context);
  }

  return null;
}

function substituteStringContent(
  content: string,
  iteratorName: string | null,
  value: StaticItemValue
): {
  content: string;
  isDynamic: boolean;
} {
  if (!iteratorName) {
    return {
      content,
      isDynamic: content.includes("${"),
    };
  }

  const placeholder = `\${${iteratorName}}`;
  const substituted = content.split(placeholder).join(String(value));

  return {
    content: substituted,
    isDynamic: substituted.includes("${"),
  };
}

function substituteCustomArg(
  value: unknown,
  iteratorName: string | null,
  itemValue: StaticItemValue
): unknown {
  if (!iteratorName || typeof value !== "string") {
    return value;
  }

  if (value === iteratorName) {
    return itemValue;
  }

  const placeholder = `\${${iteratorName}}`;
  return value.split(placeholder).join(String(itemValue));
}

function materializeStaticItem(
  node: ViewNode,
  iteratorName: string | null,
  itemValue: StaticItemValue,
  suffix: string
): ViewNode {
  switch (node.kind) {
    case "Text": {
      const substituted = substituteStringContent(
        node.content,
        iteratorName,
        itemValue
      );

      return {
        ...node,
        id: `${node.id}${suffix}`,
        content: substituted.content,
        isDynamic: substituted.isDynamic,
      };
    }
    case "Button":
      return {
        ...node,
        id: `${node.id}${suffix}`,
        label: materializeStaticItem(
          node.label,
          iteratorName,
          itemValue,
          `${suffix}_label`
        ),
      };
    case "VStack":
    case "HStack":
    case "ZStack":
    case "Group":
    case "List":
      return {
        ...node,
        id: `${node.id}${suffix}`,
        children: node.children.map((child, index) =>
          materializeStaticItem(
            child,
            iteratorName,
            itemValue,
            `${suffix}_${index}`
          )
        ),
      };
    case "Section":
      return {
        ...node,
        id: `${node.id}${suffix}`,
        header: node.header
          ? materializeStaticItem(
              node.header,
              iteratorName,
              itemValue,
              `${suffix}_header`
            )
          : null,
        footer: node.footer
          ? materializeStaticItem(
              node.footer,
              iteratorName,
              itemValue,
              `${suffix}_footer`
            )
          : null,
        children: node.children.map((child, index) =>
          materializeStaticItem(
            child,
            iteratorName,
            itemValue,
            `${suffix}_${index}`
          )
        ),
      };
    case "NavigationStack":
      return {
        ...node,
        id: `${node.id}${suffix}`,
        child: materializeStaticItem(
          node.child,
          iteratorName,
          itemValue,
          `${suffix}_child`
        ),
      };
    case "NavigationLink":
      return {
        ...node,
        id: `${node.id}${suffix}`,
        label: materializeStaticItem(
          node.label,
          iteratorName,
          itemValue,
          `${suffix}_label`
        ),
        destination: materializeStaticItem(
          node.destination,
          iteratorName,
          itemValue,
          `${suffix}_destination`
        ),
      };
    case "ConditionalContent":
      return {
        ...node,
        id: `${node.id}${suffix}`,
        children: node.children.map((child, index) =>
          materializeStaticItem(
            child,
            iteratorName,
            itemValue,
            `${suffix}_${index}`
          )
        ),
      };
    case "CustomViewNode":
      return {
        ...node,
        id: `${node.id}${suffix}`,
        args: Object.fromEntries(
          Object.entries(node.args).map(([key, argValue]) => [
            key,
            substituteCustomArg(argValue, iteratorName, itemValue),
          ])
        ),
      };
    default:
      return {
        ...node,
        id: `${node.id}${suffix}`,
      } as ViewNode;
  }
}

function parseForEachNode(
  call: CallDetails,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): ViewNode {
  const dataNode = findArgument(call.arguments, null)?.value ?? null;
  const contentNode =
    findArgument(call.trailingClosureArguments, null)?.value ??
    findArgument(call.arguments, "content")?.value ??
    null;

  if (!dataNode || contentNode?.type !== "lambda_literal") {
    return withSourceRange(
      makeUnknown("ForEach", getNodeText(call.node, context)),
      call.node
    );
  }

  const iteratorName = getLambdaParameterName(contentNode, context);
  const template = parseViewBuilderClosure(
    contentNode,
    context,
    parseNestedView
  );
  const staticValues = extractStaticItemValues(dataNode, context);
  if (staticValues) {
    const staticItems = staticValues.map((value, index) =>
      materializeStaticItem(
        template,
        iteratorName,
        value,
        `__${index}`
      )
    );

    return withSourceRange(
      makeForEach(true, staticItems),
      call.node
    );
  }

  return withSourceRange(
    makeForEach(false, undefined, template),
    call.node
  );
}

export function parseForEachCall(
  call: CallDetails,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): ViewNode {
  return parseForEachNode(call, context, parseNestedView);
}

export function parseListCall(
  call: CallDetails,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): ViewNode {
  const hasDataArgument = findArgument(call.arguments, null) !== undefined;
  if (hasDataArgument) {
    const repeatedRows = parseForEachNode(
      call,
      context,
      parseNestedView
    );

    return withSourceRange(makeList([repeatedRows]), call.node);
  }

  const contentNode =
    findArgument(call.trailingClosureArguments, null)?.value ??
    findArgument(call.arguments, "content")?.value ??
    null;
  if (contentNode?.type !== "lambda_literal") {
    return withSourceRange(
      makeUnknown("List", getNodeText(call.node, context)),
      call.node
    );
  }

  const children = parseViewNodesFromStatements(
    getStatementsNodeFromLambda(contentNode),
    context,
    parseNestedView
  );

  return withSourceRange(makeList(children), call.node);
}

export function parseSectionCall(
  call: CallDetails,
  context: ParseSourceContext,
  parseNestedView: NestedViewParser
): ViewNode {
  const contentNode =
    findArgument(call.trailingClosureArguments, null)?.value ??
    findArgument(call.arguments, "content")?.value ??
    null;
  if (contentNode?.type !== "lambda_literal") {
    return withSourceRange(
      makeUnknown("Section", getNodeText(call.node, context)),
      call.node
    );
  }

  const headerNode =
    findArgument(call.trailingClosureArguments, "header")?.value ??
    findArgument(call.arguments, "header")?.value ??
    null;
  const footerNode =
    findArgument(call.trailingClosureArguments, "footer")?.value ??
    findArgument(call.arguments, "footer")?.value ??
    null;

  const children = parseViewNodesFromStatements(
    getStatementsNodeFromLambda(contentNode),
    context,
    parseNestedView
  );
  const header = headerNode
    ? parseViewLikeNode(headerNode, context, parseNestedView)
    : null;
  const footer = footerNode
    ? parseViewLikeNode(footerNode, context, parseNestedView)
    : null;

  return withSourceRange(
    makeSection(children, header, footer),
    call.node
  );
}
