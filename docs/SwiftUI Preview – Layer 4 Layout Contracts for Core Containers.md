# SwiftUI Preview – Layer 4 Layout Contracts for Core Containers

## Session Header

Research Layer: 4 — SwiftUI Layout Algorithm  
Task: Capture precise, implementation‑oriented layout contracts for core SwiftUI containers (`VStack`, `HStack`, `ZStack`, `Spacer`, and `frame`), based on WWDC 2019 Session 237, SwiftUI layout deep‑dives, and the public `Layout` protocol documentation, then express them as `LAYOUT CONTRACT:` blocks suitable for a TypeScript approximation.  
Sources: WWDC 2019 “Building Custom Views with SwiftUI” notes; detailed community analyses of the layout system and stacks; SwiftUI Layout protocol documentation and examples.[^1][^2][^3][^4]
Scope: Global three‑step layout model (propose → choose → place), `frame` behavior as a layout‑neutral container, stack layout (space distribution, flexibility, layout priorities, alignment), basic `Spacer` behavior, and how these should be approximated for the iPhone 16 Pro logical size.

***

## Global LAYOUT CONTRACT: SwiftUI Layout Model

LAYOUT CONTRACT: Global Layout Model  
Source: WWDC 2019 Session 237 notes; Stacks article.[^2][^1]

**propose_size(proposed: ProposedSize) → ConcreteSize:**
  Algorithm:
  - Step 1 — Parent proposes: Every parent view proposes a size to each child; the root view typically starts by proposing the safe‑area size of the device screen.[^2]
  - Step 2 — Child chooses: Each child independently chooses its own size in response to the proposal, which the parent must respect; views can take less than, exactly, or more than what is offered depending on their intrinsic behavior.[^3][^2]
  - Step 3 — Parent adopts: The parent uses the chosen child sizes to determine its own concrete size, generally just large enough to enclose its children, and the process repeats up the hierarchy.[^2]
  Special cases:
    - Safe area: The root view’s proposed size is the device bounds minus safe‑area insets; content is “layout neutral” at the outer body layer – the custom view’s bounds equal its body’s bounds.[^5][^2]
    - No ambiguous layout: SwiftUI always produces some layout; there is no concept of ambiguous or unsatisfiable constraints as in Auto Layout.[^2]

**place_children(size: ConcreteSize, children: [LayoutChild]):**
  Algorithm:
  - Parent places each child within its coordinate space after sizes are known, deciding both origin and alignment.[^2]
  - SwiftUI then rounds final coordinates to the nearest pixel to avoid antialiasing artifacts.[^2]
  Alignment behavior:
  - Each container defines default alignment rules (for example `.center` for root and stacks) and may expose alignment parameters for customization.[^4][^2]

TypeScript implementation hint:
  - Represent proposals as `ProposedSize { width: number | null | Infinity; height: number | null | Infinity; }`, with `null` = ideal, `0` = minimum, `Infinity` = maximum (mirroring SwiftUI’s `ProposedViewSize`).[^3]
  - Ensure the layout engine always produces a valid arrangement even if children “overflow” proposals; model overflow visually (clipping or drawing beyond bounds) without destabilizing the rest of the layout.

***

## LAYOUT CONTRACT: frame Modifier

LAYOUT CONTRACT: Frame View  
Source: WWDC 2019 layout notes; Stacks article.[^1][^2]

**propose_size(proposed: ProposedSize, params: { width?: number; height?: number; minWidth?: number; maxWidth?: number; minHeight?: number; maxHeight?: number; alignment: Alignment }): ConcreteSize:**
  Algorithm:
  - Treat `frame` as a *wrapper view*, not a constraint; it is an intermediate container that has its own size and then places its single child.[^2]
  - Compute the frame’s own target size as follows:
    - If explicit `width`/`height` are provided, use those dimensions, clamped by min/max when relevant.[^2]
    - Otherwise, derive width/height from the parent’s proposed size and min/max bounds, defaulting to the proposal when unspecified.[^3]
  - The wrapper then proposes this target size to its child.
  Special cases:
    - If the child is non‑resizable (for example a plain `Image`), it may choose a smaller size than the frame’s target (for example 60×60 image inside an 80×80 frame).[^2]
    - If the frame’s target is *smaller* than the child’s ideal size, the child may overflow visually (for example large image drawn inside a 100‑pt frame), but surrounding siblings still layout as if the child’s width were the frame’s target.[^3]

**place_children(size: ConcreteSize, child: LayoutChild, alignment: Alignment):**
  Algorithm:
  - Once both the frame’s concrete size and child size are known, position the child inside the frame according to the `alignment` parameter (default `.center`).[^2]
  - The frame’s own position relative to its parent is decided by that parent’s algorithm; the frame does not alter outer layout rules.

TypeScript implementation hint:
  - Model `frame` as a `FrameNode` wrapper with `frameSize` and `alignment` fields. Let the child’s intrinsic size drive content, but always clip or overflow relative to `frameSize` without affecting siblings’ positions.

***

## LAYOUT CONTRACT: HStack (Horizontal Stack)

LAYOUT CONTRACT: HStack  
Source: Stacks article; WWDC 2019 recap notes.[^4][^2]

**propose_size(proposed: ProposedSize, children: [Child], spacing: SpacingProvider, alignment: VerticalAlignment): ConcreteSize:**
  Algorithm:
  - Step 1 — Compute internal spacing:
    - Determine spacing between adjacent children either from an explicit `spacing` parameter or from the environment’s default stack spacing (which can vary by platform and neighbor view types).[^3][^2]
    - Subtract the total internal spacing from the proposed width to obtain `unallocatedWidth`.
  - Step 2 — Distribute width among children:
    - Start with `unallocatedWidth` and the full list of children.
    - Repeatedly:
      - Divide `unallocatedWidth` into equal parts among the *remaining* children.[^2]
      - Offer that part width (and the proposed height) to the *least flexible* child (for example a fixed‑size image) based on its intrinsic layout behavior and priority.[^4][^2]
      - The child returns its chosen size. Subtract the child’s width from `unallocatedWidth` and remove it from the remaining set.
      - Continue until all children have reported sizes.
  - Step 3 — Choose HStack size:
    - Width = sum of all child widths + total spacing.
    - Height = max of all child heights.
  Special cases:
    - Children that always take offered size (for example shapes) simply claim whatever width is proposed.[^3][^2]
    - Children that take less (for example short text) free up space for siblings; HStack redistributes leftover width among remaining children.[^2]
    - Layout priority: children with higher `layoutPriority` are satisfied first; lower‑priority children are sized from the remaining space.[^3][^2]

**place_children(size: ConcreteSize, children: [LayoutChild], spacing: number, alignment: VerticalAlignment):**
  Algorithm:
  - Start `x` at `0` (or leading edge) inside the HStack’s bounds.
  - For each child in visual order:
    - Place the child at `(x, y)` where `y` is determined by vertical alignment (`.top`, `.center`, `.bottom`, custom alignment guides).[^4][^2]
    - Advance `x` by `child.width + spacingAfterChild`.
  - After placing all children, the HStack’s actual width may be less than the parent’s original proposed width; parent alignment decides how the stack itself is positioned.

TypeScript implementation hint:
  - Implement a two‑pass algorithm: first pass computes intrinsic widths/heights for each child under shared equal partitions, second pass refines them according to inflexible vs flexible children and layout priorities.
  - For the initial version, a simpler heuristic—split remaining width equally among flexible children after allocating fixed‑width children—will approximate observed behavior well enough.

***

## LAYOUT CONTRACT: VStack (Vertical Stack)

LAYOUT CONTRACT: VStack  
Source: Same stack rules applied on vertical axis; Stacks article.[^2]

**propose_size(proposed: ProposedSize, children: [Child], spacing: SpacingProvider, alignment: HorizontalAlignment): ConcreteSize:**
  Algorithm:
  - Step 1 — Compute vertical spacing and subtract from proposed height → `unallocatedHeight`.
  - Step 2 — Iterate children by flexibility/priority:
    - Divide `unallocatedHeight` evenly among remaining children.
    - Offer each allocation as proposed height to the least flexible child; record its chosen height, subtract from `unallocatedHeight`, and continue.[^2]
  - Step 3 — Choose VStack size:
    - Height = sum(childHeights) + total spacing.
    - Width = max(childWidths).

**place_children(size: ConcreteSize, children: [LayoutChild], spacing: number, alignment: HorizontalAlignment):**
  Algorithm:
  - Start `y` at `0` (or top) and place children one under another, aligning horizontally according to `alignment` (`.leading`, `.center`, `.trailing`, or custom alignment guide).

TypeScript implementation hint:
  - Mirror the HStack algorithm along the vertical axis, but ensure width is treated as “max‑of‑children” instead of distributed, except when using modifiers like `.frame(maxWidth: .infinity)` that mark children as greedy in the cross axis.

***

## LAYOUT CONTRACT: ZStack (Overlay Stack)

LAYOUT CONTRACT: ZStack  
Source: Stacks article; layout protocol documentation.[^3][^2]

**propose_size(proposed: ProposedSize, children: [Child], alignment: Alignment): ConcreteSize:**
  Algorithm:
  - Propose the same `proposed` size to each child (subject to child‑specific behavior).[^2]
  - Each child chooses its own size independently.
  - The ZStack’s concrete size is the union of all child sizes:
    - Width = max(childWidths).
    - Height = max(childHeights).

**place_children(size: ConcreteSize, children: [LayoutChild], alignment: Alignment):**
  Algorithm:
  - For each child, compute an origin such that the child is aligned within the ZStack’s bounds according to `alignment` (`.center` by default; can be `.topLeading`, etc.).
  - All children share the same coordinate space and are drawn back‑to‑front in view order.

TypeScript implementation hint:
  - Implement ZStack as a simple overlay container that always overlays children and never performs space distribution; this is significantly simpler than H/V stacks and mostly about alignment.

***

## LAYOUT CONTRACT: Spacer

LAYOUT CONTRACT: Spacer  
Source: Layout protocol and SwiftUI layout articles.[^3][^2]

**propose_size(proposed: ProposedSize, properties: { stackOrientation: .horizontal | .vertical | .none }): ConcreteSize:**
  Algorithm (conceptual):
  - If inside a horizontal stack (`stackOrientation: .horizontal`):
    - Minimum/ideal width are small fixed values (for example 8 points) while maximum width is effectively infinite; height is 0.[^3]
  - If inside a vertical stack (`stackOrientation: .vertical`):
    - Minimum/ideal height are small fixed values, maximum height is infinite; width is 0.[^3]
  - If orientation is `.none` (no stack context):
    - Spacer can expand in both axes.

**place_children:**
  - `Spacer` is not a container; it is a leaf view whose chosen size is consumed by surrounding stacks to push siblings apart.

TypeScript implementation hint:
  - Represent Spacer as a special intrinsic node with `min`, `ideal`, and `max` sizes dependent on the container’s primary axis. HStack/VStack then treat it as the highest‑flexibility child: after satisfying fixed and low‑priority children, distribute remaining space across all `Spacer` instances according to their layout priorities.

***

## LAYOUT CONTRACT: Layout Protocol (Custom Layouts)

LAYOUT CONTRACT: Layout Protocol (iOS 16+)  
Source: SwiftUI Layout protocol article.[^3]

**propose_size(proposal: ProposedSize, subviews: [LayoutSubview]) → ConcreteSize (sizeThatFits):**
  Algorithm (from a custom layout’s perspective):
  - A `Layout` type acts as both parent and child:
    - As a parent, it calls `sizeThatFits` on each `LayoutSubview` with various proposals (`.zero`, `.unspecified`, `.infinity`) to determine min/ideal/max sizes.[^3]
    - As a child, it returns a `CGSize` to its own parent based on subview sizes and internal layout rules.
  - The meaning of proposals:
    - `0` → request minimum size.
    - `nil` (`.unspecified`) → request ideal size.
    - `.infinity` → request maximum size.[^3]

**place_children(in bounds: CGRect, proposal: ProposedSize, subviews: [LayoutSubview]):**
  Algorithm:
  - Use `LayoutSubview.place(at:anchor:proposal:)` to position each subview; if a subview is not placed, it will be centered by default.[^3]

TypeScript implementation hint:
  - For your preview engine, the `Layout` protocol is conceptually identical to your TypeScript `LayoutContract` interface: implement `measure(proposal)` and `place(bounds)` functions for each container, reusing the HStack/VStack/ZStack contracts above but allowing for custom experimental layouts in future versions.

***

## Notes and Gaps

- Official Apple material describes the *shape* of the stack algorithms (least‑flexible first, equal‑part splits, etc.) but does not publish exact numeric thresholds or all heuristics (for example, detailed behavior of layout priorities in nested stacks); community reverse‑engineering fills many of the gaps.[^4][^2]
- iOS 16+ `Layout` protocol examples and SwiftUI‑Lab’s articles reveal how HStack/VStack are internally implemented as layouts (`HStackLayout`, `VStackLayout`), but some behaviors (especially around lazy stacks and grids) are still opaque.[^3]
- The preview engine should be designed so that its approximations—particularly for space distribution with priorities and spacers—are *visually* faithful even if the exact numeric path differs slightly from SwiftUI’s proprietary implementation.

---

## References

1. [Session 237 - Building Custom Views with SwiftUI](https://hackmd.io/@nelson/SkFR8FjRV) - tags: WWDC-2019 SwiftUI · Parent proposes a size for child · Parent places child in parent's coordin...

2. [Stacks](https://kean.blog/post/swiftui-layout-system) - Taking a deep dive into SwiftUI layout system. Exploring the basics of the layout process, frames, s...

3. [The SwiftUI Layout Protocol - Part 1](https://swiftui-lab.com/layout-protocol-part-1/) - Introduction One of the best SwiftUI additions this year has to be the Layout protocol. Not only we ...

4. [building_custom_views_with_sw...](https://github.com/erenkabakci/WWDC-Recap/blob/master/WWDC19/Technical_Sessions/building_custom_views_with_swiftui.md) - Building Custom Views with SwiftUI - Friday. Session materials: https://developer.apple.com/videos/p...

5. [Building Custom Views with SwiftUI - WWDC19 - Videos](https://developer.apple.com/videos/play/wwdc2019/237/) - Learn how to build custom views and controls in SwiftUI with advanced composition, layout, graphics,...

