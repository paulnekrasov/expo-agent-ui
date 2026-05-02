type PatchChangeKind = "add_prop" | "remove_prop" | "change_prop" | "add_component" | "remove_component";

type PatchChange = {
  kind: PatchChangeKind;
  targetId: string;
  propName?: string;
  propValue?: unknown;
  oldValue?: unknown;
  reason: string;
};

type PatchProposal = {
  id: string;
  title: string;
  description: string;
  source: "flow_failure" | "accessibility_audit" | "semantic_audit" | "agent_request";
  changes: PatchChange[];
  autoApply: false;
  requiresApproval: true;
  createdAt: string;
};

type PatchValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

const VALID_CHANGE_KINDS: PatchChangeKind[] = ["add_prop", "remove_prop", "change_prop", "add_component", "remove_component"];

function isValidPatchChangeKind(kind: string): kind is PatchChangeKind {
  return (VALID_CHANGE_KINDS as string[]).includes(kind);
}

function validatePatchChange(change: PatchChange, index: number): string | null {
  if (!change.kind) return `change[${index}]: missing kind`;
  if (!isValidPatchChangeKind(change.kind)) return `change[${index}]: invalid kind "${change.kind}"`;
  if (!change.targetId) return `change[${index}]: missing targetId`;
  if (!change.reason) return `change[${index}]: missing reason`;
  if ((change.kind === "add_prop" || change.kind === "change_prop") && !change.propName) {
    return `change[${index}]: ${change.kind} requires propName`;
  }
  return null;
}

function validatePatchProposal(proposal: PatchProposal): PatchValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!proposal.id) errors.push("proposal missing id");
  if (!proposal.title) errors.push("proposal missing title");
  if (!proposal.description) errors.push("proposal missing description");
  if (!proposal.changes || !Array.isArray(proposal.changes) || proposal.changes.length === 0) {
    errors.push("proposal must have at least one change");
  }
  if (proposal.autoApply !== false) errors.push("autoApply must be false — never auto-apply patches");
  if (!proposal.createdAt) errors.push("proposal missing createdAt");

  if (proposal.changes && Array.isArray(proposal.changes)) {
    for (let i = 0; i < proposal.changes.length; i++) {
      const err = validatePatchChange(proposal.changes[i]!, i);
      if (err) errors.push(err);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

function createPatchProposal(
  source: PatchProposal["source"],
  changes: PatchChange[],
  overrides?: Partial<Pick<PatchProposal, "title" | "description">>
): PatchProposal {
  const id = `patch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    title: overrides?.title || `Patch proposal from ${source}`,
    description: overrides?.description || `Proposed ${changes.length} change(s) based on ${source}`,
    source,
    changes,
    autoApply: false,
    requiresApproval: true,
    createdAt: new Date().toISOString(),
  };
}

function mergePatchProposals(proposals: PatchProposal[]): PatchProposal {
  const allChanges: PatchChange[] = [];
  for (const p of proposals) {
    allChanges.push(...p.changes);
  }
  return createPatchProposal("agent_request", allChanges, {
    title: `Merged patch: ${proposals.map(p => p.title).join(", ")}`,
    description: `Combined ${proposals.length} patch proposals with ${allChanges.length} total changes`,
  });
}

export type {
  PatchChangeKind,
  PatchChange,
  PatchProposal,
  PatchValidationResult,
};

export {
  VALID_CHANGE_KINDS,
  isValidPatchChangeKind,
  validatePatchChange,
  validatePatchProposal,
  createPatchProposal,
  mergePatchProposals,
};
