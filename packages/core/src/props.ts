import type { ViewProps } from "react-native";

export interface AgentUIPrimitiveProps {
  /**
   * Stable semantic identifier. Defaults to the React Native testID for
   * deterministic test and agent targeting.
   */
  id?: string;
  /**
   * Stable business intent for high-value actions. Agents should not infer
   * business meaning from localized labels alone.
   */
  intent?: string;
  /**
   * User-facing accessible name. This must stay localizable and human-readable.
   */
  accessibilityLabel?: string;
  /**
   * Optional React Native escape hatch. When omitted, Agent UI maps id -> testID.
   */
  testID?: string;
}

export interface AgentUIActionablePrimitiveProps
  extends AgentUIPrimitiveProps {
  id: string;
  disabled?: boolean;
  busy?: boolean;
}

export type AgentUIViewProps = Omit<
  ViewProps,
  "accessibilityLabel" | "testID"
> &
  AgentUIPrimitiveProps;

export function resolvePrimitiveTestID(
  id: string | undefined,
  testID: string | undefined
): string | undefined {
  return testID ?? id;
}

export function isDevelopmentRuntime(): boolean {
  const runtimeFlag = (globalThis as { __DEV__?: boolean }).__DEV__;

  return runtimeFlag === true;
}

export function warnInDevelopment(message: string): void {
  if (isDevelopmentRuntime()) {
    console.warn(message);
  }
}
