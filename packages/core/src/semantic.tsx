import * as React from "react";

import type {
  AgentUIBridgeConfig,
  AgentUIBridgeGateResult
} from "./bridge";
import { createAgentUIBridgeGate } from "./bridge";
import { isDevelopmentRuntime, warnInDevelopment } from "./props";

export type AgentUIPrimitiveRole =
  | "screen"
  | "stack"
  | "spacer"
  | "text"
  | "button"
  | "image"
  | "icon"
  | "label"
  | "textInput"
  | "scroll"
  | "list"
  | "section"
  | "form"
  | "toggle"
  | "slider"
  | "picker"
  | "stepper";

export type AgentUIPrimitiveAction =
  | "activate"
  | "tap"
  | "observe"
  | "input"
  | "focus"
  | "clear"
  | "submit"
  | "scroll"
  | "toggle"
  | "increment"
  | "decrement"
  | "set_value"
  | "select";

export type AgentUIPrimitivePrivacy = "none" | "redacted";

export type AgentUISemanticActionName =
  | AgentUIPrimitiveAction
  | (string & {});

export type AgentUISemanticActionResultCode =
  | "ACTION_AMBIGUOUS"
  | "ACTION_DISABLED"
  | "ACTION_DISPATCHED"
  | "ACTION_HANDLER_FAILED"
  | "ACTION_HANDLER_MISSING"
  | "ACTION_UNSUPPORTED"
  | "NODE_NOT_FOUND";

export interface AgentUISemanticActionHandlerContext {
  action: AgentUISemanticActionName;
  node: AgentUISemanticNode;
}

export type AgentUISemanticActionHandler = (
  payload: unknown,
  context: AgentUISemanticActionHandlerContext
) => Promise<void> | void;

export type AgentUISemanticActionHandlers = Partial<
  Record<AgentUISemanticActionName, AgentUISemanticActionHandler>
>;

export type AgentUISemanticPrivacy =
  | AgentUIPrimitivePrivacy
  | "dev-only";

export interface AgentUISemanticPrimitiveValue {
  checked?: boolean;
  hasValue?: boolean;
  max?: number;
  min?: number;
  now?: number;
  redaction?: AgentUIPrimitivePrivacy;
  selected?: string;
  step?: number;
  text?: string;
}

export interface AgentUISemanticPrimitive {
  role: AgentUIPrimitiveRole;
  busy?: boolean;
  id?: string;
  intent?: string;
  label?: string;
  mountKey?: string;
  parentMountKey?: string;
  screen?: string;
  testID?: string;
  checked?: boolean;
  disabled?: boolean;
  expanded?: boolean;
  hidden?: boolean;
  selected?: boolean;
  actions?: AgentUIPrimitiveAction[];
  actionHandlers?: AgentUISemanticActionHandlers;
  privacy?: AgentUIPrimitivePrivacy;
  value?: AgentUISemanticPrimitiveValue;
}

export interface AgentUISemanticState {
  busy?: boolean;
  checked?: boolean | "mixed";
  disabled?: boolean;
  expanded?: boolean;
  hidden?: boolean;
  selected?: boolean;
}

export interface AgentUISemanticNodeValue {
  checked?: boolean;
  hasValue?: boolean;
  max?: number;
  min?: number;
  now?: number;
  redaction?: AgentUISemanticPrivacy;
  selected?: string;
  step?: number;
  text?: string;
}

export interface AgentUISemanticActionMetadata {
  destructive?: boolean;
  label?: string;
  name: AgentUIPrimitiveAction | (string & {});
  source?: "accessibility" | "component" | "agent-ui";
}

export interface AgentUISemanticNode {
  actions: AgentUISemanticActionMetadata[];
  children: AgentUISemanticNode[];
  generated?: boolean;
  id: string;
  intent?: string;
  label?: string;
  privacy?: AgentUISemanticPrivacy;
  screen?: string;
  state: AgentUISemanticState;
  type: AgentUIPrimitiveRole | (string & {});
  value?: AgentUISemanticNodeValue;
}

export interface AgentUISemanticSnapshot {
  generatedNodeCount: number;
  mountedNodeCount: number;
  nodes: AgentUISemanticNode[];
}

export interface AgentUISemanticNodeLookupOptions {
  screen?: string;
}

export interface AgentUISemanticActionDispatchOptions
  extends AgentUISemanticNodeLookupOptions {
  payload?: unknown;
}

export interface AgentUISemanticActionResult {
  action: AgentUISemanticActionName;
  code: AgentUISemanticActionResultCode;
  message: string;
  nodeId: string;
  ok: boolean;
  screen?: string;
  supportedActions?: AgentUISemanticActionName[];
}

export type AgentUISemanticUnregister = () => void;

export interface AgentUISemanticRuntime {
  registerPrimitive(
    primitive: AgentUISemanticPrimitive
  ): AgentUISemanticUnregister;
}

export interface AgentUISemanticRegistry extends AgentUISemanticRuntime {
  clear(): void;
  dispatchAction(
    id: string,
    action: AgentUISemanticActionName,
    options?: AgentUISemanticActionDispatchOptions
  ): Promise<AgentUISemanticActionResult>;
  getNodeById(
    id: string,
    options?: AgentUISemanticNodeLookupOptions
  ): AgentUISemanticNode | undefined;
  getSnapshot(options?: {
    screen?: string | undefined;
    maxDepth?: number | undefined;
    includeHidden?: boolean | undefined;
    rootId?: string | undefined;
  } | undefined): AgentUISemanticSnapshot;
}

export interface AgentUIContextValue {
  bridge: AgentUIBridgeGateResult;
  registry?: AgentUISemanticRegistry;
  runtime: AgentUISemanticRuntime;
}

export interface AgentUIProviderProps {
  bridge?: AgentUIBridgeConfig;
  children: React.ReactNode;
  runtime?: AgentUISemanticRuntime;
}

export interface AgentUISemanticBoundaryProps {
  children: React.ReactNode;
  mountKey: string;
  screen?: string | undefined;
}

interface AgentUISemanticParentContextValue {
  mountKey?: string;
  screen?: string;
}

interface MountedSemanticRecord {
  actionHandlers: AgentUISemanticActionHandlers;
  mountKey: string;
  node: AgentUISemanticNode;
  order: number;
  parentMountKey?: string;
}

interface SemanticTreeRecordRef {
  children: SemanticTreeRecordRef[];
  mountKey: string;
  node: AgentUISemanticNode;
}

const noopRuntime: AgentUISemanticRuntime = {
  registerPrimitive: () => {
    return () => undefined;
  }
};

const AgentUISemanticParentContext =
  React.createContext<AgentUISemanticParentContextValue>({});

let nextHookMountKey = 1;

function createSemanticState(
  primitive: AgentUISemanticPrimitive
): AgentUISemanticState {
  const state: AgentUISemanticState = {};

  if (typeof primitive.busy === "boolean") {
    state.busy = primitive.busy;
  }

  if (typeof primitive.checked === "boolean") {
    state.checked = primitive.checked;
  }

  if (typeof primitive.disabled === "boolean") {
    state.disabled = primitive.disabled;
  }

  if (typeof primitive.expanded === "boolean") {
    state.expanded = primitive.expanded;
  }

  if (typeof primitive.hidden === "boolean") {
    state.hidden = primitive.hidden;
  }

  if (typeof primitive.selected === "boolean") {
    state.selected = primitive.selected;
  }

  return state;
}

function createSemanticActions(
  actions: AgentUISemanticPrimitive["actions"] | undefined
): AgentUISemanticActionMetadata[] {
  return (actions ?? []).map((action) => ({
    name: action,
    source: "agent-ui"
  }));
}

function createSemanticValue(
  value: AgentUISemanticPrimitive["value"] | undefined
): AgentUISemanticNodeValue | undefined {
  if (!value) {
    return undefined;
  }

  return {
    ...(typeof value.checked === "boolean" ? { checked: value.checked } : {}),
    ...(typeof value.hasValue === "boolean" ? { hasValue: value.hasValue } : {}),
    ...(typeof value.max === "number" ? { max: value.max } : {}),
    ...(typeof value.min === "number" ? { min: value.min } : {}),
    ...(typeof value.now === "number" ? { now: value.now } : {}),
    ...(value.redaction ? { redaction: value.redaction } : {}),
    ...(value.selected ? { selected: value.selected } : {}),
    ...(typeof value.step === "number" ? { step: value.step } : {}),
    ...(value.text ? { text: value.text } : {})
  };
}

function createSemanticNode(
  primitive: AgentUISemanticPrimitive,
  mountId: number
): AgentUISemanticNode {
  const primitiveId = primitive.id;
  const hasStableId =
    typeof primitiveId === "string" && primitiveId.trim().length > 0;
  const id = hasStableId
    ? primitiveId.trim()
    : `agent-ui.generated.${mountId}`;
  const node: AgentUISemanticNode = {
    actions: createSemanticActions(primitive.actions),
    children: [],
    id,
    state: createSemanticState(primitive),
    type: primitive.role
  };
  const value = createSemanticValue(primitive.value);

  if (!hasStableId) {
    node.generated = true;
  }

  if (primitive.intent) {
    node.intent = primitive.intent;
  }

  if (primitive.label) {
    node.label = primitive.label;
  }

  if (primitive.privacy) {
    node.privacy = primitive.privacy;
  }

  if (primitive.screen) {
    node.screen = primitive.screen;
  }

  if (value) {
    node.value = value;
  }

  return node;
}

function createSemanticActionResult(options: {
  action: AgentUISemanticActionName;
  code: AgentUISemanticActionResultCode;
  message: string;
  nodeId: string;
  ok: boolean;
  screen?: string | undefined;
  supportedActions?: AgentUISemanticActionName[] | undefined;
}): AgentUISemanticActionResult {
  return {
    action: options.action,
    code: options.code,
    message: options.message,
    nodeId: options.nodeId,
    ok: options.ok,
    ...(options.screen ? { screen: options.screen } : {}),
    ...(options.supportedActions
      ? { supportedActions: [...options.supportedActions] }
      : {})
  };
}

function cloneSemanticNode(node: AgentUISemanticNode): AgentUISemanticNode {
  return {
    actions: node.actions.map((action) => ({ ...action })),
    children: node.children.map(cloneSemanticNode),
    id: node.id,
    state: { ...node.state },
    type: node.type,
    ...(node.generated ? { generated: true } : {}),
    ...(node.intent ? { intent: node.intent } : {}),
    ...(node.label ? { label: node.label } : {}),
    ...(node.privacy ? { privacy: node.privacy } : {}),
    ...(node.screen ? { screen: node.screen } : {}),
    ...(node.value ? { value: { ...node.value } } : {})
  };
}

export function redactSemanticNode(
  node: AgentUISemanticNode
): AgentUISemanticNode {
  const privacy = node.privacy;

  const redactedValue = node.value
    ? (() => {
        if (privacy === "dev-only") {
          return undefined;
        }

        if (privacy === "redacted") {
          const stripped = { ...node.value };

          delete (stripped as Record<string, unknown>).text;

          return stripped;
        }

        return { ...node.value };
      })()
    : undefined;

  return {
    actions: node.actions.map((action) => ({ ...action })),
    children: node.children.map(redactSemanticNode),
    id: node.id,
    state: { ...node.state },
    type: node.type,
    ...(node.generated ? { generated: true } : {}),
    ...(node.intent ? { intent: node.intent } : {}),
    ...(node.label ? { label: node.label } : {}),
    ...(privacy ? { privacy } : {}),
    ...(node.screen ? { screen: node.screen } : {}),
    ...(redactedValue ? { value: redactedValue } : {})
  };
}

function shallowCloneSemanticNode(
  node: AgentUISemanticNode
): AgentUISemanticNode {
  return {
    actions: node.actions.map((action) => ({ ...action })),
    children: [],
    id: node.id,
    state: { ...node.state },
    type: node.type,
    ...(node.generated ? { generated: true } : {}),
    ...(node.intent ? { intent: node.intent } : {}),
    ...(node.label ? { label: node.label } : {}),
    ...(node.privacy ? { privacy: node.privacy } : {}),
    ...(node.screen ? { screen: node.screen } : {}),
    ...(node.value ? { value: { ...node.value } } : {})
  };
}

function applyScreenScope(
  node: AgentUISemanticNode,
  inheritedScreen: string | undefined
): void {
  const ownScreen =
    node.type === "screen"
      ? node.screen ?? node.id
      : node.screen ?? inheritedScreen;

  if (ownScreen) {
    node.screen = ownScreen;
  }

  for (const child of node.children) {
    applyScreenScope(child, node.screen);
  }
}

function pruneHiddenSemanticTreeRecordRefs(
  entries: SemanticTreeRecordRef[]
): SemanticTreeRecordRef[] {
  return entries.flatMap((entry) => {
    if (entry.node.state.hidden === true) {
      return [];
    }

    entry.children = pruneHiddenSemanticTreeRecordRefs(entry.children);
    entry.node.children = entry.children.map((child) => child.node);

    return [entry];
  });
}

function buildSemanticTree(
  mountedRecords: Map<string, MountedSemanticRecord>,
  options?: {
    includeHidden?: boolean | undefined;
    screen?: string | undefined;
    maxDepth?: number | undefined;
    rootId?: string | undefined;
  }
): AgentUISemanticNode[] {
  const recordRefs = buildSemanticTreeRecordRefs(mountedRecords, options?.includeHidden === true);
  let nodes = recordRefs.map((entry) => entry.node);

  if (typeof options?.screen === "string" && options.screen.length > 0) {
    nodes = filterSemanticNodesByScreen(nodes, options.screen);
  }

  if (typeof options?.rootId === "string" && options.rootId.length > 0) {
    const rooted = findSemanticNodeById(nodes, options.rootId);
    nodes = rooted ? [rooted] : [];
  }

  if (typeof options?.maxDepth === "number" && options.maxDepth >= 0) {
    nodes = truncateSemanticNodeDepth(nodes, options.maxDepth);
  }

  return nodes;
}

function buildSemanticTreeRecordRefs(
  mountedRecords: Map<string, MountedSemanticRecord>,
  includeHidden?: boolean | undefined
): SemanticTreeRecordRef[] {
  const records = Array.from(mountedRecords.values()).sort(
    (a, b) => a.order - b.order
  );
  const entriesByMountKey = new Map<string, SemanticTreeRecordRef>();
  const roots: SemanticTreeRecordRef[] = [];

  for (const record of records) {
    entriesByMountKey.set(record.mountKey, {
      children: [],
      mountKey: record.mountKey,
      node: shallowCloneSemanticNode(record.node)
    });
  }

  for (const record of records) {
    const entry = entriesByMountKey.get(record.mountKey);

    if (!entry) {
      continue;
    }

    if (record.parentMountKey) {
      const parent = entriesByMountKey.get(record.parentMountKey);

      if (parent) {
        parent.children.push(entry);
        parent.node.children.push(entry.node);
        continue;
      }
    }

    roots.push(entry);
  }

  for (const root of roots) {
    applyScreenScope(root.node, undefined);
  }

  return includeHidden ? roots : pruneHiddenSemanticTreeRecordRefs(roots);
}

function filterSemanticNodesByScreen(
  nodes: AgentUISemanticNode[],
  screen: string
): AgentUISemanticNode[] {
  return nodes.flatMap((node) => filterNodeByScreen(node, screen)).filter(
    (n): n is AgentUISemanticNode => n !== undefined
  );
}

function filterNodeByScreen(
  node: AgentUISemanticNode,
  screen: string
): AgentUISemanticNode | undefined {
  if (node.screen !== screen) {
    return undefined;
  }

  const filteredChildren = node.children
    .map((child) => filterNodeByScreen(child, screen))
    .filter((n): n is AgentUISemanticNode => n !== undefined);

  return { ...node, children: filteredChildren };
}

function truncateSemanticNodeDepth(
  nodes: AgentUISemanticNode[],
  maxDepth: number
): AgentUISemanticNode[] {
  if (maxDepth <= 0) {
    return [];
  }

  return nodes.map((node) => ({
    ...node,
    children: truncateSemanticNodeDepth(node.children, maxDepth - 1)
  }));
}

function findSemanticNodeById(
  nodes: AgentUISemanticNode[],
  id: string
): AgentUISemanticNode | undefined {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }

    const found = findSemanticNodeById(node.children, id);

    if (found) {
      return found;
    }
  }

  return undefined;
}

function collectDuplicateStableIdKeys(
  nodes: AgentUISemanticNode[]
): Array<{ id: string; scope: string }> {
  const seen = new Set<string>();
  const duplicates = new Map<string, { id: string; scope: string }>();

  function visit(node: AgentUISemanticNode): void {
    const scope = node.screen ?? "global";

    if (node.generated !== true && node.id.length > 0) {
      const key = `${scope}\u0000${node.id}`;

      if (seen.has(key)) {
        duplicates.set(key, { id: node.id, scope });
      } else {
        seen.add(key);
      }
    }

    for (const child of node.children) {
      visit(child);
    }
  }

  for (const node of nodes) {
    visit(node);
  }

  return Array.from(duplicates.values());
}

function normalizeLookupValue(value: string | undefined): string | undefined {
  const trimmedValue = value?.trim();

  return trimmedValue && trimmedValue.length > 0 ? trimmedValue : undefined;
}

function normalizeActionName(
  action: AgentUISemanticActionName
): AgentUISemanticActionName | undefined {
  return normalizeLookupValue(String(action)) as
    | AgentUISemanticActionName
    | undefined;
}

function collectSemanticNodesById(
  nodes: AgentUISemanticNode[],
  id: string,
  screen: string | undefined
): AgentUISemanticNode[] {
  const matches: AgentUISemanticNode[] = [];

  function visit(node: AgentUISemanticNode): void {
    if (node.id === id && (screen === undefined || node.screen === screen)) {
      matches.push(node);
    }

    for (const child of node.children) {
      visit(child);
    }
  }

  for (const node of nodes) {
    visit(node);
  }

  return matches;
}

function collectSemanticRecordRefsById(
  entries: SemanticTreeRecordRef[],
  id: string,
  screen: string | undefined
): SemanticTreeRecordRef[] {
  const matches: SemanticTreeRecordRef[] = [];

  function visit(entry: SemanticTreeRecordRef): void {
    if (
      entry.node.id === id &&
      (screen === undefined || entry.node.screen === screen)
    ) {
      matches.push(entry);
    }

    for (const child of entry.children) {
      visit(child);
    }
  }

  for (const entry of entries) {
    visit(entry);
  }

  return matches;
}

function getSupportedActionNames(
  node: AgentUISemanticNode
): AgentUISemanticActionName[] {
  return node.actions.map((action) => action.name);
}

export function createAgentUISemanticRegistry(): AgentUISemanticRegistry {
  let nextMountId = 1;
  const mountedRecords = new Map<string, MountedSemanticRecord>();
  const warnedDuplicateIds = new Set<string>();

  function emitDuplicateStableIdWarnings(): void {
    const duplicates = collectDuplicateStableIdKeys(
      buildSemanticTree(mountedRecords)
    );

    for (const duplicate of duplicates) {
      const warningKey = `${duplicate.scope}\u0000${duplicate.id}`;

      if (warnedDuplicateIds.has(warningKey)) {
        continue;
      }

      warnedDuplicateIds.add(warningKey);
      warnInDevelopment(
        `Duplicate Agent UI semantic id "${duplicate.id}" detected in screen scope "${duplicate.scope}". Stable IDs must be unique within a screen.`
      );
    }
  }

  return {
    clear() {
      mountedRecords.clear();
      warnedDuplicateIds.clear();
    },
    async dispatchAction(
      id: string,
      action: AgentUISemanticActionName,
      options?: AgentUISemanticActionDispatchOptions
    ) {
      const lookupId = normalizeLookupValue(id);
      const actionName = normalizeActionName(action);

      if (!lookupId) {
        return createSemanticActionResult({
          action: actionName ?? String(action),
          code: "NODE_NOT_FOUND",
          message: "A non-empty semantic node id is required for action dispatch.",
          nodeId: id,
          ok: false
        });
      }

      if (!actionName) {
        return createSemanticActionResult({
          action: String(action),
          code: "ACTION_UNSUPPORTED",
          message: `A non-empty semantic action is required for node "${lookupId}".`,
          nodeId: lookupId,
          ok: false
        });
      }

      const lookupScreen = normalizeLookupValue(options?.screen);
      const matches = collectSemanticRecordRefsById(
        buildSemanticTreeRecordRefs(mountedRecords),
        lookupId,
        lookupScreen
      );

      if (matches.length === 0) {
        return createSemanticActionResult({
          action: actionName,
          code: "NODE_NOT_FOUND",
          message: `No visible semantic node found for id "${lookupId}".`,
          nodeId: lookupId,
          ok: false,
          screen: lookupScreen
        });
      }

      if (matches.length > 1) {
        return createSemanticActionResult({
          action: actionName,
          code: "ACTION_AMBIGUOUS",
          message: `Semantic node id "${lookupId}" matched multiple visible nodes. Pass a screen scope to dispatch safely.`,
          nodeId: lookupId,
          ok: false,
          screen: lookupScreen
        });
      }

      // matches.length === 1 is guaranteed by the guards above
      const match = matches[0]!;

      const node = match.node;
      const supportedActions = getSupportedActionNames(node);

      if (!supportedActions.includes(actionName)) {
        return createSemanticActionResult({
          action: actionName,
          code: "ACTION_UNSUPPORTED",
          message: `Node "${lookupId}" does not declare semantic action "${actionName}".`,
          nodeId: lookupId,
          ok: false,
          screen: node.screen,
          supportedActions
        });
      }

      if (node.state.disabled === true || node.state.busy === true) {
        return createSemanticActionResult({
          action: actionName,
          code: "ACTION_DISABLED",
          message: `Node "${lookupId}" is disabled or busy and cannot dispatch "${actionName}".`,
          nodeId: lookupId,
          ok: false,
          screen: node.screen,
          supportedActions
        });
      }

      const record = mountedRecords.get(match.mountKey);
      const handler = record?.actionHandlers[actionName];

      if (!handler) {
        return createSemanticActionResult({
          action: actionName,
          code: "ACTION_HANDLER_MISSING",
          message: `Node "${lookupId}" declares "${actionName}" but no local action handler is registered.`,
          nodeId: lookupId,
          ok: false,
          screen: node.screen,
          supportedActions
        });
      }

      try {
        await handler(options?.payload, {
          action: actionName,
          node: cloneSemanticNode(node)
        });

        return createSemanticActionResult({
          action: actionName,
          code: "ACTION_DISPATCHED",
          message: `Dispatched semantic action "${actionName}" on node "${lookupId}".`,
          nodeId: lookupId,
          ok: true,
          screen: node.screen,
          supportedActions
        });
      } catch {
        return createSemanticActionResult({
          action: actionName,
          code: "ACTION_HANDLER_FAILED",
          message: `The local handler for node "${lookupId}" action "${actionName}" failed.`,
          nodeId: lookupId,
          ok: false,
          screen: node.screen,
          supportedActions
        });
      }
    },
    getNodeById(id: string, options?: AgentUISemanticNodeLookupOptions) {
      const lookupId = normalizeLookupValue(id);

      if (!lookupId) {
        return undefined;
      }

      const lookupScreen = normalizeLookupValue(options?.screen);
      const matches = collectSemanticNodesById(
        buildSemanticTree(mountedRecords),
        lookupId,
        lookupScreen
      );

      if (matches.length !== 1) {
        return undefined;
      }

      const matchedNode = matches[0];

      return matchedNode ? redactSemanticNode(cloneSemanticNode(matchedNode)) : undefined;
    },
    getSnapshot(options) {
      const rawNodes = buildSemanticTree(mountedRecords, options);
      const nodes = rawNodes.map(redactSemanticNode);

      return {
        generatedNodeCount: Array.from(mountedRecords.values()).filter(
          (record) => record.node.generated === true
        ).length,
        mountedNodeCount: mountedRecords.size,
        nodes
      };
    },
    registerPrimitive(primitive: AgentUISemanticPrimitive) {
      const mountId = nextMountId;
      const mountKey = primitive.mountKey ?? `agent-ui.registry.${mountId}`;
      let isMounted = true;
      const record: MountedSemanticRecord = {
        actionHandlers: primitive.actionHandlers
          ? { ...primitive.actionHandlers }
          : {},
        mountKey,
        node: createSemanticNode(primitive, mountId),
        order: mountId,
        ...(primitive.parentMountKey
          ? { parentMountKey: primitive.parentMountKey }
          : {})
      };
      nextMountId += 1;

      mountedRecords.set(mountKey, record);
      emitDuplicateStableIdWarnings();

      return () => {
        if (!isMounted) {
          return;
        }

        isMounted = false;
        if (mountedRecords.get(mountKey) === record) {
          mountedRecords.delete(mountKey);
        }
      };
    }
  };
}

const AgentUIContext = React.createContext<AgentUIContextValue>({
  bridge: createAgentUIBridgeGate(undefined, { isDevelopment: false }),
  runtime: noopRuntime
});

export function AgentUIProvider({
  bridge,
  children,
  runtime
}: AgentUIProviderProps): React.ReactElement {
  const internalRegistry = React.useMemo(
    () => createAgentUISemanticRegistry(),
    []
  );
  const developmentRuntime = runtime ?? internalRegistry;
  const isDevelopment = isDevelopmentRuntime();
  const activeRuntime = isDevelopment ? developmentRuntime : noopRuntime;
  const bridgeGate = React.useMemo(
    () => createAgentUIBridgeGate(bridge, { isDevelopment }),
    [bridge, isDevelopment]
  );
  const value = React.useMemo<AgentUIContextValue>(
    () => ({
      bridge: bridgeGate,
      ...(isDevelopment && runtime === undefined
        ? { registry: internalRegistry }
        : {}),
      runtime: activeRuntime
    }),
    [activeRuntime, bridgeGate, internalRegistry, isDevelopment, runtime]
  );

  return (
    <AgentUIContext.Provider value={value}>{children}</AgentUIContext.Provider>
  );
}

export function useAgentUIRuntime(): AgentUISemanticRuntime {
  return React.useContext(AgentUIContext).runtime;
}

export function useAgentUIBridge(): AgentUIBridgeGateResult {
  return React.useContext(AgentUIContext).bridge;
}

function useStableSemanticMountKey(): string {
  const mountKey = React.useRef<string | undefined>(undefined);

  if (!mountKey.current) {
    mountKey.current = `agent-ui.mount.${nextHookMountKey}`;
    nextHookMountKey += 1;
  }

  return mountKey.current;
}

export function AgentUISemanticBoundary({
  children,
  mountKey,
  screen
}: AgentUISemanticBoundaryProps): React.ReactElement {
  const parent = React.useContext(AgentUISemanticParentContext);
  const value = React.useMemo<AgentUISemanticParentContextValue>(
    () => ({
      mountKey,
      ...(screen ?? parent.screen ? { screen: screen ?? parent.screen } : {})
    }),
    [mountKey, parent.screen, screen]
  );

  return (
    <AgentUISemanticParentContext.Provider value={value}>
      {children}
    </AgentUISemanticParentContext.Provider>
  );
}

export function useDeferredSemanticPrimitive(
  primitive: AgentUISemanticPrimitive
): string {
  const runtime = useAgentUIRuntime();
  const parent = React.useContext(AgentUISemanticParentContext);
  const mountKey = useStableSemanticMountKey();
  const registeredPrimitive = React.useMemo<AgentUISemanticPrimitive>(
    () => ({
      ...primitive,
      mountKey,
      ...(parent.mountKey ? { parentMountKey: parent.mountKey } : {}),
      ...(primitive.screen ?? parent.screen
        ? { screen: primitive.screen ?? parent.screen }
        : {})
    }),
    [mountKey, parent.mountKey, parent.screen, primitive]
  );

  React.useEffect(() => {
    if (!isDevelopmentRuntime()) {
      return undefined;
    }

    return runtime.registerPrimitive(registeredPrimitive);
  }, [registeredPrimitive, runtime]);

  return mountKey;
}
