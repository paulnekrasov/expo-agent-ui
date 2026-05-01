import { render } from "@testing-library/react-native";

import {
  AgentUIProvider,
  createAgentUIBridgeGate,
  useAgentUIBridge
} from "@agent-ui/core";

describe("Agent UI bridge gate", () => {
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

  it("keeps the bridge disabled by default", () => {
    expect(createAgentUIBridgeGate(undefined, { isDevelopment: true })).toMatchObject({
      code: "BRIDGE_DISABLED",
      enabled: false
    });
  });

  it("enables loopback bridge control only with development, token, and safe execution environment", () => {
    expect(
      createAgentUIBridgeGate(
        {
          enabled: true,
          executionEnvironment: "storeClient",
          pairingToken: "test-token",
          url: "ws://127.0.0.1:8732"
        },
        { isDevelopment: true }
      )
    ).toMatchObject({
      capabilities: ["inspectTree", "getState", "tap", "input", "observeEvents", "waitFor"],
      code: "BRIDGE_ENABLED",
      enabled: true,
      protocolVersion: 1,
      transportMode: "simulator-loopback"
    });
  });

  it("rejects production or standalone bridge control", () => {
    const config = {
      enabled: true,
      executionEnvironment: "storeClient" as const,
      pairingToken: "test-token",
      url: "ws://127.0.0.1:8732"
    };

    expect(createAgentUIBridgeGate(config, { isDevelopment: false })).toMatchObject({
      code: "NOT_DEVELOPMENT",
      enabled: false
    });
    expect(
      createAgentUIBridgeGate(
        { ...config, executionEnvironment: "standalone" },
        { isDevelopment: true }
      )
    ).toMatchObject({
      code: "STANDALONE_RUNTIME",
      enabled: false
    });
  });

  it("rejects missing tokens and unknown execution environments", () => {
    expect(
      createAgentUIBridgeGate(
        {
          enabled: true,
          executionEnvironment: "storeClient",
          url: "ws://127.0.0.1:8732"
        },
        { isDevelopment: true }
      )
    ).toMatchObject({
      code: "MISSING_PAIRING_TOKEN",
      enabled: false
    });
    expect(
      createAgentUIBridgeGate(
        {
          enabled: true,
          executionEnvironment: "unknown",
          pairingToken: "test-token",
          url: "ws://127.0.0.1:8732"
        },
        { isDevelopment: true }
      )
    ).toMatchObject({
      code: "UNKNOWN_EXECUTION_ENVIRONMENT",
      enabled: false
    });
  });

  it("requires explicit unsafe opt-in before accepting LAN URLs", () => {
    const lanConfig = {
      enabled: true,
      executionEnvironment: "bare" as const,
      pairingToken: "test-token",
      transportMode: "lan" as const,
      url: "ws://192.168.1.10:8732"
    };

    expect(createAgentUIBridgeGate(lanConfig, { isDevelopment: true })).toMatchObject({
      code: "LAN_REQUIRES_EXPLICIT_UNSAFE_OPT_IN",
      enabled: false
    });
    expect(
      createAgentUIBridgeGate(
        { ...lanConfig, unsafeAllowLAN: true },
        { isDevelopment: true }
      )
    ).toMatchObject({
      code: "BRIDGE_ENABLED",
      enabled: true,
      transportMode: "lan"
    });
  });

  it("rejects tunnel mode even when a token is present", () => {
    expect(
      createAgentUIBridgeGate(
        {
          enabled: true,
          executionEnvironment: "storeClient",
          pairingToken: "test-token",
          transportMode: "tunnel",
          url: "wss://example.invalid/agent-ui"
        },
        { isDevelopment: true }
      )
    ).toMatchObject({
      code: "TUNNEL_UNSUPPORTED",
      enabled: false,
      transportMode: "tunnel"
    });
  });

  it("exposes the resolved bridge gate through AgentUIProvider", () => {
    devGlobal.__DEV__ = true;
    const observed: unknown[] = [];

    function BridgeProbe(): null {
      observed.push(useAgentUIBridge());

      return null;
    }

    render(
      <AgentUIProvider
        bridge={{
          enabled: true,
          executionEnvironment: "storeClient",
          pairingToken: "test-token",
          url: "ws://localhost:8732"
        }}
      >
        <BridgeProbe />
      </AgentUIProvider>
    );

    expect(observed).toHaveLength(1);
    expect(observed[0]).toMatchObject({
      code: "BRIDGE_ENABLED",
      enabled: true,
      transportMode: "simulator-loopback"
    });
  });
});
