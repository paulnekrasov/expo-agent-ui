export type AgentUICommand = "init" | "dev" | "doctor" | "export-maestro" | "maestro-run" | "maestro-heal";

export interface AgentUICliManifest {
  packageName: "@expo-agent-ui/cli";
  version: string;
  stage: "flow-runner";
  implementedCommands: AgentUICommand[];
  deferredCommands: AgentUICommand[];
}

import { readFileSync } from "node:fs";
import { resolve as pathResolve } from "node:path";

function readCliManifestVersion(): string {
  try {
    const pkg = JSON.parse(
      readFileSync(pathResolve(__dirname, "..", "package.json"), "utf8")
    ) as { version?: string };
    return pkg.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

export function getAgentUICliManifest(): AgentUICliManifest {
  return {
    packageName: "@expo-agent-ui/cli",
    version: readCliManifestVersion(),
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
