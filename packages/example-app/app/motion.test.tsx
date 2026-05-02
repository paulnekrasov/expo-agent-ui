import {
  agentUIBouncy,
  agentUIComposeMotionAdapter,
  agentUIComposeMotionPresets,
  agentUIEaseInOut,
  agentUIGentle,
  agentUIGestureConfig,
  agentUILayoutTransitionSmooth,
  agentUIMotionAdapters,
  agentUINativeMotionMatrix,
  agentUIOpacityTransition,
  agentUIReanimatedAdapter,
  agentUIScaleTransition,
  agentUISlideTransition,
  agentUISnappy,
  agentUISpring,
  agentUISwiftUIMotionAdapter,
  agentUISwiftUIMotionPresets,
  createAgentUIMotionEvent,
  effectiveAgentUIReducedMotion,
  isValidAgentUIMotionSpringConfig,
  isValidAgentUIMotionTimingConfig,
  listAgentUIMotionAdapters,
  resetAgentUIReducedMotionCache,
  resolveAgentUIMotionAdapter,
  resolveAgentUIReducedMotion
} from "@agent-ui/core";

beforeEach(() => {
  jest.restoreAllMocks();
  resetAgentUIReducedMotionCache();
});

// ---------------------------------------------------------------------------
// Motion presets — spring
// ---------------------------------------------------------------------------

describe("agentUISpring", () => {
  it("returns default spring config", () => {
    const config = agentUISpring();

    expect(config).toEqual({
      duration: 420,
      dampingRatio: 1,
      reduceMotion: "system"
    });
  });

  it("accepts overrides", () => {
    const config = agentUISpring({ damping: 15, stiffness: 300 });

    expect(config.damping).toBe(15);
    expect(config.stiffness).toBe(300);
    expect(config.dampingRatio).toBe(1);
  });
});

describe("agentUIBouncy", () => {
  it("returns bouncy spring config", () => {
    const config = agentUIBouncy();

    expect(config).toEqual({
      damping: 12,
      stiffness: 200,
      reduceMotion: "system"
    });
  });

  it("accepts overrides", () => {
    const config = agentUIBouncy({ damping: 10, reduceMotion: "never" });

    expect(config.damping).toBe(10);
    expect(config.reduceMotion).toBe("never");
  });
});

describe("agentUISnappy", () => {
  it("returns snappy spring config", () => {
    const config = agentUISnappy();

    expect(config).toEqual({
      damping: 18,
      stiffness: 400,
      reduceMotion: "system"
    });
  });

  it("accepts overrides", () => {
    const config = agentUISnappy({ stiffness: 800 });

    expect(config.stiffness).toBe(800);
    expect(config.damping).toBe(18);
  });
});

// ---------------------------------------------------------------------------
// Motion presets — timing
// ---------------------------------------------------------------------------

describe("agentUIEaseInOut", () => {
  it("returns default ease-in-out timing config", () => {
    const config = agentUIEaseInOut();

    expect(config).toEqual({
      duration: 300,
      easing: "easeInOut",
      reduceMotion: "system"
    });
  });

  it("accepts duration override", () => {
    const config = agentUIEaseInOut({ duration: 500 });

    expect(config.duration).toBe(500);
    expect(config.easing).toBe("easeInOut");
  });
});

describe("agentUIGentle", () => {
  it("returns gentle timing config", () => {
    const config = agentUIGentle();

    expect(config).toEqual({
      duration: 180,
      easing: "easeOut",
      reduceMotion: "system"
    });
  });

  it("accepts overrides", () => {
    const config = agentUIGentle({ duration: 120, easing: "easeIn" });

    expect(config.duration).toBe(120);
    expect(config.easing).toBe("easeIn");
  });
});

// ---------------------------------------------------------------------------
// Entering / exiting transition presets
// ---------------------------------------------------------------------------

describe("agentUIOpacityTransition", () => {
  it("returns default opacity transition config", () => {
    const config = agentUIOpacityTransition();

    expect(config).toEqual({
      type: "opacity",
      duration: 200,
      easing: "easeOut",
      reduceMotion: "system"
    });
  });

  it("accepts overrides", () => {
    const config = agentUIOpacityTransition({
      duration: 150,
      reduceMotion: "never"
    });

    expect(config.duration).toBe(150);
    expect(config.reduceMotion).toBe("never");
  });
});

describe("agentUISlideTransition", () => {
  it("returns default slide transition config", () => {
    const config = agentUISlideTransition();

    expect(config).toEqual({
      type: "slide",
      duration: 250,
      easing: "easeInOut",
      edge: "bottom",
      reduceMotion: "system"
    });
  });

  it("accepts edge override", () => {
    const config = agentUISlideTransition({ edge: "left" });

    expect(config.edge).toBe("left");
    expect(config.type).toBe("slide");
  });
});

describe("agentUIScaleTransition", () => {
  it("returns default scale transition config", () => {
    const config = agentUIScaleTransition();

    expect(config).toEqual({
      type: "scale",
      duration: 200,
      easing: "easeOut",
      fromScale: 0.96,
      reduceMotion: "system"
    });
  });

  it("accepts fromScale override", () => {
    const config = agentUIScaleTransition({ fromScale: 0.9 });

    expect(config.fromScale).toBe(0.9);
  });
});

// ---------------------------------------------------------------------------
// Layout transition
// ---------------------------------------------------------------------------

describe("agentUILayoutTransitionSmooth", () => {
  it("returns default layout transition config", () => {
    const config = agentUILayoutTransitionSmooth();

    expect(config).toEqual({
      type: "smooth",
      duration: 250,
      reduceMotion: "system"
    });
  });

  it("accepts overrides", () => {
    const config = agentUILayoutTransitionSmooth({
      duration: 300,
      reduceMotion: "reduce"
    });

    expect(config.duration).toBe(300);
    expect(config.reduceMotion).toBe("reduce");
  });
});

// ---------------------------------------------------------------------------
// Gesture config
// ---------------------------------------------------------------------------

describe("agentUIGestureConfig", () => {
  it("returns pressable config with no defaults", () => {
    const config = agentUIGestureConfig("pressable");

    expect(config).toEqual({
      strategy: "pressable"
    });
  });

  it("returns pan config with defaults", () => {
    const config = agentUIGestureConfig("pan");

    expect(config).toEqual({
      strategy: "pan",
      minDistance: 10,
      direction: "horizontal"
    });
  });

  it("returns drag config with defaults", () => {
    const config = agentUIGestureConfig("drag");

    expect(config).toEqual({
      strategy: "drag",
      minDistance: 20
    });
  });

  it("returns swipe config with defaults", () => {
    const config = agentUIGestureConfig("swipe");

    expect(config).toEqual({
      strategy: "swipe",
      minDistance: 50,
      direction: "horizontal"
    });
  });

  it("returns pinch config with defaults", () => {
    const config = agentUIGestureConfig("pinch");

    expect(config).toEqual({
      strategy: "pinch",
      threshold: 0.1
    });
  });

  it("accepts overrides", () => {
    const config = agentUIGestureConfig("pan", {
      minDistance: 30,
      direction: "vertical"
    });

    expect(config.minDistance).toBe(30);
    expect(config.direction).toBe("vertical");
  });

  it("supports longPress strategy", () => {
    const config = agentUIGestureConfig("longPress");

    expect(config).toEqual({
      strategy: "longPress"
    });
  });
});

// ---------------------------------------------------------------------------
// Reduced motion
// ---------------------------------------------------------------------------

describe("effectiveAgentUIReducedMotion", () => {
  it("returns true when policy is reduce regardless of OS", () => {
    expect(effectiveAgentUIReducedMotion("reduce", false)).toBe(true);
    expect(effectiveAgentUIReducedMotion("reduce", true)).toBe(true);
  });

  it("returns false when policy is never regardless of OS", () => {
    expect(effectiveAgentUIReducedMotion("never", false)).toBe(false);
    expect(effectiveAgentUIReducedMotion("never", true)).toBe(false);
  });

  it("returns OS value when policy is system", () => {
    expect(effectiveAgentUIReducedMotion("system", true)).toBe(true);
    expect(effectiveAgentUIReducedMotion("system", false)).toBe(false);
  });
});

describe("resolveAgentUIReducedMotion", () => {
  it("returns false when AccessibilityInfo resolves false", async () => {
    jest
      .spyOn(
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("react-native").AccessibilityInfo,
        "isReduceMotionEnabled"
      )
      .mockResolvedValue(false);

    const result = await resolveAgentUIReducedMotion();

    expect(result).toBe(false);
  });

  it("returns true when AccessibilityInfo resolves true", async () => {
    jest
      .spyOn(
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("react-native").AccessibilityInfo,
        "isReduceMotionEnabled"
      )
      .mockResolvedValue(true);

    const result = await resolveAgentUIReducedMotion();

    expect(result).toBe(true);
  });

  it("returns false when AccessibilityInfo rejects", async () => {
    jest
      .spyOn(
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("react-native").AccessibilityInfo,
        "isReduceMotionEnabled"
      )
      .mockRejectedValue(new Error("not available"));

    const result = await resolveAgentUIReducedMotion();

    expect(result).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Motion events
// ---------------------------------------------------------------------------

describe("createAgentUIMotionEvent", () => {
  it("creates an animation_started event", () => {
    const event = createAgentUIMotionEvent({
      type: "animation_started",
      targetId: "motion.box"
    });

    expect(event.type).toBe("animation_started");
    expect(event.targetId).toBe("motion.box");
    expect(event.timestamp).toEqual(expect.any(String));
    expect(event.reason).toBeUndefined();
  });

  it("creates an animation_completed event", () => {
    const event = createAgentUIMotionEvent({
      type: "animation_completed",
      targetId: "motion.box"
    });

    expect(event.type).toBe("animation_completed");
  });

  it("creates an animation_interrupted event with reason", () => {
    const event = createAgentUIMotionEvent({
      type: "animation_interrupted",
      targetId: "motion.box",
      reason: "gesture cancelled"
    });

    expect(event.type).toBe("animation_interrupted");
    expect(event.reason).toBe("gesture cancelled");
  });

  it("creates a gesture_committed event", () => {
    const event = createAgentUIMotionEvent({
      type: "gesture_committed",
      targetId: "motion.row"
    });

    expect(event.type).toBe("gesture_committed");
  });

  it("creates a transition_committed event", () => {
    const event = createAgentUIMotionEvent({
      type: "transition_committed",
      targetId: "motion.screen"
    });

    expect(event.type).toBe("transition_committed");
  });

  it("has ISO-8601 timestamps", () => {
    const event = createAgentUIMotionEvent({
      type: "animation_started",
      targetId: "motion.probe"
    });

    expect(() => new Date(event.timestamp)).not.toThrow();
    expect(new Date(event.timestamp).toISOString()).toBe(event.timestamp);
  });
});

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

describe("isValidAgentUIMotionSpringConfig", () => {
  it("returns true for agentUISpring config", () => {
    expect(isValidAgentUIMotionSpringConfig(agentUISpring())).toBe(true);
  });

  it("returns true for agentUIBouncy config", () => {
    expect(isValidAgentUIMotionSpringConfig(agentUIBouncy())).toBe(true);
  });

  it("returns true for agentUISnappy config", () => {
    expect(isValidAgentUIMotionSpringConfig(agentUISnappy())).toBe(true);
  });

  it("returns false for null", () => {
    expect(isValidAgentUIMotionSpringConfig(null)).toBe(false);
  });

  it("returns false for string", () => {
    expect(isValidAgentUIMotionSpringConfig("not a config")).toBe(false);
  });

  it("returns false for invalid reduceMotion", () => {
    expect(
      isValidAgentUIMotionSpringConfig({
        damping: 18,
        reduceMotion: "invalid"
      })
    ).toBe(false);
  });

  it("returns true for config with extra props", () => {
    expect(
      isValidAgentUIMotionSpringConfig({
        damping: 18,
        stiffness: 400,
        extra: true
      })
    ).toBe(true);
  });
});

describe("isValidAgentUIMotionTimingConfig", () => {
  it("returns true for agentUIEaseInOut config", () => {
    expect(isValidAgentUIMotionTimingConfig(agentUIEaseInOut())).toBe(true);
  });

  it("returns true for agentUIGentle config", () => {
    expect(isValidAgentUIMotionTimingConfig(agentUIGentle())).toBe(true);
  });

  it("returns false for null", () => {
    expect(isValidAgentUIMotionTimingConfig(null)).toBe(false);
  });

  it("returns false for missing duration", () => {
    expect(
      isValidAgentUIMotionTimingConfig({ easing: "easeInOut" })
    ).toBe(false);
  });

  it("returns false for invalid easing", () => {
    expect(
      isValidAgentUIMotionTimingConfig({
        duration: 300,
        easing: "bouncy"
      })
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Motion adapter contracts
// ---------------------------------------------------------------------------

describe("agentUIReanimatedAdapter", () => {
  it("has tier 1", () => {
    expect(agentUIReanimatedAdapter.tier).toBe(1);
  });

  it("has cross platform", () => {
    expect(agentUIReanimatedAdapter.platform).toBe("cross");
  });

  it("has a name", () => {
    expect(agentUIReanimatedAdapter.name).toBe("Reanimated 4");
  });

  it("is always available", () => {
    expect(agentUIReanimatedAdapter.isAvailable()).toBe(true);
  });

  it("has all base capabilities", () => {
    const caps = agentUIReanimatedAdapter.capabilities;

    expect(caps.spring).toBe(true);
    expect(caps.timing).toBe(true);
    expect(caps.opacity).toBe(true);
    expect(caps.slide).toBe(true);
    expect(caps.scale).toBe(true);
    expect(caps.layout).toBe(true);
    expect(caps.gesture).toBe(true);
    expect(caps.reducedMotion).toBe(true);
  });

  it("does not expose platform-specific capabilities", () => {
    const caps = agentUIReanimatedAdapter.capabilities;

    expect(caps.symbolEffect).toBeUndefined();
    expect(caps.sensoryFeedback).toBeUndefined();
    expect(caps.matchedGeometry).toBeUndefined();
    expect(caps.keyframeAnimator).toBeUndefined();
    expect(caps.phaseAnimator).toBeUndefined();
    expect(caps.animatedVisibility).toBeUndefined();
    expect(caps.sharedTransition).toBeUndefined();
    expect(caps.graphicsLayer).toBeUndefined();
    expect(caps.infiniteTransition).toBeUndefined();
  });
});

describe("agentUISwiftUIMotionAdapter", () => {
  it("has tier 2", () => {
    expect(agentUISwiftUIMotionAdapter.tier).toBe(2);
  });

  it("has ios platform", () => {
    expect(agentUISwiftUIMotionAdapter.platform).toBe("ios");
  });

  it("has a name", () => {
    expect(agentUISwiftUIMotionAdapter.name).toBe("SwiftUI Motion");
  });

  it("is not available by default", () => {
    expect(agentUISwiftUIMotionAdapter.isAvailable()).toBe(false);
  });

  it("has iOS-specific capabilities", () => {
    const caps = agentUISwiftUIMotionAdapter.capabilities;

    expect(caps.symbolEffect).toBe(true);
    expect(caps.sensoryFeedback).toBe(true);
    expect(caps.matchedGeometry).toBe(true);
    expect(caps.keyframeAnimator).toBe(true);
    expect(caps.phaseAnimator).toBe(true);
  });

  it("does not have Android-specific capabilities", () => {
    const caps = agentUISwiftUIMotionAdapter.capabilities;

    expect(caps.animatedVisibility).toBeUndefined();
    expect(caps.sharedTransition).toBeUndefined();
    expect(caps.graphicsLayer).toBeUndefined();
    expect(caps.infiniteTransition).toBeUndefined();
  });

  it("has all base capabilities", () => {
    const caps = agentUISwiftUIMotionAdapter.capabilities;

    expect(caps.spring).toBe(true);
    expect(caps.timing).toBe(true);
    expect(caps.opacity).toBe(true);
    expect(caps.slide).toBe(true);
    expect(caps.scale).toBe(true);
    expect(caps.layout).toBe(true);
    expect(caps.gesture).toBe(true);
    expect(caps.reducedMotion).toBe(true);
  });
});

describe("agentUIComposeMotionAdapter", () => {
  it("has tier 3", () => {
    expect(agentUIComposeMotionAdapter.tier).toBe(3);
  });

  it("has android platform", () => {
    expect(agentUIComposeMotionAdapter.platform).toBe("android");
  });

  it("has a name", () => {
    expect(agentUIComposeMotionAdapter.name).toBe("Jetpack Compose Motion");
  });

  it("is not available by default", () => {
    expect(agentUIComposeMotionAdapter.isAvailable()).toBe(false);
  });

  it("has Android-specific capabilities", () => {
    const caps = agentUIComposeMotionAdapter.capabilities;

    expect(caps.animatedVisibility).toBe(true);
    expect(caps.sharedTransition).toBe(true);
    expect(caps.graphicsLayer).toBe(true);
    expect(caps.infiniteTransition).toBe(true);
  });

  it("does not have iOS-specific capabilities", () => {
    const caps = agentUIComposeMotionAdapter.capabilities;

    expect(caps.symbolEffect).toBeUndefined();
    expect(caps.sensoryFeedback).toBeUndefined();
    expect(caps.matchedGeometry).toBeUndefined();
    expect(caps.keyframeAnimator).toBeUndefined();
    expect(caps.phaseAnimator).toBeUndefined();
  });

  it("has all base capabilities", () => {
    const caps = agentUIComposeMotionAdapter.capabilities;

    expect(caps.spring).toBe(true);
    expect(caps.timing).toBe(true);
    expect(caps.opacity).toBe(true);
    expect(caps.slide).toBe(true);
    expect(caps.scale).toBe(true);
    expect(caps.layout).toBe(true);
    expect(caps.gesture).toBe(true);
    expect(caps.reducedMotion).toBe(true);
  });
});

describe("resolveAgentUIMotionAdapter", () => {
  it("returns Reanimated adapter when no platform is given", () => {
    const adapter = resolveAgentUIMotionAdapter();

    expect(adapter.tier).toBe(1);
    expect(adapter.platform).toBe("cross");
  });

  it("returns Reanimated adapter when platform is ios (SwiftUI not available)", () => {
    const adapter = resolveAgentUIMotionAdapter("ios");

    expect(adapter.tier).toBe(1);
    expect(adapter.platform).toBe("cross");
  });

  it("returns Reanimated adapter when platform is android (Compose not available)", () => {
    const adapter = resolveAgentUIMotionAdapter("android");

    expect(adapter.tier).toBe(1);
    expect(adapter.platform).toBe("cross");
  });

  it("returns Reanimated adapter for web platform", () => {
    const adapter = resolveAgentUIMotionAdapter("web");

    expect(adapter.tier).toBe(1);
    expect(adapter.platform).toBe("cross");
  });

  it("returns native adapter when SwiftUI adapter becomes available (iOS)", () => {
    const originalAvailable = agentUISwiftUIMotionAdapter.isAvailable;
    (agentUISwiftUIMotionAdapter as unknown as Record<string, () => boolean>).isAvailable = () => true;

    try {
      const adapter = resolveAgentUIMotionAdapter("ios");

      expect(adapter.tier).toBe(2);
      expect(adapter.platform).toBe("ios");
      expect(adapter.name).toBe("SwiftUI Motion");
    } finally {
      (agentUISwiftUIMotionAdapter as unknown as Record<string, () => boolean>).isAvailable = originalAvailable;
    }
  });

  it("returns native adapter when Compose adapter becomes available (Android)", () => {
    const originalAvailable = agentUIComposeMotionAdapter.isAvailable;
    (agentUIComposeMotionAdapter as unknown as Record<string, () => boolean>).isAvailable = () => true;

    try {
      const adapter = resolveAgentUIMotionAdapter("android");

      expect(adapter.tier).toBe(3);
      expect(adapter.platform).toBe("android");
      expect(adapter.name).toBe("Jetpack Compose Motion");
    } finally {
      (agentUIComposeMotionAdapter as unknown as Record<string, () => boolean>).isAvailable = originalAvailable;
    }
  });

  it("still returns native iOS adapter when both are available on iOS", () => {
    const swiftUIAvail = agentUISwiftUIMotionAdapter.isAvailable;
    const composeAvail = agentUIComposeMotionAdapter.isAvailable;
    (agentUISwiftUIMotionAdapter as unknown as Record<string, () => boolean>).isAvailable = () => true;
    (agentUIComposeMotionAdapter as unknown as Record<string, () => boolean>).isAvailable = () => true;

    try {
      const adapter = resolveAgentUIMotionAdapter("ios");

      expect(adapter.tier).toBe(2);
      expect(adapter.platform).toBe("ios");
    } finally {
      (agentUISwiftUIMotionAdapter as unknown as Record<string, () => boolean>).isAvailable = swiftUIAvail;
      (agentUIComposeMotionAdapter as unknown as Record<string, () => boolean>).isAvailable = composeAvail;
    }
  });
});

describe("listAgentUIMotionAdapters", () => {
  it("returns only Reanimated when no platform and stubs are unavailable", () => {
    const adapters = listAgentUIMotionAdapters();

    expect(adapters).toHaveLength(1);
    expect(adapters[0]!.tier).toBe(1);
  });

  it("returns Reanimated adapter when filtering by ios platform", () => {
    const adapters = listAgentUIMotionAdapters({ platform: "ios" });

    expect(adapters).toHaveLength(1);
    expect(adapters[0]!.tier).toBe(1);
    expect(adapters[0]!.platform).toBe("cross");
  });

  it("returns Reanimated adapter when filtering by android platform", () => {
    const adapters = listAgentUIMotionAdapters({ platform: "android" });

    expect(adapters).toHaveLength(1);
    expect(adapters[0]!.tier).toBe(1);
  });

  it("returns SwiftUI adapter when it is available and platform is ios", () => {
    const originalAvailable = agentUISwiftUIMotionAdapter.isAvailable;
    (agentUISwiftUIMotionAdapter as unknown as Record<string, () => boolean>).isAvailable = () => true;

    try {
      const adapters = listAgentUIMotionAdapters({ platform: "ios" });

      expect(adapters).toHaveLength(2);
      expect(adapters[0]!.tier).toBe(1);
      expect(adapters[1]!.tier).toBe(2);
      expect(adapters[1]!.platform).toBe("ios");
    } finally {
      (agentUISwiftUIMotionAdapter as unknown as Record<string, () => boolean>).isAvailable = originalAvailable;
    }
  });

  it("returns Compose adapter when it is available and platform is android", () => {
    const originalAvailable = agentUIComposeMotionAdapter.isAvailable;
    (agentUIComposeMotionAdapter as unknown as Record<string, () => boolean>).isAvailable = () => true;

    try {
      const adapters = listAgentUIMotionAdapters({ platform: "android" });

      expect(adapters).toHaveLength(2);
      expect(adapters[0]!.tier).toBe(1);
      expect(adapters[1]!.tier).toBe(3);
      expect(adapters[1]!.platform).toBe("android");
    } finally {
      (agentUIComposeMotionAdapter as unknown as Record<string, () => boolean>).isAvailable = originalAvailable;
    }
  });
});

describe("agentUIMotionAdapters", () => {
  it("is a readonly array with 3 adapters", () => {
    expect(agentUIMotionAdapters).toHaveLength(3);
    expect(agentUIMotionAdapters[0]!.tier).toBe(1);
    expect(agentUIMotionAdapters[1]!.tier).toBe(2);
    expect(agentUIMotionAdapters[2]!.tier).toBe(3);
  });

  it("is sorted by tier order", () => {
    expect(agentUIMotionAdapters[0]!.platform).toBe("cross");
    expect(agentUIMotionAdapters[1]!.platform).toBe("ios");
    expect(agentUIMotionAdapters[2]!.platform).toBe("android");
  });
});

describe("agentUISwiftUIMotionPresets", () => {
  it("contains 11 entries covering all preset names", () => {
    expect(agentUISwiftUIMotionPresets).toHaveLength(11);
  });

  it("every entry has tier 2 and platform ios", () => {
    for (const entry of agentUISwiftUIMotionPresets) {
      expect(entry.tier).toBe(2);
      expect(entry.platform).toBe("ios");
    }
  });

  it("every entry has a non-empty nativeAPI string", () => {
    for (const entry of agentUISwiftUIMotionPresets) {
      expect(typeof entry.nativeAPI).toBe("string");
      expect(entry.nativeAPI.length).toBeGreaterThan(0);
    }
  });

  it("every entry capabilityRequired exists on SwiftUI adapter", () => {
    const caps = agentUISwiftUIMotionAdapter.capabilities;
    for (const entry of agentUISwiftUIMotionPresets) {
      expect(caps).toHaveProperty(entry.capabilityRequired);
    }
  });

  it("covers every preset name exactly once", () => {
    const names = agentUISwiftUIMotionPresets.map((e: { agentUIPreset: string }) => e.agentUIPreset).sort();
    expect(names).toEqual([
      "agentUIBouncy",
      "agentUIEaseInOut",
      "agentUIGentle",
      "agentUIGestureConfig",
      "agentUILayoutTransitionSmooth",
      "agentUIOpacityTransition",
      "agentUIScaleTransition",
      "agentUISlideTransition",
      "agentUISnappy",
      "agentUISpring",
      "createAgentUIMotionEvent"
    ]);
  });

  it("every entry has a non-empty notes string", () => {
    for (const entry of agentUISwiftUIMotionPresets) {
      expect(typeof entry.notes).toBe("string");
      expect(entry.notes.length).toBeGreaterThan(0);
    }
  });
});

describe("agentUIComposeMotionPresets", () => {
  it("contains 11 entries covering all preset names", () => {
    expect(agentUIComposeMotionPresets).toHaveLength(11);
  });

  it("every entry has tier 3 and platform android", () => {
    for (const entry of agentUIComposeMotionPresets) {
      expect(entry.tier).toBe(3);
      expect(entry.platform).toBe("android");
    }
  });

  it("every entry has a non-empty nativeAPI string", () => {
    for (const entry of agentUIComposeMotionPresets) {
      expect(typeof entry.nativeAPI).toBe("string");
      expect(entry.nativeAPI.length).toBeGreaterThan(0);
    }
  });

  it("every entry capabilityRequired exists on Compose adapter", () => {
    const caps = agentUIComposeMotionAdapter.capabilities;
    for (const entry of agentUIComposeMotionPresets) {
      expect(caps).toHaveProperty(entry.capabilityRequired);
    }
  });

  it("covers every preset name exactly once", () => {
    const names = agentUIComposeMotionPresets.map((e: { agentUIPreset: string }) => e.agentUIPreset).sort();
    expect(names).toEqual([
      "agentUIBouncy",
      "agentUIEaseInOut",
      "agentUIGentle",
      "agentUIGestureConfig",
      "agentUILayoutTransitionSmooth",
      "agentUIOpacityTransition",
      "agentUIScaleTransition",
      "agentUISlideTransition",
      "agentUISnappy",
      "agentUISpring",
      "createAgentUIMotionEvent"
    ]);
  });

  it("every entry has a non-empty notes string", () => {
    for (const entry of agentUIComposeMotionPresets) {
      expect(typeof entry.notes).toBe("string");
      expect(entry.notes.length).toBeGreaterThan(0);
    }
  });
});

describe("agentUINativeMotionMatrix", () => {
  it("contains 22 entries (11 SwiftUI + 11 Compose)", () => {
    expect(agentUINativeMotionMatrix).toHaveLength(22);
  });

  it("first 11 entries are SwiftUI (tier 2, ios)", () => {
    for (const entry of agentUINativeMotionMatrix.slice(0, 11)) {
      expect(entry.tier).toBe(2);
      expect(entry.platform).toBe("ios");
    }
  });

  it("last 11 entries are Compose (tier 3, android)", () => {
    for (const entry of agentUINativeMotionMatrix.slice(11)) {
      expect(entry.tier).toBe(3);
      expect(entry.platform).toBe("android");
    }
  });

  it("is readonly and matches the sum of individual preset maps", () => {
    expect(agentUINativeMotionMatrix).toEqual([
      ...agentUISwiftUIMotionPresets,
      ...agentUIComposeMotionPresets
    ]);
  });
});
