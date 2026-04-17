import { makeText, makeUnknown } from "../../../ir/builders";
import type { ViewNode } from "../../../ir/types";
import {
  getNavigationPath,
  getNodeText,
  parseBooleanLiteral,
  parseNumberLiteral,
  parseStringLiteral,
  withSourceRange,
  type CallDetails,
  type ParseSourceContext,
} from "../shared";

export function parseTextCall(
  call: CallDetails,
  context: ParseSourceContext
): ViewNode {
  const argumentNode = call.arguments[0]?.value ?? null;
  if (!argumentNode) {
    return withSourceRange(
      makeUnknown("Text", getNodeText(call.node, context)),
      call.node
    );
  }

  const parsedLiteral = parseStringLiteral(argumentNode, context);
  if (parsedLiteral) {
    return withSourceRange(
      makeText(parsedLiteral.content, parsedLiteral.isDynamic),
      call.node
    );
  }

  if (
    argumentNode.type === "simple_identifier" ||
    argumentNode.type === "navigation_expression"
  ) {
    return withSourceRange(
      makeText(`\${${getNavigationPath(argumentNode, context)}}`, true),
      call.node
    );
  }

  const parsedNumber = parseNumberLiteral(argumentNode, context);
  if (parsedNumber !== null) {
    return withSourceRange(
      makeText(String(parsedNumber), false),
      call.node
    );
  }

  const parsedBoolean = parseBooleanLiteral(argumentNode, context);
  if (parsedBoolean !== null) {
    return withSourceRange(
      makeText(String(parsedBoolean), false),
      call.node
    );
  }

  return withSourceRange(
    makeUnknown("Text", getNodeText(call.node, context)),
    call.node
  );
}
