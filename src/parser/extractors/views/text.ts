import { makeText, makeUnknown } from "../../../ir/builders";
import type { ViewNode } from "../../../ir/types";
import {
  getNodeText,
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
  if (!parsedLiteral) {
    return withSourceRange(
      makeUnknown("Text", getNodeText(call.node, context)),
      call.node
    );
  }

  return withSourceRange(
    makeText(parsedLiteral.content, parsedLiteral.isDynamic),
    call.node
  );
}
