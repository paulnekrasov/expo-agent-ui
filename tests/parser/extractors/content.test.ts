import { describe, expect, it, jest } from "@jest/globals";

import { parseSwiftFile } from "../../../src/parser";

describe("core content extractors", () => {
  jest.setTimeout(30000);

  it("extracts Text navigation expressions as dynamic content", async () => {
    const roots = await parseSwiftFile(`
Text(user.profile.name)
`);
    const root = roots[0];
    if (!root) {
      throw new Error("Expected a parsed Text");
    }

    expect(root).toMatchObject({
      kind: "Text",
      content: "${user.profile.name}",
      isDynamic: true,
    });
  });

  it("extracts Button labeled trailing closures and role metadata", async () => {
    const roots = await parseSwiftFile(`
Button(role: .destructive) {
  archiveItem()
} label: {
  HStack {
    Image(systemName: "tray")
    Text("Archive")
  }
}
`);
    const root = roots[0];
    if (!root) {
      throw new Error("Expected a parsed Button");
    }

    expect(root).toMatchObject({
      kind: "Button",
      role: "destructive",
      label: {
        kind: "HStack",
        children: [
          {
            kind: "Image",
            source: {
              kind: "systemName",
              name: "tray",
            },
          },
          {
            kind: "Text",
            content: "Archive",
            isDynamic: false,
          },
        ],
      },
    });
  });

  it("extracts Image(systemName:) as a system symbol source", async () => {
    const roots = await parseSwiftFile(`
Image(systemName: "bell")
`);
    const root = roots[0];
    if (!root) {
      throw new Error("Expected a parsed Image");
    }

    expect(root).toMatchObject({
      kind: "Image",
      source: {
        kind: "systemName",
        name: "bell",
      },
    });
  });

  it("extracts Image(_:) as a named asset source", async () => {
    const roots = await parseSwiftFile(`
Image("avatar")
`);
    const root = roots[0];
    if (!root) {
      throw new Error("Expected a parsed Image");
    }

    expect(root).toMatchObject({
      kind: "Image",
      source: {
        kind: "named",
        name: "avatar",
      },
    });
  });

  it("extracts Spacer minLength from the canonical argument label", async () => {
    const roots = await parseSwiftFile(`
Spacer(minLength: 24)
`);
    const root = roots[0];
    if (!root) {
      throw new Error("Expected a parsed Spacer");
    }

    expect(root).toMatchObject({
      kind: "Spacer",
      minLength: 24,
    });
  });
});
