import { describe, expect, it, jest } from "@jest/globals";

import { parseSwiftFile } from "../../../src/parser";

describe("scroll and geometry extractors", () => {
  jest.setTimeout(30000);

  it("extracts ScrollView with default vertical axis and indicators", async () => {
    const roots = await parseSwiftFile(`
ScrollView {
  Text("Inbox")
}
`);
    const root = roots[0];
    if (!root) {
      throw new Error("Expected a parsed ScrollView");
    }

    expect(root).toMatchObject({
      kind: "ScrollView",
      axes: "vertical",
      showsIndicators: true,
      child: {
        kind: "Text",
        content: "Inbox",
        isDynamic: false,
      },
    });
  });

  it("extracts ScrollView static axes and showsIndicators arguments", async () => {
    const roots = await parseSwiftFile(`
ScrollView([.horizontal, .vertical], showsIndicators: false) {
  Text("Grid")
}
`);
    const root = roots[0];
    if (!root) {
      throw new Error("Expected a parsed ScrollView");
    }

    expect(root).toMatchObject({
      kind: "ScrollView",
      axes: "both",
      showsIndicators: false,
      child: {
        kind: "Text",
        content: "Grid",
        isDynamic: false,
      },
    });
  });

  it("defaults unsupported ScrollView axis expressions safely to vertical", async () => {
    const roots = await parseSwiftFile(`
ScrollView(dynamicAxes, showsIndicators: hiddenValue) {
  Text("Fallback")
}
`);
    const root = roots[0];
    if (!root) {
      throw new Error("Expected a parsed ScrollView");
    }

    expect(root).toMatchObject({
      kind: "ScrollView",
      axes: "vertical",
      showsIndicators: true,
      child: {
        kind: "Text",
        content: "Fallback",
        isDynamic: false,
      },
    });
  });

  it("extracts supported nested Toggle content inside ScrollView", async () => {
    const roots = await parseSwiftFile(`
ScrollView(.horizontal) {
  Toggle("Enabled", isOn: binding)
}
`);
    const root = roots[0];
    if (!root) {
      throw new Error("Expected a parsed ScrollView");
    }

    expect(root).toMatchObject({
      kind: "ScrollView",
      axes: "horizontal",
      showsIndicators: true,
      child: {
        kind: "Toggle",
        isOn: false,
        label: {
          kind: "Text",
          content: "Enabled",
          isDynamic: false,
        },
      },
    });
  });

  it("extracts GeometryReader and ignores the proxy parameter semantics", async () => {
    const roots = await parseSwiftFile(`
GeometryReader { proxy in
  VStack {
    Text("Width")
  }
}
`);
    const root = roots[0];
    if (!root) {
      throw new Error("Expected a parsed GeometryReader");
    }

    expect(root).toMatchObject({
      kind: "GeometryReader",
      child: {
        kind: "VStack",
        children: [
          {
            kind: "Text",
            content: "Width",
            isDynamic: false,
          },
        ],
      },
    });
  });
});
