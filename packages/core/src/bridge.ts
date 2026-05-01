import { isDevelopmentRuntime } from "./props";

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
  | "waitFor";

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
  ["inspectTree", "getState", "tap", "input", "observeEvents", "waitFor"];

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
