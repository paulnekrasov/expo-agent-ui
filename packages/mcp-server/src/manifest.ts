export interface AgentUIMcpManifest {
  packageName: "@expo-agent-ui/mcp-server";
  transport: "stdio";
  implementedTools: string[];
  deferredTools: string[];
  implementedSkillTools: string[];
  deferredSkillTools: string[];
}

export function getAgentUIMcpManifest(): AgentUIMcpManifest {
  return {
    packageName: "@expo-agent-ui/mcp-server",
    transport: "stdio",
    implementedTools: ["inspectTree", "getState", "tap", "input", "observeEvents", "waitFor", "scroll", "navigate", "runFlow", "proposePatch", "compareNativePreviews"],
    deferredTools: [],
    implementedSkillTools: ["listPlatformSkills", "getPlatformSkill", "searchPlatformSkills", "recommendPlatformSkills"],
    deferredSkillTools: []
  };
}
