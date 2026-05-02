export type HealProposal = {
  originalSelector: string;
  suggestedSelector?: string;
  confidence: number;
  reason: string;
};

export type HealResult = {
  proposals: HealProposal[];
  flowName: string;
  failedSteps: number;
};

export function generateHealProposals(
  flowJson: {
    flow: { name: string; steps: Array<{ type: string; targetId?: string }> };
  },
  results: { failedSteps: number[]; errors: string[] }
): HealResult {
  const proposals: HealProposal[] = [];

  for (const stepIdx of results.failedSteps) {
    const step = flowJson.flow.steps[stepIdx];
    if (!step || !step.targetId) continue;

    const id = step.targetId;

    proposals.push({
      originalSelector: id,
      confidence: 0,
      reason: `Step ${stepIdx + 1}: selector "${id}" not found. Check that the semantic ID exists in the current screen and matches the expected hierarchy. Verify with inspectTree.`
    });
  }

  return {
    proposals,
    flowName: flowJson.flow.name,
    failedSteps: results.failedSteps.length
  };
}
