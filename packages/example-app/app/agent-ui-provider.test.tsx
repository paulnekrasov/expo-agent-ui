import { render } from "@testing-library/react-native";

import {
  AgentUIProvider,
  Button,
  useDeferredSemanticPrimitive
} from "@expo-agent-ui/core";

function SemanticProbe(): null {
  useDeferredSemanticPrimitive({
    id: "security.provider.probe",
    role: "button"
  });

  return null;
}

describe("AgentUIProvider", () => {
  const devGlobal = globalThis as typeof globalThis & {
    __DEV__?: boolean | undefined;
  };
  const originalDev = devGlobal.__DEV__;

  afterEach(() => {
    if (originalDev === undefined) {
      delete devGlobal.__DEV__;
      return;
    }

    devGlobal.__DEV__ = originalDev;
  });

  it("registers semantic primitives in development", () => {
    devGlobal.__DEV__ = true;

    const registerPrimitive = jest.fn(() => () => undefined);

    render(
      <AgentUIProvider runtime={{ registerPrimitive }}>
        <Button accessibilityLabel="Probe" id="security.provider.probe">
          Probe
        </Button>
      </AgentUIProvider>
    );

    expect(registerPrimitive).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "security.provider.probe",
        role: "button"
      })
    );
  });

  it("does not register semantic primitives outside development", () => {
    devGlobal.__DEV__ = false;

    const registerPrimitive = jest.fn(() => () => undefined);

    render(
      <AgentUIProvider runtime={{ registerPrimitive }}>
        <SemanticProbe />
      </AgentUIProvider>
    );

    expect(registerPrimitive).not.toHaveBeenCalled();
  });

  it("does not register semantic primitives when the dev flag is absent", () => {
    delete devGlobal.__DEV__;

    const registerPrimitive = jest.fn(() => () => undefined);

    render(
      <AgentUIProvider runtime={{ registerPrimitive }}>
        <SemanticProbe />
      </AgentUIProvider>
    );

    expect(registerPrimitive).not.toHaveBeenCalled();
  });
});
