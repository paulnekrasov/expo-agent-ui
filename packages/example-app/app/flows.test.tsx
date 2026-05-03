import {
  isValidFlowStepType,
  validateFlowStep,
  validateFlow,
  stepRequiresApproval,
  createFlowRunner
} from "@expo-agent-ui/core";
import type {
  SemanticFlow,
  SemanticFlowStep,
  WaitCondition
} from "@expo-agent-ui/core";

describe("Flow runner types", () => {
  describe("isValidFlowStepType", () => {
    it("returns true for all valid step types", () => {
      const valid = [
        "tap",
        "input",
        "scroll",
        "navigate",
        "waitFor",
        "assert",
        "observeEvents"
      ];

      for (const type of valid) {
        expect(isValidFlowStepType(type)).toBe(true);
      }
    });

    it("returns false for invalid types", () => {
      expect(isValidFlowStepType("swipe")).toBe(false);
      expect(isValidFlowStepType("click")).toBe(false);
      expect(isValidFlowStepType("")).toBe(false);
      expect(isValidFlowStepType("unknown")).toBe(false);
    });
  });

  describe("validateFlowStep", () => {
    it("rejects a step with missing type", () => {
      const step = {} as SemanticFlowStep;
      const err = validateFlowStep(step, 0);

      expect(err).toBe("step[0]: missing type");
    });

    it("rejects a step with unknown type", () => {
      const step = { type: "swipe" as SemanticFlowStep["type"] };
      const err = validateFlowStep(step, 0);

      expect(err).toBe('step[0]: unknown type "swipe"');
    });

    it("accepts a valid tap step with targetId", () => {
      const step: SemanticFlowStep = { type: "tap", targetId: "btn1" };

      expect(validateFlowStep(step, 0)).toBeNull();
    });

    it("rejects a tap step without targetId", () => {
      const step: SemanticFlowStep = { type: "tap" };

      expect(validateFlowStep(step, 0)).toBe("step[0]: tap requires targetId");
    });

    it("accepts a valid input step with targetId and value", () => {
      const step: SemanticFlowStep = {
        type: "input",
        targetId: "field1",
        value: "hello"
      };

      expect(validateFlowStep(step, 0)).toBeNull();
    });

    it("rejects an input step without value", () => {
      const step: SemanticFlowStep = { type: "input", targetId: "field1" };

      expect(validateFlowStep(step, 0)).toBe("step[0]: input requires value");
    });

    it("rejects an input step without targetId", () => {
      const step: SemanticFlowStep = { type: "input", value: "hello" };

      expect(validateFlowStep(step, 0)).toBe("step[0]: input requires targetId");
    });

    it("accepts a valid scroll step with targetId", () => {
      const step: SemanticFlowStep = {
        type: "scroll",
        targetId: "list1",
        direction: "down",
        amount: 200
      };

      expect(validateFlowStep(step, 0)).toBeNull();
    });

    it("rejects a scroll step without targetId", () => {
      const step: SemanticFlowStep = { type: "scroll" };

      expect(validateFlowStep(step, 0)).toBe("step[0]: scroll requires targetId");
    });

    it("accepts a valid navigate step with screen", () => {
      const step: SemanticFlowStep = { type: "navigate", screen: "settings" };

      expect(validateFlowStep(step, 0)).toBeNull();
    });

    it("accepts a navigate step with targetId instead of screen", () => {
      const step: SemanticFlowStep = { type: "navigate", targetId: "tab1" };

      expect(validateFlowStep(step, 0)).toBeNull();
    });

    it("rejects a navigate step without screen or targetId", () => {
      const step: SemanticFlowStep = { type: "navigate" };

      expect(validateFlowStep(step, 0)).toBe("step[0]: navigate requires screen or targetId");
    });

    it("accepts a valid waitFor step with conditions", () => {
      const conditions: WaitCondition[] = [
        { kind: "nodeVisible", nodeId: "modal" }
      ];
      const step: SemanticFlowStep = { type: "waitFor", conditions };

      expect(validateFlowStep(step, 0)).toBeNull();
    });

    it("rejects a waitFor step without conditions", () => {
      const step: SemanticFlowStep = { type: "waitFor" };

      expect(validateFlowStep(step, 0)).toBe("step[0]: waitFor requires conditions array");
    });

    it("rejects a waitFor step with empty conditions", () => {
      const step: SemanticFlowStep = { type: "waitFor", conditions: [] };

      expect(validateFlowStep(step, 0)).toBe("step[0]: waitFor requires conditions array");
    });

    it("rejects a waitFor condition with invalid kind", () => {
      const conditions = [
        { kind: "invalidKind" as WaitCondition["kind"], nodeId: "modal" }
      ];
      const step: SemanticFlowStep = { type: "waitFor", conditions };

      expect(validateFlowStep(step, 0)).toBe(
        'step[0].conditions[0]: invalid kind "invalidKind"'
      );
    });

    it("rejects a waitFor condition with missing nodeId", () => {
      const conditions = [
        { kind: "nodeExists" as const, nodeId: "" }
      ];
      const step: SemanticFlowStep = { type: "waitFor", conditions };

      expect(validateFlowStep(step, 0)).toBe(
        "step[0].conditions[0]: missing nodeId"
      );
    });

    it("accepts a valid assert step with conditions", () => {
      const conditions: WaitCondition[] = [
        { kind: "nodeState", nodeId: "label1", expected: { label: "Confirmed" } }
      ];
      const step: SemanticFlowStep = { type: "assert", conditions };

      expect(validateFlowStep(step, 0)).toBeNull();
    });

    it("accepts a valid observeEvents step", () => {
      const step: SemanticFlowStep = { type: "observeEvents" };

      expect(validateFlowStep(step, 0)).toBeNull();
    });
  });

  describe("validateFlow", () => {
    it("rejects a flow with missing name", () => {
      const flow: SemanticFlow = { name: "", steps: [], stopOnFailure: true };

      expect(validateFlow(flow)).toBe("flow missing name");
    });

    it("rejects a flow with missing steps array", () => {
      const flow = { name: "test", stopOnFailure: true } as SemanticFlow;

      expect(validateFlow(flow)).toBe("flow missing steps array");
    });

    it("rejects a flow with non-array steps", () => {
      const flow = {
        name: "test",
        steps: "not-an-array" as unknown as SemanticFlowStep[],
        stopOnFailure: true
      };

      expect(validateFlow(flow)).toBe("flow missing steps array");
    });

    it("rejects a flow with empty steps", () => {
      const flow: SemanticFlow = { name: "test", steps: [], stopOnFailure: true };

      expect(validateFlow(flow)).toBe("flow has no steps");
    });

    it("accepts a valid flow with a single tap step", () => {
      const flow: SemanticFlow = {
        name: "simple.tap",
        stopOnFailure: true,
        steps: [{ type: "tap", targetId: "btn1" }]
      };

      expect(validateFlow(flow)).toBeNull();
    });

    it("rejects a flow where a later step is invalid", () => {
      const flow: SemanticFlow = {
        name: "multi.step",
        stopOnFailure: true,
        steps: [
          { type: "tap", targetId: "btn1" },
          { type: "unknown" as SemanticFlowStep["type"] }
        ]
      };

      expect(validateFlow(flow)).toBe('step[1]: unknown type "unknown"');
    });

    it("accepts a complex multi-step flow", () => {
      const flow: SemanticFlow = {
        name: "checkout.happyPath",
        stopOnFailure: true,
        timeoutMs: 15000,
        steps: [
          { type: "navigate", screen: "checkout" },
          {
            type: "waitFor",
            conditions: [{ kind: "nodeVisible", nodeId: "checkout.screen" }]
          },
          {
            type: "assert",
            conditions: [
              { kind: "nodeVisible", nodeId: "checkout.cartSummary" }
            ]
          },
          { type: "input", targetId: "checkout.name", value: "Alex Rivera" },
          { type: "input", targetId: "checkout.email", value: "alex@example.com" },
          { type: "tap", targetId: "checkout.submit" },
          {
            type: "waitFor",
            conditions: [
              { kind: "nodeVisible", nodeId: "confirmation.screen" }
            ]
          }
        ]
      };

      expect(validateFlow(flow)).toBeNull();
    });

    it("accepts all valid condition kinds in waitFor", () => {
      const flow: SemanticFlow = {
        name: "all.conditions",
        stopOnFailure: true,
        steps: [
          {
            type: "waitFor",
            conditions: [
              { kind: "nodeExists", nodeId: "a" },
              { kind: "nodeVisible", nodeId: "b" },
              { kind: "nodeState", nodeId: "c", expected: { ready: true } },
              { kind: "nodeAbsent", nodeId: "d" }
            ]
          }
        ]
      };

      expect(validateFlow(flow)).toBeNull();
    });
  });

  describe("stepRequiresApproval", () => {
    it("returns false for tap step", () => {
      const step: SemanticFlowStep = { type: "tap", targetId: "checkout.submit" };

      expect(stepRequiresApproval(step)).toBe(false);
    });

    it("returns false for input step", () => {
      const step: SemanticFlowStep = { type: "input", targetId: "secure.card", value: "data" };

      expect(stepRequiresApproval(step)).toBe(false);
    });

    it("returns false for navigate step", () => {
      const step: SemanticFlowStep = { type: "navigate", screen: "other" };

      expect(stepRequiresApproval(step)).toBe(false);
    });
  });

  describe("createFlowRunner", () => {
    it("returns a function", () => {
      const runFlow = createFlowRunner();

      expect(typeof runFlow).toBe("function");
    });

    it("runs all steps and returns a completed result", async () => {
      const runFlow = createFlowRunner();
      const dispatched: SemanticFlowStep[] = [];
      const dispatch = async (step: SemanticFlowStep) => {
        dispatched.push(step);

        return { ok: true };
      };

      const flow: SemanticFlow = {
        name: "happy.path",
        stopOnFailure: true,
        steps: [
          { type: "tap", targetId: "btn1" },
          { type: "tap", targetId: "btn2" },
          { type: "input", targetId: "field1", value: "text" }
        ]
      };

      const result = await runFlow(flow, dispatch);

      expect(result.flowName).toBe("happy.path");
      expect(result.completed).toBe(true);
      expect(result.totalSteps).toBe(3);
      expect(result.completedSteps).toBe(3);
      expect(result.durationMs).toBeGreaterThanOrEqual(0);
      expect(result.error).toBeUndefined();
      expect(result.failedStep).toBeUndefined();
      expect(result.failedStepType).toBeUndefined();
      expect(dispatched).toHaveLength(3);
      expect(dispatched[0]).toEqual({ type: "tap", targetId: "btn1" });
      expect(dispatched[1]).toEqual({ type: "tap", targetId: "btn2" });
      expect(dispatched[2]).toEqual({ type: "input", targetId: "field1", value: "text" });
    });

    it("stops on first failure when stopOnFailure is true", async () => {
      const runFlow = createFlowRunner();
      const dispatched: SemanticFlowStep[] = [];
      const dispatch = async (step: SemanticFlowStep) => {
        dispatched.push(step);

        if (step.targetId === "btn2") {
          return { ok: false, error: "node not found" };
        }

        return { ok: true };
      };

      const flow: SemanticFlow = {
        name: "fail.mid",
        stopOnFailure: true,
        steps: [
          { type: "tap", targetId: "btn1" },
          { type: "tap", targetId: "btn2" },
          { type: "tap", targetId: "btn3" }
        ]
      };

      const result = await runFlow(flow, dispatch);

      expect(result.completed).toBe(false);
      expect(result.totalSteps).toBe(3);
      expect(result.completedSteps).toBe(1);
      expect(result.failedStep).toBe(1);
      expect(result.failedStepType).toBe("tap");
      expect(result.error).toBe("node not found");
      expect(dispatched).toHaveLength(2);
    });

    it("includes step type in failedStepType on failure", async () => {
      const runFlow = createFlowRunner();
      const dispatch = async (_step: SemanticFlowStep) => {
        return { ok: false, error: "input error" };
      };

      const flow: SemanticFlow = {
        name: "input.fail",
        stopOnFailure: true,
        steps: [{ type: "input", targetId: "field1", value: "text" }]
      };

      const result = await runFlow(flow, dispatch);

      expect(result.failedStepType).toBe("input");
    });

    it("reports default error message when dispatch returns no error", async () => {
      const runFlow = createFlowRunner();
      const dispatch = async (_step: SemanticFlowStep) => {
        return { ok: false };
      };

      const flow: SemanticFlow = {
        name: "no.error.message",
        stopOnFailure: true,
        steps: [{ type: "tap", targetId: "btn1" }]
      };

      const result = await runFlow(flow, dispatch);

      expect(result.error).toBe("step[0] tap failed");
    });

    it("clears pending timeout handles after a successful step", async () => {
      jest.useFakeTimers();

      const runFlow = createFlowRunner();
      const dispatch = async (_step: SemanticFlowStep) => ({ ok: true });
      const flow: SemanticFlow = {
        name: "cleanup.success",
        stopOnFailure: true,
        steps: [{ type: "tap", targetId: "btn1" }]
      };

      const result = await runFlow(flow, dispatch, { timeoutMs: 200 });

      expect(result.completed).toBe(true);
      expect(jest.getTimerCount()).toBe(0);

      jest.useRealTimers();
    });

    it("clears pending timeout handles after a failed step", async () => {
      jest.useFakeTimers();

      const runFlow = createFlowRunner();
      const dispatch = async (_step: SemanticFlowStep) => ({ ok: false, error: "node not found" });
      const flow: SemanticFlow = {
        name: "cleanup.failure",
        stopOnFailure: true,
        steps: [{ type: "tap", targetId: "btn1" }]
      };

      const result = await runFlow(flow, dispatch, { timeoutMs: 200 });

      expect(result.completed).toBe(false);
      expect(result.error).toBe("node not found");
      expect(jest.getTimerCount()).toBe(0);

      jest.useRealTimers();
    });

    it("times out a step that exceeds per-step timeout", async () => {
      jest.useFakeTimers();

      const runFlow = createFlowRunner();
      const dispatch = async (_step: SemanticFlowStep): Promise<{ ok: boolean; error?: string }> => {
        return new Promise<{ ok: boolean; error?: string }>(() => {}); // never resolves
      };

      const flow: SemanticFlow = {
        name: "timeout.flow",
        stopOnFailure: true,
        steps: [{ type: "tap", targetId: "btn1" }]
      };

      const resultPromise = runFlow(flow, dispatch, { timeoutMs: 200 });
      jest.advanceTimersByTime(250);

      const result = await resultPromise;

      expect(result.completed).toBe(false);
      expect(result.error).toContain("timed out after 200ms");
      expect(result.failedStep).toBe(0);
      expect(result.failedStepType).toBe("tap");

      jest.useRealTimers();
    });

    it("uses flow-level timeoutMs when no options timeout is provided", async () => {
      jest.useFakeTimers();

      const runFlow = createFlowRunner();
      const dispatch = async (_step: SemanticFlowStep): Promise<{ ok: boolean; error?: string }> => {
        return new Promise<{ ok: boolean; error?: string }>(() => {});
      };

      const flow: SemanticFlow = {
        name: "flow.timeout",
        stopOnFailure: true,
        timeoutMs: 300,
        steps: [{ type: "assert", conditions: [{ kind: "nodeExists", nodeId: "x" }] }]
      };

      const resultPromise = runFlow(flow, dispatch);
      jest.advanceTimersByTime(350);

      const result = await resultPromise;

      expect(result.error).toContain("timed out after 300ms");

      jest.useRealTimers();
    });

    it("records durationMs in the result", async () => {
      const runFlow = createFlowRunner();
      const dispatch = async (_step: SemanticFlowStep) => {
        return { ok: true };
      };

      const flow: SemanticFlow = {
        name: "single.step",
        stopOnFailure: true,
        steps: [{ type: "navigate", screen: "home" }]
      };

      const result = await runFlow(flow, dispatch);

      expect(result.durationMs).toBeGreaterThanOrEqual(0);
      expect(typeof result.durationMs).toBe("number");
    });

    it("handles a flow with only navigate and observeEvents steps", async () => {
      const runFlow = createFlowRunner();
      const dispatched: SemanticFlowStep[] = [];
      const dispatch = async (step: SemanticFlowStep) => {
        dispatched.push(step);

        return { ok: true };
      };

      const flow: SemanticFlow = {
        name: "nav.only",
        stopOnFailure: true,
        steps: [
          { type: "navigate", screen: "settings" },
          { type: "observeEvents", value: "tap,input" },
          { type: "assert", conditions: [{ kind: "nodeExists", nodeId: "x" }] }
        ]
      };

      const result = await runFlow(flow, dispatch);

      expect(result.completed).toBe(true);
      expect(result.totalSteps).toBe(3);
      expect(result.completedSteps).toBe(3);
      expect(dispatched).toHaveLength(3);
    });

    it("handles a flow with a single step", async () => {
      const runFlow = createFlowRunner();
      const dispatch = async (_step: SemanticFlowStep) => ({ ok: true });

      const flow: SemanticFlow = {
        name: "single",
        stopOnFailure: true,
        steps: [{ type: "tap", targetId: "btn1" }]
      };

      const result = await runFlow(flow, dispatch);

      expect(result.completed).toBe(true);
      expect(result.totalSteps).toBe(1);
      expect(result.completedSteps).toBe(1);
    });

    it("handles caught exceptions in dispatch", async () => {
      const runFlow = createFlowRunner();
      const dispatch = async (_step: SemanticFlowStep) => {
        throw new Error("unexpected crash");
      };

      const flow: SemanticFlow = {
        name: "crash.flow",
        stopOnFailure: true,
        steps: [{ type: "tap", targetId: "btn1" }]
      };

      const result = await runFlow(flow, dispatch);

      expect(result.completed).toBe(false);
      expect(result.error).toBe("unexpected crash");
      expect(result.failedStep).toBe(0);
    });
  });

  describe("SemanticFlow type compatibility", () => {
    it("accepts a checkout flow shape matching the example schema", () => {
      const checkoutFlow: SemanticFlow = {
        name: "checkout.happyPath",
        stopOnFailure: true,
        timeoutMs: 15000,
        steps: [
          {
            type: "assert",
            conditions: [
              { kind: "nodeExists", nodeId: "checkout" },
              {
                kind: "nodeState",
                nodeId: "checkout.confirm",
                expected: { disabled: false }
              }
            ]
          },
          {
            type: "input",
            targetId: "checkout.shipping.name",
            value: "Jane Smith"
          },
          {
            type: "input",
            targetId: "checkout.shipping.address",
            value: "456 Oak Avenue"
          },
          {
            type: "input",
            targetId: "checkout.payment.cardnumber",
            value: "$CARD_FIXTURE"
          },
          { type: "tap", targetId: "checkout.confirm" },
          {
            type: "waitFor",
            conditions: [
              { kind: "nodeVisible", nodeId: "orderConfirmation.screen" },
              {
                kind: "nodeState",
                nodeId: "orderConfirmation.statusLabel",
                expected: { label: "Confirmed" }
              }
            ]
          }
        ]
      };

      expect(checkoutFlow.name).toBe("checkout.happyPath");
      expect(checkoutFlow.stopOnFailure).toBe(true);
      expect(checkoutFlow.timeoutMs).toBe(15000);
      expect(checkoutFlow.steps).toHaveLength(6);

      const validation = validateFlow(checkoutFlow);

      expect(validation).toBeNull();
    });

    it("accepts a scroll step with all optional fields", () => {
      const step: SemanticFlowStep = {
        type: "scroll",
        targetId: "list.scrollContainer",
        direction: "up",
        amount: 300
      };

      expect(validateFlowStep(step, 0)).toBeNull();
      expect(step.direction).toBe("up");
      expect(step.amount).toBe(300);
    });
  });
});
