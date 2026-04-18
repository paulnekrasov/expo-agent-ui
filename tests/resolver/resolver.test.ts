import { describe, expect, it } from "@jest/globals";

import { makeText, makeVStack, resetIdCounter } from "../../src/ir/builders";
import type { Modifier, ViewNode } from "../../src/ir/types";
import {
  applyStateStubs,
  flattenModifiers,
  resolveViewTree,
} from "../../src/resolver";

function createSampleTree(): ViewNode[] {
  resetIdCounter();

  const orderedModifiers: Modifier[] = [
    {
      kind: "padding",
      edges: { kind: "horizontal" },
      amount: { kind: "fixed", value: 16 },
    },
    {
      kind: "background",
      content: { kind: "system", name: "blue" },
    },
  ];

  return [
    makeVStack("leading", 8, [
      makeText("Primary", false, orderedModifiers),
      makeText("Secondary"),
    ]),
  ];
}

describe("Stage 3 resolver scaffold", () => {
  it("keeps the default scaffold as a no-op pass-through", () => {
    const nodes = createSampleTree();

    expect(applyStateStubs(nodes)).toBe(nodes);
    expect(flattenModifiers(nodes)).toBe(nodes);
    expect(resolveViewTree(nodes)).toBe(nodes);

    const root = nodes[0];
    if (!root || root.kind !== "VStack") {
      throw new Error("Expected a VStack root");
    }

    const textNode = root.children[0];
    if (!textNode || textNode.kind !== "Text") {
      throw new Error("Expected a Text child");
    }

    expect(textNode.modifiers.map((modifier) => modifier.kind)).toEqual([
      "padding",
      "background",
    ]);
  });

  it("threads the state stubber output into the modifier flattener", () => {
    const nodes = createSampleTree();
    const stageOrder: string[] = [];
    const stubbedNodes = createSampleTree();

    const resolved = resolveViewTree(nodes, {
      stateStubber: (inputNodes) => {
        stageOrder.push("state");
        expect(inputNodes).toBe(nodes);
        return stubbedNodes;
      },
      modifierFlattener: (inputNodes) => {
        stageOrder.push("flatten");
        expect(inputNodes).toBe(stubbedNodes);
        return inputNodes;
      },
      logger: () => undefined,
    });

    expect(stageOrder).toEqual(["state", "flatten"]);
    expect(resolved).toBe(stubbedNodes);
  });

  it("logs and returns the original tree when the state stubber fails", () => {
    const nodes = createSampleTree();
    const messages: string[] = [];

    const resolved = resolveViewTree(nodes, {
      stateStubber: () => {
        throw new Error("state boom");
      },
      logger: (message) => {
        messages.push(message);
      },
    });

    expect(resolved).toBe(nodes);
    expect(messages).toEqual([
      "Stage 3 state stubber failed; returning the original view tree unmodified. state boom",
    ]);
  });

  it("logs and returns the original tree when the modifier flattener fails", () => {
    const nodes = createSampleTree();
    const stubbedNodes = createSampleTree();
    const messages: string[] = [];

    const resolved = resolveViewTree(nodes, {
      stateStubber: () => stubbedNodes,
      modifierFlattener: () => {
        throw new Error("flatten boom");
      },
      logger: (message) => {
        messages.push(message);
      },
    });

    expect(resolved).toBe(nodes);
    expect(messages).toEqual([
      "Stage 3 modifier flattener failed; returning the original view tree unmodified. flatten boom",
    ]);
  });
});
