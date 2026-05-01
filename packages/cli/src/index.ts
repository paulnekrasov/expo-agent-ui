export type AgentUICommand = "init" | "dev" | "doctor";

export interface AgentUICliManifest {
  packageName: "@agent-ui/cli";
  stage: "mcp-server";
  implementedCommands: AgentUICommand[];
  deferredCommands: AgentUICommand[];
}

export function getAgentUICliManifest(): AgentUICliManifest {
  return {
    packageName: "@agent-ui/cli",
    stage: "mcp-server",
    implementedCommands: [],
    deferredCommands: ["init", "dev", "doctor"]
  };
}
