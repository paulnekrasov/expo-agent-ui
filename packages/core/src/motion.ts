import { AccessibilityInfo } from "react-native";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Reduced-motion policy. Maps to Reanimated `ReduceMotion` but is
 * dependency-free so consumers can read the policy without importing
 * Reanimated.
 *
 * - `"system"` — honour the OS-level reduced-motion setting (default).
 * - `"reduce"` — always use reduced motion.
 * - `"never"`  — always run full animation (use sparingly).
 */
export type AgentUIReducedMotion = "system" | "reduce" | "never";

/**
 * Easing curve identity. Consumers map these to Reanimated `Easing`
 * or platform-native equivalents.
 */
export type AgentUIMotionEasing =
  | "easeInOut"
  | "easeIn"
  | "easeOut"
  | "linear";

/**
 * Spring configuration that consumers pass to Reanimated `withSpring`.
 */
export interface AgentUIMotionSpringConfig {
  damping?: number;
  stiffness?: number;
  mass?: number;
  dampingRatio?: number;
  duration?: number;
  velocity?: number;
  reduceMotion?: AgentUIReducedMotion;
}

/**
 * Timing configuration that consumers pass to Reanimated `withTiming`.
 */
export interface AgentUIMotionTimingConfig {
  duration: number;
  easing?: AgentUIMotionEasing;
  reduceMotion?: AgentUIReducedMotion;
}

/**
 * Slide edge direction.
 */
export type AgentUISlideEdge = "top" | "bottom" | "left" | "right";

/**
 * Entering / exiting transition preset config.
 */
export interface AgentUITransitionConfig {
  type: "opacity" | "slide" | "scale";
  duration: number;
  easing?: AgentUIMotionEasing;
  edge?: AgentUISlideEdge;
  fromScale?: number;
  reduceMotion?: AgentUIReducedMotion;
}

/**
 * Layout transition preset config.
 */
export interface AgentUILayoutTransitionConfig {
  type: "smooth";
  duration: number;
  reduceMotion?: AgentUIReducedMotion;
}

/**
 * Gesture strategy identifiers.
 */
export type AgentUIGestureStrategy =
  | "pressable"
  | "pan"
  | "drag"
  | "swipe"
  | "pinch"
  | "longPress";

/**
 * Gesture configuration for consumer gesture helpers.
 */
export interface AgentUIGestureConfig {
  strategy: AgentUIGestureStrategy;
  minDistance?: number;
  maxDistance?: number;
  direction?: "horizontal" | "vertical";
  threshold?: number;
}

/**
 * Coarse semantic motion event types dispatched to the semantic runtime.
 */
export type AgentUIMotionEventType =
  | "animation_started"
  | "animation_completed"
  | "animation_interrupted"
  | "gesture_committed"
  | "transition_committed";

/**
 * A coarse semantic motion event.
 */
export interface AgentUIMotionEvent {
  type: AgentUIMotionEventType;
  /** Stable semantic id of the targeted node. */
  targetId: string;
  /** ISO-8601 timestamp. */
  timestamp: string;
  /** Optional reason string (e.g. "cancelled", "interrupted by gesture"). */
  reason?: string;
}

// ---------------------------------------------------------------------------
// Reduced motion
// ---------------------------------------------------------------------------

let cachedReducedMotion: boolean | undefined;

/**
 * Reset the internal reduced-motion cache. Useful in tests.
 */
export function resetAgentUIReducedMotionCache(): void {
  cachedReducedMotion = undefined;
}

/**
 * Read the current reduced-motion OS preference. The result is synchronously
 * cached after first call (Reanimated `useReducedMotion` is synchronous and
 * does not re-render on system-setting changes).
 *
 * Returns `true` when the OS accessibility setting requests reduced motion.
 */
export async function resolveAgentUIReducedMotion(): Promise<boolean> {
  if (typeof cachedReducedMotion === "boolean") {
    return cachedReducedMotion;
  }

  try {
    const reduced = await new Promise<boolean>((resolve) => {
      AccessibilityInfo.isReduceMotionEnabled()
        .then((enabled) => resolve(enabled))
        .catch(() => resolve(false));
    });

    cachedReducedMotion = reduced;

    return reduced;
  } catch {
    cachedReducedMotion = false;

    return false;
  }
}

/**
 * Determine the effective reduced-motion policy.
 *
 * - `"system"` — resolve OS preference.
 * - `"reduce"` — always reduce.
 * - `"never"`  — never reduce.
 */
export function effectiveAgentUIReducedMotion(
  policy: AgentUIReducedMotion,
  osReduced: boolean
): boolean {
  if (policy === "reduce") {
    return true;
  }

  if (policy === "never") {
    return false;
  }

  return osReduced;
}

// ---------------------------------------------------------------------------
// Motion presets — spring
// ---------------------------------------------------------------------------

const DEFAULT_REDUCE_MOTION: AgentUIReducedMotion = "system";

/**
 * Smooth default spring. Duration-based with critical damping (dampingRatio: 1).
 * Maps to `motion.spring()` or `motion.smooth()`.
 *
 * Reanimated equivalent: `withSpring(toValue, { duration: 420, dampingRatio: 1, reduceMotion: ReduceMotion.System })`.
 */
export function agentUISpring(
  overrides?: Partial<AgentUIMotionSpringConfig>
): AgentUIMotionSpringConfig {
  return {
    duration: 420,
    dampingRatio: 1,
    reduceMotion: DEFAULT_REDUCE_MOTION,
    ...overrides
  };
}

/**
 * Bouncy spring for small controls and delight. Lower damping allows overshoot.
 * Maps to `motion.bouncy()`.
 *
 * Reanimated equivalent: `withSpring(toValue, { damping: 12, stiffness: 200, reduceMotion: ReduceMotion.System })`.
 */
export function agentUIBouncy(
  overrides?: Partial<AgentUIMotionSpringConfig>
): AgentUIMotionSpringConfig {
  return {
    damping: 12,
    stiffness: 200,
    reduceMotion: DEFAULT_REDUCE_MOTION,
    ...overrides
  };
}

/**
 * Snappy spring for micro-interactions. Short duration with modest underdamping.
 * Maps to `motion.snappy()`.
 *
 * Reanimated equivalent: `withSpring(toValue, { damping: 18, stiffness: 400, reduceMotion: ReduceMotion.System })`.
 */
export function agentUISnappy(
  overrides?: Partial<AgentUIMotionSpringConfig>
): AgentUIMotionSpringConfig {
  return {
    damping: 18,
    stiffness: 400,
    reduceMotion: DEFAULT_REDUCE_MOTION,
    ...overrides
  };
}

// ---------------------------------------------------------------------------
// Motion presets — timing
// ---------------------------------------------------------------------------

/**
 * Standard ease-in-out timing. Good for on-screen repositioning and standard
 * transitions. Maps to `motion.easeInOut({ duration })`.
 *
 * Reanimated equivalent: `withTiming(toValue, { duration: 300, easing: Easing.bezier(0.4, 0, 0.2, 1), reduceMotion: ReduceMotion.System })`.
 */
export function agentUIEaseInOut(
  overrides?: Partial<AgentUIMotionTimingConfig>
): AgentUIMotionTimingConfig {
  return {
    duration: 300,
    easing: "easeInOut",
    reduceMotion: DEFAULT_REDUCE_MOTION,
    ...overrides
  };
}

/**
 * Gentle enter/appear timing. Short, slightly eased. Maps to `motion.gentle()`.
 *
 * Reanimated equivalent: `withTiming(toValue, { duration: 180, easing: Easing.out(Easing.cubic), reduceMotion: ReduceMotion.System })`.
 */
export function agentUIGentle(
  overrides?: Partial<AgentUIMotionTimingConfig>
): AgentUIMotionTimingConfig {
  return {
    duration: 180,
    easing: "easeOut",
    reduceMotion: DEFAULT_REDUCE_MOTION,
    ...overrides
  };
}

// ---------------------------------------------------------------------------
// Entering / exiting transition presets
// ---------------------------------------------------------------------------

/**
 * Opacity fade transition. Used for mount/unmount fade effects.
 * Maps to `transition.opacity()`.
 */
export function agentUIOpacityTransition(
  overrides?: Partial<AgentUITransitionConfig>
): AgentUITransitionConfig {
  return {
    type: "opacity",
    duration: 200,
    easing: "easeOut",
    reduceMotion: DEFAULT_REDUCE_MOTION,
    ...overrides
  };
}

/**
 * Slide transition from an edge. Used for sheets, drawers, and directional
 * mount/unmount. Maps to `transition.slide({ edge })`.
 */
export function agentUISlideTransition(
  overrides?: Partial<AgentUITransitionConfig>
): AgentUITransitionConfig {
  return {
    type: "slide",
    duration: 250,
    easing: "easeInOut",
    edge: "bottom",
    reduceMotion: DEFAULT_REDUCE_MOTION,
    ...overrides
  };
}

/**
 * Scale transition. Subtle zoom for mount/unmount. Maps to `transition.scale()`.
 */
export function agentUIScaleTransition(
  overrides?: Partial<AgentUITransitionConfig>
): AgentUITransitionConfig {
  return {
    type: "scale",
    duration: 200,
    easing: "easeOut",
    fromScale: 0.96,
    reduceMotion: DEFAULT_REDUCE_MOTION,
    ...overrides
  };
}

// ---------------------------------------------------------------------------
// Layout transition preset
// ---------------------------------------------------------------------------

/**
 * Smooth layout transition. For bounded local layout changes (expanding a
 * small section, inserting a compact row). Maps to `layoutTransition.smooth()`.
 *
 * Reanimated equivalent: `LinearTransition.duration(250).reduceMotion(ReduceMotion.System)`.
 */
export function agentUILayoutTransitionSmooth(
  overrides?: Partial<AgentUILayoutTransitionConfig>
): AgentUILayoutTransitionConfig {
  return {
    type: "smooth",
    duration: 250,
    reduceMotion: DEFAULT_REDUCE_MOTION,
    ...overrides
  };
}

// ---------------------------------------------------------------------------
// Gesture helper strategy
// ---------------------------------------------------------------------------

/**
 * Create a gesture config for consumer gesture-handler wiring.
 *
 * - `pressable` — React Native `Pressable` for taps (default for semantic controls).
 * - `pan` / `drag` / `swipe` — Gesture Handler `Gesture.Pan()` with shared values.
 * - `pinch` — Gesture Handler `Gesture.Pinch()`.
 * - `longPress` — Gesture Handler `Gesture.LongPress()`.
 */
export function agentUIGestureConfig(
  strategy: AgentUIGestureStrategy,
  overrides?: Partial<Omit<AgentUIGestureConfig, "strategy">>
): AgentUIGestureConfig {
  const defaults: Partial<Record<AgentUIGestureStrategy, Partial<AgentUIGestureConfig>>> = {
    pan: { minDistance: 10, direction: "horizontal" },
    drag: { minDistance: 20 },
    swipe: { minDistance: 50, direction: "horizontal" },
    pinch: { threshold: 0.1 }
  };

  return {
    strategy,
    ...(defaults[strategy] ?? {}),
    ...overrides
  } as AgentUIGestureConfig;
}

// ---------------------------------------------------------------------------
// Coarse semantic motion events
// ---------------------------------------------------------------------------

/**
 * Create a coarse semantic motion event for dispatch to the semantic runtime.
 * Consumers call this from Reanimated completion callbacks (`runOnJS`) or
 * gesture end handlers.
 */
export function createAgentUIMotionEvent(options: {
  type: AgentUIMotionEventType;
  targetId: string;
  reason?: string;
}): AgentUIMotionEvent {
  return {
    type: options.type,
    targetId: options.targetId,
    timestamp: new Date().toISOString(),
    ...(options.reason ? { reason: options.reason } : {})
  };
}

// ---------------------------------------------------------------------------
// Motion config validation
// ---------------------------------------------------------------------------

/**
 * Validate a spring config shape. Useful in tests and consumer debug checks.
 */
export function isValidAgentUIMotionSpringConfig(
  config: unknown
): config is AgentUIMotionSpringConfig {
  if (!config || typeof config !== "object") {
    return false;
  }

  const c = config as Record<string, unknown>;

  return (
    (typeof c.damping === "undefined" || typeof c.damping === "number") &&
    (typeof c.stiffness === "undefined" || typeof c.stiffness === "number") &&
    (typeof c.mass === "undefined" || typeof c.mass === "number") &&
    (typeof c.dampingRatio === "undefined" || typeof c.dampingRatio === "number") &&
    (typeof c.duration === "undefined" || typeof c.duration === "number") &&
    (typeof c.velocity === "undefined" || typeof c.velocity === "number") &&
    (typeof c.reduceMotion === "undefined" ||
      c.reduceMotion === "system" ||
      c.reduceMotion === "reduce" ||
      c.reduceMotion === "never")
  );
}

/**
 * Validate a timing config shape.
 */
export function isValidAgentUIMotionTimingConfig(
  config: unknown
): config is AgentUIMotionTimingConfig {
  if (!config || typeof config !== "object") {
    return false;
  }

  const c = config as Record<string, unknown>;

  return (
    typeof c.duration === "number" &&
    (typeof c.easing === "undefined" ||
      c.easing === "easeInOut" ||
      c.easing === "easeIn" ||
      c.easing === "easeOut" ||
      c.easing === "linear") &&
    (typeof c.reduceMotion === "undefined" ||
      c.reduceMotion === "system" ||
      c.reduceMotion === "reduce" ||
      c.reduceMotion === "never")
  );
}

// ---------------------------------------------------------------------------
// Motion adapter contracts — three-tier architecture
// ---------------------------------------------------------------------------

/**
 * Adapter tier.
 *
 * - `1` — Tier 1: Reanimated 4 cross-platform base (required, always available).
 * - `2` — Tier 2: native iOS SwiftUI motion adapter (optional, needs `@expo/ui/swift-ui`).
 * - `3` — Tier 3: native Android Jetpack Compose motion adapter (optional, needs `@expo/ui/jetpack-compose`).
 */
export type AgentUIMotionAdapterTier = 1 | 2 | 3;

/**
 * Adapter target platform.
 */
export type AgentUIMotionAdapterPlatform = "cross" | "ios" | "android";

/**
 * Motion capability flags. Base capabilities map to Tier 1 Reanimated primitives.
 * Tier 2 (iOS) and Tier 3 (Android) extend with platform-specific flags.
 */
export interface AgentUIMotionAdapterCapabilities {
  /** Duration-based and physics spring via withSpring. */
  spring: boolean;
  /** Deterministic duration/easing timing via withTiming. */
  timing: boolean;
  /** Opacity fade transitions. */
  opacity: boolean;
  /** Slide transitions from edge. */
  slide: boolean;
  /** Scale (zoom) transitions. */
  scale: boolean;
  /** Smooth layout transitions (e.g. LinearTransition). */
  layout: boolean;
  /** Gesture-driven animation (Pan, Pinch, etc.). */
  gesture: boolean;
  /** Honour OS reduced-motion accessibility setting. */
  reducedMotion: boolean;
  /** [iOS] SF Symbol animations (symbolEffect). */
  symbolEffect?: boolean;
  /** [iOS] Haptic / sensory feedback. */
  sensoryFeedback?: boolean;
  /** [iOS] Matched geometry effect. */
  matchedGeometry?: boolean;
  /** [iOS] Keyframe animator. */
  keyframeAnimator?: boolean;
  /** [iOS] Phase animator. */
  phaseAnimator?: boolean;
  /** [Android] AnimatedVisibility for enter/exit. */
  animatedVisibility?: boolean;
  /** [Android] SharedTransitionLayout. */
  sharedTransition?: boolean;
  /** [Android] graphicsLayer GPU compositing. */
  graphicsLayer?: boolean;
  /** [Android] Infinite / repeatable transition. */
  infiniteTransition?: boolean;
}

/**
 * A motion adapter contract. Each tier defines its capabilities, platform
 * target, and runtime availability. Consumers call `isAvailable()` to check
 * whether the adapter can be used at runtime.
 */
export interface AgentUIMotionAdapter {
  /** Adapter tier (1, 2, or 3). */
  tier: AgentUIMotionAdapterTier;
  /** Target platform for this adapter. */
  platform: AgentUIMotionAdapterPlatform;
  /** Human-readable adapter name. */
  name: string;
  /** Motion capability flags this adapter supports. */
  capabilities: AgentUIMotionAdapterCapabilities;
  /** Returns `true` when the adapter is available at runtime. */
  isAvailable(): boolean;
}

// ---------------------------------------------------------------------------
// Tier 1 — Reanimated 4 cross-platform default adapter
// ---------------------------------------------------------------------------

const reanimatedBaseCapabilities: AgentUIMotionAdapterCapabilities = {
  spring: true,
  timing: true,
  opacity: true,
  slide: true,
  scale: true,
  layout: true,
  gesture: true,
  reducedMotion: true
};

/**
 * The Tier 1 Reanimated 4 adapter. Always available. All base motion
 * capabilities are supported. Platform-agnostic (cross).
 *
 * Consumers use this adapter to map Agent UI presets to Reanimated primitives
 * (`withSpring`, `withTiming`, entering/exiting builders, layout transitions,
 * and Gesture Handler integration).
 */
export const agentUIReanimatedAdapter: AgentUIMotionAdapter = {
  tier: 1,
  platform: "cross",
  name: "Reanimated 4",
  capabilities: { ...reanimatedBaseCapabilities },
  isAvailable: () => true
};

// ---------------------------------------------------------------------------
// Tier 2 — iOS SwiftUI motion adapter stub
// ---------------------------------------------------------------------------

/**
 * The Tier 2 native iOS SwiftUI motion adapter stub. Targets iOS only.
 * Not available by default — requires `@expo/ui/swift-ui` to be installed.
 *
 * When available, this adapter maps Agent UI presets to SwiftUI `Animation`,
 * `spring`, `transition`, `symbolEffect`, `SensoryFeedback`,
 * `matchedGeometryEffect`, `KeyframeAnimator`, and `PhaseAnimator`.
 *
 * Native implementation is Stage 7. Stage 6 defines the contract.
 */
export const agentUISwiftUIMotionAdapter: AgentUIMotionAdapter = {
  tier: 2,
  platform: "ios",
  name: "SwiftUI Motion",
  capabilities: {
    ...reanimatedBaseCapabilities,
    symbolEffect: true,
    sensoryFeedback: true,
    matchedGeometry: true,
    keyframeAnimator: true,
    phaseAnimator: true
  },
  isAvailable: () => false
};

// ---------------------------------------------------------------------------
// Tier 3 — Android Jetpack Compose motion adapter stub
// ---------------------------------------------------------------------------

/**
 * The Tier 3 native Android Jetpack Compose motion adapter stub. Targets
 * Android only. Not available by default — requires `@expo/ui/jetpack-compose`
 * to be installed.
 *
 * When available, this adapter maps Agent UI presets to Compose
 * `animate*AsState`, `AnimatedVisibility`, `SharedTransitionLayout`, `spring`,
 * `graphicsLayer`, and `infiniteTransition`.
 *
 * Native implementation is Stage 7. Stage 6 defines the contract.
 */
export const agentUIComposeMotionAdapter: AgentUIMotionAdapter = {
  tier: 3,
  platform: "android",
  name: "Jetpack Compose Motion",
  capabilities: {
    ...reanimatedBaseCapabilities,
    animatedVisibility: true,
    sharedTransition: true,
    graphicsLayer: true,
    infiniteTransition: true
  },
  isAvailable: () => false
};

// ---------------------------------------------------------------------------
// Motion adapter registry
// ---------------------------------------------------------------------------

/**
 * Ordered list of all defined motion adapters (Tier 1 through Tier 3).
 * Consumers iterate this list for capability inspection, platform matching,
 * and fallback resolution.
 */
export const agentUIMotionAdapters: readonly AgentUIMotionAdapter[] = [
  agentUIReanimatedAdapter,
  agentUISwiftUIMotionAdapter,
  agentUIComposeMotionAdapter
];

/**
 * List available motion adapters, optionally filtered by platform.
 *
 * When no platform is given, returns all adapters whose `isAvailable()`
 * returns `true`. When a platform is given, only adapters that match that
 * platform (or are cross-platform) AND are available are returned.
 */
export function listAgentUIMotionAdapters(options?: {
  platform?: AgentUIMotionAdapterPlatform | string;
}): AgentUIMotionAdapter[] {
  const target = options?.platform;
  return agentUIMotionAdapters.filter((a) => {
    if (!a.isAvailable()) {
      return false;
    }
    if (!target) {
      return true;
    }
    return a.platform === "cross" || a.platform === target;
  });
}

/**
 * Resolve the highest-tier available motion adapter for a given platform.
 *
 * Resolution rules:
 * 1. If platform is "ios" and the SwiftUI adapter is available, return Tier 2.
 * 2. If platform is "android" and the Compose adapter is available, return Tier 3.
 * 3. Otherwise, return Tier 1 (Reanimated cross-platform default).
 */
export function resolveAgentUIMotionAdapter(
  platform?: AgentUIMotionAdapterPlatform | string
): AgentUIMotionAdapter {
  if (platform === "ios" && agentUISwiftUIMotionAdapter.isAvailable()) {
    return agentUISwiftUIMotionAdapter;
  }
  if (platform === "android" && agentUIComposeMotionAdapter.isAvailable()) {
    return agentUIComposeMotionAdapter;
  }
  return agentUIReanimatedAdapter;
}

// ---------------------------------------------------------------------------
// Native motion preset mapping — documentation contracts
// ---------------------------------------------------------------------------

/**
 * All Agent UI motion preset identifiers. Used as lookup keys for native
 * adapter mapping tables and diagnostics.
 */
export type AgentUIMotionPresetName =
  | "agentUISpring"
  | "agentUIBouncy"
  | "agentUISnappy"
  | "agentUIEaseInOut"
  | "agentUIGentle"
  | "agentUIOpacityTransition"
  | "agentUISlideTransition"
  | "agentUIScaleTransition"
  | "agentUILayoutTransitionSmooth"
  | "agentUIGestureConfig"
  | "createAgentUIMotionEvent";

/**
 * A single native preset mapping entry. Maps one Agent UI motion preset to
 * its equivalent native API call (SwiftUI or Jetpack Compose), along with
 * the capability flag, tier, platform, and human-readable notes.
 *
 * These are documentation contracts, not runtime control paths. Stage 7
 * implementers use these entries to wire actual native module calls.
 */
export interface AgentUIMotionNativePresetMapping {
  /** Agent UI preset name. */
  agentUIPreset: AgentUIMotionPresetName;
  /** Native API descriptor string (SwiftUI or Compose syntax). */
  nativeAPI: string;
  /** Capability flag key from `AgentUIMotionAdapterCapabilities`. */
  capabilityRequired: keyof AgentUIMotionAdapterCapabilities;
  /** Adapter tier (2 for SwiftUI, 3 for Compose). */
  tier: AgentUIMotionAdapterTier;
  /** Target platform. */
  platform: AgentUIMotionAdapterPlatform;
  /** Human-readable notes about the mapping. */
  notes: string;
}

// ---------------------------------------------------------------------------
// Tier 2 — iOS SwiftUI motion preset mapping
// ---------------------------------------------------------------------------

/**
 * Read-only map of every Agent UI motion preset to its SwiftUI native API
 * equivalent. Only presets that the Tier 2 SwiftUI adapter can fulfill are
 * listed. Entries reference the iOS-only capability flags defined in
 * `AgentUIMotionAdapterCapabilities`.
 *
 * This is a documentation contract for Stage 7 SwiftUI adapter implementers.
 */
export const agentUISwiftUIMotionPresets: readonly AgentUIMotionNativePresetMapping[] = [
  {
    agentUIPreset: "agentUISpring",
    nativeAPI: "Animation.spring(duration: 0.42, bounce: 0)",
    capabilityRequired: "spring",
    tier: 2,
    platform: "ios",
    notes: "Duration-based spring with zero bounce maps to a critically damped SwiftUI spring. Use Animation.spring with duration and nil bounce for no overshoot."
  },
  {
    agentUIPreset: "agentUIBouncy",
    nativeAPI: "Animation.spring(response: 0.4, dampingFraction: 0.6)",
    capabilityRequired: "spring",
    tier: 2,
    platform: "ios",
    notes: "Bouncy spring uses lower dampingFraction (0.6) for visible overshoot. Best for small controls and delight effects."
  },
  {
    agentUIPreset: "agentUISnappy",
    nativeAPI: "Animation.spring(response: 0.25, dampingFraction: 0.7)",
    capabilityRequired: "spring",
    tier: 2,
    platform: "ios",
    notes: "Snappy spring uses moderate dampingFraction (0.7) and short response time for micro-interactions."
  },
  {
    agentUIPreset: "agentUIEaseInOut",
    nativeAPI: "Animation.easeInOut(duration: 0.3)",
    capabilityRequired: "timing",
    tier: 2,
    platform: "ios",
    notes: "Standard ease-in-out timing. Maps to Animation.easeInOut with configurable duration."
  },
  {
    agentUIPreset: "agentUIGentle",
    nativeAPI: "Animation.easeOut(duration: 0.18)",
    capabilityRequired: "timing",
    tier: 2,
    platform: "ios",
    notes: "Gentle enter/appear timing. Uses easeOut for elements entering the screen."
  },
  {
    agentUIPreset: "agentUIOpacityTransition",
    nativeAPI: "AnyTransition.opacity.animation(.easeOut(duration: 0.2))",
    capabilityRequired: "opacity",
    tier: 2,
    platform: "ios",
    notes: "Opacity fade transition for mount/unmount. Uses AnyTransition.opacity with easeOut timing."
  },
  {
    agentUIPreset: "agentUISlideTransition",
    nativeAPI: "AnyTransition.move(edge: .bottom).animation(.easeInOut(duration: 0.25))",
    capabilityRequired: "slide",
    tier: 2,
    platform: "ios",
    notes: "Slide transition from a directional edge. Maps to AnyTransition.move with configurable edge. Default edge is .bottom."
  },
  {
    agentUIPreset: "agentUIScaleTransition",
    nativeAPI: "AnyTransition.scale(scale: 0.96).animation(.easeOut(duration: 0.2))",
    capabilityRequired: "scale",
    tier: 2,
    platform: "ios",
    notes: "Scale transition from near-final value (0.96). Uses AnyTransition.scale with easeOut."
  },
  {
    agentUIPreset: "agentUILayoutTransitionSmooth",
    nativeAPI: "Animation.default + matchedGeometryEffect for bounded local changes",
    capabilityRequired: "layout",
    tier: 2,
    platform: "ios",
    notes: "Smooth layout transition. For bounded local changes, use matchedGeometryEffect when available. Falls back to Animation.default."
  },
  {
    agentUIPreset: "agentUIGestureConfig",
    nativeAPI: "SwiftUI gesture modifiers (DragGesture, MagnifyGesture, RotateGesture)",
    capabilityRequired: "gesture",
    tier: 2,
    platform: "ios",
    notes: "Gesture strategy maps to SwiftUI gesture modifiers. Pan→DragGesture, swipe→DragGesture with velocity, pinch→MagnifyGesture+RotateGesture."
  },
  {
    agentUIPreset: "createAgentUIMotionEvent",
    nativeAPI: "Semantic motion event emission via runOnJS callback bridge",
    capabilityRequired: "reducedMotion",
    tier: 2,
    platform: "ios",
    notes: "Not a native animation itself. Event factory wraps animation lifecycle callbacks and dispatches coarse semantic events to the JS runtime."
  }
];

// ---------------------------------------------------------------------------
// Tier 3 — Android Jetpack Compose motion preset mapping
// ---------------------------------------------------------------------------

/**
 * Read-only map of every Agent UI motion preset to its Jetpack Compose native
 * API equivalent. Only presets that the Tier 3 Compose adapter can fulfill are
 * listed. Entries reference the Android-only capability flags defined in
 * `AgentUIMotionAdapterCapabilities`.
 *
 * This is a documentation contract for Stage 7 Compose adapter implementers.
 */
export const agentUIComposeMotionPresets: readonly AgentUIMotionNativePresetMapping[] = [
  {
    agentUIPreset: "agentUISpring",
    nativeAPI: "animate*AsState with spring(dampingRatio = 1f, stiffness = StiffnessMedium)",
    capabilityRequired: "spring",
    tier: 3,
    platform: "android",
    notes: "Duration-based spring with zero bounce maps to Compose spring with DampingRatioNoBouncy (1f) and StiffnessMedium. Use animateDpAsState / animateFloatAsState."
  },
  {
    agentUIPreset: "agentUIBouncy",
    nativeAPI: "animate*AsState with spring(dampingRatio = 0.6f, stiffness = StiffnessLow)",
    capabilityRequired: "spring",
    tier: 3,
    platform: "android",
    notes: "Bouncy spring uses dampingRatio 0.6f and StiffnessLow for visible overshoot. Best for toggles, chips, and delight."
  },
  {
    agentUIPreset: "agentUISnappy",
    nativeAPI: "animate*AsState with spring(dampingRatio = 0.7f, stiffness = StiffnessHigh)",
    capabilityRequired: "spring",
    tier: 3,
    platform: "android",
    notes: "Snappy spring uses dampingRatio 0.7f and StiffnessHigh for fast micro-interactions."
  },
  {
    agentUIPreset: "agentUIEaseInOut",
    nativeAPI: "animate*AsState with tween(durationMillis = 250, easing = FastOutSlowInEasing)",
    capabilityRequired: "timing",
    tier: 3,
    platform: "android",
    notes: "Standard ease-in-out timing. Maps to Compose tween with FastOutSlowInEasing, the default Material Motion curve for on-screen movement."
  },
  {
    agentUIPreset: "agentUIGentle",
    nativeAPI: "animate*AsState with tween(durationMillis = 180, easing = LinearOutSlowInEasing)",
    capabilityRequired: "timing",
    tier: 3,
    platform: "android",
    notes: "Gentle enter timing. Uses tween with LinearOutSlowInEasing for elements entering the screen."
  },
  {
    agentUIPreset: "agentUIOpacityTransition",
    nativeAPI: "animateFloatAsState with tween(durationMillis = 200, easing = LinearOutSlowInEasing)",
    capabilityRequired: "opacity",
    tier: 3,
    platform: "android",
    notes: "Opacity fade via animateFloatAsState. Use graphicsLayer alpha for GPU-composited opacity."
  },
  {
    agentUIPreset: "agentUISlideTransition",
    nativeAPI: "animateOffsetAsState with tween(durationMillis = 250, easing = FastOutSlowInEasing)",
    capabilityRequired: "slide",
    tier: 3,
    platform: "android",
    notes: "Slide via animateOffsetAsState. Map Agent UI edge directions to Offset translation vector."
  },
  {
    agentUIPreset: "agentUIScaleTransition",
    nativeAPI: "animateFloatAsState(targetValue = 1f, initialValue = 0.96f) with tween(200, LinearOutSlowInEasing)",
    capabilityRequired: "scale",
    tier: 3,
    platform: "android",
    notes: "Scale via animateFloatAsState from 0.96f. Apply with graphicsLayer scaleX/scaleY for GPU compositing."
  },
  {
    agentUIPreset: "agentUILayoutTransitionSmooth",
    nativeAPI: "animateContentSize() on AnimatedVisibility or Modifier.animateContentSize",
    capabilityRequired: "layout",
    tier: 3,
    platform: "android",
    notes: "Smooth layout changes via animateContentSize. For shared element transitions, use SharedTransitionLayout (Android-specific Tier 3 capability)."
  },
  {
    agentUIPreset: "agentUIGestureConfig",
    nativeAPI: "Modifier.pointerInput / Modifier.draggable / Modifier.transformable for gesture handling",
    capabilityRequired: "gesture",
    tier: 3,
    platform: "android",
    notes: "Gesture strategy maps to Compose gesture modifiers. drag→Modifier.draggable, swipe→detectDragGestures, pinch→detectTransformGestures."
  },
  {
    agentUIPreset: "createAgentUIMotionEvent",
    nativeAPI: "Semantic motion event emission via LaunchedEffect or callback bridge",
    capabilityRequired: "reducedMotion",
    tier: 3,
    platform: "android",
    notes: "Not a native animation. Event factory wraps animation callbacks to dispatch coarse semantic events to the JS runtime via Compose/JS bridge."
  }
];

// ---------------------------------------------------------------------------
// Flattened native motion mapping matrix
// ---------------------------------------------------------------------------

/**
 * A flat, read-only array of all native preset mapping entries for both
 * SwiftUI (Tier 2) and Compose (Tier 3) adapters. Suitable for diagnostics,
 * tooling inspection, and MCP resource output.
 */
export const agentUINativeMotionMatrix: readonly AgentUIMotionNativePresetMapping[] = [
  ...agentUISwiftUIMotionPresets,
  ...agentUIComposeMotionPresets
];
