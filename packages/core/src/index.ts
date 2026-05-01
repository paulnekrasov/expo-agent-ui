export const agentUICorePackage = "@agent-ui/core" as const;
export const agentUICoreStage = "semantic-runtime" as const;

export {
  createAgentUIBridgeGate,
  AGENT_UI_BRIDGE_PROTOCOL_VERSION,
  DEFAULT_AGENT_UI_BRIDGE_CAPABILITIES
} from "./bridge";
export type {
  AgentUIBridgeCapability,
  AgentUIBridgeConfig,
  AgentUIBridgeExecutionEnvironment,
  AgentUIBridgeGateOptions,
  AgentUIBridgeGateResult,
  AgentUIBridgeGateResultCode,
  AgentUIBridgeProtocolVersion,
  AgentUIBridgeTransportMode
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

export type AgentUICapability =
  | "component-primitives"
  | "semantic-runtime"
  | "agent-bridge"
  | "motion-layer";

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
    implementedCapabilities: ["component-primitives", "semantic-runtime"],
    deferredCapabilities: ["agent-bridge", "motion-layer"]
  };
}
