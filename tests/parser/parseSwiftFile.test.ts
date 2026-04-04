import { describe, expect, it, jest } from "@jest/globals";

import { parseSwiftFile } from "../../src/parser";

describe("parseSwiftFile", () => {
  jest.setTimeout(30000);

  it("extracts a Phase 1 SwiftUI root view with ordered modifiers", async () => {
    const source = `
import SwiftUI

struct ContentView: View {
  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      Text("Hello \\(name)")
        .font(.title)
        .foregroundColor(.blue)
        .padding(.horizontal, 16)
        .background(Color.red)
        .cornerRadius(12)
        .opacity(0.8)

      if showDetails {
        Image(systemName: "star")
      } else {
        Spacer(minLength: 12)
      }

      Button("Tap") { }
    }
    .frame(maxWidth: .infinity, minHeight: 44)
    .navigationTitle("Home")
  }
}
`;

    const roots = await parseSwiftFile(source);
    const root = roots[0];
    if (!root) {
      throw new Error("Expected a parsed root view");
    }

    expect(root.kind).toBe("VStack");
    if (root.kind !== "VStack") {
      throw new Error("Expected VStack root");
    }

    expect(root).toMatchObject({
      alignment: "leading",
      spacing: 8,
    });
    expect(root.modifiers.map((modifier) => modifier.kind)).toEqual([
      "frame",
      "navigationTitle",
    ]);
    expect(root.children).toHaveLength(3);
    const firstChild = root.children[0];
    const secondChild = root.children[1];
    const thirdChild = root.children[2];

    expect(firstChild).toMatchObject({
      kind: "Text",
      content: "Hello ${name}",
      isDynamic: true,
    });
    if (firstChild?.kind !== "Text") {
      throw new Error("Expected Text child");
    }

    expect(
      firstChild.modifiers.map((modifier) => modifier.kind)
    ).toEqual([
      "font",
      "foregroundColor",
      "padding",
      "background",
      "cornerRadius",
      "opacity",
    ]);
    expect(secondChild).toMatchObject({
      kind: "Spacer",
      minLength: 12,
    });
    expect(thirdChild).toMatchObject({
      kind: "Button",
      label: {
        kind: "Text",
        content: "Tap",
      },
    });
  });

  it("extracts top-level custom view calls", async () => {
    const roots = await parseSwiftFile(
      'MyCustomRow(title: "Hello", value: 42)'
    );
    const root = roots[0];
    if (!root) {
      throw new Error("Expected a parsed root view");
    }

    if (root.kind !== "CustomViewNode") {
      throw new Error("Expected CustomViewNode");
    }

    expect(root).toMatchObject({
      kind: "CustomViewNode",
      name: "MyCustomRow",
      args: {
        title: "Hello",
        value: 42,
      },
    });
  });

  it("returns UnknownNode when no previewable view exists", async () => {
    const roots = await parseSwiftFile("let value = 42");
    const root = roots[0];
    if (!root) {
      throw new Error("Expected a fallback node");
    }

    expect(root).toMatchObject({
      kind: "UnknownNode",
    });
  });
});
