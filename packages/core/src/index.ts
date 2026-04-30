export const agentUICorePackage = "@agent-ui/core" as const;
export const agentUICoreStage = "component-primitives" as const;

export {
  AgentUIProvider,
  useAgentUIRuntime,
  useDeferredSemanticPrimitive
} from "./semantic";
export type {
  AgentUIContextValue,
  AgentUIPrimitiveAction,
  AgentUIPrimitivePrivacy,
  AgentUIPrimitiveRole,
  AgentUIProviderProps,
  AgentUISemanticPrimitive,
  AgentUISemanticPrimitiveValue,
  AgentUISemanticRuntime,
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
    implementedCapabilities: ["component-primitives"],
    deferredCapabilities: [
      "semantic-runtime",
      "agent-bridge",
      "motion-layer"
    ]
  };
}
