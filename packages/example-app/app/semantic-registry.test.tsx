import { render } from "@testing-library/react-native";

import {
  AgentUIProvider,
  Button,
  Form,
  Screen,
  Section,
  createAgentUISemanticRegistry,
  useDeferredSemanticPrimitive
} from "@agent-ui/core";

function PrimitiveProbe(): null {
  useDeferredSemanticPrimitive({
    actions: ["tap"],
    id: "registry.probe",
    label: "Registry probe",
    role: "button"
  });

  return null;
}

describe("semantic registry", () => {
  const devGlobal = globalThis as typeof globalThis & {
    __DEV__?: boolean | undefined;
  };
  const originalDev = devGlobal.__DEV__;

  afterEach(() => {
    jest.restoreAllMocks();

    if (originalDev === undefined) {
      delete devGlobal.__DEV__;
      return;
    }

    devGlobal.__DEV__ = originalDev;
  });

  it("normalizes primitive registrations into semantic nodes", () => {
    const registry = createAgentUISemanticRegistry();
    const unregister = registry.registerPrimitive({
      actions: ["tap"],
      busy: true,
      disabled: false,
      id: "settings.save",
      intent: "settings.save",
      label: "Save settings",
      privacy: "none",
      role: "button"
    });

    expect(registry.getSnapshot()).toEqual({
      generatedNodeCount: 0,
      mountedNodeCount: 1,
      nodes: [
        {
          actions: [{ name: "tap", source: "agent-ui" }],
          children: [],
          id: "settings.save",
          intent: "settings.save",
          label: "Save settings",
          privacy: "none",
          state: { busy: true, disabled: false },
          type: "button"
        }
      ]
    });

    unregister();

    expect(registry.getSnapshot()).toEqual({
      generatedNodeCount: 0,
      mountedNodeCount: 0,
      nodes: []
    });
  });

  it("unregisters only the mounted primitive tied to that handle", () => {
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
    const registry = createAgentUISemanticRegistry();
    const unregisterFirst = registry.registerPrimitive({
      id: "settings.row",
      label: "First row",
      role: "text"
    });
    const unregisterSecond = registry.registerPrimitive({
      id: "settings.row",
      label: "Second row",
      role: "text"
    });

    unregisterFirst();
    unregisterFirst();

    expect(registry.getSnapshot()).toMatchObject({
      mountedNodeCount: 1,
      nodes: [{ id: "settings.row", label: "Second row" }]
    });

    unregisterSecond();

    expect(registry.getSnapshot().mountedNodeCount).toBe(0);
  });

  it("marks generated ids when a passive primitive has no stable id", () => {
    const registry = createAgentUISemanticRegistry();

    registry.registerPrimitive({ role: "spacer" });

    expect(registry.getSnapshot()).toMatchObject({
      generatedNodeCount: 1,
      mountedNodeCount: 1,
      nodes: [
        {
          generated: true,
          id: "agent-ui.generated.1",
          type: "spacer"
        }
      ]
    });
  });

  it("looks up visible semantic nodes by id without exposing mutable registry state", () => {
    const registry = createAgentUISemanticRegistry();

    registry.registerPrimitive({
      id: "settings.save",
      label: "Save settings",
      role: "button"
    });

    const node = registry.getNodeById("settings.save");

    expect(node).toMatchObject({
      children: [],
      id: "settings.save",
      label: "Save settings",
      type: "button"
    });

    if (node) {
      node.label = "Mutated label";
      node.children.push({
        actions: [],
        children: [],
        id: "mutated.child",
        state: {},
        type: "text"
      });
    }

    expect(registry.getNodeById("settings.save")).toMatchObject({
      children: [],
      id: "settings.save",
      label: "Save settings"
    });
  });

  it("looks up generated ids for debugging while preserving generated metadata", () => {
    const registry = createAgentUISemanticRegistry();

    registry.registerPrimitive({ role: "spacer" });

    expect(registry.getNodeById("agent-ui.generated.1")).toMatchObject({
      generated: true,
      id: "agent-ui.generated.1",
      type: "spacer"
    });
  });

  it("builds parent-child tree snapshots from rendered primitives", () => {
    devGlobal.__DEV__ = true;
    const registry = createAgentUISemanticRegistry();

    render(
      <AgentUIProvider runtime={registry}>
        <Screen id="settings" name="settings" title="Settings">
          <Form accessibilityLabel="Settings form" id="settings.form">
            <Section id="settings.account" title="Account">
              <Button accessibilityLabel="Save settings" id="settings.save">
                Save
              </Button>
            </Section>
          </Form>
        </Screen>
      </AgentUIProvider>
    );

    expect(registry.getSnapshot()).toMatchObject({
      generatedNodeCount: 0,
      mountedNodeCount: 4,
      nodes: [
        {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      actions: [
                        { name: "activate", source: "agent-ui" },
                        { name: "tap", source: "agent-ui" }
                      ],
                      id: "settings.save",
                      label: "Save settings",
                      screen: "settings",
                      type: "button"
                    }
                  ],
                  id: "settings.account",
                  screen: "settings",
                  type: "section"
                }
              ],
              id: "settings.form",
              screen: "settings",
              type: "form"
            }
          ],
          id: "settings",
          screen: "settings",
          type: "screen"
        }
      ]
    });
  });

  it("prunes hidden semantic subtrees from default snapshots", () => {
    const registry = createAgentUISemanticRegistry();

    registry.registerPrimitive({
      id: "settings",
      mountKey: "screen",
      role: "screen",
      screen: "settings"
    });
    registry.registerPrimitive({
      hidden: true,
      id: "settings.hidden-section",
      mountKey: "section",
      parentMountKey: "screen",
      role: "section"
    });
    registry.registerPrimitive({
      actions: ["tap"],
      id: "settings.hidden-button",
      label: "Hidden button",
      mountKey: "button",
      parentMountKey: "section",
      role: "button"
    });

    expect(registry.getSnapshot()).toMatchObject({
      generatedNodeCount: 0,
      mountedNodeCount: 3,
      nodes: [
        {
          children: [],
          id: "settings"
        }
      ]
    });
  });

  it("warns for duplicate stable ids in the same screen scope", () => {
    devGlobal.__DEV__ = true;
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    const registry = createAgentUISemanticRegistry();

    registry.registerPrimitive({
      id: "settings",
      mountKey: "settings-screen",
      role: "screen",
      screen: "settings"
    });
    registry.registerPrimitive({
      actions: ["tap"],
      id: "settings.save",
      label: "Save settings",
      mountKey: "first-save",
      parentMountKey: "settings-screen",
      role: "button"
    });
    registry.registerPrimitive({
      actions: ["tap"],
      id: "settings.save",
      label: "Save again",
      mountKey: "second-save",
      parentMountKey: "settings-screen",
      role: "button"
    });

    expect(warnSpy).toHaveBeenCalledWith(
      'Duplicate Agent UI semantic id "settings.save" detected in screen scope "settings". Stable IDs must be unique within a screen.'
    );
  });

  it("allows the same stable id in separate screen scopes", () => {
    devGlobal.__DEV__ = true;
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    const registry = createAgentUISemanticRegistry();

    registry.registerPrimitive({
      id: "settings",
      mountKey: "settings-screen",
      role: "screen",
      screen: "settings"
    });
    registry.registerPrimitive({
      actions: ["tap"],
      id: "shared.save",
      label: "Save settings",
      mountKey: "settings-save",
      parentMountKey: "settings-screen",
      role: "button"
    });
    registry.registerPrimitive({
      id: "profile",
      mountKey: "profile-screen",
      role: "screen",
      screen: "profile"
    });
    registry.registerPrimitive({
      actions: ["tap"],
      id: "shared.save",
      label: "Save profile",
      mountKey: "profile-save",
      parentMountKey: "profile-screen",
      role: "button"
    });

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("requires screen scope when a semantic id is valid in separate screens", () => {
    devGlobal.__DEV__ = true;
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
    const registry = createAgentUISemanticRegistry();

    registry.registerPrimitive({
      id: "settings",
      mountKey: "settings-screen",
      role: "screen",
      screen: "settings"
    });
    registry.registerPrimitive({
      actions: ["tap"],
      id: "shared.save",
      label: "Save settings",
      mountKey: "settings-save",
      parentMountKey: "settings-screen",
      role: "button"
    });
    registry.registerPrimitive({
      id: "profile",
      mountKey: "profile-screen",
      role: "screen",
      screen: "profile"
    });
    registry.registerPrimitive({
      actions: ["tap"],
      id: "shared.save",
      label: "Save profile",
      mountKey: "profile-save",
      parentMountKey: "profile-screen",
      role: "button"
    });

    expect(registry.getNodeById("shared.save")).toBeUndefined();
    expect(
      registry.getNodeById("shared.save", { screen: "profile" })
    ).toMatchObject({
      id: "shared.save",
      label: "Save profile",
      screen: "profile"
    });
  });

  it("does not look up nodes in hidden semantic subtrees by default", () => {
    const registry = createAgentUISemanticRegistry();

    registry.registerPrimitive({
      id: "settings",
      mountKey: "screen",
      role: "screen",
      screen: "settings"
    });
    registry.registerPrimitive({
      hidden: true,
      id: "settings.hidden-section",
      mountKey: "section",
      parentMountKey: "screen",
      role: "section"
    });
    registry.registerPrimitive({
      actions: ["tap"],
      id: "settings.hidden-button",
      label: "Hidden button",
      mountKey: "button",
      parentMountKey: "section",
      role: "button"
    });

    expect(registry.getNodeById("settings.hidden-button")).toBeUndefined();
  });

  it("returns undefined for missing or empty lookup ids", () => {
    const registry = createAgentUISemanticRegistry();

    registry.registerPrimitive({
      id: "settings.save",
      label: "Save settings",
      role: "button"
    });

    expect(registry.getNodeById("settings.missing")).toBeUndefined();
    expect(registry.getNodeById("   ")).toBeUndefined();
  });

  it("dispatches registered semantic action handlers by id", async () => {
    const registry = createAgentUISemanticRegistry();
    const handler = jest.fn();

    registry.registerPrimitive({
      actions: ["tap"],
      actionHandlers: {
        tap: handler
      },
      id: "settings.save",
      label: "Save settings",
      role: "button"
    });

    await expect(
      registry.dispatchAction("settings.save", "tap")
    ).resolves.toMatchObject({
      action: "tap",
      code: "ACTION_DISPATCHED",
      nodeId: "settings.save",
      ok: true
    });
    expect(handler).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        action: "tap",
        node: expect.objectContaining({
          id: "settings.save",
          label: "Save settings"
        })
      })
    );
  });

  it("rejects unsupported or unavailable semantic actions without invoking handlers", async () => {
    const registry = createAgentUISemanticRegistry();
    const handler = jest.fn();

    registry.registerPrimitive({
      actions: ["tap"],
      actionHandlers: {
        tap: handler
      },
      id: "settings.save",
      label: "Save settings",
      role: "button"
    });
    registry.registerPrimitive({
      actions: ["tap"],
      disabled: true,
      id: "settings.disabled",
      label: "Disabled action",
      role: "button"
    });
    registry.registerPrimitive({
      actions: ["tap"],
      busy: true,
      id: "settings.busy",
      label: "Busy action",
      role: "button"
    });

    await expect(
      registry.dispatchAction("settings.save", "input")
    ).resolves.toMatchObject({
      code: "ACTION_UNSUPPORTED",
      ok: false,
      supportedActions: ["tap"]
    });
    await expect(
      registry.dispatchAction("settings.disabled", "tap")
    ).resolves.toMatchObject({
      code: "ACTION_DISABLED",
      ok: false
    });
    await expect(
      registry.dispatchAction("settings.busy", "tap")
    ).resolves.toMatchObject({
      code: "ACTION_DISABLED",
      ok: false
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it("returns structured failures for hidden nodes and missing handlers", async () => {
    const registry = createAgentUISemanticRegistry();

    registry.registerPrimitive({
      id: "settings",
      mountKey: "screen",
      role: "screen",
      screen: "settings"
    });
    registry.registerPrimitive({
      hidden: true,
      id: "settings.hidden-section",
      mountKey: "section",
      parentMountKey: "screen",
      role: "section"
    });
    registry.registerPrimitive({
      actions: ["tap"],
      actionHandlers: {
        tap: jest.fn()
      },
      id: "settings.hidden-button",
      label: "Hidden button",
      mountKey: "button",
      parentMountKey: "section",
      role: "button"
    });
    registry.registerPrimitive({
      actions: ["tap"],
      id: "settings.no-handler",
      label: "No handler",
      role: "button"
    });

    await expect(
      registry.dispatchAction("settings.hidden-button", "tap")
    ).resolves.toMatchObject({
      code: "NODE_NOT_FOUND",
      ok: false
    });
    await expect(
      registry.dispatchAction("settings.no-handler", "tap")
    ).resolves.toMatchObject({
      code: "ACTION_HANDLER_MISSING",
      ok: false
    });
  });

  it("requires screen scope before dispatching duplicate ids across screens", async () => {
    devGlobal.__DEV__ = true;
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
    const registry = createAgentUISemanticRegistry();
    const settingsHandler = jest.fn();
    const profileHandler = jest.fn();

    registry.registerPrimitive({
      id: "settings",
      mountKey: "settings-screen",
      role: "screen",
      screen: "settings"
    });
    registry.registerPrimitive({
      actions: ["tap"],
      actionHandlers: {
        tap: settingsHandler
      },
      id: "shared.save",
      label: "Save settings",
      mountKey: "settings-save",
      parentMountKey: "settings-screen",
      role: "button"
    });
    registry.registerPrimitive({
      id: "profile",
      mountKey: "profile-screen",
      role: "screen",
      screen: "profile"
    });
    registry.registerPrimitive({
      actions: ["tap"],
      actionHandlers: {
        tap: profileHandler
      },
      id: "shared.save",
      label: "Save profile",
      mountKey: "profile-save",
      parentMountKey: "profile-screen",
      role: "button"
    });

    await expect(
      registry.dispatchAction("shared.save", "tap")
    ).resolves.toMatchObject({
      code: "ACTION_AMBIGUOUS",
      ok: false
    });
    await expect(
      registry.dispatchAction("shared.save", "tap", { screen: "profile" })
    ).resolves.toMatchObject({
      code: "ACTION_DISPATCHED",
      ok: true,
      screen: "profile"
    });
    expect(settingsHandler).not.toHaveBeenCalled();
    expect(profileHandler).toHaveBeenCalledTimes(1);
  });

  it("routes rendered primitive callbacks through semantic dispatch", async () => {
    devGlobal.__DEV__ = true;
    const registry = createAgentUISemanticRegistry();
    const onPress = jest.fn();

    render(
      <AgentUIProvider runtime={registry}>
        <Button
          accessibilityLabel="Save settings"
          id="settings.save"
          onPress={onPress}
        >
          Save
        </Button>
      </AgentUIProvider>
    );

    await expect(
      registry.dispatchAction("settings.save", "tap")
    ).resolves.toMatchObject({
      code: "ACTION_DISPATCHED",
      ok: true
    });
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("registers and unregisters provider-mounted primitives in development", () => {
    devGlobal.__DEV__ = true;
    const registry = createAgentUISemanticRegistry();

    const screen = render(
      <AgentUIProvider runtime={registry}>
        <Button accessibilityLabel="Run registry probe" id="registry.run">
          Run
        </Button>
        <PrimitiveProbe />
      </AgentUIProvider>
    );

    expect(registry.getSnapshot()).toMatchObject({
      mountedNodeCount: 2,
      nodes: [
        { id: "registry.run", type: "button" },
        { id: "registry.probe", type: "button" }
      ]
    });

    screen.unmount();

    expect(registry.getSnapshot().mountedNodeCount).toBe(0);
  });

  it("keeps provider-mounted primitives fail-closed outside development", () => {
    devGlobal.__DEV__ = false;
    const registry = createAgentUISemanticRegistry();

    render(
      <AgentUIProvider runtime={registry}>
        <PrimitiveProbe />
      </AgentUIProvider>
    );

    expect(registry.getSnapshot()).toEqual({
      generatedNodeCount: 0,
      mountedNodeCount: 0,
      nodes: []
    });
  });
});
