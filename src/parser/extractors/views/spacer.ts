import { makeSpacer } from "../../../ir/builders";
import type { ViewNode } from "../../../ir/types";
import {
  parseNumberLiteral,
  withSourceRange,
  type CallDetails,
  type ParseSourceContext,
} from "../shared";

export function parseSpacerCall(
  call: CallDetails,
  context: ParseSourceContext
): ViewNode {
  const labeledArgument = call.arguments.find(
    (argument) => argument.label === "minLength"
  );
  const fallbackArgument = call.arguments[0];
  const candidateNode =
    labeledArgument?.value ?? fallbackArgument?.value ?? null;

  const minLength = candidateNode
    ? parseNumberLiteral(candidateNode, context)
    : null;

  return withSourceRange(makeSpacer(minLength), call.node);
}
