import { describe, expect, it, jest } from "@jest/globals";

import { parseSwiftFile } from "../../../src/parser";

describe("stack extractors", () => {
  jest.setTimeout(30000);

  it("extracts VStack alignment, spacing, and conditional builder children", async () => {
    const roots = await parseSwiftFile(`
VStack(alignment: .leading, spacing: 12) {
  Text("Title")
  if showDetails {
    Text("Visible")
  } else {
    Text("Hidden")
  }
}
`);
    const root = roots[0];
    if (!root) {
      throw new Error("Expected a parsed VStack");
    }

    expect(root).toMatchObject({
      kind: "VStack",
      alignment: "leading",
      spacing: 12,
      children: [
        {
          kind: "Text",
          content: "Title",
          isDynamic: false,
        },
        {
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
        },
      ],
    });
  });

  it("extracts HStack alignment, spacing, and nested core content children", async () => {
    const roots = await parseSwiftFile(`
HStack(alignment: .bottom, spacing: 6) {
  Image(systemName: "star")
  Spacer(minLength: 10)
  Text("Badge")
}
`);
    const root = roots[0];
    if (!root) {
      throw new Error("Expected a parsed HStack");
    }

    expect(root).toMatchObject({
      kind: "HStack",
      alignment: "bottom",
      spacing: 6,
      children: [
        {
          kind: "Image",
          source: {
            kind: "systemName",
            name: "star",
          },
        },
        {
          kind: "Spacer",
          minLength: 10,
        },
        {
          kind: "Text",
          content: "Badge",
          isDynamic: false,
        },
      ],
    });
  });

  it("extracts ZStack alignment and layered children", async () => {
    const roots = await parseSwiftFile(`
ZStack(alignment: .topLeading) {
  Image("hero")
  Text("Overlay")
}
`);
    const root = roots[0];
    if (!root) {
      throw new Error("Expected a parsed ZStack");
    }

    expect(root).toMatchObject({
      kind: "ZStack",
      alignment: "topLeading",
      children: [
        {
          kind: "Image",
          source: {
            kind: "named",
            name: "hero",
          },
        },
        {
          kind: "Text",
          content: "Overlay",
          isDynamic: false,
        },
      ],
    });
  });
});
