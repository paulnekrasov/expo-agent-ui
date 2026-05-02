const { createAgentUIMcpListener } = require("../dist/listener");
const { WebSocket } = require("ws");

const TEST_TOKEN = "agentui_test_token_32bytes_min";

function wsUrl(port) {
  return `ws://127.0.0.1:${port}`;
}

function connectAndHello(port, hello) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl(port));

    const timer = setTimeout(() => {
      ws.close();
      reject(new Error("hello timeout"));
    }, 5000);

    ws.on("open", () => {
      ws.send(JSON.stringify(hello));
    });

    ws.on("message", (raw) => {
      let message;

      try {
        message = JSON.parse(raw.toString());
      } catch {
        return;
      }

      if (
        typeof message === "object" &&
        message !== null &&
        !Array.isArray(message)
      ) {
        const obj = message;

        if (
          typeof obj.protocolVersion === "number" &&
          typeof obj.sessionId === "string"
        ) {
          clearTimeout(timer);
          resolve({ ws, welcome: obj });
        }
      }
    });

    ws.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

function connectAndExpectError(port, hello) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl(port));

    const timer = setTimeout(() => {
      ws.close();
      reject(new Error("hello timeout"));
    }, 5000);

    ws.on("open", () => {
      ws.send(JSON.stringify(hello));
    });

    ws.on("message", (raw) => {
      let message;

      try {
        message = JSON.parse(raw.toString());
      } catch {
        return;
      }

      if (
        typeof message === "object" &&
        message !== null &&
        !Array.isArray(message)
      ) {
        const obj = message;

        if (typeof obj.error === "string") {
          clearTimeout(timer);
          resolve({ ws, error: obj.error });
        }
      }
    });

    ws.on("close", (code) => {
      clearTimeout(timer);
      resolve({ ws, error: `closed ${code}` });
    });

    ws.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("Agent UI MCP listener", () => {
  let port = 30000 + Math.floor(Math.random() * 10000);

  function nextPort() {
    port += 1;
    return port;
  }

  it("starts and stops the listener", async () => {
    const p = nextPort();
    const listener = createAgentUIMcpListener({
      port: p,
      expectedPairingToken: TEST_TOKEN
    });

    expect(listener.state).toBe("idle");

    await listener.start();
    expect(listener.state).toBe("listening");
    expect(listener.port).toBe(p);
    expect(listener.host).toBe("127.0.0.1");

    await listener.close();
    expect(listener.state).toBe("closed");
  });

  it("accepts a valid hello handshake with correct pairing token", async () => {
    const p = nextPort();
    const listener = createAgentUIMcpListener({
      port: p,
      expectedPairingToken: TEST_TOKEN
    });

    const connected = [];

    listener.onSessionConnected = (session) => {
      connected.push(session);
    };

    await listener.start();

    const { ws, welcome } = await connectAndHello(p, {
      protocolVersion: 1,
      pairingToken: TEST_TOKEN,
      capabilities: ["inspectTree", "getState"]
    });

    expect(welcome.protocolVersion).toBe(1);
    expect(typeof welcome.sessionId).toBe("string");
    expect(welcome.epoch).toBe(1);
    expect(Array.isArray(welcome.serverCapabilities)).toBe(true);

    await sleep(300);

    expect(connected).toHaveLength(1);
    expect(connected[0].state).toBe("paired");
    expect(connected[0].capabilities).toContain("inspectTree");

    ws.close();
    await listener.close();
  });

  it("rejects a hello with wrong pairing token", async () => {
    const p = nextPort();
    const listener = createAgentUIMcpListener({
      port: p,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const { error } = await connectAndExpectError(p, {
      protocolVersion: 1,
      pairingToken: "wrong-token-abcdef12345",
      capabilities: ["inspectTree"]
    });

    expect(error).toMatch(/INVALID_PAIRING_TOKEN|closed/);

    await listener.close();
  });

  it("rejects a hello with missing capabilities", async () => {
    const p = nextPort();
    const listener = createAgentUIMcpListener({
      port: p,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const { error } = await connectAndExpectError(p, {
      protocolVersion: 1,
      pairingToken: TEST_TOKEN,
      capabilities: []
    });

    expect(error).toMatch(/INVALID_HELLO|closed/);

    await listener.close();
  });

  it("rejects a hello with wrong protocol version", async () => {
    const p = nextPort();
    const listener = createAgentUIMcpListener({
      port: p,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const { error } = await connectAndExpectError(p, {
      protocolVersion: 999,
      pairingToken: TEST_TOKEN,
      capabilities: ["inspectTree"]
    });

    expect(error).toMatch(/INVALID_HELLO|closed/);

    await listener.close();
  });

  it("rejects a hello with empty pairing token", async () => {
    const p = nextPort();
    const listener = createAgentUIMcpListener({
      port: p,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const { error } = await connectAndExpectError(p, {
      protocolVersion: 1,
      pairingToken: "",
      capabilities: ["inspectTree"]
    });

    expect(error).toMatch(/INVALID_HELLO|closed/);

    await listener.close();
  });

  it("rejects a second connection when one is active", async () => {
    const p = nextPort();
    const listener = createAgentUIMcpListener({
      port: p,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const { ws: ws1 } = await connectAndHello(p, {
      protocolVersion: 1,
      pairingToken: TEST_TOKEN,
      capabilities: ["inspectTree"]
    });

    expect(listener.activeSession).toBeDefined();

    const { error } = await connectAndExpectError(p, {
      protocolVersion: 1,
      pairingToken: TEST_TOKEN,
      capabilities: ["inspectTree"]
    });

    expect(error).toMatch(/TOO_MANY_SESSIONS|closed/);

    ws1.close();
    await listener.close();
  });

  it("detects disconnected sessions", async () => {
    const p = nextPort();
    const listener = createAgentUIMcpListener({
      port: p,
      expectedPairingToken: TEST_TOKEN
    });

    const disconnected = [];

    listener.onSessionDisconnected = (session) => {
      disconnected.push(session);
    };

    await listener.start();

    const { ws } = await connectAndHello(p, {
      protocolVersion: 1,
      pairingToken: TEST_TOKEN,
      capabilities: ["inspectTree"]
    });

    await sleep(100);

    ws.close();

    await sleep(1000);

    expect(disconnected).toHaveLength(1);

    await listener.close();
  });

  it("transitions session from paired to active on heartbeat", async () => {
    const p = nextPort();
    const listener = createAgentUIMcpListener({
      port: p,
      expectedPairingToken: TEST_TOKEN,
      heartbeatIntervalMs: 200,
      heartbeatMaxMissed: 3
    });

    await listener.start();

    const { ws } = await connectAndHello(p, {
      protocolVersion: 1,
      pairingToken: TEST_TOKEN,
      capabilities: ["inspectTree"]
    });

    ws.send(
      JSON.stringify({
        sessionId: (listener.activeSession && listener.activeSession.sessionId) || "",
        clientTimestamp: Date.now()
      })
    );

    await sleep(500);

    expect(listener.activeSession ? listener.activeSession.state : "").toBe("active");

    ws.close();
    await listener.close();
  });

  it("uses configured heartbeat interval for server acknowledgements", async () => {
    const p = nextPort();
    const listener = createAgentUIMcpListener({
      port: p,
      expectedPairingToken: TEST_TOKEN,
      heartbeatIntervalMs: 100,
      heartbeatMaxMissed: 10
    });

    await listener.start();

    const { ws, welcome } = await connectAndHello(p, {
      protocolVersion: 1,
      pairingToken: TEST_TOKEN,
      capabilities: ["inspectTree"]
    });

    const ack = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error("heartbeat ack timeout"));
      }, 1000);

      ws.on("message", (raw) => {
        let message;

        try {
          message = JSON.parse(raw.toString());
        } catch {
          return;
        }

        if (
          typeof message === "object" &&
          message !== null &&
          !Array.isArray(message) &&
          message.sessionId === welcome.sessionId &&
          typeof message.serverTimestamp === "number"
        ) {
          clearTimeout(timer);
          resolve(message);
        }
      });
    });

    expect(ack.sessionId).toBe(welcome.sessionId);

    ws.close();
    await listener.close();
  });

  it("closes the active app websocket when listener closes", async () => {
    const p = nextPort();
    const listener = createAgentUIMcpListener({
      port: p,
      expectedPairingToken: TEST_TOKEN
    });

    await listener.start();

    const { ws } = await connectAndHello(p, {
      protocolVersion: 1,
      pairingToken: TEST_TOKEN,
      capabilities: ["inspectTree"]
    });

    await listener.close();

    const closeCode = await new Promise((resolve, reject) => {
      if (ws.readyState === WebSocket.CLOSED) {
        resolve(ws._closeCode || 1000);
        return;
      }

      const timer = setTimeout(() => {
        reject(new Error("websocket did not close"));
      }, 1000);

      ws.on("close", (code) => {
        clearTimeout(timer);
        resolve(code);
      });
    });

    expect(closeCode).toBeGreaterThan(0);
  });

  it("fails to start on the same port twice", async () => {
    const p = nextPort();
    const listener1 = createAgentUIMcpListener({
      port: p,
      expectedPairingToken: TEST_TOKEN
    });

    await listener1.start();

    const listener2 = createAgentUIMcpListener({
      port: p,
      expectedPairingToken: TEST_TOKEN
    });

    await expect(listener2.start()).rejects.toThrow();

    await listener1.close();
  });

  it("sendCommand resolves with app response", async () => {
    const p = nextPort();
    const listener = createAgentUIMcpListener({
      port: p,
      expectedPairingToken: TEST_TOKEN
    });

    const connected = [];

    listener.onSessionConnected = (session) => {
      connected.push(session);
    };

    await listener.start();

    const { ws, welcome } = await connectAndHello(p, {
      protocolVersion: 1,
      pairingToken: TEST_TOKEN,
      capabilities: ["inspectTree"]
    });

    const testSessionId = welcome.sessionId;

    await sleep(300);

    if (!connected[0]) {
      ws.close();
      await listener.close();
      throw new Error("no session connected");
    }

    ws.on("message", (raw) => {
      let msg;

      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }

      if (
        typeof msg === "object" &&
        msg !== null &&
        !Array.isArray(msg)
      ) {
        const obj = msg;

        if (
          obj.type === "inspectTree" &&
          typeof obj.requestId === "string"
        ) {
          ws.send(
            JSON.stringify({
              type: "inspectTree",
              requestId: obj.requestId,
              sessionId: testSessionId,
              tree: { ok: true, children: [] },
              timestamp: Date.now()
            })
          );
        }
      }
    });

    const response = await connected[0].sendCommand({
      type: "inspectTree",
      requestId: "req_test_001"
    });

    expect(response.type).toBe("inspectTree");

    ws.close();
    await listener.close();
  });
});
