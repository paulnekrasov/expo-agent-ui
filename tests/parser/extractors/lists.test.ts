import { describe, expect, it, jest } from "@jest/globals";

import { parseSwiftFile } from "../../../src/parser";

describe("list-family extractors", () => {
  jest.setTimeout(30000);

  it("extracts List static content and nested Section rows", async () => {
    const roots = await parseSwiftFile(`
List {
  Text("Inbox")
  Section(header: Text("Pinned"), footer: Text("2 items")) {
    Text("Starred")
    Toggle("Enabled", isOn: binding)
  }
}
`);
    const root = roots[0];
    if (!root) {
      throw new Error("Expected a parsed List");
    }

    expect(root).toMatchObject({
      kind: "List",
      children: [
        {
          kind: "Text",
          content: "Inbox",
          isDynamic: false,
        },
        {
          kind: "Section",
          header: {
            kind: "Text",
            content: "Pinned",
            isDynamic: false,
          },
          footer: {
            kind: "Text",
            content: "2 items",
            isDynamic: false,
          },
          children: [
            {
              kind: "Text",
              content: "Starred",
              isDynamic: false,
            },
            {
              kind: "Toggle",
              isOn: false,
              label: {
                kind: "Text",
                content: "Enabled",
                isDynamic: false,
              },
            },
          ],
        },
      ],
    });
  });

  it("extracts Section multiple trailing closures for content, header, and footer", async () => {
    const roots = await parseSwiftFile(`
Section {
  Text("Row")
} header: {
  Text("Header")
} footer: {
  Text("Footer")
}
`);
    const root = roots[0];
    if (!root) {
      throw new Error("Expected a parsed Section");
    }

    expect(root).toMatchObject({
      kind: "Section",
      header: {
        kind: "Text",
        content: "Header",
        isDynamic: false,
      },
      footer: {
        kind: "Text",
        content: "Footer",
        isDynamic: false,
      },
      children: [
        {
          kind: "Text",
          content: "Row",
          isDynamic: false,
        },
      ],
    });
  });

  it("extracts ForEach over a static literal array into concrete staticItems", async () => {
    const roots = await parseSwiftFile(`
ForEach(["A", "B"], id: \\.self) { item in
  Text(item)
}
`);
    const root = roots[0];
    if (!root) {
      throw new Error("Expected a parsed ForEach");
    }

    expect(root).toMatchObject({
      kind: "ForEach",
      isStatic: true,
      staticItems: [
        {
          kind: "Text",
          content: "A",
          isDynamic: false,
        },
        {
          kind: "Text",
          content: "B",
          isDynamic: false,
        },
      ],
    });
  });

  it("extracts ForEach over a constant range into concrete staticItems", async () => {
    const roots = await parseSwiftFile(`
ForEach(0..<3) { index in
  Text("Row \\(index)")
}
`);
    const root = roots[0];
    if (!root) {
      throw new Error("Expected a parsed ForEach");
    }

    expect(root).toMatchObject({
      kind: "ForEach",
      isStatic: true,
      staticItems: [
        {
          kind: "Text",
          content: "Row 0",
          isDynamic: false,
        },
        {
          kind: "Text",
          content: "Row 1",
          isDynamic: false,
        },
        {
          kind: "Text",
          content: "Row 2",
          isDynamic: false,
        },
      ],
    });
  });

  it("extracts dynamic ForEach into a stubChild template", async () => {
    const roots = await parseSwiftFile(`
ForEach(items, id: \\.self) { item in
  Text(item)
}
`);
    const root = roots[0];
    if (!root) {
      throw new Error("Expected a parsed ForEach");
    }

    expect(root).toMatchObject({
      kind: "ForEach",
      isStatic: false,
      stubChild: {
        kind: "Text",
        content: "${item}",
        isDynamic: true,
      },
    });
  });

  it("extracts List data initializers into a List containing a ForEach child", async () => {
    const roots = await parseSwiftFile(`
List(["A", "B"], id: \\.self) { item in
  HStack {
    Image(systemName: "star")
    Text(item)
  }
}
`);
    const root = roots[0];
    if (!root) {
      throw new Error("Expected a parsed List");
    }

    expect(root).toMatchObject({
      kind: "List",
      children: [
        {
          kind: "ForEach",
          isStatic: true,
          staticItems: [
            {
              kind: "HStack",
              children: [
                {
                  kind: "Image",
                  source: {
                    kind: "systemName",
                    name: "star",
                  },
                },
                {
                  kind: "Text",
                  content: "A",
                  isDynamic: false,
                },
              ],
            },
            {
              kind: "HStack",
              children: [
                {
                  kind: "Image",
                  source: {
                    kind: "systemName",
                    name: "star",
                  },
                },
                {
                  kind: "Text",
                  content: "B",
                  isDynamic: false,
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it("extracts list presentation modifiers on lists and list rows", async () => {
    const roots = await parseSwiftFile(`
List {
  Text("Inbox")
    .font(.body)
    .listRowSeparator(.hidden, edges: .bottom)
    .listRowInsets(EdgeInsets(top: 4, leading: 12, bottom: 6, trailing: 14))
}
.listStyle(.automatic)
.padding(.horizontal, 16)
`);
    const root = roots[0];
    if (!root) {
      throw new Error("Expected a parsed List");
    }

    expect(root).toMatchObject({
      kind: "List",
      modifiers: [
        {
          kind: "listStyle",
          style: "automatic",
        },
        {
          kind: "padding",
          edges: {
            kind: "horizontal",
          },
          amount: {
            kind: "fixed",
            value: 16,
          },
        },
      ],
      children: [
        {
          kind: "Text",
          content: "Inbox",
          isDynamic: false,
          modifiers: [
            {
              kind: "font",
              style: "body",
            },
            {
              kind: "listRowSeparator",
              visibility: "hidden",
            },
            {
              kind: "listRowInsets",
              insets: {
                top: 4,
                leading: 12,
                bottom: 6,
                trailing: 14,
              },
            },
          ],
        },
      ],
    });
  });
});
