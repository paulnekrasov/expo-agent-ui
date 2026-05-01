import * as React from "react";
import {
  Image as RNImage,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch as RNSwitch,
  Text as RNText,
  TextInput,
  View
} from "react-native";
import type {
  GestureResponderEvent,
  ImageProps as RNImageProps,
  ImageStyle,
  PressableProps,
  PressableStateCallbackType,
  ScrollViewProps,
  StyleProp,
  SwitchProps,
  TextInputProps,
  TextProps as RNTextProps,
  TextStyle,
  ViewProps,
  ViewStyle
} from "react-native";

import type {
  AgentUIActionablePrimitiveProps,
  AgentUIPrimitiveProps,
  AgentUIViewProps
} from "./props";

import {
  resolvePrimitiveTestID,
  warnInDevelopment
} from "./props";

import type { AgentUISemanticPrimitive } from "./semantic";
import {
  AgentUISemanticBoundary,
  useDeferredSemanticPrimitive
} from "./semantic";

type AccessibilityState = NonNullable<ViewProps["accessibilityState"]>;

export interface ScreenProps extends AgentUIViewProps {
  name?: string;
  title?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export type StackAlignment = "start" | "center" | "end" | "stretch";

export interface StackProps extends AgentUIViewProps {
  alignment?: StackAlignment;
  children?: React.ReactNode;
  spacing?: number;
  style?: StyleProp<ViewStyle>;
}

export interface ZStackProps extends StackProps {
  fill?: boolean;
}

export interface SpacerProps extends AgentUIPrimitiveProps {
  minLength?: number;
  style?: StyleProp<ViewStyle>;
}

export interface AgentUIScrollProps
  extends Omit<
      ScrollViewProps,
      | "accessibilityLabel"
      | "accessibilityRole"
      | "accessibilityState"
      | "id"
      | "testID"
    >,
    AgentUIPrimitiveProps {
  contentSpacing?: number;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export interface AgentUIListProps
  extends Omit<
      ViewProps,
      "accessibilityLabel" | "accessibilityRole" | "children" | "id" | "testID"
    >,
    AgentUIPrimitiveProps {
  children?: React.ReactNode;
  spacing?: number;
  style?: StyleProp<ViewStyle>;
}

export interface AgentUISectionProps
  extends Omit<
      ViewProps,
      "accessibilityLabel" | "accessibilityRole" | "children" | "id" | "testID"
    >,
    AgentUIPrimitiveProps {
  children?: React.ReactNode;
  footer?: React.ReactNode;
  footerStyle?: StyleProp<TextStyle>;
  header?: React.ReactNode;
  spacing?: number;
  style?: StyleProp<ViewStyle>;
  title?: string;
  titleStyle?: StyleProp<TextStyle>;
}

export interface AgentUIFormProps
  extends Omit<
      ViewProps,
      "accessibilityLabel" | "accessibilityRole" | "children" | "id" | "testID"
    >,
    AgentUIPrimitiveProps {
  children?: React.ReactNode;
  spacing?: number;
  style?: StyleProp<ViewStyle>;
}

export interface AgentUITextProps
  extends Omit<RNTextProps, "accessibilityLabel" | "id" | "testID">,
    AgentUIPrimitiveProps {
  children?: React.ReactNode;
  style?: StyleProp<TextStyle>;
  variant?: "body" | "title" | "headline" | "caption";
}

export interface AgentUIButtonProps
  extends Omit<
      PressableProps,
      | "accessibilityLabel"
      | "accessibilityRole"
      | "accessibilityState"
      | "children"
      | "disabled"
      | "id"
      | "testID"
    >,
    AgentUIActionablePrimitiveProps {
  children: React.ReactNode;
  style?: PressableProps["style"];
  textStyle?: StyleProp<TextStyle>;
}

export interface AgentUIImageProps
  extends Omit<
      RNImageProps,
      | "accessibilityLabel"
      | "accessibilityRole"
      | "accessible"
      | "id"
      | "style"
      | "testID"
    >,
    AgentUIPrimitiveProps {
  decorative?: boolean;
  style?: StyleProp<ImageStyle>;
}

export interface AgentUIIconProps extends AgentUIPrimitiveProps {
  children?: React.ReactNode;
  color?: string;
  decorative?: boolean;
  name: string;
  size?: number;
  style?: StyleProp<TextStyle>;
}

export interface AgentUILabelProps extends AgentUIViewProps {
  children: React.ReactNode;
  icon?: string;
  iconChildren?: React.ReactNode;
  iconStyle?: StyleProp<TextStyle>;
  spacing?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export interface AgentUITextFieldProps
  extends Omit<
      TextInputProps,
      | "accessibilityLabel"
      | "accessibilityRole"
      | "accessibilityState"
      | "editable"
      | "id"
      | "secureTextEntry"
      | "style"
      | "testID"
    >,
    AgentUIActionablePrimitiveProps {
  editable?: boolean;
  label?: string;
  style?: StyleProp<TextStyle>;
}

export type AgentUISecureFieldProps = AgentUITextFieldProps;

export interface AgentUIToggleProps
  extends Omit<
      SwitchProps,
      | "accessibilityLabel"
      | "accessibilityRole"
      | "accessibilityState"
      | "disabled"
      | "id"
      | "testID"
    >,
    AgentUIActionablePrimitiveProps {
  label?: string;
  value: boolean;
}

export interface AgentUISliderProps
  extends Omit<
      PressableProps,
      | "accessibilityActions"
      | "accessibilityLabel"
      | "accessibilityRole"
      | "accessibilityState"
      | "accessibilityValue"
      | "children"
      | "disabled"
      | "id"
      | "onAccessibilityAction"
      | "style"
      | "testID"
    >,
    AgentUIActionablePrimitiveProps {
  fillStyle?: StyleProp<ViewStyle>;
  label?: string;
  maximumValue?: number;
  minimumValue?: number;
  onValueChange?: (value: number) => void;
  step?: number;
  style?: PressableProps["style"];
  thumbStyle?: StyleProp<ViewStyle>;
  trackStyle?: StyleProp<ViewStyle>;
  value: number;
  valueFormatter?: (value: number) => string;
}

export type AgentUIPickerOptionValue = string | number;

export interface AgentUIPickerOption {
  disabled?: boolean;
  id: string;
  label: string;
  value: AgentUIPickerOptionValue;
}

export interface AgentUIPickerProps
  extends Omit<
      ViewProps,
      | "accessibilityLabel"
      | "accessibilityRole"
      | "accessibilityState"
      | "children"
      | "id"
      | "testID"
    >,
    AgentUIActionablePrimitiveProps {
  label?: string;
  onValueChange?: (
    value: AgentUIPickerOptionValue,
    option: AgentUIPickerOption
  ) => void;
  optionStyle?: StyleProp<ViewStyle>;
  optionTextStyle?: StyleProp<TextStyle>;
  options: readonly AgentUIPickerOption[];
  selectedOptionStyle?: StyleProp<ViewStyle>;
  selectedOptionTextStyle?: StyleProp<TextStyle>;
  selectedValue?: AgentUIPickerOptionValue;
  spacing?: number;
  style?: StyleProp<ViewStyle>;
}

export interface AgentUIStepperProps
  extends Omit<
      ViewProps,
      | "accessibilityActions"
      | "accessibilityLabel"
      | "accessibilityRole"
      | "accessibilityState"
      | "accessibilityValue"
      | "children"
      | "id"
      | "onAccessibilityAction"
      | "testID"
    >,
    AgentUIActionablePrimitiveProps {
  buttonStyle?: StyleProp<ViewStyle>;
  buttonTextStyle?: StyleProp<TextStyle>;
  controlStyle?: StyleProp<ViewStyle>;
  decrementLabel?: string;
  incrementLabel?: string;
  label?: string;
  labelTextStyle?: StyleProp<TextStyle>;
  maximumValue?: number;
  minimumValue?: number;
  onValueChange?: (value: number) => void;
  step?: number;
  style?: StyleProp<ViewStyle>;
  value: number;
  valueFormatter?: (value: number) => string;
  valueTextStyle?: StyleProp<TextStyle>;
}

function alignmentToFlex(alignment: StackAlignment | undefined): ViewStyle["alignItems"] {
  switch (alignment) {
    case "start":
      return "flex-start";
    case "center":
      return "center";
    case "end":
      return "flex-end";
    case "stretch":
      return "stretch";
    case undefined:
      return undefined;
  }
}

interface SemanticPrimitiveOptions {
  accessibilityLabel?: string | undefined;
  actions?: AgentUISemanticPrimitive["actions"] | undefined;
  actionHandlers?: AgentUISemanticPrimitive["actionHandlers"] | undefined;
  busy?: boolean | undefined;
  checked?: boolean | undefined;
  disabled?: boolean | undefined;
  fallbackLabel?: string | undefined;
  id?: string | undefined;
  intent?: string | undefined;
  privacy?: AgentUISemanticPrimitive["privacy"] | undefined;
  screen?: string | undefined;
  selected?: boolean | undefined;
  testID?: string | undefined;
  value?: AgentUISemanticPrimitive["value"] | undefined;
}

function createSemanticPrimitive(
  role: AgentUISemanticPrimitive["role"],
  props: SemanticPrimitiveOptions
): AgentUISemanticPrimitive {
  return {
    role,
    ...(props.id ? { id: props.id } : {}),
    ...(props.intent ? { intent: props.intent } : {}),
    ...(props.screen ? { screen: props.screen } : {}),
    ...(props.accessibilityLabel
      ? { label: props.accessibilityLabel }
      : props.fallbackLabel
        ? { label: props.fallbackLabel }
        : {}),
    ...(props.testID ? { testID: props.testID } : {}),
    ...(typeof props.busy === "boolean"
      ? { busy: props.busy }
      : {}),
    ...(typeof props.disabled === "boolean"
      ? { disabled: props.disabled }
      : {}),
    ...(typeof props.checked === "boolean"
      ? { checked: props.checked }
      : {}),
    ...(typeof props.selected === "boolean"
      ? { selected: props.selected }
      : {}),
    ...(props.actions ? { actions: props.actions } : {}),
    ...(props.actionHandlers ? { actionHandlers: props.actionHandlers } : {}),
    ...(props.privacy ? { privacy: props.privacy } : {}),
    ...(props.value ? { value: props.value } : {})
  };
}

function createAccessibilityState(options: {
  busy?: boolean | undefined;
  checked?: boolean | "mixed" | undefined;
  disabled?: boolean | undefined;
  selected?: boolean | undefined;
}): AccessibilityState | undefined {
  const state: AccessibilityState = {};

  if (typeof options.disabled === "boolean") {
    state.disabled = options.disabled;
  }

  if (typeof options.busy === "boolean") {
    state.busy = options.busy;
  }

  if (typeof options.checked === "boolean" || options.checked === "mixed") {
    state.checked = options.checked;
  }

  if (typeof options.selected === "boolean") {
    state.selected = options.selected;
  }

  return Object.keys(state).length > 0 ? state : undefined;
}

function clampNumber(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function resolveRangeStep(
  minimumValue: number,
  maximumValue: number,
  step: number | undefined
): number {
  if (typeof step === "number" && Number.isFinite(step) && step > 0) {
    return step;
  }

  const range = maximumValue - minimumValue;

  return range > 0 ? range / 100 : 1;
}

function resolveRangeBounds(
  minimumValue: number | undefined,
  maximumValue: number | undefined
): { maximum: number; minimum: number } {
  const minimum =
    typeof minimumValue === "number" && Number.isFinite(minimumValue)
      ? minimumValue
      : 0;
  const maximum =
    typeof maximumValue === "number" && Number.isFinite(maximumValue)
      ? maximumValue
      : 1;

  return maximum >= minimum
    ? { maximum, minimum }
    : { maximum: minimum, minimum: maximum };
}

function roundRangeValue(value: number): number {
  return Number(value.toFixed(6));
}

function formatRangeValue(value: number): string {
  return Number.isInteger(value) ? String(value) : String(roundRangeValue(value));
}

function readStringPayload(payload: unknown): string {
  if (typeof payload === "string") {
    return payload;
  }

  if (typeof payload === "number" || typeof payload === "boolean") {
    return String(payload);
  }

  if (payload && typeof payload === "object") {
    const value = (payload as { text?: unknown; value?: unknown }).text ??
      (payload as { value?: unknown }).value;

    if (typeof value === "string") {
      return value;
    }

    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }
  }

  return "";
}

function readNumberPayload(payload: unknown): number | undefined {
  if (typeof payload === "number" && Number.isFinite(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const value = (payload as { now?: unknown; value?: unknown }).value ??
      (payload as { now?: unknown }).now;

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }

  return undefined;
}

function readPickerPayload(payload: unknown): unknown {
  if (payload && typeof payload === "object") {
    const payloadRecord = payload as {
      id?: unknown;
      optionId?: unknown;
      value?: unknown;
    };

    return payloadRecord.value ?? payloadRecord.optionId ?? payloadRecord.id;
  }

  return payload;
}

function readableTextFromChildren(children: React.ReactNode): string | undefined {
  return typeof children === "string" || typeof children === "number"
    ? String(children)
    : undefined;
}

function warnIfActionableMetadataIsMissing(
  componentName: string,
  id: string,
  label: string | undefined
): void {
  if (id.trim().length === 0) {
    warnInDevelopment(`${componentName} requires a non-empty stable id.`);
  }

  if (!label || label.trim().length === 0) {
    warnInDevelopment(
      `${componentName} requires an accessibilityLabel or readable text children.`
    );
  }
}

function warnIfInformativeGraphicLabelIsMissing(
  componentName: string,
  decorative: boolean,
  label: string | undefined
): void {
  if (!decorative && (!label || label.trim().length === 0)) {
    warnInDevelopment(
      `${componentName} requires an accessibilityLabel unless it is decorative.`
    );
  }
}

function warnIfStructuredMetadataIsMissing(
  componentName: string,
  id: string | undefined,
  label: string | undefined
): void {
  if (!id || id.trim().length === 0) {
    warnInDevelopment(`${componentName} should provide a stable id.`);
  }

  if (!label || label.trim().length === 0) {
    warnInDevelopment(
      `${componentName} should provide an accessibilityLabel or readable title.`
    );
  }
}

function warnIfPickerOptionsAreMissing(
  options: readonly AgentUIPickerOption[]
): void {
  if (options.length === 0) {
    warnInDevelopment("Picker should provide at least one option.");
    return;
  }

  for (const option of options) {
    if (option.id.trim().length === 0 || option.label.trim().length === 0) {
      warnInDevelopment("Picker options should provide stable ids and labels.");
      return;
    }
  }
}

export function Screen({
  accessibilityLabel,
  children,
  id,
  intent,
  name,
  style,
  testID,
  title,
  ...viewProps
}: ScreenProps): React.ReactElement {
  const resolvedTestID = resolvePrimitiveTestID(id, testID);
  const label = accessibilityLabel ?? title ?? name;
  const screenName = name ?? id ?? title;
  const semantic = React.useMemo(
    () =>
      createSemanticPrimitive("screen", {
        accessibilityLabel: label,
        id,
        intent,
        screen: screenName,
        testID: resolvedTestID
      }),
    [id, intent, label, resolvedTestID, screenName]
  );

  const mountKey = useDeferredSemanticPrimitive(semantic);

  return (
    <View
      {...viewProps}
      accessibilityLabel={label}
      style={[styles.screen, style]}
      testID={resolvedTestID}
    >
      <AgentUISemanticBoundary mountKey={mountKey} screen={screenName}>
        {children}
      </AgentUISemanticBoundary>
    </View>
  );
}

function Stack({
  accessibilityLabel,
  alignment,
  children,
  direction,
  id,
  intent,
  spacing,
  style,
  testID,
  ...viewProps
}: StackProps & {
  direction: "column" | "row";
}): React.ReactElement {
  const resolvedTestID = resolvePrimitiveTestID(id, testID);
  const semantic = React.useMemo(
    () =>
      createSemanticPrimitive("stack", {
        accessibilityLabel,
        id,
        intent,
        testID: resolvedTestID
      }),
    [accessibilityLabel, id, intent, resolvedTestID]
  );

  const mountKey = useDeferredSemanticPrimitive(semantic);

  return (
    <View
      {...viewProps}
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.stack,
        {
          alignItems: alignmentToFlex(alignment),
          flexDirection: direction,
          gap: spacing
        },
        style
      ]}
      testID={resolvedTestID}
    >
      <AgentUISemanticBoundary mountKey={mountKey}>
        {children}
      </AgentUISemanticBoundary>
    </View>
  );
}

export function VStack(props: StackProps): React.ReactElement {
  return <Stack {...props} direction="column" />;
}

export function HStack(props: StackProps): React.ReactElement {
  return <Stack {...props} direction="row" />;
}

export function ZStack({
  accessibilityLabel,
  alignment,
  children,
  fill = false,
  id,
  intent,
  spacing,
  style,
  testID,
  ...viewProps
}: ZStackProps): React.ReactElement {
  const resolvedTestID = resolvePrimitiveTestID(id, testID);
  const semantic = React.useMemo(
    () =>
      createSemanticPrimitive("stack", {
        accessibilityLabel,
        id,
        intent,
        testID: resolvedTestID
      }),
    [accessibilityLabel, id, intent, resolvedTestID]
  );

  const mountKey = useDeferredSemanticPrimitive(semantic);

  return (
    <View
      {...viewProps}
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.stack,
        styles.zStack,
        {
          alignItems: alignmentToFlex(alignment),
          gap: spacing
        },
        fill ? styles.fill : undefined,
        style
      ]}
      testID={resolvedTestID}
    >
      <AgentUISemanticBoundary mountKey={mountKey}>
        {children}
      </AgentUISemanticBoundary>
    </View>
  );
}

export function Spacer({
  id,
  intent,
  minLength,
  style,
  testID
}: SpacerProps): React.ReactElement {
  const resolvedTestID = resolvePrimitiveTestID(id, testID);
  const semantic = React.useMemo(
    () =>
      createSemanticPrimitive("spacer", {
        id,
        intent,
        testID: resolvedTestID
      }),
    [id, intent, resolvedTestID]
  );

  useDeferredSemanticPrimitive(semantic);

  return (
    <View
      accessible={false}
      style={[styles.spacer, { minHeight: minLength, minWidth: minLength }, style]}
      testID={resolvedTestID}
    />
  );
}

export function Scroll({
  accessibilityLabel,
  children,
  contentContainerStyle,
  contentSpacing,
  id,
  intent,
  style,
  testID,
  ...scrollProps
}: AgentUIScrollProps): React.ReactElement {
  const resolvedTestID = resolvePrimitiveTestID(id, testID);
  const semantic = React.useMemo(
    () =>
      createSemanticPrimitive("scroll", {
        accessibilityLabel,
        actions: ["scroll", "observe"],
        id,
        intent,
        testID: resolvedTestID
      }),
    [accessibilityLabel, id, intent, resolvedTestID]
  );

  React.useEffect(() => {
    if (!id || id.trim().length === 0) {
      warnInDevelopment("Scroll should provide a stable id for agent scrolling.");
    }
  }, [id]);

  const mountKey = useDeferredSemanticPrimitive(semantic);

  return (
    <ScrollView
      {...scrollProps}
      accessibilityLabel={accessibilityLabel}
      contentContainerStyle={[
        typeof contentSpacing === "number" ? { gap: contentSpacing } : undefined,
        contentContainerStyle
      ]}
      style={style}
      testID={resolvedTestID}
    >
      <AgentUISemanticBoundary mountKey={mountKey}>
        {children}
      </AgentUISemanticBoundary>
    </ScrollView>
  );
}

export function List({
  accessibilityLabel,
  children,
  id,
  intent,
  spacing,
  style,
  testID,
  ...viewProps
}: AgentUIListProps): React.ReactElement {
  const resolvedTestID = resolvePrimitiveTestID(id, testID);
  const semantic = React.useMemo(
    () =>
      createSemanticPrimitive("list", {
        accessibilityLabel,
        actions: ["observe"],
        id,
        intent,
        testID: resolvedTestID
      }),
    [accessibilityLabel, id, intent, resolvedTestID]
  );

  React.useEffect(() => {
    warnIfStructuredMetadataIsMissing("List", id, accessibilityLabel);
  }, [accessibilityLabel, id]);

  const mountKey = useDeferredSemanticPrimitive(semantic);

  return (
    <View
      {...viewProps}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="list"
      style={[styles.list, typeof spacing === "number" ? { gap: spacing } : undefined, style]}
      testID={resolvedTestID}
    >
      <AgentUISemanticBoundary mountKey={mountKey}>
        {children}
      </AgentUISemanticBoundary>
    </View>
  );
}

export function Section({
  accessibilityLabel,
  children,
  footer,
  footerStyle,
  header,
  id,
  intent,
  spacing,
  style,
  testID,
  title,
  titleStyle,
  ...viewProps
}: AgentUISectionProps): React.ReactElement {
  const resolvedTestID = resolvePrimitiveTestID(id, testID);
  const fallbackLabel = title ?? readableTextFromChildren(header);
  const label = accessibilityLabel ?? fallbackLabel;
  const semantic = React.useMemo(
    () =>
      createSemanticPrimitive("section", {
        accessibilityLabel,
        actions: ["observe"],
        fallbackLabel,
        id,
        intent,
        testID: resolvedTestID
      }),
    [accessibilityLabel, fallbackLabel, id, intent, resolvedTestID]
  );

  React.useEffect(() => {
    warnIfStructuredMetadataIsMissing("Section", id, label);
  }, [id, label]);

  const mountKey = useDeferredSemanticPrimitive(semantic);

  const renderedHeader = title ? (
    <RNText accessibilityRole="header" style={[styles.sectionTitle, titleStyle]}>
      {title}
    </RNText>
  ) : typeof header === "string" || typeof header === "number" ? (
    <RNText accessibilityRole="header" style={[styles.sectionTitle, titleStyle]}>
      {header}
    </RNText>
  ) : (
    header ?? null
  );
  const renderedFooter =
    typeof footer === "string" || typeof footer === "number" ? (
      <RNText style={[styles.sectionFooter, footerStyle]}>{footer}</RNText>
    ) : (
      footer ?? null
    );

  return (
    <View
      {...viewProps}
      accessibilityLabel={label}
      style={[
        styles.section,
        typeof spacing === "number" ? { gap: spacing } : undefined,
        style
      ]}
      testID={resolvedTestID}
    >
      <AgentUISemanticBoundary mountKey={mountKey}>
        {renderedHeader}
        <View style={styles.sectionBody}>{children}</View>
        {renderedFooter}
      </AgentUISemanticBoundary>
    </View>
  );
}

export function Form({
  accessibilityLabel,
  children,
  id,
  intent,
  spacing,
  style,
  testID,
  ...viewProps
}: AgentUIFormProps): React.ReactElement {
  const resolvedTestID = resolvePrimitiveTestID(id, testID);
  const semantic = React.useMemo(
    () =>
      createSemanticPrimitive("form", {
        accessibilityLabel,
        actions: ["observe"],
        id,
        intent,
        testID: resolvedTestID
      }),
    [accessibilityLabel, id, intent, resolvedTestID]
  );

  React.useEffect(() => {
    warnIfStructuredMetadataIsMissing("Form", id, accessibilityLabel);
  }, [accessibilityLabel, id]);

  const mountKey = useDeferredSemanticPrimitive(semantic);

  return (
    <View
      {...viewProps}
      accessibilityLabel={accessibilityLabel}
      style={[styles.form, typeof spacing === "number" ? { gap: spacing } : undefined, style]}
      testID={resolvedTestID}
    >
      <AgentUISemanticBoundary mountKey={mountKey}>
        {children}
      </AgentUISemanticBoundary>
    </View>
  );
}

export function Text({
  accessibilityLabel,
  children,
  id,
  intent,
  style,
  testID,
  variant = "body",
  ...textProps
}: AgentUITextProps): React.ReactElement {
  const resolvedTestID = resolvePrimitiveTestID(id, testID);
  const fallbackLabel = readableTextFromChildren(children);
  const semantic = React.useMemo(
    () =>
      createSemanticPrimitive("text", {
        accessibilityLabel,
        fallbackLabel,
        id,
        intent,
        testID: resolvedTestID
      }),
    [accessibilityLabel, fallbackLabel, id, intent, resolvedTestID]
  );

  const mountKey = useDeferredSemanticPrimitive(semantic);

  return (
    <RNText
      {...textProps}
      accessibilityLabel={accessibilityLabel}
      style={[styles.text, textVariantStyles[variant], style]}
      testID={resolvedTestID}
    >
      <AgentUISemanticBoundary mountKey={mountKey}>
        {children}
      </AgentUISemanticBoundary>
    </RNText>
  );
}

export function Button({
  accessibilityLabel,
  busy,
  children,
  disabled = false,
  id,
  intent,
  onPress,
  style,
  testID,
  textStyle,
  ...pressableProps
}: AgentUIButtonProps): React.ReactElement {
  const resolvedTestID = resolvePrimitiveTestID(id, testID);
  const fallbackLabel = readableTextFromChildren(children);
  const label = accessibilityLabel ?? fallbackLabel;
  const accessibilityState = React.useMemo(
    () => createAccessibilityState({ busy, disabled }),
    [busy, disabled]
  );
  const actionHandlers = React.useMemo<AgentUISemanticPrimitive["actionHandlers"]>(
    () => {
      if (!onPress) {
        return undefined;
      }

      const syntheticEvent = { nativeEvent: {} } as GestureResponderEvent;

      return {
        activate: () => onPress(syntheticEvent),
        tap: () => onPress(syntheticEvent)
      };
    },
    [onPress]
  );
  const semantic = React.useMemo(
    () =>
      createSemanticPrimitive("button", {
        accessibilityLabel,
        actions: ["activate", "tap"],
        actionHandlers,
        busy,
        disabled,
        fallbackLabel,
        id,
        intent,
        testID: resolvedTestID
      }),
    [
      accessibilityLabel,
      actionHandlers,
      busy,
      disabled,
      fallbackLabel,
      id,
      intent,
      resolvedTestID
    ]
  );

  React.useEffect(() => {
    warnIfActionableMetadataIsMissing("Button", id, label);
  }, [id, label]);

  const mountKey = useDeferredSemanticPrimitive(semantic);

  return (
    <Pressable
      {...pressableProps}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={accessibilityState}
      disabled={disabled}
      onPress={onPress}
      style={(state: PressableStateCallbackType) => [
        styles.button,
        disabled ? styles.buttonDisabled : undefined,
        state.pressed && !disabled ? styles.buttonPressed : undefined,
        typeof style === "function"
          ? style(state)
          : (style as StyleProp<ViewStyle> | undefined)
      ]}
      testID={resolvedTestID}
    >
      <AgentUISemanticBoundary mountKey={mountKey}>
        {typeof children === "string" || typeof children === "number" ? (
          <RNText style={[styles.buttonText, textStyle]}>{children}</RNText>
        ) : (
          children
        )}
      </AgentUISemanticBoundary>
    </Pressable>
  );
}

export function Image({
  accessibilityLabel,
  decorative = false,
  id,
  intent,
  style,
  testID,
  ...imageProps
}: AgentUIImageProps): React.ReactElement {
  const resolvedTestID = resolvePrimitiveTestID(id, testID);
  const semantic = React.useMemo(
    () =>
      createSemanticPrimitive("image", {
        accessibilityLabel,
        id,
        intent,
        testID: resolvedTestID
      }),
    [accessibilityLabel, id, intent, resolvedTestID]
  );

  React.useEffect(() => {
    warnIfInformativeGraphicLabelIsMissing("Image", decorative, accessibilityLabel);
  }, [accessibilityLabel, decorative]);

  useDeferredSemanticPrimitive(semantic);

  return (
    <RNImage
      {...imageProps}
      accessibilityLabel={decorative ? undefined : accessibilityLabel}
      accessibilityRole={decorative ? undefined : "image"}
      accessible={!decorative}
      style={style}
      testID={resolvedTestID}
    />
  );
}

export function Icon({
  accessibilityLabel,
  children,
  color,
  decorative = true,
  id,
  intent,
  name,
  size = 18,
  style,
  testID
}: AgentUIIconProps): React.ReactElement {
  const resolvedTestID = resolvePrimitiveTestID(id, testID);
  const semantic = React.useMemo(
    () =>
      createSemanticPrimitive("icon", {
        accessibilityLabel,
        fallbackLabel: decorative ? undefined : name,
        id,
        intent,
        testID: resolvedTestID
      }),
    [accessibilityLabel, decorative, id, intent, name, resolvedTestID]
  );

  React.useEffect(() => {
    warnIfInformativeGraphicLabelIsMissing(
      "Icon",
      decorative,
      accessibilityLabel
    );
  }, [accessibilityLabel, decorative]);

  const mountKey = useDeferredSemanticPrimitive(semantic);

  return (
    <RNText
      accessibilityLabel={decorative ? undefined : accessibilityLabel ?? name}
      accessibilityRole={decorative ? undefined : "image"}
      accessible={!decorative}
      style={[styles.icon, { color, fontSize: size, lineHeight: size + 4 }, style]}
      testID={resolvedTestID}
    >
      <AgentUISemanticBoundary mountKey={mountKey}>
        {children ?? name}
      </AgentUISemanticBoundary>
    </RNText>
  );
}

export function Label({
  accessibilityLabel,
  children,
  icon,
  iconChildren,
  iconStyle,
  id,
  intent,
  spacing = 8,
  style,
  testID,
  textStyle,
  ...viewProps
}: AgentUILabelProps): React.ReactElement {
  const resolvedTestID = resolvePrimitiveTestID(id, testID);
  const fallbackLabel = readableTextFromChildren(children);
  const semantic = React.useMemo(
    () =>
      createSemanticPrimitive("label", {
        accessibilityLabel,
        fallbackLabel,
        id,
        intent,
        testID: resolvedTestID
      }),
    [accessibilityLabel, fallbackLabel, id, intent, resolvedTestID]
  );

  const mountKey = useDeferredSemanticPrimitive(semantic);

  return (
    <View
      {...viewProps}
      accessibilityLabel={accessibilityLabel}
      style={[styles.label, { gap: spacing }, style]}
      testID={resolvedTestID}
    >
      <AgentUISemanticBoundary mountKey={mountKey}>
        {icon ? (
          <Icon decorative name={icon} style={iconStyle}>
            {iconChildren}
          </Icon>
        ) : null}
        {typeof children === "string" || typeof children === "number" ? (
          <RNText style={[styles.labelText, textStyle]}>{children}</RNText>
        ) : (
          children
        )}
      </AgentUISemanticBoundary>
    </View>
  );
}

function TextFieldBase({
  accessibilityLabel,
  busy,
  defaultValue,
  disabled = false,
  editable = true,
  id,
  intent,
  label,
  onChangeText,
  placeholder,
  style,
  testID,
  value,
  secure,
  ...textInputProps
}: AgentUITextFieldProps & {
  secure: boolean;
}): React.ReactElement {
  const resolvedTestID = resolvePrimitiveTestID(id, testID);
  const resolvedLabel = accessibilityLabel ?? label ?? placeholder;
  const isDisabled = disabled || !editable;
  const hasValue =
    typeof value === "string"
      ? value.length > 0
      : typeof defaultValue === "string"
        ? defaultValue.length > 0
        : undefined;
  const accessibilityState = React.useMemo(
    () => createAccessibilityState({ busy, disabled: isDisabled }),
    [busy, isDisabled]
  );
  const semanticValue = React.useMemo<AgentUISemanticPrimitive["value"]>(() => {
    return {
      ...(typeof hasValue === "boolean" ? { hasValue } : {}),
      ...(secure ? { redaction: "redacted" } : {})
    };
  }, [hasValue, secure]);
  const actionHandlers = React.useMemo<AgentUISemanticPrimitive["actionHandlers"]>(
    () =>
      onChangeText
        ? {
            clear: () => onChangeText(""),
            input: (payload) => onChangeText(readStringPayload(payload))
          }
        : undefined,
    [onChangeText]
  );
  const semantic = React.useMemo(
    () =>
      createSemanticPrimitive("textInput", {
        accessibilityLabel: resolvedLabel,
        actions: ["focus", "input", "clear", "submit"],
        actionHandlers,
        busy,
        disabled: isDisabled,
        id,
        intent,
        privacy: secure ? "redacted" : "none",
        testID: resolvedTestID,
        value: semanticValue
      }),
    [
      actionHandlers,
      busy,
      id,
      intent,
      isDisabled,
      resolvedLabel,
      resolvedTestID,
      secure,
      semanticValue
    ]
  );

  React.useEffect(() => {
    warnIfActionableMetadataIsMissing(
      secure ? "SecureField" : "TextField",
      id,
      resolvedLabel
    );
  }, [id, resolvedLabel, secure]);

  useDeferredSemanticPrimitive(semantic);

  return (
    <TextInput
      {...textInputProps}
      accessibilityLabel={resolvedLabel}
      accessibilityState={accessibilityState}
      defaultValue={defaultValue}
      editable={!isDisabled}
      onChangeText={onChangeText}
      placeholder={placeholder}
      secureTextEntry={secure}
      style={[styles.textField, isDisabled ? styles.textFieldDisabled : undefined, style]}
      testID={resolvedTestID}
      value={value}
    />
  );
}

export function TextField(props: AgentUITextFieldProps): React.ReactElement {
  return <TextFieldBase {...props} secure={false} />;
}

export function SecureField(props: AgentUISecureFieldProps): React.ReactElement {
  return <TextFieldBase {...props} secure />;
}

export function Toggle({
  accessibilityLabel,
  busy,
  disabled = false,
  id,
  intent,
  label,
  onValueChange,
  testID,
  value,
  ...switchProps
}: AgentUIToggleProps): React.ReactElement {
  const resolvedTestID = resolvePrimitiveTestID(id, testID);
  const resolvedLabel = accessibilityLabel ?? label;
  const accessibilityState = React.useMemo(
    () => createAccessibilityState({ busy, checked: value, disabled }),
    [busy, disabled, value]
  );
  const actionHandlers = React.useMemo<AgentUISemanticPrimitive["actionHandlers"]>(
    () =>
      onValueChange
        ? {
            activate: () => onValueChange(!value),
            toggle: () => onValueChange(!value)
          }
        : undefined,
    [onValueChange, value]
  );
  const semantic = React.useMemo(
    () =>
      createSemanticPrimitive("toggle", {
        accessibilityLabel: resolvedLabel,
        actions: ["toggle", "activate"],
        actionHandlers,
        busy,
        checked: value,
        disabled,
        id,
        intent,
        testID: resolvedTestID,
        value: { checked: value }
      }),
    [
      actionHandlers,
      busy,
      disabled,
      id,
      intent,
      resolvedLabel,
      resolvedTestID,
      value
    ]
  );

  React.useEffect(() => {
    warnIfActionableMetadataIsMissing("Toggle", id, resolvedLabel);
  }, [id, resolvedLabel]);

  useDeferredSemanticPrimitive(semantic);

  return (
    <RNSwitch
      {...switchProps}
      accessibilityLabel={resolvedLabel}
      accessibilityRole="switch"
      accessibilityState={accessibilityState}
      accessible
      disabled={disabled}
      onValueChange={onValueChange}
      testID={resolvedTestID}
      value={value}
    />
  );
}

export function Slider({
  accessibilityLabel,
  busy,
  disabled = false,
  fillStyle,
  id,
  intent,
  label,
  maximumValue,
  minimumValue,
  onValueChange,
  step,
  style,
  testID,
  thumbStyle,
  trackStyle,
  value,
  valueFormatter,
  ...pressableProps
}: AgentUISliderProps): React.ReactElement {
  const { maximum, minimum } = resolveRangeBounds(minimumValue, maximumValue);
  const resolvedStep = resolveRangeStep(minimum, maximum, step);
  const clampedValue = clampNumber(value, minimum, maximum);
  const resolvedTestID = resolvePrimitiveTestID(id, testID);
  const resolvedLabel = accessibilityLabel ?? label;
  const valueText = valueFormatter
    ? valueFormatter(clampedValue)
    : formatRangeValue(clampedValue);
  const range = maximum - minimum;
  const fillPercent = range > 0 ? ((clampedValue - minimum) / range) * 100 : 0;
  const fillWidth = `${clampNumber(fillPercent, 0, 100)}%` as ViewStyle["width"];
  const accessibilityState = React.useMemo(
    () => createAccessibilityState({ busy, disabled }),
    [busy, disabled]
  );
  const accessibilityValue = React.useMemo(
    () => ({
      max: maximum,
      min: minimum,
      now: clampedValue,
      text: valueText
    }),
    [clampedValue, maximum, minimum, valueText]
  );
  const semanticValue = React.useMemo<AgentUISemanticPrimitive["value"]>(
    () => ({
      max: maximum,
      min: minimum,
      now: clampedValue,
      step: resolvedStep,
      text: valueText
    }),
    [clampedValue, maximum, minimum, resolvedStep, valueText]
  );
  const setValue = React.useCallback(
    (nextValue: number) => {
      if (disabled) {
        return;
      }

      onValueChange?.(roundRangeValue(clampNumber(nextValue, minimum, maximum)));
    },
    [disabled, maximum, minimum, onValueChange]
  );
  const actionHandlers = React.useMemo<AgentUISemanticPrimitive["actionHandlers"]>(
    () =>
      onValueChange
        ? {
            decrement: () => setValue(clampedValue - resolvedStep),
            increment: () => setValue(clampedValue + resolvedStep),
            set_value: (payload) => {
              const nextValue = readNumberPayload(payload);

              if (typeof nextValue !== "number") {
                throw new Error("Slider set_value requires a numeric payload.");
              }

              setValue(nextValue);
            }
          }
        : undefined,
    [clampedValue, onValueChange, resolvedStep, setValue]
  );
  const semantic = React.useMemo(
    () =>
      createSemanticPrimitive("slider", {
        accessibilityLabel: resolvedLabel,
        actions: ["increment", "decrement", "set_value"],
        actionHandlers,
        busy,
        disabled,
        id,
        intent,
        testID: resolvedTestID,
        value: semanticValue
      }),
    [
      actionHandlers,
      busy,
      disabled,
      id,
      intent,
      resolvedLabel,
      resolvedTestID,
      semanticValue
    ]
  );
  const handleAccessibilityAction = React.useCallback<
    NonNullable<PressableProps["onAccessibilityAction"]>
  >(
    (event) => {
      if (event.nativeEvent.actionName === "increment") {
        setValue(clampedValue + resolvedStep);
      }

      if (event.nativeEvent.actionName === "decrement") {
        setValue(clampedValue - resolvedStep);
      }
    },
    [clampedValue, resolvedStep, setValue]
  );

  React.useEffect(() => {
    warnIfActionableMetadataIsMissing("Slider", id, resolvedLabel);
  }, [id, resolvedLabel]);

  useDeferredSemanticPrimitive(semantic);

  return (
    <Pressable
      {...pressableProps}
      accessibilityActions={[
        { name: "increment", label: "Increase" },
        { name: "decrement", label: "Decrease" }
      ]}
      accessibilityLabel={resolvedLabel}
      accessibilityRole="adjustable"
      accessibilityState={accessibilityState}
      accessibilityValue={accessibilityValue}
      disabled={disabled}
      onAccessibilityAction={handleAccessibilityAction}
      style={(state: PressableStateCallbackType) => [
        styles.slider,
        disabled ? styles.controlDisabled : undefined,
        state.pressed && !disabled ? styles.rangePressed : undefined,
        typeof style === "function"
          ? style(state)
          : (style as StyleProp<ViewStyle> | undefined)
      ]}
      testID={resolvedTestID}
    >
      <View style={[styles.sliderTrack, trackStyle]}>
        <View style={[styles.sliderFill, { width: fillWidth }, fillStyle]} />
        <View
          style={[
            styles.sliderThumb,
            { left: fillWidth },
            disabled ? styles.controlDisabled : undefined,
            thumbStyle
          ]}
        />
      </View>
      <RNText style={styles.controlValueText}>{valueText}</RNText>
    </Pressable>
  );
}

export function Picker({
  accessibilityLabel,
  busy,
  disabled = false,
  id,
  intent,
  label,
  onValueChange,
  optionStyle,
  optionTextStyle,
  options,
  selectedOptionStyle,
  selectedOptionTextStyle,
  selectedValue,
  spacing,
  style,
  testID,
  ...viewProps
}: AgentUIPickerProps): React.ReactElement {
  const resolvedTestID = resolvePrimitiveTestID(id, testID);
  const resolvedLabel = accessibilityLabel ?? label;
  const selectedOption = options.find((option) =>
    Object.is(option.value, selectedValue)
  );
  const accessibilityState = React.useMemo(
    () => createAccessibilityState({ busy, disabled }),
    [busy, disabled]
  );
  const semanticValue = React.useMemo<AgentUISemanticPrimitive["value"]>(() => {
    return {
      ...(selectedOption
        ? {
            selected: String(selectedOption.value),
            text: selectedOption.label
          }
        : {})
    };
  }, [selectedOption]);
  const actionHandlers = React.useMemo<AgentUISemanticPrimitive["actionHandlers"]>(
    () =>
      onValueChange
        ? {
            select: (payload) => {
              const nextValue = readPickerPayload(payload);
              const option = options.find(
                (candidate) =>
                  Object.is(candidate.value, nextValue) ||
                  candidate.id === nextValue
              );

              if (!option || option.disabled === true) {
                throw new Error("Picker select requires an enabled option payload.");
              }

              onValueChange(option.value, option);
            }
          }
        : undefined,
    [onValueChange, options]
  );
  const semantic = React.useMemo(
    () =>
      createSemanticPrimitive("picker", {
        accessibilityLabel: resolvedLabel,
        actions: ["select"],
        actionHandlers,
        busy,
        disabled,
        id,
        intent,
        selected: Boolean(selectedOption),
        testID: resolvedTestID,
        value: semanticValue
      }),
    [
      actionHandlers,
      busy,
      disabled,
      id,
      intent,
      resolvedLabel,
      resolvedTestID,
      selectedOption,
      semanticValue
    ]
  );

  React.useEffect(() => {
    warnIfActionableMetadataIsMissing("Picker", id, resolvedLabel);
    warnIfPickerOptionsAreMissing(options);
  }, [id, options, resolvedLabel]);

  useDeferredSemanticPrimitive(semantic);

  return (
    <View
      {...viewProps}
      accessibilityLabel={resolvedLabel}
      accessibilityRole="radiogroup"
      accessibilityState={accessibilityState}
      style={[
        styles.picker,
        typeof spacing === "number" ? { gap: spacing } : undefined,
        disabled ? styles.controlDisabled : undefined,
        style
      ]}
      testID={resolvedTestID}
    >
      {options.map((option) => {
        const isSelected = Object.is(option.value, selectedValue);
        const isDisabled = disabled || option.disabled === true;
        const optionTestID = resolvedTestID
          ? `${resolvedTestID}.${option.id}`
          : option.id;

        return (
          <Pressable
            accessibilityLabel={option.label}
            accessibilityRole="radio"
            accessibilityState={createAccessibilityState({
              checked: isSelected,
              disabled: isDisabled,
              selected: isSelected
            })}
            disabled={isDisabled}
            key={option.id}
            onPress={() => {
              if (!isDisabled) {
                onValueChange?.(option.value, option);
              }
            }}
            style={(state: PressableStateCallbackType) => [
              styles.pickerOption,
              isSelected ? styles.pickerOptionSelected : undefined,
              isDisabled ? styles.controlDisabled : undefined,
              state.pressed && !isDisabled ? styles.rangePressed : undefined,
              optionStyle,
              isSelected ? selectedOptionStyle : undefined
            ]}
            testID={optionTestID}
          >
            <RNText
              style={[
                styles.pickerOptionText,
                optionTextStyle,
                isSelected ? styles.pickerOptionTextSelected : undefined,
                isSelected ? selectedOptionTextStyle : undefined
              ]}
            >
              {option.label}
            </RNText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Stepper({
  accessibilityLabel,
  busy,
  buttonStyle,
  buttonTextStyle,
  controlStyle,
  decrementLabel,
  disabled = false,
  id,
  incrementLabel,
  intent,
  label,
  labelTextStyle,
  maximumValue,
  minimumValue,
  onValueChange,
  step,
  style,
  testID,
  value,
  valueFormatter,
  valueTextStyle,
  ...viewProps
}: AgentUIStepperProps): React.ReactElement {
  const { maximum, minimum } = resolveRangeBounds(minimumValue, maximumValue);
  const resolvedStep = resolveRangeStep(minimum, maximum, step);
  const clampedValue = clampNumber(value, minimum, maximum);
  const canDecrement = !disabled && clampedValue > minimum;
  const canIncrement = !disabled && clampedValue < maximum;
  const resolvedTestID = resolvePrimitiveTestID(id, testID);
  const resolvedLabel = accessibilityLabel ?? label;
  const valueText = valueFormatter
    ? valueFormatter(clampedValue)
    : formatRangeValue(clampedValue);
  const accessibilityState = React.useMemo(
    () => createAccessibilityState({ busy, disabled }),
    [busy, disabled]
  );
  const accessibilityValue = React.useMemo(
    () => ({
      max: maximum,
      min: minimum,
      now: clampedValue,
      text: valueText
    }),
    [clampedValue, maximum, minimum, valueText]
  );
  const semanticValue = React.useMemo<AgentUISemanticPrimitive["value"]>(
    () => ({
      max: maximum,
      min: minimum,
      now: clampedValue,
      step: resolvedStep,
      text: valueText
    }),
    [clampedValue, maximum, minimum, resolvedStep, valueText]
  );
  const setValue = React.useCallback(
    (nextValue: number) => {
      if (disabled) {
        return;
      }

      onValueChange?.(roundRangeValue(clampNumber(nextValue, minimum, maximum)));
    },
    [disabled, maximum, minimum, onValueChange]
  );
  const actionHandlers = React.useMemo<AgentUISemanticPrimitive["actionHandlers"]>(
    () =>
      onValueChange
        ? {
            decrement: () => setValue(clampedValue - resolvedStep),
            increment: () => setValue(clampedValue + resolvedStep),
            set_value: (payload) => {
              const nextValue = readNumberPayload(payload);

              if (typeof nextValue !== "number") {
                throw new Error("Stepper set_value requires a numeric payload.");
              }

              setValue(nextValue);
            }
          }
        : undefined,
    [clampedValue, onValueChange, resolvedStep, setValue]
  );
  const semantic = React.useMemo(
    () =>
      createSemanticPrimitive("stepper", {
        accessibilityLabel: resolvedLabel,
        actions: ["increment", "decrement", "set_value"],
        actionHandlers,
        busy,
        disabled,
        id,
        intent,
        testID: resolvedTestID,
        value: semanticValue
      }),
    [
      actionHandlers,
      busy,
      disabled,
      id,
      intent,
      resolvedLabel,
      resolvedTestID,
      semanticValue
    ]
  );
  const handleAccessibilityAction = React.useCallback<
    NonNullable<ViewProps["onAccessibilityAction"]>
  >(
    (event) => {
      if (event.nativeEvent.actionName === "increment") {
        setValue(clampedValue + resolvedStep);
      }

      if (event.nativeEvent.actionName === "decrement") {
        setValue(clampedValue - resolvedStep);
      }
    },
    [clampedValue, resolvedStep, setValue]
  );

  React.useEffect(() => {
    warnIfActionableMetadataIsMissing("Stepper", id, resolvedLabel);
  }, [id, resolvedLabel]);

  useDeferredSemanticPrimitive(semantic);

  return (
    <View
      {...viewProps}
      accessibilityActions={[
        { name: "increment", label: incrementLabel ?? "Increase" },
        { name: "decrement", label: decrementLabel ?? "Decrease" }
      ]}
      accessibilityLabel={resolvedLabel}
      accessibilityRole="adjustable"
      accessibilityState={accessibilityState}
      accessibilityValue={accessibilityValue}
      accessible
      onAccessibilityAction={handleAccessibilityAction}
      style={[styles.stepper, disabled ? styles.controlDisabled : undefined, style]}
      testID={resolvedTestID}
    >
      {label ? (
        <RNText style={[styles.stepperLabel, labelTextStyle]}>{label}</RNText>
      ) : null}
      <View style={[styles.stepperControls, controlStyle]}>
        <Pressable
          accessible={false}
          disabled={!canDecrement}
          onPress={() => setValue(clampedValue - resolvedStep)}
          style={[
            styles.stepperButton,
            !canDecrement ? styles.controlDisabled : undefined,
            buttonStyle
          ]}
          testID={resolvedTestID ? `${resolvedTestID}.decrement` : undefined}
        >
          <RNText style={[styles.stepperButtonText, buttonTextStyle]}>-</RNText>
        </Pressable>
        <RNText style={[styles.stepperValueText, valueTextStyle]}>{valueText}</RNText>
        <Pressable
          accessible={false}
          disabled={!canIncrement}
          onPress={() => setValue(clampedValue + resolvedStep)}
          style={[
            styles.stepperButton,
            !canIncrement ? styles.controlDisabled : undefined,
            buttonStyle
          ]}
          testID={resolvedTestID ? `${resolvedTestID}.increment` : undefined}
        >
          <RNText style={[styles.stepperButtonText, buttonTextStyle]}>+</RNText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: "#0A7AFF",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  buttonDisabled: {
    opacity: 0.45
  },
  buttonPressed: {
    opacity: 0.78
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600"
  },
  controlDisabled: {
    opacity: 0.45
  },
  controlValueText: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
    textAlign: "right"
  },
  fill: {
    flex: 1
  },
  screen: {
    flex: 1
  },
  icon: {
    color: "#111111",
    fontWeight: "600",
    textAlign: "center"
  },
  label: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 24
  },
  labelText: {
    color: "#111111",
    fontSize: 16,
    lineHeight: 22
  },
  list: {
    gap: 12
  },
  picker: {
    gap: 8
  },
  pickerOption: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D1D5DB",
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  pickerOptionSelected: {
    borderColor: "#0A7AFF",
    borderWidth: 2
  },
  pickerOptionText: {
    color: "#111111",
    fontSize: 16,
    lineHeight: 22
  },
  pickerOptionTextSelected: {
    color: "#0A7AFF",
    fontWeight: "600"
  },
  rangePressed: {
    opacity: 0.78
  },
  spacer: {
    flexBasis: 0,
    flexGrow: 1,
    flexShrink: 1
  },
  form: {
    gap: 12
  },
  section: {
    gap: 8
  },
  sectionBody: {
    gap: 10
  },
  sectionFooter: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 18
  },
  sectionTitle: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
    textTransform: "uppercase"
  },
  stack: {
    minWidth: 0
  },
  slider: {
    minHeight: 44,
    justifyContent: "center"
  },
  sliderFill: {
    backgroundColor: "#0A7AFF",
    borderRadius: 999,
    bottom: 0,
    left: 0,
    position: "absolute",
    top: 0
  },
  sliderThumb: {
    backgroundColor: "#FFFFFF",
    borderColor: "#0A7AFF",
    borderRadius: 10,
    borderWidth: 2,
    height: 20,
    marginLeft: -10,
    marginTop: -8,
    position: "absolute",
    top: "50%",
    width: 20
  },
  sliderTrack: {
    backgroundColor: "#D1D5DB",
    borderRadius: 999,
    height: 4,
    overflow: "visible",
    position: "relative"
  },
  stepper: {
    gap: 8,
    minHeight: 44
  },
  stepperButton: {
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    borderColor: "#C7D2FE",
    borderRadius: 8,
    borderWidth: 1,
    height: 36,
    justifyContent: "center",
    width: 44
  },
  stepperButtonText: {
    color: "#111111",
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 24
  },
  stepperControls: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10
  },
  stepperLabel: {
    color: "#111111",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22
  },
  stepperValueText: {
    color: "#111111",
    fontSize: 16,
    lineHeight: 22,
    minWidth: 44,
    textAlign: "center"
  },
  text: {
    color: "#111111",
    fontSize: 16,
    lineHeight: 22
  },
  textField: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D1D5DB",
    borderRadius: 8,
    borderWidth: 1,
    color: "#111111",
    fontSize: 16,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  textFieldDisabled: {
    opacity: 0.45
  },
  zStack: {
    position: "relative"
  }
});

const textVariantStyles = StyleSheet.create({
  body: {},
  caption: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 18
  },
  headline: {
    fontSize: 17,
    fontWeight: "600",
    lineHeight: 23
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 34
  }
});
