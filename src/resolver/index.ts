import { log } from "../extension/outputChannel";
import type { ViewNode } from "../ir/types";
import { flattenModifiers } from "./modifierFlattener";
import { applyStateStubs } from "./stateStubber";

export type ResolverStage = (nodes: ViewNode[]) => ViewNode[];
export type ResolverLogger = (message: string) => void;

export interface ResolveViewTreeOptions {
  stateStubber?: ResolverStage;
  modifierFlattener?: ResolverStage;
  logger?: ResolverLogger;
}

type ResolverStageResult =
  | { failed: false; nodes: ViewNode[] }
  | { failed: true; nodes: ViewNode[] };

function formatResolverError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function defaultLogger(message: string): void {
  log(`WARNING: ${message}`);
}

function runResolverStage(
  stageName: string,
  nodes: ViewNode[],
  stage: ResolverStage,
  logger: ResolverLogger
): ResolverStageResult {
  try {
    return {
      failed: false,
      nodes: stage(nodes),
    };
  } catch (error) {
    logger(
      `Stage 3 ${stageName} failed; returning the original view tree unmodified. ${formatResolverError(error)}`
    );

    return {
      failed: true,
      nodes,
    };
  }
}

export function resolveViewTree(
  nodes: ViewNode[],
  options: ResolveViewTreeOptions = {}
): ViewNode[] {
  const logger = options.logger ?? defaultLogger;
  const originalNodes = nodes;

  const stubbedNodes = runResolverStage(
    "state stubber",
    originalNodes,
    options.stateStubber ?? applyStateStubs,
    logger
  );
  if (stubbedNodes.failed) {
    return originalNodes;
  }

  const flattenedNodes = runResolverStage(
    "modifier flattener",
    stubbedNodes.nodes,
    options.modifierFlattener ?? flattenModifiers,
    logger
  );
  if (flattenedNodes.failed) {
    return originalNodes;
  }

  return flattenedNodes.nodes;
}

export { applyStateStubs } from "./stateStubber";
export { flattenModifiers } from "./modifierFlattener";
