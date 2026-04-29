## Timeless vs Web-Specific Extraction

Below, each original file is split into timeless principles (to keep and translate) and web-specific implementation (to discard and replace).

### SKILL.md

| Timeless (keep \& translate) | Web-specific (discard \& replace) |
| :-- | :-- |
| Animations exist to communicate state, hierarchy, and causality, not decorate; removing an animation should usually not break the interaction.[^1] | Mentions of CSS properties like `transform`, `opacity`, `clip-path`, `top`, `margin-top`, etc.[^1] |
| "The best animations are the ones you don't notice" and the idea that subtle motion is usually preferable to flashy effects.[^1] |  |
| Frequency rule: interactions used 100+ times/day should have no animation or be barely perceptible.[^1] |  |
| "Nothing in the world disappears instantly" -> even short transitions make UI feel grounded.[^1] |  |
| Easing decision tree: enter/exit uses "out" curves, on-screen movement uses "in-out", constant motion uses linear, hover/color use gentle easing; ease-in is wrong for interactive feedback because it delays response.[^1][^2] |  |
| Duration ranges for micro-interactions, tooltips, dropdowns, modals, pages, success/delight and rules like exits 20-30% faster than enters, larger elements animate slower.[^1][^2] |  |
| Philosophy that keyboard-initiated actions should not animate.[^1][^3] |  |
| Performance ground rule: prefer animating cheap "compositing" properties (conceptually transform/opacity) vs layout/paint-affecting properties.[^1][^4] |  |
| "Something feels wrong" diagnostic table as a pattern: symptom -> likely cause -> reference to correction.[^1] |  |
| Distinguishing simple state transitions vs spring/physics-driven "alive" motion for highly interactive elements.[^1][^5] | Framer Motion specifics: `AnimatePresence`, motion component props, spring presets with `{ type: "spring", duration, bounce }`.[^1][^2] |
| Spring vs non-spring decision rule: use springs for alive/physical/interruptible gestures, standard easing for most UI.[^1][^5] | `prefers-reduced-motion` media queries and exact CSS snippet.[^1][^2] |
| "Instant wins" patterns conceptually: tactile button press scaling, avoiding scale-from-zero, concentric radius heuristic, hover instant-on/ease-off, using shadows for depth, smooth icon state swap.[^1][^6][^3] | React/Framer-Motion specifics, JSX snippets, `will-change`, "off main thread" language tied to browser compositor.[^1][^4][^3] |

### web-animations.md

| Timeless | Web-specific |
| :-- | :-- |
| Four easing questions and categories: ease-out for user-initiated enters/exits, ease-in-out for moving things already on screen, gentle ease for cosmetic changes, linear only for constant-speed/time visualizations, avoid ease-in for UI feedback.[^2] |  |
| Duration guidelines by element type, plus rules: under ~300ms for standard UI, larger elements slightly slower, exits faster, duration proportional to travel distance.[^2] |  |
| Frequency rule for deciding whether to animate at all; marketing vs product timing distinction.[^2][^5] |  |
| Concept of "paired elements" (modal + overlay, tooltip + arrow) using same easing/duration to feel like a single unit.[^2] |  |
| Conceptual reasons springs feel natural: no fixed duration, respond well to interruption, maintain velocity; when to use springs (drag, alive elements, gestures, playful UI).[^2][^5] |  |
| Guidelines on bounce: usually avoid in serious UI, use only subtly for playful or drag interactions.[^2] |  |
| Performance philosophy: small set of cheap properties should be animated; keep simultaneous heavy animations few; avoid overloading the main rendering pipeline.[^2][^4] |  |
| Accessibility philosophy: always provide reduced-motion paths for all animations; delight is optional, clarity is mandatory.[^2][^7] | CSS variable lists of cubic-beziers, exact tokens like `--ease-out-quad`, `--joy-bounce`.[^2] |
|  | `will-change`, browser compositor vs main thread terminology, WAAPI vs CSS vs JS comparisons.[^2][^4] |
|  | DevTools-specific instructions: Chrome Performance tab, paint flashing, etc., as browser tooling.[^4][^3] |
|  | Framer Motion snippets and hooks (`useReducedMotion`, `motion.div` props).[^2] |
|  | Touch-device hover media queries `@media (hover: hover) and (pointer: fine)`.[^2] |

### disney-12-principles.md

| Timeless | Web-specific |
| :-- | :-- |
| Use of all 12 Disney principles as diagnostic vocabulary for UI motion: squash \& stretch, anticipation, staging, straight ahead vs pose-to-pose, follow-through \& overlapping, slow in/out, arcs, secondary action, timing, exaggeration, solid drawing, appeal.[^8] |  |
| Volume preservation as a rule for squash \& stretch; subtle deformation ranges for professional vs playful UI.[^8] |  |
| Anticipation as preparatory micro-movement; hover/focus as anticipation for click/tap.[^8][^9] |  |
| Staging as single clear focal point, with motion hierarchy and dimming or freezing non-primary content.[^8][^7] |  |
| Straight-ahead vs pose-to-pose as physics vs keyframe analogy; rule to default to pose-to-pose for standard UI, use straight-ahead for highly physical/generative motion.[^8][^5] |  |
| Follow-through and overlapping patterns: container arrives before children, overshoot simulating momentum.[^8][^10] |  |
| Slow in/out as the default; linear considered broken for interactive transitions, reserved for constant motion indicators.[^8][^2] |  |
| Arcs as more natural than straight lines for motion paths, especially for thrown/dismissed items.[^8][^7] |  |
| Secondary action guidelines: support primary action, never steal focus.[^8][^7] |  |
| Timing tables mapping context to duration/personality; frequency rule reiterated.[^8] |  |
| Exaggeration calibrated by product domain and context (enterprise vs consumer vs celebration).[^8][^7] |  |
| Solid drawing: consistent transform origins, depth logic, volume.[^8] |  |
| Appeal: cohesive motion language, brand personality, 60fps goal, consistency.[^8][^5] | CSS-specific: `transform: scale()`, `offset-path`, `perspective`, `transform-origin`, SVG `transform-box` usage.[^8] |
|  | Specific cubic-bezier tokens, `filter: blur()` tuning, CSS `@keyframes` examples.[^8] |
|  | References to DevTools performance tabs and "CSS vs JS" framing.[^8][^4] |

### micro-interactions.md

| Timeless | Web-specific |
| :-- | :-- |
| Timing table for micro-interactions (button press/release, toggles, checkboxes, tooltips, badge updates, error shakes, success confirm, copy-to-clipboard) and idea that micro interactions rarely exceed ~300ms.[^9] |  |
| Application of Disney principles to micro-interactions: squash \& stretch for presses, anticipation via hover/lift, staging for active/focused/error states, follow-through via ripples and overshoot, constrained exaggeration ranges.[^9] |  |
| Rules: every interactive element needs feedback; disabled states should not animate; avoid stacking multiple feedback animations; respect reduced motion; test at 2x speed.[^9] |  |
| Pattern-level guidance for buttons, toggles, checkboxes, icon swaps, form validation, loading indicators, badge/count updates, ripples.[^9] |  |
| Error shake amplitude guidelines (3-5px; avoid large, cartoonish shakes) and emphasis on coupling color + motion.[^9] |  |
| Skeleton vs spinner vs pulse as loading communication choices; speed-up spinners for perceived performance.[^9][^4] | CSS-only examples, selectors like `:hover`, `:active`, stroke-dashoffset SVG tricks in CSS.[^9] |
|  | Framer Motion/JSX snippets for badge/number transitions.[^9] |
|  | `prefers-reduced-motion` CSS snippet and hover-specific media queries.[^9][^2] |

### entrance-exit-patterns.md

| Timeless | Web-specific |
| :-- | :-- |
| Core rules: entrances should feel responsive and natural (out curves); exits should be slightly faster, use in curves; avoid pure fades; always combine opacity with spatial direction.[^10] |  |
| Duration tables for toast/tooltip/dropdown/card/modal/sidebar/list/page/hero enters and exits and stagger rules; formula `delay = index x stepMs`, cap total sequence duration.[^10] |  |
| Common patterns: fade+rise enter, subtle fade+up exit; modal presentation layering (backdrop, container, content) with staged timing; list add/remove collapse patterns; "return the way it came" direction logic.[^10] |  |
| Guidance on limiting stagger count, leading important elements, and reversing order on exit.[^10] |  |
| Page transition rules: match direction to navigation hierarchy, avoid animating keyboard-driven navigation, keep durations tight.[^10][^3] | Concrete CSS/Framer Motion code, `@keyframes`, `AnimatePresence` `mode="wait"`/`"popLayout"`.[^10] |
|  | Use of `clip-path` for height animation on web, `max-height` hacks.[^10][^4] |

### joy-delight.md

| Timeless | Web-specific |
| :-- | :-- |
| Emotional framing: joy from unexpected but meaningful pleasures; delight must be earned at significant milestones and scaled to importance.[^7] |  |
| Mapping Disney principles to delight: higher squash/stretch, anticipation pullback, focused staging, follow-through, arcs, rich but subordinate secondary actions, higher exaggeration for celebrations.[^7] |  |
| Timing references: pop-in icons, bounce settle, confetti bursts, full celebration sequences, radiating particles, counters, achievements.[^7] |  |
| Joy-specific easing ideas: bouncy/elastic/snappy curves for celebrations; asymmetrical timing with faster starts, slower landings.[^7][^2] |  |
| Patterns: success checkmark pop, like/heart button sequences, staged achievement unlock sequences, confetti systems, score increments, onboarding step mini-celebrations.[^7] |  |
| Rules about when to use delight vs when to avoid (errors, destructive actions, high-frequency interactions, blocking loading states).[^7] |  |
| Accessibility rules for delight: stronger need to respect reduced motion; preserve emotional payoff using color/icon even when motion removed.[^7][^2] | Framer Motion JS/TS code for confetti arrays, `motion.div` with scale arrays, etc.[^7] |
|  | CSS keyframe snippets for success pop.[^7] |

### performance-diagnosis.md

| Timeless | Web-specific |
| :-- | :-- |
| Performance indicators: frame rate drops, input lag, hitching during scroll/transition, CPU/battery spikes.[^4] |  |
| Concept of a frame time budget (e.g., 16ms at 60fps) and that exceeding budget causes dropped frames.[^4] |  |
| Conceptual split between cheap "compositing-only" properties vs those triggering layout and paint; guidance to animate minimal, cheap properties and limit concurrent heavy animations.[^4][^1] |  |
| Diagnosis patterns: choppy motion from animating layout; jitter from late layer promotion; CPU spikes from too many concurrent animations; layout thrashing by interleaved reads/writes; off-screen animations wasting resources.[^4] |  |
| Use of throttling, low-end devices, and stress testing to measure performance under real constraints.[^4] |  |
| Guideline to pause or simplify animations on low-end hardware and when reduced motion is enabled.[^4][^2] | Browser-specific: DevTools panels (Performance, Layers, Rendering, paint flashing), `will-change` memory considerations, CSS vs JS vs WAAPI comparison.[^4][^2] |
|  | React-specific advice about `useState` vs motion values.[^4] |
|  | IntersectionObserver code, WAAPI examples, `requestAnimationFrame` loops.[^4] |

### make-interfaces-feel-better.md

| Timeless | Web-specific |
| :-- | :-- |
| Text behavior details like balanced wrapping and avoiding orphan words; "crisp text" as a perceptual quality.[^6] |  |
| Concentric border-radius formula `outer_radius = inner_radius + padding` for nested shapes; apply wherever elements nest (buttons with icons, cards with media, modals, inputs in forms).[^6] |  |
| Animating icons contextually (opacity, scale, blur) when state changes, rather than abrupt swaps.[^6][^9] |  |
| Tabular numbers for counters/prices/timers to avoid layout jitter when numbers change.[^6][^3] |  |
| Conceptual rule for interruptibility: prefer state-driven transitions that can retarget mid-flight; avoid fixed-timeline animations for interactive gestures.[^6][^5] |  |
| Splitting and staggering entering elements (titles, descriptions, buttons) for more natural sequences; cap total stagger time.[^6][^10] |  |
| Subtle exits vs dramatic entrances; exits typically shorter and with smaller travel.[^6][^10] |  |
| Optical vs geometric alignment; sometimes unequal padding around icons/text yields better perceived alignment.[^6] |  |
| Preference for subtle depth via soft shadows over harsh borders in light themes.[^6] | CSS `text-wrap: balance/pretty`, `-webkit-font-smoothing` implementation details.[^6] |
|  | JSX/Tailwind examples and specific class names.[^6] |
|  | CSS `animation` definitions for stagger, `--stagger` variables, etc.[^6] |

### userinterface-wiki.md

| Timeless | Web-specific |
| :-- | :-- |
| Great animations feel natural and alive; springs and physics-based motion as primary tool for natural, interruptible motion.[^5] |  |
| Great animations are fast and under ~300ms in most product contexts; snappy motion increases perceived performance.[^5][^2] |  |
| Motion should serve understanding: state changes, spatial continuity, onboarding, data transitions; avoid animating keyboard navigation and over-animating.[^5] |  |
| Performance rule-of-thumb: animate cheap compositing-style properties; heavy properties reduce frame rate.[^5][^4] |  |
| Interruptibility as a key quality; transitions should be able to retarget mid-flight when user intent changes.[^5] |  |
| Accessibility principle: for people who reduce motion, keep state clear, possibly replacing motion with simpler transitions or opacity-only changes.[^5][^2] |  |
| "You don't need animations" stance and the three questions (communication vs decoration, frequency, does removal break interaction?).[^5][^1] | WAAPI, CSS vs JS animation performance comparisons, specific `element.animate` examples.[^5] |
|  | Framer Motion `useReducedMotion` usage.[^5][^2] |
|  | `clip-path` reveals, Raycast/Stripe/Tuple as web-specific examples.[^5] |

### practical-tips.md

| Timeless | Web-specific |
| :-- | :-- |
| Practice of recording animations and reviewing frame-by-frame to spot issues; take breaks and re-review with fresh eyes.[^3] |  |
| Subtle button press scale as minimal feedback; avoid animating from zero scale.[^3] |  |
| Tooltip behavior: first tooltip may animate, subsequent tooltips in a session should appear instantly to avoid repetitive delays.[^3] |  |
| Origin-aware animations: elements should scale/expand from logical trigger or anchor.[^3] |  |
| Global timing rules: keep animations fast (< 300ms); avoid animating keyboard interactions; reconsider animation on frequently-used elements.[^3][^5] |  |
| Hover rules: instant-on/ease-off; avoid hover flicker by not moving hit target; disable hover behaviors on touch-only devices.[^3] |  |
| Touch target sizing (~44px minimum), and the idea of enlarging tappable area without changing layout.[^3][^5] |  |
| Easing selection rules aligned with web-animations: ease-out for enter/exit, ease-in-out for on-screen movement, custom curves for intentional motion.[^3][^2] |  |
| Using visual tricks (subtle blur) to bridge state gaps when timing/easing alone doesn't solve artifacts.[^3] | CSS pseudo-elements and specific media queries to disable hover on touch devices.[^3][^2] |
|  | Tailwind-specific examples and `hover:` behavior.[^3] |
|  | `will-change` snippet for shaky animations, plus DevTools debugging flow.[^3][^4] |


***
