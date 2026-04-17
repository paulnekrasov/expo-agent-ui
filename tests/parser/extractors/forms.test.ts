import { describe, expect, it, jest } from "@jest/globals";

import { parseSwiftFile } from "../../../src/parser";

describe("form and control extractors", () => {
  jest.setTimeout(30000);

  it("extracts Form container children through the Stage 2 recursive view pipeline", async () => {
    const roots = await parseSwiftFile(`
Form {
  Toggle("Enabled", isOn: binding)
  TextField("Email", text: username)
  SecureField("Password", text: password)
}
`);
    const root = roots[0];
    if (!root) {
      throw new Error("Expected a parsed Form");
    }

    expect(root).toMatchObject({
      kind: "Form",
      children: [
        {
          kind: "Toggle",
          isOn: false,
          label: {
            kind: "Text",
            content: "Enabled",
            isDynamic: false,
          },
        },
        {
          kind: "TextField",
          label: "Email",
          placeholder: "Email",
          style: "roundedBorder",
        },
        {
          kind: "SecureField",
          label: "Password",
          placeholder: "Password",
        },
      ],
    });
  });

  it("extracts Toggle builder labels from the canonical isOn + trailing closure form", async () => {
    const roots = await parseSwiftFile(`
Toggle(isOn: binding) {
  Text("Notifications")
}
`);
    const root = roots[0];
    if (!root) {
      throw new Error("Expected a parsed Toggle");
    }

    expect(root).toMatchObject({
      kind: "Toggle",
      isOn: false,
      label: {
        kind: "Text",
        content: "Notifications",
        isDynamic: false,
      },
    });
  });

  it("extracts TextField builder labels and prompt placeholders", async () => {
    const roots = await parseSwiftFile(`
TextField(text: username, prompt: Text("Required")) {
  Text("Email")
}
`);
    const root = roots[0];
    if (!root) {
      throw new Error("Expected a parsed TextField");
    }

    expect(root).toMatchObject({
      kind: "TextField",
      label: "Email",
      placeholder: "Required",
      style: "roundedBorder",
    });
  });

  it("extracts SecureField builder labels and prompt placeholders", async () => {
    const roots = await parseSwiftFile(`
SecureField(text: password, prompt: Text("Required")) {
  Text("Password")
}
`);
    const root = roots[0];
    if (!root) {
      throw new Error("Expected a parsed SecureField");
    }

    expect(root).toMatchObject({
      kind: "SecureField",
      label: "Password",
      placeholder: "Required",
    });
  });

  it("extracts Toggle labels built from Label(systemImage:)", async () => {
    const roots = await parseSwiftFile(`
Toggle(isOn: binding) {
  Label("Notifications", systemImage: "bell")
}
`);
    const root = roots[0];
    if (!root) {
      throw new Error("Expected a parsed Toggle");
    }

    expect(root).toMatchObject({
      kind: "Toggle",
      isOn: false,
      label: {
        kind: "Label",
        title: "Notifications",
        systemImage: "bell",
      },
    });
  });

  it("extracts TextField builder labels from canonical non-Text label views", async () => {
    const roots = await parseSwiftFile(`
TextField(text: username, prompt: Text("Required")) {
  HStack {
    Image(systemName: "envelope")
    Text("Email")
  }
}
`);
    const root = roots[0];
    if (!root) {
      throw new Error("Expected a parsed TextField");
    }

    expect(root).toMatchObject({
      kind: "TextField",
      label: "Email",
      placeholder: "Required",
      style: "roundedBorder",
    });
  });

  it("extracts SecureField builder labels from Label(systemImage:)", async () => {
    const roots = await parseSwiftFile(`
SecureField(text: password, prompt: Text("Required")) {
  Label("Password", systemImage: "lock")
}
`);
    const root = roots[0];
    if (!root) {
      throw new Error("Expected a parsed SecureField");
    }

    expect(root).toMatchObject({
      kind: "SecureField",
      label: "Password",
      placeholder: "Required",
    });
  });
});
