import { render } from "@testing-library/react-native";
import React from "react";
import {
  agentUISwiftUIAdapter,
  createAgentUISwiftUIButton,
  createAgentUISwiftUIToggle,
  createAgentUISwiftUITextField,
  createAgentUISwiftUISecureField,
  createAgentUISwiftUISlider,
  createAgentUISwiftUIPicker,
  agentUIComposeAdapter,
  createAgentUIComposeButton,
  createAgentUIComposeSwitch,
  createAgentUIComposeTextField,
  createAgentUIComposeSlider,
  listAgentUINativeAdapters,
  resolveAgentUINativeAdapter,
} from "@agent-ui/core";

// ---------------------------------------------------------------------------
// SwiftUI Adapter
// ---------------------------------------------------------------------------

describe("agentUISwiftUIAdapter", () => {
  it("has tier 2", () => {
    expect(agentUISwiftUIAdapter.tier).toBe(2);
  });

  it('has platform "ios"', () => {
    expect(agentUISwiftUIAdapter.platform).toBe("ios");
  });

  it("has name containing SwiftUI", () => {
    expect(agentUISwiftUIAdapter.name).toContain("SwiftUI");
  });

  it("has capabilities with all expected keys as boolean values", () => {
    const caps = agentUISwiftUIAdapter.capabilities;

    expect(caps.button).toBe(false);
    expect(caps.toggle).toBe(false);
    expect(caps.textField).toBe(false);
    expect(caps.secureField).toBe(false);
    expect(caps.slider).toBe(false);
    expect(caps.picker).toBe(false);
    expect(caps.host).toBe(false);
    expect(caps.rnHostView).toBe(false);
    expect(caps.list).toBe(false);
    expect(caps.form).toBe(false);
    expect(caps.section).toBe(false);
    expect(caps.bottomSheet).toBe(false);
    expect(caps.popover).toBe(false);
    expect(caps.menu).toBe(false);
  });

  it("isAvailable() returns false in test environment", () => {
    const { refreshAgentUISwiftUIAdapter } = require("@agent-ui/core");
    refreshAgentUISwiftUIAdapter();
    expect(agentUISwiftUIAdapter.isAvailable()).toBe(false);
  });

  it("requiresHost is true", () => {
    expect(agentUISwiftUIAdapter.requiresHost).toBe(true);
  });
});

describe("createAgentUISwiftUIButton", () => {
  it("returns a valid React functional component", () => {
    const Component = createAgentUISwiftUIButton();

    expect(typeof Component).toBe("object");
  });

  it("renders without crashing (RN fallback)", () => {
    const ButtonComponent = createAgentUISwiftUIButton();
    const element = React.createElement(ButtonComponent, {
      id: "swiftui-btn",
      label: "Press",
    });

    expect(() => render(element)).not.toThrow();
  });

  it("passes testID to the rendered element", () => {
    const ButtonComponent = createAgentUISwiftUIButton();
    const { getByTestId } = render(
      React.createElement(ButtonComponent, {
        id: "swiftui-btn",
        label: "Click",
      }),
    );

    expect(getByTestId("swiftui-btn")).toBeTruthy();
  });
});

describe("createAgentUISwiftUIToggle", () => {
  it("renders without crashing (RN fallback)", () => {
    const ToggleComponent = createAgentUISwiftUIToggle();
    const element = React.createElement(ToggleComponent, {
      id: "swiftui-toggle",
      checked: false,
      label: "Notifications",
    });

    expect(() => render(element)).not.toThrow();
  });
});

describe("createAgentUISwiftUITextField", () => {
  it("renders without crashing (RN fallback)", () => {
    const TextFieldComponent = createAgentUISwiftUITextField();
    const element = React.createElement(TextFieldComponent, {
      id: "swiftui-textfield",
      placeholder: "Enter text",
    });

    expect(() => render(element)).not.toThrow();
  });

  it("passes testID to the rendered element", () => {
    const TextFieldComponent = createAgentUISwiftUITextField();
    const { getByTestId } = render(
      React.createElement(TextFieldComponent, {
        id: "swiftui-textfield",
        placeholder: "Email",
      }),
    );

    expect(getByTestId("swiftui-textfield")).toBeTruthy();
  });
});

describe("createAgentUISwiftUISecureField", () => {
  it("renders without crashing (RN fallback)", () => {
    const SecureFieldComponent = createAgentUISwiftUISecureField();
    const element = React.createElement(SecureFieldComponent, {
      id: "swiftui-secure",
      placeholder: "Password",
    });

    expect(() => render(element)).not.toThrow();
  });

  it("passes testID to the rendered element", () => {
    const SecureFieldComponent = createAgentUISwiftUISecureField();
    const { getByTestId } = render(
      React.createElement(SecureFieldComponent, {
        id: "swiftui-secure",
        placeholder: "PIN",
      }),
    );

    expect(getByTestId("swiftui-secure")).toBeTruthy();
  });
});

describe("createAgentUISwiftUISlider", () => {
  it("renders without crashing (RN fallback)", () => {
    const SliderComponent = createAgentUISwiftUISlider();
    const element = React.createElement(SliderComponent, {
      id: "swiftui-slider",
      value: 0.5,
    });

    expect(() => render(element)).not.toThrow();
  });

  it("passes testID to the rendered element", () => {
    const SliderComponent = createAgentUISwiftUISlider();
    const { getByTestId } = render(
      React.createElement(SliderComponent, {
        id: "swiftui-slider",
        value: 0.3,
      }),
    );

    expect(getByTestId("swiftui-slider")).toBeTruthy();
  });
});

describe("createAgentUISwiftUIPicker", () => {
  it("renders without crashing (RN fallback)", () => {
    const PickerComponent = createAgentUISwiftUIPicker();
    const element = React.createElement(PickerComponent, {
      id: "swiftui-picker",
      options: [
        { label: "Red", value: "red" },
        { label: "Green", value: "green" },
      ],
    });

    expect(() => render(element)).not.toThrow();
  });

  it("passes testID to the rendered element", () => {
    const PickerComponent = createAgentUISwiftUIPicker();
    const { getByTestId } = render(
      React.createElement(PickerComponent, {
        id: "swiftui-picker",
        options: [{ label: "Blue", value: "blue" }],
      }),
    );

    expect(getByTestId("swiftui-picker")).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Compose Adapter
// ---------------------------------------------------------------------------

describe("agentUIComposeAdapter", () => {
  it("has tier 3", () => {
    expect(agentUIComposeAdapter.tier).toBe(3);
  });

  it('has platform "android"', () => {
    expect(agentUIComposeAdapter.platform).toBe("android");
  });

  it("has name containing Compose", () => {
    expect(agentUIComposeAdapter.name).toContain("Compose");
  });

  it("has capabilities with all expected keys as boolean values", () => {
    const caps = agentUIComposeAdapter.capabilities;

    expect(caps.button).toBe(false);
    expect(caps.switchControl).toBe(false);
    expect(caps.slider).toBe(false);
    expect(caps.textField).toBe(false);
  });

  it("isAvailable() returns false in test environment", () => {
    const { refreshAgentUIComposeAdapter } = require("@agent-ui/core");
    refreshAgentUIComposeAdapter();
    expect(agentUIComposeAdapter.isAvailable()).toBe(false);
  });

  it("requiresHost is true", () => {
    expect(agentUIComposeAdapter.requiresHost).toBe(true);
  });
});

describe("createAgentUIComposeButton", () => {
  it("returns a valid React functional component", () => {
    const Component = createAgentUIComposeButton();

    expect(typeof Component).toBe("object");
  });

  it("renders without crashing (RN fallback)", () => {
    const ButtonComponent = createAgentUIComposeButton();
    const element = React.createElement(ButtonComponent, {
      id: "compose-btn",
      label: "Press",
    });

    expect(() => render(element)).not.toThrow();
  });

  it("passes testID to the rendered element", () => {
    const ButtonComponent = createAgentUIComposeButton();
    const { getByTestId } = render(
      React.createElement(ButtonComponent, {
        id: "compose-btn",
        label: "Tap",
      }),
    );

    expect(getByTestId("compose-btn")).toBeTruthy();
  });
});

describe("createAgentUIComposeSwitch", () => {
  it("renders without crashing (RN fallback)", () => {
    const SwitchComponent = createAgentUIComposeSwitch();
    const element = React.createElement(SwitchComponent, {
      id: "compose-switch",
      checked: false,
      label: "Wi-Fi",
    });

    expect(() => render(element)).not.toThrow();
  });
});

describe("createAgentUIComposeTextField", () => {
  it("renders without crashing (RN fallback)", () => {
    const TextFieldComponent = createAgentUIComposeTextField();
    const element = React.createElement(TextFieldComponent, {
      id: "compose-textfield",
      placeholder: "Type here",
    });

    expect(() => render(element)).not.toThrow();
  });

  it("passes testID to the rendered element", () => {
    const TextFieldComponent = createAgentUIComposeTextField();
    const { getByTestId } = render(
      React.createElement(TextFieldComponent, {
        id: "compose-textfield",
        placeholder: "Search",
      }),
    );

    expect(getByTestId("compose-textfield")).toBeTruthy();
  });
});

describe("createAgentUIComposeSlider", () => {
  it("renders without crashing (RN fallback)", () => {
    const SliderComponent = createAgentUIComposeSlider();
    const element = React.createElement(SliderComponent, {
      id: "compose-slider",
      value: 0.7,
    });

    expect(() => render(element)).not.toThrow();
  });

  it("passes testID to the rendered element", () => {
    const SliderComponent = createAgentUIComposeSlider();
    const { getByTestId } = render(
      React.createElement(SliderComponent, {
        id: "compose-slider",
        value: 0.5,
      }),
    );

    expect(getByTestId("compose-slider")).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Native Adapters Registry
// ---------------------------------------------------------------------------

describe("agentUINativeAdapters", () => {
  const adapters = [agentUISwiftUIAdapter, agentUIComposeAdapter];

  it("contains exactly 2 entries (SwiftUI + Compose)", () => {
    expect(adapters).toHaveLength(2);
  });

  it("first entry is SwiftUI adapter (tier 2)", () => {
    expect(adapters[0]!.tier).toBe(2);
    expect(adapters[0]!.platform).toBe("ios");
  });

  it("second entry is Compose adapter (tier 3)", () => {
    expect(adapters[1]!.tier).toBe(3);
    expect(adapters[1]!.platform).toBe("android");
  });

  it("both adapters have platform-specific platforms (not cross)", () => {
    for (const adapter of adapters) {
      expect(adapter.platform).not.toBe("cross");
    }
  });

  it("adapter capabilities objects have no shared mutable references", () => {
    const swiftUICaps = agentUISwiftUIAdapter.capabilities;
    const composeCaps = agentUIComposeAdapter.capabilities;

    expect(swiftUICaps).not.toBe(composeCaps);
  });
});

describe("listAgentUINativeAdapters", () => {
  it("returns both adapters when called without platform filter", () => {
    const adapters = listAgentUINativeAdapters();

    expect(adapters).toHaveLength(2);
    expect(adapters[0]!.tier).toBe(2);
    expect(adapters[1]!.tier).toBe(3);
  });

  it("returns SwiftUI adapter when platform is ios", () => {
    const adapters = listAgentUINativeAdapters({ platform: "ios" });

    expect(adapters).toHaveLength(1);
    expect(adapters[0]!.tier).toBe(2);
    expect(adapters[0]!.platform).toBe("ios");
  });

  it("returns Compose adapter when platform is android", () => {
    const adapters = listAgentUINativeAdapters({ platform: "android" });

    expect(adapters).toHaveLength(1);
    expect(adapters[0]!.tier).toBe(3);
    expect(adapters[0]!.platform).toBe("android");
  });
});

describe("resolveAgentUINativeAdapter", () => {
  it('returns SwiftUI adapter for platform "ios"', () => {
    const adapter = resolveAgentUINativeAdapter("ios");

    expect(adapter.tier).toBe(2);
    expect(adapter.platform).toBe("ios");
    expect(adapter.name).toContain("SwiftUI");
  });

  it('returns Compose adapter for platform "android"', () => {
    const adapter = resolveAgentUINativeAdapter("android");

    expect(adapter.tier).toBe(3);
    expect(adapter.platform).toBe("android");
    expect(adapter.name).toContain("Compose");
  });
});

// ---------------------------------------------------------------------------
// Native Module Detection — SwiftUI
// ---------------------------------------------------------------------------

describe("detectAgentUISwiftUINativeModule", () => {
  it("returns boolean", () => {
    const { detectAgentUISwiftUINativeModule } = require("@agent-ui/core");
    const result = detectAgentUISwiftUINativeModule();
    expect(typeof result).toBe("boolean");
  });

  it("returns false in Jest test environment (no @expo/ui installed)", () => {
    const { detectAgentUISwiftUINativeModule } = require("@agent-ui/core");
    expect(detectAgentUISwiftUINativeModule()).toBe(false);
  });

  it("does not throw when called repeatedly", () => {
    const { detectAgentUISwiftUINativeModule } = require("@agent-ui/core");
    expect(() => {
      detectAgentUISwiftUINativeModule();
      detectAgentUISwiftUINativeModule();
      detectAgentUISwiftUINativeModule();
    }).not.toThrow();
  });

  it("returns the same cached result on repeated calls", () => {
    const { detectAgentUISwiftUINativeModule } = require("@agent-ui/core");
    const first = detectAgentUISwiftUINativeModule();
    const second = detectAgentUISwiftUINativeModule();
    expect(second).toBe(first);
  });
});

// ---------------------------------------------------------------------------
// Native Module Detection — Compose
// ---------------------------------------------------------------------------

describe("detectAgentUIComposeNativeModule", () => {
  it("returns boolean", () => {
    const { detectAgentUIComposeNativeModule } = require("@agent-ui/core");
    const result = detectAgentUIComposeNativeModule();
    expect(typeof result).toBe("boolean");
  });

  it("returns false in Jest test environment (no @expo/ui installed)", () => {
    const { detectAgentUIComposeNativeModule } = require("@agent-ui/core");
    expect(detectAgentUIComposeNativeModule()).toBe(false);
  });

  it("does not throw when called repeatedly", () => {
    const { detectAgentUIComposeNativeModule } = require("@agent-ui/core");
    expect(() => {
      detectAgentUIComposeNativeModule();
      detectAgentUIComposeNativeModule();
      detectAgentUIComposeNativeModule();
    }).not.toThrow();
  });

  it("returns the same cached result on repeated calls", () => {
    const { detectAgentUIComposeNativeModule } = require("@agent-ui/core");
    const first = detectAgentUIComposeNativeModule();
    const second = detectAgentUIComposeNativeModule();
    expect(second).toBe(first);
  });
});

// ---------------------------------------------------------------------------
// Adapter Refresh
// ---------------------------------------------------------------------------

describe("refreshAgentUISwiftUIAdapter", () => {
  it("exists as a function", () => {
    const { refreshAgentUISwiftUIAdapter } = require("@agent-ui/core");
    expect(typeof refreshAgentUISwiftUIAdapter).toBe("function");
  });

  it("resets detection state so next detection re-runs", () => {
    const {
      detectAgentUISwiftUINativeModule,
      refreshAgentUISwiftUIAdapter,
    } = require("@agent-ui/core");
    const before = detectAgentUISwiftUINativeModule();
    refreshAgentUISwiftUIAdapter();
    const after = detectAgentUISwiftUINativeModule();
    expect(after).toBe(before);
  });

  it("does not throw", () => {
    const { refreshAgentUISwiftUIAdapter } = require("@agent-ui/core");
    expect(() => {
      refreshAgentUISwiftUIAdapter();
      refreshAgentUISwiftUIAdapter();
    }).not.toThrow();
  });
});

describe("refreshAgentUIComposeAdapter", () => {
  it("exists as a function", () => {
    const { refreshAgentUIComposeAdapter } = require("@agent-ui/core");
    expect(typeof refreshAgentUIComposeAdapter).toBe("function");
  });

  it("resets detection state", () => {
    const {
      detectAgentUIComposeNativeModule,
      refreshAgentUIComposeAdapter,
    } = require("@agent-ui/core");
    const before = detectAgentUIComposeNativeModule();
    refreshAgentUIComposeAdapter();
    const after = detectAgentUIComposeNativeModule();
    expect(after).toBe(before);
  });

  it("does not throw", () => {
    const { refreshAgentUIComposeAdapter } = require("@agent-ui/core");
    expect(() => {
      refreshAgentUIComposeAdapter();
    }).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// isAvailable() wired to detection
// ---------------------------------------------------------------------------

describe("isAvailable() uses detection", () => {
  it("agentUISwiftUIAdapter.isAvailable() returns boolean matching detection", () => {
    const {
      agentUISwiftUIAdapter,
      detectAgentUISwiftUINativeModule,
      refreshAgentUISwiftUIAdapter,
    } = require("@agent-ui/core");
    refreshAgentUISwiftUIAdapter();
    const fromAdapter = agentUISwiftUIAdapter.isAvailable();
    const fromDetection = detectAgentUISwiftUINativeModule();
    expect(fromAdapter).toBe(fromDetection);
  });

  it("agentUIComposeAdapter.isAvailable() returns boolean matching detection", () => {
    const {
      agentUIComposeAdapter,
      detectAgentUIComposeNativeModule,
      refreshAgentUIComposeAdapter,
    } = require("@agent-ui/core");
    refreshAgentUIComposeAdapter();
    const fromAdapter = agentUIComposeAdapter.isAvailable();
    const fromDetection = detectAgentUIComposeNativeModule();
    expect(fromAdapter).toBe(fromDetection);
  });
});

// ---------------------------------------------------------------------------
// Capability Flag Mapping
// ---------------------------------------------------------------------------

describe("capability flag mapping — SwiftUI", () => {
  it("capabilities object is the same reference as the adapter capabilities", () => {
    const caps = agentUISwiftUIAdapter.capabilities;
    expect(agentUISwiftUIAdapter.capabilities).toBe(caps);
  });

  it("all capability flags are false before detection", () => {
    const {
      refreshAgentUISwiftUIAdapter,
    } = require("@agent-ui/core");
    refreshAgentUISwiftUIAdapter();
    const caps = agentUISwiftUIAdapter.capabilities;
    expect(caps.button).toBe(false);
    expect(caps.toggle).toBe(false);
    expect(caps.textField).toBe(false);
    expect(caps.secureField).toBe(false);
    expect(caps.slider).toBe(false);
    expect(caps.picker).toBe(false);
  });

  it("all capability flags remain false after failed detection in test env", () => {
    const {
      detectAgentUISwiftUINativeModule,
      refreshAgentUISwiftUIAdapter,
    } = require("@agent-ui/core");
    refreshAgentUISwiftUIAdapter();
    detectAgentUISwiftUINativeModule();
    const caps = agentUISwiftUIAdapter.capabilities;
    expect(caps.button).toBe(false);
    expect(caps.toggle).toBe(false);
  });

  it("refresh resets capability flags to false defaults", () => {
    const {
      detectAgentUISwiftUINativeModule,
      refreshAgentUISwiftUIAdapter,
    } = require("@agent-ui/core");
    detectAgentUISwiftUINativeModule();
    refreshAgentUISwiftUIAdapter();
    const caps = agentUISwiftUIAdapter.capabilities;
    expect(caps.button).toBe(false);
  });
});

describe("capability flag mapping — Compose", () => {
  it("capabilities object is the same reference as the adapter capabilities", () => {
    const caps = agentUIComposeAdapter.capabilities;
    expect(agentUIComposeAdapter.capabilities).toBe(caps);
  });

  it("all capability flags are false before detection", () => {
    const {
      refreshAgentUIComposeAdapter,
    } = require("@agent-ui/core");
    refreshAgentUIComposeAdapter();
    const caps = agentUIComposeAdapter.capabilities;
    expect(caps.button).toBe(false);
    expect(caps.switchControl).toBe(false);
    expect(caps.slider).toBe(false);
    expect(caps.textField).toBe(false);
  });

  it("all capability flags remain false after failed detection in test env", () => {
    const {
      detectAgentUIComposeNativeModule,
      refreshAgentUIComposeAdapter,
    } = require("@agent-ui/core");
    refreshAgentUIComposeAdapter();
    detectAgentUIComposeNativeModule();
    const caps = agentUIComposeAdapter.capabilities;
    expect(caps.button).toBe(false);
    expect(caps.slider).toBe(false);
  });

  it("refresh resets capability flags to false defaults", () => {
    const {
      detectAgentUIComposeNativeModule,
      refreshAgentUIComposeAdapter,
    } = require("@agent-ui/core");
    detectAgentUIComposeNativeModule();
    refreshAgentUIComposeAdapter();
    const caps = agentUIComposeAdapter.capabilities;
    expect(caps.button).toBe(false);
  });
});
