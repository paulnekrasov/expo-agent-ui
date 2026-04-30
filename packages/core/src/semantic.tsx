import * as React from "react";

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
  | "form";

export type AgentUIPrimitiveAction =
  | "activate"
  | "tap"
  | "observe"
  | "input"
  | "focus"
  | "clear"
  | "submit"
  | "scroll";

export type AgentUIPrimitivePrivacy = "none" | "redacted";

export interface AgentUISemanticPrimitiveValue {
  hasValue?: boolean;
  redaction?: AgentUIPrimitivePrivacy;
}

export interface AgentUISemanticPrimitive {
  role: AgentUIPrimitiveRole;
  id?: string;
  intent?: string;
  label?: string;
  testID?: string;
  disabled?: boolean;
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
  const value = React.useMemo<AgentUIContextValue>(() => ({ runtime }), [runtime]);

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
    return runtime.registerPrimitive(primitive);
  }, [primitive, runtime]);
}
