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

      Spacer(minLength: 12)

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

  it("extracts the visual label from Button multiple trailing closures", async () => {
    const roots = await parseSwiftFile(`
Button {
  login()
} label: {
  Text("Log in")
}
`);
    const root = roots[0];
    if (!root) {
      throw new Error("Expected a parsed button");
    }

    expect(root).toMatchObject({
      kind: "Button",
      label: {
        kind: "Text",
        content: "Log in",
        isDynamic: false,
      },
    });
  });

  it("extracts the visual label from Button(action:label:) closures", async () => {
    const roots = await parseSwiftFile(`
Button(action: {
  login()
}, label: {
  Text("Log in")
})
`);
    const root = roots[0];
    if (!root) {
      throw new Error("Expected a parsed button");
    }

    expect(root).toMatchObject({
      kind: "Button",
      label: {
        kind: "Text",
        content: "Log in",
        isDynamic: false,
      },
    });
  });

  it("extracts overlay, fixedSize, offset, and position modifiers", async () => {
    const roots = await parseSwiftFile(`
import SwiftUI

struct ContentView: View {
  var body: some View {
    VStack {
      Text("Primary")
        .overlay(alignment: .topTrailing) {
          Image(systemName: "star.fill")
        }
        .fixedSize(horizontal: false, vertical: true)
        .offset(x: 12, y: -4)

      Text("Secondary")
        .overlay(Image(systemName: "heart.fill"), alignment: .bottom)
        .position(x: 120, y: 200)
    }
  }
}
`);

    const root = roots[0];
    if (!root || root.kind !== "VStack") {
      throw new Error("Expected VStack root");
    }

    expect(root.children).toHaveLength(2);

    const primary = root.children[0];
    const secondary = root.children[1];

    expect(primary).toMatchObject({
      kind: "Text",
      content: "Primary",
      isDynamic: false,
    });
    if (!primary || primary.kind !== "Text") {
      throw new Error("Expected Text primary child");
    }

    expect(primary.modifiers).toEqual([
      {
        kind: "overlay",
        alignment: "topTrailing",
        content: expect.objectContaining({
          kind: "Image",
          source: {
            kind: "systemName",
            name: "star.fill",
          },
        }),
      },
      {
        kind: "fixedSize",
        horizontal: false,
        vertical: true,
      },
      {
        kind: "offset",
        x: 12,
        y: -4,
      },
    ]);

    expect(secondary).toMatchObject({
      kind: "Text",
      content: "Secondary",
      isDynamic: false,
    });
    if (!secondary || secondary.kind !== "Text") {
      throw new Error("Expected Text secondary child");
    }

    expect(secondary.modifiers).toEqual([
      {
        kind: "overlay",
        alignment: "bottom",
        content: expect.objectContaining({
          kind: "Image",
          source: {
            kind: "systemName",
            name: "heart.fill",
          },
        }),
      },
      {
        kind: "position",
        x: 120,
        y: 200,
      },
    ]);
  });

  it("preserves non-literal if statements as conditional content", async () => {
    const roots = await parseSwiftFile(`
import SwiftUI

struct ContentView: View {
  var body: some View {
    VStack {
      if showDetails {
        Text("Visible")
      } else {
        Text("Hidden")
      }
    }
  }
}
`);
    const root = roots[0];
    if (!root || root.kind !== "VStack") {
      throw new Error("Expected VStack root");
    }

    expect(root.children).toHaveLength(1);
    expect(root.children[0]).toMatchObject({
      kind: "ConditionalContent",
      condition: {
        kind: "binding",
        name: "showDetails",
      },
      children: [
        {
          kind: "Text",
          content: "Visible",
          isDynamic: false,
        },
      ],
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

  it("falls back to UnknownNode for unsupported built-in SwiftUI views", async () => {
    const roots = await parseSwiftFile(`
Picker("Sort", selection: selection) {
  Text("Recent")
}
`);
    const root = roots[0];
    if (!root) {
      throw new Error("Expected a parsed root view");
    }

    expect(root).toMatchObject({
      kind: "UnknownNode",
      rawType: "Picker",
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
