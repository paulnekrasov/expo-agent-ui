# **SwiftUI Transition Contracts and CSS Emulation Specifications**

## **Architectural Foundations of State-Driven Motion**

The evolution of user interface engineering has witnessed a profound paradigm shift from imperative object manipulation to declarative, state-driven hierarchical mapping. Within the imperative paradigms historically dominated by frameworks such as UIKit, animations were executed by explicitly commanding a view to alter its properties over a defined temporal window, often relying on delegation patterns or completion closures to manage state synchronization. The declarative environment introduced by SwiftUI fundamentally alters this contract. Views are no longer stateful objects to be manipulated; they are pure functions of state. Motion and transitions are introduced not by dictating a path, but by declaring the spatial, stylistic, and structural properties across distinct states and allowing the underlying rendering engine to interpolate the boundary between them.1

When a state mutation occurs—such as a boolean flag toggling the presence of a modal component—the declarative layout engine calculates the differential between the prior view hierarchy and the subsequent view hierarchy. If a component possesses an explicitly bound transition modifier, the rendering engine translates this declarative intent into a lower-level compositing operation. These operations are typically executed by an underlying layer-based rendering pipeline, such as Core Animation, which delegates the heavy matrix mathematics and pixel rasterization to the graphics processing unit (GPU).1

Understanding the temporal and mathematical contracts of these native animations is of paramount importance for the engineering of high-fidelity, web-based preview renderers. A preview renderer, operating outside the native Apple ecosystem, must perfectly map native iOS layer manipulations to equivalent Document Object Model (DOM) manipulations using Cascading Style Sheets (CSS). To accomplish this feat of emulation, the continuous physics and mathematically defined timing curves of native transitions must be distilled into explicit durations, Bezier control points, and CSS transform or opacity rules. The resulting CSS architecture must bypass main-thread layout thrashing by leveraging hardware-accelerated composite properties, ensuring that the emulated transitions match the frame-rate stability and visual fluidity of the native device experience.

## **The Mathematics of Transition Interpolation**

The rhythmic foundation of most standard, non-spring transitions in the Apple ecosystem is the cubic-Bézier timing curve. In native declarative implementations, this curve is instantiated via functions that define the pace of data transformation over a strictly specified duration.1 A cubic-Bézier timing function dictates the acceleration and deceleration of an animation by mapping time to a progression percentage. The mathematical curve is defined by a starting point fixed at coordinates (0,0), an ending point fixed at coordinates (1,1), and two variable control points, denoted as (c0x, c0y) and (c1x, c1y).3

These control points dictate the slope of the interpolation curve at any given millisecond. The slope of the line defines the speed of the animation at that specific time interval. Steeper slopes cause the animation to appear to run faster, as a larger percentage of the property transformation is completed in a shorter amount of time, whereas shallower slopes cause the animation to appear to run slower.5 When configuring custom animations, developers can leverage the timingCurve(\_:\_:\_:\_:duration:) method, passing in the four Double values representing these coordinates alongside a TimeInterval for the duration.3

The default duration for standard geometric changes and view insertions in the modern iOS environment is universally measured at approximately 0.35 seconds, or 350 milliseconds.3 While more complex gestural interactions and interruptible animations increasingly rely on momentum-based spring physics—which emulate the behavior of physical objects attached to springs to preserve initial velocity and momentum 2—baseline view transitions heavily default to the standard easing curve. This default pacing, commonly referred to as ease-in-out within the ecosystem's timing function enumerations, accelerates out of the resting state, achieves maximum velocity at the midpoint of the transition, and gently decelerates before reaching the final state.7

Reverse-engineering this default ease-in-out behavior yields a standard set of control points: (0.42, 0.0, 0.58, 1.0).4 These points produce a symmetric S-curve. Because CSS transitions also utilize cubic-bezier mathematics for their timing functions, this native configuration translates perfectly into the CSS specification transition-timing-function: cubic-bezier(0.42, 0, 0.58, 1). Web-based preview rendering engines can seamlessly adopt this timing function to ensure that the temporal pacing of emulated DOM elements matches the exact acceleration and deceleration profile of native Core Animation layers.

With the introduction of phase animators and keyframe animators in iOS 17, the framework provided developers with unprecedented granular control over these curves, allowing for multi-step sequences where linear, cubic, and spring keyframes could be combined across independent property timelines.2 However, for standard view hierarchy insertions and removals—such as presenting a sheet or pushing a view—the system defaults to the foundational 350ms cubic-bezier model unless explicitly overridden by a custom transaction.10

## **Architectural Analysis 1: Sheet Presentations**

Modal sheet presentations establish a temporary context for user interaction, overlaid atop the primary application interface. The native declarative sheet presentation modifier (.sheet) is bridged to the underlying UISheetPresentationController, which inherently manages a complex z-axis hierarchy, interruptible drag gestures, and a darkened backdrop layer.12

### **Z-Axis Compositing and Backdrop Dimming Overlays**

When a standard sheet is deployed into the view hierarchy, the underlying content is not entirely obscured or removed from the rendering tree. Instead, it is pushed back perceptually via a dimming layer, creating a sense of depth and focus. The human interface guidelines mandate a specific visual treatment for this layer to ensure optimal contrast and legibility without completely isolating the user from the primary context. The standard implementation utilizes a dark dimming overlay set to exactly 35% opacity.15

Historically, dating back to iOS 7, developers often utilized semi-transparent colors to suggest depth before true blur effects via UIVisualEffectView became highly performant.16 In the modern declarative framework, the presentation background can be customized to utilize thin materials or completely custom views, but the default system behavior remains a solid black layer with a 0.35 alpha channel.17 In a CSS-driven preview architecture, this is traditionally replicated using a fixed-position pseudo-element or a sibling DOM node holding background-color: rgba(0, 0, 0, 0.35). The entrance of this backdrop must perfectly synchronize with the upward translation of the sheet content, animating from an initial state of opacity: 0 to its final state of opacity: 1 over the exact same 350ms duration.18

### **Detent Mechanics and Dynamic Sizing Operations**

With the evolution of the operating system (specifically iOS 16 and later), sheets gained the sophisticated ability to snap to defined "detents." Detents allow a sheet to occupy partial screen heights, such as .medium (occupying approximately 50% of the screen height), .large (expanding to full screen), or strictly customized height metrics calculated dynamically.12

Modifying a sheet's height dynamically after the initial presentation establishes a complex animation challenge. If a developer attempts to update the detent programmatically based on internal view state changes, the system relies on standard layout animations. Without explicit intervention, this resize operation often appears instantaneous, jarring, or disjointed, as it triggers a sudden layout reflow rather than a smooth transition.11 To counteract this, native engineers must frequently utilize tracking mechanisms, such as wrapping the sheet's inner content in a GeometryReader to read the actual rendered height, and explicitly binding that height to a custom detent.11 Furthermore, wrapping the programmatic state mutation in a .transaction block with a defined .easeInOut animation ensures that the height mutation interpolates smoothly.11

A web-based preview renderer replicating this behavior must differentiate structurally between the *entry* translation and a *resize* transition. The entry translation is a GPU-accelerated transform operation moving the component from beyond the bottom screen edge (translateY(100%)) to its resting detent position. A resize transition, however, requires adjusting the height CSS property of an already presented DOM element, which unfortunately triggers layout and paint recalculations in browser engines. To emulate detents smoothly, the preview container should utilize bottom-anchored absolute positioning (bottom: 0), allowing height transitions to naturally expand upward without altering the translateY offset.

REQUIRED OUTPUT FORMAT:

TRANSITION: Sheet presentation (.sheet modifier) Source: [https://developer.apple.com/design/human-interface-guidelines/materials](https://developer.apple.com/design/human-interface-guidelines/materials) 15 Entry animation: Direction: slides up from bottom edge Starting position: translateY(+100%) End position: translateY(0) Duration: 350ms Timing: cubic-bezier(0.42, 0, 0.58, 1\) Dimming overlay: opacity 0 → 0.35 over same duration Dismissal animation: Reverse of entry (translateY back to \+100%) Duration: 350ms Partial sheet (iOS 16+ detents): Starting Y: device\_height \- detent\_height Height mutations post-entry trigger layout reflows; natively driven by spring physics or explicit easeInOut transactions. Preview environments replicate detent shifts via CSS height transitions combined with bottom-anchored positioning to prevent baseline shifting. CSS implementation: .sheet-enter { transform: translateY(100%); } .sheet-enter-active { transform: translateY(0); transition: transform 350ms cubic-bezier(0.42, 0, 0.58, 1); }

## **Architectural Analysis 2: Tab Navigation and State Hydration**

Tabbed navigation interfaces (TabView) are inherently designed to facilitate rapid context switching between distinct, high-level functional silos of an application. The architectural implementation of tab switching has undergone significant revisions throughout the framework's lifecycle, resulting in differing animation contracts based on the deployment target.

### **Immediate Cut versus Cross-Dissolve Paradigms**

Historically, alternating between tabs within a standard UITabBarController or a declarative TabView was a strictly instantaneous operation.22 The architecture favored immediate memory hydration and un-animated state replacement. When a user tapped a new tab, the framework immediately swapped the root view of the hosting controller without any transitional opacity or spatial movement. This design philosophy aimed to minimize user friction and cognitive load, treating tabs as distinct parallel universes rather than spatially connected surfaces. Developers attempting to force continuous animations, such as slide transitions, often had to abandon the native component entirely and construct custom wrapper views relying on manual state observation.24

Recent architectural shifts, specifically introduced in iOS 18 and compiled via Xcode 16, fundamentally altered this default behavior contract. The native tab controller now employs a subtle, automated cross-dissolve effect when navigating between primary sibling views by default.23 This modern cross-fade implementation executes an overlapping opacity interpolation. As the state mutates, the outgoing view transitions from fully opaque to fully transparent, while the incoming view simultaneously transitions from fully transparent to fully opaque. If developers wish to revert to the legacy instantaneous behavior, they must explicitly specify a TransitionCrossDissolve option with a duration of zero, overriding the new system default.23

### **DOM State Hydration and CSS Emulation**

Emulating this modern cross-dissolve architecture in a CSS-based preview renderer demands an overlap of DOM elements during the transition window. Because standard HTML document flow places sibling elements consecutively (which would cause massive vertical or horizontal displacement if both views were rendered simultaneously), the preview renderer must utilize absolute positioning. Both the incoming and outgoing DOM nodes must be anchored identically within their relative parent container (top: 0, left: 0, width: 100%).

When the state changes, the preview engine mounts the new view with an initial style of opacity: 0, while the old view remains at opacity: 1\. A CSS transition is then applied over a uniform duration of approximately 300 milliseconds. This specific duration metric aligns with standard cross-dissolve equivalents within the Apple ecosystem, creating an identical visual cadence to the native counterpart.22 Only after the 300-millisecond transition concludes should the outgoing DOM node be fully unmounted and removed from the layout tree, ensuring garbage collection without interrupting the visual fade. Furthermore, iOS 18 introduced a new floating sidebarAdaptable tab view style for iPadOS, which moves the tab bar to the top of the screen and allows it to transition into a sidebar, further complicating the layout matrix for cross-platform preview rendering.27

REQUIRED OUTPUT FORMAT:

TRANSITION: Tab switching (TabView) Source: [https://medium.com/@adityaramadhan.biz/new-tabbar-transition-animation-in-ios-18-and-xcode-16-ea4b2c4d84d4](https://medium.com/@adityaramadhan.biz/new-tabbar-transition-animation-in-ios-18-and-xcode-16-ea4b2c4d84d4) 23 Animation type: cross-dissolve (iOS 18 default) or immediate cut (pre-iOS 18\) Duration: 300ms or "immediate" CSS implementation: .tab-enter { opacity: 0; position: absolute; top: 0; left: 0; width: 100%; } .tab-enter-active { opacity: 1; transition: opacity 300ms ease-in-out; } .tab-exit { opacity: 1; position: absolute; top: 0; left: 0; width: 100%; } .tab-exit-active { opacity: 0; transition: opacity 300ms ease-in-out; }

## **Architectural Analysis 3: The Asymmetric Linear Interpolation**

The .slide transition represents a foundational layout animation heavily utilized for sequential data presentation, such as onboarding carousels, wizard-based form progression, or detail-view revelation.29 Unlike a simple scale or opacity shift which operate uniformly in place, .slide introduces the complex concept of an *asymmetric* transition behavior.31

### **Leading and Trailing Edge Dynamics**

In native rendering environments, the default slide behavior does not simply reverse its entry vector upon dismissal. When the component enters the view hierarchy, it translates inward from the *leading* edge of the viewport or bounding container.30 The concept of "leading" is intrinsically tied to the localization environment; in a Left-To-Right (LTR) language setting, the leading edge is the left boundary, whereas in a Right-To-Left (RTL) environment, it is the right boundary.

Conversely, when the component is removed from the hierarchy via a state mutation, it does not retreat back to the leading edge. Instead, it continues its linear trajectory and translates outward toward the *trailing* edge.32 This directional continuity provides a powerful psychological cue to the user, implying a forward progression where old content is physically pushed aside by incoming new content. Under the hood, this default behavior is achieved by applying an asymmetric transition modifier, which explicitly defines the insertion property as .move(edge:.leading) and the removal property as .move(edge:.trailing).32 If a developer wishes to reverse this flow (e.g., for a "back" button interaction), they must construct a custom transition that flips these insertion and removal edges.32

### **Implementing Asymmetric DOM Lifecycles**

Translating this geometric asymmetry into a CSS-driven preview engine requires explicit detection of the view's lifecycle phase and the injection of dynamic class names. The mounting phase (entry) requires a starting CSS transform of translateX(-100%) (assuming a standard LTR layout). The unmounting phase (exit) requires transitioning the element from its resting, fully visible position of translateX(0) to an end position of translateX(100%).

This necessitates strictly isolated CSS classes for the enter and leave directives. Furthermore, the parent DOM container encompassing the sliding views must enforce an overflow: hidden property. Without this clipping mask, the DOM elements would bleed outside the visual bounds of the preview device frame during the animation lifecycle, destroying the illusion of a confined mobile screen.

REQUIRED OUTPUT FORMAT:

TRANSITION:.slide (SwiftUI built-in) Source: [https://stackoverflow.com/questions/69663197/how-can-i-reverse-the-slide-transition-for-a-swiftui-animation](https://stackoverflow.com/questions/69663197/how-can-i-reverse-the-slide-transition-for-a-swiftui-animation) 30 Behavior: slides in from leading edge Duration: 350ms CSS: enter: translateX(-100%) → translateX(0) exit: translateX(0) → translateX(100%)

## **Architectural Analysis 4: Affine Matrix Transformations**

The .scale transition fundamentally alters the coordinate space of a view by applying a mathematical multiplier to its physical bounds. Natively, applying a .scale transition instructs the rendering engine to manipulate the view's affine transform matrix.33 When a view is inserted into the declarative hierarchy with this modifier, its scale factor animates from exactly zero (invisible, compressed to a single geometrical point) to its intrinsic magnitude of 1.0 (fully rendered size). Upon removal, the matrix is inverted, shrinking the view back to zero.33

### **Anchor Coordinate Geometry and Sub-pixel Artifacting**

A critical nuance in scaling animations is the definition of the anchor point. The mathematical origin of the scaling transformation defaults to the absolute center of the view's geometry (.center).33 This ensures the element expands symmetrically outward in all directions simultaneously. However, native APIs allow developers to specify alternative anchors (e.g., top-left, bottom-trailing). If an alternative anchor is provided, the scaling matrix originates from that specific coordinate, producing an unfolding or blooming effect rather than a symmetric pop-in effect.

When implementing a .scale transition purely through CSS (transform: scale(0) transitioning to transform: scale(1)), HTML rendering engines can occasionally produce harsh pixelation, text jumping, or sub-pixel rendering artifacts during the earliest frames of the animation. This occurs because the geometry is densely compressed, and font-rendering engines struggle to hint glyphs correctly at microscopic sizes. To counteract this visual degradation, native systems implicitly or explicitly combine the scale transition with a simultaneous opacity transition.31 The component fades in from opacity: 0 to opacity: 1 while simultaneously expanding, effectively masking the initial mathematical compression from the human eye. A faithful CSS preview implementation must mirror this composite transition logic, combining both properties into the transition declaration.

REQUIRED OUTPUT FORMAT:

TRANSITION:.scale (SwiftUI built-in) Source: [https://medium.com/@ganeshrajugalla/swiftui-mastering-transitions-d8e4e08243f4](https://medium.com/@ganeshrajugalla/swiftui-mastering-transitions-d8e4e08243f4) 33 Behavior: scales from 0 to 1 centered on view Anchor:.center (default) or custom Duration: 350ms CSS: enter: scale(0) opacity(0) → scale(1) opacity(1)

## **Architectural Analysis 5: Absolute Vector Displacement**

While the .slide transition implies an asymmetric, content-pushing narrative tied to localization, the .move(edge:) transition offers strict, deterministic, and symmetric vector control. The implementation physically binds the view's origin and destination points to a specific coordinate boundary (Top, Bottom, Leading, or Trailing).30

When the view is inserted into the hierarchy, it begins its lifecycle entirely outside the designated edge of its parent container and translates directly inward to its terminal layout position.34 Upon removal, unlike the .slide transition, the mathematical vector is identically reversed. The view retreats, returning the view to the exact edge from which it originated. This creates a symmetric entrance and exit behavior highly useful for system alerts, drop-down notifications, or custom bottom sheets that do not require the heavy infrastructure of the full UISheetPresentationController.

### **CSS Translation Logic and Symmetric Emulation**

Mapping native .move constraints to a web-based DOM structure relies completely on the translate function within the CSS transform property. The distance mapped corresponds directly to 100% of the element's width (for horizontal edges) or height (for vertical edges), ensuring it completely clears the visible threshold of the clipping boundary.

* For an edge parameter of .bottom, the CSS equivalent initiates at translateY(100%).  
* For an edge parameter of .top, the CSS equivalent initiates at translateY(-100%).  
* For an edge parameter of .leading, the CSS equivalent initiates at translateX(-100%) (assuming LTR).  
* For an edge parameter of .trailing, the CSS equivalent initiates at translateX(100%) (assuming LTR).

Because this specific animation fundamentally alters the visual placement of an element without altering its intrinsic DOM space or box-model dimensions, surrounding non-animating elements might visually pop or jump if the animating view is part of a standard CSS flexbox layout. Native systems handle this seamlessly through simultaneous bounds-interpolation, smoothly expanding the parent container's footprint as the element slides in.34 Preview renderers must account for this by either absolutely positioning the moving element or ensuring the parent container possesses a defined height transition.

REQUIRED OUTPUT FORMAT:

TRANSITION:.move(edge:) (SwiftUI built-in) Source: [https://medium.com/@ganeshrajugalla/swiftui-mastering-transitions-d8e4e08243f4](https://medium.com/@ganeshrajugalla/swiftui-mastering-transitions-d8e4e08243f4) 30 Behavior: slides in from specified edge (.top,.bottom,.leading,.trailing) Duration: 350ms CSS: translateY or translateX based on edge (e.g., translateY(100%) for.bottom)

## **Performance Constraints in Emulation Pipelines**

### **Hardware Acceleration and Subpixel Interpolation**

When replicating these proprietary user interface paradigms in a CSS-based preview architecture, recognizing the fundamental difference in hardware compositing is essential for maintaining frame-rate stability. Native declarative rendering models utilize dedicated GPU-backed layers, performing complex matrix algebra entirely independent of the main UI thread.1 This ensures that even heavy animations execute at a flawless 60 or 120 frames per second.

The equivalent performance in a DOM-based CSS rendering engine is strictly dependent on targeting specific properties that trigger GPU acceleration in standard browser engines (such as WebKit, Blink, or Gecko). Properties like transform and opacity bypass main-thread layout recalculations (often termed 'reflow') and bitmap painting operations ('repaint'), passing the composite layers directly to the graphics processor. Modifying spatial properties such as top, left, width, height, or margin to emulate a geometric transition destroys frame-rate stability, causing the browser to recalculate the box model of every node on the page for every frame of the animation, resulting in a disjointed and jittery preview experience. Therefore, all emulated transitions documented in this report must be strictly confined to transform: translate, transform: scale, and opacity.

### **Handling Concurrent View Mutations**

A persistent, complex challenge in reproducing structural transitions is concurrent animation lifecycle management. When a declarative transition (such as .slide or a tab switch) replaces View A with View B, View A does not instantly disappear from the hierarchical tree. Instead, it exists in a transitional, unmounting state until the temporal duration (e.g., 350ms) entirely lapses.35 During this temporal window, both elements physically occupy the layout bounding box simultaneously.

In CSS rendering engines, this behavior naturally pushes sibling elements out of alignment unless strict layout overriding is applied. High-fidelity preview renderers must construct a temporary "transition group" container logic. This logic actively manages the DOM mounting state, overlaying the exiting DOM node atop the entering node using position: absolute to mimic the Z-axis compositing order inherent to the native platform. Only when the transitionend event fires in JavaScript is the outgoing node safely detached from the DOM, releasing its memory footprint and concluding the emulation sequence.

## **Synthesized Transition Value Matrix**

To facilitate the direct implementation of these mechanics into a preview rendering engine, the following matrix consolidates the temporal and mathematical constants necessary for reproducing native presentation behaviors. The data maps native defaults to their closest CSS approximation. While modern interactions frequently incorporate variable spring physics (where physical velocity dynamically dictates the total duration and bounce), static interpolation via Bézier curves serves as the industry-standard fallback for deterministic web-based preview capabilities.

TRANSITION VALUE CONFIDENCE TABLE:

| Transition | Duration | Curve | Source Quality |
| :---- | :---- | :---- | :---- |
| Push/pop | \~350ms | cubic-bezier(0.42,0,0.58,1) | UNCERTAIN |
| Sheet | \~350ms | cubic-bezier(0.42,0,0.58,1) | HIGH |
| TabView | \~300ms | ease-in-out | HIGH |
| .slide | \~350ms | cubic-bezier(0.42,0,0.58,1) | MEDIUM |
| .scale | \~350ms | cubic-bezier(0.42,0,0.58,1) | MEDIUM |
| .move | \~350ms | cubic-bezier(0.42,0,0.58,1) | MEDIUM |

## **Conclusion**

The precise translation of declarative mobile transitions into scalable, performant CSS equivalents demands rigorous attention to both the temporal algorithms governing speed and the underlying spatial geometry defining movement. By explicitly defining the default baseline duration at approximately 350 milliseconds and locking the easing curve to the standard cubic-bezier(0.42, 0, 0.58, 1\) footprint, an emulation environment can achieve near-perfect parity with the native Core Animation layer.3

Understanding the subtle, yet critical distinctions between asymmetric behaviors—like the continuous leading-to-trailing flow of the .slide modifier 32—and symmetric behaviors—like the edge-locked constraints of the .move modifier 34—ensures that the preview architecture maintains the psychological spatial mapping expected by users and designers alike. As system default behaviors continue to evolve and adapt, beautifully evidenced by the paradigm shift from instantaneous rendering to cross-dissolve automated tab navigation in iOS 18 23, maintaining exact synchronization between declarative state intents and DOM manipulation remains an ongoing, highly technical imperative for the future of interface visualization tooling.

#### **Джерела**

1. Demystifying SwiftUI Animation \- A Comprehensive Guide, доступ отримано квітня 2, 2026, [https://fatbobman.com/en/posts/the\_animation\_mechanism\_of\_swiftui/](https://fatbobman.com/en/posts/the_animation_mechanism_of_swiftui/)  
2. The first step to SwiftUI's Animation System: From Architecture to Advanced iOS 17 Features, доступ отримано квітня 2, 2026, [https://flyingharley.dev/posts/the-first-step-to-swift-ui-s-animation-system-from-architecture-to-advanced-i-os-17-features](https://flyingharley.dev/posts/the-first-step-to-swift-ui-s-animation-system-from-architecture-to-advanced-i-os-17-features)  
3. timingCurve(\_:\_:\_:\_:duration:) | Apple Developer Documentation, доступ отримано квітня 2, 2026, [https://developer.apple.com/documentation/swiftui/animation/timingcurve(\_:\_:\_:\_:duration:)](https://developer.apple.com/documentation/swiftui/animation/timingcurve\(_:_:_:_:duration:\))  
4. SwiftUI Animation's timingcurve creation \- Stack Overflow, доступ отримано квітня 2, 2026, [https://stackoverflow.com/questions/62536385/swiftui-animations-timingcurve-creation](https://stackoverflow.com/questions/62536385/swiftui-animations-timingcurve-creation)  
5. UICubicTimingParameters | Apple Developer Documentation, доступ отримано квітня 2, 2026, [https://developer.apple.com/documentation/uikit/uicubictimingparameters](https://developer.apple.com/documentation/uikit/uicubictimingparameters)  
6. SwiftUI Spring Animation Cheat Sheet for Developers \- GitHub, доступ отримано квітня 2, 2026, [https://github.com/GetStream/swiftui-spring-animations](https://github.com/GetStream/swiftui-spring-animations)  
7. easeInOut | Apple Developer Documentation, доступ отримано квітня 2, 2026, [https://developer.apple.com/documentation/realitykit/animationtimingfunction/easeinout](https://developer.apple.com/documentation/realitykit/animationtimingfunction/easeinout)  
8. AnimationTimingFunction | Apple Developer Documentation, доступ отримано квітня 2, 2026, [https://developer.apple.com/documentation/realitykit/animationtimingfunction](https://developer.apple.com/documentation/realitykit/animationtimingfunction)  
9. Controlling the timing and movements of your animations | Apple Developer Documentation, доступ отримано квітня 2, 2026, [https://developer.apple.com/documentation/SwiftUI/Controlling-the-timing-and-movements-of-your-animations](https://developer.apple.com/documentation/SwiftUI/Controlling-the-timing-and-movements-of-your-animations)  
10. SwiftUI: Animating Timing Curves \- objc.io, доступ отримано квітня 2, 2026, [https://www.objc.io/blog/2019/09/26/swiftui-animation-timing-curves](https://www.objc.io/blog/2019/09/26/swiftui-animation-timing-curves)  
11. Animating content height when changing SwiftUI sheet detent programmatically, доступ отримано квітня 2, 2026, [https://stackoverflow.com/questions/79447807/animating-content-height-when-changing-swiftui-sheet-detent-programmatically](https://stackoverflow.com/questions/79447807/animating-content-height-when-changing-swiftui-sheet-detent-programmatically)  
12. Customizing Sheet Detents in SwiftUI | by Vishal Vijayvargiya | Medium, доступ отримано квітня 2, 2026, [https://medium.com/@vishalvj80000/customizing-sheet-detents-in-swiftui-e961f7d61aba](https://medium.com/@vishalvj80000/customizing-sheet-detents-in-swiftui-e961f7d61aba)  
13. animateChanges(\_:) | Apple Developer Documentation, доступ отримано квітня 2, 2026, [https://developer.apple.com/documentation/uikit/uisheetpresentationcontroller/animatechanges(\_:)](https://developer.apple.com/documentation/uikit/uisheetpresentationcontroller/animatechanges\(_:\))  
14. SwiftUI Presentations with Modals, Bottom Sheets, and FullScreen cover in iOS \- YouTube, доступ отримано квітня 2, 2026, [https://www.youtube.com/watch?v=GLAX8wB0-o8](https://www.youtube.com/watch?v=GLAX8wB0-o8)  
15. Materials | Apple Developer Documentation, доступ отримано квітня 2, 2026, [https://developer.apple.com/design/human-interface-guidelines/materials](https://developer.apple.com/design/human-interface-guidelines/materials)  
16. iOS 7 Translucent Modal View Controller \- Codemia, доступ отримано квітня 2, 2026, [https://codemia.io/knowledge-hub/path/ios\_7\_translucent\_modal\_view\_controller](https://codemia.io/knowledge-hub/path/ios_7_translucent_modal_view_controller)  
17. How can I make a background color with opacity on a Sheet view? \- Stack Overflow, доступ отримано квітня 2, 2026, [https://stackoverflow.com/questions/63745084/how-can-i-make-a-background-color-with-opacity-on-a-sheet-view](https://stackoverflow.com/questions/63745084/how-can-i-make-a-background-color-with-opacity-on-a-sheet-view)  
18. Customizing modal presentation background and color scheme in SwiftUI \- Nil Coalescing, доступ отримано квітня 2, 2026, [https://nilcoalescing.com/blog/ModalPresentationBackgroundAndColorSchemeInSwiftUI](https://nilcoalescing.com/blog/ModalPresentationBackgroundAndColorSchemeInSwiftUI)  
19. How can I change the opacity of the overlay behind UIPopoverPresentationController?, доступ отримано квітня 2, 2026, [https://stackoverflow.com/questions/32697436/how-can-i-change-the-opacity-of-the-overlay-behind-uipopoverpresentationcontroll](https://stackoverflow.com/questions/32697436/how-can-i-change-the-opacity-of-the-overlay-behind-uipopoverpresentationcontroll)  
20. BottomSheets and PresentationDetents in SwiftUI \- YouTube, доступ отримано квітня 2, 2026, [https://www.youtube.com/watch?v=8JmGGcsUdFM](https://www.youtube.com/watch?v=8JmGGcsUdFM)  
21. SwiftUI Sheet Auto-Sizing: Dynamic Height Based on Content \- Fatbobman's Blog, доступ отримано квітня 2, 2026, [https://fatbobman.com/en/snippet/how-to-make-a-swiftui-sheet-automatically-adjust-height/](https://fatbobman.com/en/snippet/how-to-make-a-swiftui-sheet-automatically-adjust-height/)  
22. Animate transition between views of TabView in SwiftUI \- Apple Developer, доступ отримано квітня 2, 2026, [https://developer.apple.com/forums/thread/722475](https://developer.apple.com/forums/thread/722475)  
23. New TabBarController Transition Animation in iOS 18 and Xcode 16 | by Aditya Ramadhan, доступ отримано квітня 2, 2026, [https://medium.com/@adityaramadhan.biz/new-tabbar-transition-animation-in-ios-18-and-xcode-16-ea4b2c4d84d4](https://medium.com/@adityaramadhan.biz/new-tabbar-transition-animation-in-ios-18-and-xcode-16-ea4b2c4d84d4)  
24. Animate transition between views of TabView in SwiftUI \- Reddit, доступ отримано квітня 2, 2026, [https://www.reddit.com/r/SwiftUI/comments/zx2udn/animate\_transition\_between\_views\_of\_tabview\_in/](https://www.reddit.com/r/SwiftUI/comments/zx2udn/animate_transition_between_views_of_tabview_in/)  
25. Adding animation to TabViews in SwiftUI when switching between tabs \- Stack Overflow, доступ отримано квітня 2, 2026, [https://stackoverflow.com/questions/72496023/adding-animation-to-tabviews-in-swiftui-when-switching-between-tabs](https://stackoverflow.com/questions/72496023/adding-animation-to-tabviews-in-swiftui-when-switching-between-tabs)  
26. How to animate Tab bar tab switch with a CrossDissolve slide transition? \- Stack Overflow, доступ отримано квітня 2, 2026, [https://stackoverflow.com/questions/44346280/how-to-animate-tab-bar-tab-switch-with-a-crossdissolve-slide-transition](https://stackoverflow.com/questions/44346280/how-to-animate-tab-bar-tab-switch-with-a-crossdissolve-slide-transition)  
27. Deep Dive into TabView Changes in iOS18 \- YouTube, доступ отримано квітня 2, 2026, [https://www.youtube.com/watch?v=hIoxphFMjYw](https://www.youtube.com/watch?v=hIoxphFMjYw)  
28. Enhancing your app's content with tab navigation | Apple Developer Documentation, доступ отримано квітня 2, 2026, [https://developer.apple.com/documentation/SwiftUI/Enhancing-your-app-content-with-tab-navigation](https://developer.apple.com/documentation/SwiftUI/Enhancing-your-app-content-with-tab-navigation)  
29. Animating views and transitions — SwiftUI Tutorials | Apple Developer Documentation, доступ отримано квітня 2, 2026, [https://developer.apple.com/tutorials/swiftui/animating-views-and-transitions](https://developer.apple.com/tutorials/swiftui/animating-views-and-transitions)  
30. SwiftUI Animations: The Basics of Animations and Transitions | by Midlaj \- Medium, доступ отримано квітня 2, 2026, [https://medium.com/@midhlag55/swiftui-animations-the-basics-of-animations-and-transitions-5dfae5ce4268](https://medium.com/@midhlag55/swiftui-animations-the-basics-of-animations-and-transitions-5dfae5ce4268)  
31. Advanced SwiftUI Transitions, доступ отримано квітня 2, 2026, [https://swiftui-lab.com/advanced-transitions/](https://swiftui-lab.com/advanced-transitions/)  
32. How can I reverse the slide transition for a SwiftUI animation? \- Stack Overflow, доступ отримано квітня 2, 2026, [https://stackoverflow.com/questions/69663197/how-can-i-reverse-the-slide-transition-for-a-swiftui-animation](https://stackoverflow.com/questions/69663197/how-can-i-reverse-the-slide-transition-for-a-swiftui-animation)  
33. \[SwiftUI\] Mastering Transitions. Transitions | by ganeshrajugalla | Medium, доступ отримано квітня 2, 2026, [https://medium.com/@ganeshrajugalla/swiftui-mastering-transitions-d8e4e08243f4](https://medium.com/@ganeshrajugalla/swiftui-mastering-transitions-d8e4e08243f4)  
34. SwiftUI Animation Slide In and Out \- Stack Overflow, доступ отримано квітня 2, 2026, [https://stackoverflow.com/questions/63223542/swiftui-animation-slide-in-and-out](https://stackoverflow.com/questions/63223542/swiftui-animation-slide-in-and-out)  
35. How can you transition the size of a view back and forth in SwiftUI? \- Stack Overflow, доступ отримано квітня 2, 2026, [https://stackoverflow.com/questions/61459990/how-can-you-transition-the-size-of-a-view-back-and-forth-in-swiftui](https://stackoverflow.com/questions/61459990/how-can-you-transition-the-size-of-a-view-back-and-forth-in-swiftui)