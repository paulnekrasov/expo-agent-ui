import * as React from "react";

import { isDevelopmentRuntime } from "./props";

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
  id?: string;
  intent?: string;
  label?: string;
  testID?: string;
  checked?: boolean;
  disabled?: boolean;
  selected?: boolean;
  actions?: AgentUIPrimitiveAction[];
  privacy?: AgentUIPrimitivePrivacy;
  value?: AgentUISemanticPrimitiveValue;
}

export type AgentUISemanticUnregister = () => void;

export interface AgentUISemanticRuntime {
  registerPrimitive(
    primitive: AgentUISemanticPrimitive
  ): AgentUISemanticUnregister;
}

export interface AgentUIContextValue {
  runtime: AgentUISemanticRuntime;
}

export interface AgentUIProviderProps {
  children: React.ReactNode;
  runtime?: AgentUISemanticRuntime;
}

const noopRuntime: AgentUISemanticRuntime = {
  registerPrimitive: () => {
    return () => undefined;
  }
};

const AgentUIContext = React.createContext<AgentUIContextValue>({
  runtime: noopRuntime
});

export function AgentUIProvider({
  children,
  runtime = noopRuntime
}: AgentUIProviderProps): React.ReactElement {
  const activeRuntime = isDevelopmentRuntime() ? runtime : noopRuntime;
  const value = React.useMemo<AgentUIContextValue>(
    () => ({ runtime: activeRuntime }),
    [activeRuntime]
  );

  return (
    <AgentUIContext.Provider value={value}>{children}</AgentUIContext.Provider>
  );
}

export function useAgentUIRuntime(): AgentUISemanticRuntime {
  return React.useContext(AgentUIContext).runtime;
}

export function useDeferredSemanticPrimitive(
  primitive: AgentUISemanticPrimitive
): void {
  const runtime = useAgentUIRuntime();

  React.useEffect(() => {
    if (!isDevelopmentRuntime()) {
      return undefined;
    }

    return runtime.registerPrimitive(primitive);
  }, [primitive, runtime]);
}
