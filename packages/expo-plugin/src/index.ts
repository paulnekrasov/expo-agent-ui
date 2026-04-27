export interface AgentUIExpoPluginProps {
  enabled?: boolean;
}

export type ExpoConfigLike = Record<string, unknown>;

export function withAgentUI(
  config: ExpoConfigLike,
  _props: AgentUIExpoPluginProps = {}
): ExpoConfigLike {
  return config;
}

export default withAgentUI;
