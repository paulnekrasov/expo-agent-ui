import type { Node as SyntaxNode } from "web-tree-sitter";
import type * as vscode from "vscode";

import { log, logError } from "../extension/outputChannel";
import { makeGroup, makeUnknown, resetIdCounter } from "../ir/builders";
import type { ViewNode } from "../ir/types";
import { walkDepthFirst } from "./astWalker";
import { parseViewNode, parseViewNodesFromStatements } from "./extractors/views";
import {
  getFirstNamedChildByType,
  getNamedChildrenByType,
  getNodeText,
  getStatementsNodeFromComputedProperty,
  normalizeSwiftSource,
  withSourceRange,
  type ParseSourceContext,
} from "./extractors/shared";
import { getTreeSitterRuntime } from "./treeSitterSetup";

export interface ParseSwiftFileOptions {
  extensionUri?: vscode.Uri;
}

function hasViewInheritance(
  declarationNode: SyntaxNode,
  context: ParseSourceContext
): boolean {
  const inheritanceNode = getFirstNamedChildByType(
    declarationNode,
    "inheritance_specifier"
  );
  if (!inheritanceNode) {
    return false;
  }

  return getNodeText(inheritanceNode, context)
    .split(",")
    .map((segment) => segment.trim())
    .some((segment) => segment.endsWith("View"));
}

function isPreviewableViewDeclaration(
  declarationNode: SyntaxNode,
  context: ParseSourceContext
): boolean {
  const declarationKind = declarationNode.childForFieldName(
    "declaration_kind"
  );
  const kindText = declarationKind
    ? getNodeText(declarationKind, context)
    : "";

  if (kindText !== "struct" && kindText !== "class") {
    return false;
  }

  return hasViewInheritance(declarationNode, context);
}

function isBodyProperty(
  propertyNode: SyntaxNode,
  context: ParseSourceContext
): boolean {
  const nameNode = propertyNode.childForFieldName("name");
  if (!nameNode) {
    return false;
  }

  return getNodeText(nameNode, context) === "body";
}

function parseBodyProperty(
  propertyNode: SyntaxNode,
  context: ParseSourceContext
): ViewNode | null {
  const computedValueNode = propertyNode.childForFieldName(
    "computed_value"
  );
  if (computedValueNode) {
    const children = parseViewNodesFromStatements(
      getStatementsNodeFromComputedProperty(computedValueNode),
      context
    );

    if (children.length === 0) {
      return null;
    }

    if (children.length === 1) {
      return children[0] ?? null;
    }

    return withSourceRange(makeGroup(children), propertyNode);
  }

  const storedValueNode = propertyNode.childForFieldName("value");
  if (
    storedValueNode &&
    (storedValueNode.type === "call_expression" ||
      storedValueNode.type === "if_statement")
  ) {
    return parseViewNode(storedValueNode, context);
  }

  return null;
}

function extractViewDeclarations(
  rootNode: SyntaxNode,
  context: ParseSourceContext
): ViewNode[] {
  const roots: ViewNode[] = [];

  walkDepthFirst(rootNode, {
    class_declaration(node, control): void {
      if (!isPreviewableViewDeclaration(node, context)) {
        return;
      }

      const bodyNode = getFirstNamedChildByType(node, "class_body");
      if (!bodyNode) {
        control.skipChildren();
        return;
      }

      for (const propertyNode of getNamedChildrenByType(
        bodyNode,
        "property_declaration"
      )) {
        if (!isBodyProperty(propertyNode, context)) {
          continue;
        }

        const rootView = parseBodyProperty(propertyNode, context);
        if (rootView) {
          roots.push(rootView);
        }
      }

      control.skipChildren();
    },
  });

  return roots;
}

function extractTopLevelViewExpressions(
  rootNode: SyntaxNode,
  context: ParseSourceContext
): ViewNode[] {
  return rootNode.namedChildren
    .filter(
      (child) =>
        child.type === "call_expression" || child.type === "if_statement"
    )
    .map((child) => parseViewNode(child, context));
}

export async function parseSwiftFile(
  source: string,
  options: ParseSwiftFileOptions = {}
): Promise<ViewNode[]> {
  const normalizedSource = normalizeSwiftSource(source);
  const context: ParseSourceContext = {
    source: normalizedSource,
  };

  resetIdCounter();

  try {
    const { parser } = await getTreeSitterRuntime(options);
    const tree = parser.parse(normalizedSource);

    if (!tree) {
      log("Stage 1 parser returned no syntax tree");
      return [makeUnknown("source_file", normalizedSource)];
    }

    const extractedViews = extractViewDeclarations(
      tree.rootNode,
      context
    );
    if (extractedViews.length > 0) {
      log(`Stage 2 extracted ${extractedViews.length} root view(s)`);
      return extractedViews;
    }

    const topLevelViews = extractTopLevelViewExpressions(
      tree.rootNode,
      context
    );
    if (topLevelViews.length > 0) {
      log(
        `Stage 2 extracted ${topLevelViews.length} top-level view expression(s)`
      );
      return topLevelViews;
    }

    log("Stage 2 extractor found no previewable view roots");
    return [
      withSourceRange(
        makeUnknown(tree.rootNode.type, normalizedSource),
        tree.rootNode
      ),
    ];
  } catch (error) {
    logError("Stage 1/2 parse failed", error);
    return [makeUnknown("source_file", normalizedSource)];
  }
}
