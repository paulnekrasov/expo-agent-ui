# SwiftUI Preview – Layer 5 HIG Specs (Touch Targets, Typography, Colors, Tab Bar)

## Session Header

Research Layer: 5 — iOS Human Interface Guidelines  
Task: Capture concrete, implementation-ready HIG specs that matter most for the SwiftUI Preview renderer: minimum touch target size, base typography rules, semantic color roles, and tab bar geometry/semantics, expressed as `HIG SPEC:` blocks suitable for Canvas rendering and environment defaults.  
Sources: Apple HIG summaries and derivative documentation on touch targets, typography, color semantics, tab bars, and general layout; official typography and layout pages that reiterate San Francisco usage and 44×44 pt tap target guidance.[^1][^2][^3][^4][^5]
Scope: Global touch target minimum; typography defaults for body text; semantic color usage at a high level; and a more detailed spec for the iOS tab bar component.

***

## HIG SPEC: Global Touch Targets

HIG SPEC: Touch Target Minimum  
Source URL: https://developer.apple.com/design/human-interface-guidelines/foundations/layout (and accessibility summaries)

Measurements:
  height: 44pt (minimum tappable height for controls)[^2][^1]
  padding: Typically includes extra invisible padding around smaller glyphs (for example a 24–32pt icon inside a 44×44pt hit area).[^2]
  corner radius: Not specified globally; depends on control type (buttons, chips, etc.).
  minimum touch target: 44×44pt (width × height) for all interactive elements (buttons, toggles, links, custom controls).[^1][^2]

Typography:
  style: N/A at component level (applies generically to any interactive element).
  size: N/A.
  weight: N/A.
  line height multiplier: N/A.

Colors used:
  background: N/A – touch target area can be transparent; the requirement is geometric, not visual.
  foreground: N/A.
  separator: N/A.

Canvas rendering note:
  - When painting hit regions for debugging or layout inspection, draw a transparent rectangle of at least 44×44pt around each interactive ViewNode, even if the visible glyph is smaller. This helps spot violations and can be toggled as an overlay in the preview environment.

***

## HIG SPEC: Typography – System Font Usage

HIG SPEC: System Typography Basics  
Source URL: https://developer.apple.com/design/human-interface-guidelines/visual-design/typography

Measurements:
  height: N/A for a specific component; relates to line height.
  padding: Body text in standard lists and forms typically uses system margins defined by layout guides, not explicit padding values.[^5]
  corner radius: N/A.
  minimum touch target: Separate from typography (see touch targets above).

Typography:
  style: System text styles (e.g. `.largeTitle`, `.title`, `.headline`, `.body`, `.subheadline`, `.callout`, `.footnote`, `.caption`).[^5]
  size: San Francisco uses SF Text for sizes ≤19pt and SF Display for ≥20pt.[^5]
  weight: System text styles encode appropriate weights (e.g. `.headline` often uses semibold; `.body` uses regular) and switch fonts/weights automatically with Dynamic Type.[^5]
  line height multiplier: Managed by the system for each text style; not exposed as raw numbers in HIG but handled automatically when using text styles.[^5]

Colors used:
  background: Typically `systemBackground` for main content surfaces.[^3]
  foreground: Text uses semantic colors like `label`, `secondaryLabel`, `tertiaryLabel` depending on emphasis.[^3]
  separator: `separator` or `opaqueSeparator` for dividing lines.[^3]

Canvas rendering note:
  - The preview engine should:
    - Default to San Francisco Text/Display with Dynamic Type scaling, approximating Apple’s size thresholds (≤19pt vs ≥20pt).[^5]
    - Treat text style names as first-class properties in IR (e.g. `TextStyle.Body`) and map them to concrete font metrics via your existing lookup tables.
    - Use semantic foreground colors (`label`, `secondaryLabel`) rather than hard-coded hex values; light/dark variants should already be encoded in project color tables from earlier layers.

***

## HIG SPEC: Semantic Colors (High-Level)

HIG SPEC: Semantic System Colors  
Source URL: https://developer.apple.com/design/human-interface-guidelines/color

Measurements:
  height: N/A.
  padding: N/A.
  corner radius: N/A.
  minimum touch target: N/A.

Typography:
  style: N/A.
  size: N/A.
  weight: N/A.
  line height multiplier: N/A.

Colors used:
  background: `systemBackground`, `secondarySystemBackground`, `tertiarySystemBackground` — surface colors that adapt to light/dark mode and elevations.[^3]
  foreground: `label`, `secondaryLabel`, `tertiaryLabel`, `quaternaryLabel` — text/foreground colors with decreasing emphasis.[^3]
  separator: `separator`, `opaqueSeparator` — for dividing content, with translucency in light mode and appropriate contrast in dark mode.[^3]

Canvas rendering note:
  - The renderer should:
    - Resolve semantic colors against light/dark appearances using the same tables already captured for system colors in earlier work (Layer 0/CLAUDE.md).
    - Avoid embedding raw RGB literals directly in view nodes; instead, store semantic names and let a theme resolver compute concrete RGBA values at paint time.
    - Apply slight translucency and blending for separators/backgrounds to better approximate UIKit/SwiftUI rendering (for example, separators often use partial alpha over grouped backgrounds).

***

## HIG SPEC: Tab Bar (iOS)

HIG SPEC: Tab Bar (iOS)  
Source URL: https://developer.apple.com/design/human-interface-guidelines/ios/bars/tab-bars

Measurements:
  height: Tab bars “maintain the same height in all screen orientations” and typically align with the system default (commonly implemented around 49pt on iPhone, though Apple doesn’t publish an exact number as a spec).[APPROX][^4]
  padding: Icons and titles are vertically centered within the bar; horizontal padding depends on the number of tabs (recommended 3–5 tabs on iPhone).[^4]
  corner radius: 0pt (edges are flush with screen; visual rounding is handled by device bezel, not the tab bar itself).[^4]
  minimum touch target: Each tab item’s tappable region should respect the global 44×44pt minimum.[^2][^4]

Typography:
  style: Tab labels use a small, legible text style akin to `.caption` or `.footnote` with all‑caps discouraged; labels should be short and localized.[^4]
  size: HIG does not specify an exact point size, but tab titles are designed to be smaller than body text while remaining legible (often around 10–12pt in practice).[APPROX][^4]
  weight: Typically regular for unselected, with color/weight changes (or SF Symbols weight changes) indicating selection.[^4]
  line height multiplier: Managed by the system; single-line labels.

Colors used:
  background: By default, a translucent bar background that can pick up a tint; in SwiftUI, often `UITabBarAppearance` defaults mapped to semantic colors like `systemBackground`/`barTintColor` equivalents.[^4]
  foreground: Selected item uses the app’s tint color (often `systemBlue`), while unselected items use a dimmed variant, conceptually similar to `secondaryLabel` for titles and a lighter SF Symbol stroke for icons.[^3][^4]
  separator: A thin hairline separator at the top of the tab bar, visually similar to `separator` over the content area.

Canvas rendering note:
  - For the iPhone 16 Pro logical size, render the tab bar as a rectangle spanning the full width at the bottom, with a fixed bar height (for example ~49pt) and a top separator line.
  - Layout 3–5 tab items evenly spaced across the width, ensuring each item’s hit area is at least 44×44pt.
  - Use SF Symbols for icons and system font for labels, mapping selection to the project’s tint color and unselected items to a muted semantic color.
  - When simulating translucency, composite the tab bar background color over the content beneath using reduced alpha (for example 0.9), giving a frosted effect without full blur.

***

## Notes and Gaps

- Apple’s online HIG tends to describe *relationships* and semantics (for example, “use San Francisco and text styles”, “44×44pt minimum tappable area”) rather than publishing exhaustive numeric specs for every component (like exact tab bar height).[^5][^3][^4]
- Numeric values given here for tab bar height are labeled `[APPROX]` and should be cross‑checked against the device‑frame research in Layer 9 for pixel‑perfect rendering.
- Typography metrics (line heights, letter spacing) are best sourced from Apple’s SF Symbols and San Francisco font documentation or existing project tables in `CLAUDE.md`; the HIG confirms qualitative usage but not per‑style numbers.[^5]

---

## References

1. [Touch Target Calculator | Design Engineer](https://www.designengineer.xyz/tools/touch-target)

2. [Minimum sensible button size on iPhone](https://stackoverflow.com/questions/1928991/minimum-sensible-button-size-on-iphone) - I'm designing an iPhone app that features a rather large set of onscreen rounded rect buttons. Given...

3. [Color | Apple Developer Documentation](https://developer.apple.com/design/human-interface-guidelines/color) - Judicious use of color can enhance communication, evoke your brand, provide visual continuity, commu...

4. [Tab Bars - UI Bars - iOS Human Interface Guidelines - CodersHigh](https://codershigh.github.io/guidelines/ios/human-interface-guidelines/ui-bars/tab-bars/index.html) - Learn about designing apps for iOS.

5. [Typography - Visual Design - iOS Human Interface Guidelines](https://codershigh.github.io/guidelines/ios/human-interface-guidelines/visual-design/typography/index.html) - Learn about designing apps for iOS.

