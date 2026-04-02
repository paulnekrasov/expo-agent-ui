# **SwiftUI Chrome Geometry and Layout Contracts: A Deep Dive into NavigationStack and TabView**

## **Introduction to the SwiftUI Layout Paradigm**

The structural integrity of any application interface built within the SwiftUI framework relies upon a highly deterministic, multi-phase layout negotiation protocol. This fundamental architecture enforces a strict demarcation between the physical dimensions of the host device's screen and the logical, functional coordinate space made available to the view hierarchy. At the core of this engine is a three-step negotiation process: the parent container proposes a specific bounding box (the ProposedViewSize), the child calculates its own dimensions based on its internal content constraints and that proposal, and the parent finally dictates the exact placement of the child within its coordinate system.1

However, this otherwise straightforward layout computation is profoundly intercepted and mutated by the presence of system-rendered chrome—specifically, navigation bars and tab bars. These high-level structural containers, primarily the NavigationStack and TabView, act as critical layout arbiters. They do not merely house content; they actively consume physical pixels, redefine the logical layout proposals passed down the abstract syntax tree (AST), and restructure the environment's safe area insets.2 The safe area—a foundational layout construct designed to prevent interface overlap with hardware bezels, camera notches, dynamic islands, and home indicators—is dynamically augmented by these chrome elements.3

Understanding the precise geometric footprint of this chrome is an absolute necessity for any external system attempting to replicate, simulate, or formally model the SwiftUI layout algorithm. Specifically, in the context of building a TypeScript-based layout engine capable of rendering a SwiftUI Intermediate Representation (IR), the layout contracts governing these components must be translated into explicit mathematical models. The layout contracts detailed in this comprehensive report establish the strict physical boundaries, the scroll-driven dynamic behaviors, and the downstream safe area modifications enforced by NavigationStack and TabView. By decoupling the device's physical hardware insets from the logical layout proposals, we can construct a mathematically sound rendering pipeline that achieves true pixel-fidelity with the native iOS rendering engine.

## **The NavigationStack Layout Architecture**

The NavigationStack, introduced in iOS 16 to supersede the older, less predictable NavigationView, serves as the primary routing mechanism and top-edge chrome provider in modern SwiftUI development.4 Unlike its predecessor, which often struggled with state restoration and deep linking due to its view-bound routing nature, the NavigationStack employs a robust, value-driven routing paradigm utilizing a NavigationPath.4 From a geometric and layout perspective, the NavigationStack assumes absolute authority over the top safe area inset of the application window.

Its primary layout responsibility is the allocation, rendering, and dynamic resizing of the navigation bar chrome. This chrome is not a static rectangle; it is a highly responsive structural component that modifies its height based on user interactions, primarily scroll offsets originating from deeper within the view hierarchy.6 The NavigationStack must continuously intercept the device's baseline hardware insets, calculate its own required geometry based on its current display mode, and then generate a restricted bounding box proposal to its immediate child view.

The strict layout contract governing the geometry, safe area manipulation, and programmatic modeling of the NavigationStack is defined below.

LAYOUT CONTRACT: NavigationStack

Source: [developer.apple.com/documentation/swiftui/navigationstack](https://developer.apple.com/documentation/swiftui/navigationstack)

Chrome geometry:

Standard title bar consumes: 44pt (height) from top of safe area

Large title bar consumes: 96pt (height) from top of safe area

Transition threshold: The large title dynamically collapses into the standard title over a 52pt scroll offset threshold. The transition begins precisely when the global minY of the scrolling content drops below the bottom edge of the expanded navigation bar and concludes when 52pt of upward scroll translation has occurred.

Proposal to content child:

Available width: device\_width (full width, hardware safe area horizontal insets may apply)

Available height: safe\_area\_height \- navigation\_bar\_height

Note: Content strictly STARTS below the navigation bar's bottom edge (y \= top\_hardware\_inset \+ navigation\_bar\_height).

Safe area adjustment for content:

The navigation bar reduces the TOP safe area inset available to its root view.

The root view's effective top safe area \= device\_top\_safe\_area \+ navigation\_bar\_height

UNLESS the ignoresSafeArea(.all, edges:.top) modifier is explicitly applied to the child.

TypeScript implementation hint:

\<In the layout engine, model the NavigationStack as a strict vertical container wrapping a single content node. During the measure phase, calculate the available height by subtracting the current active bar height (44pt or 96pt) from the total vertical proposal. Inject an environment variable into the downstream context overriding the safeAreaInsets.top value to reflect the combined hardware and chrome dimension. For the placement phase, offset the child's local origin Y-coordinate by this combined value.\>

## **Top Safe Area Reduction and Chrome Geometry Mathematics**

The geometric impact of the NavigationStack is most profoundly felt in its manipulation of the top safe area. When the layout engine initiates the render pass for a NavigationStack, it first interrogates the host device for its physical hardware constraints. On contemporary iOS hardware featuring a notch or Dynamic Island, this baseline physical top inset is generally around 47pt, while older devices with rectangular screens maintain a 20pt physical top inset.2 The NavigationStack takes this physical boundary as its absolute origin (y \= 0 in its local coordinate space) and projects its chrome downward.

The standard, inline navigation bar—the default state when pushing child views deeper into the stack—requires an explicit 44pt of vertical space.8 Consequently, the effective top safe area broadcast to the child views becomes the sum of the device hardware inset and the standard chrome height. However, the default behavior for the root view of a NavigationStack relies on the .large title display mode. The large title bar drastically alters the layout math, consuming 96pt of vertical space.8

When this large title is active, the ProposedViewSize passed to the child view is heavily truncated. The child's layout origin is pushed vertically downwards, starting exactly at the boundary where the 96pt chrome terminates.6

| Chrome Display Mode | Base Chrome Height | Example Hardware Inset | Total Layout Y-Offset | Impact on Child Proposal |
| :---- | :---- | :---- | :---- | :---- |
| **Hidden** (.hidden) | 0pt | 47pt | 47pt | Proposal equals screen height minus 47pt. |
| **Standard / Inline** | 44pt | 47pt | 91pt | Proposal truncated by 91pt; content begins at y \= 91\. |
| **Large Title** | 96pt | 47pt | 143pt | Proposal truncated by 143pt; content begins at y \= 143\. |

This mathematical reduction is absolute unless explicitly bypassed by the developer. If a descendant view applies the .ignoresSafeArea(.all, edges:.top) modifier, the SwiftUI layout engine invalidates the NavigationStack's restricted bounding box proposal for that specific node.9 The child view will instead calculate its bounds using the absolute top edge of the device screen (y \= 0), rendering its background layer or content underneath the translucent material of the navigation bar. This modifier does not destroy the chrome; it merely allows the child to opt out of the safe area boundary constraint.

In a TypeScript simulation of this environment, the ignoresSafeArea modifier must be modeled as a bitmask or a context flag passed up the AST during the measurement phase. If the flag is detected, the engine must restore the previously subtracted 96pt or 44pt back to the ProposedViewSize.height and reset the placement Y-origin to zero.

## **The Scroll Offset Transition Threshold Mechanism**

The layout contract of the NavigationStack reaches its highest complexity when resolving the dynamic transition between the 96pt large title and the 44pt inline title.11 To optimize screen real estate while maintaining user context, the system tracks scroll interactions and collapses the large title, reclaiming precisely 52pt of vertical layout space for the content proposal.

The architectural rule governing this behavior dictates that the NavigationStack must bind its title bar expansion and contraction logic to the first, highest-level scrollable container it encounters within its AST.12 This scrollable container is typically a ScrollView or a List. The layout engine executes a depth-first traversal of the view hierarchy. Upon identifying a scrollable node, it establishes a persistent layout binding between the contentOffset of that container and the height constraint of the navigation chrome.

The mathematical transition threshold is explicitly tied to the geometric delta between the large and inline states. The transition initiates the moment the scroll view's content is translated upwards (a positive shift in the Y-axis content offset). The 96pt large title begins to clip, fade, and resize. The transition achieves its fully collapsed state into the 44pt inline title exactly when the scroll offset matches the delta of the large title area—which is 52pt.13

For a TypeScript engine, calculating this threshold requires continuously sampling the minY value of the scrolling content's frame relative to the global coordinate space.11

| Scroll State | Global minY Offset Delta | Computed Chrome Height | Remaining Transition Delta |
| :---- | :---- | :---- | :---- |
| **At Top (Resting)** | 0pt | 96pt | 52pt |
| **Scrolling Up** | 20pt | 76pt | 32pt |
| **Scrolling Up** | 40pt | 56pt | 12pt |
| **Fully Scrolled** | \>= 52pt | 44pt (Clamped) | 0pt |

If the view hierarchy contains multiple nested scroll views, the NavigationStack adheres strictly to the outermost scroll container.12 If a user interacts with the outermost view, the navigation bar collapses dynamically. However, if the user interacts with a nested, inner scroll view while the outer container remains at its origin, the navigation bar remains locked in its 96pt large state. This strict adherence to the highest-level scroll view often leads to layout glitches or "sticky" titles in native development if custom GeometryReader wrappers disrupt the system's ability to identify the primary scroll boundary.13 In a TypeScript implementation, the AST parsing phase must flag the first encountered scroll node as the primaryScrollTarget and ignore any subsequent scroll nodes for the purpose of chrome state management.

## **Content Proposal and Intermediate Representation Modeling**

When architecting a TypeScript-based layout engine to replicate the NavigationStack layout pass, the algorithm must perfectly synthesize the ProposedViewSize requested by the NavigationStack and the restricted proposal it subsequently passes to its child.1 The available height provided to the content is never simply the device screen height. The layout algorithm must execute the following sequential constraints:

1. **Retrieve Global Context:** Obtain the absolute device screen dimensions (e.g., a bounding box of width: 393, height: 852).  
2. **Retrieve Hardware Safe Area:** Extract the device-specific physical safe area insets (e.g., Top: 47, Bottom: 34).  
3. **Determine Chrome State:** Evaluate the active NavigationBarTitleDisplayMode and the current scroll offset to determine if the active chrome height is 44pt or 96pt.  
4. **Calculate Total Top Restriction:** Sum the hardware inset and the active chrome height. 47 (Hardware) \+ 96 (Large Title) \= 143pt.  
5. **Generate Child Proposal:** Calculate the resulting bounding box. Proposed Height \= 852 (Total) \- 143 (Top Restriction) \- 34 (Bottom Hardware Inset) \= 675pt.

The ProposedViewSize dispatched to the root child of the NavigationStack will explicitly propose a maximum height of 675pt. The child view utilizes this constraint to resolve its own ideal size. If the child is a "fitting" view (such as a VStack containing a few lines of Text), it will consume only the absolute minimum space required to render its typography.15 If the child is a "filling" view (such as a Color block or a ScrollView), it will greedily consume the entire proposed 675pt.15 Following the size resolution, the placement phase mandates that the engine position the child at a local Y-offset equal to the total top restriction (y \= 143). This strictly enforces the rule that content begins exactly below the navigation bar's bottom boundary.

## **The TabView Layout Architecture**

Operating at the opposite extreme of the vertical layout axis, the TabView anchors the application's root navigational paradigm to the absolute bottom edge of the display.16 It fundamentally manipulates the bottom safe area geometry and dictates an exceedingly strict rendering and evaluation policy. Unlike layout containers such as ZStack or VStack, which evaluate and measure all of their children, the TabView operates as a conditional multiplexer, where only the actively selected branch of the abstract syntax tree is computed, measured, and displayed.16

The precise ruleset governing the geometric footprint, layout proposal generation, and TypeScript implementation strategy for the TabView is outlined in the layout contract below.

LAYOUT CONTRACT: TabView

Source: [developer.apple.com/documentation/swiftui/tabview](https://developer.apple.com/documentation/swiftui/tabview)

Chrome geometry:

Tab bar height: \~49pt

Tab bar position: Anchored to the absolute bottom of the device screen, superimposed over the physical home indicator safe area.

Proposal to selected content:

Available height: safe\_area\_height \- tab\_bar\_height

Crucial distinction: The tab bar does NOT reduce the bottom safe area seen by content to zero. Instead, the content's reported bottom safe area becomes: device\_bottom\_safe\_area \+ tab\_bar\_height.

(This behavior persists unless the ignoresSafeArea modifier is explicitly applied to the content).

Selected tab rendering:

Only the currently-selected tab's content is processed by the layout engine. Unselected tabs are discarded from the active render tree.

For the TypeScript engine: Stub the active layout tree by isolating the node at the active selection index (or default to index 0).

TypeScript implementation hint:

\<In the IR and layout engine, model the TabView as a conditional rendering container (a switch router). Retrieve the active tab via the environment selection binding, and exclusively traverse that specific child's layout path. Subtract 49pt from the bottom of the bounding box height proposal. Crucially, propagate a heavily modified safeAreaInsets.bottom environment value down to the child node, ensuring that downstream scrolling containers automatically append the correct amount of bottom padding to clear the chrome.\>

## **Bottom Safe Area Restructuring and Tab Bar Mathematics**

The TabView chrome relies on the persistent tab bar, which enforces a standard height of approximately 49pt across the vast majority of iOS device classes.18 However, the geometric relationship between the tab bar and the physical hardware safe area is distinctly different and more additive than the top navigation bar's relationship. The tab bar is anchored to the absolute bottom edge of the device display. Consequently, it fully encompasses, overlaps, and absorbs the hardware's bottom safe area inset—most commonly the physical home indicator region, which typically measures 34pt on FaceID-enabled devices.2

Because of this overlap, the total physical screen real estate consumed by the tab bar layout from the absolute bottom of the screen is the additive sum of the tab bar's standard height and the physical hardware inset. On a modern iPhone, this geometric consumption equates to exactly 49pt \+ 34pt \= 83pt.18 For older device architectures featuring a physical home button (where the bottom hardware inset evaluates to 0pt), the total consumed vertical space remains strictly 49pt.

When formulating the layout proposal for the active content child, the TabView truncates the available height by this total consumed amount. However, the nuanced phrasing of the layout contract regarding the downstream safe area environment is of critical importance: the TabView does *not* reduce the bottom safe area observed by its children. In a highly counterintuitive but mechanically brilliant move, it *increases* the logical bottom safe area broadcast down the view hierarchy.2 The descendant content views inherit an environment where the bottom safe area inset is explicitly mandated as device\_bottom\_safe\_area \+ tab\_bar\_height (resulting in the aforementioned 83pt).

| Environment Variable | Source Dimension | Impact on Cumulative Bottom Offset |
| :---- | :---- | :---- |
| **Physical Hardware Inset** | 34pt (Home Indicator) | 34pt |
| **Tab Bar Chrome Requirement** | 49pt | 83pt |
| **Effective Child Bottom Safe Area** | Environment Broadcast | **83pt** |

This geometric augmentation is absolutely essential for the correct layout resolution of components like ScrollView and List. Because the bottom safe area is reported via the environment as 83pt, a ScrollView embedded within a TabView will automatically and transparently apply exactly 83pt of internal padding to the bottom edge of its scrollable content matrix.3 This native padding ensures that when a user scrolls to the absolute terminal bound of a list, the final row of content rests perfectly above the translucent tab bar, rather than remaining permanently obscured behind the 83pt chrome boundary.

If a developer intentionally applies the .ignoresSafeArea(.all, edges:.bottom) modifier to a view *inside* the TabView hierarchy, the layout engine will deliberately discard the 83pt safe area restriction for that node.2 The content's bounding box will instantly expand to the absolute bottom edge of the display (y \= device\_height), rendering its background layers underneath the blurred material of the tab bar. Conversely, attempting to apply .ignoresSafeArea() directly to the TabView container itself often yields structural anomalies and undefined layout behaviors, occasionally shifting the native page indicators or tab icons completely outside of their intended hardware bounds.17

## **Multiplexing and TypeScript AST Optimization**

A foundational performance optimization intrinsic to the TabView layout contract is its conditional, multiplexed rendering strategy. Unlike a standard ZStack layout container, which must compute the constraints, ideal sizes, and placements for all of its child views regardless of their opacity, z-index, or visibility, the TabView operates as a strict routing multiplexer.17 The engine exclusively executes the layout pass, state resolution, and geometry computation for the singular view branch associated with the currently active selection binding.

For a TypeScript-based layout engine tasked with replicating SwiftUI's architecture, this demands a highly specialized Intermediate Representation (IR) handling mechanism. The layout engine must aggressively prune the AST and prevent the traversal or constraint resolution of inactive tab routes.

The algorithmic flow for implementing this multiplexing within a TypeScript environment should follow these directives:

1. **AST Parsing and Evaluation:** Upon encountering a TabView node in the IR, immediately resolve its selection binding value from the environment or local state dictionary. If no explicit binding is present, default to index 0\.16  
2. **Child Node Isolation:** Isolate the single child node corresponding to the resolved active index. Completely discard the layout subtrees of all unselected tabs. This mirrors SwiftUI's strict memory and CPU optimization protocols.  
3. **Proposal Modification:** Calculate the constrained bounding box. Box Height \= Device Height \- Top Safe Area Context \- (49 \+ Device Bottom Safe Area).  
4. **Environment Injection:** Mutate the active environment context injected down the active subtree, overriding the safeAreaInsets.bottom property with the computed 83pt value. This environmental injection guarantees that any simulated ScrollView nodes encountered further down the isolated AST will correctly pad their content matrices based on the simulated chrome.

## **Edge Cases, Anomalies, and Advanced Modifiers**

While the baseline layout contracts for NavigationStack and TabView are highly structured, the SwiftUI layout engine introduces several advanced modifiers and edge-case scenarios that mathematically disrupt the standard bounding box proposals. A robust TypeScript simulation must account for these deviations to achieve complete layout parity.

### **The Ambiguity of TabView Inside Infinite Proposals**

A heavily documented anomaly within the TabView layout contract manifests when it is placed inside a vertically scrolling container without a fixed frame constraint. The TabView is designed to consume the layout space proposed to it, defaulting to expanding to fill the available dimensions. However, placing it inside a ScrollView fundamentally breaks this assumption, because a ScrollView proposes an infinity height constraint to its children.20

In the native SwiftUI layout engine, a TabView refuses to report its intrinsic vertical size requirements based on the aggregated dimensions of its children.20 Therefore, when a ScrollView provides an infinity proposal, the TabView is unable to resolve its ideal size and often collapses to a zero-height or minimal bounding box. To model this correctly in TypeScript, the engine must implement a strict validation rule: if a TabView node receives an infinity height proposal 1, the engine must assert whether an explicit .frame(height:...) modifier is present on the node. If no strict bounding constraint is found, the engine must gracefully fall back to a predefined minimal bounding box (e.g., 0pt), perfectly mirroring the native failure state.

### **The ContainerRelativeFrame Divergence**

The interaction between system chrome and the containerRelativeFrame modifier, introduced in iOS 17, further complicates the mathematical layout contracts. This modifier allows a view to declare its size as a fractional multiple of its nearest structural container (e.g., rendering a view at exactly one-third the height of the screen).21

When a view embedded inside a NavigationStack utilizes .containerRelativeFrame(.vertical, { height, \_ in height / 2 }), the layout algorithm is forced to determine what the absolute "container height" is before applying the fractional math.21 The official layout contract explicitly dictates that the provided base size is the container's physical size *subtracting any safe area insets* applied to that container.21

However, empirical observation of the native engine reveals a critical divergence in behavior based on the specific container type housing the view:

* When executing inside a TabView, the containerRelativeFrame base value is calculated as the total device height minus the hardware safe areas and minus the 49pt tab bar chrome.21  
* When executing inside a NavigationSplitView, the engine aggressively subtracts the active navigation bar height.21  
* Critically, when executing inside a standard NavigationStack, the engine remarkably does *not* subtract the toolbar height for the calculation. It instead relies strictly on the total device height minus the hardware safe areas.21

This nuance is an essential requirement for exact TypeScript replication. If the TS engine blindly subtracts the 96pt or 44pt chrome height when processing a containerRelativeFrame calculation inside a NavigationStack, the resulting fraction will be mathematically incorrect, resulting in descendant views that are slightly too small compared to the native SwiftUI rendering.

### **Modifying the Contract: Additive Safe Area Insets**

While the NavigationStack and TabView establish the primary baseline for chrome geometry, the layout contract is not immutable. It can be dynamically modified at runtime using the safeAreaInset and safeAreaPadding modifiers.2

Prior to iOS 15, introducing custom functional chrome—such as a persistent floating action button or a custom auxiliary bottom navigation bar—required complex, manual padding calculations, as there was no native mechanism to broadcast a custom safe area reduction to descendant scroll views.2 The introduction of the safeAreaInset modifier allows developers to append custom layout geometry directly to the existing logical contract.

When .safeAreaInset(edge:.bottom) is applied to the content hierarchy inside a NavigationStack or TabView, the layout engine executes an additive mathematical calculation.2 For example, if a custom 60pt floating auxiliary bar is added to the bottom of a view inside a TabView, the engine retrieves the existing 83pt effective bottom safe area (the sum of the Home Indicator and Tab Bar) and adds 60pt to it. The newly broadcast bottom safe area immediately becomes 143pt. Any ScrollView or List within this mutated hierarchy will automatically intercept this new environment value and update its internal content matrix to append exactly 143pt of padding to its bottom boundary. This ensures that the final scrolling element perfectly clears both the native Tab Bar and the custom floating auxiliary view.2

Historically, applying .safeAreaInset directly to the deprecated NavigationView container failed to propagate the inset properly to child views, resulting in overlapping layouts.22 However, the modern NavigationStack architecture strictly respects this additive property. In the TypeScript engine, whenever a safeAreaInset modifier is encountered, the layout pass must dynamically shrink the ProposedViewSize passed to the child node while simultaneously expanding the corresponding safe area variable in the localized environment dictionary.

### **Keyboard Safe Area Dynamics and Interruptions**

The final, highly volatile geometric variable in these layout contracts is the software keyboard safe area. By default, the SwiftUI layout engine automatically and globally adjusts the bottom safe area when the software keyboard is invoked, aggressively shrinking the available vertical proposal to prevent text inputs and vital UI components from being physically obscured.23

If a view inside a TabView summons the keyboard, the layout engine immediately overrides the existing bottom safe area calculation. The 83pt tab bar safe area contract is temporarily suspended and replaced entirely by the physical height of the keyboard (which varies dynamically by device model, language, and predictive text settings, but is typically in excess of 300pt). If the developer explicitly applies the .ignoresSafeArea(.keyboard) modifier to the container, the layout engine rejects the keyboard's overriding height proposal and forces the view to maintain the original TabView 83pt bottom inset contract.23

For the TypeScript engine, this behavior requires precise boolean flag tracking within the layout environment's state manager. The engine must be capable of smoothly toggling between the standard chrome inset calculation and the overriding keyboard inset calculation based on virtual focus events, while constantly validating against the presence of the .ignoresSafeArea(.keyboard) bitmask.

## **Layout Contract Synthesis**

The SwiftUI layout engine operates as a highly deterministic, constraint-based mathematical system. The structural components NavigationStack and TabView do not merely serve as visual decorations; they are foundational layout interceptors that fundamentally alter the coordinate space, bounding box proposals, and environmental variables of their entire descendant trees.

The NavigationStack strictly governs the top-edge geometry. It enforces a rigid upper bound by projecting a 96pt expanded or 44pt inline chrome block downwards from the physical hardware safe area. Its most complex operation is the dynamic scroll threshold transition, which requires the engine to track global minY offsets of the primary AST scroll node and mathematically collapse the 52pt delta between the large and standard states.

Conversely, the TabView establishes a 49pt baseline at the bottom edge of the display, merging seamlessly with the physical home indicator to generate an augmented 83pt effective bottom safe area. This unique additive behavior ensures that child views are heavily constrained in their overall bounding box proposals, yet they retain the necessary environmental padding data to allow scrollable content matrices to pass fluidly behind translucent chrome without permanent occlusion.

Replicating these layout contracts within a custom TypeScript rendering engine requires absolute adherence to these dimensional reductions. Accurately modeling the AST parsing to aggressively strip inactive TabView multiplexer branches, tracking scroll deltas for continuous NavigationStack frame recalculations, parsing containerRelativeFrame behavioral divergences, and securely manipulating the additive variables of the environmental safe area insets guarantees that the simulated layout engine will achieve perfect pixel fidelity and structural harmony with Apple's native rendering pipeline.

#### **Джерела**

1. ProposedViewSize | Apple Developer Documentation, доступ отримано квітня 1, 2026, [https://developer.apple.com/documentation/swiftui/proposedviewsize](https://developer.apple.com/documentation/swiftui/proposedviewsize)  
2. Mastering Safe Area in SwiftUI \- Fatbobman's Blog, доступ отримано квітня 1, 2026, [https://fatbobman.com/en/posts/safearea/](https://fatbobman.com/en/posts/safearea/)  
3. Safe Area \- SwiftUI Field Guide, доступ отримано квітня 1, 2026, [https://www.swiftuifieldguide.com/layout/safe-area/](https://www.swiftuifieldguide.com/layout/safe-area/)  
4. ios \- SwiftUI \- how to avoid navigation hardcoded into the view? \- Stack Overflow, доступ отримано квітня 1, 2026, [https://stackoverflow.com/questions/61304700/swiftui-how-to-avoid-navigation-hardcoded-into-the-view](https://stackoverflow.com/questions/61304700/swiftui-how-to-avoid-navigation-hardcoded-into-the-view)  
5. Mastering Navigation in SwiftUI: The 2025 Guide to Clean, Scalable Routing \- Medium, доступ отримано квітня 1, 2026, [https://medium.com/@dinaga119/mastering-navigation-in-swiftui-the-2025-guide-to-clean-scalable-routing-bbcb6dbce929](https://medium.com/@dinaga119/mastering-navigation-in-swiftui-the-2025-guide-to-clean-scalable-routing-bbcb6dbce929)  
6. Mastering Large Titles in iOS Swift: Build Beautiful Navigation Bars Like a Pro (UIKit & SwiftUI Guide 2026\) | by Garejakirit | Medium, доступ отримано квітня 1, 2026, [https://medium.com/@garejakirit/large-title-in-ios-swift-bfa4fc1f8b37](https://medium.com/@garejakirit/large-title-in-ios-swift-bfa4fc1f8b37)  
7. Customizing the appearance of the NavigationStack title in SwiftUI \- Tanaschita.com, доступ отримано квітня 1, 2026, [https://tanaschita.com/switui-navigationstack-customize-title/](https://tanaschita.com/switui-navigationstack-customize-title/)  
8. Why does the navigation title change from large to "scrolled" when popping a NavigationLink inside a NavigationStack on iOS 16? \- Stack Overflow, доступ отримано квітня 1, 2026, [https://stackoverflow.com/questions/74330967/why-does-the-navigation-title-change-from-large-to-scrolled-when-popping-a-nav](https://stackoverflow.com/questions/74330967/why-does-the-navigation-title-change-from-large-to-scrolled-when-popping-a-nav)  
9. How does the Safe Area got ignored without ignoring : r/SwiftUI \- Reddit, доступ отримано квітня 1, 2026, [https://www.reddit.com/r/SwiftUI/comments/1kh2va3/how\_does\_the\_safe\_area\_got\_ignored\_without/](https://www.reddit.com/r/SwiftUI/comments/1kh2va3/how_does_the_safe_area_got_ignored_without/)  
10. Managing safe area in SwiftUI \- Swift with Majid, доступ отримано квітня 1, 2026, [https://swiftwithmajid.com/2021/11/03/managing-safe-area-in-swiftui/](https://swiftwithmajid.com/2021/11/03/managing-safe-area-in-swiftui/)  
11. Hide toolbar item on scroll with .toolbarTitleDisplayMode(.inlineLarge) \- Stack Overflow, доступ отримано квітня 1, 2026, [https://stackoverflow.com/questions/78959649/hide-toolbar-item-on-scroll-with-toolbartitledisplaymode-inlinelarge](https://stackoverflow.com/questions/78959649/hide-toolbar-item-on-scroll-with-toolbartitledisplaymode-inlinelarge)  
12. Large navigation title scrolls with ScrollView, even if it should not \- Stack Overflow, доступ отримано квітня 1, 2026, [https://stackoverflow.com/questions/79771449/large-navigation-title-scrolls-with-scrollview-even-if-it-should-not](https://stackoverflow.com/questions/79771449/large-navigation-title-scrolls-with-scrollview-even-if-it-should-not)  
13. The Large Title UINavigationBar Glitches and How to Fix Them \- Swift Senpai, доступ отримано квітня 1, 2026, [https://swiftsenpai.com/development/large-title-uinavigationbar-glitches/](https://swiftsenpai.com/development/large-title-uinavigationbar-glitches/)  
14. SwiftUI navigation view with multi-line large title. \- GitHub Gist, доступ отримано квітня 1, 2026, [https://gist.github.com/katagaki/6e57a27ba79aeea9e3eed50ac0f5bcce](https://gist.github.com/katagaki/6e57a27ba79aeea9e3eed50ac0f5bcce)  
15. Fitting and filling views in SwiftUI \- Swift with Majid, доступ отримано квітня 1, 2026, [https://swiftwithmajid.com/2020/05/20/fitting-and-filling-view-in-swiftui/](https://swiftwithmajid.com/2020/05/20/fitting-and-filling-view-in-swiftui/)  
16. Enhancing your app's content with tab navigation | Apple Developer Documentation, доступ отримано квітня 1, 2026, [https://developer.apple.com/documentation/SwiftUI/Enhancing-your-app-content-with-tab-navigation](https://developer.apple.com/documentation/SwiftUI/Enhancing-your-app-content-with-tab-navigation)  
17. ios \- SwiftUI \- TabView Safe Area \- Stack Overflow, доступ отримано квітня 1, 2026, [https://stackoverflow.com/questions/78472655/swiftui-tabview-safe-area](https://stackoverflow.com/questions/78472655/swiftui-tabview-safe-area)  
18. Get SafeArea & TabBar Sizes in SwiftUI | by Moussa Hellal \- Medium, доступ отримано квітня 1, 2026, [https://moussahellal.medium.com/get-safearea-tabbar-sizes-in-swiftui-2ff175760a54](https://moussahellal.medium.com/get-safearea-tabbar-sizes-in-swiftui-2ff175760a54)  
19. Tab-based Navigation in SwiftUI: Multi-Tab Apps | by Jerry PM | Feb, 2026 | Medium, доступ отримано квітня 1, 2026, [https://21zerixpm.medium.com/tab-based-navigation-in-swiftui-multi-tab-apps-53cd4051a82e](https://21zerixpm.medium.com/tab-based-navigation-in-swiftui-multi-tab-apps-53cd4051a82e)  
20. SwiftUI and TabView height \- Brian's Brain, доступ отримано квітня 1, 2026, [https://bdewey.com/til/2023/03/01/swiftui-and-tabview-height/](https://bdewey.com/til/2023/03/01/swiftui-and-tabview-height/)  
21. Mastering the containerRelativeFrame Modifier in SwiftUI \- Fatbobman's Blog, доступ отримано квітня 1, 2026, [https://fatbobman.com/en/posts/mastering-the-containerrelativeframe-modifier-in-swiftui/](https://fatbobman.com/en/posts/mastering-the-containerrelativeframe-modifier-in-swiftui/)  
22. Additional safe area on NavigationView in SwiftUI \- Stack Overflow, доступ отримано квітня 1, 2026, [https://stackoverflow.com/questions/70922597/additional-safe-area-on-navigationview-in-swiftui](https://stackoverflow.com/questions/70922597/additional-safe-area-on-navigationview-in-swiftui)  
23. Keyboard toolbar breaks bottom safe area after background on iOS 26 \- Stack Overflow, доступ отримано квітня 1, 2026, [https://stackoverflow.com/questions/79876147/keyboard-toolbar-breaks-bottom-safe-area-after-background-on-ios-26](https://stackoverflow.com/questions/79876147/keyboard-toolbar-breaks-bottom-safe-area-after-background-on-ios-26)  
24. Unwanted space between TabView and its safeAreaInset : r/SwiftUI \- Reddit, доступ отримано квітня 1, 2026, [https://www.reddit.com/r/SwiftUI/comments/1di08gj/unwanted\_space\_between\_tabview\_and\_its/](https://www.reddit.com/r/SwiftUI/comments/1di08gj/unwanted_space_between_tabview_and_its/)