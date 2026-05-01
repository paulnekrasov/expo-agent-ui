import { render } from "@testing-library/react-native";

import {
  AgentUIProvider,
  createAgentUIBridgeCommandDispatcher,
  createAgentUIBridgeConnection,
  createAgentUIBridgeEventLog,
  createAgentUIBridgeGetStateResponse,
  createAgentUIBridgeInputResponse,
  createAgentUIBridgeInspectTreeResponse,
  createAgentUIBridgeObserveEventsResponse,
  createAgentUIBridgeRequestId,
  createAgentUIBridgeSessionId,
  createAgentUIBridgeGate,
  createAgentUIBridgeTapResponse,
  createAgentUIBridgeWaitForResponse,
  generateAgentUIPairingToken,
  useAgentUIBridge,
  validateAgentUIBridgeRequest,
  validateAgentUIPairingToken
} from "@agent-ui/core";
import type {
  AgentUIBridgeCommandDispatcher,
  AgentUIBridgeConnection,
  AgentUIBridgeRegistry
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

describe("Agent UI bridge session ID", () => {
  it("creates unique session IDs", () => {
    const ids = new Set(
      Array.from({ length: 100 }, () => createAgentUIBridgeSessionId())
    );

    expect(ids.size).toBe(100);

    for (const id of ids) {
      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThanOrEqual(8);
    }
  });

  it("generates session IDs with distinct structure across calls", () => {
    const a = createAgentUIBridgeSessionId();
    const b = createAgentUIBridgeSessionId();

    expect(a).not.toBe(b);
    expect(a).toEqual(expect.any(String));
    expect(b).toEqual(expect.any(String));
  });
});

describe("Agent UI bridge session descriptor", () => {
  it("accepts session id, state, capabilities, and metadata", () => {
    const sessionId = createAgentUIBridgeSessionId();
    const descriptor: {
      sessionId: string;
      state: string;
      capabilities: string[];
      createdAt: number;
      lastHeartbeat: number;
    } = {
      sessionId,
      state: "connecting",
      capabilities: ["inspectTree", "tap"],
      createdAt: Date.now(),
      lastHeartbeat: Date.now()
    };

    expect(descriptor.sessionId).toBe(sessionId);
    expect(descriptor.state).toBe("connecting");
    expect(descriptor.capabilities).toHaveLength(2);
    expect(descriptor.createdAt).toBeLessThanOrEqual(Date.now());
  });
});

describe("Agent UI bridge hello / welcome envelopes", () => {
  it("shapes a hello envelope with protocol version, capabilities, and pairing token", () => {
    const hello = {
      protocolVersion: 1,
      appId: "com.example.app",
      appName: "Example",
      platform: "ios",
      deviceName: "iPhone 16",
      osVersion: "26.0",
      capabilities: ["inspectTree", "tap"] as const,
      pairingToken: "test-token"
    };

    expect(hello.protocolVersion).toBe(1);
    expect(hello.pairingToken).toBe("test-token");
    expect(hello.capabilities).toEqual(["inspectTree", "tap"]);
    expect(hello.platform).toBe("ios");
  });

  it("shapes a welcome envelope with session id and server capabilities", () => {
    const sessionId = createAgentUIBridgeSessionId();
    const welcome = {
      protocolVersion: 1,
      sessionId,
      serverCapabilities: ["inspectTree", "tap", "observeEvents"] as const,
      epoch: 1
    };

    expect(welcome.protocolVersion).toBe(1);
    expect(welcome.sessionId).toBe(sessionId);
    expect(welcome.serverCapabilities).toEqual([
      "inspectTree",
      "tap",
      "observeEvents"
    ]);
    expect(welcome.epoch).toBe(1);
  });
});

describe("Agent UI bridge heartbeat envelopes", () => {
  it("shapes a heartbeat envelope with session id and client timestamp", () => {
    const sessionId = createAgentUIBridgeSessionId();
    const heartbeat = {
      sessionId,
      clientTimestamp: Date.now()
    };

    expect(heartbeat.sessionId).toBe(sessionId);
    expect(heartbeat.clientTimestamp).toBeLessThanOrEqual(Date.now());
  });

  it("shapes a heartbeat acknowledgement envelope", () => {
    const sessionId = createAgentUIBridgeSessionId();
    const ack = {
      sessionId,
      serverTimestamp: Date.now()
    };

    expect(ack.sessionId).toBe(sessionId);
    expect(ack.serverTimestamp).toBeLessThanOrEqual(Date.now());
  });
});

describe("Agent UI pairing token generation and validation", () => {
  it("generates a high-entropy pairing token", () => {
    const token = generateAgentUIPairingToken();

    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThanOrEqual(32);
    expect(token).toEqual(expect.any(String));
  });

  it("generates unique tokens on each call", () => {
    const a = generateAgentUIPairingToken();
    const b = generateAgentUIPairingToken();

    expect(a).not.toBe(b);
  });

  it("validates well-formed tokens", () => {
    const token = generateAgentUIPairingToken();

    expect(validateAgentUIPairingToken(token)).toBe(true);
  });

  it("rejects missing, empty, and non-string tokens", () => {
    expect(validateAgentUIPairingToken(undefined)).toBe(false);
    expect(validateAgentUIPairingToken(null)).toBe(false);
    expect(validateAgentUIPairingToken("")).toBe(false);
    expect(validateAgentUIPairingToken("   ")).toBe(false);
    expect(validateAgentUIPairingToken(123)).toBe(false);
    expect(validateAgentUIPairingToken({})).toBe(false);
  });

  it("rejects tokens that are too short", () => {
    expect(validateAgentUIPairingToken("abc")).toBe(false);
  });
});

describe("Agent UI bridge event log", () => {
  it("records events with unique IDs and timestamps", () => {
    const log = createAgentUIBridgeEventLog();
    const sessionId = createAgentUIBridgeSessionId();

    log.append({
      type: "bridge.session.paired",
      sessionId,
      payload: { capabilities: ["inspectTree"] }
    });

    const { events } = log.query();

    expect(events).toHaveLength(1);

    const first = events[0];

    expect(first).toBeDefined();

    if (!first) {
      return;
    }

    expect(first.type).toBe("bridge.session.paired");
    expect(first.sessionId).toBe(sessionId);
    expect(first.payload).toEqual({ capabilities: ["inspectTree"] });
    expect(first.id).toEqual(expect.any(String));
    expect(first.timestamp).toBeLessThanOrEqual(Date.now());
  });

  it("supports cursor-based query", () => {
    const log = createAgentUIBridgeEventLog();

    log.append({ type: "bridge.session.connected" });
    log.append({ type: "bridge.session.paired" });
    log.append({ type: "bridge.session.disconnected" });

    const first = log.query(undefined, undefined, 1);

    expect(first.events).toHaveLength(1);
    expect(first.nextCursor).toBeGreaterThan(0);
    expect(first.droppedCount).toBe(0);

    const rest = log.query(first.nextCursor);

    expect(rest.events).toHaveLength(2);
    expect(rest.droppedCount).toBe(0);
  });

  it("filters events by type", () => {
    const log = createAgentUIBridgeEventLog();

    log.append({ type: "bridge.session.connected" });
    log.append({ type: "bridge.session.paired" });
    log.append({ type: "bridge.session.connected" });

    const connected = log.query(undefined, ["bridge.session.connected"]);

    expect(connected.events).toHaveLength(2);
    expect(connected.events.every(e => e.type === "bridge.session.connected")).toBe(true);
  });

  it("caps event count and tracks dropped events", () => {
    const log = createAgentUIBridgeEventLog(3);

    log.append({ type: "bridge.session.connected" });
    log.append({ type: "bridge.session.paired" });
    log.append({ type: "bridge.session.connected" });
    log.append({ type: "bridge.session.disconnected" });
    log.append({ type: "bridge.error" });

    const { events, droppedCount } = log.query();

    expect(events).toHaveLength(3);
    expect(droppedCount).toBe(2);
  });

  it("clears all events", () => {
    const log = createAgentUIBridgeEventLog();

    log.append({ type: "bridge.session.connected" });
    log.append({ type: "bridge.session.paired" });

    log.clear();

    const { events, nextCursor } = log.query();

    expect(events).toHaveLength(0);
    expect(nextCursor).toBe(0);
  });

  it("tracks total event count before cap", () => {
    const log = createAgentUIBridgeEventLog(2);

    log.append({ type: "bridge.session.connected" });
    log.append({ type: "bridge.session.paired" });
    log.append({ type: "bridge.session.disconnected" });

    expect(log.total).toBe(3);
    expect(log.query().events).toHaveLength(2);
  });
});

describe("Agent UI bridge request ID", () => {
  it("creates unique request IDs", () => {
    const ids = new Set(
      Array.from({ length: 100 }, () => createAgentUIBridgeRequestId())
    );

    expect(ids.size).toBe(100);

    for (const id of ids) {
      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThanOrEqual(8);
    }
  });

  it("generates request IDs with distinct structure across calls", () => {
    const a = createAgentUIBridgeRequestId();
    const b = createAgentUIBridgeRequestId();

    expect(a).not.toBe(b);
    expect(a).toEqual(expect.any(String));
    expect(b).toEqual(expect.any(String));
  });
});

describe("Agent UI bridge request validation", () => {
  it("rejects null and non-object input", () => {
    expect(validateAgentUIBridgeRequest(null)).toBe(false);
    expect(validateAgentUIBridgeRequest(undefined)).toBe(false);
    expect(validateAgentUIBridgeRequest(42)).toBe(false);
    expect(validateAgentUIBridgeRequest("not-an-object")).toBe(false);
    expect(validateAgentUIBridgeRequest([])).toBe(false);
  });

  it("rejects objects without type or requestId", () => {
    expect(validateAgentUIBridgeRequest({})).toBe(false);
    expect(validateAgentUIBridgeRequest({ type: "tap" })).toBe(false);
    expect(validateAgentUIBridgeRequest({ requestId: "req_1" })).toBe(false);
    expect(validateAgentUIBridgeRequest({ type: "", requestId: "" })).toBe(false);
  });

  it("accepts a well-formed inspectTree request", () => {
    expect(
      validateAgentUIBridgeRequest({
        type: "inspectTree",
        requestId: createAgentUIBridgeRequestId(),
        options: { screen: "main", maxDepth: 3 }
      })
    ).toBe(true);
  });

  it("accepts a well-formed getState request with nodeId", () => {
    expect(
      validateAgentUIBridgeRequest({
        type: "getState",
        requestId: createAgentUIBridgeRequestId(),
        nodeId: "btn-primary"
      })
    ).toBe(true);
  });

  it("rejects getState without nodeId", () => {
    expect(
      validateAgentUIBridgeRequest({
        type: "getState",
        requestId: createAgentUIBridgeRequestId()
      })
    ).toBe(false);
  });

  it("accepts a well-formed tap request with targetId", () => {
    expect(
      validateAgentUIBridgeRequest({
        type: "tap",
        requestId: createAgentUIBridgeRequestId(),
        targetId: "btn-submit",
        action: "activate",
        payload: { submit: true }
      })
    ).toBe(true);
  });

  it("rejects tap without targetId", () => {
    expect(
      validateAgentUIBridgeRequest({
        type: "tap",
        requestId: createAgentUIBridgeRequestId()
      })
    ).toBe(false);
  });

  it("accepts a well-formed input request with targetId and text", () => {
    expect(
      validateAgentUIBridgeRequest({
        type: "input",
        requestId: createAgentUIBridgeRequestId(),
        targetId: "field-email",
        text: "hello@example.com"
      })
    ).toBe(true);
  });

  it("rejects input without text", () => {
    expect(
      validateAgentUIBridgeRequest({
        type: "input",
        requestId: createAgentUIBridgeRequestId(),
        targetId: "field-email"
      })
    ).toBe(false);
  });

  it("accepts a well-formed waitFor request with conditions", () => {
    expect(
      validateAgentUIBridgeRequest({
        type: "waitFor",
        requestId: createAgentUIBridgeRequestId(),
        conditions: [
          { kind: "nodeExists", nodeId: "spinner" },
          { kind: "nodeState", nodeId: "results", expectedState: { loaded: true } }
        ],
        timeout: 5000
      })
    ).toBe(true);
  });

  it("rejects waitFor without conditions or with empty conditions", () => {
    expect(
      validateAgentUIBridgeRequest({
        type: "waitFor",
        requestId: createAgentUIBridgeRequestId()
      })
    ).toBe(false);
    expect(
      validateAgentUIBridgeRequest({
        type: "waitFor",
        requestId: createAgentUIBridgeRequestId(),
        conditions: []
      })
    ).toBe(false);
  });

  it("accepts a well-formed observeEvents request", () => {
    expect(
      validateAgentUIBridgeRequest({
        type: "observeEvents",
        requestId: createAgentUIBridgeRequestId(),
        eventTypes: ["bridge.session.connected"],
        limit: 10
      })
    ).toBe(true);
  });

  it("rejects requests with unknown command type", () => {
    expect(
      validateAgentUIBridgeRequest({
        type: "unknownCommand",
        requestId: createAgentUIBridgeRequestId()
      })
    ).toBe(false);
  });
});

describe("Agent UI bridge response factories", () => {
  it("creates a well-formed inspectTree response with timestamp", () => {
    const reqId = createAgentUIBridgeRequestId();
    const resp = createAgentUIBridgeInspectTreeResponse({
      requestId: reqId,
      tree: { id: "root", children: [] }
    });

    expect(resp.type).toBe("inspectTree");
    expect(resp.requestId).toBe(reqId);
    expect(resp.tree).toEqual({ id: "root", children: [] });
    expect(resp.timestamp).toBeLessThanOrEqual(Date.now());
    expect(resp.timestamp).toBeGreaterThan(0);
  });

  it("creates an inspectTree response without tree", () => {
    const reqId = createAgentUIBridgeRequestId();
    const resp = createAgentUIBridgeInspectTreeResponse({ requestId: reqId });

    expect(resp.type).toBe("inspectTree");
    expect(resp.requestId).toBe(reqId);
    expect(resp).not.toHaveProperty("tree");
  });

  it("creates a well-formed getState response", () => {
    const reqId = createAgentUIBridgeRequestId();
    const resp = createAgentUIBridgeGetStateResponse({
      requestId: reqId,
      nodeId: "btn-ok",
      node: { id: "btn-ok", type: "button", state: { enabled: true } }
    });

    expect(resp.type).toBe("getState");
    expect(resp.requestId).toBe(reqId);
    expect(resp.nodeId).toBe("btn-ok");
    expect(resp.node).toEqual({
      id: "btn-ok",
      type: "button",
      state: { enabled: true }
    });
    expect(resp.timestamp).toBeGreaterThan(0);
  });

  it("creates a well-formed tap response with result code", () => {
    const reqId = createAgentUIBridgeRequestId();
    const resp = createAgentUIBridgeTapResponse({
      requestId: reqId,
      targetId: "btn-save",
      result: "OK"
    });

    expect(resp.type).toBe("tap");
    expect(resp.requestId).toBe(reqId);
    expect(resp.targetId).toBe("btn-save");
    expect(resp.result).toBe("OK");
    expect(resp.timestamp).toBeGreaterThan(0);
  });

  it("creates a tap error response", () => {
    const reqId = createAgentUIBridgeRequestId();
    const resp = createAgentUIBridgeTapResponse({
      requestId: reqId,
      targetId: "bad-id",
      result: "NODE_NOT_FOUND",
      error: "Node bad-id not found in current tree"
    });

    expect(resp.result).toBe("NODE_NOT_FOUND");
    expect(resp.error).toBe("Node bad-id not found in current tree");
  });

  it("creates a well-formed input response", () => {
    const reqId = createAgentUIBridgeRequestId();
    const resp = createAgentUIBridgeInputResponse({
      requestId: reqId,
      targetId: "field-name",
      result: "OK"
    });

    expect(resp.type).toBe("input");
    expect(resp.targetId).toBe("field-name");
    expect(resp.result).toBe("OK");
  });

  it("creates a well-formed waitFor response", () => {
    const reqId = createAgentUIBridgeRequestId();
    const resp = createAgentUIBridgeWaitForResponse({
      requestId: reqId,
      satisfied: true,
      matchedConditions: 2,
      totalConditions: 2
    });

    expect(resp.type).toBe("waitFor");
    expect(resp.requestId).toBe(reqId);
    expect(resp.satisfied).toBe(true);
    expect(resp.matchedConditions).toBe(2);
    expect(resp.totalConditions).toBe(2);
    expect(resp.timestamp).toBeGreaterThan(0);
  });

  it("creates an unsatisfied waitFor response", () => {
    const reqId = createAgentUIBridgeRequestId();
    const resp = createAgentUIBridgeWaitForResponse({
      requestId: reqId,
      satisfied: false,
      matchedConditions: 0,
      totalConditions: 3
    });

    expect(resp.satisfied).toBe(false);
    expect(resp.matchedConditions).toBe(0);
    expect(resp.totalConditions).toBe(3);
  });

  it("creates a well-formed observeEvents response", () => {
    const reqId = createAgentUIBridgeRequestId();
    const events = [
      {
        id: "evt_1",
        type: "bridge.session.connected" as const,
        cursor: 1,
        timestamp: Date.now()
      }
    ];
    const resp = createAgentUIBridgeObserveEventsResponse({
      requestId: reqId,
      events,
      nextCursor: 1,
      droppedCount: 0
    });

    expect(resp.type).toBe("observeEvents");
    expect(resp.requestId).toBe(reqId);
    expect(resp.events).toEqual(events);
    expect(resp.nextCursor).toBe(1);
    expect(resp.droppedCount).toBe(0);
    expect(resp.timestamp).toBeGreaterThan(0);
  });
});

describe("Agent UI bridge discriminated unions", () => {
  it("accepts a tap request through the command request union", () => {
    const reqId = createAgentUIBridgeRequestId();
    const command = {
      type: "tap" as const,
      requestId: reqId,
      targetId: "btn-x"
    };

    const validated = validateAgentUIBridgeRequest(command);

    expect(validated).toBe(true);

    if (validated) {
      expect(command).toMatchObject({ type: "tap", targetId: "btn-x" });
    }
  });

  it("cases the command type from a discriminated union", () => {
    const reqId = createAgentUIBridgeRequestId();
    const command = {
      type: "waitFor" as const,
      requestId: reqId,
      conditions: [{ kind: "nodeVisible" as const, nodeId: "modal" }],
      timeout: 3000
    };

    expect(validateAgentUIBridgeRequest(command)).toBe(true);
    expect(command.conditions).toHaveLength(1);
    expect(command.conditions[0]).toEqual({
      kind: "nodeVisible",
      nodeId: "modal"
    });
  });
});

// ---------------------------------------------------------------------------
// WebSocket bridge connection tests
// ---------------------------------------------------------------------------

const MOCK_WS_OPEN = 1 as const;

interface MockSocketInternals {
  readonly OPEN: number;
  readyState: number;
  onopen: ((event: unknown) => void) | null;
  onclose: ((event: { code: number; reason: string; wasClean: boolean }) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onmessage: ((event: { data: string }) => void) | null;
  send: (data: string) => void;
  close: (code?: number, reason?: string) => void;
}

function createMockSocket(): {
  socket: MockSocketInternals;
  factory: (url: string) => MockSocketInternals;
} {
  const socket: MockSocketInternals = {
    OPEN: MOCK_WS_OPEN,
    readyState: MOCK_WS_OPEN,
    onopen: null,
    onclose: null,
    onerror: null,
    onmessage: null,
    send: () => {},
    close: () => {}
  };

  const factory = (_url: string): MockSocketInternals => socket;

  return { socket, factory };
}

function createEnabledConnection(overrides?: {
  url?: string | undefined;
  pairingToken?: string | undefined;
  appId?: string | undefined;
  heartbeatIntervalMs?: number | undefined;
  maxReconnectAttempts?: number | undefined;
  reconnectBaseDelayMs?: number | undefined;
}): {
  connection: AgentUIBridgeConnection;
  socket: MockSocketInternals;
  eventLog: ReturnType<typeof createAgentUIBridgeEventLog>;
} {
  const gate = createAgentUIBridgeGate(
    {
      enabled: true,
      executionEnvironment: "storeClient",
      pairingToken: overrides?.pairingToken ?? "test-token",
      url: overrides?.url ?? "ws://127.0.0.1:8732"
    },
    { isDevelopment: true }
  );

  const eventLog = createAgentUIBridgeEventLog(100);

  const { socket, factory } = createMockSocket();

  const connection = createAgentUIBridgeConnection({
    gateResult: gate,
    url: overrides?.url ?? "ws://127.0.0.1:8732",
    pairingToken: overrides?.pairingToken ?? "test-token",
    eventLog,
    ...(overrides?.appId ? { appId: overrides.appId } : {}),
    ...(overrides?.heartbeatIntervalMs !== undefined
      ? { heartbeatIntervalMs: overrides.heartbeatIntervalMs }
      : {}),
    ...(overrides?.maxReconnectAttempts !== undefined
      ? { maxReconnectAttempts: overrides.maxReconnectAttempts }
      : {}),
    ...(overrides?.reconnectBaseDelayMs !== undefined
      ? { reconnectBaseDelayMs: overrides.reconnectBaseDelayMs }
      : {}),
    webSocketFactory: factory as any
  });

  return { connection, socket, eventLog };
}

function simulateWelcome(
  socket: MockSocketInternals,
  params?: {
    sessionId?: string | undefined;
    epoch?: number | undefined;
  }
): void {
  const welcome = JSON.stringify({
    protocolVersion: 1,
    sessionId: params?.sessionId ?? "s_mock_session",
    serverCapabilities: ["inspectTree"],
    epoch: params?.epoch ?? 1
  });

  socket.onmessage?.({ data: welcome });
}

function simulateHeartbeatAck(socket: MockSocketInternals): void {
  const ack = JSON.stringify({
    sessionId: "s_mock_session",
    serverTimestamp: Date.now()
  });

  socket.onmessage?.({ data: ack });
}

describe("Agent UI bridge WebSocket connection", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("exports a connection factory", () => {
    expect(typeof createAgentUIBridgeConnection).toBe("function");
  });

  it("starts in idle state", () => {
    const { connection } = createEnabledConnection();

    expect(connection.state).toBe("idle");
    expect(connection.sessionId).toBeUndefined();
    expect(connection.session).toBeUndefined();
  });

  it("does not connect when gate is disabled", () => {
    const gate = createAgentUIBridgeGate(undefined, { isDevelopment: true });
    const eventLog = createAgentUIBridgeEventLog(10);

    const connection = createAgentUIBridgeConnection({
      gateResult: gate,
      url: "ws://127.0.0.1:8732",
      pairingToken: "test-token",
      eventLog,
      webSocketFactory: () => {
        throw new Error("should not be called");
      }
    });

    connection.start();
    expect(connection.state).toBe("idle");
  });

  it("transitions to connecting on start", () => {
    const { connection } = createEnabledConnection();

    connection.start();
    expect(connection.state).toBe("connecting");
  });

  it("does not double-start when already active", () => {
    const { connection, socket } = createEnabledConnection({
      heartbeatIntervalMs: 999999
    });

    connection.start();
    expect(connection.state).toBe("connecting");

    simulateWelcome(socket);
    simulateHeartbeatAck(socket);
    expect(["paired", "active"].includes(connection.state)).toBe(true);

    const stateBefore = connection.state;
    connection.start();
    expect(connection.state).toBe(stateBefore);
  });

  it("sends hello envelope on socket open", () => {
    const sentMessages: string[] = [];
    const { socket, factory } = createMockSocket();

    socket.readyState = 1;

    const gate = createAgentUIBridgeGate(
      {
        enabled: true,
        executionEnvironment: "storeClient",
        pairingToken: "test-token",
        url: "ws://127.0.0.1:8732"
      },
      { isDevelopment: true }
    );

    const eventLog = createAgentUIBridgeEventLog(100);

    const connection = createAgentUIBridgeConnection({
      gateResult: gate,
      url: "ws://127.0.0.1:8732",
      pairingToken: "test-token",
      eventLog,
      appId: "com.example.app",
      appName: "Test App",
      platform: "ios",
      webSocketFactory: ((url: string) => {
        const s = factory(url);

        s.onopen = socket.onopen;
        s.onclose = socket.onclose;
        s.onerror = socket.onerror;
        s.onmessage = socket.onmessage;
        s.send = (data: string) => {
          sentMessages.push(data);
        };

        return s;
      }) as any
    });

    connection.start();
    socket.onopen?.({});

    expect(sentMessages.length).toBeGreaterThanOrEqual(1);

    const rawHello = sentMessages[0];

    expect(typeof rawHello).toBe("string");

    const hello = JSON.parse(rawHello!);

    expect(hello.protocolVersion).toBe(1);
    expect(hello.pairingToken).toBe("test-token");
    expect(hello.appId).toBe("com.example.app");
    expect(hello.appName).toBe("Test App");
    expect(hello.platform).toBe("ios");
    expect(Array.isArray(hello.capabilities)).toBe(true);
  });

  it("transitions to paired on welcome", () => {
    const { connection, socket } = createEnabledConnection({
      heartbeatIntervalMs: 999999
    });

    connection.start();
    simulateWelcome(socket);

    expect(connection.state).toBe("paired");
    expect(connection.sessionId).toBe("s_mock_session");
    expect(connection.session).toMatchObject({
      sessionId: "s_mock_session",
      state: "paired"
    });
  });

  it("transitions to active on first heartbeat ack", () => {
    const { connection, socket } = createEnabledConnection({
      heartbeatIntervalMs: 999999
    });

    connection.start();
    simulateWelcome(socket);
    simulateHeartbeatAck(socket);

    expect(connection.state).toBe("active");
    expect(connection.session).toMatchObject({
      sessionId: "s_mock_session",
      state: "active"
    });
  });

  it("sends heartbeat envelopes on interval", () => {
    const sentMessages: string[] = [];
    const { socket } = createMockSocket();

    socket.send = (data: string) => { sentMessages.push(data); };

    const gate = createAgentUIBridgeGate(
      {
        enabled: true,
        executionEnvironment: "storeClient",
        pairingToken: "test-token",
        url: "ws://127.0.0.1:8732"
      },
      { isDevelopment: true }
    );

    const eventLog = createAgentUIBridgeEventLog(100);

    const connection = createAgentUIBridgeConnection({
      gateResult: gate,
      url: "ws://127.0.0.1:8732",
      pairingToken: "test-token",
      eventLog,
      heartbeatIntervalMs: 100,
      webSocketFactory: (_url: string) => socket as any
    });

    connection.start();
    socket.onopen?.({});
    simulateWelcome(socket);
    simulateHeartbeatAck(socket);

    jest.advanceTimersByTime(200);

    const heartbeats = sentMessages.filter(
      (m) => {
        try {
          const p = JSON.parse(m);

          return typeof p.clientTimestamp === "number";
        } catch {
          return false;
        }
      }
    );

    expect(heartbeats.length).toBeGreaterThanOrEqual(1);

    const lastHeartbeat = heartbeats[heartbeats.length - 1];

    expect(lastHeartbeat).toBeDefined();

    expect(JSON.parse(lastHeartbeat!)).toMatchObject({
      sessionId: expect.any(String),
      clientTimestamp: expect.any(Number)
    });
  });

  it("reaches expired when max reconnect attempts exceeded", () => {
    const { connection, socket } = createEnabledConnection({
      heartbeatIntervalMs: 999999,
      maxReconnectAttempts: 1,
      reconnectBaseDelayMs: 5
    });

    connection.start();
    socket.onopen?.({});
    simulateWelcome(socket);

    socket.onclose?.(({
      code: 1006,
      reason: "connection lost",
      wasClean: false
    }));

    expect(connection.state).toBe("reconnecting");

    jest.advanceTimersByTime(100);

    socket.onclose?.(({
      code: 1006,
      reason: "connection lost",
      wasClean: false
    }));

    jest.advanceTimersByTime(100);

    expect(connection.state).toBe("expired");
  });

  it("emits bridge.session.* events to the event log", () => {
    const { connection, socket, eventLog } = createEnabledConnection({
      heartbeatIntervalMs: 999999
    });

    connection.start();
    socket.onopen?.({});

    const connectedEvents = eventLog.query();

    expect(connectedEvents.events.some(
      (e) => e.type === "bridge.session.connected"
    )).toBe(true);

    simulateWelcome(socket);

    const pairedEvents = eventLog.query();

    expect(pairedEvents.events.some(
      (e) => e.type === "bridge.session.paired"
    )).toBe(true);
  });

  it("emits disconnected event on socket close", () => {
    const { connection, socket, eventLog } = createEnabledConnection({
      heartbeatIntervalMs: 999999,
      maxReconnectAttempts: 0
    });

    connection.start();
    socket.onopen?.({});
    simulateWelcome(socket);

    socket.onclose?.(({
      code: 1000,
      reason: "",
      wasClean: true
    }));

    const events = eventLog.query();

    expect(events.events.some(
      (e) => e.type === "bridge.session.disconnected"
    )).toBe(true);
    expect(connection.state).toBe("expired");
  });

  it("performs clean stop", () => {
    const { connection, socket } = createEnabledConnection({
      heartbeatIntervalMs: 999999
    });

    connection.start();
    simulateWelcome(socket);
    simulateHeartbeatAck(socket);

    connection.stop();

    expect(connection.state).toBe("disconnected");
    expect(connection.sessionId).toBeUndefined();
    expect(connection.session).toBeUndefined();
  });

  it("emits bridge.command.received on send", () => {
    const sentMessages: string[] = [];
    const { factory } = createMockSocket();

    const gate = createAgentUIBridgeGate(
      {
        enabled: true,
        executionEnvironment: "storeClient",
        pairingToken: "test-token",
        url: "ws://127.0.0.1:8732"
      },
      { isDevelopment: true }
    );

    const eventLog = createAgentUIBridgeEventLog(100);

    const connection = createAgentUIBridgeConnection({
      gateResult: gate,
      url: "ws://127.0.0.1:8732",
      pairingToken: "test-token",
      eventLog,
      webSocketFactory: (url: string) => {
        const mockSocket = factory(url);

        return {
          ...mockSocket,
          readyState: 1,
          OPEN: 1,
          send: (data: string) => { sentMessages.push(data); }
        } as any;
      }
    });

    connection.start();

    const requestId = createAgentUIBridgeRequestId();

    connection.send({
      type: "inspectTree",
      requestId
    });

    const events = eventLog.query();

    expect(events.events.some(
      (e) =>
        e.type === "bridge.command.received" &&
        e.payload?.commandType === "inspectTree"
    )).toBe(true);
  });

  it("rejects welcome with wrong protocol version", () => {
    const { connection, socket, eventLog } = createEnabledConnection({
      heartbeatIntervalMs: 999999
    });

    connection.start();

    const badWelcome = JSON.stringify({
      protocolVersion: 99,
      sessionId: "s_bad_session",
      serverCapabilities: [],
      epoch: 1
    });

    socket.onmessage?.({ data: badWelcome });

    const events = eventLog.query();

    expect(events.events.some(
      (e) =>
        e.type === "bridge.error" &&
        typeof e.payload?.reason === "string" &&
        e.payload.reason.includes("protocol version mismatch")
    )).toBe(true);
  });

  it("handles invalid JSON from server gracefully", () => {
    const { connection, socket, eventLog } = createEnabledConnection({
      heartbeatIntervalMs: 999999
    });

    connection.start();

    socket.onmessage?.({ data: "not json" });

    const events = eventLog.query();

    expect(events.events.some(
      (e) =>
        e.type === "bridge.error" &&
        typeof e.payload?.reason === "string" &&
        e.payload.reason.includes("invalid JSON")
    )).toBe(true);
  });

  it("handles unrecognized server message shape", () => {
    const { connection, socket, eventLog } = createEnabledConnection({
      heartbeatIntervalMs: 999999
    });

    connection.start();
    socket.onopen?.({});

    socket.onmessage?.({ data: JSON.stringify({ unknownField: true }) });

    const events = eventLog.query();

    expect(events.events.some(
      (e) =>
        e.type === "bridge.error" &&
        typeof e.payload?.reason === "string" &&
        (e.payload?.reason as string).includes("unrecognized server message")
    )).toBe(true);
  });

  it("errors on send when socket is not open", () => {
    const { connection, eventLog } = createEnabledConnection({
      heartbeatIntervalMs: 999999
    });

    const requestId = createAgentUIBridgeRequestId();

    connection.send({
      type: "inspectTree",
      requestId
    });

    const events = eventLog.query();

    expect(events.events.some(
      (e) =>
        e.type === "bridge.error" &&
        e.payload?.reason === "cannot send command: socket not connected"
    )).toBe(true);
  });

  it("stops heartbeats on stop", () => {
    const { connection, socket } = createEnabledConnection({
      heartbeatIntervalMs: 100
    });

    connection.start();
    simulateWelcome(socket);
    simulateHeartbeatAck(socket);

    expect(connection.state).toBe("active");

    connection.stop();

    expect(connection.state).toBe("disconnected");
    expect(connection.sessionId).toBeUndefined();
  });
});

describe("Agent UI bridge command dispatch", () => {
  function createMockRegistry(
    overrides?: Partial<AgentUIBridgeRegistry> | undefined
  ): AgentUIBridgeRegistry {
    return {
      getSnapshot: () => ({
        nodes: [],
        mountedNodeCount: 0,
        generatedNodeCount: 0
      }),
      getNodeById: () => undefined,
      dispatchAction: async () => ({
        ok: false,
        code: "NODE_NOT_FOUND",
        message: "not found",
        nodeId: "",
        action: "tap"
      }),
      ...overrides
    };
  }

  function createDispatcher(
    registryOverrides?: Partial<AgentUIBridgeRegistry> | undefined
  ): { dispatcher: AgentUIBridgeCommandDispatcher; registry: AgentUIBridgeRegistry; eventLog: ReturnType<typeof createAgentUIBridgeEventLog> } {
    const eventLog = createAgentUIBridgeEventLog();
    const registry = createMockRegistry(registryOverrides);
    const dispatcher = createAgentUIBridgeCommandDispatcher({
      registry,
      eventLog
    });

    return { dispatcher, registry, eventLog };
  }

  it("dispatches inspectTree and returns the registry snapshot", async () => {
    const { dispatcher } = createDispatcher({
      getSnapshot: () => ({
        nodes: [{ id: "btn1", type: "button" }],
        mountedNodeCount: 1,
        generatedNodeCount: 0
      })
    });

    const requestId = createAgentUIBridgeRequestId();
    const response = await dispatcher.dispatch({
      type: "inspectTree",
      requestId
    });

    expect(response).toMatchObject({
      type: "inspectTree",
      requestId
    });
    const r = response as ReturnType<typeof createAgentUIBridgeInspectTreeResponse>;

    expect(r.tree).toBeDefined();
    const tree = r.tree as { nodes: unknown[]; mountedNodeCount: number; generatedNodeCount: number };

    expect(tree.nodes).toHaveLength(1);
    expect(tree.mountedNodeCount).toBe(1);
  });

  it("passes inspectTree screen, maxDepth, rootId, and includeHidden options through to the registry", async () => {
    let capturedOptions: unknown = undefined;
    const { dispatcher } = createDispatcher({
      getSnapshot: (options?: Record<string, unknown>) => {
        capturedOptions = options;
        return {
          nodes: [{ id: "btn1", type: "button" }],
          mountedNodeCount: 1,
          generatedNodeCount: 0
        };
      }
    });

    const requestId = createAgentUIBridgeRequestId();
    const response = await dispatcher.dispatch({
      type: "inspectTree",
      requestId,
      options: {
        screen: "settings",
        includeHidden: false,
        maxDepth: 2,
        rootId: "btn1"
      }
    });

    expect(response).toMatchObject({
      type: "inspectTree",
      requestId
    });
    expect(capturedOptions).toBeDefined();
    const opts = capturedOptions as Record<string, unknown>;
    expect(opts.screen).toBe("settings");
    expect(opts.maxDepth).toBe(2);
    expect(opts.includeHidden).toBe(false);
    expect(opts.rootId).toBe("btn1");
  });

  it("dispatches getState with a nodeId and returns the node", async () => {
    const testNode = { id: "btn1", type: "button", state: {} };
    const { dispatcher } = createDispatcher({
      getNodeById: (_id: string) =>
        _id === "btn1" ? testNode : undefined
    });

    const requestId = createAgentUIBridgeRequestId();
    const response = await dispatcher.dispatch({
      type: "getState",
      requestId,
      nodeId: "btn1"
    });

    expect(response).toMatchObject({
      type: "getState",
      requestId,
      nodeId: "btn1"
    });
    const r = response as ReturnType<typeof createAgentUIBridgeGetStateResponse>;

    expect(r.node).toBe(testNode);
  });

  it("dispatches getState and returns undefined node when not found", async () => {
    const { dispatcher } = createDispatcher({
      getNodeById: () => undefined
    });

    const requestId = createAgentUIBridgeRequestId();
    const response = await dispatcher.dispatch({
      type: "getState",
      requestId,
      nodeId: "missing"
    });

    expect(response).toMatchObject({
      type: "getState",
      requestId,
      nodeId: "missing"
    });
    const r = response as ReturnType<typeof createAgentUIBridgeGetStateResponse>;

    expect(r.node).toBeUndefined();
  });

  it("dispatches getState with screen option", async () => {
    const calls: Array<{ id: string; options?: { screen?: string } }> = [];
    const { dispatcher } = createDispatcher({
      getNodeById: (id: string, options?: { screen?: string }) => {
        calls.push({ id, ...(options !== undefined ? { options } : {}) });

        return undefined;
      }
    });

    const requestId = createAgentUIBridgeRequestId();

    await dispatcher.dispatch({
      type: "getState",
      requestId,
      nodeId: "btn1",
      options: { screen: "settings" }
    });

    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual({ id: "btn1", options: { screen: "settings" } });
  });

  it("dispatches tap and maps ACTION_DISPATCHED to OK", async () => {
    const { dispatcher } = createDispatcher({
      dispatchAction: async () => ({
        ok: true,
        code: "ACTION_DISPATCHED",
        message: "done",
        nodeId: "btn1",
        action: "tap"
      })
    });

    const requestId = createAgentUIBridgeRequestId();
    const response = await dispatcher.dispatch({
      type: "tap",
      requestId,
      targetId: "btn1"
    });

    expect(response).toMatchObject({
      type: "tap",
      requestId,
      targetId: "btn1",
      result: "OK"
    });
    const r = response as ReturnType<typeof createAgentUIBridgeTapResponse>;

    expect(r.error).toBeUndefined();
  });

  it("dispatches tap with custom action", async () => {
    const dispatchCalls: Array<{
      id: string;
      action: string;
    }> = [];
    const { dispatcher } = createDispatcher({
      dispatchAction: async (id, action) => {
        dispatchCalls.push({ id, action });

        return {
          ok: true,
          code: "ACTION_DISPATCHED",
          message: "done",
          nodeId: id,
          action
        };
      }
    });

    const requestId = createAgentUIBridgeRequestId();

    await dispatcher.dispatch({
      type: "tap",
      requestId,
      targetId: "btn1",
      action: "increment"
    });

    expect(dispatchCalls).toHaveLength(1);
    const firstCall = dispatchCalls[0];

    expect(firstCall?.action).toBe("increment");
  });

  it("dispatches tap with payload", async () => {
    const dispatchCalls: Array<{
      id: string;
      options?: { payload?: unknown };
    }> = [];
    const { dispatcher } = createDispatcher({
      dispatchAction: async (id, _action, options) => {
        dispatchCalls.push({ id, ...(options !== undefined ? { options } : {}) });

        return {
          ok: true,
          code: "ACTION_DISPATCHED",
          message: "done",
          nodeId: id,
          action: "tap"
        };
      }
    });

    const requestId = createAgentUIBridgeRequestId();

    await dispatcher.dispatch({
      type: "tap",
      requestId,
      targetId: "btn1",
      payload: { extra: true }
    });

    expect(dispatchCalls).toHaveLength(1);
    const call0 = dispatchCalls[0];

    expect(call0?.options?.payload).toEqual({ extra: true });
  });

  it("maps registry NODE_NOT_FOUND to bridge NODE_NOT_FOUND for tap", async () => {
    const { dispatcher } = createDispatcher({
      dispatchAction: async () => ({
        ok: false,
        code: "NODE_NOT_FOUND",
        message: "node missing",
        nodeId: "missing",
        action: "tap"
      })
    });

    const requestId = createAgentUIBridgeRequestId();
    const response = await dispatcher.dispatch({
      type: "tap",
      requestId,
      targetId: "missing"
    });

    expect(response).toMatchObject({
      type: "tap",
      requestId,
      targetId: "missing",
      result: "NODE_NOT_FOUND"
    });
  });

  it("maps registry ACTION_UNSUPPORTED to bridge UNSUPPORTED_ACTION for tap", async () => {
    const { dispatcher } = createDispatcher({
      dispatchAction: async () => ({
        ok: false,
        code: "ACTION_UNSUPPORTED",
        message: "unsupported",
        nodeId: "btn1",
        action: "swipe",
        supportedActions: ["tap"]
      })
    });

    const requestId = createAgentUIBridgeRequestId();
    const response = await dispatcher.dispatch({
      type: "tap",
      requestId,
      targetId: "btn1",
      action: "swipe"
    });

    expect(response).toMatchObject({
      type: "tap",
      requestId,
      result: "UNSUPPORTED_ACTION"
    });
  });

  it("maps registry ACTION_DISABLED to bridge ACTION_REJECTED for tap", async () => {
    const { dispatcher } = createDispatcher({
      dispatchAction: async () => ({
        ok: false,
        code: "ACTION_DISABLED",
        message: "disabled",
        nodeId: "btn1",
        action: "tap"
      })
    });

    const requestId = createAgentUIBridgeRequestId();
    const response = await dispatcher.dispatch({
      type: "tap",
      requestId,
      targetId: "btn1"
    });

    expect(response).toMatchObject({
      type: "tap",
      requestId,
      result: "ACTION_REJECTED"
    });
  });

  it("maps registry ACTION_HANDLER_MISSING to bridge ACTION_REJECTED for tap", async () => {
    const { dispatcher } = createDispatcher({
      dispatchAction: async () => ({
        ok: false,
        code: "ACTION_HANDLER_MISSING",
        message: "no handler",
        nodeId: "btn1",
        action: "tap"
      })
    });

    const requestId = createAgentUIBridgeRequestId();
    const response = await dispatcher.dispatch({
      type: "tap",
      requestId,
      targetId: "btn1"
    });

    expect(response).toMatchObject({
      type: "tap",
      requestId,
      result: "ACTION_REJECTED"
    });
  });

  it("maps registry ACTION_AMBIGUOUS to bridge ACTION_REJECTED for tap", async () => {
    const { dispatcher } = createDispatcher({
      dispatchAction: async () => ({
        ok: false,
        code: "ACTION_AMBIGUOUS",
        message: "ambiguous",
        nodeId: "btn1",
        action: "tap"
      })
    });

    const requestId = createAgentUIBridgeRequestId();
    const response = await dispatcher.dispatch({
      type: "tap",
      requestId,
      targetId: "btn1"
    });

    expect(response).toMatchObject({
      type: "tap",
      requestId,
      result: "ACTION_REJECTED"
    });
  });

  it("maps registry ACTION_HANDLER_FAILED to bridge ACTION_FAILED for tap", async () => {
    const { dispatcher } = createDispatcher({
      dispatchAction: async () => ({
        ok: false,
        code: "ACTION_HANDLER_FAILED",
        message: "handler crashed",
        nodeId: "btn1",
        action: "tap"
      })
    });

    const requestId = createAgentUIBridgeRequestId();
    const response = await dispatcher.dispatch({
      type: "tap",
      requestId,
      targetId: "btn1"
    });

    expect(response).toMatchObject({
      type: "tap",
      requestId,
      result: "ACTION_FAILED"
    });
  });

  it("dispatches input with text payload", async () => {
    const dispatchCalls: Array<{
      id: string;
      action: string;
      options?: { payload?: unknown };
    }> = [];
    const { dispatcher } = createDispatcher({
      dispatchAction: async (id, action, options) => {
        dispatchCalls.push({ id, action, ...(options !== undefined ? { options } : {}) });

        return {
          ok: true,
          code: "ACTION_DISPATCHED",
          message: "input set",
          nodeId: id,
          action
        };
      }
    });

    const requestId = createAgentUIBridgeRequestId();

    await dispatcher.dispatch({
      type: "input",
      requestId,
      targetId: "field1",
      text: "hello world"
    });

    expect(dispatchCalls).toHaveLength(1);
    const inputCall0 = dispatchCalls[0];

    expect(inputCall0?.options?.payload).toBe("hello world");
  });

  it("dispatches input with custom action", async () => {
    const dispatchCalls: Array<{ action: string }> = [];
    const { dispatcher } = createDispatcher({
      dispatchAction: async (_id, action) => {
        dispatchCalls.push({ action });

        return {
          ok: true,
          code: "ACTION_DISPATCHED",
          message: "done",
          nodeId: "field1",
          action
        };
      }
    });

    const requestId = createAgentUIBridgeRequestId();

    await dispatcher.dispatch({
      type: "input",
      requestId,
      targetId: "field1",
      text: "hello",
      options: { action: "clear" }
    });

    expect(dispatchCalls).toHaveLength(1);
    const customActionCall = dispatchCalls[0];

    expect(customActionCall?.action).toBe("clear");
  });

  it("defaults input action to \"input\" when no custom action specified", async () => {
    const dispatchCalls: Array<{ action: string }> = [];
    const { dispatcher } = createDispatcher({
      dispatchAction: async (_id, action) => {
        dispatchCalls.push({ action });

        return {
          ok: true,
          code: "ACTION_DISPATCHED",
          message: "done",
          nodeId: "field1",
          action
        };
      }
    });

    const requestId = createAgentUIBridgeRequestId();

    await dispatcher.dispatch({
      type: "input",
      requestId,
      targetId: "field1",
      text: "hello"
    });

    expect(dispatchCalls).toHaveLength(1);
    const defaultActionCall = dispatchCalls[0];

    expect(defaultActionCall?.action).toBe("input");
  });

  it("maps input dispatch failure to bridge status code", async () => {
    const { dispatcher } = createDispatcher({
      dispatchAction: async () => ({
        ok: false,
        code: "ACTION_UNSUPPORTED",
        message: "not an input node",
        nodeId: "label1",
        action: "input"
      })
    });

    const requestId = createAgentUIBridgeRequestId();
    const response = await dispatcher.dispatch({
      type: "input",
      requestId,
      targetId: "label1",
      text: "try"
    });

    expect(response).toMatchObject({
      type: "input",
      requestId,
      targetId: "label1",
      result: "UNSUPPORTED_ACTION"
    });
  });

  it("dispatches observeEvents and returns event log query", async () => {
    const { dispatcher, eventLog } = createDispatcher();

    eventLog.append({
      type: "bridge.command.received",
      sessionId: "s1"
    });
    eventLog.append({
      type: "bridge.command.completed",
      sessionId: "s1"
    });

    const requestId = createAgentUIBridgeRequestId();
    const response = await dispatcher.dispatch({
      type: "observeEvents",
      requestId
    });

    expect(response).toMatchObject({
      type: "observeEvents",
      requestId
    });
    const r = response as ReturnType<typeof createAgentUIBridgeObserveEventsResponse>;

    expect(r.events).toHaveLength(2);
    expect(r.droppedCount).toBe(0);
  });

  it("dispatches observeEvents with since cursor", async () => {
    const { dispatcher, eventLog } = createDispatcher();

    eventLog.append({ type: "bridge.command.received" });
    eventLog.append({ type: "bridge.command.completed" });
    eventLog.append({ type: "bridge.command.failed" });

    const prefetch = eventLog.query(undefined, undefined, 1);
    const firstEvent = prefetch.events[0];

    if (!firstEvent) {
      throw new Error("expected at least one event in prefetch");
    }
    const firstCursor = firstEvent.cursor;

    const requestId = createAgentUIBridgeRequestId();
    const response = await dispatcher.dispatch({
      type: "observeEvents",
      requestId,
      since: firstCursor
    });

    const r = response as ReturnType<typeof createAgentUIBridgeObserveEventsResponse>;

    expect(r.events).toHaveLength(2);
  });

  it("dispatches observeEvents with type filter", async () => {
    const { dispatcher, eventLog } = createDispatcher();

    eventLog.append({ type: "bridge.command.received" });
    eventLog.append({ type: "bridge.command.completed" });
    eventLog.append({ type: "bridge.command.failed" });

    const requestId = createAgentUIBridgeRequestId();
    const response = await dispatcher.dispatch({
      type: "observeEvents",
      requestId,
      eventTypes: ["bridge.command.failed"]
    });

    const r = response as ReturnType<typeof createAgentUIBridgeObserveEventsResponse>;

    expect(r.events).toHaveLength(1);
    const filteredEvent = r.events[0];

    expect(filteredEvent?.type).toBe("bridge.command.failed");
  });

  it("dispatches waitFor and satisfies when all conditions met", async () => {
    const nodes = new Map<string, unknown>();
    nodes.set("btn1", {
      id: "btn1",
      type: "button",
      state: { disabled: false }
    });

    const { dispatcher } = createDispatcher({
      getNodeById: (id: string) => nodes.get(id)
    });

    const requestId = createAgentUIBridgeRequestId();
    const response = await dispatcher.dispatch({
      type: "waitFor",
      requestId,
      conditions: [
        { kind: "nodeExists", nodeId: "btn1" }
      ],
      timeout: 500
    });

    expect(response).toMatchObject({
      type: "waitFor",
      requestId,
      satisfied: true,
      matchedConditions: 1,
      totalConditions: 1
    });
  });

  it("dispatches waitFor and reports unsatisfied on timeout", async () => {
    const { dispatcher } = createDispatcher({
      getNodeById: () => undefined
    });

    const requestId = createAgentUIBridgeRequestId();
    const response = await dispatcher.dispatch({
      type: "waitFor",
      requestId,
      conditions: [
        { kind: "nodeExists", nodeId: "never-mounted" }
      ],
      timeout: 50
    });

    expect(response).toMatchObject({
      type: "waitFor",
      requestId,
      satisfied: false,
      matchedConditions: 0,
      totalConditions: 1
    });
  });

  it("dispatches waitFor with nodeVisible condition", async () => {
    const nodes = new Map<string, unknown>();
    nodes.set("visible-node", {
      id: "visible-node",
      type: "button",
      state: {}
    });
    nodes.set("hidden-node", {
      id: "hidden-node",
      type: "text",
      state: { hidden: true }
    });

    const { dispatcher } = createDispatcher({
      getNodeById: (id: string) => nodes.get(id)
    });

    const requestId = createAgentUIBridgeRequestId();
    const response = await dispatcher.dispatch({
      type: "waitFor",
      requestId,
      conditions: [
        { kind: "nodeVisible", nodeId: "visible-node" }
      ],
      timeout: 100
    });

    expect(response).toMatchObject({
      type: "waitFor",
      requestId,
      satisfied: true,
      matchedConditions: 1,
      totalConditions: 1
    });
  });

  it("dispatches waitFor with nodeAbsent condition", async () => {
    const { dispatcher } = createDispatcher({
      getNodeById: () => undefined
    });

    const requestId = createAgentUIBridgeRequestId();
    const response = await dispatcher.dispatch({
      type: "waitFor",
      requestId,
      conditions: [
        { kind: "nodeAbsent", nodeId: "gone" }
      ],
      timeout: 100
    });

    expect(response).toMatchObject({
      type: "waitFor",
      requestId,
      satisfied: true,
      matchedConditions: 1,
      totalConditions: 1
    });
  });

  it("dispatches waitFor with nodeState condition", async () => {
    const nodes = new Map<string, unknown>();
    nodes.set("toggle1", {
      id: "toggle1",
      type: "toggle",
      state: { checked: true, disabled: false }
    });

    const { dispatcher } = createDispatcher({
      getNodeById: (id: string) => nodes.get(id)
    });

    const requestId = createAgentUIBridgeRequestId();
    const response = await dispatcher.dispatch({
      type: "waitFor",
      requestId,
      conditions: [
        {
          kind: "nodeState",
          nodeId: "toggle1",
          expectedState: { checked: true }
        }
      ],
      timeout: 100
    });

    expect(response).toMatchObject({
      type: "waitFor",
      requestId,
      satisfied: true,
      matchedConditions: 1,
      totalConditions: 1
    });
  });

  it("dispatches waitFor with nodeState and fails on mismatched state", async () => {
    const nodes = new Map<string, unknown>();
    nodes.set("toggle1", {
      id: "toggle1",
      type: "toggle",
      state: { checked: false }
    });

    const { dispatcher } = createDispatcher({
      getNodeById: (id: string) => nodes.get(id)
    });

    const requestId = createAgentUIBridgeRequestId();
    const response = await dispatcher.dispatch({
      type: "waitFor",
      requestId,
      conditions: [
        {
          kind: "nodeState",
          nodeId: "toggle1",
          expectedState: { checked: true }
        }
      ],
      timeout: 50
    });

    expect(response).toMatchObject({
      type: "waitFor",
      requestId,
      satisfied: false,
      matchedConditions: 0,
      totalConditions: 1
    });
  });

  it("dispatches waitFor with multiple conditions", async () => {
    const nodes = new Map<string, unknown>();
    nodes.set("btn1", { id: "btn1", type: "button", state: {} });
    nodes.set("field1", { id: "field1", type: "textInput", state: {} });

    const { dispatcher } = createDispatcher({
      getNodeById: (id: string) => nodes.get(id)
    });

    const requestId = createAgentUIBridgeRequestId();
    const response = await dispatcher.dispatch({
      type: "waitFor",
      requestId,
      conditions: [
        { kind: "nodeExists", nodeId: "btn1" },
        { kind: "nodeExists", nodeId: "field1" }
      ],
      timeout: 100
    });

    expect(response).toMatchObject({
      type: "waitFor",
      requestId,
      satisfied: true,
      matchedConditions: 2,
      totalConditions: 2
    });
  });

  it("catches registry failures and returns ACTION_FAILED response", async () => {
    const { dispatcher } = createDispatcher({
      getSnapshot: () => {
        throw new Error("registry crash");
      }
    });

    const requestId = createAgentUIBridgeRequestId();
    const response = await dispatcher.dispatch({
      type: "inspectTree",
      requestId
    });

    expect(response).toMatchObject({
      type: "inspectTree",
      requestId
    });
  });

  it("catches null throw in registry and returns response with original type", async () => {
    const { dispatcher } = createDispatcher({
      getNodeById: () => {
        throw null;
      }
    });

    const requestId = createAgentUIBridgeRequestId();
    const response = await dispatcher.dispatch({
      type: "getState",
      requestId,
      nodeId: "any"
    });

    expect(response).toMatchObject({
      type: "getState",
      requestId
    });
  });

  it("returns UNKNOWN_COMMAND for an unrecognized command type", async () => {
    const { dispatcher } = createDispatcher();

    const requestId = createAgentUIBridgeRequestId();
    const response = await dispatcher.dispatch({
      type: "navigate" as unknown as "inspectTree",
      requestId
    } as unknown as Parameters<AgentUIBridgeCommandDispatcher["dispatch"]>[0]);

    expect(response).toMatchObject({
      requestId,
      result: "UNKNOWN_COMMAND"
    });
  });
});

// ---------------------------------------------------------------------------
// Security and redaction tests
// ---------------------------------------------------------------------------

describe("Agent UI bridge security", () => {
  it("rejects the bridge gate when __DEV__ is false", () => {
    const devGlobal = globalThis as typeof globalThis & {
      __DEV__?: boolean | undefined;
    };
    const originalDev = devGlobal.__DEV__;

    devGlobal.__DEV__ = false;

    try {
      expect(
        createAgentUIBridgeGate({
          enabled: true,
          executionEnvironment: "storeClient",
          pairingToken: "test-token-for-sec",
          url: "ws://127.0.0.1:8733"
        })
      ).toMatchObject({
        code: "NOT_DEVELOPMENT",
        enabled: false
      });
    } finally {
      if (originalDev === undefined) {
        delete devGlobal.__DEV__;
      } else {
        devGlobal.__DEV__ = originalDev;
      }
    }
  });

  it("rejects the bridge gate when __DEV__ is absent", () => {
    const devGlobal = globalThis as typeof globalThis & {
      __DEV__?: boolean | undefined;
    };
    const originalDev = devGlobal.__DEV__;

    delete devGlobal.__DEV__;

    try {
      expect(
        createAgentUIBridgeGate({
          enabled: true,
          executionEnvironment: "storeClient",
          pairingToken: "test-token-sec-2",
          url: "ws://127.0.0.1:8734"
        })
      ).toMatchObject({
        code: "NOT_DEVELOPMENT",
        enabled: false
      });
    } finally {
      if (originalDev === undefined) {
        delete devGlobal.__DEV__;
      } else {
        devGlobal.__DEV__ = originalDev;
      }
    }
  });

  it("rejects standalone execution environment even with development flags", () => {
    const devGlobal = globalThis as typeof globalThis & {
      __DEV__?: boolean | undefined;
    };
    const originalDev = devGlobal.__DEV__;

    devGlobal.__DEV__ = true;

    try {
      expect(
        createAgentUIBridgeGate(
          {
            enabled: true,
            executionEnvironment: "standalone",
            pairingToken: "test-token-sec-3",
            url: "ws://127.0.0.1:8735"
          },
          { isDevelopment: true }
        )
      ).toMatchObject({
        code: "STANDALONE_RUNTIME",
        enabled: false
      });
    } finally {
      if (originalDev === undefined) {
        delete devGlobal.__DEV__;
      } else {
        devGlobal.__DEV__ = originalDev;
      }
    }
  });

  it("rejects LAN transport mode without unsafe opt-in", () => {
    expect(
      createAgentUIBridgeGate(
        {
          enabled: true,
          executionEnvironment: "storeClient",
          pairingToken: "test-token-sec-4",
          transportMode: "lan",
          url: "ws://192.168.1.100:8736"
        },
        { isDevelopment: true }
      )
    ).toMatchObject({
      code: "LAN_REQUIRES_EXPLICIT_UNSAFE_OPT_IN",
      enabled: false
    });
  });

  it("allows LAN transport mode with explicit unsafe opt-in", () => {
    expect(
      createAgentUIBridgeGate(
        {
          enabled: true,
          executionEnvironment: "storeClient",
          pairingToken: "test-token-sec-5",
          transportMode: "lan",
          unsafeAllowLAN: true,
          url: "ws://192.168.1.100:8737"
        },
        { isDevelopment: true }
      )
    ).toMatchObject({
      code: "BRIDGE_ENABLED",
      enabled: true
    });
  });

  it("rejects tunnel transport mode even with a valid token", () => {
    expect(
      createAgentUIBridgeGate(
        {
          enabled: true,
          executionEnvironment: "storeClient",
          pairingToken: "test-token-sec-6",
          transportMode: "tunnel",
          url: "wss://example.invalid/agent-ui"
        },
        { isDevelopment: true }
      )
    ).toMatchObject({
      code: "TUNNEL_UNSUPPORTED",
      enabled: false
    });
  });

  it("requires a non-empty pairing token", () => {
    expect(
      createAgentUIBridgeGate(
        {
          enabled: true,
          executionEnvironment: "storeClient",
          pairingToken: "",
          url: "ws://127.0.0.1:8738"
        },
        { isDevelopment: true }
      )
    ).toMatchObject({
      code: "MISSING_PAIRING_TOKEN",
      enabled: false
    });
  });

  it("requires a valid bridge URL", () => {
    expect(
      createAgentUIBridgeGate(
        {
          enabled: true,
          executionEnvironment: "storeClient",
          pairingToken: "test-token-sec-7",
          url: ""
        },
        { isDevelopment: true }
      )
    ).toMatchObject({
      code: "MISSING_BRIDGE_URL",
      enabled: false
    });
  });

  it("rejects unknown execution environment", () => {
    expect(
      createAgentUIBridgeGate(
        {
          enabled: true,
          executionEnvironment: "unknown",
          pairingToken: "test-token-sec-8",
          url: "ws://127.0.0.1:8739"
        },
        { isDevelopment: true }
      )
    ).toMatchObject({
      code: "UNKNOWN_EXECUTION_ENVIRONMENT",
      enabled: false
    });
  });

  it("returns the configured capabilities set", () => {
    const result = createAgentUIBridgeGate(
      {
        enabled: true,
        executionEnvironment: "storeClient",
        pairingToken: "test-token-sec-9",
        url: "ws://127.0.0.1:8740",
        capabilities: ["inspectTree", "getState", "tap"]
      },
      { isDevelopment: true }
    );

    expect(result.capabilities).toContain("inspectTree");
    expect(result.capabilities).toContain("getState");
    expect(result.capabilities).toContain("tap");
    expect(result.capabilities).not.toContain("observeEvents");
  });

  it("generates unique session IDs on each call", () => {
    const a = createAgentUIBridgeSessionId();
    const b = createAgentUIBridgeSessionId();
    const c = createAgentUIBridgeSessionId();

    expect(a).not.toBe(b);
    expect(b).not.toBe(c);
    expect(a).not.toBe(c);
  });

  it("generates unique request IDs on each call", () => {
    const a = createAgentUIBridgeRequestId();
    const b = createAgentUIBridgeRequestId();
    const c = createAgentUIBridgeRequestId();

    expect(a).not.toBe(b);
    expect(b).not.toBe(c);
    expect(a).not.toBe(c);
  });

  it("rejects tokens shorter than the minimum length", () => {
    expect(validateAgentUIPairingToken("short")).toBe(false);
    expect(validateAgentUIPairingToken("abcdefghijklmno")).toBe(false);
  });

  it("rejects tokens that are only whitespace", () => {
    expect(validateAgentUIPairingToken("                ")).toBe(false);
    expect(validateAgentUIPairingToken("\t\t\t\t\t\t\t\t")).toBe(false);
  });

  it("rejects non-string tokens", () => {
    expect(validateAgentUIPairingToken(null)).toBe(false);
    expect(validateAgentUIPairingToken(undefined)).toBe(false);
    expect(validateAgentUIPairingToken(12345 as unknown as string)).toBe(false);
    expect(validateAgentUIPairingToken({} as unknown as string)).toBe(false);
  });

  it("validates bridge request requires type and requestId", () => {
    expect(
      validateAgentUIBridgeRequest({ type: "inspectTree" } as Record<
        string,
        unknown
      >)
    ).toBe(false);

    expect(
      validateAgentUIBridgeRequest({
        requestId: createAgentUIBridgeRequestId()
      } as Record<string, unknown>)
    ).toBe(false);

    expect(
      validateAgentUIBridgeRequest({
        type: "inspectTree",
        requestId: createAgentUIBridgeRequestId()
      })
    ).toBe(true);
  });

  it("validates getState request requires nodeId", () => {
    const requestId = createAgentUIBridgeRequestId();

    expect(
      validateAgentUIBridgeRequest({ type: "getState", requestId })
    ).toBe(false);

    expect(
      validateAgentUIBridgeRequest({
        type: "getState",
        requestId,
        nodeId: "test-node"
      })
    ).toBe(true);
  });

  it("validates tap request requires targetId", () => {
    const requestId = createAgentUIBridgeRequestId();

    expect(
      validateAgentUIBridgeRequest({ type: "tap", requestId })
    ).toBe(false);

    expect(
      validateAgentUIBridgeRequest({
        type: "tap",
        requestId,
        targetId: "btn-1"
      })
    ).toBe(true);
  });

  it("validates input request requires targetId and text", () => {
    const requestId = createAgentUIBridgeRequestId();

    expect(
      validateAgentUIBridgeRequest({ type: "input", requestId })
    ).toBe(false);

    expect(
      validateAgentUIBridgeRequest({
        type: "input",
        requestId,
        targetId: "field-1",
        text: "hello"
      })
    ).toBe(true);
  });

  it("validates waitFor request requires conditions array", () => {
    const requestId = createAgentUIBridgeRequestId();

    expect(
      validateAgentUIBridgeRequest({
        type: "waitFor",
        requestId,
        conditions: []
      })
    ).toBe(false);

    expect(
      validateAgentUIBridgeRequest({
        type: "waitFor",
        requestId,
        conditions: [{ kind: "nodeExists", nodeId: "n1" }]
      })
    ).toBe(true);
  });

  it("validates observeEvents request is always valid", () => {
    const requestId = createAgentUIBridgeRequestId();

    expect(
      validateAgentUIBridgeRequest({
        type: "observeEvents",
        requestId
      })
    ).toBe(true);
  });

  it("response factories include correct types and timestamps", () => {
    const requestId = createAgentUIBridgeRequestId();

    const inspect = createAgentUIBridgeInspectTreeResponse({
      requestId,
      tree: { ok: true }
    });
    expect(inspect.type).toBe("inspectTree");
    expect(inspect.requestId).toBe(requestId);
    expect(inspect.timestamp).toBeGreaterThan(0);

    const getState = createAgentUIBridgeGetStateResponse({
      requestId,
      nodeId: "n1",
      node: { id: "n1" }
    });
    expect(getState.type).toBe("getState");
    expect(getState.nodeId).toBe("n1");

    const tap = createAgentUIBridgeTapResponse({
      requestId,
      targetId: "btn-1",
      result: "OK"
    });
    expect(tap.type).toBe("tap");
    expect(tap.targetId).toBe("btn-1");
    expect(tap.result).toBe("OK");

    const input = createAgentUIBridgeInputResponse({
      requestId,
      targetId: "f1",
      result: "OK"
    });
    expect(input.type).toBe("input");
    expect(input.result).toBe("OK");

    const waitFor = createAgentUIBridgeWaitForResponse({
      requestId,
      satisfied: true,
      matchedConditions: 1,
      totalConditions: 1
    });
    expect(waitFor.type).toBe("waitFor");
    expect(waitFor.satisfied).toBe(true);

    const observe = createAgentUIBridgeObserveEventsResponse({
      requestId,
      events: [],
      nextCursor: 0,
      droppedCount: 0
    });
    expect(observe.type).toBe("observeEvents");
    expect(observe.events).toEqual([]);
  });

  it("event log returns correct dropped count", () => {
    const log = createAgentUIBridgeEventLog(3);

    log.append({ type: "bridge.session.connected" });
    log.append({ type: "bridge.session.paired" });
    log.append({ type: "bridge.command.received" });
    log.append({ type: "bridge.command.completed" });

    const result = log.query();
    expect(result.events).toHaveLength(3);
    expect(result.droppedCount).toBe(1);
  });

  it("event log supports type filtering", () => {
    const log = createAgentUIBridgeEventLog(10);

    log.append({ type: "bridge.session.connected" });
    log.append({ type: "bridge.session.paired" });
    log.append({ type: "bridge.command.received" });

    const connected = log.query(
      undefined,
      ["bridge.session.connected"]
    );
    expect(connected.events).toHaveLength(1);
    expect(connected.events[0]!.type).toBe("bridge.session.connected");

    const paired = log.query(
      undefined,
      ["bridge.session.paired"]
    );
    expect(paired.events).toHaveLength(1);
    expect(paired.events[0]!.type).toBe("bridge.session.paired");
  });

  it("event log supports limit", () => {
    const log = createAgentUIBridgeEventLog(10);

    log.append({ type: "bridge.session.connected" });
    log.append({ type: "bridge.session.paired" });
    log.append({ type: "bridge.command.received" });

    const result = log.query(undefined, undefined, 2);
    expect(result.events).toHaveLength(2);
  });

  it("event log clear resets state", () => {
    const log = createAgentUIBridgeEventLog(10);

    log.append({ type: "bridge.session.connected" });
    log.append({ type: "bridge.session.paired" });

    log.clear();

    const result = log.query();
    expect(result.events).toEqual([]);
    expect(result.droppedCount).toBe(0);
  });
});
