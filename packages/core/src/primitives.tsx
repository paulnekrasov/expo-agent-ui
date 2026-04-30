import * as React from "react";
import {
  Image as RNImage,
  Pressable,
  ScrollView,
  StyleSheet,
  Text as RNText,
  TextInput,
  View
} from "react-native";
import type {
  ImageProps as RNImageProps,
  ImageStyle,
  PressableProps,
  PressableStateCallbackType,
  ScrollViewProps,
  StyleProp,
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
import { useDeferredSemanticPrimitive } from "./semantic";

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
  disabled?: boolean | undefined;
  fallbackLabel?: string | undefined;
  id?: string | undefined;
  intent?: string | undefined;
  privacy?: AgentUISemanticPrimitive["privacy"] | undefined;
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
    ...(props.accessibilityLabel
      ? { label: props.accessibilityLabel }
      : props.fallbackLabel
        ? { label: props.fallbackLabel }
        : {}),
    ...(props.testID ? { testID: props.testID } : {}),
    ...(typeof props.disabled === "boolean"
      ? { disabled: props.disabled }
      : {}),
    ...(props.actions ? { actions: props.actions } : {}),
    ...(props.privacy ? { privacy: props.privacy } : {}),
    ...(props.value ? { value: props.value } : {})
  };
}

function createAccessibilityState(options: {
  busy?: boolean | undefined;
  disabled?: boolean | undefined;
}): AccessibilityState | undefined {
  const state: AccessibilityState = {};

  if (typeof options.disabled === "boolean") {
    state.disabled = options.disabled;
  }

  if (typeof options.busy === "boolean") {
    state.busy = options.busy;
  }

  return Object.keys(state).length > 0 ? state : undefined;
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
  const semantic = React.useMemo(
    () =>
      createSemanticPrimitive("screen", {
        accessibilityLabel: label,
        id,
        intent,
        testID: resolvedTestID
      }),
    [id, intent, label, resolvedTestID]
  );

  useDeferredSemanticPrimitive(semantic);

  return (
    <View
      {...viewProps}
      accessibilityLabel={label}
      style={[styles.screen, style]}
      testID={resolvedTestID}
    >
      {children}
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

  useDeferredSemanticPrimitive(semantic);

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
      {children}
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

  useDeferredSemanticPrimitive(semantic);

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
      {children}
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

  useDeferredSemanticPrimitive(semantic);

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
      {children}
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

  useDeferredSemanticPrimitive(semantic);

  return (
    <View
      {...viewProps}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="list"
      style={[styles.list, typeof spacing === "number" ? { gap: spacing } : undefined, style]}
      testID={resolvedTestID}
    >
      {children}
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

  useDeferredSemanticPrimitive(semantic);

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
      {renderedHeader}
      <View style={styles.sectionBody}>{children}</View>
      {renderedFooter}
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

  useDeferredSemanticPrimitive(semantic);

  return (
    <View
      {...viewProps}
      accessibilityLabel={accessibilityLabel}
      style={[styles.form, typeof spacing === "number" ? { gap: spacing } : undefined, style]}
      testID={resolvedTestID}
    >
      {children}
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

  useDeferredSemanticPrimitive(semantic);

  return (
    <RNText
      {...textProps}
      accessibilityLabel={accessibilityLabel}
      style={[styles.text, textVariantStyles[variant], style]}
      testID={resolvedTestID}
    >
      {children}
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
  const semantic = React.useMemo(
    () =>
      createSemanticPrimitive("button", {
        accessibilityLabel,
        actions: ["activate", "tap"],
        disabled,
        fallbackLabel,
        id,
        intent,
        testID: resolvedTestID
      }),
    [accessibilityLabel, disabled, fallbackLabel, id, intent, resolvedTestID]
  );

  React.useEffect(() => {
    warnIfActionableMetadataIsMissing("Button", id, label);
  }, [id, label]);

  useDeferredSemanticPrimitive(semantic);

  return (
    <Pressable
      {...pressableProps}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={accessibilityState}
      disabled={disabled}
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
      {typeof children === "string" || typeof children === "number" ? (
        <RNText style={[styles.buttonText, textStyle]}>{children}</RNText>
      ) : (
        children
      )}
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

  useDeferredSemanticPrimitive(semantic);

  return (
    <RNText
      accessibilityLabel={decorative ? undefined : accessibilityLabel ?? name}
      accessibilityRole={decorative ? undefined : "image"}
      accessible={!decorative}
      style={[styles.icon, { color, fontSize: size, lineHeight: size + 4 }, style]}
      testID={resolvedTestID}
    >
      {children ?? name}
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

  useDeferredSemanticPrimitive(semantic);

  return (
    <View
      {...viewProps}
      accessibilityLabel={accessibilityLabel}
      style={[styles.label, { gap: spacing }, style]}
      testID={resolvedTestID}
    >
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
  const semantic = React.useMemo(
    () =>
      createSemanticPrimitive("textInput", {
        accessibilityLabel: resolvedLabel,
        actions: ["focus", "input", "clear", "submit"],
        disabled: isDisabled,
        id,
        intent,
        privacy: secure ? "redacted" : "none",
        testID: resolvedTestID,
        value: semanticValue
      }),
    [id, intent, isDisabled, resolvedLabel, resolvedTestID, secure, semanticValue]
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
