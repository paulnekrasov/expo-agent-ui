import { isDevelopmentRuntime } from "./props";
import { validateFlow, createFlowRunner } from "./flows";
import type { SemanticFlow } from "./flows";

export const AGENT_UI_BRIDGE_PROTOCOL_VERSION = 1 as const;

export type AgentUIBridgeProtocolVersion =
  typeof AGENT_UI_BRIDGE_PROTOCOL_VERSION;

export type AgentUIBridgeExecutionEnvironment =
  | "bare"
  | "standalone"
  | "storeClient"
  | "unknown"
  | (string & {});

export type AgentUIBridgeTransportMode =
  | "android-adb-reverse"
  | "android-emulator"
  | "headless"
  | "lan"
  | "simulator-loopback"
  | "tunnel";

export type AgentUIBridgeCapability =
  | "inspectTree"
  | "getState"
  | "tap"
  | "input"
  | "observeEvents"
  | "waitFor"
  | "runFlow";

export type AgentUIBridgeGateResultCode =
  | "BRIDGE_DISABLED"
  | "BRIDGE_ENABLED"
  | "INVALID_BRIDGE_URL"
  | "LAN_REQUIRES_EXPLICIT_UNSAFE_OPT_IN"
  | "MISSING_BRIDGE_URL"
  | "MISSING_PAIRING_TOKEN"
  | "NOT_DEVELOPMENT"
  | "STANDALONE_RUNTIME"
  | "TUNNEL_UNSUPPORTED"
  | "UNKNOWN_EXECUTION_ENVIRONMENT";

export interface AgentUIBridgeConfig {
  capabilities?: readonly AgentUIBridgeCapability[];
  enabled?: boolean;
  executionEnvironment?: AgentUIBridgeExecutionEnvironment;
  pairingToken?: string;
  transportMode?: AgentUIBridgeTransportMode;
  unsafeAllowLAN?: boolean;
  url?: string;
}

export interface AgentUIBridgeGateOptions {
  isDevelopment?: boolean;
}

export interface AgentUIBridgeGateResult {
  capabilities: AgentUIBridgeCapability[];
  code: AgentUIBridgeGateResultCode;
  enabled: boolean;
  message: string;
  protocolVersion: AgentUIBridgeProtocolVersion;
  transportMode?: AgentUIBridgeTransportMode;
}

export const DEFAULT_AGENT_UI_BRIDGE_CAPABILITIES: readonly AgentUIBridgeCapability[] =
  ["inspectTree", "getState", "tap", "input", "observeEvents", "waitFor", "runFlow"];

function createBridgeGateResult(options: {
  capabilities?: readonly AgentUIBridgeCapability[] | undefined;
  code: AgentUIBridgeGateResultCode;
  enabled: boolean;
  message: string;
  transportMode?: AgentUIBridgeTransportMode | undefined;
}): AgentUIBridgeGateResult {
  return {
    capabilities: [...(options.capabilities ?? [])],
    code: options.code,
    enabled: options.enabled,
    message: options.message,
    protocolVersion: AGENT_UI_BRIDGE_PROTOCOL_VERSION,
    ...(options.transportMode ? { transportMode: options.transportMode } : {})
  };
}

function normalizeExecutionEnvironment(
  executionEnvironment: AgentUIBridgeExecutionEnvironment | undefined
): "bare" | "standalone" | "storeClient" | "unknown" {
  const normalized = String(executionEnvironment ?? "unknown")
    .trim()
    .toLowerCase()
    .replace(/[-_\s]/g, "");

  switch (normalized) {
    case "bare":
      return "bare";
    case "standalone":
      return "standalone";
    case "storeclient":
      return "storeClient";
    default:
      return "unknown";
  }
}

function parseBridgeUrl(url: string | undefined): URL | undefined {
  const trimmedUrl = url?.trim();

  if (!trimmedUrl) {
    return undefined;
  }

  try {
    return new URL(trimmedUrl);
  } catch {
    return undefined;
  }
}

function isLoopbackHost(hostname: string): boolean {
  const host = hostname.toLowerCase();

  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

function isAndroidEmulatorHost(hostname: string): boolean {
  return hostname === "10.0.2.2";
}

function resolveTransportMode(
  parsedUrl: URL,
  configuredMode: AgentUIBridgeTransportMode | undefined
): AgentUIBridgeTransportMode {
  if (configuredMode) {
    return configuredMode;
  }

  if (isAndroidEmulatorHost(parsedUrl.hostname)) {
    return "android-emulator";
  }

  return isLoopbackHost(parsedUrl.hostname) ? "simulator-loopback" : "lan";
}

function hasPairingToken(config: AgentUIBridgeConfig): boolean {
  return typeof config.pairingToken === "string" &&
    config.pairingToken.trim().length > 0;
}

export function createAgentUIBridgeGate(
  config?: AgentUIBridgeConfig,
  options?: AgentUIBridgeGateOptions
): AgentUIBridgeGateResult {
  if (config?.enabled !== true) {
    return createBridgeGateResult({
      code: "BRIDGE_DISABLED",
      enabled: false,
      message: "Agent UI bridge control is disabled until explicitly configured."
    });
  }

  const isDevelopment = options?.isDevelopment ?? isDevelopmentRuntime();

  if (!isDevelopment) {
    return createBridgeGateResult({
      code: "NOT_DEVELOPMENT",
      enabled: false,
      message: "Agent UI bridge control is available only when __DEV__ is true."
    });
  }

  const executionEnvironment = normalizeExecutionEnvironment(
    config.executionEnvironment
  );

  if (executionEnvironment === "standalone") {
    return createBridgeGateResult({
      code: "STANDALONE_RUNTIME",
      enabled: false,
      message: "Agent UI bridge control is disabled for standalone release runtimes."
    });
  }

  if (executionEnvironment === "unknown") {
    return createBridgeGateResult({
      code: "UNKNOWN_EXECUTION_ENVIRONMENT",
      enabled: false,
      message: "Agent UI bridge control requires a known non-standalone execution environment."
    });
  }

  if (!hasPairingToken(config)) {
    return createBridgeGateResult({
      code: "MISSING_PAIRING_TOKEN",
      enabled: false,
      message: "Agent UI bridge control requires an explicit pairing token."
    });
  }

  const hasUrl = typeof config.url === "string" && config.url.trim().length > 0;
  const parsedUrl = parseBridgeUrl(config.url);

  if (!hasUrl) {
    return createBridgeGateResult({
      code: "MISSING_BRIDGE_URL",
      enabled: false,
      message: "Agent UI bridge control requires an explicit bridge URL."
    });
  }

  if (!parsedUrl || !["ws:", "wss:"].includes(parsedUrl.protocol)) {
    return createBridgeGateResult({
      code: "INVALID_BRIDGE_URL",
      enabled: false,
      message: "Agent UI bridge URLs must be valid ws:// or wss:// URLs."
    });
  }

  const transportMode = resolveTransportMode(parsedUrl, config.transportMode);

  if (transportMode === "tunnel") {
    return createBridgeGateResult({
      code: "TUNNEL_UNSUPPORTED",
      enabled: false,
      message: "Agent UI semantic bridge tunnel mode is not supported in v0.",
      transportMode
    });
  }

  const isLocalTransport =
    isLoopbackHost(parsedUrl.hostname) || isAndroidEmulatorHost(parsedUrl.hostname);

  if (
    !isLocalTransport &&
    parsedUrl.protocol === "ws:"
  ) {
    return createBridgeGateResult({
      code: "INVALID_BRIDGE_URL",
      enabled: false,
      message: "Non-loopback bridge URLs must use wss:// for encrypted transport."
    });
  }

  if (
    (transportMode === "lan" || !isLocalTransport) &&
    config.unsafeAllowLAN !== true
  ) {
    return createBridgeGateResult({
      code: "LAN_REQUIRES_EXPLICIT_UNSAFE_OPT_IN",
      enabled: false,
      message: "LAN bridge control requires explicit unsafeAllowLAN opt-in.",
      transportMode
    });
  }

  return createBridgeGateResult({
    capabilities: config.capabilities ?? DEFAULT_AGENT_UI_BRIDGE_CAPABILITIES,
    code: "BRIDGE_ENABLED",
    enabled: true,
    message: "Agent UI bridge control is enabled for this development runtime.",
    transportMode
  });
}

// ---------------------------------------------------------------------------
// Session model
// ---------------------------------------------------------------------------

export type AgentUIBridgeSessionId = string & {
  readonly __agentUIBridgeSessionId: unique symbol;
};

export function createAgentUIBridgeSessionId(): AgentUIBridgeSessionId {
  const bytes = cryptoRandomBytes(8);
  const hex = Array.from(
    bytes,
    (b) => b.toString(16).padStart(2, "0")
  ).join("");

  return `s_${Date.now().toString(36)}_${hex}` as AgentUIBridgeSessionId;
}

export type AgentUIBridgeSessionState =
  | "connecting"
  | "paired"
  | "active"
  | "disconnected"
  | "expired";

export interface AgentUIBridgeSessionDescriptor {
  sessionId: AgentUIBridgeSessionId;
  state: AgentUIBridgeSessionState;
  appId?: string | undefined;
  appName?: string | undefined;
  platform?: string | undefined;
  deviceName?: string | undefined;
  osVersion?: string | undefined;
  capabilities: string[];
  createdAt: number;
  lastHeartbeat: number;
  epoch?: number | undefined;
}

// ---------------------------------------------------------------------------
// Envelopes
// ---------------------------------------------------------------------------

export interface AgentUIBridgeHelloEnvelope {
  protocolVersion: AgentUIBridgeProtocolVersion;
  appId?: string | undefined;
  appName?: string | undefined;
  platform?: string | undefined;
  deviceName?: string | undefined;
  osVersion?: string | undefined;
  capabilities: readonly string[];
  pairingToken: string;
  reconnectSessionId?: string | undefined;
  reconnectEpoch?: number | undefined;
}

export interface AgentUIBridgeWelcomeEnvelope {
  protocolVersion: AgentUIBridgeProtocolVersion;
  sessionId: AgentUIBridgeSessionId;
  serverCapabilities: readonly string[];
  epoch: number;
}

export interface AgentUIBridgeHeartbeatEnvelope {
  sessionId: AgentUIBridgeSessionId;
  clientTimestamp: number;
}

export interface AgentUIBridgeHeartbeatAckEnvelope {
  sessionId: AgentUIBridgeSessionId;
  serverTimestamp: number;
}

// ---------------------------------------------------------------------------
// Pairing token
// ---------------------------------------------------------------------------

const MIN_PAIRING_TOKEN_LENGTH = 16;

export function cryptoRandomBytes(length: number): Uint8Array {
  const crypto = (globalThis as unknown as { crypto?: { getRandomValues: (arr: Uint8Array) => Uint8Array } })
    .crypto;

  if (!crypto?.getRandomValues) {
    throw new Error("crypto.getRandomValues is not available in this runtime");
  }

  return crypto.getRandomValues(new Uint8Array(length));
}

export function generateAgentUIPairingToken(): string {
  const bytes = cryptoRandomBytes(32);
  const hex = Array.from(
    bytes,
    (b) => b.toString(16).padStart(2, "0")
  ).join("");

  return `agentui_${hex}`;
}

export function validateAgentUIPairingToken(
  token: unknown
): token is string {
  if (typeof token !== "string") {
    return false;
  }

  if (token.trim().length < MIN_PAIRING_TOKEN_LENGTH) {
    return false;
  }

  return true;
}

// ---------------------------------------------------------------------------
// Event log
// ---------------------------------------------------------------------------

export type AgentUIBridgeEventType =
  | "bridge.session.connected"
  | "bridge.session.paired"
  | "bridge.session.disconnected"
  | "bridge.session.expired"
  | "bridge.command.received"
  | "bridge.command.completed"
  | "bridge.command.failed"
  | "bridge.error";

export type AgentUIBridgeEventCursor = number;

export interface AgentUIBridgeEvent {
  id: string;
  type: AgentUIBridgeEventType;
  cursor: AgentUIBridgeEventCursor;
  sessionId?: string | undefined;
  timestamp: number;
  payload?: Record<string, unknown> | undefined;
}

export interface AgentUIBridgeEventQueryResult {
  events: AgentUIBridgeEvent[];
  nextCursor: AgentUIBridgeEventCursor;
  droppedCount: number;
}

export interface AgentUIBridgeEventLog {
  readonly total: number;
  append(event: Omit<AgentUIBridgeEvent, "id" | "timestamp" | "cursor">): void;
  query(
    since?: AgentUIBridgeEventCursor | undefined,
    types?: readonly AgentUIBridgeEventType[] | undefined,
    limit?: number | undefined
  ): AgentUIBridgeEventQueryResult;
  clear(): void;
}

const DEFAULT_EVENT_LOG_CAP = 1000;
let eventLogIdCounter = 0;

function generateEventId(): string {
  eventLogIdCounter += 1;

  return `evt_${Date.now().toString(36)}_${eventLogIdCounter.toString(36)}`;
}

export function createAgentUIBridgeEventLog(
  maxSize?: number | undefined
): AgentUIBridgeEventLog {
  const cap = Math.max(1, maxSize ?? DEFAULT_EVENT_LOG_CAP);
  const buffer: AgentUIBridgeEvent[] = [];
  let cursor: AgentUIBridgeEventCursor = 0;
  let totalCount = 0;
  const droppedCursors: AgentUIBridgeEventCursor[] = [];

  function append(
    event: Omit<AgentUIBridgeEvent, "id" | "timestamp" | "cursor">
  ): void {
    cursor += 1;

    const record: AgentUIBridgeEvent = {
      id: generateEventId(),
      type: event.type,
      cursor,
      ...(event.sessionId ? { sessionId: event.sessionId } : {}),
      timestamp: Date.now(),
      ...(event.payload ? { payload: event.payload } : {})
    };

    totalCount += 1;

    if (buffer.length >= cap) {
      const shifted = buffer.shift();

      if (shifted) {
        droppedCursors.push(shifted.cursor);
      }
    }

    buffer.push(record);
  }

  function query(
    since?: AgentUIBridgeEventCursor | undefined,
    types?: readonly AgentUIBridgeEventType[] | undefined,
    limit?: number | undefined
  ): AgentUIBridgeEventQueryResult {
    let filtered = buffer.filter(
      (event) => since === undefined || event.cursor > since
    );

    if (types && types.length > 0) {
      filtered = filtered.filter((event) => types.includes(event.type));
    }

    if (limit !== undefined && limit > 0 && filtered.length > limit) {
      filtered = filtered.slice(0, limit);
    }

    const lastEvent = filtered.length > 0
      ? filtered[filtered.length - 1]
      : undefined;
    const nextCursor = lastEvent?.cursor ?? since ?? cursor;

    const droppedSinceCursor = since !== undefined
      ? droppedCursors.filter((c) => c > since).length
      : droppedCursors.length;

    return {
      events: filtered,
      nextCursor,
      droppedCount: droppedSinceCursor
    };
  }

  function clear(): void {
    buffer.length = 0;
    cursor = 0;
    totalCount = 0;
    droppedCursors.length = 0;
  }

  return {
    get total(): number {
      return totalCount;
    },
    append,
    query,
    clear
  };
}

// ---------------------------------------------------------------------------
// Bridge tool contracts
// ---------------------------------------------------------------------------

export type AgentUIBridgeCommandType =
  | "inspectTree"
  | "getState"
  | "tap"
  | "input"
  | "waitFor"
  | "observeEvents"
  | "runFlow";

export type AgentUIBridgeRequestId = string & {
  readonly __agentUIBridgeRequestId: unique symbol;
};

export function createAgentUIBridgeRequestId(): AgentUIBridgeRequestId {
  const bytes = cryptoRandomBytes(8);
  const hex = Array.from(
    bytes,
    (b) => b.toString(16).padStart(2, "0")
  ).join("");

  return `req_${Date.now().toString(36)}_${hex}` as AgentUIBridgeRequestId;
}

// ---------------------------------------------------------------------------
// inspectTree
// ---------------------------------------------------------------------------

export interface AgentUIBridgeInspectTreeRequest {
  type: "inspectTree";
  requestId: AgentUIBridgeRequestId;
  options?: {
    screen?: string | undefined;
    includeHidden?: boolean | undefined;
    maxDepth?: number | undefined;
    rootId?: string | undefined;
  } | undefined;
}

export interface AgentUIBridgeInspectTreeResponse {
  type: "inspectTree";
  requestId: AgentUIBridgeRequestId;
  tree?: unknown | undefined;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// getState
// ---------------------------------------------------------------------------

export interface AgentUIBridgeGetStateRequest {
  type: "getState";
  requestId: AgentUIBridgeRequestId;
  nodeId: string;
  options?: {
    screen?: string | undefined;
  } | undefined;
}

export interface AgentUIBridgeGetStateResponse {
  type: "getState";
  requestId: AgentUIBridgeRequestId;
  nodeId: string;
  node?: unknown | undefined;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// tap
// ---------------------------------------------------------------------------

export interface AgentUIBridgeTapRequest {
  type: "tap";
  requestId: AgentUIBridgeRequestId;
  targetId: string;
  action?: string | undefined;
  payload?: unknown;
  options?: {
    screen?: string | undefined;
  } | undefined;
}

export interface AgentUIBridgeTapResponse {
  type: "tap";
  requestId: AgentUIBridgeRequestId;
  targetId: string;
  result: AgentUIBridgeCommandStatusCode;
  error?: string | undefined;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// input
// ---------------------------------------------------------------------------

export interface AgentUIBridgeInputRequest {
  type: "input";
  requestId: AgentUIBridgeRequestId;
  targetId: string;
  text: string;
  options?: {
    screen?: string | undefined;
    action?: string | undefined;
  } | undefined;
}

export interface AgentUIBridgeInputResponse {
  type: "input";
  requestId: AgentUIBridgeRequestId;
  targetId: string;
  result: AgentUIBridgeCommandStatusCode;
  error?: string | undefined;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// waitFor
// ---------------------------------------------------------------------------

export interface AgentUIBridgeWaitCondition {
  kind: "nodeExists" | "nodeVisible" | "nodeState" | "nodeAbsent";
  nodeId: string;
  screen?: string | undefined;
  expectedState?: unknown;
}

export interface AgentUIBridgeWaitForRequest {
  type: "waitFor";
  requestId: AgentUIBridgeRequestId;
  conditions: readonly AgentUIBridgeWaitCondition[];
  timeout?: number | undefined;
}

export interface AgentUIBridgeWaitForResponse {
  type: "waitFor";
  requestId: AgentUIBridgeRequestId;
  satisfied: boolean;
  matchedConditions: number;
  totalConditions: number;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// observeEvents
// ---------------------------------------------------------------------------

export interface AgentUIBridgeObserveEventsRequest {
  type: "observeEvents";
  requestId: AgentUIBridgeRequestId;
  since?: AgentUIBridgeEventCursor | undefined;
  eventTypes?: readonly AgentUIBridgeEventType[] | undefined;
  limit?: number | undefined;
}

export interface AgentUIBridgeObserveEventsResponse {
  type: "observeEvents";
  requestId: AgentUIBridgeRequestId;
  events: AgentUIBridgeEvent[];
  nextCursor: AgentUIBridgeEventCursor;
  droppedCount: number;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// runFlow
// ---------------------------------------------------------------------------

export interface AgentUIBridgeRunFlowRequest {
  type: "runFlow";
  requestId: AgentUIBridgeRequestId;
  flow: SemanticFlow;
  options?: {
    timeoutMs?: number | undefined;
  } | undefined;
}

export interface AgentUIBridgeRunFlowResponse {
  type: "runFlow";
  requestId: AgentUIBridgeRequestId;
  result: {
    flowName: string;
    completed: boolean;
    totalSteps: number;
    completedSteps: number;
    failedStep?: number | undefined;
    failedStepType?: string | undefined;
    durationMs: number;
    error?: string | undefined;
  };
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Command unions
// ---------------------------------------------------------------------------

export type AgentUIBridgeCommandRequest =
  | AgentUIBridgeInspectTreeRequest
  | AgentUIBridgeGetStateRequest
  | AgentUIBridgeTapRequest
  | AgentUIBridgeInputRequest
  | AgentUIBridgeWaitForRequest
  | AgentUIBridgeObserveEventsRequest
  | AgentUIBridgeRunFlowRequest;

export type AgentUIBridgeCommandResponse =
  | AgentUIBridgeInspectTreeResponse
  | AgentUIBridgeGetStateResponse
  | AgentUIBridgeTapResponse
  | AgentUIBridgeInputResponse
  | AgentUIBridgeWaitForResponse
  | AgentUIBridgeObserveEventsResponse
  | AgentUIBridgeRunFlowResponse;

// ---------------------------------------------------------------------------
// Status codes
// ---------------------------------------------------------------------------

export type AgentUIBridgeCommandStatusCode =
  | "OK"
  | "UNKNOWN_COMMAND"
  | "INVALID_REQUEST"
  | "NODE_NOT_FOUND"
  | "ACTION_REJECTED"
  | "ACTION_FAILED"
  | "TIMEOUT"
  | "UNSUPPORTED_ACTION";

// ---------------------------------------------------------------------------
// Request validation
// ---------------------------------------------------------------------------

function isStringRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasString(value: unknown, key: string): value is Record<string, unknown> {
  return (
    typeof (value as Record<string, unknown>)[key] === "string" &&
    ((value as Record<string, unknown>)[key] as string).trim().length > 0
  );
}

export function validateAgentUIBridgeRequest(
  request: unknown
): request is AgentUIBridgeCommandRequest {
  if (!isStringRecord(request)) {
    return false;
  }

  if (!hasString(request, "type") || !hasString(request, "requestId")) {
    return false;
  }

  const type = (request as Record<string, unknown>).type as string;

  switch (type) {
    case "inspectTree":
      return true;

    case "getState":
      return hasString(request, "nodeId");

    case "tap":
      return hasString(request, "targetId");

    case "input":
      return hasString(request, "targetId") &&
        typeof (request as Record<string, unknown>).text === "string";

    case "waitFor": {
      const conditions = (request as Record<string, unknown>).conditions;

      return Array.isArray(conditions) && conditions.length > 0 &&
        conditions.every((c) =>
          typeof c === "object" &&
          c !== null &&
          typeof (c as Record<string, unknown>).kind === "string" &&
          typeof (c as Record<string, unknown>).nodeId === "string"
        );
    }

    case "observeEvents":
      return true;

    case "runFlow": {
      const flow = (request as Record<string, unknown>).flow;

      if (typeof flow !== "object" || flow === null || Array.isArray(flow)) {
        return false;
      }

      const flowName = (flow as Record<string, unknown>).name;
      const flowSteps = (flow as Record<string, unknown>).steps;

      return typeof flowName === "string" &&
        flowName.trim().length > 0 &&
        Array.isArray(flowSteps) &&
        flowSteps.length > 0;
    }

    default:
      return false;
  }
}

// ---------------------------------------------------------------------------
// Response factories
// ---------------------------------------------------------------------------

export function createAgentUIBridgeInspectTreeResponse(
  params: {
    requestId: AgentUIBridgeRequestId;
    tree?: unknown | undefined;
  }
): AgentUIBridgeInspectTreeResponse {
  return {
    type: "inspectTree",
    requestId: params.requestId,
    ...(params.tree !== undefined ? { tree: params.tree } : {}),
    timestamp: Date.now()
  };
}

export function createAgentUIBridgeGetStateResponse(
  params: {
    requestId: AgentUIBridgeRequestId;
    nodeId: string;
    node?: unknown | undefined;
  }
): AgentUIBridgeGetStateResponse {
  return {
    type: "getState",
    requestId: params.requestId,
    nodeId: params.nodeId,
    ...(params.node !== undefined ? { node: params.node } : {}),
    timestamp: Date.now()
  };
}

export function createAgentUIBridgeTapResponse(
  params: {
    requestId: AgentUIBridgeRequestId;
    targetId: string;
    result: AgentUIBridgeCommandStatusCode;
    error?: string | undefined;
  }
): AgentUIBridgeTapResponse {
  return {
    type: "tap",
    requestId: params.requestId,
    targetId: params.targetId,
    result: params.result,
    ...(params.error !== undefined ? { error: params.error } : {}),
    timestamp: Date.now()
  };
}

export function createAgentUIBridgeInputResponse(
  params: {
    requestId: AgentUIBridgeRequestId;
    targetId: string;
    result: AgentUIBridgeCommandStatusCode;
    error?: string | undefined;
  }
): AgentUIBridgeInputResponse {
  return {
    type: "input",
    requestId: params.requestId,
    targetId: params.targetId,
    result: params.result,
    ...(params.error !== undefined ? { error: params.error } : {}),
    timestamp: Date.now()
  };
}

export function createAgentUIBridgeWaitForResponse(
  params: {
    requestId: AgentUIBridgeRequestId;
    satisfied: boolean;
    matchedConditions: number;
    totalConditions: number;
  }
): AgentUIBridgeWaitForResponse {
  return {
    type: "waitFor",
    requestId: params.requestId,
    satisfied: params.satisfied,
    matchedConditions: params.matchedConditions,
    totalConditions: params.totalConditions,
    timestamp: Date.now()
  };
}

export function createAgentUIBridgeObserveEventsResponse(
  params: {
    requestId: AgentUIBridgeRequestId;
    events: AgentUIBridgeEvent[];
    nextCursor: AgentUIBridgeEventCursor;
    droppedCount: number;
  }
): AgentUIBridgeObserveEventsResponse {
  return {
    type: "observeEvents",
    requestId: params.requestId,
    events: params.events,
    nextCursor: params.nextCursor,
    droppedCount: params.droppedCount,
    timestamp: Date.now()
  };
}

export function createAgentUIBridgeRunFlowResponse(
  params: {
    requestId: AgentUIBridgeRequestId;
    result: AgentUIBridgeRunFlowResponse["result"];
  }
): AgentUIBridgeRunFlowResponse {
  return {
    type: "runFlow",
    requestId: params.requestId,
    result: params.result,
    timestamp: Date.now()
  };
}

// ---------------------------------------------------------------------------
// WebSocket bridge connection
// ---------------------------------------------------------------------------

export type AgentUIBridgeConnectionState =
  | "idle"
  | "connecting"
  | "paired"
  | "active"
  | "disconnected"
  | "reconnecting"
  | "expired";

export interface AgentUIBridgeConnectionConfig {
  gateResult: AgentUIBridgeGateResult;
  url: string;
  pairingToken: string;
  eventLog: AgentUIBridgeEventLog;
  appId?: string | undefined;
  appName?: string | undefined;
  platform?: string | undefined;
  deviceName?: string | undefined;
  osVersion?: string | undefined;
  heartbeatIntervalMs?: number | undefined;
  heartbeatMaxMissed?: number | undefined;
  maxReconnectAttempts?: number | undefined;
  reconnectBaseDelayMs?: number | undefined;
  reconnectMaxDelayMs?: number | undefined;
  webSocketFactory?: ((url: string) => WebSocketLike) | undefined;
}

export interface AgentUIBridgeConnection {
  readonly sessionId: AgentUIBridgeSessionId | undefined;
  readonly state: AgentUIBridgeConnectionState;
  readonly session: AgentUIBridgeSessionDescriptor | undefined;
  start(): void;
  stop(): void;
  send(request: AgentUIBridgeCommandRequest): void;
}

interface WebSocketLike {
  readonly readyState: number;
  readonly OPEN: number;
  onopen: ((event: unknown) => void) | null;
  onclose: ((event: CloseEventLike) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onmessage: ((event: MessageEventLike) => void) | null;
  send(data: string): void;
  close(code?: number, reason?: string): void;
}

interface CloseEventLike {
  readonly code: number;
  readonly reason: string;
  readonly wasClean: boolean;
}

interface MessageEventLike {
  readonly data: string;
}

const DEFAULT_HEARTBEAT_INTERVAL_MS = 15000;
const DEFAULT_HEARTBEAT_MAX_MISSED = 3;
const DEFAULT_MAX_RECONNECT_ATTEMPTS = 5;
const DEFAULT_RECONNECT_BASE_DELAY_MS = 500;
const DEFAULT_RECONNECT_MAX_DELAY_MS = 30000;

function jitter(baseMs: number): number {
  return baseMs + Math.floor(Math.random() * baseMs * 0.5);
}

interface ConnectionInternals {
  connState: AgentUIBridgeConnectionState;
  sessionId: AgentUIBridgeSessionId | undefined;
  descriptor: AgentUIBridgeSessionDescriptor | undefined;
  socket: WebSocketLike | undefined;
  heartbeatTimer: ReturnType<typeof setInterval> | undefined;
  heartbeatMissedCount: number;
  reconnectAttemptCount: number;
  reconnectTimer: ReturnType<typeof setTimeout> | undefined;
  epoch: number;
}

export function createAgentUIBridgeConnection(
  config: AgentUIBridgeConnectionConfig
): AgentUIBridgeConnection {
  const internals: ConnectionInternals = {
    connState: "idle",
    sessionId: undefined,
    descriptor: undefined,
    socket: undefined,
    heartbeatTimer: undefined,
    heartbeatMissedCount: 0,
    reconnectAttemptCount: 0,
    reconnectTimer: undefined,
    epoch: 0
  };

  const heartbeatIntervalMs =
    config.heartbeatIntervalMs ?? DEFAULT_HEARTBEAT_INTERVAL_MS;
  const heartbeatMaxMissed =
    config.heartbeatMaxMissed ?? DEFAULT_HEARTBEAT_MAX_MISSED;
  const maxReconnectAttempts =
    config.maxReconnectAttempts ?? DEFAULT_MAX_RECONNECT_ATTEMPTS;
  const reconnectBaseDelayMs =
    config.reconnectBaseDelayMs ?? DEFAULT_RECONNECT_BASE_DELAY_MS;
  const reconnectMaxDelayMs =
    config.reconnectMaxDelayMs ?? DEFAULT_RECONNECT_MAX_DELAY_MS;

  function isEnabled(): boolean {
    return config.gateResult.enabled;
  }

  function setState(newState: AgentUIBridgeConnectionState): void {
    internals.connState = newState;
  }

  function buildSessionDescriptor(
    state: AgentUIBridgeSessionState
  ): AgentUIBridgeSessionDescriptor {
    return {
      sessionId: internals.sessionId as AgentUIBridgeSessionId,
      state,
      ...(config.appId ? { appId: config.appId } : {}),
      ...(config.appName ? { appName: config.appName } : {}),
      ...(config.platform ? { platform: config.platform } : {}),
      ...(config.deviceName ? { deviceName: config.deviceName } : {}),
      ...(config.osVersion ? { osVersion: config.osVersion } : {}),
      capabilities: [...config.gateResult.capabilities],
      createdAt: Date.now(),
      lastHeartbeat: Date.now(),
      ...(internals.epoch ? { epoch: internals.epoch } : {})
    };
  }

  function emitEvent(
    type: AgentUIBridgeEventType,
    payload?: Record<string, unknown> | undefined
  ): void {
    config.eventLog.append({
      type,
      ...(internals.sessionId
        ? { sessionId: internals.sessionId }
        : {}),
      ...(payload ? { payload } : {})
    });
  }

  function clearHeartbeat(): void {
    if (internals.heartbeatTimer !== undefined) {
      clearInterval(internals.heartbeatTimer);
      internals.heartbeatTimer = undefined;
    }

    internals.heartbeatMissedCount = 0;
  }

  function clearReconnectTimer(): void {
    if (internals.reconnectTimer !== undefined) {
      clearTimeout(internals.reconnectTimer);
      internals.reconnectTimer = undefined;
    }
  }

  function closeSocket(): void {
    const socket = internals.socket;

    if (socket === undefined) {
      return;
    }

    internals.socket = undefined;

    try {
      socket.onopen = null;
      socket.onclose = null;
      socket.onerror = null;
      socket.onmessage = null;

      if (
        socket.readyState === socket.OPEN ||
        socket.readyState === 1
      ) {
        socket.close(1000, "client shutdown");
      }
    } catch {
      // ignore close errors
    }
  }

  function scheduleReconnect(): void {
    if (internals.connState === "expired") {
      return;
    }

    if (internals.reconnectAttemptCount >= maxReconnectAttempts) {
      setState("expired");
      internals.sessionId = undefined;
      internals.descriptor = undefined;
      emitEvent("bridge.session.expired", {
        reason: "max reconnection attempts exceeded",
        attempts: internals.reconnectAttemptCount
      });
      return;
    }

    setState("reconnecting");
    internals.reconnectAttemptCount += 1;

    const baseDelay = reconnectBaseDelayMs *
      Math.pow(2, internals.reconnectAttemptCount - 1);
    const cappedDelay = Math.min(baseDelay, reconnectMaxDelayMs);
    const delay = jitter(cappedDelay);

    internals.reconnectTimer = setTimeout(() => {
      internals.reconnectTimer = undefined;
      openConnection();
    }, delay);
  }

  function handleSocketOpen(_event: unknown): void {
    if (internals.connState !== "connecting") {
      return;
    }

    if (internals.sessionId === undefined) {
      internals.sessionId = createAgentUIBridgeSessionId();
    }

    setState("connecting");
    internals.descriptor = buildSessionDescriptor("connecting");
    emitEvent("bridge.session.connected", {
      sessionId: internals.sessionId
    });

    const hello: AgentUIBridgeHelloEnvelope = {
      protocolVersion: AGENT_UI_BRIDGE_PROTOCOL_VERSION,
      pairingToken: config.pairingToken,
      capabilities: [...config.gateResult.capabilities],
      ...(config.appId ? { appId: config.appId } : {}),
      ...(config.appName ? { appName: config.appName } : {}),
      ...(config.platform ? { platform: config.platform } : {}),
      ...(config.deviceName ? { deviceName: config.deviceName } : {}),
      ...(config.osVersion ? { osVersion: config.osVersion } : {})
    };

    const socket = internals.socket;

    if (socket === undefined || socket.readyState !== socket.OPEN) {
      return;
    }

    try {
      socket.send(JSON.stringify(hello));
    } catch {
      emitEvent("bridge.error", {
        reason: "failed to send hello envelope"
      });
    }
  }

  function handleWelcome(welcome: AgentUIBridgeWelcomeEnvelope): void {
    if (welcome.protocolVersion !== AGENT_UI_BRIDGE_PROTOCOL_VERSION) {
      emitEvent("bridge.error", {
        reason: "protocol version mismatch",
        serverVersion: welcome.protocolVersion,
        clientVersion: AGENT_UI_BRIDGE_PROTOCOL_VERSION
      });
      closeSocket();
      return;
    }

    internals.sessionId = welcome.sessionId;
    internals.epoch = welcome.epoch;

    setState("paired");
    internals.descriptor = buildSessionDescriptor("paired");
    emitEvent("bridge.session.paired", {
      sessionId: internals.sessionId,
      epoch: internals.epoch,
      serverCapabilities: [...welcome.serverCapabilities]
    });

    startHeartbeat();
  }

  function handleServerMessage(raw: string): void {
    let message: unknown;

    try {
      message = JSON.parse(raw);
    } catch {
      emitEvent("bridge.error", {
        reason: "invalid JSON from server"
      });
      return;
    }

    if (
      typeof message !== "object" ||
      message === null ||
      Array.isArray(message)
    ) {
      emitEvent("bridge.error", {
        reason: "unexpected message shape from server"
      });
      return;
    }

    const obj = message as Record<string, unknown>;

    if (
      typeof obj.protocolVersion === "number" &&
      typeof obj.sessionId === "string"
    ) {
      handleWelcome(message as AgentUIBridgeWelcomeEnvelope);
      return;
    }

    if (
      typeof obj.sessionId === "string" &&
      typeof obj.serverTimestamp === "number"
    ) {
      internals.heartbeatMissedCount = 0;

      if (internals.descriptor) {
        internals.descriptor = {
          ...internals.descriptor,
          lastHeartbeat: Date.now()
        };
      }

      if (internals.connState === "paired") {
        setState("active");
        internals.descriptor = buildSessionDescriptor("active");
      }

      return;
    }

    emitEvent("bridge.error", {
      reason: "unrecognized server message",
      raw: raw.slice(0, 200)
    });
  }

  function handleSocketClose(event: CloseEventLike): void {
    clearHeartbeat();

    if (
      internals.connState === "disconnected" ||
      internals.connState === "expired"
    ) {
      return;
    }

    setState("disconnected");
    emitEvent("bridge.session.disconnected", {
      code: event.code,
      reason: event.reason,
      wasClean: event.wasClean
    });

    internals.descriptor = undefined;
    internals.epoch = 0;

    scheduleReconnect();
  }

  function handleSocketError(_event: unknown): void {
    emitEvent("bridge.error", {
      reason: "WebSocket error",
      state: internals.connState
    });
  }

  function startHeartbeat(): void {
    clearHeartbeat();

    internals.heartbeatTimer = setInterval(() => {
      const socket = internals.socket;

      if (
        socket === undefined ||
        socket.readyState !== socket.OPEN
      ) {
        return;
      }

      internals.heartbeatMissedCount += 1;

      if (internals.heartbeatMissedCount > heartbeatMaxMissed) {
        if (internals.descriptor) {
          internals.descriptor = {
            ...internals.descriptor,
            state: "disconnected"
          };
        }

        clearHeartbeat();
        closeSocket();

        return;
      }

      const heartbeat: AgentUIBridgeHeartbeatEnvelope = {
        sessionId: internals.sessionId as AgentUIBridgeSessionId,
        clientTimestamp: Date.now()
      };

      try {
        socket.send(JSON.stringify(heartbeat));
      } catch {
        emitEvent("bridge.error", {
          reason: "failed to send heartbeat"
        });
      }
    }, heartbeatIntervalMs);
  }

  function openConnection(): void {
    if (!isEnabled()) {
      return;
    }

    setState("connecting");

    const factory = config.webSocketFactory ??
      ((url: string): WebSocketLike => {
        return new ((globalThis as unknown as {
          WebSocket: new (url: string) => WebSocketLike;
        }).WebSocket)(url) as WebSocketLike;
      });

    try {
      internals.socket = factory(config.url);
    } catch {
      emitEvent("bridge.error", {
        reason: "failed to create WebSocket"
      });
      setState("disconnected");
      scheduleReconnect();
      return;
    }

    const socket = internals.socket;

    socket.onopen = handleSocketOpen;
    socket.onclose = handleSocketClose;
    socket.onerror = handleSocketError;
    socket.onmessage = (event: MessageEventLike) => {
      handleServerMessage(event.data);
    };
  }

  function start(): void {
    if (!isEnabled()) {
      return;
    }

    if (
      internals.connState === "connecting" ||
      internals.connState === "paired" ||
      internals.connState === "active" ||
      internals.connState === "reconnecting"
    ) {
      return;
    }

    internals.reconnectAttemptCount = 0;
    clearReconnectTimer();
    clearHeartbeat();
    closeSocket();

    openConnection();
  }

  function stop(): void {
    clearHeartbeat();
    clearReconnectTimer();
    closeSocket();

    if (internals.connState !== "idle" && internals.connState !== "expired") {
      setState("disconnected");
      emitEvent("bridge.session.disconnected", {
        reason: "client shutdown"
      });
    }

    internals.sessionId = undefined;
    internals.descriptor = undefined;
    internals.epoch = 0;
    internals.reconnectAttemptCount = 0;
  }

  function send(request: AgentUIBridgeCommandRequest): void {
    const socket = internals.socket;

    if (
      socket === undefined ||
      socket.readyState !== socket.OPEN
    ) {
      emitEvent("bridge.error", {
        reason: "cannot send command: socket not connected",
        requestId: request.requestId
      });
      return;
    }

    emitEvent("bridge.command.received", {
      requestId: request.requestId,
      commandType: request.type
    });

    try {
      socket.send(JSON.stringify(request));
    } catch {
      emitEvent("bridge.error", {
        reason: "failed to send command",
        requestId: request.requestId
      });
    }
  }

  return {
    get sessionId(): AgentUIBridgeSessionId | undefined {
      return internals.sessionId;
    },

    get state(): AgentUIBridgeConnectionState {
      return internals.connState;
    },

    get session(): AgentUIBridgeSessionDescriptor | undefined {
      return internals.descriptor;
    },

    start,
    stop,
    send
  };
}

// ---------------------------------------------------------------------------
// Bridge command dispatch
// ---------------------------------------------------------------------------

export interface AgentUIBridgeRegistry {
  getSnapshot(options?: {
    screen?: string | undefined;
    maxDepth?: number | undefined;
    includeHidden?: boolean | undefined;
    rootId?: string | undefined;
  } | undefined): {
    nodes: unknown[];
    mountedNodeCount: number;
    generatedNodeCount: number;
  };
  getNodeById(
    id: string,
    options?: { screen?: string } | undefined
  ): unknown | undefined;
  dispatchAction(
    id: string,
    action: string,
    options?: { screen?: string; payload?: unknown } | undefined
  ): Promise<{
    ok: boolean;
    code: string;
    message: string;
    nodeId: string;
    screen?: string | undefined;
    supportedActions?: string[] | undefined;
    action: string;
  }>;
}

export interface AgentUIBridgeCommandDispatcher {
  dispatch(
    request: AgentUIBridgeCommandRequest
  ): Promise<AgentUIBridgeCommandResponse>;
}

const DEFAULT_WAIT_FOR_POLL_MS = 100;
const DEFAULT_WAIT_FOR_TIMEOUT_MS = 5000;

function mapDispatchCodeToBridgeStatusCode(
  dispatchCode: string
): AgentUIBridgeCommandStatusCode {
  switch (dispatchCode) {
    case "ACTION_DISPATCHED":
      return "OK";
    case "NODE_NOT_FOUND":
      return "NODE_NOT_FOUND";
    case "ACTION_UNSUPPORTED":
      return "UNSUPPORTED_ACTION";
    case "ACTION_DISABLED":
    case "ACTION_HANDLER_MISSING":
    case "ACTION_AMBIGUOUS":
      return "ACTION_REJECTED";
    case "ACTION_HANDLER_FAILED":
      return "ACTION_FAILED";
    default:
      return "ACTION_FAILED";
  }
}

function resolveWaitForCondition(
  condition: AgentUIBridgeWaitCondition,
  registry: AgentUIBridgeRegistry
): boolean {
  const rawNode = condition.screen
    ? registry.getNodeById(condition.nodeId, { screen: condition.screen })
    : registry.getNodeById(condition.nodeId);

  const node = rawNode as Record<string, unknown> | undefined;

  switch (condition.kind) {
    case "nodeExists":
      return node !== undefined;

    case "nodeVisible": {
      if (!node) {
        return false;
      }

      const state = node.state as Record<string, unknown> | undefined;

      return state?.hidden !== true;
    }

    case "nodeAbsent":
      return node === undefined;

    case "nodeState": {
      if (!node) {
        return false;
      }

      const expectedState = condition.expectedState as
        | Record<string, unknown>
        | undefined;

      if (!expectedState) {
        return true;
      }

      const actualState = node.state as Record<string, unknown> | undefined;

      if (!actualState) {
        return Object.keys(expectedState).every(
          (key) => expectedState[key] === undefined
        );
      }

      return Object.keys(expectedState).every(
        (key) => actualState[key] === expectedState[key]
      );
    }

    default:
      return false;
  }
}

async function pollWaitForConditions(
  registry: AgentUIBridgeRegistry,
  conditions: readonly AgentUIBridgeWaitCondition[],
  timeout: number,
  pollMs: number,
  signal?: { readonly aborted: boolean } | undefined
): Promise<{
  satisfied: boolean;
  matchedConditions: number;
  totalConditions: number;
}> {
  const start = Date.now();
  const totalConditions = conditions.length;

  while (true) {
    if (signal?.aborted) {
      return {
        satisfied: false,
        matchedConditions: 0,
        totalConditions
      };
    }

    let matched = 0;

    for (const condition of conditions) {
      if (resolveWaitForCondition(condition, registry)) {
        matched += 1;
      }
    }

    if (matched === totalConditions) {
      return { satisfied: true, matchedConditions: matched, totalConditions };
    }

    if (Date.now() - start >= timeout) {
      return {
        satisfied: false,
        matchedConditions: matched,
        totalConditions
      };
    }

    await new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, pollMs);
      if (signal?.aborted) {
        clearTimeout(timer);
        resolve();
      }
    });
  }
}

export function createAgentUIBridgeCommandDispatcher(options: {
  registry: AgentUIBridgeRegistry;
  eventLog: AgentUIBridgeEventLog;
}): AgentUIBridgeCommandDispatcher {
  const { registry, eventLog } = options;

  async function dispatch(
    request: AgentUIBridgeCommandRequest
  ): Promise<AgentUIBridgeCommandResponse> {
    try {
      switch (request.type) {
        case "inspectTree": {
          const snapshot = registry.getSnapshot({
            ...(request.options?.screen !== undefined
              ? { screen: request.options.screen }
              : {}),
            ...(request.options?.maxDepth !== undefined
              ? { maxDepth: request.options.maxDepth }
              : {}),
            ...(request.options?.includeHidden !== undefined
              ? { includeHidden: request.options.includeHidden }
              : {}),
            ...(request.options?.rootId !== undefined
              ? { rootId: request.options.rootId }
              : {})
          });

          return createAgentUIBridgeInspectTreeResponse({
            requestId: request.requestId,
            tree: snapshot
          });
        }

        case "getState": {
          const node = request.options?.screen
            ? registry.getNodeById(request.nodeId, {
                screen: request.options.screen
              })
            : registry.getNodeById(request.nodeId);

          return createAgentUIBridgeGetStateResponse({
            requestId: request.requestId,
            nodeId: request.nodeId,
            ...(node !== undefined ? { node } : {})
          });
        }

        case "tap": {
          const tapResult = await registry.dispatchAction(
            request.targetId,
            request.action ?? "tap",
            {
              ...(request.options?.screen !== undefined
                ? { screen: request.options.screen }
                : {}),
              ...(request.payload !== undefined
                ? { payload: request.payload }
                : {})
            }
          );

          const tapStatusCode = mapDispatchCodeToBridgeStatusCode(
            tapResult.code
          );

          return createAgentUIBridgeTapResponse({
            requestId: request.requestId,
            targetId: request.targetId,
            result: tapStatusCode,
            ...(tapResult.ok
              ? {}
              : { error: tapResult.message })
          });
        }

        case "input": {
          const inputAction = request.options?.action ?? "input";

          const inputResult = await registry.dispatchAction(
            request.targetId,
            inputAction,
            {
              ...(request.options?.screen !== undefined
                ? { screen: request.options.screen }
                : {}),
              payload: request.text
            }
          );

          const inputStatusCode = mapDispatchCodeToBridgeStatusCode(
            inputResult.code
          );

          return createAgentUIBridgeInputResponse({
            requestId: request.requestId,
            targetId: request.targetId,
            result: inputStatusCode,
            ...(inputResult.ok
              ? {}
              : { error: inputResult.message })
          });
        }

        case "waitFor": {
          const conditions = request.conditions as AgentUIBridgeWaitCondition[];
          const pollResult = await pollWaitForConditions(
            registry,
            conditions,
            request.timeout ?? DEFAULT_WAIT_FOR_TIMEOUT_MS,
            DEFAULT_WAIT_FOR_POLL_MS
          );

          return createAgentUIBridgeWaitForResponse({
            requestId: request.requestId,
            ...pollResult
          });
        }

        case "observeEvents": {
          const queryResult = eventLog.query(
            request.since,
            request.eventTypes,
            request.limit
          );

          return createAgentUIBridgeObserveEventsResponse({
            requestId: request.requestId,
            events: queryResult.events,
            nextCursor: queryResult.nextCursor,
            droppedCount: queryResult.droppedCount
          });
        }

        case "runFlow": {
          const flow = request.flow;
          const validationError = validateFlow(flow);

          if (validationError !== null) {
            return createAgentUIBridgeRunFlowResponse({
              requestId: request.requestId,
              result: {
                flowName: flow.name ?? "unknown",
                completed: false,
                totalSteps: flow.steps?.length ?? 0,
                completedSteps: 0,
                durationMs: 0,
                error: validationError
              }
            });
          }

          const stepDispatch = async (
            step: import("./flows").SemanticFlowStep
          ): Promise<{ ok: boolean; error?: string | undefined }> => {
            switch (step.type) {
              case "tap": {
                const tapResult = await registry.dispatchAction(
                  step.targetId ?? "",
                  "tap",
                  {
                    payload: undefined
                  }
                );

                return {
                  ok: tapResult.code === "ACTION_DISPATCHED",
                  error: tapResult.ok ? undefined : tapResult.message
                };
              }

              case "input": {
                const inputResult = await registry.dispatchAction(
                  step.targetId ?? "",
                  "input",
                  {
                    payload: step.value
                  }
                );

                return {
                  ok: inputResult.code === "ACTION_DISPATCHED",
                  error: inputResult.ok ? undefined : inputResult.message
                };
              }

              case "scroll": {
                const scrollResult = await registry.dispatchAction(
                  step.targetId ?? "",
                  "scroll",
                  {
                    payload: {
                      direction: step.direction ?? "down",
                      amount: step.amount ?? 0
                    }
                  }
                );

                return {
                  ok: scrollResult.code === "ACTION_DISPATCHED",
                  error: scrollResult.ok ? undefined : scrollResult.message
                };
              }

              case "navigate": {
                return {
                  ok: false,
                  error: "Flow-level navigation dispatch is deferred. Use individual tap/input/scroll steps instead."
                };
              }

              case "waitFor":
              case "assert": {
                if (!step.conditions || step.conditions.length === 0) {
                  return {
                    ok: false,
                    error: `${step.type} requires conditions`
                  };
                }

                const bridgeConditions = step.conditions.map((c) => ({
                  kind: c.kind,
                  nodeId: c.nodeId,
                  expectedState: c.expected
                }));

                if (step.type === "assert") {
                  let allSatisfied = true;
                  let firstError: string | undefined;

                  for (const c of bridgeConditions) {
                    const satisfied = resolveWaitForCondition(
                      c as AgentUIBridgeWaitCondition,
                      registry
                    );

                    if (!satisfied) {
                      allSatisfied = false;
                      firstError = `condition ${c.kind} failed for "${c.nodeId}"`;
                      break;
                    }
                  }

                  return { ok: allSatisfied, error: firstError };
                }

                const pollResult = await pollWaitForConditions(
                  registry,
                  bridgeConditions as AgentUIBridgeWaitCondition[],
                  request.options?.timeoutMs ?? DEFAULT_WAIT_FOR_TIMEOUT_MS,
                  DEFAULT_WAIT_FOR_POLL_MS
                );

                return {
                  ok: pollResult.satisfied,
                  error: pollResult.satisfied
                    ? undefined
                    : `${pollResult.matchedConditions}/${pollResult.totalConditions} conditions satisfied`
                };
              }

              case "observeEvents": {
                const eventFilter = step.value
                  ? step.value.split(",").map((s: string) => s.trim())
                  : undefined;
                const queryResult = eventLog.query(
                  undefined,
                  eventFilter as AgentUIBridgeEventType[] | undefined,
                  undefined
                );

                return {
                  ok: queryResult.events.length > 0,
                  error:
                    queryResult.events.length > 0
                      ? undefined
                      : "no matching events found"
                };
              }

              default:
                return {
                  ok: false,
                  error: `unknown step type: ${String(step.type)}`
                };
            }
          };

          const flowRunner = createFlowRunner();
          const runnerResult = await flowRunner(flow, stepDispatch, {
            ...(request.options?.timeoutMs !== undefined
              ? { timeoutMs: request.options.timeoutMs }
              : {})
          });

          return createAgentUIBridgeRunFlowResponse({
            requestId: request.requestId,
            result: runnerResult
          });
        }

        default: {
          const unknownReq = request as unknown as Record<string, unknown>;

          return {
            type: unknownReq.type as AgentUIBridgeCommandType,
            requestId: unknownReq.requestId as AgentUIBridgeRequestId,
            targetId: (unknownReq.targetId as string | undefined) ?? "",
            result: "UNKNOWN_COMMAND" as AgentUIBridgeCommandStatusCode,
            error: "Unknown bridge command type.",
            timestamp: Date.now()
          } as AgentUIBridgeTapResponse;
        }
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unexpected dispatch error";
      const raw = request as unknown as Record<string, unknown>;
      const requestType = raw.type as AgentUIBridgeCommandType;

      switch (requestType) {
        case "inspectTree":
          return createAgentUIBridgeInspectTreeResponse({
            requestId: request.requestId
          });

        case "getState":
          return createAgentUIBridgeGetStateResponse({
            requestId: request.requestId,
            nodeId:
              "nodeId" in raw ? String(raw.nodeId) : ""
          });

        case "tap":
          return createAgentUIBridgeTapResponse({
            requestId: request.requestId,
            targetId:
              "targetId" in raw ? String(raw.targetId) : "",
            result: "ACTION_FAILED",
            error: message
          });

        case "input":
          return createAgentUIBridgeInputResponse({
            requestId: request.requestId,
            targetId:
              "targetId" in raw ? String(raw.targetId) : "",
            result: "ACTION_FAILED",
            error: message
          });

        case "waitFor":
          return createAgentUIBridgeWaitForResponse({
            requestId: request.requestId,
            satisfied: false,
            matchedConditions: 0,
            totalConditions: 0
          });

        case "observeEvents":
          return createAgentUIBridgeObserveEventsResponse({
            requestId: request.requestId,
            events: [],
            nextCursor: 0,
            droppedCount: 0
          });

        case "runFlow":
          return createAgentUIBridgeRunFlowResponse({
            requestId: request.requestId,
            result: {
              flowName: "raw" in request && typeof (request as Record<string, unknown>).flow === "object"
                ? String(((request as Record<string, unknown>).flow as Record<string, unknown>).name ?? "unknown")
                : "unknown",
              completed: false,
              totalSteps: 0,
              completedSteps: 0,
              durationMs: 0,
              error: message
            }
          });

        default: {
          const errorResponse = {
            type: requestType,
            requestId: request.requestId,
            result: "ACTION_FAILED" as AgentUIBridgeCommandStatusCode,
            error: message,
            timestamp: Date.now()
          };

          return errorResponse as unknown as AgentUIBridgeTapResponse;
        }
      }
    }
  }

  return { dispatch };
}
