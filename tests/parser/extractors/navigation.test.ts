import { describe, expect, it, jest } from "@jest/globals";

import { parseSwiftFile } from "../../../src/parser";

describe("navigation extractors", () => {
  jest.setTimeout(30000);

  it("extracts NavigationStack root content and ignores the path argument", async () => {
    const roots = await parseSwiftFile(`
NavigationStack(path: navPath) {
  Text("Inbox")
}
`);
    const root = roots[0];
    if (!root) {
      throw new Error("Expected a parsed NavigationStack");
    }

    expect(root).toMatchObject({
      kind: "NavigationStack",
      child: {
        kind: "Text",
        content: "Inbox",
        isDynamic: false,
      },
    });
  });

  it("extracts NavigationLink(destination:label:) closure arguments", async () => {
    const roots = await parseSwiftFile(`
NavigationLink(destination: {
  VStack {
    Text("Detail")
    Spacer()
  }
}, label: {
  Text("Open")
})
`);
    const root = roots[0];
    if (!root) {
      throw new Error("Expected a parsed NavigationLink");
    }

    expect(root).toMatchObject({
      kind: "NavigationLink",
      destination: {
        kind: "VStack",
        children: [
          {
            kind: "Text",
            content: "Detail",
            isDynamic: false,
          },
          {
            kind: "Spacer",
          },
        ],
      },
      label: {
        kind: "Text",
        content: "Open",
        isDynamic: false,
      },
    });
  });

  it("extracts NavigationLink with destination argument and unlabeled trailing label closure", async () => {
    const roots = await parseSwiftFile(`
NavigationLink(destination: DetailView()) {
  Text("Open")
}
`);
    const root = roots[0];
    if (!root) {
      throw new Error("Expected a parsed NavigationLink");
    }

    expect(root).toMatchObject({
      kind: "NavigationLink",
      destination: {
        kind: "CustomViewNode",
        name: "DetailView",
      },
      label: {
        kind: "Text",
        content: "Open",
        isDynamic: false,
      },
    });
  });

  it("extracts NavigationLink multiple trailing closures with supported Toggle children", async () => {
    const roots = await parseSwiftFile(`
NavigationLink {
  Text("Detail")
  Toggle("Enabled", isOn: binding)
} label: {
  HStack {
    Image(systemName: "star")
    Text("Open")
  }
}
`);
    const root = roots[0];
    if (!root) {
      throw new Error("Expected a parsed NavigationLink");
    }

    expect(root).toMatchObject({
      kind: "NavigationLink",
      destination: {
        kind: "Group",
        children: [
          {
            kind: "Text",
            content: "Detail",
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
      label: {
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
            content: "Open",
            isDynamic: false,
          },
        ],
      },
    });
  });

  it("wraps multiple NavigationStack root children in Group and preserves supported Toggle calls", async () => {
    const roots = await parseSwiftFile(`
NavigationStack {
  Text("Root")
  Toggle("Enabled", isOn: binding)
}
`);
    const root = roots[0];
    if (!root) {
      throw new Error("Expected a parsed NavigationStack");
    }

    expect(root).toMatchObject({
      kind: "NavigationStack",
      child: {
        kind: "Group",
        children: [
          {
            kind: "Text",
            content: "Root",
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
    });
  });
});
