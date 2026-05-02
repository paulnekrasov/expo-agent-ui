import * as React from "react";
import { Platform, Pressable, Switch as RNSwitch, Text as RNText, TextInput, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

import type {
  AgentUIPrimitiveProps,
  AgentUIActionablePrimitiveProps
} from "./props";
import { resolvePrimitiveTestID, warnInDevelopment } from "./props";

// ---------------------------------------------------------------------------
// Adapter capability types
// ---------------------------------------------------------------------------

/**
 * Adapter capability flags. Each key represents a Jetpack Compose control or
 * layout primitive that the Tier 3 native adapter can render when available.
 *
 * All flags default to `false` until a native `@expo/ui/jetpack-compose`
 * module is detected at runtime.
 */
export interface AgentUIComposeAdapterCapabilities {
  button: boolean;
  filledTonalButton: boolean;
  outlinedButton: boolean;
  elevatedButton: boolean;
  textButton: boolean;
  textField: boolean;
  switchControl: boolean;
  checkbox: boolean;
  radioButton: boolean;
  slider: boolean;
  column: boolean;
  row: boolean;
  box: boolean;
  surface: boolean;
  lazyColumn: boolean;
  listItem: boolean;
  card: boolean;
  chip: boolean;
  icon: boolean;
  iconButton: boolean;
  alertDialog: boolean;
  basicAlertDialog: boolean;
  modalBottomSheet: boolean;
  tooltip: boolean;
  dropdownMenu: boolean;
  contextMenu: boolean;
  searchBar: boolean;
  host: boolean;
  rnHostView: boolean;
  spacer: boolean;
}

/**
 * Native adapter tier. Tier 1 is the cross-platform Reanimated base (defined
 * in motion.ts). Tier 2 is the iOS SwiftUI native adapter. Tier 3 is the
 * Android Jetpack Compose native adapter.
 */
export type AgentUINativeAdapterTier = 2 | 3;

/**
 * Adapter target platform.
 */
export type AgentUINativeAdapterPlatform = "ios" | "android";

/**
 * A Tier 3 native Jetpack Compose adapter contract. Defines the adapter's
 * tier, platform target, capability flags, and runtime availability checks.
 *
 * Consumers call `isAvailable()` before routing to native rendering and
 * `isExpoGo()` to detect the restricted Expo Go runtime.
 */
export interface AgentUIComposeAdapter {
  tier: AgentUINativeAdapterTier;
  platform: AgentUINativeAdapterPlatform;
  name: string;
  capabilities: AgentUIComposeAdapterCapabilities;
  isAvailable(): boolean;
  isExpoGo(): boolean;
  requiresHost: boolean;
}

// ---------------------------------------------------------------------------
// Component prop types
// ---------------------------------------------------------------------------

/**
 * Props for a Compose button primitive. Extends actionable props with
 * button-specific fields such as variant, label, and onClick.
 */
export interface AgentUIComposeButtonProps
  extends AgentUIActionablePrimitiveProps {
  label?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  variant?: "filled" | "filledTonal" | "outlined" | "elevated" | "text";
  style?: StyleProp<ViewStyle>;
}

/**
 * Props for a Compose text field primitive. Supports controlled and
 * uncontrolled text entry, keyboard type, and secure text entry.
 */
export interface AgentUIComposeTextFieldProps
  extends AgentUIActionablePrimitiveProps {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onChangeText?: (text: string) => void;
  onSubmitEditing?: () => void;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  secureTextEntry?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Props for a Compose switch primitive. Controlled boolean toggle.
 */
export interface AgentUIComposeSwitchProps
  extends AgentUIActionablePrimitiveProps {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Props for a Compose slider primitive. Controlled number within a range.
 */
export interface AgentUIComposeSliderProps
  extends AgentUIActionablePrimitiveProps {
  value: number;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  onValueChange?: (value: number) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Props for a Compose column layout primitive. Accepts children, alignment,
 * and spacing.
 */
export interface AgentUIComposeColumnProps extends AgentUIPrimitiveProps {
  children?: React.ReactNode;
  alignment?: "start" | "center" | "end" | "stretch";
  spacing?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Props for a Compose row layout primitive. Same shape as column.
 */
export interface AgentUIComposeRowProps extends AgentUIComposeColumnProps {}

/**
 * Props for a Compose box container primitive. Generic layout container.
 */
export interface AgentUIComposeBoxProps extends AgentUIPrimitiveProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

// ---------------------------------------------------------------------------
// Default capability set (all off until native module is detected)
// ---------------------------------------------------------------------------

const defaultComposeCapabilityDefaults: AgentUIComposeAdapterCapabilities = {
  button: false,
  filledTonalButton: false,
  outlinedButton: false,
  elevatedButton: false,
  textButton: false,
  textField: false,
  switchControl: false,
  checkbox: false,
  radioButton: false,
  slider: false,
  column: false,
  row: false,
  box: false,
  surface: false,
  lazyColumn: false,
  listItem: false,
  card: false,
  chip: false,
  icon: false,
  iconButton: false,
  alertDialog: false,
  basicAlertDialog: false,
  modalBottomSheet: false,
  tooltip: false,
  dropdownMenu: false,
  contextMenu: false,
  searchBar: false,
  host: false,
  rnHostView: false,
  spacer: false
};

const defaultComposeCapabilities: AgentUIComposeAdapterCapabilities = {
  ...defaultComposeCapabilityDefaults,
};

function populateAgentUIComposeCapabilities(available: boolean): void {
  const keys = Object.keys(
    defaultComposeCapabilityDefaults,
  ) as (keyof AgentUIComposeAdapterCapabilities)[];
  for (const key of keys) {
    defaultComposeCapabilities[key] = available;
  }
}

function resetAgentUIComposeCapabilities(): void {
  const keys = Object.keys(
    defaultComposeCapabilityDefaults,
  ) as (keyof AgentUIComposeAdapterCapabilities)[];
  for (const key of keys) {
    defaultComposeCapabilities[key] =
      defaultComposeCapabilityDefaults[key];
  }
}

// ---------------------------------------------------------------------------
// Adapter instance
// ---------------------------------------------------------------------------

let _agentUIComposeDetectionRun = false;
let _agentUIComposeDetectionResult = false;

export function detectAgentUIComposeNativeModule(): boolean {
  if (_agentUIComposeDetectionRun) return _agentUIComposeDetectionResult;
  _agentUIComposeDetectionRun = true;
  if (Platform.OS !== "android") {
    _agentUIComposeDetectionResult = false;
    populateAgentUIComposeCapabilities(false);
    return false;
  }
  try {
    require("@expo/ui/jetpack-compose");
    _agentUIComposeDetectionResult = true;
    populateAgentUIComposeCapabilities(true);
    return true;
  } catch {
    _agentUIComposeDetectionResult = false;
    populateAgentUIComposeCapabilities(false);
    return false;
  }
}

export function refreshAgentUIComposeAdapter(): void {
  _agentUIComposeDetectionRun = false;
  _agentUIComposeDetectionResult = false;
  resetAgentUIComposeCapabilities();
}

/**
 * The Tier 3 native Android Jetpack Compose adapter stub. Targets Android
 * only. Not available by default — requires `@expo/ui/jetpack-compose` to
 * be installed in a development build.
 *
 * When available, this adapter routes Agent UI primitives to Compose
 * controls (Button, TextField, Switch, Slider, Column, Row, Box, etc.).
 *
 * Native implementation is Stage 7. The adapter stub defines the contract.
 *
 * Sizing conventions for Host when using native Compose controls:
 * - Use `matchContents` for intrinsic controls (Button, Switch, TextField).
 * - Use `style={{ flex: 1 }}` for scrollable content (LazyColumn, Column
 *   with modifiers).
 * - Use `useViewportSizeMeasurement` for dialog/sheet overlays.
 * - Prefer explicit sizing over relying on Compose's measuring pass for the
 *   Host boundary.
 */
export const agentUIComposeAdapter: AgentUIComposeAdapter = {
  tier: 3,
  platform: "android",
  name: "Jetpack Compose",
  capabilities: defaultComposeCapabilities,
  isAvailable: () => detectAgentUIComposeNativeModule(),
  isExpoGo: () => false,
  /** When true, every native Compose component must be rendered inside a Host boundary. */
  requiresHost: true
};

// ---------------------------------------------------------------------------
// Component factories (React Native fallbacks)
// ---------------------------------------------------------------------------

/**
 * Create a Compose Button component factory. Returns a `React.FC` that
 * renders a `Pressable` + `Text` React Native fallback when the native
 * Compose adapter is not available.
 *
 * Native rendering injection is deferred to Stage 7.
 */
export function createAgentUIComposeButton(): React.FC<
  AgentUIComposeButtonProps
> {
  return React.memo(function AgentUIComposeButton(
    props: AgentUIComposeButtonProps
  ) {
    const {
      id,
      label,
      disabled,
      busy,
      onClick,
      children,
      style,
      accessibilityLabel,
      intent,
      testID
    } = props;

    React.useEffect(() => {
      warnInDevelopment(
        "Agent UI Compose Button: @expo/ui/jetpack-compose not available, using React Native fallback. Install @expo/ui and use a development build for native Compose UI."
      );
    }, []);

    return React.createElement(
      Pressable,
      {
        onPress: onClick,
        disabled: disabled,
        style,
        testID: resolvePrimitiveTestID(id, testID),
        accessible: true,
        accessibilityRole: "button",
        accessibilityLabel: accessibilityLabel ?? label,
        accessibilityState: disabled
          ? { disabled: true }
          : busy
            ? { busy: true }
            : undefined
      },
      React.createElement(RNText, null, label ?? children)
    );
  });
}

/**
 * Create a Compose TextField component factory. Returns a `React.FC` that
 * renders a `TextInput` React Native fallback when the native Compose
 * adapter is not available.
 *
 * Native rendering injection is deferred to Stage 7.
 */
export function createAgentUIComposeTextField(): React.FC<
  AgentUIComposeTextFieldProps
> {
  return React.memo(function AgentUIComposeTextField(
    props: AgentUIComposeTextFieldProps
  ) {
    const {
      id,
      value,
      defaultValue,
      placeholder,
      onChangeText,
      onSubmitEditing,
      keyboardType,
      secureTextEntry,
      disabled,
      busy,
      style,
      accessibilityLabel,
      intent,
      testID
    } = props;

    React.useEffect(() => {
      warnInDevelopment(
        "Agent UI Compose TextField: @expo/ui/jetpack-compose not available, using React Native fallback. Install @expo/ui and use a development build for native Compose UI."
      );
    }, []);

    const resolvedTestID = resolvePrimitiveTestID(id, testID);

    const textInputProps: Record<string, unknown> = {
      style,
      testID: resolvedTestID,
      accessible: true,
      accessibilityLabel,
      accessibilityState: disabled
        ? { disabled: true }
        : busy
          ? { busy: true }
          : undefined,
      placeholder,
      keyboardType,
      secureTextEntry,
      onSubmitEditing,
      editable: !disabled && !busy
    };

    if (value !== undefined) {
      textInputProps.value = value;
      textInputProps.onChangeText = onChangeText;
    } else {
      textInputProps.defaultValue = defaultValue;
      textInputProps.onChangeText = onChangeText;
    }

    return React.createElement(TextInput, textInputProps as unknown as Record<string, unknown>);
  });
}

/**
 * Create a Compose Switch component factory. Returns a `React.FC` that
 * renders a `Switch` + optional `Text` label React Native fallback when
 * the native Compose adapter is not available.
 *
 * Native rendering injection is deferred to Stage 7.
 */
export function createAgentUIComposeSwitch(): React.FC<
  AgentUIComposeSwitchProps
> {
  return React.memo(function AgentUIComposeSwitch(
    props: AgentUIComposeSwitchProps
  ) {
    const {
      id,
      checked,
      onCheckedChange,
      label,
      disabled,
      busy,
      style,
      accessibilityLabel,
      intent,
      testID
    } = props;

    React.useEffect(() => {
      warnInDevelopment(
        "Agent UI Compose Switch: @expo/ui/jetpack-compose not available, using React Native fallback. Install @expo/ui and use a development build for native Compose UI."
      );
    }, []);

    const resolvedTestID = resolvePrimitiveTestID(id, testID);

    return React.createElement(
      View,
      {
        style,
        testID: resolvedTestID,
        accessible: true,
        accessibilityRole: "switch",
        accessibilityLabel: accessibilityLabel ?? label,
        accessibilityState: {
          checked,
          ...(disabled ? { disabled: true } : {}),
          ...(busy ? { busy: true } : {})
        }
      },
      React.createElement(RNSwitch, {
        value: checked,
        onValueChange: onCheckedChange,
        disabled: disabled || busy
      }),
      label
        ? React.createElement(RNText, null, label)
        : null
    );
  });
}

/**
 * Create a Compose Slider component factory. Returns a `React.FC` that
 * renders a `View` + value `Text` React Native fallback when the native
 * Compose adapter is not available. React Native does not ship a built-in
 * Slider, so the fallback displays the current numeric value as text.
 *
 * Native rendering injection is deferred to Stage 7.
 */
export function createAgentUIComposeSlider(): React.FC<
  AgentUIComposeSliderProps
> {
  return React.memo(function AgentUIComposeSlider(
    props: AgentUIComposeSliderProps
  ) {
    const {
      id,
      value,
      minimumValue,
      maximumValue,
      step,
      onValueChange,
      disabled,
      busy,
      style,
      accessibilityLabel,
      intent,
      testID
    } = props;

    React.useEffect(() => {
      warnInDevelopment(
        "Agent UI Compose Slider: @expo/ui/jetpack-compose not available, using React Native fallback. Install @expo/ui and use a development build for native Compose UI."
      );
    }, []);

    const resolvedTestID = resolvePrimitiveTestID(id, testID);

    return React.createElement(
      View,
      {
        style,
        testID: resolvedTestID,
        accessible: true,
        accessibilityRole: "adjustable",
        accessibilityLabel,
        accessibilityValue: {
          min: minimumValue,
          max: maximumValue,
          now: value
        },
        accessibilityState: disabled
          ? { disabled: true }
          : busy
            ? { busy: true }
            : undefined
      },
      React.createElement(RNText, null, String(value))
    );
  });
}

// ---------------------------------------------------------------------------
// Adapter registry note
// ---------------------------------------------------------------------------
//
// The combined native adapter registry (`agentUINativeAdapters`) and the
// `listAgentUINativeAdapters` / `resolveAgentUINativeAdapter` helpers are
// exported from the root `index.ts` alongside the SwiftUI adapter.
// Individual adapter files export only their own instance.
