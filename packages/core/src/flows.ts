type WaitConditionKind = "nodeExists" | "nodeVisible" | "nodeState" | "nodeAbsent";

type WaitCondition = {
  kind: WaitConditionKind;
  nodeId: string;
  expected?: Record<string, unknown>;
};

type SemanticFlowStepType =
  | "tap"
  | "input"
  | "scroll"
  | "navigate"
  | "waitFor"
  | "assert"
  | "observeEvents";

type SemanticFlowStep = {
  type: SemanticFlowStepType;
  targetId?: string;
  value?: string;
  conditions?: WaitCondition[];
  screen?: string;
  direction?: "up" | "down" | "left" | "right";
  amount?: number;
};

type SemanticFlow = {
  name: string;
  steps: SemanticFlowStep[];
  stopOnFailure: boolean;
  timeoutMs?: number;
};

type FlowRunnerResult = {
  flowName: string;
  completed: boolean;
  totalSteps: number;
  completedSteps: number;
  failedStep?: number;
  failedStepType?: string;
  durationMs: number;
  error?: string;
};

const VALID_STEP_TYPES: ReadonlySet<string> = new Set([
  "tap",
  "input",
  "scroll",
  "navigate",
  "waitFor",
  "assert",
  "observeEvents"
]);

const VALID_CONDITION_KINDS: ReadonlySet<string> = new Set([
  "nodeExists",
  "nodeVisible",
  "nodeState",
  "nodeAbsent"
]);

function isValidFlowStepType(type: string): type is SemanticFlowStepType {
  return VALID_STEP_TYPES.has(type);
}

function validateFlowStep(step: SemanticFlowStep, index: number): string | null {
  if (!step.type) {
    return `step[${index}]: missing type`;
  }

  if (!isValidFlowStepType(step.type)) {
    return `step[${index}]: unknown type "${step.type}"`;
  }

  if (
    (step.type === "tap" || step.type === "input" || step.type === "scroll") &&
    !step.targetId
  ) {
    return `step[${index}]: ${step.type} requires targetId`;
  }

  if (step.type === "input" && step.value === undefined) {
    return `step[${index}]: input requires value`;
  }

  if (step.type === "waitFor" || step.type === "assert") {
    if (!step.conditions || step.conditions.length === 0) {
      return `step[${index}]: ${step.type} requires conditions array`;
    }

    for (let ci = 0; ci < step.conditions.length; ci++) {
      const c = step.conditions[ci];

      if (c === undefined) {
        continue;
      }

      if (!c.kind || !VALID_CONDITION_KINDS.has(c.kind)) {
        return `step[${index}].conditions[${ci}]: invalid kind "${String(c.kind)}"`;
      }

      if (!c.nodeId) {
        return `step[${index}].conditions[${ci}]: missing nodeId`;
      }
    }
  }

  if (step.type === "navigate" && !step.screen && !step.targetId) {
    return `step[${index}]: navigate requires screen or targetId`;
  }

  return null;
}

function validateFlow(flow: SemanticFlow): string | null {
  if (!flow.name) {
    return "flow missing name";
  }

  if (!flow.steps || !Array.isArray(flow.steps)) {
    return "flow missing steps array";
  }

  if (flow.steps.length === 0) {
    return "flow has no steps";
  }

  for (let i = 0; i < flow.steps.length; i++) {
    const step = flow.steps[i];

    if (step === undefined) {
      return `step[${i}]: undefined step`;
    }

    const err = validateFlowStep(step, i);

    if (err) {
      return err;
    }
  }

  return null;
}

function stepRequiresApproval(_step: SemanticFlowStep): boolean {
  return false;
}

type StepDispatcher = (
  step: SemanticFlowStep
) => Promise<{ ok: boolean; error?: string | undefined }>;

const DEFAULT_PER_STEP_TIMEOUT_MS = 5000;

function createFlowRunner(): (
  flow: SemanticFlow,
  dispatch: StepDispatcher,
  options?: { timeoutMs?: number }
) => Promise<FlowRunnerResult> {
  return async function runFlow(
    flow: SemanticFlow,
    dispatch: StepDispatcher,
    options?: { timeoutMs?: number }
  ): Promise<FlowRunnerResult> {
    const startTime = Date.now();
    const perStepTimeout =
      options?.timeoutMs ?? flow.timeoutMs ?? DEFAULT_PER_STEP_TIMEOUT_MS;

    let completedSteps = 0;

    for (let i = 0; i < flow.steps.length; i++) {
      const step = flow.steps[i];

      if (step === undefined) {
        return {
          flowName: flow.name,
          completed: false,
          totalSteps: flow.steps.length,
          completedSteps: i,
          failedStep: i,
          durationMs: Date.now() - startTime,
          error: `step[${i}]: undefined step`
        };
      }

      let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

      try {
        let rejectStep: (error: Error) => void = () => {};
        const timeoutPromise = new Promise<never>((_, reject) => {
          rejectStep = reject;
        });
        timeoutHandle = setTimeout(() => {
          // Reject the raced promise when a step never settles.
          rejectStep(new Error("TIMEOUT"));
        }, perStepTimeout);

        const result = await Promise.race([dispatch(step), timeoutPromise]);
        clearTimeout(timeoutHandle);

        if (!result.ok) {
          return {
            flowName: flow.name,
            completed: false,
            totalSteps: flow.steps.length,
            completedSteps: i,
            failedStep: i,
            failedStepType: step.type,
            durationMs: Date.now() - startTime,
            error: result.error ?? `step[${i}] ${step.type} failed`
          };
        }

        completedSteps = i + 1;
      } catch (err: unknown) {
        if (timeoutHandle !== undefined) {
          clearTimeout(timeoutHandle);
        }
        const msg = err instanceof Error ? err.message : String(err);
        const isTimeout = msg === "TIMEOUT";

        return {
          flowName: flow.name,
          completed: false,
          totalSteps: flow.steps.length,
          completedSteps: i,
          failedStep: i,
          failedStepType: step.type,
          durationMs: Date.now() - startTime,
          error: isTimeout
            ? `step[${i}] ${step.type} timed out after ${perStepTimeout}ms`
            : msg
        };
      }
    }

    return {
      flowName: flow.name,
      completed: true,
      totalSteps: flow.steps.length,
      completedSteps,
      durationMs: Date.now() - startTime
    };
  };
}

export type {
  WaitConditionKind,
  WaitCondition,
  SemanticFlowStepType,
  SemanticFlowStep,
  SemanticFlow,
  FlowRunnerResult
};

export {
  isValidFlowStepType,
  validateFlowStep,
  validateFlow,
  stepRequiresApproval,
  createFlowRunner
};
