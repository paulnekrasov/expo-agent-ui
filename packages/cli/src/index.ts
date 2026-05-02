export type AgentUICommand = "init" | "dev" | "doctor" | "export-maestro" | "maestro-run" | "maestro-heal";

export interface AgentUICliManifest {
  packageName: "@agent-ui/cli";
  stage: "flow-runner";
  implementedCommands: AgentUICommand[];
  deferredCommands: AgentUICommand[];
}

export function getAgentUICliManifest(): AgentUICliManifest {
  return {
    packageName: "@agent-ui/cli",
    stage: "flow-runner",
    implementedCommands: ["export-maestro", "maestro-run", "maestro-heal"],
    deferredCommands: ["init", "dev", "doctor"]
  };
}

export { generateMaestroYaml, exportFlowToMastero } from "./commands/export-maestro";
export type { FlowJson, FlowStep, Condition } from "./commands/export-maestro";
export { runMaestroFlow } from "./commands/maestro-run";
export { generateHealProposals } from "./commands/maestro-heal";
export type { HealProposal, HealResult } from "./commands/maestro-heal";
