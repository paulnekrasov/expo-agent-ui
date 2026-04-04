import type { Node as SyntaxNode } from "web-tree-sitter";

export interface WalkControl {
  skipChildren(): void;
  stop(): void;
}

export type SyntaxVisitor = Partial<
  Record<string, (node: SyntaxNode, control: WalkControl) => void>
> & {
  "*"?:
    | ((node: SyntaxNode, control: WalkControl) => void)
    | undefined;
};

export function walkDepthFirst(
  root: SyntaxNode,
  visitors: SyntaxVisitor
): void {
  let stopped = false;

  const visitNode = (node: SyntaxNode): void => {
    if (stopped) {
      return;
    }

    let skipChildren = false;
    const control: WalkControl = {
      skipChildren(): void {
        skipChildren = true;
      },
      stop(): void {
        stopped = true;
      },
    };

    visitors[node.type]?.(node, control);
    if (stopped) {
      return;
    }

    visitors["*"]?.(node, control);
    if (stopped || skipChildren) {
      return;
    }

    for (const child of node.namedChildren) {
      visitNode(child);
      if (stopped) {
        return;
      }
    }
  };

  visitNode(root);
}
