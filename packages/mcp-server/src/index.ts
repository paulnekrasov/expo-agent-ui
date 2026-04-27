export interface AgentUIMcpManifest {
  packageName: "@agent-ui/mcp-server";
  transport: "stdio";
  implementedTools: string[];
  deferredTools: string[];
}

export function getAgentUIMcpManifest(): AgentUIMcpManifest {
  return {
    packageName: "@agent-ui/mcp-server",
    transport: "stdio",
    implementedTools: [],
    deferredTools: [
      "inspectTree",
      "getState",
      "tap",
      "input",
      "scroll",
      "navigate",
      "runFlow",
      "observeEvents"
    ]
  };
}
