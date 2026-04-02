# SwiftUI Preview – Layer 5 HIG Specs (Navigation Bar, Toolbars, Lists, Controls)

## Session Header

Research Layer: 5 — iOS Human Interface Guidelines  
Task: Deepen Layer 5 with HIG-style specs for navigation bars (standard vs large titles), toolbars, standard list rows, and common controls (buttons, segmented controls), focusing on the information most relevant to the SwiftUI Preview renderer.  
Sources: HIG summaries and derivative docs for navigation bars and toolbars, SwiftUI and UIKit discussions about bar heights, SwiftUI list row environment keys, HIG-derived guidance on system buttons and segmented controls.[^1][^2][^3][^4][^5]
Scope: Provide `HIG SPEC:` blocks with approximate numeric values where Apple does not publish official numbers, clearly marked `[APPROX]`, and concrete Canvas rendering notes.

***

## HIG SPEC: Navigation Bar (Standard & Large Titles)

HIG SPEC: Navigation Bar (iOS)  
Source URL: https://developer.apple.com/design/human-interface-guidelines/ios/bars/navigation-bars

Measurements:
  height: 
    - Standard (compact) title: approximately 44pt on iPhone in portrait.[APPROX][^4]
    - Large title (expanded): observed around 96pt when fully expanded on iPhone; shrinks down to standard height as the user scrolls.[APPROX][^4]
  padding: 
    - Horizontal padding around title and bar button items follows system layout margins (roughly 16pt leading/trailing).[APPROX]
    - Vertical spacing between large title baseline and content below is handled automatically by the system.[^6]
  corner radius: 0pt (the bar is a full-width strip; rounding is from device corners, not the bar itself).
  minimum touch target: All bar button items must respect the global 44×44pt minimum.[^7]

Typography:
  style:
    - Large title: `Large Title` text style (SF Display, bold weight, sized to stand out at the top of a view).[^6]
    - Standard title: `Headline`/`Title3`-like style (SF Text, semibold or regular, single line).[^8]
  size: 
    - Large title: typically around 34pt in Apple’s examples.[APPROX]
    - Standard title: around 17pt.[APPROX]
  weight: 
    - Large title: bold.
    - Standard title: semibold or regular, depending on context.
  line height multiplier: Single-line titles; line height managed by system text styles.

Colors used:
  background: Typically a translucent or solid bar color, mapped in SwiftUI via `navigationBarTitleDisplayMode` and appearance APIs; often `systemBackground` or a variant with blur.
  foreground: Title and bar button icons use `label`/`tintColor` (often system blue) for active items and dimmed versions for disabled states.[^9]
  separator: An optional hairline separator at the bottom of the navigation bar; similar to the `separator` semantic color over the content area.

Canvas rendering note:
  - For the preview, render the navigation bar as a full-width rectangle at the top of the safe area:
    - Use ~44pt height for a standard title bar.
    - Use ~96pt for a fully expanded large-title bar, with the title baseline positioned near the bottom of that region.
  - Place large titles left-aligned by default, with a margin of ~16pt from the leading edge; standard titles can be centered or leading-aligned based on standard SwiftUI navigation styles.
  - Ensure bar button items are placed within 44×44pt hit regions.

***

## HIG SPEC: Toolbar (Bottom & Top Toolbars)

HIG SPEC: Toolbar (iOS)  
Source URL: https://developer.apple.com/design/human-interface-guidelines/ios/bars/toolbars

Measurements:
  height: Toolbars generally match the standard navigation bar height (~44pt) when used at the top or bottom of a screen.[APPROX][^5]
  padding: Items are arranged with system-defined spacing, aligning with the platform’s layout margins; buttons should remain within 44×44pt touch targets.[^7]
  corner radius: 0pt (toolbars span full width; any rounding comes from device edges).
  minimum touch target: 44×44pt for each toolbar item.[^7]

Typography:
  style: Toolbar buttons typically use SF Symbols as icons, optionally with short labels using `.caption`/`.footnote`-sized text under or next to the icon.[^8]
  size: Icon sizes often mirror bar button item sizes (around 20–24pt symbols within 44×44pt hit regions).[APPROX]
  weight: Icons can vary by context; labels usually regular weight.
  line height multiplier: Single-line labels.

Colors used:
  background: Often a solid or blurred bar color derived from semantic colors (`systemBackground` equivalents for bars).
  foreground: Icons/text use the app’s accent color or `tintColor` for active items and a dimmed color for inactive ones.[^9]
  separator: Toolbars may share separators with adjacent content when pinned to the bottom or top.

Canvas rendering note:
  - In the preview, model toolbars as 44pt-high bars placed either at the top (below the navigation bar) or at the bottom (above a tab bar or safe-area inset), depending on configuration.
  - Render toolbar items as evenly spaced icon+label groups, each centered in a 44×44pt region.
  - Allow for adaptive layouts (e.g. collapsing labels on compact widths) by reading environment size classes, if later needed.

***

## HIG SPEC: Standard List Row Metrics

HIG SPEC: Standard List Row  
Source URL: SwiftUI list row height recipes and environment keys.[^10][^1]

Measurements:
  height: 
    - Default minimum row height is controlled by `defaultMinListRowHeight` environment value (SwiftUI); common defaults are around 44pt–60pt depending on content and platform.[APPROX][^11][^1]
    - Default minimum header height is controlled by `defaultMinListHeaderHeight`, often larger than rows to accommodate section titles.[^1]
  padding:
    - Horizontal insets align list content with system layout margins (roughly 16pt leading/trailing on iPhone).[APPROX]
    - Vertical padding within a row ensures tap targets meet the 44pt minimum and text remains legible.[^7]
  corner radius: 0pt for plain lists; grouped lists may use rounded corners on sections.
  minimum touch target: Row as a whole must satisfy 44×44pt tap target.[^7]

Typography:
  style: Primary row labels use `.body` or `.headline` text styles; secondary labels (subtitles) use `.subheadline` or `.caption`.[^8]
  size: 
    - Primary text ~17pt.[APPROX]
    - Secondary text smaller (~13pt–15pt).[APPROX]
  weight: Primary often regular/semibold; secondary regular.

Colors used:
  background: Plain list rows use `systemBackground` or `secondarySystemBackground` depending on style (plain vs grouped).[^9]
  foreground: Text uses `label` / `secondaryLabel` for primary/secondary labels; accessory icons (chevrons) use a dimmed tint.[^9]
  separator: Row separators use `separator` color, full-width or inset depending on style.[^9]

Canvas rendering note:
  - In your preview engine, approximate list layout as a vertical stack of `RowNode`s where each row’s height is:
    - `rowHeight = max(intrinsicContentHeight + verticalPadding, defaultMinListRowHeight)`.
  - For default previews, you can assume `defaultMinListRowHeight` in the 44–60pt range and expose it as a configurable environment value so the user can tweak it visually.
  - Draw separators using the project’s `separator` color and honor safe‑area leading/trailing insets (e.g. inset separators in grouped lists).

***

## HIG SPEC: Buttons (Primary & Secondary)

HIG SPEC: Buttons (iOS)  
Source URL: System buttons and actions overviews; general HIG guidelines for primary actions.[^2]

Measurements:
  height: 
    - Primary buttons should be at least 44pt tall to satisfy touch target requirements; many modern designs use 48–52pt for better legibility.[APPROX][^12][^7]
  padding: 
    - Horizontal padding sufficient to make labels visually balanced (e.g. 16–20pt leading and trailing around text).[APPROX]
  corner radius: 
    - Rounded rectangles are common; often using 8–12pt radii for standard buttons.[APPROX]
  minimum touch target: 44×44pt, regardless of visual style.[^12]

Typography:
  style: Button titles typically use `.headline` or `.callout` styles for emphasis.[^8]
  size: Around 15–17pt for primary actions.[APPROX]
  weight: Semibold is common for primary buttons; regular for secondary/tertiary buttons.[APPROX]
  line height multiplier: Single-line labels.

Colors used:
  background:
    - Primary: solid filled style with high-contrast color (often the app’s tint or system accent, like system blue) against its surroundings.[^2]
    - Secondary: outlined or plain style with a transparent or subtle background and a visible border/tint.[^2]
  foreground:
    - Primary: text color contrasts with background (e.g. `white` on a dark accent color, or `label` on a light accent background).[^2]
    - Secondary: text uses the accent color; disabled states reduce opacity or use `tertiaryLabel`-like colors.
  separator: N/A for individual buttons.

Canvas rendering note:
  - For the preview, define a `ButtonNode` style layer that:
    - Maps `.borderedProminent`/primary styles to a filled rounded rect using the app’s accent color and white/label text.
    - Maps `.bordered`/secondary styles to an outlined rounded rect with tinted border and transparent background.
    - Ensures the drawn rect plus padding produces at least a 44×44pt hit region, even if the text is short.

***

## HIG SPEC: Segmented Controls

HIG SPEC: Segmented Control (iOS)  
Source URL: https://developer.apple.com/design/human-interface-guidelines/ios/controls/segmented-controls (mirrored summary)[^3]

Measurements:
  height: Segmented controls generally align with toolbar/nav bar heights (~28–32pt visual height inside a 44pt tall region).[APPROX][^3]
  padding: 
    - Segments are equal in width within a control and sized to comfortably fit their content; horizontal padding ensures tap targets meet 44pt width when possible.[^3]
  corner radius:
    - Standard segmented controls use rounded corners on the outer container (often around 8pt), with internal vertical dividers between segments.[APPROX]
  minimum touch target: Entire segmented control and each segment should respect 44×44pt minimum when possible; large phones can accommodate wider segments.[^3][^7]

Typography:
  style: Text segments typically use a small, legible style similar to `.footnote` or `.caption` for labels.[^3]
  size: Around 13–15pt.[APPROX]
  weight: Regular weight; selected segments may use color or slight weight changes to stand out.[^3]
  line height multiplier: Single-line labels.

Colors used:
  background:
    - Selected segment uses a filled background (often accent color or system fill) to stand out.
    - Unselected segments share a neutral background (e.g. secondary grouped background or clear).[^2][^3]
  foreground:
    - Selected text/icons use high-contrast color (e.g. white or `label` depending on fill).
    - Unselected segments use a dimmed foreground (`secondaryLabel`).[^9][^3]
  separator: Internal separators between segments can be drawn using a subtle variant of `separator` or `opaqueSeparator`.

Canvas rendering note:
  - In your preview:
    - Render segmented controls as rounded rect groups with equal-width segments.
    - For selected segments, fill their background with the accent color and draw the label in white/label color.
    - For unselected segments, use a clear or lightly filled background and a muted text color.
    - Limit the number of segments to 5 on iPhone in typical designs, as recommended by HIG; beyond that, consider a scrollable segmented control if you choose to simulate it later.[^3]

***

## Notes and Gaps

- Apple’s HIG rarely publishes exact pixel/point heights for bars and controls; many values above (nav bar large-title height, tab bar and toolbar heights, segment/control sizes) come from observed measurements and best practices rather than explicit numeric HIG statements, so they are marked `[APPROX]` and should be cross-checked with your device-frame research.[^5][^4]
- Typography details (exact font sizes and line heights) are better sourced from Apple’s San Francisco font docs or your existing font tables; the HIG confirms style relationships but not all metrics.[^8]
- For the preview engine, these specs mainly drive *relative proportions* and *semantic mapping* (e.g. which text style, which semantic color) rather than strict pixel-perfect replication.

---

## References

1. [SwiftUI List Change Row and Header Height | Swift UI recipes](https://swiftuirecipes.com/blog/swiftui-list-change-row-and-header-height) - Change row and header height in SwiftUI List.

2. [System Buttons & Actions | Uxcel Lesson](https://uxcel.com/lessons/system-buttons-actions-400) - They need solid background color, high contrast with surrounding elements, and clear labels that des...

3. [Segmented Controls - UI Controls - iOS Human Interface Guidelines](https://codershigh.github.io/guidelines/ios/human-interface-guidelines/ui-controls/segmented-controls/index.html) - A segmented control is a linear set of two or more segments, each of which functions as a mutually e...

4. [Get the default shrunk and expanded height of large title navigation bar](https://stackoverflow.com/questions/65527339/get-the-default-shrunk-and-expanded-height-of-large-title-navigation-bar/79417939) - I have enabled large titles for the navigation bar with: navigationController?.navigationBar.prefers...

5. [Set height of toolbar using AutoLayout and support orientation](https://stackoverflow.com/questions/18649501/set-height-of-toolbar-using-autolayout-and-support-orientation) - In this case what you want is to set the relative object as nil, and simply set the constant. Any vi...

6. [Navigation - Interaction - iOS Human Interface Guidelines](https://codershigh.github.io/guidelines/ios/human-interface-guidelines/interaction/navigation/index.html) - Learn about designing apps for iOS.

7. [Minimum sensible button size on iPhone](https://stackoverflow.com/questions/1928991/minimum-sensible-button-size-on-iphone) - I'm designing an iPhone app that features a rather large set of onscreen rounded rect buttons. Given...

8. [Typography - Visual Design - iOS Human Interface Guidelines](https://codershigh.github.io/guidelines/ios/human-interface-guidelines/visual-design/typography/index.html) - Learn about designing apps for iOS.

9. [Color | Apple Developer Documentation](https://developer.apple.com/design/human-interface-guidelines/color) - Judicious use of color can enhance communication, evoke your brand, provide visual continuity, commu...

10. [Default Min List Row Height - Explore SwiftUI](https://exploreswiftui.com/library/list/default-min-list-row-height) - The default minimum height of rows in a list. Learn how to use Default Min List Row Height in SwiftU...

11. [How to set default row height for SwiftUI lists - LinkedIn](https://www.linkedin.com/posts/learn-and-code-with-enid_swiftui-tip-want-to-make-your-list-rows-activity-7386358110828875777-seIc) - SwiftUI Tip Want to make your list rows taller by default? Use the \.defaultMinListRowHeight environ...

12. [Touch Target Calculator | Design Engineer](https://www.designengineer.xyz/tools/touch-target)

