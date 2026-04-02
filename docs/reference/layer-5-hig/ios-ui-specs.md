# iOS/iPadOS UI Specification Reference

Two complete specification layers for iOS device frames and control visuals, compiled from screensizes.app, Apple HIG, UIKit documentation, the ScreenCorners private-API library, and authoritative developer resources (UseYourLoaf, noahgilmore.com system color extraction). Every value is tagged with its confidence level: **✅ Confirmed** (Apple-documented or reliable device measurement) or **⚠️ Estimated** (community-measured/system-defined, not publicly documented by Apple).

---

## RESEARCH LAYER 8 — Device Frame Specifications

---

DEVICE FRAME: iPhone 16 Pro
- Logical point dimensions: **402pt × 874pt** ✅ Confirmed
- Safe area insets: top **62pt**, bottom **34pt** ✅ Confirmed (UseYourLoaf, device-measured)
- Status bar height: **54pt** ✅ Confirmed
- Dynamic Island: width **~126pt**, height **~37.33pt**, top offset **~11pt**, corner radius **~18.67pt** (capsule — half-height) ⚠️ Estimated (community-derived from hardware cutout measurement ~20.76 mm at 460 PPI @3×; Apple does not publish these values)
- Home indicator: width **~134pt**, height **~5pt**, bottom offset **~8pt**, corner radius **~2.5pt** (capsule — half-height) ⚠️ Estimated (community Figma templates and view-hierarchy inspection)
- Screen corner radius: **62.0pt** ✅ Confirmed (ScreenCorners library via `_displayCornerRadius` private API; continuous/squircle curve)
- Frame bezel corner radius: **~69pt** ⚠️ Estimated (screen corner radius + ~7pt bezel width; Apple does not publish)

---

DEVICE FRAME: iPhone 16
- Logical point dimensions: **393pt × 852pt** ✅ Confirmed
- Safe area insets: top **59pt**, bottom **34pt** ✅ Confirmed (UseYourLoaf, device-measured)
- Status bar height: **54pt** ✅ Confirmed
- Dynamic Island: width **~126pt**, height **~37.33pt**, top offset **~11pt**, corner radius **~18.67pt** (capsule — half-height) ⚠️ Estimated (same physical hardware cutout as Pro models)
- Home indicator: width **~134pt**, height **~5pt**, bottom offset **~8pt**, corner radius **~2.5pt** (capsule — half-height) ⚠️ Estimated
- Screen corner radius: **55.0pt** ✅ Confirmed (ScreenCorners library; continuous/squircle curve)
- Frame bezel corner radius: **~62pt** ⚠️ Estimated

---

DEVICE FRAME: iPhone 16 Pro Max
- Logical point dimensions: **440pt × 956pt** ✅ Confirmed
- Safe area insets: top **62pt**, bottom **34pt** ✅ Confirmed (UseYourLoaf, device-measured)
- Status bar height: **54pt** ✅ Confirmed
- Dynamic Island: width **~126pt**, height **~37.33pt**, top offset **~11pt**, corner radius **~18.67pt** (capsule — half-height) ⚠️ Estimated (same physical hardware cutout across all Dynamic Island iPhones)
- Home indicator: width **~134pt**, height **~5pt**, bottom offset **~8pt**, corner radius **~2.5pt** (capsule — half-height) ⚠️ Estimated
- Screen corner radius: **62.0pt** ✅ Confirmed (ScreenCorners library; continuous/squircle curve)
- Frame bezel corner radius: **~69pt** ⚠️ Estimated

---

DEVICE FRAME: iPhone 15
- Logical point dimensions: **393pt × 852pt** ✅ Confirmed
- Safe area insets: top **59pt**, bottom **34pt** ✅ Confirmed (UseYourLoaf, device-measured)
- Status bar height: **54pt** ✅ Confirmed
- Dynamic Island: width **~126pt**, height **~37.33pt**, top offset **~11pt**, corner radius **~18.67pt** (capsule — half-height) ⚠️ Estimated (same hardware cutout as iPhone 14 Pro lineage)
- Home indicator: width **~134pt**, height **~5pt**, bottom offset **~8pt**, corner radius **~2.5pt** (capsule — half-height) ⚠️ Estimated
- Screen corner radius: **55.0pt** ✅ Confirmed (ScreenCorners library; continuous/squircle curve)
- Frame bezel corner radius: **~57–60pt** ⚠️ Estimated

---

DEVICE FRAME: iPhone SE (3rd generation)
- Logical point dimensions: **375pt × 667pt** ✅ Confirmed (4.7″ LCD, same form factor as iPhone 8; @2× scale, 750 × 1334 native px)
- Safe area insets: top **20pt**, bottom **0pt** ✅ Confirmed (top = status bar only; bottom = 0 because physical Home button, no home indicator)
- Status bar height: **20pt** ✅ Confirmed (classic pre-iPhone X status bar)
- Dynamic Island: **None** — device has no top cutout of any kind
- Notch: **None** — classic top bezel with earpiece and front camera
- Home indicator: **None** — device has a physical Home button with Touch ID
- Screen corner radius: **0pt** ✅ Confirmed (rectangular IPS LCD panel; ScreenCorners returns 0 for this form factor)
- Frame bezel corner radius: **~30–35pt equivalent** ⚠️ Estimated (physical aluminum body has rounded corners ~10–12 mm, but irrelevant to screen layout since the display is fully rectangular and inset within the bezel)

---

DEVICE FRAME: iPad Pro 13-inch (M4)
- Logical point dimensions: **1032pt × 1376pt** (portrait) / **1376pt × 1032pt** (landscape) ✅ Confirmed (2064 × 2752 native px @2×; note: this is NOT the older 1024×1366 — the M4 model has a slightly larger logical canvas)
- Safe area insets: top **24pt**, bottom **20pt** (both portrait and landscape; left/right 0pt in both orientations) ✅ Confirmed (UseYourLoaf; same pattern as all 2018+ Face ID iPads)
- Status bar height: **24pt** ✅ Confirmed (both orientations)
- Dynamic Island: **None**
- Notch: **None**
- Home indicator: width **~134pt** ⚠️ Estimated, height **~5pt** ⚠️ Estimated, bottom offset **20pt** (= bottom safe area inset) ✅ Confirmed, corner radius **~2.5pt** ⚠️ Estimated
- Screen corner radius: **18.0pt** ✅ Confirmed (ScreenCorners library; continuous/squircle curve — consistent across all iPad Pro and iPad Air models with rounded displays; caveat: M4 not explicitly listed by name but shares the design)
- Frame bezel corner radius: **Not documented in points by Apple** — physical measurement only; no reliable pt-based value available

---

DEVICE FRAME: iPad mini (6th generation)
- Logical point dimensions: **744pt × 1133pt** (portrait) / **1133pt × 744pt** (landscape) ✅ Confirmed (1488 × 2266 native px @2×)
- Safe area insets: top **24pt**, bottom **20pt** (both portrait and landscape; left/right 0pt) ✅ Confirmed (same 2018+ iPad pattern; extrapolated from consistent behavior across all home-indicator iPads)
- Status bar height: **24pt** ✅ Confirmed (both orientations)
- Dynamic Island: **None**
- Notch: **None**
- Home indicator: width **~134pt** ⚠️ Estimated, height **~5pt** ⚠️ Estimated, bottom offset **20pt** ✅ Confirmed, corner radius **~2.5pt** ⚠️ Estimated
- Screen corner radius: **~21.5pt** ⚠️ Estimated (community-measured by BezelKit developer via simulator testing; ScreenCorners repo does not explicitly list iPad mini 6; continuous/squircle curve)
- Frame bezel corner radius: **Not documented in points by Apple** — no reliable pt-based value available

---

### Layer 8 notes on key distinctions

**Top safe area difference — Pro vs standard iPhones.** The iPhone 16 Pro and Pro Max report a **62pt** top safe area inset, while the standard iPhone 16 and iPhone 15 report **59pt**. Both share a **54pt** status bar height; the extra 8pt (Pro) vs 5pt (standard) gap sits between the status bar's bottom edge and the safe area boundary. This reflects the slightly different Dynamic Island positioning relative to the larger Pro screen canvases.

**Dynamic Island dimensions are physically identical across all models.** The hardware cutout is the same ~20.76 mm pill on every Dynamic Island iPhone (14 Pro through 16 Pro Max). In logical points the width computes to ~126pt. The compact pill is a stadium/capsule shape, so its corner radius equals exactly half its height (~18.67pt). Apple publishes no official spec for these dimensions; the values are community-derived from physical measurement and reverse-engineering.

**Screen corner radii use continuous (squircle) curves**, not standard circular arcs. The `_displayCornerRadius` private API returns these values, which are the internal radii the OS uses for masking. Standard `UIBezierPath` circular arcs will not match perfectly — use `CALayerCornerCurve.continuous` for accurate replication.

**iPad note on hidden status bar.** On iPads, when the status bar is hidden the top safe area inset drops to **0pt** (unlike iPhones with a notch or Dynamic Island where the top inset remains non-zero). This is because iPads have no hardware intrusion at the top edge.

---

## RESEARCH LAYER 4 — iOS Control Visual Specifications

---

HIG SPEC: Toggle (UISwitch)

- **Track dimensions**: **51pt × 31pt** ✅ Confirmed (Apple Developer Forums and multiple community sources; `intrinsicContentSize` reports 49×31 due to a known Apple bug per OpenRadar #31777116, but actual rendered frame is 51×31)
- **Thumb/knob diameter**: **~27pt** ⚠️ Estimated (community-measured; derived from 31pt height minus ~2pt inset on each side; third-party replica libraries PWSwitch and MBSwitch corroborate)
- **Track corner radius**: **15.5pt** ✅ Confirmed (= height ÷ 2 = 31 ÷ 2; produces the fully-rounded capsule shape; confirmed by custom implementations using `bounds.height * 0.5`)
- **ON color**: `UIColor.systemGreen` → **#34C759** light mode, rgba(52, 199, 89, 1.0); dark mode #30D158 ✅ Confirmed (programmatic extraction via noahgilmore.com)
- **OFF color**: system-defined (~**#E9E9EA** estimated) — renders as a white track fill with a subtle gray border stroke; the border approximates `UIColor.systemGray5` (#E5E5EA); internal fill uses approximately `secondarySystemFill` rgba(120, 120, 128, 0.16) ⚠️ Estimated (not publicly documented)
- **Thumb color**: `UIColor.white` → **#FFFFFF** ✅ Confirmed — includes a subtle system-applied drop shadow

---

HIG SPEC: TextField (UITextField — rounded rect style)

- **Corner radius**: system-defined (**~5pt estimated**) ⚠️ Estimated (system-drawn border; not accessible via `layer.cornerRadius`; community replication attempts converge on 5–6pt; codementor.io uses 5pt)
- **Background color (light mode)**: `UIColor.systemBackground` → **#FFFFFF** (white) ✅ Confirmed
- **Horizontal padding (leading/trailing)**: system-defined (**~7pt estimated**) ⚠️ Estimated (applied internally via `textRect(forBounds:)`)
- **Vertical padding (top/bottom)**: text vertically centered within 34pt height; effective padding **~7pt** top/bottom ⚠️ Estimated
- **Placeholder text color**: `UIColor.placeholderText` → **rgba(60, 60, 67, 0.3)** / #3C3C434D light mode; dark mode rgba(235, 235, 245, 0.3) ✅ Confirmed (noahgilmore.com system color extraction)
- **Border style**: light gray border ~`UIColor.systemGray5` (#E5E5EA), border width **~0.5–1pt** ⚠️ Estimated (codegenes.net replication analysis)
- **Minimum height**: **34pt** ✅ Confirmed (intrinsic content height for `.roundedRect` border style; Apple Developer Forums)
- **Default font size**: **17pt** (`UIFont.systemFont(ofSize: 17)`, Body text style) ✅ Confirmed

---

HIG SPEC: Slider (UISlider)

- **Track height (default)**: system-defined (**~2pt estimated**) ⚠️ Estimated (community-measured; multiple custom slider implementations reference 2pt as baseline)
- **Thumb diameter**: system-defined (**~28pt estimated**) ⚠️ Estimated (community-measured; white circle with subtle drop shadow; some sources report 28pt, others 30pt)
- **Minimum track tint color (default)**: `UIColor.tintColor` / `UIColor.systemBlue` → **#007AFF**, rgba(0, 122, 255, 1.0) ✅ Confirmed (inherits the app's tint color, which defaults to system blue)
- **Maximum track tint color (default)**: system-defined light gray, approximately **`UIColor.systemGray4`** area (~#D1D1D6) or rgba(142, 142, 147, ~0.25) ⚠️ Estimated
- **Thumb tint color (default)**: `UIColor.white` → **#FFFFFF** with a subtle system drop shadow ✅ Confirmed
- **Overall control height (intrinsic)**: **~34pt** ⚠️ Estimated (touch target extends beyond visual elements)

---

HIG SPEC: Stepper (UIStepper)

- **Overall dimensions**: **~94pt × 32pt** (modern iOS 15+) ⚠️ Estimated (pre-iOS 14 was 94×29pt; iOS 14+ redesign slightly increased height; community-measured)
- **Button segment width**: **~47pt** each (half total width minus divider) ⚠️ Estimated
- **Divider line width**: **~1pt** ⚠️ Estimated
- **Corner radius**: system-defined (**~8pt estimated**) ⚠️ Estimated (moderately rounded rectangle)
- **Background color**: approximately `UIColor.tertiarySystemFill` → **rgba(118, 118, 128, 0.12)** / #7676801E in light mode ⚠️ Estimated (iOS 14+ redesign uses semi-transparent system fill)
- **Button symbols**: SF Symbols `minus` and `plus`, tinted with the view's `tintColor` (defaults to `UIColor.systemBlue` #007AFF) ✅ Confirmed

---

HIG SPEC: Picker (UIPickerView / SwiftUI Picker)

- **Inline style height**: variable — each option renders as a standard **~44pt** row; total height expands to show all options within the form/list ⚠️ Estimated (community-observed)
- **Wheel style row height**: system-defined (**~32pt estimated**) when delegate `pickerView(_:rowHeightForComponent:)` is not implemented ⚠️ Estimated
- **Wheel style overall height**: **216pt** default (intrinsic content size) ✅ Confirmed (Apple iOS SDK 9.0 Release Notes document the original enforced heights of 162/180/216pt; 216pt remains the intrinsic size; freely resizable since iOS 9)
- **Wheel style default width**: **320pt** ✅ Confirmed (Apple iOS 9 SDK Release Notes)
- **Menu style chevron size**: system-defined (**~12pt × 7pt estimated**) ⚠️ Estimated — SF Symbol–like downward triangle rendered to the right of selected value
- **Menu style typical height**: **~44pt** (standard form cell height) ⚠️ Estimated
- **Width behavior**: UIPickerView (wheel) defaults to 320pt, freely resizable; SwiftUI Picker (inline/menu) stretches **full-width** within its container (Form/List); menu style is content-width when used standalone
- **Selection indicator**: two thin horizontal hairline lines above/below the selected row plus a translucent gray rounded-rect highlight (approximately `UIColor.tertiarySystemFill` opacity); `showsSelectionIndicator` deprecated in iOS 13 — indicator now always shown ✅ Confirmed (deprecation documented by Apple)

---

HIG SPEC: Form — Inset Grouped Style (UITableView `.insetGrouped` / SwiftUI Form)

- **Section background color (iOS 15+, light mode)**: `UIColor.systemGroupedBackground` → **#F2F2F7**, RGB(242, 242, 247) ✅ Confirmed (noahgilmore.com system color extraction)
- **Cell background color (light mode)**: `UIColor.secondarySystemGroupedBackground` → **#FFFFFF**, RGB(255, 255, 255) ✅ Confirmed
- **Section corner radius**: system-defined (**~10pt estimated**), uses `CALayerCornerCurve.continuous` (squircle, not circular arc) ⚠️ Estimated (community-measured via Xcode Debug View Hierarchy; TOInsetGroupedTableView backport library targets the same value)
- **Separator inset**: leading **~16–20pt** from cell edge (aligns with `layoutMarginsGuide.leadingAnchor`); trailing **0pt** (extends to trailing edge) ⚠️ Estimated; iOS 16+ SwiftUI auto-aligns separators to leading text content edge
- **Section header font**: **13pt**, **Regular** weight, `UIColor.secondaryLabel` → **rgba(60, 60, 67, 0.6)** ✅ Confirmed (maps to `UIFont.TextStyle.footnote`; UIKit auto-uppercases header text; SwiftUI does not)
- **Section footer font**: **13pt**, **Regular** weight, `UIColor.secondaryLabel` → **rgba(60, 60, 67, 0.6)** ✅ Confirmed (same as header)
- **Minimum cell height**: **44pt** ✅ Confirmed (Apple HIG minimum tap target; default `UITableView.rowHeight`)
- **Horizontal inset from screen edge**: system-defined (**~20pt per side estimated** on standard iPhone widths 375–393pt); driven by table view `layoutMargins` inheriting from `systemMinimumLayoutMargins` (16pt) plus additional `.insetGrouped` inset ⚠️ Estimated; significantly larger on iPad (constrained to readable content width)
- **Vertical spacing between sections**: system-defined (**~35pt estimated** total gap); in iOS 15+ `sectionHeaderTopPadding` adds ~18–22pt extra; set to 0 to remove ⚠️ Estimated

---

HIG SPEC: DatePicker — Compact Mode

- **Button/label dimensions**: width is **variable** by locale and mode — date-only ~**100–120pt**, time-only ~**70–80pt**, date+time shows two separate tappable pills; height **~34pt** ⚠️ Estimated (community-measured via Xcode View Debugger)
- **Corner radius of tappable area**: system-defined (**~6pt estimated**), continuous/squircle corners ⚠️ Estimated
- **Font size**: **17pt** (`.body` text style) ✅ Confirmed
- **Calendar popover dimensions when expanded**: system-managed — date-only calendar ~**320pt × 380–400pt**; date+time ~**320pt × 460–480pt** (includes time wheel); presented as popover on iPad, semi-modal overlay on iPhone ⚠️ Estimated (community measurement from screenshots and developer blog posts)
- **Background color of compact button**: approximately `UIColor.tertiarySystemFill` → **rgba(118, 118, 128, 0.12)** / #7676801E — very light gray translucent pill ✅ Confirmed (Apple Developer Forums thread #656450; system color extraction)
- **Text color**: default state `UIColor.label` → **#000000** (light mode); when popover is active, switches to `UIColor.tintColor` / system blue **#007AFF** ✅ Confirmed

---

### Layer 4 notes on sourcing and reliability

**What Apple officially documents vs what is system-defined.** Apple's Human Interface Guidelines describe control *behavior*, recommended usage, and accessibility targets (e.g., 44pt minimum tap targets) but almost never publish exact point dimensions, corner radii, or internal padding values for UIKit controls. The HIG is a design philosophy document, not a pixel-spec sheet. Consequently, most precise measurements in this layer come from three community methods: Xcode's Debug View Hierarchy inspector, programmatic `UIColor` component extraction (notably Noah Gilmore's system color tool), and the `_displayCornerRadius` private API via Kyle Bashour's ScreenCorners library.

**System colors are the most reliable values here.** Hex values for named system colors (`systemGreen`, `systemBlue`, `placeholderText`, `systemGroupedBackground`, `secondarySystemGroupedBackground`, `tertiarySystemFill`, `secondaryLabel`) are extracted programmatically from live UIColor instances and are highly reliable. These colors can change between iOS major versions but the values listed reflect iOS 17/18 light-mode defaults.

**Control dimensions may shift between iOS versions.** Apple has redesigned several controls across iOS 14–17 (notably UIStepper and UIDatePicker). The dimensions listed represent the current modern appearance as of iOS 17/18, but earlier or future versions may differ. The UISwitch frame of 51×31pt has remained stable since its introduction and is the most reliably consistent measurement among all controls listed.