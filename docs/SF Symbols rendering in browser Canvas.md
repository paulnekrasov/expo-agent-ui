# SF Symbols rendering in browser Canvas: strategy and priority table

**Apple's license unambiguously prohibits SF Symbols use on non-Apple platforms**, making open-source icon mapping the only viable production strategy. Three overlapping Apple license documents — the Xcode SDK Agreement (Section 2.3), the HIG declaration, and the SF Font EULA — all restrict SF Symbols to Apple-branded products exclusively. The deprecated `sf-symbols` npm package (removed for violating Apple's copyright) confirms enforcement risk is real. The recommended approach pairs **Phosphor Icons** (9,000+ icons, 6 weight variants, MIT license) as the primary rendering library with Unicode fallbacks and labeled placeholders for unmapped symbols.

---

## The four rendering options evaluated

Each option was assessed against five criteria: availability on Windows/Linux/Web, rendering quality, legal risk for a production tool, implementation cost, and final verdict.

**Option A — SVG Library** is the most tempting but legally fraught path. Several community projects exist: `sf-symbols-svg` by MoOx (MIT, v7.2.0, actively maintained) generates SVGs from the installed SF Pro font on macOS; `@bradleyhodges/sfsymbols-react` provides **6,900+ React components** from SF Symbols 7.0 beta but explicitly warns against non-Apple platform use; `brendanballon/sfsymbols-svg` has pre-exported SVGs for SF Symbols 1.1 only (~1,500 symbols, stale since 2021). The `sf-symbols` npm package was deprecated specifically because "it was in violation of Apple's copyright guidelines." Even generated SVGs carry legal risk because the underlying glyph artwork remains Apple's intellectual property under the Xcode SDK Agreement.

**Option B — Unicode/Emoji Fallback** provides zero legal risk and surprisingly decent coverage for the most common symbols. Navigation chevrons, media controls, checkmarks, and basic shapes all have recognizable Unicode equivalents. However, **filled variants are indistinguishable from outline variants** in Unicode, composite symbols like `bell.badge` and `eye.slash` have no single-character representation, and Apple-specific concepts like `square.and.arrow.up` (the iOS share icon) map poorly.

**Option C — Web Font** is the most clearly prohibited approach. Apple's SF Font EULA states: *"You may not rent, lease, lend, trade, transfer, sell, sublicense or otherwise redistribute the Apple Font"* and explicitly prohibits *"creating mock-ups of user interfaces to be used in software products running on any non-Apple operating system."* Using CSS `system-ui` font-family only works on macOS Safari and does not expose SF Symbol icon glyphs.

**Option D — Placeholder Box** renders a labeled square with the symbol name in monospace. This communicates developer intent clearly and has **zero legal risk**, but provides no visual fidelity. It is the appropriate last-resort fallback.

## Open-source icon libraries as the practical substitute

The strongest cross-platform approach maps SF Symbol names to equivalent icons from permissively licensed libraries. **Phosphor Icons** (MIT, 9,000+ icons across Thin/Light/Regular/Bold/Fill/Duotone weights) is the closest structural match to SF Symbols' 9-weight system and covers an estimated **40–50%** of commonly used SF Symbols. **Lucide** (ISC, 1,641 icons, outline only) offers clean stroke-based icons popular in the React ecosystem. **Heroicons** (MIT, ~460 icons) has high per-icon quality but limited coverage. **Material Symbols** (Apache 2.0, 3,340+ icons) provides variable-weight support. The recommended architecture layers these: Phosphor as primary, Lucide/Material as supplementary, Unicode as tertiary, placeholder as final fallback.

## Apple's license leaves no ambiguity

The Xcode SDK Agreement Section 2.3 states System-Provided Images are licensed *"solely for the purpose of developing Applications for Apple-branded products that run on the system for which the image was provided."* The HIG explicitly links SF Symbols to this clause. The font EULA adds: *"The grants set forth in this License do not permit you to install, use or run the Apple Font for the purpose of creating mock-ups of user interfaces to be used in software products running on any non-Apple operating system."* No separate web license exists. Apple has not publicly enforced aggressively against small projects, but reserves full rights and the `sf-symbols` npm takedown demonstrates willingness to act.

---

```
SF SYMBOLS RENDERER STRATEGY
  Option A — SVG library:
    Library name: @bradleyhodges/sfsymbols-react (6,900+ symbols, SF Symbols 7.0)
                  sf-symbols-svg by MoOx (CLI tool, requires macOS to generate)
                  brendanballon/sfsymbols-svg (1,500 SVGs, SF Symbols 1.1 only, stale)
    Quality: high (pixel-accurate Apple glyphs)
    Legal risk: HIGH — Apple EULA prohibits non-Apple platform use and redistribution;
                sf-symbols npm package was deprecated for violating Apple's copyright
    Implementation cost: 2–3 days (integration) but ongoing legal liability
    Verdict: AVOID for production — unacceptable legal risk

  Option B — Unicode fallback:
    Approach: each SF Symbol maps to a Unicode emoji or character via lookup table
    Quality: low-to-medium (good for ~35 of 60 priority symbols; poor for filled
             variants, composite symbols, and Apple-specific icons)
    Legal risk: NONE
    Implementation cost: 1 day (build mapping table + Canvas text rendering)
    Verdict: USE as secondary fallback for common symbols

  Option C — Web font:
    Font name: none legally available — Apple SF Pro font cannot be redistributed
    Legal: VERY HIGH risk — Apple EULA explicitly states: "You may not redistribute
           the Apple Font" and prohibits use on "any non-Apple operating system"
    Implementation cost: N/A
    Verdict: AVOID — most clearly prohibited option

  Option D — Placeholder:
    Render: a rounded-rect box with the system name centered in monospace font,
            e.g., [chevron.right] rendered as a labeled gray square
    Quality: low (communicates intent but not pixel-accurate)
    Legal risk: NONE
    Implementation cost: 0.5 days
    Verdict: USE as final fallback for unmapped symbols

  RECOMMENDED STRATEGY:
    Use a 4-tier rendering cascade:

    Tier 1 — Open-source icon mapping (PRIMARY):
      Build an SF Symbol name → Phosphor Icons mapping table for the 60 priority
      symbols. Phosphor Icons (MIT license, 9,000+ icons, 6 weights including
      Fill) is the closest structural match to SF Symbols' weight system.
      Supplement with Lucide (ISC) and Material Symbols (Apache 2.0) for gaps.
      Render these as SVG-in-Canvas or pre-rasterized ImageBitmap.
      Quality: medium-high. Legal risk: none. Cost: 3–5 days.

    Tier 2 — Unicode/emoji fallback (SECONDARY):
      For symbols not mapped to an open-source icon, render the Unicode fallback
      character from the priority table using Canvas fillText().
      Quality: low-medium. Legal risk: none. Cost: 1 day.

    Tier 3 — Labeled placeholder (FINAL FALLBACK):
      For symbols with no mapping and no good Unicode equivalent, render a gray
      rounded rect with the symbol name in 9px monospace.
      Quality: low. Legal risk: none. Cost: 0.5 days.

    Tier 4 — Optional high-fidelity mode (OPT-IN, macOS ONLY):
      If the user is on macOS with SF Pro installed, detect the font via
      document.fonts.check() and render using the Private Use Area codepoints
      via Canvas fillText() with font-family 'SF Pro'. This is technically
      permitted since the user already has the font. Non-macOS users get Tier 1.
      Quality: high (on macOS only). Legal risk: low. Cost: 1 day.

    Total implementation: 5–7 developer-days for all tiers.
```

```
SF SYMBOLS PRIORITY TABLE
  (60 most-used symbols in SwiftUI UIs)

  | #  | SF Symbol Name               | Unicode/Emoji Fallback   | Category          | Common Use                            |
  |----|------------------------------|--------------------------|-------------------|---------------------------------------|
  | 1  | chevron.right                | › (U+203A)               | Navigation        | NavigationLink disclosure indicator   |
  | 2  | chevron.left                 | ‹ (U+2039)               | Navigation        | Back navigation indicator             |
  | 3  | chevron.down                 | ⌄ (U+2304)               | Navigation        | Expand/dropdown toggle                |
  | 4  | chevron.up                   | ⌃ (U+2303)               | Navigation        | Collapse/close toggle                 |
  | 5  | arrow.left                   | ← (U+2190)               | Navigation        | Back button in toolbars               |
  | 6  | arrow.right                  | → (U+2192)               | Navigation        | Forward/next action                   |
  | 7  | house                        | 🏠 (U+1F3E0)             | Navigation        | Home tab (unselected)                 |
  | 8  | house.fill                   | 🏠 (U+1F3E0)             | Navigation        | Home tab (selected)                   |
  | 9  | pencil                       | ✏ (U+270F)               | Editing           | Edit action button                    |
  | 10 | trash                        | 🗑 (U+1F5D1)             | Editing           | Delete action (outline)               |
  | 11 | trash.fill                   | 🗑 (U+1F5D1)             | Editing           | Delete action (filled/destructive)    |
  | 12 | plus                         | + (U+002B)               | Editing           | Add/create new item                   |
  | 13 | minus                        | − (U+2212)               | Editing           | Remove/decrease                       |
  | 14 | xmark                        | ✕ (U+2715)               | Editing           | Close/dismiss sheet or modal          |
  | 15 | plus.circle.fill             | ⊕ (U+2295)               | Editing           | Prominent add/create button           |
  | 16 | checkmark                    | ✓ (U+2713)               | State/Status      | Success, completion, selection        |
  | 17 | checkmark.circle.fill        | ✅ (U+2705)              | State/Status      | Confirmed/verified state              |
  | 18 | xmark.circle.fill            | ❌ (U+274C)              | State/Status      | Error/rejected state                  |
  | 19 | circle                       | ○ (U+25CB)               | State/Status      | Unselected radio/checkbox             |
  | 20 | circle.fill                  | ● (U+25CF)               | State/Status      | Selected radio/active indicator       |
  | 21 | exclamationmark.triangle     | ⚠ (U+26A0)               | State/Status      | Warning indicator                     |
  | 22 | exclamationmark.triangle.fill| ⚠ (U+26A0)               | State/Status      | Warning indicator (filled/urgent)     |
  | 23 | play.fill                    | ▶ (U+25B6)               | Media             | Play media content                    |
  | 24 | pause.fill                   | ⏸ (U+23F8)               | Media             | Pause media playback                  |
  | 25 | stop.fill                    | ⏹ (U+23F9)               | Media             | Stop media playback                   |
  | 26 | forward.fill                 | ⏩ (U+23E9)              | Media             | Skip forward                          |
  | 27 | backward.fill                | ⏪ (U+23EA)              | Media             | Skip backward                         |
  | 28 | speaker.slash                | 🔇 (U+1F507)             | Media             | Mute/unmute toggle                    |
  | 29 | envelope                     | ✉ (U+2709)               | Communication     | Email/mail inbox                      |
  | 30 | phone.fill                   | 📞 (U+1F4DE)             | Communication     | Phone call action                     |
  | 31 | message.fill                 | 💬 (U+1F4AC)             | Communication     | Chat/messaging                        |
  | 32 | bell.fill                    | 🔔 (U+1F514)             | Communication     | Notifications (active)                |
  | 33 | bell.badge                   | 🔔 (U+1F514)             | Communication     | Notification with unread badge        |
  | 34 | gearshape                    | ⚙ (U+2699)               | System/Settings   | Settings tab/button (outline)         |
  | 35 | gearshape.fill               | ⚙ (U+2699)               | System/Settings   | Settings tab (selected)               |
  | 36 | magnifyingglass              | 🔍 (U+1F50D)             | System/Settings   | Search tab/bar                        |
  | 37 | heart                        | ♡ (U+2661)               | System/Settings   | Like/favorite (outline)               |
  | 38 | heart.fill                   | ♥ (U+2665)               | System/Settings   | Like/favorite (selected)              |
  | 39 | star                         | ☆ (U+2606)               | System/Settings   | Rating/bookmark (outline)             |
  | 40 | star.fill                    | ★ (U+2605)               | System/Settings   | Rating/bookmark (selected)            |
  | 41 | eye.slash                    | 👁 (U+1F441)             | System/Settings   | Hide content / password toggle        |
  | 42 | folder                       | 📁 (U+1F4C1)             | Files/Sharing     | File browser/organization             |
  | 43 | doc                          | 📄 (U+1F4C4)             | Files/Sharing     | Document reference                    |
  | 44 | square.and.arrow.up          | 📤 (U+1F4E4)             | Files/Sharing     | Share sheet action (iOS share icon)   |
  | 45 | paperclip                    | 📎 (U+1F4CE)             | Files/Sharing     | File attachment                       |
  | 46 | link                         | 🔗 (U+1F517)             | Files/Sharing     | URL/hyperlink                         |
  | 47 | person                       | 👤 (U+1F464)             | Person            | User/profile tab (outline)            |
  | 48 | person.fill                  | 👤 (U+1F464)             | Person            | User/profile tab (selected)           |
  | 49 | person.circle                | 👤 (U+1F464)             | Person            | User avatar in lists                  |
  | 50 | person.crop.circle           | 👤 (U+1F464)             | Person            | Profile picture placeholder           |
  | 51 | person.2                     | 👥 (U+1F465)             | Person            | Contacts/group/shared                 |
  | 52 | info.circle                  | ℹ (U+2139)               | Info/Alerts       | Information tooltip/detail            |
  | 53 | info.circle.fill             | ℹ (U+2139)               | Info/Alerts       | Information badge (filled)            |
  | 54 | exclamationmark.circle       | ❗ (U+2757)              | Info/Alerts       | Alert/error indicator                 |
  | 55 | questionmark.circle          | ❓ (U+2753)              | Info/Alerts       | Help/FAQ action                       |
  | 56 | hand.raised                  | ✋ (U+270B)              | Info/Alerts       | Privacy/permission/block              |
  | 57 | wifi                         | 📶 (U+1F4F6)             | Device/Connect    | WiFi status indicator                 |
  | 58 | lock                         | 🔒 (U+1F512)             | Device/Connect    | Security/authentication               |
  | 59 | camera                       | 📷 (U+1F4F7)             | Device/Connect    | Photo capture/camera access           |
  | 60 | mappin                       | 📍 (U+1F4CD)             | Device/Connect    | Location marker/maps                  |

  Notes:
  - All 60 symbols are available from iOS 13+ (SF Symbols 1.0)
  - Filled variants (.fill) share the same Unicode fallback as outline variants;
    the renderer should visually differentiate via opacity or fill style
  - bell.badge has no single Unicode equivalent; render 🔔 with a red dot overlay
  - eye.slash has no single Unicode equivalent; render 👁 with a diagonal stroke
  - chevron.down (U+2304) has limited font support; fallback to ∨ (U+2228) if needed
```

```
EXTRACTOR IMPLICATION: Image(systemName:)
  tree-sitter node: call_expression with callee "Image"
                    containing argument with label "systemName"

  Pattern (tree-sitter Swift grammar):
    (call_expression
      callee: (simple_identifier) @func_name
      arguments: (call_suffix
        (value_arguments
          (value_argument
            name: (simple_identifier) @arg_label
            value: (line_string_literal
              (line_str_text) @symbol_name))))
    (#eq? @func_name "Image")
    (#eq? @arg_label "systemName"))

  Also match Label(_, systemImage:):
    (call_expression
      callee: (simple_identifier) @func_name
      arguments: (call_suffix
        (value_arguments
          (value_argument) @title_arg
          (value_argument
            name: (simple_identifier) @arg_label
            value: (line_string_literal
              (line_str_text) @symbol_name))))
    (#eq? @func_name "Label")
    (#eq? @arg_label "systemImage"))

  Extraction:
    symbol_name = text content of the matched string literal node
    Examples:
      Image(systemName: "chevron.right")  → symbol_name = "chevron.right"
      Label("Settings", systemImage: "gearshape") → symbol_name = "gearshape"

  IR node:
    {
      kind: "SystemImageNode",
      symbolName: "chevron.right",
      // Optional modifiers extracted from chained calls:
      foregroundColor: "#007AFF",   // from .foregroundColor(.blue)
      fontSize: 17,                 // from .font(.body) or .imageScale(.large)
      renderingMode: "template"     // from .renderingMode(.template)
    }

  Renderer behaviour:
    1. Look up symbolName in Phosphor Icons mapping table (Tier 1)
       → If found: render the mapped SVG icon at the specified size/color
    2. If not in mapping table, look up in Unicode fallback table (Tier 2)
       → If found: render Unicode character via ctx.fillText() at specified size
    3. If no Unicode fallback, render placeholder box (Tier 3)
       → Draw rounded rect with symbolName in 9px monospace centered
    4. If on macOS and SF Pro detected via document.fonts.check() (Tier 4, opt-in)
       → Render using PUA codepoint via ctx.fillText() with 'SF Pro' font

  Additional SwiftUI call patterns to extract:
    Image(systemName:)              — primary SF Symbol constructor
    Label(_:systemImage:)           — label with SF Symbol icon
    .tabItem { Image(systemName:) } — tab bar icons
    Button(action:label:) containing Image(systemName:) — toolbar buttons
    .navigationBarItems containing Image(systemName:) — nav bar icons
    .swipeActions containing Image(systemName:) — swipe action icons
```

## Conclusion

The legal analysis is the decisive factor in this strategy. Apple's three overlapping license documents leave **no legal path to redistribute SF Symbol artwork** — not as SVGs, not as web fonts, not as rasterized images served from a macOS server. The `sf-symbols` npm package takedown proves Apple monitors and enforces. The only production-safe approach is the **4-tier rendering cascade**: open-source icon mapping (Phosphor Icons primary, ~40–50% coverage of common symbols), Unicode fallback (~35 of 60 priority symbols have recognizable matches), labeled placeholders for the remainder, and an optional macOS-only high-fidelity mode using the locally installed system font. This achieves **medium-high visual fidelity** for the 60 most-used symbols while carrying **zero legal risk** — a necessary tradeoff for a production tool that runs on Windows, Linux, and the web.