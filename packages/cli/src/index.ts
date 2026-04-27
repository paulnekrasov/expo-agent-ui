export type AgentUICommand = "init" | "dev" | "doctor";

export interface AgentUICliManifest {
  packageName: "@agent-ui/cli";
  stage: "package-foundation";
  implementedCommands: AgentUICommand[];
  deferredCommands: AgentUICommand[];
}

export function getAgentUICliManifest(): AgentUICliManifest {
  return {
    packageName: "@agent-ui/cli",
    stage: "package-foundation",
    implementedCommands: [],
    deferredCommands: ["init", "dev", "doctor"]
  };
}
