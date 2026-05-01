import type {
  AgentUIBridgeCommandRequest,
  AgentUIBridgeCommandResponse,
  AgentUIBridgeHelloEnvelope,
  AgentUIBridgeHeartbeatAckEnvelope,
  AgentUIBridgeSessionId,
  AgentUIBridgeWelcomeEnvelope
} from "@agent-ui/core";
import type { IncomingMessage } from "node:http";
import { timingSafeEqual } from "node:crypto";
import type { WebSocket } from "ws";
import { WebSocketServer } from "ws";

const AGENT_UI_BRIDGE_PROTOCOL_VERSION = 1 as const;

export type AgentUIMcpListenerState =
  | "idle"
  | "listening"
  | "closed";

export interface AgentUIMcpListenerConfig {
  port?: number | undefined;
  host?: string | undefined;
  expectedPairingToken: string;
  serverCapabilities?: readonly string[] | undefined;
  heartbeatIntervalMs?: number | undefined;
  heartbeatMaxMissed?: number | undefined;
}

export interface AgentUIMcpAppSession {
  readonly sessionId: string;
  readonly appId?: string | undefined;
  readonly appName?: string | undefined;
  readonly capabilities: readonly string[];
  readonly state: "connecting" | "paired" | "active" | "disconnected";
  readonly connectedAt: number;
  sendCommand(
    request: AgentUIBridgeCommandRequest,
    timeoutMs?: number | undefined
  ): Promise<AgentUIBridgeCommandResponse>;
  close(): void;
}

export interface AgentUIMcpListener {
  readonly state: AgentUIMcpListenerState;
  readonly port: number;
  readonly host: string;
  start(): Promise<void>;
  close(): Promise<void>;
  onSessionConnected: ((session: AgentUIMcpAppSession) => void) | null;
  onSessionDisconnected: ((session: AgentUIMcpAppSession) => void) | null;
  readonly activeSession: AgentUIMcpAppSession | undefined;
}

const DEFAULT_LISTENER_PORT = 9721;
const DEFAULT_LISTENER_HOST = "127.0.0.1";
const DEFAULT_HEARTBEAT_INTERVAL = 15000;
const DEFAULT_HEARTBEAT_MAX_MISSED = 3;

function constantTimeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  const maxLen = Math.max(aBuf.length, bBuf.length);
  const paddedA = Buffer.alloc(maxLen, 0);
  const paddedB = Buffer.alloc(maxLen, 0);
  aBuf.copy(paddedA);
  bBuf.copy(paddedB);

  try {
    return timingSafeEqual(paddedA, paddedB);
  } catch {
    return false;
  }
}

interface PendingRequest {
  resolve: (response: AgentUIBridgeCommandResponse) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

function createAppSession(
  ws: WebSocket,
  hello: AgentUIBridgeHelloEnvelope,
  sessionId: AgentUIBridgeSessionId,
  _welcome: AgentUIBridgeWelcomeEnvelope,
  heartbeatIntervalMs: number,
  heartbeatMaxMissed: number
): AgentUIMcpAppSession {
  const pending = new Map<string, PendingRequest>();
  let sessionState: "connecting" | "paired" | "active" | "disconnected" =
    "paired";
  let heartbeatTimer: ReturnType<typeof setInterval> | undefined;
  let heartbeatMissed = 0;
  let isClosed = false;

  function cleanup(): void {
    if (isClosed) {
      return;
    }

    isClosed = true;
    sessionState = "disconnected";

    if (heartbeatTimer !== undefined) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = undefined;
    }

    for (const pendingReq of pending.values()) {
      clearTimeout(pendingReq.timer);
      pendingReq.reject(new Error("SESSION_DISCONNECTED"));
    }

    pending.clear();

    try {
      ws.close(1000, "session closed");
    } catch {
      // ignore close errors
    }
  }

  heartbeatTimer = setInterval(() => {
    if (sessionState === "disconnected") {
      cleanup();
      return;
    }

    heartbeatMissed += 1;

    if (heartbeatMissed > heartbeatMaxMissed) {
      cleanup();
      return;
    }

    const ack: AgentUIBridgeHeartbeatAckEnvelope = {
      sessionId,
      serverTimestamp: Date.now()
    };

    try {
      ws.send(JSON.stringify(ack));
    } catch {
      cleanup();
    }
  }, heartbeatIntervalMs);

  ws.on("message", (raw) => {
    if (sessionState === "disconnected") {
      return;
    }

    let message: unknown;

    try {
      message = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (
      typeof message !== "object" ||
      message === null ||
      Array.isArray(message)
    ) {
      return;
    }

    const obj = message as Record<string, unknown>;

    // heartbeat from client
    if (
      typeof obj.sessionId === "string" &&
      obj.sessionId === sessionId &&
      typeof obj.clientTimestamp === "number"
    ) {
      heartbeatMissed = 0;

      if (sessionState === "paired") {
        sessionState = "active";
      }

      return;
    }

    // command response from app
    if (
      typeof obj.type === "string" &&
      typeof obj.requestId === "string" &&
      typeof obj.timestamp === "number"
    ) {
      const requestId = obj.requestId;
      const pendingReq = pending.get(requestId);

      if (pendingReq) {
        pending.delete(requestId);
        clearTimeout(pendingReq.timer);
        pendingReq.resolve(obj as unknown as AgentUIBridgeCommandResponse);
      }

      return;
    }
  });

  ws.on("close", () => {
    cleanup();
  });

  ws.on("error", () => {
    cleanup();
  });

  return {
    sessionId,
    appId: hello.appId,
    appName: hello.appName,
    capabilities: [...hello.capabilities],
    get state(): "connecting" | "paired" | "active" | "disconnected" {
      return sessionState;
    },
    connectedAt: Date.now(),

    sendCommand(
      request: AgentUIBridgeCommandRequest,
      timeoutMs?: number | undefined
    ): Promise<AgentUIBridgeCommandResponse> {
      if (sessionState === "disconnected") {
        return Promise.reject(new Error("SESSION_DISCONNECTED"));
      }

      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.delete(request.requestId);
          reject(new Error("COMMAND_TIMEOUT"));
        }, timeoutMs ?? 5000);

        pending.set(request.requestId, { resolve, reject, timer });

        try {
          ws.send(JSON.stringify(request));
        } catch (err) {
          pending.delete(request.requestId);
          clearTimeout(timer);
          reject(
            err instanceof Error ? err : new Error("SEND_FAILED")
          );
        }
      });
    },

    close(): void {
      cleanup();
    }
  };
}

function validateHello(
  hello: unknown
): hello is AgentUIBridgeHelloEnvelope {
  if (
    typeof hello !== "object" ||
    hello === null ||
    Array.isArray(hello)
  ) {
    return false;
  }

  const h = hello as Record<string, unknown>;

  return (
    h.protocolVersion === AGENT_UI_BRIDGE_PROTOCOL_VERSION &&
    typeof h.pairingToken === "string" &&
    h.pairingToken.trim().length > 0 &&
    Array.isArray(h.capabilities) &&
    h.capabilities.length > 0
  );
}

interface ListenerInternals {
  state: AgentUIMcpListenerState;
  wss: WebSocketServer | undefined;
  active: AgentUIMcpAppSession | undefined;
}

const STANDARD_SERVER_CAPABILITIES: readonly string[] = [
  "inspectTree",
  "getState"
];

export function createAgentUIMcpListener(
  config: AgentUIMcpListenerConfig
): AgentUIMcpListener {
  const internals: ListenerInternals = {
    state: "idle",
    wss: undefined,
    active: undefined
  };

  const port = config.port ?? DEFAULT_LISTENER_PORT;
  const host = config.host ?? DEFAULT_LISTENER_HOST;
  const serverCapabilities =
    config.serverCapabilities ?? STANDARD_SERVER_CAPABILITIES;
  const expectedPairingToken = config.expectedPairingToken;

  let onSessionConnected: ((s: AgentUIMcpAppSession) => void) | null = null;
  let onSessionDisconnected: ((s: AgentUIMcpAppSession) => void) | null = null;

  return {
    get state(): AgentUIMcpListenerState {
      return internals.state;
    },

    get port(): number {
      return port;
    },

    get host(): string {
      return host;
    },

    get onSessionConnected(): ((s: AgentUIMcpAppSession) => void) | null {
      return onSessionConnected;
    },

    set onSessionConnected(
      value: ((s: AgentUIMcpAppSession) => void) | null
    ) {
      onSessionConnected = value;
    },

    get onSessionDisconnected(): ((s: AgentUIMcpAppSession) => void) | null {
      return onSessionDisconnected;
    },

    set onSessionDisconnected(
      value: ((s: AgentUIMcpAppSession) => void) | null
    ) {
      onSessionDisconnected = value;
    },

    get activeSession(): AgentUIMcpAppSession | undefined {
      if (internals.active?.state === "disconnected") {
        return undefined;
      }

      return internals.active;
    },

    start(): Promise<void> {
      if (internals.state === "listening") {
        return Promise.resolve();
      }

      if (internals.state === "closed") {
        return Promise.reject(new Error("LISTENER_CLOSED"));
      }

      return new Promise((resolve, reject) => {
        const wss = new WebSocketServer({ host, port });

        wss.on("listening", () => {
          internals.state = "listening";
          internals.wss = wss;
          resolve();
        });

        wss.on("error", (err) => {
          internals.state = "closed";
          internals.wss = undefined;
          reject(err);
        });

        wss.on("connection", (ws: WebSocket, _req: IncomingMessage) => {
          if (internals.active !== undefined) {
            try {
              ws.send(
                JSON.stringify({
                  error: "TOO_MANY_SESSIONS",
                  message: "only one active app session is allowed"
                })
              );
              ws.close(1008, "too many sessions");
            } catch {
              // ignore
            }

            return;
          }

          let firstMessageHandled = false;
          const helloTimer = setTimeout(() => {
            if (!firstMessageHandled) {
              try {
                ws.send(
                  JSON.stringify({
                    error: "HELLO_TIMEOUT",
                    message: "no hello envelope received within 10s"
                  })
                );
              } catch {
                // ignore
              }

              ws.close(1008, "hello timeout");
            }
          }, 10000);

          ws.on("message", (raw) => {
            if (firstMessageHandled) {
              return;
            }

            firstMessageHandled = true;
            clearTimeout(helloTimer);

            let hello: unknown;

            try {
              hello = JSON.parse(raw.toString());
            } catch {
              try {
                ws.send(
                  JSON.stringify({
                    error: "INVALID_JSON",
                    message: "hello envelope must be valid JSON"
                  })
                );
              } catch {
                // ignore
              }

              ws.close(1002, "invalid hello");

              return;
            }

            if (!validateHello(hello)) {
              try {
                ws.send(
                  JSON.stringify({
                    error: "INVALID_HELLO",
                    message:
                      "hello envelope must have protocolVersion 1, non-empty pairingToken, and non-empty capabilities array"
                  })
                );
              } catch {
                // ignore
              }

              ws.close(1002, "invalid hello");

              return;
            }

            const helloEnvelope = hello;

            if (!constantTimeEqual(helloEnvelope.pairingToken, expectedPairingToken)) {
              try {
                ws.send(
                  JSON.stringify({
                    error: "INVALID_PAIRING_TOKEN",
                    message: "pairing token mismatch"
                  })
                );
              } catch {
                // ignore
              }

              ws.close(1008, "invalid pairing token");

              return;
            }

            const sessionId =
              `srv_${Date.now().toString(36)}_${Math.random()
                .toString(36)
                .slice(2, 10)}` as AgentUIBridgeSessionId;

            const epoch = 1;
            const welcome: AgentUIBridgeWelcomeEnvelope = {
              protocolVersion: AGENT_UI_BRIDGE_PROTOCOL_VERSION,
              sessionId,
              serverCapabilities,
              epoch
            };

            try {
              ws.send(JSON.stringify(welcome));
            } catch {
              ws.close(1011, "failed to send welcome");
              return;
            }

            const session = createAppSession(
              ws,
              helloEnvelope,
              sessionId,
              welcome,
              config.heartbeatIntervalMs ?? DEFAULT_HEARTBEAT_INTERVAL,
              config.heartbeatMaxMissed ?? DEFAULT_HEARTBEAT_MAX_MISSED
            );

            internals.active = session;

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const closedCheck = setInterval(() => {
              if (session.state === "disconnected") {
                clearInterval(closedCheck);

                if (internals.active === session) {
                  internals.active = undefined;
                }

                if (onSessionDisconnected) {
                  onSessionDisconnected(session);
                }
              }
            }, 500);

            if (onSessionConnected) {
              onSessionConnected(session);
            }
          });
        });

        wss.on("close", () => {
          internals.state = "closed";
          internals.wss = undefined;
        });
      });
    },

    close(): Promise<void> {
      const active = internals.active;

      if (active) {
        try {
          active.close();
        } catch {
          // ignore
        }
      }

      internals.active = undefined;

      if (internals.wss) {
        return new Promise((resolve) => {
          const wss = internals.wss;

          if (!wss) {
            resolve();
            return;
          }

          wss.close(() => {
            internals.state = "closed";
            internals.wss = undefined;
            resolve();
          });
        });
      }

      internals.state = "closed";

      return Promise.resolve();
    }
  };
}
