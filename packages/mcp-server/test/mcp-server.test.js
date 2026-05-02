const { InMemoryTransport } = require("@modelcontextprotocol/sdk/inMemory.js");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const {
  createAgentUIMcpListener,
  createAgentUIMcpServer
} = require("../dist/index");

const TEST_TOKEN = "agentui_test_token_32bytes_min";

let counter = 0;

function uniquePort() {
  return 18800 + ++counter;
}

describe("Agent UI MCP server", () => {
  it("standalone CLI help prints usage without importing React Native", () => {
    const cliPath = path.resolve(__dirname, "../dist/cli.js");
    const result = spawnSync(process.execPath, [cliPath, "--help"], {
      encoding: "utf8"
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("agent-ui-mcp");
    expect(result.stderr).toBe("");
  });

  it("registers inspectTree and getState tools", async () => {
    const port = uniquePort();
    const listener = createAgentUIMcpListener({
      port,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const server = createAgentUIMcpServer(listener, serverTransport);

    clientTransport.send({
      jsonrpc: "2.0",
      id: "1",
      method: "tools/list",
      params: {}
    });

    const response = await new Promise((resolve) => {
      clientTransport.onmessage = resolve;
    });

    expect(response).toBeDefined();
    expect(response.result).toBeDefined();

    const tools = response.result.tools;

    expect(Array.isArray(tools)).toBe(true);
    expect(tools.length).toBe(15);

    const names = tools.map((t) => t.name).sort();

    expect(names).toEqual([
      "compareNativePreviews",
      "getPlatformSkill",
      "getState",
      "input",
      "inspectTree",
      "listPlatformSkills",
      "navigate",
      "observeEvents",
      "proposePatch",
      "recommendPlatformSkills",
      "runFlow",
      "scroll",
      "searchPlatformSkills",
      "tap",
      "waitFor"
    ]);

    expect(tools[0]).toMatchObject({
      inputSchema: expect.any(Object),
      description: expect.any(String)
    });

    expect(tools[1]).toMatchObject({
      inputSchema: expect.any(Object),
      description: expect.any(String)
    });

    await server.close();
    await listener.close();
  });

  it("inspectTree returns SESSION_NOT_CONNECTED when no app session", async () => {
    const port = uniquePort();
    const listener = createAgentUIMcpListener({
      port,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const server = createAgentUIMcpServer(listener, serverTransport);

    clientTransport.send({
      jsonrpc: "2.0",
      id: "2",
      method: "tools/call",
      params: {
        name: "inspectTree",
        arguments: {}
      }
    });

    const response = await new Promise((resolve) => {
      clientTransport.onmessage = resolve;
    });

    expect(response.result).toBeDefined();
    expect(response.result.isError).toBe(true);

    const parsed = JSON.parse(response.result.content[0].text);

    expect(parsed).toMatchObject({
      ok: false,
      code: "SESSION_NOT_CONNECTED"
    });

    await server.close();
    await listener.close();
  });

  it("getState returns SESSION_NOT_CONNECTED when no app session", async () => {
    const port = uniquePort();
    const listener = createAgentUIMcpListener({
      port,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const server = createAgentUIMcpServer(listener, serverTransport);

    clientTransport.send({
      jsonrpc: "2.0",
      id: "3",
      method: "tools/call",
      params: {
        name: "getState",
        arguments: {
          id: "test.node"
        }
      }
    });

    const response = await new Promise((resolve) => {
      clientTransport.onmessage = resolve;
    });

    expect(response.result).toBeDefined();
    expect(response.result.isError).toBe(true);

    const parsed = JSON.parse(response.result.content[0].text);

    expect(parsed).toMatchObject({
      ok: false,
      code: "SESSION_NOT_CONNECTED"
    });

    await server.close();
    await listener.close();
  });

  it("tap returns SESSION_NOT_CONNECTED when no app session", async () => {
    const port = uniquePort();
    const listener = createAgentUIMcpListener({
      port,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const server = createAgentUIMcpServer(listener, serverTransport);

    clientTransport.send({
      jsonrpc: "2.0",
      id: "4",
      method: "tools/call",
      params: {
        name: "tap",
        arguments: {
          id: "test.button"
        }
      }
    });

    const response = await new Promise((resolve) => {
      clientTransport.onmessage = resolve;
    });

    expect(response.result).toBeDefined();
    expect(response.result.isError).toBe(true);

    const parsed = JSON.parse(response.result.content[0].text);

    expect(parsed).toMatchObject({
      ok: false,
      code: "SESSION_NOT_CONNECTED"
    });

    await server.close();
    await listener.close();
  });

  it("input returns SESSION_NOT_CONNECTED when no app session", async () => {
    const port = uniquePort();
    const listener = createAgentUIMcpListener({
      port,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const server = createAgentUIMcpServer(listener, serverTransport);

    clientTransport.send({
      jsonrpc: "2.0",
      id: "5",
      method: "tools/call",
      params: {
        name: "input",
        arguments: {
          id: "test.field",
          value: "hello"
        }
      }
    });

    const response = await new Promise((resolve) => {
      clientTransport.onmessage = resolve;
    });

    expect(response.result).toBeDefined();
    expect(response.result.isError).toBe(true);

    const parsed = JSON.parse(response.result.content[0].text);

    expect(parsed).toMatchObject({
      ok: false,
      code: "SESSION_NOT_CONNECTED"
    });

    await server.close();
    await listener.close();
  });

  it("observeEvents returns SESSION_NOT_CONNECTED when no app session", async () => {
    const port = uniquePort();
    const listener = createAgentUIMcpListener({
      port,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const server = createAgentUIMcpServer(listener, serverTransport);

    clientTransport.send({
      jsonrpc: "2.0",
      id: "6",
      method: "tools/call",
      params: {
        name: "observeEvents",
        arguments: {}
      }
    });

    const response = await new Promise((resolve) => {
      clientTransport.onmessage = resolve;
    });

    expect(response.result).toBeDefined();
    expect(response.result.isError).toBe(true);

    const parsed = JSON.parse(response.result.content[0].text);

    expect(parsed).toMatchObject({
      ok: false,
      code: "SESSION_NOT_CONNECTED"
    });

    await server.close();
    await listener.close();
  });

  it("waitFor returns SESSION_NOT_CONNECTED when no app session", async () => {
    const port = uniquePort();
    const listener = createAgentUIMcpListener({
      port,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const server = createAgentUIMcpServer(listener, serverTransport);

    clientTransport.send({
      jsonrpc: "2.0",
      id: "7",
      method: "tools/call",
      params: {
        name: "waitFor",
        arguments: {
          conditions: [
            { kind: "nodeExists", nodeId: "test.button" }
          ]
        }
      }
    });

    const response = await new Promise((resolve) => {
      clientTransport.onmessage = resolve;
    });

    expect(response.result).toBeDefined();
    expect(response.result.isError).toBe(true);

    const parsed = JSON.parse(response.result.content[0].text);

    expect(parsed).toMatchObject({
      ok: false,
      code: "SESSION_NOT_CONNECTED"
    });

    await server.close();
    await listener.close();
  });

  it("all tool calls require an active session (fail-closed by default)", async () => {
    const port = uniquePort();
    const listener = createAgentUIMcpListener({
      port,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const server = createAgentUIMcpServer(listener, serverTransport);

    // Missing id argument — still returns SESSION_NOT_CONNECTED first
    clientTransport.send({
      jsonrpc: "2.0",
      id: "10",
      method: "tools/call",
      params: {
        name: "getState",
        arguments: {}
      }
    });

    const missingIdResponse = await new Promise((r) => {
      clientTransport.onmessage = r;
    });

    expect(missingIdResponse.result.isError).toBe(true);

    const missingParsed = JSON.parse(
      missingIdResponse.result.content[0].text
    );

    expect(missingParsed.code).toBe("SESSION_NOT_CONNECTED");

    // Unknown tool name — still returns SESSION_NOT_CONNECTED first
    clientTransport.send({
      jsonrpc: "2.0",
      id: "11",
      method: "tools/call",
      params: {
        name: "nonexistentTool",
        arguments: {}
      }
    });

    const unknownResponse = await new Promise((r) => {
      clientTransport.onmessage = r;
    });

    expect(unknownResponse.result.isError).toBe(true);

    const unknownParsed = JSON.parse(
      unknownResponse.result.content[0].text
    );

    expect(unknownParsed.code).toBe("SESSION_NOT_CONNECTED");

    await server.close();
    await listener.close();
  });

  it("listPlatformSkills returns skill entries without a session", async () => {
    const port = uniquePort();
    const listener = createAgentUIMcpListener({
      port,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const server = createAgentUIMcpServer(listener, serverTransport);

    clientTransport.send({
      jsonrpc: "2.0",
      id: "12",
      method: "tools/call",
      params: {
        name: "listPlatformSkills",
        arguments: {}
      }
    });

    const response = await new Promise((resolve) => {
      clientTransport.onmessage = resolve;
    });

    expect(response.result).toBeDefined();
    expect(response.result.isError).toBeUndefined();

    const parsed = JSON.parse(response.result.content[0].text);

    expect(parsed.ok).toBe(true);
    expect(Array.isArray(parsed.skills)).toBe(true);
    expect(parsed.skills.length).toBeGreaterThanOrEqual(1);

    const systemDebug = parsed.skills.find((s) => s.name === "systematic-debugging");

    expect(systemDebug).toBeDefined();
    expect(systemDebug.description).toBeDefined();
    expect(systemDebug.resourceUri).toBe("agent-ui://platform-skills/systematic-debugging");

    await server.close();
    await listener.close();
  });

  it("getPlatformSkill returns SKILL.md content for a valid skill name", async () => {
    const port = uniquePort();
    const listener = createAgentUIMcpListener({
      port,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const server = createAgentUIMcpServer(listener, serverTransport);

    clientTransport.send({
      jsonrpc: "2.0",
      id: "13",
      method: "tools/call",
      params: {
        name: "getPlatformSkill",
        arguments: {
          name: "systematic-debugging"
        }
      }
    });

    const response = await new Promise((resolve) => {
      clientTransport.onmessage = resolve;
    });

    expect(response.result).toBeDefined();
    expect(response.result.isError).toBeUndefined();

    const content = response.result.content[0].text;

    expect(content).toContain("Systematic Debugging");
    expect(content).toContain("TTD");
    expect(content).toContain("red-green");

    await server.close();
    await listener.close();
  });

  it("getPlatformSkill returns SKILL_NOT_FOUND for unknown skill", async () => {
    const port = uniquePort();
    const listener = createAgentUIMcpListener({
      port,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const server = createAgentUIMcpServer(listener, serverTransport);

    clientTransport.send({
      jsonrpc: "2.0",
      id: "14",
      method: "tools/call",
      params: {
        name: "getPlatformSkill",
        arguments: {
          name: "nonexistent-skill"
        }
      }
    });

    const response = await new Promise((resolve) => {
      clientTransport.onmessage = resolve;
    });

    expect(response.result).toBeDefined();
    expect(response.result.isError).toBe(true);

    const parsed = JSON.parse(response.result.content[0].text);

    expect(parsed).toMatchObject({
      ok: false,
      code: "SKILL_NOT_FOUND"
    });

    await server.close();
    await listener.close();
  });

  it("getPlatformSkill returns INVALID_ARGUMENT when name is missing", async () => {
    const port = uniquePort();
    const listener = createAgentUIMcpListener({
      port,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const server = createAgentUIMcpServer(listener, serverTransport);

    clientTransport.send({
      jsonrpc: "2.0",
      id: "15",
      method: "tools/call",
      params: {
        name: "getPlatformSkill",
        arguments: {}
      }
    });

    const response = await new Promise((resolve) => {
      clientTransport.onmessage = resolve;
    });

    expect(response.result).toBeDefined();
    expect(response.result.isError).toBe(true);

    const parsed = JSON.parse(response.result.content[0].text);

    expect(parsed).toMatchObject({
      ok: false,
      code: "INVALID_ARGUMENT"
    });

    await server.close();
    await listener.close();
  });

  it("server can be created and closed cleanly", async () => {
    const port = uniquePort();
    const listener = createAgentUIMcpListener({
      port,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const server = createAgentUIMcpServer(listener, serverTransport);

    expect(server).toBeDefined();

    await server.close();
    await listener.close();

    // closing again should not throw
    await server.close().catch(() => {});
    await listener.close().catch(() => {});
  });

  it("lists all 6 MCP prompts", async () => {
    const port = uniquePort();
    const listener = createAgentUIMcpListener({
      port,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const server = createAgentUIMcpServer(listener, serverTransport);

    clientTransport.send({
      jsonrpc: "2.0",
      id: "16",
      method: "prompts/list",
      params: {}
    });

    const response = await new Promise((resolve) => {
      clientTransport.onmessage = resolve;
    });

    expect(response.result).toBeDefined();
    expect(Array.isArray(response.result.prompts)).toBe(true);
    expect(response.result.prompts.length).toBe(6);

    const names = response.result.prompts.map((p) => p.name).sort();

    expect(names).toEqual([
      "choose_platform_skills",
      "debug_stage_failure",
      "plan_native_scaffold",
      "prepare_visual_editor_notes",
      "review_accessibility_semantics",
      "write_agent_task_notes"
    ]);

    for (const prompt of response.result.prompts) {
      expect(prompt.description).toBeDefined();
      expect(prompt.name).toBeDefined();
    }

    await server.close();
    await listener.close();
  });

  it("getPrompt choose_platform_skills returns skill recommendations", async () => {
    const port = uniquePort();
    const listener = createAgentUIMcpListener({
      port,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const server = createAgentUIMcpServer(listener, serverTransport);

    clientTransport.send({
      jsonrpc: "2.0",
      id: "17",
      method: "prompts/get",
      params: {
        name: "choose_platform_skills",
        arguments: { task: "debug a react native animation bug" }
      }
    });

    const response = await new Promise((resolve) => {
      clientTransport.onmessage = resolve;
    });

    expect(response.result).toBeDefined();
    expect(response.result.messages).toBeDefined();
    expect(response.result.messages.length).toBeGreaterThan(0);
    expect(response.result.messages[0].role).toBe("user");
    expect(response.result.messages[0].content.type).toBe("text");
    expect(response.result.messages[0].content.text).toContain("Choose Platform Skills");
    expect(response.result.messages[0].content.text).toContain("debug");

    await server.close();
    await listener.close();
  });

  it("getPrompt debug_stage_failure returns investigation plan template", async () => {
    const port = uniquePort();
    const listener = createAgentUIMcpListener({
      port,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const server = createAgentUIMcpServer(listener, serverTransport);

    clientTransport.send({
      jsonrpc: "2.0",
      id: "18",
      method: "prompts/get",
      params: {
        name: "debug_stage_failure",
        arguments: {
          stage: "5",
          commandOrSymptom: "mcp-server tests timing out"
        }
      }
    });

    const response = await new Promise((resolve) => {
      clientTransport.onmessage = resolve;
    });

    expect(response.result.messages[0].content.text).toContain("Debug Stage Failure");
    expect(response.result.messages[0].content.text).toContain("Stage: 5");
    expect(response.result.messages[0].content.text).toContain("timing out");
    expect(response.result.messages[0].content.text).toContain("systematic-debugging");

    await server.close();
    await listener.close();
  });

  it("getPrompt plan_native_scaffold returns scaffold plan template", async () => {
    const port = uniquePort();
    const listener = createAgentUIMcpListener({
      port,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const server = createAgentUIMcpServer(listener, serverTransport);

    clientTransport.send({
      jsonrpc: "2.0",
      id: "19",
      method: "prompts/get",
      params: {
        name: "plan_native_scaffold",
        arguments: {
          scaffoldIntent: "new settings screen",
          platform: "ios"
        }
      }
    });

    const response = await new Promise((resolve) => {
      clientTransport.onmessage = resolve;
    });

    expect(response.result.messages[0].content.text).toContain("Plan Native Scaffold");
    expect(response.result.messages[0].content.text).toContain("new settings screen");
    expect(response.result.messages[0].content.text).toContain("ios");

    await server.close();
    await listener.close();
  });

  it("searchPlatformSkills returns matches without a session", async () => {
    const port = uniquePort();
    const listener = createAgentUIMcpListener({
      port,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const server = createAgentUIMcpServer(listener, serverTransport);

    clientTransport.send({
      jsonrpc: "2.0",
      id: "20",
      method: "tools/call",
      params: {
        name: "searchPlatformSkills",
        arguments: {
          query: "debugging failures"
        }
      }
    });

    const response = await new Promise((resolve) => {
      clientTransport.onmessage = resolve;
    });

    expect(response.result).toBeDefined();
    expect(response.result.isError).toBeUndefined();

    const parsed = JSON.parse(response.result.content[0].text);

    expect(parsed.ok).toBe(true);
    expect(Array.isArray(parsed.matches)).toBe(true);
    expect(parsed.matches.length).toBeGreaterThan(0);

    const systemDebug = parsed.matches.find((m) => m.skill === "systematic-debugging");

    expect(systemDebug).toBeDefined();
    expect(systemDebug.score).toBeGreaterThan(0);

    await server.close();
    await listener.close();
  });

  it("searchPlatformSkills returns QUERY_EMPTY for empty query", async () => {
    const port = uniquePort();
    const listener = createAgentUIMcpListener({
      port,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const server = createAgentUIMcpServer(listener, serverTransport);

    clientTransport.send({
      jsonrpc: "2.0",
      id: "21",
      method: "tools/call",
      params: {
        name: "searchPlatformSkills",
        arguments: {
          query: "   "
        }
      }
    });

    const response = await new Promise((resolve) => {
      clientTransport.onmessage = resolve;
    });

    expect(response.result.isError).toBe(true);

    const parsed = JSON.parse(response.result.content[0].text);

    expect(parsed.code).toBe("QUERY_EMPTY");

    await server.close();
    await listener.close();
  });

  it("recommendPlatformSkills returns recommendations without a session", async () => {
    const port = uniquePort();
    const listener = createAgentUIMcpListener({
      port,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const server = createAgentUIMcpServer(listener, serverTransport);

    clientTransport.send({
      jsonrpc: "2.0",
      id: "22",
      method: "tools/call",
      params: {
        name: "recommendPlatformSkills",
        arguments: {
          task: "debug a react native performance issue in expo"
        }
      }
    });

    const response = await new Promise((resolve) => {
      clientTransport.onmessage = resolve;
    });

    expect(response.result).toBeDefined();
    expect(response.result.isError).toBeUndefined();

    const parsed = JSON.parse(response.result.content[0].text);

    expect(parsed.ok).toBe(true);
    expect(Array.isArray(parsed.recommendations)).toBe(true);
    expect(parsed.recommendations.length).toBeGreaterThan(0);

    const debugRec = parsed.recommendations.find((r) => r.skill === "systematic-debugging");

    expect(debugRec).toBeDefined();
    expect(debugRec.resourceUri).toBe("agent-ui://platform-skills/systematic-debugging");
    expect(Array.isArray(debugRec.reasons)).toBe(true);
    expect(debugRec.reasons.length).toBeGreaterThan(0);

    await server.close();
    await listener.close();
  });

  it("recommendPlatformSkills returns TASK_EMPTY for empty task", async () => {
    const port = uniquePort();
    const listener = createAgentUIMcpListener({
      port,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const server = createAgentUIMcpServer(listener, serverTransport);

    clientTransport.send({
      jsonrpc: "2.0",
      id: "23",
      method: "tools/call",
      params: {
        name: "recommendPlatformSkills",
        arguments: {
          task: ""
        }
      }
    });

    const response = await new Promise((resolve) => {
      clientTransport.onmessage = resolve;
    });

    expect(response.result.isError).toBe(true);

    const parsed = JSON.parse(response.result.content[0].text);

    expect(parsed.code).toBe("TASK_EMPTY");

    await server.close();
    await listener.close();
  });

  it("ReadResource returns content for routing URI", async () => {
    const port = uniquePort();
    const listener = createAgentUIMcpListener({
      port,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const server = createAgentUIMcpServer(listener, serverTransport);

    clientTransport.send({
      jsonrpc: "2.0",
      id: "24",
      method: "resources/read",
      params: {
        uri: "agent-ui://platform-skills/routing"
      }
    });

    const response = await new Promise((resolve) => {
      clientTransport.onmessage = resolve;
    });

    expect(response.result).toBeDefined();
    expect(response.result.contents).toBeDefined();
    expect(response.result.contents.length).toBe(1);
    expect(response.result.contents[0].text).toContain("Platform Skill Routing");

    await server.close();
    await listener.close();
  });

  it("ReadResource returns content for index URI", async () => {
    const port = uniquePort();
    const listener = createAgentUIMcpListener({
      port,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const server = createAgentUIMcpServer(listener, serverTransport);

    clientTransport.send({
      jsonrpc: "2.0",
      id: "25",
      method: "resources/read",
      params: {
        uri: "agent-ui://platform-skills/index"
      }
    });

    const response = await new Promise((resolve) => {
      clientTransport.onmessage = resolve;
    });

    expect(response.result).toBeDefined();
    expect(response.result.contents).toBeDefined();
    expect(response.result.contents.length).toBe(1);
    expect(response.result.contents[0].text).toContain("Platform Skills");

    await server.close();
    await listener.close();
  });

  it("listPlatformSkills and searchPlatformSkills return consistent skill names", async () => {
    const port = uniquePort();
    const listener = createAgentUIMcpListener({
      port,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const server = createAgentUIMcpServer(listener, serverTransport);

    const sendRequest = (id, method, params) => {
      return new Promise((resolve) => {
        clientTransport.onmessage = (msg) => {
          if (msg.id === id) resolve(msg);
        };
        clientTransport.send({ jsonrpc: "2.0", id, method, params });
      });
    };

    const listResp = await sendRequest("26", "tools/call", {
      name: "listPlatformSkills",
      arguments: {}
    });

    const listParsed = JSON.parse(listResp.result.content[0].text);
    const listNames = listParsed.skills.map((s) => s.name).sort();

    const searchResp = await sendRequest("27", "tools/call", {
      name: "searchPlatformSkills",
      arguments: { query: "skill" }
    });

    const searchParsed = JSON.parse(searchResp.result.content[0].text);
    const searchNames = searchParsed.matches.map((m) => m.skill).sort();

    for (const name of searchNames) {
      expect(listNames).toContain(name);
    }

    await server.close();
    await listener.close();
  });

  it("getPrompt review_accessibility_semantics returns review template", async () => {
    const port = uniquePort();
    const listener = createAgentUIMcpListener({
      port,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const server = createAgentUIMcpServer(listener, serverTransport);

    clientTransport.send({
      jsonrpc: "2.0",
      id: "26",
      method: "prompts/get",
      params: {
        name: "review_accessibility_semantics",
        arguments: {
          platform: "ios",
          screenOrComponent: "SettingsScreen"
        }
      }
    });

    const response = await new Promise((resolve) => {
      clientTransport.onmessage = resolve;
    });

    expect(response.result.messages[0].content.text).toContain("Review Accessibility Semantics");
    expect(response.result.messages[0].content.text).toContain("SettingsScreen");

    await server.close();
    await listener.close();
  });

  it("getPrompt prepare_visual_editor_notes returns editor notes", async () => {
    const port = uniquePort();
    const listener = createAgentUIMcpListener({
      port,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const server = createAgentUIMcpServer(listener, serverTransport);

    const responsePromise = new Promise((resolve) => {
      clientTransport.onmessage = resolve;
    });

    clientTransport.send({
      jsonrpc: "2.0",
      id: "27",
      method: "prompts/get",
      params: {
        name: "prepare_visual_editor_notes",
        arguments: {
          sessions: "session-ios,session-android",
          platforms: "ios,android"
        }
      }
    });

    const response = await responsePromise;

    expect(response.result).toBeDefined();
    expect(response.result.messages[0].content.text).toContain("Prepare Visual Editor Notes");
    expect(response.result.messages[0].content.text).toContain("session-ios");

    await server.close();
    await listener.close();
  });

  it("getPrompt write_agent_task_notes returns task notes template", async () => {
    const port = uniquePort();
    const listener = createAgentUIMcpListener({
      port,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const server = createAgentUIMcpServer(listener, serverTransport);

    const responsePromise = new Promise((resolve) => {
      clientTransport.onmessage = resolve;
    });

    clientTransport.send({
      jsonrpc: "2.0",
      id: "28",
      method: "prompts/get",
      params: {
        name: "write_agent_task_notes",
        arguments: {
          task: "implement stage 5 mcp prompts",
          stage: "5"
        }
      }
    });

    const response = await responsePromise;

    expect(response.result.messages[0].content.text).toContain("Write Agent Task Notes");
    expect(response.result.messages[0].content.text).toContain("implement stage 5 mcp prompts");

    await server.close();
    await listener.close();
  });

  it("scroll returns SESSION_NOT_CONNECTED when no app session", async () => {
    const port = uniquePort();
    const listener = createAgentUIMcpListener({
      port,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const server = createAgentUIMcpServer(listener, serverTransport);

    clientTransport.send({
      jsonrpc: "2.0",
      id: "29",
      method: "tools/call",
      params: {
        name: "scroll",
        arguments: {
          id: "test.scroll"
        }
      }
    });

    const response = await new Promise((resolve) => {
      clientTransport.onmessage = resolve;
    });

    expect(response.result).toBeDefined();
    expect(response.result.isError).toBe(true);

    const parsed = JSON.parse(response.result.content[0].text);

    expect(parsed).toMatchObject({
      ok: false,
      code: "SESSION_NOT_CONNECTED"
    });

    await server.close();
    await listener.close();
  });

  it("navigate returns SESSION_NOT_CONNECTED when no app session", async () => {
    const port = uniquePort();
    const listener = createAgentUIMcpListener({
      port,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const server = createAgentUIMcpServer(listener, serverTransport);

    clientTransport.send({
      jsonrpc: "2.0",
      id: "30",
      method: "tools/call",
      params: {
        name: "navigate",
        arguments: {
          screen: "SettingsScreen"
        }
      }
    });

    const response = await new Promise((resolve) => {
      clientTransport.onmessage = resolve;
    });

    expect(response.result).toBeDefined();
    expect(response.result.isError).toBe(true);

    const parsed = JSON.parse(response.result.content[0].text);

    expect(parsed).toMatchObject({
      ok: false,
      code: "SESSION_NOT_CONNECTED"
    });

    await server.close();
    await listener.close();
  });

  it("runFlow returns SESSION_NOT_CONNECTED when no app session", async () => {
    const port = uniquePort();
    const listener = createAgentUIMcpListener({
      port,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const server = createAgentUIMcpServer(listener, serverTransport);

    clientTransport.send({
      jsonrpc: "2.0",
      id: "31",
      method: "tools/call",
      params: {
        name: "runFlow",
        arguments: {
          name: "test-flow",
          steps: [
            { type: "tap", targetId: "test.button" }
          ]
        }
      }
    });

    const response = await new Promise((resolve) => {
      clientTransport.onmessage = resolve;
    });

    expect(response.result).toBeDefined();
    expect(response.result.isError).toBe(true);

    const parsed = JSON.parse(response.result.content[0].text);

    expect(parsed).toMatchObject({
      ok: false,
      code: "SESSION_NOT_CONNECTED"
    });

    await server.close();
    await listener.close();
  });

  it("proposePatch creates a patch proposal without requiring a session", async () => {
    const port = uniquePort();
    const listener = createAgentUIMcpListener({
      port,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const server = createAgentUIMcpServer(listener, serverTransport);

    clientTransport.send({
      jsonrpc: "2.0",
      id: "31b",
      method: "tools/call",
      params: {
        name: "proposePatch",
        arguments: {
          title: "Add semantic IDs",
          description: "Add stable IDs to checkout form",
          source: "semantic_audit",
          changes: [
            {
              kind: "add_prop",
              targetId: "checkout.submit",
              propName: "id",
              reason: "Button needs stable id"
            }
          ]
        }
      }
    });

    const response = await new Promise((resolve) => {
      clientTransport.onmessage = resolve;
    });

    expect(response.result).toBeDefined();
    expect(response.result.isError).toBeUndefined();

    const parsed = JSON.parse(response.result.content[0].text);

    expect(parsed.ok).toBe(true);
    expect(parsed.proposal).toBeDefined();
    expect(parsed.proposal.id).toMatch(/^patch-/);
    expect(parsed.proposal.title).toBe("Add semantic IDs");
    expect(parsed.proposal.source).toBe("semantic_audit");
    expect(parsed.proposal.autoApply).toBe(false);
    expect(parsed.proposal.requiresApproval).toBe(true);
    expect(parsed.proposal.changes).toHaveLength(1);
    expect(parsed.message).toContain("NOT be auto-applied");

    await server.close();
    await listener.close();
  });

  it("listTools returns 14 tools (9 runtime-control + 1 proposal + 4 skill-context)", async () => {
    const port = uniquePort();
    const listener = createAgentUIMcpListener({
      port,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const server = createAgentUIMcpServer(listener, serverTransport);

    clientTransport.send({
      jsonrpc: "2.0",
      id: "32",
      method: "tools/list",
      params: {}
    });

    const response = await new Promise((resolve) => {
      clientTransport.onmessage = resolve;
    });

    expect(response.result).toBeDefined();

    const tools = response.result.tools;

    expect(Array.isArray(tools)).toBe(true);
    expect(tools.length).toBe(15);

    const names = tools.map((t) => t.name).sort();

    expect(names).toEqual([
      "compareNativePreviews",
      "getPlatformSkill",
      "getState",
      "input",
      "inspectTree",
      "listPlatformSkills",
      "navigate",
      "observeEvents",
      "proposePatch",
      "recommendPlatformSkills",
      "runFlow",
      "scroll",
      "searchPlatformSkills",
      "tap",
      "waitFor"
    ]);

    await server.close();
    await listener.close();
  });

  it("all 15 tools have valid inputSchemas with type: object", async () => {
    const port = uniquePort();
    const listener = createAgentUIMcpListener({
      port,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const server = createAgentUIMcpServer(listener, serverTransport);

    clientTransport.send({
      jsonrpc: "2.0",
      id: "33",
      method: "tools/list",
      params: {}
    });

    const response = await new Promise((resolve) => {
      clientTransport.onmessage = resolve;
    });

    const tools = response.result.tools;

    expect(tools.length).toBe(15);

    for (const tool of tools) {
      expect(tool.inputSchema).toBeDefined();
      expect(typeof tool.inputSchema).toBe("object");
      expect(tool.inputSchema.type).toBe("object");
      expect(tool.inputSchema.properties).toBeDefined();
      expect(typeof tool.inputSchema.properties).toBe("object");
    }

    await server.close();
    await listener.close();
  });

  it("all 15 tools have non-empty descriptions", async () => {
    const port = uniquePort();
    const listener = createAgentUIMcpListener({
      port,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const server = createAgentUIMcpServer(listener, serverTransport);

    clientTransport.send({
      jsonrpc: "2.0",
      id: "34",
      method: "tools/list",
      params: {}
    });

    const response = await new Promise((resolve) => {
      clientTransport.onmessage = resolve;
    });

    const tools = response.result.tools;

    for (const tool of tools) {
      expect(typeof tool.description).toBe("string");
      expect(tool.description.length).toBeGreaterThan(0);
    }

    await server.close();
    await listener.close();
  });

  it("ListResources includes sessions and diagnostics URIs", async () => {
    const port = uniquePort();
    const listener = createAgentUIMcpListener({
      port,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const server = createAgentUIMcpServer(listener, serverTransport);

    clientTransport.send({
      jsonrpc: "2.0",
      id: "35",
      method: "resources/list",
      params: {}
    });

    const response = await new Promise((resolve) => {
      clientTransport.onmessage = resolve;
    });

    expect(response.result).toBeDefined();
    expect(Array.isArray(response.result.resources)).toBe(true);
    expect(response.result.resources.length).toBeGreaterThanOrEqual(14);

    const uris = response.result.resources.map((r) => r.uri).sort();

    expect(uris).toContain("agent-ui://sessions");
    expect(uris).toContain("agent-ui://diagnostics");
    expect(uris).toContain("agent-ui://serve-sim/sessions");

    const sessionsRes = response.result.resources.find((r) => r.uri === "agent-ui://sessions");

    expect(sessionsRes).toBeDefined();
    expect(sessionsRes.name).toBe("Sessions");
    expect(sessionsRes.mimeType).toBe("application/json");

    const serveSimRes = response.result.resources.find((r) => r.uri === "agent-ui://serve-sim/sessions");

    expect(serveSimRes).toBeDefined();
    expect(serveSimRes.name).toBe("Serve-Sim Sessions");
    expect(serveSimRes.mimeType).toBe("application/json");
    expect(serveSimRes.description).toContain("serve-sim");

    await server.close();
    await listener.close();
  });

  it("ReadResource for sessions URI returns metadata even without session", async () => {
    const port = uniquePort();
    const listener = createAgentUIMcpListener({
      port,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const server = createAgentUIMcpServer(listener, serverTransport);

    clientTransport.send({
      jsonrpc: "2.0",
      id: "36",
      method: "resources/read",
      params: {
        uri: "agent-ui://sessions"
      }
    });

    const response = await new Promise((resolve) => {
      clientTransport.onmessage = resolve;
    });

    expect(response.result).toBeDefined();
    expect(response.result.contents).toBeDefined();
    expect(response.result.contents.length).toBe(1);
    expect(response.result.contents[0].mimeType).toBe("application/json");

    const parsed = JSON.parse(response.result.contents[0].text);

    expect(parsed.ok).toBe(true);
    expect(typeof parsed.connected).toBe("boolean");

    await server.close();
    await listener.close();
  });

  it("ReadResource for diagnostics URI returns server metadata", async () => {
    const port = uniquePort();
    const listener = createAgentUIMcpListener({
      port,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const server = createAgentUIMcpServer(listener, serverTransport);

    clientTransport.send({
      jsonrpc: "2.0",
      id: "37",
      method: "resources/read",
      params: {
        uri: "agent-ui://diagnostics"
      }
    });

    const response = await new Promise((resolve) => {
      clientTransport.onmessage = resolve;
    });

    expect(response.result).toBeDefined();
    expect(response.result.contents).toBeDefined();
    expect(response.result.contents.length).toBe(1);
    expect(response.result.contents[0].mimeType).toBe("application/json");

    const parsed = JSON.parse(response.result.contents[0].text);

    expect(parsed.ok).toBe(true);
    expect(parsed.server).toBeDefined();
    expect(parsed.server.name).toBe("agent-ui-mcp");
    expect(parsed.server.version).toBe(require("../package.json").version);
    expect(parsed.listener).toBeDefined();
    expect(parsed.listener.state).toBe("listening");

    await server.close();
    await listener.close();
  });

  it("ReadResource for serve-sim/sessions URI returns discovery result", async () => {
    const port = uniquePort();
    const listener = createAgentUIMcpListener({
      port,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const server = createAgentUIMcpServer(listener, serverTransport);

    clientTransport.send({
      jsonrpc: "2.0",
      id: "38",
      method: "resources/read",
      params: {
        uri: "agent-ui://serve-sim/sessions"
      }
    });

    const response = await new Promise((resolve) => {
      clientTransport.onmessage = resolve;
    });

    expect(response.result).toBeDefined();
    expect(response.result.contents).toBeDefined();
    expect(response.result.contents.length).toBe(1);
    expect(response.result.contents[0].mimeType).toBe("application/json");

    const parsed = JSON.parse(response.result.contents[0].text);

    expect(parsed.ok).toBe(true);
    expect(typeof parsed.platformSupported).toBe("boolean");
    expect(typeof parsed.stateDirectoryExists).toBe("boolean");
    expect(typeof parsed.sessionCount).toBe("number");
    expect(Array.isArray(parsed.sessions)).toBe(true);

    // On non-macOS (Windows CI), platformSupported is false and sessions is empty.
    // On macOS without serve-sim running, sessions is empty.
    // Both are valid — we verify the shape, not platform-specific behavior.
    expect(parsed.sessionCount).toBe(parsed.sessions.length);

    await server.close();
    await listener.close();
  });
});
