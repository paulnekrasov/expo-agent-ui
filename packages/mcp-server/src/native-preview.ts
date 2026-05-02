type NativePreviewPlatform = "ios" | "android";

type NativePreviewCapabilityFlags = {
  button: boolean;
  toggle: boolean;
  textField: boolean;
  secureField: boolean;
  slider: boolean;
  picker: boolean;
  host: boolean;
  rnHostView: boolean;
  list: boolean;
  form: boolean;
  section: boolean;
  bottomSheet: boolean;
  popover: boolean;
  menu: boolean;
};

type NativePreviewAdapterInfo = {
  tier: 1 | 2 | 3;
  platform: NativePreviewPlatform;
  name: string;
  isAvailable: boolean;
  isExpoGo: boolean;
  capabilities: NativePreviewCapabilityFlags;
  capabilityCount: number;
};

type NativePreviewSessionDiagnostics = {
  sessionId: string;
  platform: NativePreviewPlatform;
  adapter: NativePreviewAdapterInfo;
  connectedAt: string;
  uptimeMs: number;
  semanticNodeCount: number;
  screenCount: number;
  reducible: boolean;
};

type SemanticIdDiff = {
  id: string;
  status: "match" | "missing_ios" | "missing_android" | "type_mismatch" | "state_diff";
  ios?: { type?: string; state?: Record<string, unknown>; label?: string };
  android?: { type?: string; state?: Record<string, unknown>; label?: string };
};

type CapabilityDiff = {
  flag: string;
  ios: boolean;
  android: boolean;
  match: boolean;
};

type DiagnosticDiff = {
  field: string;
  ios: unknown;
  android: unknown;
  match: boolean;
};

type SideBySideComparison = {
  comparisonId: string;
  createdAt: string;
  iosSession: { sessionId: string; platform: NativePreviewPlatform };
  androidSession: { sessionId: string; platform: NativePreviewPlatform };
  semanticIdDiffs: SemanticIdDiff[];
  capabilityDiffs: CapabilityDiff[];
  diagnosticDiffs: DiagnosticDiff[];
  summary: {
    totalSemanticIds: number;
    matchingIds: number;
    mismatchedIds: number;
    totalCapabilities: number;
    matchingCapabilities: number;
    mismatchedCapabilities: number;
    overallMatch: boolean;
  };
};

function computeCapabilityDiff(
  ios: NativePreviewCapabilityFlags,
  android: NativePreviewCapabilityFlags
): CapabilityDiff[] {
  const allFlags = Object.keys(ios) as (keyof NativePreviewCapabilityFlags)[];
  return allFlags.map((flag) => ({
    flag,
    ios: ios[flag],
    android: android[flag],
    match: ios[flag] === android[flag],
  }));
}

function computeSemanticIdDiff(
  iosIds: Array<{ id: string; type?: string; state?: Record<string, unknown>; label?: string }>,
  androidIds: Array<{ id: string; type?: string; state?: Record<string, unknown>; label?: string }>
): SemanticIdDiff[] {
  const iosMap = new Map(iosIds.map((n) => [n.id, n]));
  const androidMap = new Map(androidIds.map((n) => [n.id, n]));
  const allIds = new Set([...iosMap.keys(), ...androidMap.keys()]);
  const diffs: SemanticIdDiff[] = [];

  for (const id of allIds) {
    const ios = iosMap.get(id);
    const android = androidMap.get(id);

    if (!ios) {
      const androidNode = compactPreviewNode(android);
      const diff: SemanticIdDiff = { id, status: "missing_ios" };
      if (androidNode) diff.android = androidNode;
      diffs.push(diff);
    } else if (!android) {
      const iosNode = compactPreviewNode(ios);
      const diff: SemanticIdDiff = { id, status: "missing_android" };
      if (iosNode) diff.ios = iosNode;
      diffs.push(diff);
    } else if (ios.type !== android.type) {
      const iosNode = compactPreviewNode(ios);
      const androidNode = compactPreviewNode(android);
      const diff: SemanticIdDiff = { id, status: "type_mismatch" };
      if (iosNode) diff.ios = iosNode;
      if (androidNode) diff.android = androidNode;
      diffs.push(diff);
    } else {
      const iosNode = compactPreviewNode(ios);
      const androidNode = compactPreviewNode(android);
      const diff: SemanticIdDiff = { id, status: "match" };
      if (iosNode) diff.ios = iosNode;
      if (androidNode) diff.android = androidNode;
      diffs.push(diff);
    }
  }

  return diffs;
}

function compactPreviewNode(
  node: { type?: string; state?: Record<string, unknown>; label?: string } | undefined
): { type?: string; state?: Record<string, unknown>; label?: string } | undefined {
  if (!node) return undefined;

  const result: Record<string, unknown> = {};

  if (node.type !== undefined) { result.type = node.type; }
  if (node.state !== undefined) { result.state = node.state; }
  if (node.label !== undefined) { result.label = node.label; }

  if (Object.keys(result).length === 0) return undefined;

  return result as unknown as { type?: string; state?: Record<string, unknown>; label?: string };
}

function computeDiagnosticDiff(
  ios: NativePreviewSessionDiagnostics,
  android: NativePreviewSessionDiagnostics
): DiagnosticDiff[] {
  const fields: (keyof NativePreviewSessionDiagnostics)[] = ["semanticNodeCount", "screenCount", "reducible"];
  return fields.map((field) => ({
    field,
    ios: ios[field],
    android: android[field],
    match: ios[field] === android[field],
  }));
}

function createSideBySideComparison(
  iosSession: NativePreviewSessionDiagnostics,
  androidSession: NativePreviewSessionDiagnostics,
  iosSemanticIds: Array<{ id: string; type?: string; state?: Record<string, unknown>; label?: string }>,
  androidSemanticIds: Array<{ id: string; type?: string; state?: Record<string, unknown>; label?: string }>
): SideBySideComparison {
  const semanticIdDiffs = computeSemanticIdDiff(iosSemanticIds, androidSemanticIds);
  const capabilityDiffs = computeCapabilityDiff(iosSession.adapter.capabilities, androidSession.adapter.capabilities);
  const diagnosticDiffs = computeDiagnosticDiff(iosSession, androidSession);
  const matchingIds = semanticIdDiffs.filter((d) => d.status === "match").length;
  const matchingCapabilities = capabilityDiffs.filter((d) => d.match).length;

  return {
    comparisonId: `cmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    iosSession: { sessionId: iosSession.sessionId, platform: "ios" },
    androidSession: { sessionId: androidSession.sessionId, platform: "android" },
    semanticIdDiffs,
    capabilityDiffs,
    diagnosticDiffs,
    summary: {
      totalSemanticIds: semanticIdDiffs.length,
      matchingIds,
      mismatchedIds: semanticIdDiffs.length - matchingIds,
      totalCapabilities: capabilityDiffs.length,
      matchingCapabilities,
      mismatchedCapabilities: capabilityDiffs.length - matchingCapabilities,
      overallMatch: semanticIdDiffs.length === matchingIds && capabilityDiffs.length === matchingCapabilities,
    },
  };
}

export type {
  NativePreviewPlatform,
  NativePreviewCapabilityFlags,
  NativePreviewAdapterInfo,
  NativePreviewSessionDiagnostics,
  SemanticIdDiff,
  CapabilityDiff,
  DiagnosticDiff,
  SideBySideComparison,
};

export {
  computeCapabilityDiff,
  computeSemanticIdDiff,
  computeDiagnosticDiff,
  createSideBySideComparison,
};
