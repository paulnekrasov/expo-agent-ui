import { makeLabel, makeUnknown } from "../../../ir/builders";
import type { ViewNode } from "../../../ir/types";
import {
  getNavigationPath,
  getNodeText,
  parseStringLiteral,
  withSourceRange,
  type CallDetails,
  type ParseSourceContext,
} from "../shared";

function findArgument(
  call: CallDetails,
  label: string | null
) {
  return call.arguments.find((argument) => argument.label === label);
}

function parseLabelTitle(
  call: CallDetails,
  context: ParseSourceContext
): string | null {
  const titleNode = findArgument(call, null)?.value ?? null;
  if (!titleNode) {
    return null;
  }

  const parsedLiteral = parseStringLiteral(titleNode, context);
  if (parsedLiteral) {
    return parsedLiteral.content;
  }

  if (
    titleNode.type === "simple_identifier" ||
    titleNode.type === "navigation_expression"
  ) {
    return `\${${getNavigationPath(titleNode, context)}}`;
  }

  return null;
}

function parseSystemImageName(
  call: CallDetails,
  context: ParseSourceContext
): string | null {
  const systemImageNode =
    findArgument(call, "systemImage")?.value ?? null;
  if (!systemImageNode) {
    return null;
  }

  const parsedLiteral = parseStringLiteral(systemImageNode, context);
  return parsedLiteral?.content ?? null;
}

export function parseLabelCall(
  call: CallDetails,
  context: ParseSourceContext
): ViewNode {
  const title = parseLabelTitle(call, context);
  const systemImage = parseSystemImageName(call, context);
  if (!title || !systemImage) {
    return withSourceRange(
      makeUnknown("Label", getNodeText(call.node, context)),
      call.node
    );
  }

  return withSourceRange(
    makeLabel(title, systemImage),
    call.node
  );
}
