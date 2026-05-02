import {
  isValidPatchChangeKind,
  validatePatchChange,
  validatePatchProposal,
  createPatchProposal,
  mergePatchProposals,
} from "@agent-ui/core";
import type { PatchChange, PatchProposal } from "@agent-ui/core";

describe("patching", () => {
  describe("isValidPatchChangeKind", () => {
    it("returns true for all valid change kinds", () => {
      expect(isValidPatchChangeKind("add_prop")).toBe(true);
      expect(isValidPatchChangeKind("remove_prop")).toBe(true);
      expect(isValidPatchChangeKind("change_prop")).toBe(true);
      expect(isValidPatchChangeKind("add_component")).toBe(true);
      expect(isValidPatchChangeKind("remove_component")).toBe(true);
    });

    it("returns false for invalid change kinds", () => {
      expect(isValidPatchChangeKind("invalid")).toBe(false);
      expect(isValidPatchChangeKind("")).toBe(false);
      expect(isValidPatchChangeKind("insert_prop")).toBe(false);
    });
  });

  describe("validatePatchChange", () => {
    it("returns null for a valid change", () => {
      const change: PatchChange = {
        kind: "add_prop",
        targetId: "test.button",
        propName: "id",
        reason: "needs stable id",
      };
      expect(validatePatchChange(change, 0)).toBeNull();
    });

    it("returns error string for missing kind", () => {
      const change = { targetId: "test", reason: "reason" } as PatchChange;
      const result = validatePatchChange(change, 0);
      expect(result).toContain("missing kind");
    });

    it("returns error string for invalid kind", () => {
      const change = {
        kind: "bad_kind",
        targetId: "test",
        reason: "reason",
      } as unknown as PatchChange;
      const result = validatePatchChange(change, 0);
      expect(result).toContain("invalid kind");
    });

    it("returns error string for missing targetId", () => {
      const change: PatchChange = {
        kind: "add_prop",
        targetId: "",
        reason: "reason",
      };
      const result = validatePatchChange(change, 0);
      expect(result).toContain("missing targetId");
    });

    it("returns error string for missing reason", () => {
      const change: PatchChange = {
        kind: "add_prop",
        targetId: "test",
        reason: "",
      };
      const result = validatePatchChange(change, 0);
      expect(result).toContain("missing reason");
    });

    it("returns error string when add_prop misses propName", () => {
      const change: PatchChange = {
        kind: "add_prop",
        targetId: "test",
        reason: "reason",
      };
      const result = validatePatchChange(change, 0);
      expect(result).toContain("requires propName");
    });

    it("returns error string when change_prop misses propName", () => {
      const change: PatchChange = {
        kind: "change_prop",
        targetId: "test",
        reason: "reason",
      };
      const result = validatePatchChange(change, 0);
      expect(result).toContain("requires propName");
    });
  });

  describe("validatePatchProposal", () => {
    function validProposal(): PatchProposal {
      return {
        id: "patch-123",
        title: "Test Proposal",
        description: "A test proposal",
        source: "semantic_audit",
        changes: [
          {
            kind: "add_prop",
            targetId: "test.button",
            propName: "id",
            reason: "needs stable id",
          },
        ],
        autoApply: false,
        requiresApproval: true,
        createdAt: new Date().toISOString(),
      };
    }

    it("returns valid:true for a fully valid proposal", () => {
      const result = validatePatchProposal(validProposal());
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("returns error for missing id", () => {
      const proposal = { ...validProposal(), id: "" };
      const result = validatePatchProposal(proposal);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("proposal missing id");
    });

    it("returns error for missing title", () => {
      const proposal = { ...validProposal(), title: "" };
      const result = validatePatchProposal(proposal);
      expect(result.errors).toContain("proposal missing title");
    });

    it("returns error for missing description", () => {
      const proposal = { ...validProposal(), description: "" };
      const result = validatePatchProposal(proposal);
      expect(result.errors).toContain("proposal missing description");
    });

    it("returns error for empty changes array", () => {
      const proposal = { ...validProposal(), changes: [] };
      const result = validatePatchProposal(proposal);
      expect(result.errors).toContain("proposal must have at least one change");
    });

    it("returns error when autoApply is not false", () => {
      const proposal = { ...validProposal(), autoApply: true as false };
      const result = validatePatchProposal(proposal);
      expect(result.errors).toContain("autoApply must be false — never auto-apply patches");
    });

    it("returns error for missing createdAt", () => {
      const proposal = { ...validProposal(), createdAt: "" };
      const result = validatePatchProposal(proposal);
      expect(result.errors).toContain("proposal missing createdAt");
    });
  });

  describe("createPatchProposal", () => {
    it("returns proposal with correct shape", () => {
      const changes: PatchChange[] = [
        { kind: "add_prop", targetId: "test.button", reason: "needs id" },
      ];
      const proposal = createPatchProposal("semantic_audit", changes);

      expect(proposal.id).toMatch(/^patch-\d+-\w+$/);
      expect(proposal.title).toBe("Patch proposal from semantic_audit");
      expect(proposal.source).toBe("semantic_audit");
      expect(proposal.changes).toEqual(changes);
      expect(proposal.autoApply).toBe(false);
      expect(proposal.requiresApproval).toBe(true);
      expect(proposal.createdAt).toBeTruthy();
    });

    it("accepts overrides for title and description", () => {
      const changes: PatchChange[] = [
        { kind: "add_prop", targetId: "test", reason: "r" },
      ];
      const proposal = createPatchProposal("agent_request", changes, {
        title: "Custom Title",
        description: "Custom Description",
      });

      expect(proposal.title).toBe("Custom Title");
      expect(proposal.description).toBe("Custom Description");
    });
  });

  describe("mergePatchProposals", () => {
    it("combines changes from multiple proposals", () => {
      const p1: PatchProposal = {
        id: "p1",
        title: "One",
        description: "First",
        source: "semantic_audit",
        changes: [{ kind: "add_prop", targetId: "a", reason: "r1" }],
        autoApply: false,
        requiresApproval: true,
        createdAt: new Date().toISOString(),
      };

      const p2: PatchProposal = {
        id: "p2",
        title: "Two",
        description: "Second",
        source: "accessibility_audit",
        changes: [
          { kind: "change_prop", targetId: "b", propName: "x", reason: "r2" },
        ],
        autoApply: false,
        requiresApproval: true,
        createdAt: new Date().toISOString(),
      };

      const merged = mergePatchProposals([p1, p2]);

      expect(merged.changes).toHaveLength(2);
      expect(merged.changes[0]!.targetId).toBe("a");
      expect(merged.changes[1]!.targetId).toBe("b");
      expect(merged.title).toContain("Merged patch");
      expect(merged.description).toContain("Combined 2 patch proposals");
      expect(merged.autoApply).toBe(false);
      expect(merged.requiresApproval).toBe(true);
    });
  });
});
