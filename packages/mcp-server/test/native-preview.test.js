const {
  computeCapabilityDiff,
  computeSemanticIdDiff,
  computeDiagnosticDiff,
  createSideBySideComparison
} = require("../dist/native-preview");

function makeCapabilities(overrides = {}) {
  return {
    button: true,
    toggle: true,
    textField: true,
    secureField: true,
    slider: true,
    picker: false,
    host: true,
    rnHostView: true,
    list: false,
    form: false,
    section: false,
    bottomSheet: false,
    popover: false,
    menu: false,
    ...overrides
  };
}

function makeAdapter({
  tier = 2,
  platform = "ios",
  name = "SwiftUI Adapter",
  isAvailable = true,
  isExpoGo = false,
  capabilities
} = {}) {
  const caps = capabilities ?? makeCapabilities();
  return {
    tier,
    platform,
    name,
    isAvailable,
    isExpoGo,
    capabilities: caps,
    capabilityCount: Object.values(caps).filter(Boolean).length
  };
}

function makeSession({
  sessionId = "sess-1",
  platform = "ios",
  adapter,
  connectedAt = "2025-01-01T00:00:00Z",
  uptimeMs = 60000,
  semanticNodeCount = 42,
  screenCount = 3,
  reducible = true
} = {}) {
  return {
    sessionId,
    platform,
    adapter: adapter ?? makeAdapter({ platform }),
    connectedAt,
    uptimeMs,
    semanticNodeCount,
    screenCount,
    reducible
  };
}

describe("computeCapabilityDiff", () => {
  it("returns all matching when capabilities are identical", () => {
    const ios = makeCapabilities();
    const android = makeCapabilities();
    const diffs = computeCapabilityDiff(ios, android);

    expect(diffs.length).toBe(14);
    for (const d of diffs) {
      expect(d.match).toBe(true);
    }
  });

  it("returns all differing when capabilities are opposites", () => {
    const ios = makeCapabilities({ button: false, toggle: true });
    const android = makeCapabilities({ button: true, toggle: false });
    const diffs = computeCapabilityDiff(ios, android);

    const buttonDiff = diffs.find((d) => d.flag === "button");
    const toggleDiff = diffs.find((d) => d.flag === "toggle");

    expect(buttonDiff).toBeDefined();
    expect(buttonDiff.match).toBe(false);
    expect(buttonDiff.ios).toBe(false);
    expect(buttonDiff.android).toBe(true);

    expect(toggleDiff).toBeDefined();
    expect(toggleDiff.match).toBe(false);
    expect(toggleDiff.ios).toBe(true);
    expect(toggleDiff.android).toBe(false);

    const matchingCount = diffs.filter((d) => d.flag !== "button" && d.flag !== "toggle" && d.match).length;
    expect(matchingCount).toBe(12);
  });
});

describe("computeSemanticIdDiff", () => {
  it("returns match for identical ids with same type", () => {
    const ios = [{ id: "btn-1", type: "button", label: "Submit" }];
    const android = [{ id: "btn-1", type: "button", label: "Submit" }];
    const diffs = computeSemanticIdDiff(ios, android);

    expect(diffs.length).toBe(1);
    expect(diffs[0].status).toBe("match");
  });

  it("returns missing_ios when only android has the id", () => {
    const ios = [];
    const android = [{ id: "btn-1", type: "button", label: "Submit" }];
    const diffs = computeSemanticIdDiff(ios, android);

    expect(diffs.length).toBe(1);
    expect(diffs[0].status).toBe("missing_ios");
    expect(diffs[0].ios).toBeUndefined();
    expect(diffs[0].android).toBeDefined();
    expect(diffs[0].android.type).toBe("button");
  });

  it("returns missing_android when only ios has the id", () => {
    const ios = [{ id: "btn-1", type: "button", label: "Submit" }];
    const android = [];
    const diffs = computeSemanticIdDiff(ios, android);

    expect(diffs.length).toBe(1);
    expect(diffs[0].status).toBe("missing_android");
    expect(diffs[0].android).toBeUndefined();
    expect(diffs[0].ios).toBeDefined();
    expect(diffs[0].ios.type).toBe("button");
  });

  it("returns type_mismatch when same id has different types", () => {
    const ios = [{ id: "btn-1", type: "button" }];
    const android = [{ id: "btn-1", type: "toggle" }];
    const diffs = computeSemanticIdDiff(ios, android);

    expect(diffs.length).toBe(1);
    expect(diffs[0].status).toBe("type_mismatch");
    expect(diffs[0].ios.type).toBe("button");
    expect(diffs[0].android.type).toBe("toggle");
  });

  it("returns empty array for empty inputs", () => {
    const diffs = computeSemanticIdDiff([], []);
    expect(diffs).toEqual([]);
  });
});

describe("computeDiagnosticDiff", () => {
  it("returns all matching when diagnostics are identical", () => {
    const ios = makeSession({ semanticNodeCount: 42, screenCount: 3, reducible: true });
    const android = makeSession({ semanticNodeCount: 42, screenCount: 3, reducible: true });
    const diffs = computeDiagnosticDiff(ios, android);

    expect(diffs.length).toBe(3);
    for (const d of diffs) {
      expect(d.match).toBe(true);
    }
  });

  it("returns mismatches when diagnostics differ", () => {
    const ios = makeSession({ semanticNodeCount: 42, screenCount: 3, reducible: true });
    const android = makeSession({ semanticNodeCount: 20, screenCount: 2, reducible: false });
    const diffs = computeDiagnosticDiff(ios, android);

    expect(diffs.length).toBe(3);
    for (const d of diffs) {
      expect(d.match).toBe(false);
    }

    const nodeDiff = diffs.find((d) => d.field === "semanticNodeCount");
    expect(nodeDiff.ios).toBe(42);
    expect(nodeDiff.android).toBe(20);

    const screenDiff = diffs.find((d) => d.field === "screenCount");
    expect(screenDiff.ios).toBe(3);
    expect(screenDiff.android).toBe(2);
  });
});

describe("createSideBySideComparison", () => {
  it("generates a valid comparison with correct summary counts for fully matching sessions", () => {
    const ios = makeSession({ sessionId: "sess-ios-1", platform: "ios" });
    const android = makeSession({ sessionId: "sess-android-1", platform: "android" });
    const iosIds = [
      { id: "btn-1", type: "button", label: "Submit" },
      { id: "field-1", type: "textField", label: "Name" }
    ];
    const androidIds = [
      { id: "btn-1", type: "button", label: "Submit" },
      { id: "field-1", type: "textField", label: "Name" }
    ];

    const comparison = createSideBySideComparison(ios, android, iosIds, androidIds);

    expect(comparison.comparisonId).toEqual(expect.stringMatching(/^cmp-/));
    expect(comparison.createdAt).toEqual(expect.stringContaining("T"));
    expect(comparison.iosSession.sessionId).toBe("sess-ios-1");
    expect(comparison.iosSession.platform).toBe("ios");
    expect(comparison.androidSession.sessionId).toBe("sess-android-1");
    expect(comparison.androidSession.platform).toBe("android");

    expect(comparison.summary.totalSemanticIds).toBe(2);
    expect(comparison.summary.matchingIds).toBe(2);
    expect(comparison.summary.mismatchedIds).toBe(0);
    expect(comparison.summary.totalCapabilities).toBe(14);
    expect(comparison.summary.matchingCapabilities).toBe(14);
    expect(comparison.summary.mismatchedCapabilities).toBe(0);
    expect(comparison.summary.overallMatch).toBe(true);

    expect(comparison.semanticIdDiffs.length).toBe(2);
    for (const d of comparison.semanticIdDiffs) {
      expect(d.status).toBe("match");
    }

    expect(comparison.capabilityDiffs.length).toBe(14);
    for (const d of comparison.capabilityDiffs) {
      expect(d.match).toBe(true);
    }

    expect(comparison.diagnosticDiffs.length).toBe(3);
  });

  it("correctly counts mismatches for non-matching sessions", () => {
    const ios = makeSession({
      sessionId: "sess-ios-2",
      platform: "ios",
      adapter: makeAdapter({
        platform: "ios",
        capabilities: makeCapabilities({ slider: true, picker: true })
      })
    });
    const android = makeSession({
      sessionId: "sess-android-2",
      platform: "android",
      adapter: makeAdapter({
        platform: "android",
        capabilities: makeCapabilities({ slider: false, picker: false })
      })
    });
    const iosIds = [{ id: "btn-1", type: "button" }];
    const androidIds = [{ id: "toggle-1", type: "toggle" }];

    const comparison = createSideBySideComparison(ios, android, iosIds, androidIds);

    expect(comparison.summary.totalSemanticIds).toBe(2);
    expect(comparison.summary.matchingIds).toBe(0);
    expect(comparison.summary.mismatchedIds).toBe(2);
    expect(comparison.summary.overallMatch).toBe(false);

    expect(comparison.semanticIdDiffs.length).toBe(2);
    const statuses = comparison.semanticIdDiffs.map((d) => d.status).sort();
    expect(statuses).toEqual(["missing_android", "missing_ios"]);
  });

  it("preserves semantic node labels in diffs for inspection purposes", () => {
    const ios = makeSession({ sessionId: "sess-ios-3", platform: "ios" });
    const android = makeSession({ sessionId: "sess-android-3", platform: "android" });
    const iosIds = [{ id: "btn-1", type: "button", label: "Login" }];
    const androidIds = [{ id: "btn-1", type: "button", label: "Log In" }];

    const comparison = createSideBySideComparison(ios, android, iosIds, androidIds);

    const diff = comparison.semanticIdDiffs.find((d) => d.id === "btn-1");
    expect(diff.status).toBe("match");
    expect(diff.ios.label).toBe("Login");
    expect(diff.android.label).toBe("Log In");
  });
});
