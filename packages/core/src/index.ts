export const agentUICorePackage = "@agent-ui/core" as const;
export const agentUICoreStage = "package-foundation" as const;

export type AgentUICapability =
  | "component-primitives"
  | "semantic-runtime"
  | "agent-bridge"
  | "motion-layer";

export interface AgentUIPackageManifest {
  packageName: typeof agentUICorePackage;
  stage: typeof agentUICoreStage;
  jsOnly: true;
  implementedCapabilities: AgentUICapability[];
  deferredCapabilities: AgentUICapability[];
}

export function getAgentUIPackageManifest(): AgentUIPackageManifest {
  return {
    packageName: agentUICorePackage,
    stage: agentUICoreStage,
    jsOnly: true,
    implementedCapabilities: [],
    deferredCapabilities: [
      "component-primitives",
      "semantic-runtime",
      "agent-bridge",
      "motion-layer"
    ]
  };
}
