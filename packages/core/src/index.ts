export const agentUICorePackage = "@agent-ui/core" as const;
export const agentUICoreStage = "flow-runner" as const;

import { agentUISwiftUIAdapter } from "./swift-ui";
import { agentUIComposeAdapter } from "./jetpack-compose";
import type { AgentUISwiftUIAdapter } from "./swift-ui";
import type { AgentUIComposeAdapter } from "./jetpack-compose";

export {
  createAgentUIBridgeCommandDispatcher,
  createAgentUIBridgeConnection,
  createAgentUIBridgeEventLog,
  createAgentUIBridgeGate,
  createAgentUIBridgeInspectTreeResponse,
  createAgentUIBridgeGetStateResponse,
  createAgentUIBridgeTapResponse,
  createAgentUIBridgeInputResponse,
  createAgentUIBridgeWaitForResponse,
  createAgentUIBridgeObserveEventsResponse,
  createAgentUIBridgeRunFlowResponse,
  createAgentUIBridgeRequestId,
  createAgentUIBridgeSessionId,
  generateAgentUIPairingToken,
  validateAgentUIBridgeRequest,
  validateAgentUIPairingToken,
  AGENT_UI_BRIDGE_PROTOCOL_VERSION,
  DEFAULT_AGENT_UI_BRIDGE_CAPABILITIES
} from "./bridge";
export type {
  AgentUIBridgeCapability,
  AgentUIBridgeCommandDispatcher,
  AgentUIBridgeCommandRequest,
  AgentUIBridgeCommandResponse,
  AgentUIBridgeCommandStatusCode,
  AgentUIBridgeCommandType,
  AgentUIBridgeConfig,
  AgentUIBridgeConnection,
  AgentUIBridgeConnectionConfig,
  AgentUIBridgeConnectionState,
  AgentUIBridgeEvent,
  AgentUIBridgeEventCursor,
  AgentUIBridgeEventLog,
  AgentUIBridgeEventQueryResult,
  AgentUIBridgeEventType,
  AgentUIBridgeExecutionEnvironment,
  AgentUIBridgeGateOptions,
  AgentUIBridgeGateResult,
  AgentUIBridgeGateResultCode,
  AgentUIBridgeGetStateRequest,
  AgentUIBridgeGetStateResponse,
  AgentUIBridgeHeartbeatAckEnvelope,
  AgentUIBridgeHeartbeatEnvelope,
  AgentUIBridgeHelloEnvelope,
  AgentUIBridgeInputRequest,
  AgentUIBridgeInputResponse,
  AgentUIBridgeInspectTreeRequest,
  AgentUIBridgeInspectTreeResponse,
  AgentUIBridgeObserveEventsRequest,
  AgentUIBridgeObserveEventsResponse,
  AgentUIBridgeProtocolVersion,
  AgentUIBridgeRegistry,
  AgentUIBridgeRequestId,
  AgentUIBridgeSessionDescriptor,
  AgentUIBridgeSessionId,
  AgentUIBridgeSessionState,
  AgentUIBridgeTapRequest,
  AgentUIBridgeTapResponse,
  AgentUIBridgeTransportMode,
  AgentUIBridgeWaitCondition,
  AgentUIBridgeWaitForRequest,
  AgentUIBridgeWaitForResponse,
  AgentUIBridgeWelcomeEnvelope,
  AgentUIBridgeRunFlowRequest,
  AgentUIBridgeRunFlowResponse
} from "./bridge";
export {
  AgentUIProvider,
  createAgentUISemanticRegistry,
  useAgentUIBridge,
  useAgentUIRuntime,
  useDeferredSemanticPrimitive
} from "./semantic";
export type {
  AgentUIContextValue,
  AgentUIPrimitiveAction,
  AgentUIPrimitivePrivacy,
  AgentUIPrimitiveRole,
  AgentUIProviderProps,
  AgentUISemanticActionDispatchOptions,
  AgentUISemanticActionHandler,
  AgentUISemanticActionHandlerContext,
  AgentUISemanticActionHandlers,
  AgentUISemanticActionMetadata,
  AgentUISemanticActionName,
  AgentUISemanticActionResult,
  AgentUISemanticActionResultCode,
  AgentUISemanticNode,
  AgentUISemanticNodeLookupOptions,
  AgentUISemanticNodeValue,
  AgentUISemanticPrimitive,
  AgentUISemanticPrimitiveValue,
  AgentUISemanticPrivacy,
  AgentUISemanticRegistry,
  AgentUISemanticRuntime,
  AgentUISemanticSnapshot,
  AgentUISemanticState,
  AgentUISemanticUnregister
} from "./semantic";
export {
  Button,
  Form,
  HStack,
  Icon,
  Image,
  Label,
  List,
  Picker,
  Screen,
  Scroll,
  SecureField,
  Spacer,
  Section,
  Slider,
  Stepper,
  Text,
  TextField,
  Toggle,
  VStack,
  ZStack
} from "./primitives";
export type {
  AgentUIButtonProps,
  AgentUIFormProps,
  AgentUIIconProps,
  AgentUIImageProps,
  AgentUILabelProps,
  AgentUIListProps,
  AgentUIPickerOption,
  AgentUIPickerOptionValue,
  AgentUIPickerProps,
  AgentUIScrollProps,
  AgentUISecureFieldProps,
  AgentUISectionProps,
  AgentUISliderProps,
  AgentUIStepperProps,
  AgentUITextProps,
  AgentUITextFieldProps,
  AgentUIToggleProps,
  ScreenProps,
  SpacerProps,
  StackAlignment,
  StackProps,
  ZStackProps
} from "./primitives";
export { resolvePrimitiveTestID } from "./props";
export type {
  AgentUIActionablePrimitiveProps,
  AgentUIPrimitiveProps,
  AgentUIViewProps
} from "./props";
export {
  agentUIBouncy,
  agentUIComposeMotionAdapter,
  agentUIComposeMotionPresets,
  agentUIEaseInOut,
  agentUIGentle,
  agentUIGestureConfig,
  agentUILayoutTransitionSmooth,
  agentUIMotionAdapters,
  agentUINativeMotionMatrix,
  agentUIOpacityTransition,
  agentUIReanimatedAdapter,
  agentUIScaleTransition,
  agentUISlideTransition,
  agentUISnappy,
  agentUISpring,
  agentUISwiftUIMotionAdapter,
  agentUISwiftUIMotionPresets,
  createAgentUIMotionEvent,
  effectiveAgentUIReducedMotion,
  isValidAgentUIMotionSpringConfig,
  isValidAgentUIMotionTimingConfig,
  listAgentUIMotionAdapters,
  resetAgentUIReducedMotionCache,
  resolveAgentUIMotionAdapter,
  resolveAgentUIReducedMotion
} from "./motion";
export type {
  AgentUIGestureConfig,
  AgentUIGestureStrategy,
  AgentUILayoutTransitionConfig,
  AgentUIMotionAdapter,
  AgentUIMotionAdapterCapabilities,
  AgentUIMotionAdapterPlatform,
  AgentUIMotionAdapterTier,
  AgentUIMotionEasing,
  AgentUIMotionEvent,
  AgentUIMotionEventType,
  AgentUIMotionNativePresetMapping,
  AgentUIMotionPresetName,
  AgentUIMotionSpringConfig,
  AgentUIMotionTimingConfig,
  AgentUIReducedMotion,
  AgentUISlideEdge,
  AgentUITransitionConfig
} from "./motion";
export {
  agentUISwiftUIAdapter,
  detectAgentUISwiftUINativeModule,
  refreshAgentUISwiftUIAdapter,
  createAgentUISwiftUIButton,
  createAgentUISwiftUIToggle,
  createAgentUISwiftUITextField,
  createAgentUISwiftUISecureField,
  createAgentUISwiftUISlider,
  createAgentUISwiftUIPicker,
} from "./swift-ui";
export type {
  AgentUISwiftUIAdapter,
  AgentUISwiftUIAdapterCapabilities,
  AgentUISwiftUIButtonProps,
  AgentUISwiftUIToggleProps,
  AgentUISwiftUITextFieldProps,
  AgentUISwiftUISecureFieldProps,
  AgentUISwiftUISliderProps,
  AgentUISwiftUIPickerProps,
  AgentUISwiftUIPickerOption,
} from "./swift-ui";
export {
  agentUIComposeAdapter,
  detectAgentUIComposeNativeModule,
  refreshAgentUIComposeAdapter,
  createAgentUIComposeButton,
  createAgentUIComposeTextField,
  createAgentUIComposeSwitch,
  createAgentUIComposeSlider,
} from "./jetpack-compose";
export type {
  AgentUIComposeAdapter,
  AgentUIComposeAdapterCapabilities,
  AgentUIComposeButtonProps,
  AgentUIComposeTextFieldProps,
  AgentUIComposeSwitchProps,
  AgentUIComposeSliderProps,
  AgentUIComposeColumnProps,
  AgentUIComposeRowProps,
  AgentUIComposeBoxProps,
} from "./jetpack-compose";

export type {
  AgentUINativeAdapterTier,
  AgentUINativeAdapterPlatform,
} from "./swift-ui";

export type {
  WaitConditionKind,
  WaitCondition,
  SemanticFlowStepType,
  SemanticFlowStep,
  SemanticFlow,
  FlowRunnerResult
} from "./flows";
export {
  isValidFlowStepType,
  validateFlowStep,
  validateFlow,
  stepRequiresApproval,
  createFlowRunner
} from "./flows";

export {
  VALID_CHANGE_KINDS,
  isValidPatchChangeKind,
  validatePatchChange,
  validatePatchProposal,
  createPatchProposal,
  mergePatchProposals,
} from "./patching";
export type {
  PatchChangeKind,
  PatchChange,
  PatchProposal,
  PatchValidationResult,
} from "./patching";

export type AgentUICapability =
  | "component-primitives"
  | "semantic-runtime"
  | "agent-bridge"
  | "motion-layer"
  | "expo-ui-adapter"
  | "flow-runner"
  | "patch-proposals";

export interface AgentUIPackageManifest {
  packageName: typeof agentUICorePackage;
  stage: typeof agentUICoreStage;
  jsOnly: true;
  implementedCapabilities: AgentUICapability[];
  deferredCapabilities: AgentUICapability[];
}

export function getAgentUIPackageManifest(): AgentUIPackageManifest {
  return {
    packageName: agentUICorePackage,
    stage: agentUICoreStage,
    jsOnly: true,
    implementedCapabilities: ["component-primitives", "semantic-runtime", "agent-bridge", "motion-layer", "expo-ui-adapter", "flow-runner", "patch-proposals"],
    deferredCapabilities: []
  };
}

export type AgentUINativeAdapter = AgentUISwiftUIAdapter | AgentUIComposeAdapter;

export const agentUINativeAdapters: readonly AgentUINativeAdapter[] = [
  agentUISwiftUIAdapter,
  agentUIComposeAdapter,
];

export function listAgentUINativeAdapters(options?: {
  platform?: "ios" | "android";
}): AgentUINativeAdapter[] {
  const target = options?.platform;
  return agentUINativeAdapters.filter((a) => {
    if (!target) return true;
    return a.platform === target;
  });
}

export function resolveAgentUINativeAdapter(
  platform?: "ios" | "android"
): AgentUINativeAdapter {
  if (platform === "ios") return agentUISwiftUIAdapter;
  if (platform === "android") return agentUIComposeAdapter;
  return agentUISwiftUIAdapter;
}
