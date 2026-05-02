import * as React from "react";
import { Platform, View, Text as RNText } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

import type {
  AgentUIPrimitiveProps,
  AgentUIActionablePrimitiveProps,
} from "./props";
import { resolvePrimitiveTestID, warnInDevelopment } from "./props";
import type { AgentUISemanticPrimitive } from "./semantic";

// ---------------------------------------------------------------------------
// Adapter Types
// ---------------------------------------------------------------------------

/** Capability flags describing which SwiftUI-native controls are supported. */
export interface AgentUISwiftUIAdapterCapabilities {
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
}

/** Adapter tier: 2 = SwiftUI, 3 = further classification. */
export type AgentUINativeAdapterTier = 2 | 3;

/** Adapter platform identifier. */
export type AgentUINativeAdapterPlatform = "ios" | "android";

/** SwiftUI adapter instance interface exported for injection and inspection. */
export interface AgentUISwiftUIAdapter {
  tier: AgentUINativeAdapterTier;
  platform: AgentUINativeAdapterPlatform;
  name: string;
  capabilities: AgentUISwiftUIAdapterCapabilities;
  isAvailable(): boolean;
  isExpoGo(): boolean;
  requiresHost: boolean;
}

// ---------------------------------------------------------------------------
// Adapter Capability Defaults
// ---------------------------------------------------------------------------

const agentUISwiftUICapabilityDefaults: AgentUISwiftUIAdapterCapabilities = {
  button: false,
  toggle: false,
  textField: false,
  secureField: false,
  slider: false,
  picker: false,
  host: false,
  rnHostView: false,
  list: false,
  form: false,
  section: false,
  bottomSheet: false,
  popover: false,
  menu: false,
};

const agentUISwiftUICapabilities: AgentUISwiftUIAdapterCapabilities = {
  ...agentUISwiftUICapabilityDefaults,
};

function populateAgentUISwiftUICapabilities(available: boolean): void {
  const keys = Object.keys(
    agentUISwiftUICapabilityDefaults,
  ) as (keyof AgentUISwiftUIAdapterCapabilities)[];
  for (const key of keys) {
    agentUISwiftUICapabilities[key] = available;
  }
}

function resetAgentUISwiftUICapabilities(): void {
  const keys = Object.keys(
    agentUISwiftUICapabilityDefaults,
  ) as (keyof AgentUISwiftUIAdapterCapabilities)[];
  for (const key of keys) {
    agentUISwiftUICapabilities[key] =
      agentUISwiftUICapabilityDefaults[key];
  }
}

// ---------------------------------------------------------------------------
// Adapter Instance
// ---------------------------------------------------------------------------

/**
 * Default SwiftUI adapter instance.
 *
 * Capabilities are `false` by default so the JS runtime can safely load and
 * test without `@expo/ui`. Enable individual capabilities after verifying
 * native availability at runtime.
 */
let _agentUISwiftUIDetectionRun = false;
let _agentUISwiftUIDetectionResult = false;

export function detectAgentUISwiftUINativeModule(): boolean {
  if (_agentUISwiftUIDetectionRun) return _agentUISwiftUIDetectionResult;
  _agentUISwiftUIDetectionRun = true;
  if (Platform.OS !== "ios") {
    _agentUISwiftUIDetectionResult = false;
    populateAgentUISwiftUICapabilities(false);
    return false;
  }
  try {
    require("@expo/ui/swift-ui");
    _agentUISwiftUIDetectionResult = true;
    populateAgentUISwiftUICapabilities(true);
    return true;
  } catch {
    _agentUISwiftUIDetectionResult = false;
    populateAgentUISwiftUICapabilities(false);
    return false;
  }
}

export function refreshAgentUISwiftUIAdapter(): void {
  _agentUISwiftUIDetectionRun = false;
  _agentUISwiftUIDetectionResult = false;
  resetAgentUISwiftUICapabilities();
}

/**
 * Default SwiftUI adapter instance.
 *
 * Sizing conventions for Host when using native SwiftUI controls:
 * - Use `matchContents` for intrinsic controls (Button, Toggle, small Picker).
 * - Use `style={{ flex: 1 }}` for scrollable content (List, Form, Section).
 * - Use `useViewportSizeMeasurement` for full-screen layouts.
 * - Do not mix React Native Yoga layout and SwiftUI layout in the same Host
 *   without explicit sizing on both sides.
 *
 * When `requiresHost` is `true`, every native SwiftUI component must be
 * rendered inside a Host boundary.
 */
export const agentUISwiftUIAdapter: AgentUISwiftUIAdapter = {
  tier: 2,
  platform: "ios",
  name: "SwiftUI",
  capabilities: agentUISwiftUICapabilities,
  isAvailable: () => detectAgentUISwiftUINativeModule(),
  isExpoGo: () => false,
  /** When true, every native SwiftUI component must be rendered inside a Host boundary. */
  requiresHost: true,
};

// ---------------------------------------------------------------------------
// Component Prop Types
// ---------------------------------------------------------------------------

/** Props accepted by the SwiftUI Button native adapter. */
export interface AgentUISwiftUIButtonProps
  extends AgentUIActionablePrimitiveProps {
  label?: string;
  onPress?: () => void;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Props accepted by the SwiftUI Toggle native adapter. */
export interface AgentUISwiftUIToggleProps
  extends AgentUIActionablePrimitiveProps {
  checked: boolean;
  onValueChange?: (value: boolean) => void;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

/** Props accepted by the SwiftUI TextField native adapter. */
export interface AgentUISwiftUITextFieldProps
  extends AgentUIActionablePrimitiveProps {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onChangeText?: (text: string) => void;
  onSubmitEditing?: () => void;
  keyboardType?:
    | "default"
    | "numeric"
    | "email-address"
    | "phone-pad";
  secureTextEntry?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Props accepted by the SwiftUI SecureField native adapter. */
export interface AgentUISwiftUISecureFieldProps
  extends AgentUIActionablePrimitiveProps {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onChangeText?: (text: string) => void;
  onSubmitEditing?: () => void;
  style?: StyleProp<ViewStyle>;
}

/** Props accepted by the SwiftUI Slider native adapter. */
export interface AgentUISwiftUISliderProps
  extends AgentUIActionablePrimitiveProps {
  value: number;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  onValueChange?: (value: number) => void;
  style?: StyleProp<ViewStyle>;
}

/** A single option in a SwiftUI Picker. */
export interface AgentUISwiftUIPickerOption {
  label: string;
  value: string | number;
}

/** Props accepted by the SwiftUI Picker native adapter. */
export interface AgentUISwiftUIPickerProps
  extends AgentUIActionablePrimitiveProps {
  selectedValue?: string | number;
  options: AgentUISwiftUIPickerOption[];
  onValueChange?: (value: string | number) => void;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

// ---------------------------------------------------------------------------
// Helper: semantic primitive builder
// ---------------------------------------------------------------------------

function buildSemanticPrimitive(
  role: AgentUISemanticPrimitive["role"],
  props: {
    id: string;
    label: string | undefined;
    accessibilityLabel: string | undefined;
    intent: string | undefined;
    disabled: boolean | undefined;
    busy: boolean | undefined;
    testID: string | undefined;
  },
  overrides?: Partial<AgentUISemanticPrimitive>,
): AgentUISemanticPrimitive {
  return {
    role,
    label: props.label ?? props.accessibilityLabel ?? props.id,
    intent: props.intent,
    testID: resolvePrimitiveTestID(props.id, props.testID),
    disabled: props.disabled,
    busy: props.busy,
    ...overrides,
  } as AgentUISemanticPrimitive;
}

// ---------------------------------------------------------------------------
// Safe runtime lookup (no crash when AgentUIProvider is absent)
// ---------------------------------------------------------------------------

interface AgentUIRuntimeLike {
  registerPrimitive: (
    p: AgentUISemanticPrimitive,
  ) => () => void;
}

function useSafeRuntime(): AgentUIRuntimeLike | null {
  const [runtime, setRuntime] = React.useState<AgentUIRuntimeLike | null>(null);
  React.useEffect(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      const mod = require("./semantic") as {
        useAgentUIRuntime: () => AgentUIRuntimeLike | null;
      };
      setRuntime(mod.useAgentUIRuntime());
    } catch {
      setRuntime(null);
    }
  }, []);
  return runtime;
}

// ---------------------------------------------------------------------------
// Factory: SwiftUI Button
// ---------------------------------------------------------------------------

/**
 * Build a SwiftUI-native Button component.
 *
 * When `nativeRenderer` is provided it is called with the full props object;
 * otherwise a React Native `View` + `Text` fallback is rendered.
 */
export function createAgentUISwiftUIButton(
  nativeRenderer?: (props: AgentUISwiftUIButtonProps) => React.ReactElement | null,
): React.FC<AgentUISwiftUIButtonProps> {
  return React.memo(function AgentUISwiftUIButton(
    props: AgentUISwiftUIButtonProps,
  ) {
    const runtime = useSafeRuntime();
    const primitive = React.useMemo(
      () =>
        buildSemanticPrimitive("textInput", {
          id: props.id,
          label: props.accessibilityLabel,
          accessibilityLabel: props.accessibilityLabel,
          intent: props.intent,
          disabled: props.disabled,
          busy: props.busy,
          testID: props.testID,
        }, { privacy: "redacted" }),
      [
        props.id,
        props.label,
        props.accessibilityLabel,
        props.intent,
        props.disabled,
        props.busy,
        props.testID,
      ],
    );

    React.useEffect(() => {
      if (runtime) {
        return runtime.registerPrimitive(primitive);
      }
      return;
    }, [runtime, primitive]);

    if (nativeRenderer) {
      const native = nativeRenderer(props);
      if (native) return native;
    }

    warnInDevelopment(
      "AgentUISwiftUIButton: native adapter unavailable, rendering RN fallback",
    );

    return React.createElement(
      View,
      {
        accessible: true,
        accessibilityRole: "button",
        accessibilityLabel: props.accessibilityLabel ?? props.label,
        accessibilityState: {
          disabled: props.disabled,
          busy: props.busy,
        },
        testID: resolvePrimitiveTestID(props.id, props.testID),
        style: props.style,
      },
      props.children ??
        React.createElement(
          RNText,
          null,
          props.label ?? props.id,
        ),
    );
  });
}

// ---------------------------------------------------------------------------
// Factory: SwiftUI Toggle
// ---------------------------------------------------------------------------

/**
 * Build a SwiftUI-native Toggle component.
 *
 * When `nativeRenderer` is provided it is called with the full props object;
 * otherwise a React Native `View` fallback is rendered.
 */
export function createAgentUISwiftUIToggle(
  nativeRenderer?: (
    props: AgentUISwiftUIToggleProps,
  ) => React.ReactElement | null,
): React.FC<AgentUISwiftUIToggleProps> {
  return React.memo(function AgentUISwiftUIToggle(
    props: AgentUISwiftUIToggleProps,
  ) {
    const runtime = useSafeRuntime();
    const primitive = React.useMemo(
      () =>
        buildSemanticPrimitive("toggle", {
          id: props.id,
          label: props.label,
          accessibilityLabel: props.accessibilityLabel,
          intent: props.intent,
          disabled: props.disabled,
          busy: props.busy,
          testID: props.testID,
        }),
      [
        props.id,
        props.label,
        props.accessibilityLabel,
        props.intent,
        props.disabled,
        props.busy,
        props.testID,
      ],
    );

    React.useEffect(() => {
      if (runtime) {
        return runtime.registerPrimitive(primitive);
      }
      return;
    }, [runtime, primitive]);

    if (nativeRenderer) {
      const native = nativeRenderer(props);
      if (native) return native;
    }

    warnInDevelopment(
      "AgentUISwiftUIToggle: native adapter unavailable, rendering RN fallback",
    );

    return React.createElement(View, {
      accessible: true,
      accessibilityRole: "switch",
      accessibilityLabel: props.accessibilityLabel ?? props.label,
      accessibilityState: {
        disabled: props.disabled,
        checked: props.checked,
      },
      testID: resolvePrimitiveTestID(props.id, props.testID),
      style: props.style,
    });
  });
}

// ---------------------------------------------------------------------------
// Factory: SwiftUI TextField
// ---------------------------------------------------------------------------

/**
 * Build a SwiftUI-native TextField component.
 */
export function createAgentUISwiftUITextField(
  nativeRenderer?: (
    props: AgentUISwiftUITextFieldProps,
  ) => React.ReactElement | null,
): React.FC<AgentUISwiftUITextFieldProps> {
  return React.memo(function AgentUISwiftUITextField(
    props: AgentUISwiftUITextFieldProps,
  ) {
    const runtime = useSafeRuntime();
    const primitive = React.useMemo(
      () =>
        buildSemanticPrimitive("textInput", {
          id: props.id,
          label: props.accessibilityLabel,
          accessibilityLabel: props.accessibilityLabel,
          intent: props.intent,
          disabled: props.disabled,
          busy: props.busy,
          testID: props.testID,
        }),
      [
        props.id,
        props.accessibilityLabel,
        props.intent,
        props.disabled,
        props.busy,
        props.testID,
      ],
    );

    React.useEffect(() => {
      if (runtime) {
        return runtime.registerPrimitive(primitive);
      }
      return;
    }, [runtime, primitive]);

    if (nativeRenderer) {
      const native = nativeRenderer(props);
      if (native) return native;
    }

    warnInDevelopment(
      "AgentUISwiftUITextField: native adapter unavailable, rendering RN fallback",
    );

    return React.createElement(View, {
      accessible: true,
      accessibilityLabel: props.accessibilityLabel,
      accessibilityState: { disabled: props.disabled },
      testID: resolvePrimitiveTestID(props.id, props.testID),
      style: props.style,
    });
  });
}

// ---------------------------------------------------------------------------
// Factory: SwiftUI SecureField
// ---------------------------------------------------------------------------

/**
 * Build a SwiftUI-native SecureField component.
 */
export function createAgentUISwiftUISecureField(
  nativeRenderer?: (
    props: AgentUISwiftUISecureFieldProps,
  ) => React.ReactElement | null,
): React.FC<AgentUISwiftUISecureFieldProps> {
  return React.memo(function AgentUISwiftUISecureField(
    props: AgentUISwiftUISecureFieldProps,
  ) {
    const runtime = useSafeRuntime();
    const primitive = React.useMemo(
      () =>
        buildSemanticPrimitive("textInput", {
          id: props.id,
          label: props.accessibilityLabel,
          accessibilityLabel: props.accessibilityLabel,
          intent: props.intent,
          disabled: props.disabled,
          busy: props.busy,
          testID: props.testID,
        }),
      [
        props.id,
        props.accessibilityLabel,
        props.intent,
        props.disabled,
        props.busy,
        props.testID,
      ],
    );

    React.useEffect(() => {
      if (runtime) {
        return runtime.registerPrimitive(primitive);
      }
      return;
    }, [runtime, primitive]);

    if (nativeRenderer) {
      const native = nativeRenderer(props);
      if (native) return native;
    }

    warnInDevelopment(
      "AgentUISwiftUISecureField: native adapter unavailable, rendering RN fallback",
    );

    return React.createElement(View, {
      accessible: true,
      accessibilityLabel: props.accessibilityLabel,
      accessibilityState: { disabled: props.disabled },
      testID: resolvePrimitiveTestID(props.id, props.testID),
      style: props.style,
    });
  });
}

// ---------------------------------------------------------------------------
// Factory: SwiftUI Slider
// ---------------------------------------------------------------------------

/**
 * Build a SwiftUI-native Slider component.
 */
export function createAgentUISwiftUISlider(
  nativeRenderer?: (
    props: AgentUISwiftUISliderProps,
  ) => React.ReactElement | null,
): React.FC<AgentUISwiftUISliderProps> {
  return React.memo(function AgentUISwiftUISlider(
    props: AgentUISwiftUISliderProps,
  ) {
    const runtime = useSafeRuntime();
    const primitive = React.useMemo(
      () =>
        buildSemanticPrimitive("slider", {
          id: props.id,
          label: props.accessibilityLabel,
          accessibilityLabel: props.accessibilityLabel,
          intent: props.intent,
          disabled: props.disabled,
          busy: props.busy,
          testID: props.testID,
        }),
      [
        props.id,
        props.accessibilityLabel,
        props.intent,
        props.disabled,
        props.busy,
        props.testID,
      ],
    );

    React.useEffect(() => {
      if (runtime) {
        return runtime.registerPrimitive(primitive);
      }
      return;
    }, [runtime, primitive]);

    if (nativeRenderer) {
      const native = nativeRenderer(props);
      if (native) return native;
    }

    warnInDevelopment(
      "AgentUISwiftUISlider: native adapter unavailable, rendering RN fallback",
    );

    return React.createElement(View, {
      accessible: true,
      accessibilityRole: "adjustable",
      accessibilityLabel: props.accessibilityLabel,
      accessibilityState: { disabled: props.disabled },
      testID: resolvePrimitiveTestID(props.id, props.testID),
      style: props.style,
    });
  });
}

// ---------------------------------------------------------------------------
// Factory: SwiftUI Picker
// ---------------------------------------------------------------------------

/**
 * Build a SwiftUI-native Picker component.
 */
export function createAgentUISwiftUIPicker(
  nativeRenderer?: (
    props: AgentUISwiftUIPickerProps,
  ) => React.ReactElement | null,
): React.FC<AgentUISwiftUIPickerProps> {
  return React.memo(function AgentUISwiftUIPicker(
    props: AgentUISwiftUIPickerProps,
  ) {
    const runtime = useSafeRuntime();
    const primitive = React.useMemo(
      () =>
        buildSemanticPrimitive("picker", {
          id: props.id,
          label: props.label,
          accessibilityLabel: props.accessibilityLabel,
          intent: props.intent,
          disabled: props.disabled,
          busy: props.busy,
          testID: props.testID,
        }),
      [
        props.id,
        props.label,
        props.accessibilityLabel,
        props.intent,
        props.disabled,
        props.busy,
        props.testID,
      ],
    );

    React.useEffect(() => {
      if (runtime) {
        return runtime.registerPrimitive(primitive);
      }
      return;
    }, [runtime, primitive]);

    if (nativeRenderer) {
      const native = nativeRenderer(props);
      if (native) return native;
    }

    warnInDevelopment(
      "AgentUISwiftUIPicker: native adapter unavailable, rendering RN fallback",
    );

    return React.createElement(View, {
      accessible: true,
      accessibilityRole: "none",
      accessibilityLabel: props.accessibilityLabel ?? props.label,
      accessibilityState: { disabled: props.disabled },
      testID: resolvePrimitiveTestID(props.id, props.testID),
      style: props.style,
    });
  });
}
