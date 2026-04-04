import { makeImage, makeUnknown } from "../../../ir/builders";
import type { ViewNode } from "../../../ir/types";
import {
  getNodeText,
  parseStringLiteral,
  withSourceRange,
  type CallDetails,
  type ParseSourceContext,
} from "../shared";

export function parseImageCall(
  call: CallDetails,
  context: ParseSourceContext
): ViewNode {
  const argumentNode = call.arguments[0]?.value ?? null;
  if (!argumentNode) {
    return withSourceRange(
      makeUnknown("Image", getNodeText(call.node, context)),
      call.node
    );
  }

  const parsedLiteral = parseStringLiteral(argumentNode, context);
  if (!parsedLiteral) {
    return withSourceRange(
      makeUnknown("Image", getNodeText(call.node, context)),
      call.node
    );
  }

  const firstArgumentLabel = call.arguments[0]?.label ?? null;
  if (firstArgumentLabel === "systemName") {
    return withSourceRange(
      makeImage({
        kind: "systemName",
        name: parsedLiteral.content,
      }),
      call.node
    );
  }

  return withSourceRange(
    makeImage({
      kind: "named",
      name: parsedLiteral.content,
    }),
    call.node
  );
}
