# **SwiftUI Control Visual Specifications and Canvas 2D Rendering Architecture**

## **1\. Introduction to the SwiftUI and Canvas Rendering Paradigm**

The evolution of Apple’s user interface framework from the imperative UIKit architecture to the declarative SwiftUI paradigm has fundamentally altered how interfaces are constructed, yet the underlying visual language remains deeply rooted in the historical design systems of iOS. Developing a pixel-perfect, web-based Canvas 2D rendering agent capable of interpreting SwiftUI code and outputting authentic iOS representations requires a rigorous deconstruction of Apple's Human Interface Guidelines (HIG). While SwiftUI abstracts layout constraints and geometric calculations, a Canvas 2D renderer must operate imperatively, relying on exact point dimensions, semantic color resolutions, and precise bezier path operations.

This comprehensive report establishes the definitive visual anatomy, quantitative layout metrics, and Canvas rendering algorithms for five foundational SwiftUI control paradigms: the Toggle, the Slider, the Stepper, the Picker (spanning wheel, menu, and inline styles), and the Form/List container utilizing the inset grouped configuration.1 By synthesizing qualitative HIG directives with quantitative metrics extracted from UIKit default frame properties, memory debugging, and community reverse-engineering of Figma iOS 17 and 18 templates 6, this document provides a robust blueprint for high-fidelity interface emulation.

The analysis deliberately bypasses previously documented components—such as navigation bars, toolbars, tab bars, standard list rows, buttons, and segmented controls—to focus exclusively on the complex interaction controls and container shapes specified. The subsequent sections will first establish the universal rendering mechanics, including adaptive semantic coloring and iOS-specific geometric curves, before providing the exhaustive, standardized specification blocks required for the renderer implementation.

## **2\. Universal Rendering Mechanics and Sub-pixel Precision**

Before implementing specific control architectures, the rendering engine must establish a baseline for dealing with device pixel ratios, sub-pixel alignment, and alpha compositing. The translation of iOS coordinate space (measured in points) to an HTML5 Canvas element (measured in physical pixels) requires meticulous context management.

Apple’s hardware utilizes Retina displays that operate at scale factors of @2x or @3x.8 A Canvas renderer must apply a global transformation matrix ctx.scale(devicePixelRatio, devicePixelRatio) to ensure that controls do not appear blurry or artifacted. This scaling is particularly critical when rendering elements like the 0.5pt separator lines found in inline pickers and inset grouped lists. In a standard Canvas coordinate system, drawing a 0.5pt line precisely on an integer coordinate (e.g., y \= 44\) results in anti-aliasing algorithms bleeding the line across two physical pixels, creating a blurred 1pt line. The rendering agent must apply a half-pixel translation (e.g., y \= 44.5) prior to the stroke operation to guarantee crisp, native-equivalent hairline dividers.

Furthermore, iOS depth hierarchy relies heavily on shadow compositing. Shadows in iOS are not merely dark blurs; they are highly specific offsets with precise blur radii that simulate a physical light source casting down upon the glass interface.9 In Canvas 2D, the shadow state variables (shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY) must be tightly scoped using ctx.save() and ctx.restore() to prevent subsequent drawing operations from inheriting unintended drop shadows.

## **3\. Semantic Color Architecture and Adaptive Resolvers**

Modern iOS design does not employ static hexadecimal color codes. Instead, it utilizes a sophisticated hierarchy of semantic, context-aware color tokens that dynamically resolve based on the active UITraitCollection, specifically adapting to Light Mode, Dark Mode, and increased contrast accessibility settings.10 A Canvas rendering agent must implement an internal state machine that intercepts the simulated environment's current appearance and maps the semantic tokens to their corresponding absolute RGBA values.

### **3.1 Background and Container Elevations**

The iOS spatial system employs a card-on-canvas metaphor, especially prominent in the inset grouped list style. The base environment operates as a receding canvas, while the interactive elements float above it.

| Semantic Token | Light Mode (RGBA / Hex) | Dark Mode (Base) | Dark Mode (Elevated) | Typical Usage |
| :---- | :---- | :---- | :---- | :---- |
| systemGroupedBackground | rgba(242,242,247,1.0) / \#F2F2F7 | rgba(0,0,0,1.0) / \#000000 | rgba(28,28,30,1.0) / \#1C1C1E | Base canvas for Forms 12 |
| secondarySystemGroupedBackground | rgba(255,255,255,1.0) / \#FFFFFF | rgba(28,28,30,1.0) / \#1C1C1E | rgba(44,44,46,1.0) / \#2C2C2E | Card cells, Stepper backgrounds 12 |

In Dark Mode, Apple introduces an "elevated" color tier. When a control is presented inside a modal sheet or popover, the base background shifts to a lighter gray to maintain the illusion of layered depth.13

### **3.2 Translucent Fill and Separator Tokens**

Rather than using opaque grays, iOS relies heavily on alpha-blended fills. The systemFill hierarchy allows controls to subtly absorb the tint and texture of the underlying views, a critical component of the "Liquid Glass" visual aesthetic.15

| Semantic Token | Light Mode (RGBA) | Dark Mode (RGBA) | Typical Usage |
| :---- | :---- | :---- | :---- |
| systemFill | rgba(120, 120, 128, 0.20) | rgba(120, 120, 128, 0.36) | Toggle OFF track, Picker bands 12 |
| secondarySystemFill | rgba(120, 120, 128, 0.16) | rgba(120, 120, 128, 0.32) | Inactive or subtle control bases 12 |
| tertiarySystemFill | rgba(118, 118, 128, 0.12) | rgba(118, 118, 128, 0.24) | Large muted control backgrounds |
| separator | rgba(60, 60, 67, 0.29) | rgba(84, 84, 88, 0.60) | List row dividers, Stepper dividers 12 |

### **3.3 Active Interactive Tints**

System tints provide the primary affordance for interaction. While SwiftUI allows global tint overriding via the .tint() or .accentColor() modifiers, the default system fallback values must be explicitly encoded into the rendering agent.

| Semantic Token | Light Mode (RGB / Hex) | Dark Mode (RGB / Hex) | Typical Usage |
| :---- | :---- | :---- | :---- |
| systemBlue | (0, 122, 255\) / \#007AFF | (10, 132, 255\) / \#0A84FF | Sliders, Stepper glyphs, Checkmarks 12 |
| systemGreen | (52, 199, 89\) / \#34C759 | (48, 209, 88\) / \#30D158 | Toggle ON state background 12 |

## **4\. Geometric Foundations: The Continuous Corner**

A hallmark of Apple's user interface design is the rejection of standard circular arcs for rounded rectangles. A standard CSS border-radius or a Canvas ctx.arcTo() operation produces a sudden discontinuity in acceleration where the straight edge meets the curve. To replicate native iOS controls—particularly the Stepper and the Inset Grouped Form sections—the renderer must approximate a "continuous corner" or squircle, which mathematically derives from a superellipse or Lamé curve.16

While controls with fully rounded caps (like the Toggle and the Slider) can be perfectly drawn using standard semi-circles (ctx.arc), rectangles with explicit corner radii require custom pathing. A true iOS continuous corner extends further along the straight edge before gently initiating the curve. In a Canvas 2D context, this cannot be natively invoked. The renderer must utilize ctx.bezierCurveTo() to construct these corners, adjusting the control points to smooth the curvature continuity. Furthermore, iOS 18 introduced the ConcentricRectangle concept, which automatically adjusts the inner corner radius of child elements to mathematically match the outer bounding box (![][image1]), preventing visual clipping or uneven margins.17 The Canvas renderer must implement this deduction when rendering highlighted selection states inside grouped lists.

## **5\. Detailed Control Specifications and Rendering Architectures**

The following sections provide the exhaustive, formatted HIG SPEC blocks requested, accompanied by deep qualitative analysis of the component's anatomy, historical context, and procedural Canvas 2D rendering instructions.

### **5.1 Toggles (UISwitch)**

The Toggle is a ubiquitous binary control, fundamentally designed to manage instantaneous state changes rather than deferred submissions. Historically originating as UISwitch in UIKit, this component possesses a famously rigid, unyielding frame size. Developers attempting to manually override the dimensions of a UISwitch without applying affine scale transformations (CGAffineTransformMakeScale) find that the control stubbornly returns to its intrinsic bounds.18 This rigid nature is carried directly into SwiftUI's default .toggleStyle(SwitchToggleStyle()).

The visual anatomy of the Toggle consists of a stationary track (a pill-shaped capsule) and a translating circular thumb. The thumb maintains a perpetual, opaque white fill, regardless of the system appearance mode. The track relies entirely on color to communicate state: the ON state is flooded with vibrant systemGreen, while the OFF state recedes into the background using the translucent systemFill token.9 The thumb is elevated above the track using a distinct drop shadow that simulates overhead lighting, characterized by a slight vertical offset and a gentle blur radius.9 When transitioning states, the thumb physically slides across the track. In a static preview environment, the agent must be able to render the two distinct endpoints perfectly.

HIG SPEC: Toggle (UISwitch)

Source URL: [https://developer.apple.com/design/human-interface-guidelines/toggles](https://developer.apple.com/design/human-interface-guidelines/toggles)

Measurements:

track size: 51pt × 31pt

thumb diameter: 27pt

thumb shadow: 1pt offset (vertical), 2pt blur radius, 0.4 opacity

corner radius: 15.5pt (half of height — perfect capsule shape)

minimum touch target: 44pt × 44pt (HIG requirement)

States:

ON: track background \= systemGreen; thumb \= white; thumb position \= right

OFF: track background \= systemFill (gray); thumb \= white; thumb position \= left

Colors:

ON track: systemGreen (light: \#34C759, dark: \#30D158)

OFF track: systemFill semantic color

thumb: always white (\#FFFFFF) with shadow

Canvas rendering note:

To draw the track, initialize a new Path2D. Move to (x: 15.5, y: 0), draw a line to (x: 35.5, y: 0), draw an arc (x: 35.5, y: 15.5, radius: 15.5, startAngle: \-PI/2, endAngle: PI/2), draw a line to (x: 15.5, y: 31), and draw an arc (x: 15.5, y: 15.5, radius: 15.5, startAngle: PI/2, endAngle: \-PI/2).

If the state is OFF, resolve systemFill based on the active trait collection and invoke ctx.fill(). If ON, resolve systemGreen.

Calculate the thumb center. If OFF, the center coordinates are (x: 15.5, y: 15.5). If ON, the coordinates are (x: 35.5, y: 15.5).

Before drawing the thumb, preserve context state with ctx.save(). Configure the shadow physics: ctx.shadowColor \= 'rgba(0, 0, 0, 0.4)', ctx.shadowOffsetY \= 1, ctx.shadowOffsetX \= 0, ctx.shadowBlur \= 2\.

Draw the thumb as a perfect circle using ctx.arc(centerX, centerY, 13.5, 0, Math.PI \* 2). Set ctx.fillStyle \= '\#FFFFFF' and invoke ctx.fill(). Restore context immediately using ctx.restore() to purge the shadow configuration.

Transition between ON/OFF by moving thumb horizontally.

### **5.2 Sliders**

Sliders provide an intuitive, continuous graphical interface for adjusting values within a strictly bounded domain. The native iOS implementation of the Slider (UISlider) demonstrates complex layering mechanics that a Canvas renderer must manually replicate.3

The anatomy of a Slider consists of three distinct components: the minimum track, the maximum track, and the interactive thumb.3 The track itself is exceptionally thin, generally measuring 4pt in height, with fully rounded caps forming a microscopic capsule.20 The thumb shares dimensional similarities with the Toggle thumb, utilizing a 27pt or 28pt diameter to provide an adequate anchor for the user's finger. However, because the track is only 4pt high, the thumb violently overlaps the track.20 Furthermore, HIG mandates a 44pt touch target, meaning the invisible hit-testing area extends far beyond the visible graphical assets.20

Rendering the Slider correctly requires understanding the clipping interaction between the two tracks. The minimum track (representing the filled value from the left origin to the thumb) sits above or perfectly abuts the maximum track (representing the unfilled remainder). The minimum track is filled with the global tintColor (defaulting to systemBlue), while the maximum track utilizes systemFill to provide a subtle, receding visual presence that does not distract the user.12

HIG SPEC: Slider

Source URL: [https://developer.apple.com/design/human-interface-guidelines/sliders](https://developer.apple.com/design/human-interface-guidelines/sliders)

Measurements:

track height: \~4pt

thumb diameter: \~28pt

track corner radius: 2pt (capsule — half of height)

minimum touch target: 44pt × 44pt

States:

filled portion (min to thumb): tintColor (default systemBlue)

unfilled portion (thumb to max): systemFill (gray)

thumb: white circle with shadow

Colors:

minimum track: systemBlue (light: \#007AFF, dark: \#0A84FF)

maximum track: systemFill semantic color

thumb: white (\#FFFFFF) with black shadow

Canvas rendering note:

Determine the scalar value of the slider (e.g., 0.6 for 60%). Multiply the total allocated width of the slider track by this scalar to determine the absolute X-coordinate of the thumb's center.

Draw the maximum track first. Create a path starting from the calculated thumb X-coordinate, extending to the total width. Ensure the rightmost edge features a 2pt radius semi-circle. Fill this path with the resolved systemFill color.

Draw the minimum track. Create a path starting from x \= 0, extending to the thumb X-coordinate. Ensure the leftmost edge features a 2pt radius semi-circle. Fill this path with the resolved systemBlue tint color.

To draw the thumb, execute ctx.save(). Apply shadow parameters: ctx.shadowColor \= 'rgba(0, 0, 0, 0.3)', ctx.shadowOffsetY \= 2, ctx.shadowBlur \= 3\. Draw a circle centered at (thumbX, centerY) with a radius of 14pt. Fill with \#FFFFFF, and call ctx.restore().

### **5.3 Steppers**

Steppers function as precision quantization tools, allowing users to increment or decrement a bounded numerical value by a predefined step size. While Sliders excel at rapid, imprecise sweeps across a domain, Steppers are utilized when exact numeric control is necessary.4

The legacy of the UIStepper in UIKit informs its rigid presence in SwiftUI. The default unscaled frame of a standard stepper is 94pt in width by 32pt in height.21 The architecture is essentially a fused segmented control. It presents as a contiguous rounded rectangle, bisected exactly in the center by a 1pt vertical separator line. The left segment houses a minus (-) glyph, while the right segment houses a plus (+) glyph.23

The background of the stepper utilizes an elevated semantic token, typically secondarySystemGroupedBackground, enabling it to sit prominently atop standard canvases.12 The glyphs and the central divider line share the same tint color (systemBlue by default).12 Because a Canvas 2D environment does not have native access to Apple's proprietary SF Symbols font library, the plus and minus glyphs must be procedurally drawn using intersecting rounded rectangles to achieve the correct optical weight and styling.21 Memory analysis shows the minus symbol occupies an optical bounding box of roughly 13x4pt, while the plus occupies 13x14pt.21

HIG SPEC: Stepper

Source URL: [https://developer.apple.com/design/human-interface-guidelines/steppers](https://developer.apple.com/design/human-interface-guidelines/steppers)

Measurements:

overall frame: 94pt × 32pt

corner radius: 8pt (continuous curve approximation)

divider width: 1pt (centered vertically, inset from top/bottom by \~6pt)

symbol size: minus is \~13x4pt, plus is \~13x14pt

minimum touch target: 44pt × 44pt (handled via invisible hit area)

States:

normal: background filled, symbols tinted

disabled: overall opacity reduced, interaction blocked

Colors:

background: secondarySystemGroupedBackground or tertiarySystemFill

symbols & divider: tintColor (default systemBlue)

Canvas rendering note:

Define a 94pt by 32pt bounding box. Use ctx.bezierCurveTo to construct an 8pt continuous corner radius around the perimeter. Fill the resulting path with secondarySystemGroupedBackground.

Draw the central divider: a 1pt vertical line at x \= 47\. To ensure crisp rendering, align the stroke to a half-pixel boundary (e.g., 47.5). Start the line at y \= 6 and end at y \= 26\. Stroke with systemBlue.

Procedurally generate the minus glyph. Calculate the center of the left segment (x: 23.5, y: 16). Draw a rounded rectangle 13pt wide and 2.5pt high, centered at this point, with a 1pt corner radius. Fill with systemBlue.

Procedurally generate the plus glyph. Calculate the center of the right segment (x: 70.5, y: 16). Draw a horizontal rounded rectangle (13pt x 2.5pt) and an intersecting vertical rounded rectangle (2.5pt x 13pt), both centered at this point, possessing 1pt corner radii. Fill both paths with systemBlue.

### **5.4 Pickers (Wheel, Menu, and Inline Styles)**

The SwiftUI Picker is an extremely adaptable, polymorphic control. The physical manifestation of the picker is entirely dependent upon the application of the .pickerStyle() modifier and the spatial constraints of its parent container.1 The Canvas rendering agent must isolate and execute three distinct algorithms to accurately represent the primary mobile picker styles: the legacy Wheel, the modern Menu, and the structural Inline style.25

#### **5.4.1 The Wheel Picker (.pickerStyle(.wheel))**

The Wheel Picker is a skeuomorphic artifact designed to simulate a physical, rotating cylindrical drum.27 The control occupies a significant vertical footprint, traditionally defaulting to a rigid height of 216pt.28 The anatomy consists of a stacked array of text rows, an overlaid selection band, and an alpha-gradient mask.

The row height is strictly constrained, typically resting at 32pt.27 The currently selected item sits exactly in the vertical center of the 216pt frame. Directly behind this central text is the selection indicator, a rounded rectangle band measuring approximately 34pt in height.27 The text in the central row is rendered at full scale and 100% opacity. Rows radiating outward from the center are subjected to a mathematical squash—a 3D perspective transformation that compresses their vertical scale to simulate the curvature of a cylinder. Finally, a linear gradient mask is applied to the entire component, fading the non-selected text to 0% opacity as it approaches the upper and lower bounds of the 216pt frame.27

HIG SPEC: Picker (.wheel style)

Source URL: [https://developer.apple.com/design/human-interface-guidelines/pickers](https://developer.apple.com/design/human-interface-guidelines/pickers)

Measurements:

overall height: 216pt (standard maximum)

row height: \~32pt

selection band height: \~34pt (centered vertically)

text scale: center row 100%, adjacent rows \~85% with squashed Y-axis

States:

static: center item highlighted, edges faded out via alpha gradient

Colors:

selection band background: systemFill (rgba(120, 120, 128, 0.20))

selection band corner radius: 8pt (slightly inset from screen edges)

text: primary label color (black/white)

Canvas rendering note:

Define a 216pt tall clipping region on the Canvas.

Calculate the vertical center (y \= 108). Draw the selection indicator band: a rounded rectangle (8pt radius) spanning the width of the picker, starting at y \= 91 and ending at y \= 125\. Fill with systemFill.

Iterate through the available data rows. For the selected center row, draw the text at standard scale utilizing the primary label color.

For adjacent rows above and below, apply a context transformation ctx.transform(1, 0, 0, 0.85, 0, offsetY) to squash the Y-axis, simulating cylindrical recession.

To replicate the fade effect, create a createLinearGradient from top to bottom. Use the gradient to composite an alpha mask over the upper and lower thirds of the 216pt frame, smoothly interpolating the text opacity down to zero.

#### **5.4.2 The Menu Picker (.pickerStyle(.menu))**

Introduced as a more spatially economical alternative in modern iOS iterations, the Menu style condenses the picker options into a single interactive button.24 Upon interaction, it spawns a floating context menu.25 The static Canvas preview of this control represents its unpressed, dormant state.

The visual anatomy is highly minimalist. It consists of the currently selected text value, trailed immediately by a specific SF Symbol: chevron.up.chevron.down.30 This chevron provides the visual affordance indicating that the text is not static, but rather a gateway to a hidden array of options.30 The text and the chevron utilize the system tintColor or a secondary gray depending on the context (e.g., standalone versus embedded in a navigation bar).31

HIG SPEC: Picker (.menu style)

Source URL: [https://developer.apple.com/design/human-interface-guidelines/pickers](https://developer.apple.com/design/human-interface-guidelines/pickers)

Measurements:

overall height: \~44pt (when inside a list row)

chevron spacing: \~4pt to 8pt padding between text and icon

chevron size: roughly 10pt wide by 14pt high

States:

unpressed: standard text with trailing chevron indicator

Colors:

text: tintColor (systemBlue) or secondaryLabel (gray) depending on context

chevron: exact same as text color

Canvas rendering note:

Determine the bounding box of the selected textual value.

Draw the text using the system font (San Francisco). If the picker is embedded in a Form's trailing edge, right-align the text. If standalone, left-align.

Translate the Canvas context to the immediate right of the text bounding box (adding 4pt to 8pt of padding).

Procedurally draw the chevron.up.chevron.down icon to negate the need for an external font dependency. Execute ctx.beginPath(). Use ctx.moveTo() and ctx.lineTo() to draw a small upper V-shape and a small lower inverted V-shape. Set ctx.lineWidth \= 1.5, ctx.lineCap \= 'round', and ctx.lineJoin \= 'round'. Apply ctx.stroke() utilizing the resolved tintColor.

#### **5.4.3 The Inline Picker (.pickerStyle(.inline))**

The Inline Picker exposes all available options simultaneously by embedding them directly into the parent container's layout flow.32 This style is particularly prevalent within Forms and Lists where immediate visibility of all choices is prioritized over spatial economy.

When integrated into an inset grouped form, the inline picker appropriates the structural geometry of standard list rows.33 Each option occupies a 44pt high row. The text is left-aligned, matching the standard 16pt leading margin. The distinguishing feature of the inline picker is the selection mechanism: the currently active choice is marked by a trailing checkmark icon.35 This checkmark is right-aligned, possessing a 16pt trailing margin, and is painted with the global tintColor (systemBlue).34 Unselected rows lack this checkmark entirely. Standard 0.5pt separators divide the rows.

HIG SPEC: Picker (.inline style)

Source URL: [https://developer.apple.com/design/human-interface-guidelines/pickers](https://developer.apple.com/design/human-interface-guidelines/pickers)

Measurements:

row height: 44pt per option

checkmark size: \~14pt × 14pt bounding box

padding: 16pt leading margin for text, 16pt trailing margin for checkmark

States:

selected: row displays trailing checkmark

unselected: no checkmark, text only

Colors:

text: primary label color

checkmark: tintColor (systemBlue)

separator: separator semantic color

Canvas rendering note:

Loop through the provided data array. For each item, allocate a 44pt high horizontal row.

Render the option text horizontally inset by 16pt from the left (leading) edge.

For all rows except the final one, draw a 0.5pt horizontal separator line at the bottom of the row bounds. Start the path at x \= 16 and extend it to the maximum width of the row container. Stroke with the separator semantic color, ensuring half-pixel translation to prevent anti-aliasing blur.

If the current iteration index matches the selected state variable, draw the checkmark icon. Translate the context to the right (trailing) edge, inset by 16pt. Procedurally draw an asymmetrical V-shape using ctx.moveTo and ctx.lineTo to simulate the SF Symbol checkmark. Set ctx.lineWidth \= 2.0, ctx.lineCap \= 'round', ctx.lineJoin \= 'round', and stroke with systemBlue.

### **5.5 Form / List Containers (Inset Grouped Style)**

Historically, iOS interface design relied upon full-width, edge-to-edge grouped table views to manage settings and form inputs. With the introduction of iOS 13, Apple pivoted toward the InsetGroupedListStyle, a design paradigm that pulls the structural boundaries of the list inward, creating distinct, rounded, floating cards.2 This style maximizes spatial hierarchy and is now the default appearance for SwiftUI Form structures on iOS.2

The architectural brilliance of the inset grouped form relies entirely on the interplay of semantic background colors and precise corner radii. The global root view is flooded with systemGroupedBackground.11 Each individual section within the form—which may contain a single row or dozens of stacked rows—is encapsulated within a bounding card filled with secondarySystemGroupedBackground.12 In Light Mode, this creates a subtle differentiation (a light gray canvas beneath stark white cards), whereas Dark Mode utilizes intense blacks and elevated dark grays to simulate light depth.12

The geographic specifications dictate that the cards maintain a 16pt horizontal margin from the physical screen edges on compact class devices (iPhones), expanding to 20pt or larger on regular class devices (iPads).38 The outer corner radius of the section card is mathematically defined as a 10pt continuous squircle.39 Inside the card, individual 44pt rows are stacked vertically. To differentiate the rows, 0.5pt separator lines are drawn between them.12 Crucially, these separators are not full-width; they are inset by 16pt from the leading edge to perfectly align with the text content of the row, while extending completely flush to the trailing edge. The final row in a section intentionally omits the bottom separator, relying instead on the 10pt rounded corner of the bounding card to provide visual closure.

HIG SPEC: Form / List (insetGrouped style)

Source URL: [https://developer.apple.com/design/human-interface-guidelines/layout](https://developer.apple.com/design/human-interface-guidelines/layout)

Measurements:

section corner radius: 10pt (approximated via squircle/continuous curve)

inset from screen edges: 16pt leading and trailing

separator inset: 16pt from leading (aligns with text), flush to trailing edge

separator thickness: 0.5pt (requires sub-pixel rendering compensation)

States:

N/A (Static Container structure)

Colors:

overall background: systemGroupedBackground (light: \#F2F2F7, dark: \#000000)

section cell background: secondarySystemGroupedBackground (light: \#FFFFFF, dark: \#1C1C1E)

separator: separator semantic color (light: rgba(60,60,67,0.29), dark: rgba(84,84,88,0.60))

Canvas rendering note:

Execute ctx.fillStyle using the resolved systemGroupedBackground token and ctx.fillRect() over the entire available Canvas viewport to establish the base layer.

For a given form section, define a bounding rectangle with a width equal to the screen width minus 32pt (accounting for the 16pt padding on both the left and right).

Draw the section bounding box utilizing a custom bezierCurveTo implementation to achieve a 10pt continuous corner radius. Fill the resultant path with secondarySystemGroupedBackground.

Invoke ctx.save() and ctx.clip() restricted to this newly drawn rounded rectangle. This is mandatory to ensure that no internal row backgrounds or highlight states bleed outside the 10pt corners.

Iterate through the rows within the section. For each row (calculated at 44pt height), render the internal text or control elements.

For every row *except* the terminal row in the section, draw a 0.5pt horizontal separator line. Start the path at x \= 16 (relative to the section's internal coordinate space) and end it at the section's maximum width.

Stroke the line with the separator color. To bypass the Canvas API's anti-aliasing blur on fractional lines, align the Y-coordinate of the moveTo and lineTo commands to a half-pixel boundary (e.g., Y \= 43.5 for the bottom of the first row).

Execute ctx.restore() to release the clipping mask before moving to the next section.

## **6\. Synthesis and Implementation Outlook**

The successful transposition of SwiftUI control specifications into a web-native Canvas 2D renderer is not merely an exercise in geometric copying. It represents a fundamental recreation of Apple's entire visual rendering stack. By mapping the highly adaptive semantic color tokens to specific RGBA values across Light and Dark appearance states, and by replacing the default circular arcs of the Canvas API with custom bezier approximations of continuous iOS squircles, the renderer can achieve an output indistinguishable from a native preview.

The rigorous application of the measurements outlined in the specification blocks above—from the unyielding 51x31pt frame of the Toggle to the sub-pixel precision of the Inset Grouped List separators—ensures that the spatial hierarchy remains mathematically sound. The resulting Canvas architecture will provide developers with an impeccably accurate, instant-feedback environment that honors the nuanced physics and dimensional constraints of the Human Interface Guidelines.

#### **Джерела**

1. How to Use and Style SwiftUI Picker \- SwiftyPlace, доступ отримано квітня 1, 2026, [https://www.swiftyplace.com/blog/swiftui-picker-made-easy-tutorial-with-example](https://www.swiftyplace.com/blog/swiftui-picker-made-easy-tutorial-with-example)  
2. Inset grouped List in SwiftUI \- Sarunw, доступ отримано квітня 1, 2026, [https://sarunw.com/posts/inset-grouped-in-swiftui/](https://sarunw.com/posts/inset-grouped-in-swiftui/)  
3. UISlider | Apple Developer Documentation, доступ отримано квітня 1, 2026, [https://developer.apple.com/documentation/UIKit/UISlider](https://developer.apple.com/documentation/UIKit/UISlider)  
4. UIStepper | Apple Developer Documentation, доступ отримано квітня 1, 2026, [https://developer.apple.com/documentation/UIKit/UIStepper](https://developer.apple.com/documentation/UIKit/UIStepper)  
5. MenuPickerStyle | Apple Developer Documentation, доступ отримано квітня 1, 2026, [https://developer.apple.com/documentation/swiftui/menupickerstyle](https://developer.apple.com/documentation/swiftui/menupickerstyle)  
6. Design and Prototype for iOS 17 in Figma \- Design+Code, доступ отримано квітня 1, 2026, [https://designcode.io/ios17-intro/](https://designcode.io/ios17-intro/)  
7. How to change UIPickerView height \- Codemia, доступ отримано квітня 1, 2026, [https://codemia.io/knowledge-hub/path/how\_to\_change\_uipickerview\_height](https://codemia.io/knowledge-hub/path/how_to_change_uipickerview_height)  
8. The iOS 17 Design Guidelines: An Illustrated Guide, доступ отримано квітня 1, 2026, [https://www.learnui.design/blog/ios-design-guidelines-templates.html](https://www.learnui.design/blog/ios-design-guidelines-templates.html)  
9. Making custom UISwitch (Part 1\) \- Factory.hr \- Medium, доступ отримано квітня 1, 2026, [https://factoryhr.medium.com/making-custom-uiswitch-part-1-cc3ab9c0b05b](https://factoryhr.medium.com/making-custom-uiswitch-part-1-cc3ab9c0b05b)  
10. Supporting Dark Mode in your interface | Apple Developer Documentation, доступ отримано квітня 1, 2026, [https://developer.apple.com/documentation/uikit/supporting-dark-mode-in-your-interface](https://developer.apple.com/documentation/uikit/supporting-dark-mode-in-your-interface)  
11. Color | Apple Developer Documentation, доступ отримано квітня 1, 2026, [https://developer.apple.com/design/human-interface-guidelines/color](https://developer.apple.com/design/human-interface-guidelines/color)  
12. Dark color cheat sheet | Sarunw, доступ отримано квітня 1, 2026, [https://sarunw.com/posts/dark-color-cheat-sheet/](https://sarunw.com/posts/dark-color-cheat-sheet/)  
13. Colors \- SAP, доступ отримано квітня 1, 2026, [https://www.sap.com/design-system/fiori-design-ios/v25-11/foundations/colors](https://www.sap.com/design-system/fiori-design-ios/v25-11/foundations/colors)  
14. Dark Mode on iOS 13 \- NSHipster, доступ отримано квітня 1, 2026, [https://nshipster.com/dark-mode/](https://nshipster.com/dark-mode/)  
15. Adopting Liquid Glass | Apple Developer Documentation, доступ отримано квітня 1, 2026, [https://developer.apple.com/documentation/TechnologyOverviews/adopting-liquid-glass](https://developer.apple.com/documentation/TechnologyOverviews/adopting-liquid-glass)  
16. How do I achieve a list like this one? With rounded corners and a background color. \- Reddit, доступ отримано квітня 1, 2026, [https://www.reddit.com/r/SwiftUI/comments/ksqvij/how\_do\_i\_achieve\_a\_list\_like\_this\_one\_with/](https://www.reddit.com/r/SwiftUI/comments/ksqvij/how_do_i_achieve_a_list_like_this_one_with/)  
17. Introducing ConcentricRectangle: Automatic Inner Corner Radius in iOS 26 \- DevTechie, доступ отримано квітня 1, 2026, [https://www.devtechie.com/blog/98c83c2f-0a12-4945-89f5-9f5489400ede](https://www.devtechie.com/blog/98c83c2f-0a12-4945-89f5-9f5489400ede)  
18. Changing UISwitch width and height \- ios \- Stack Overflow, доступ отримано квітня 1, 2026, [https://stackoverflow.com/questions/25104605/changing-uiswitch-width-and-height](https://stackoverflow.com/questions/25104605/changing-uiswitch-width-and-height)  
19. Resize UISwitch in Swift 4 \- ios \- Stack Overflow, доступ отримано квітня 1, 2026, [https://stackoverflow.com/questions/48040403/resize-uiswitch-in-swift-4](https://stackoverflow.com/questions/48040403/resize-uiswitch-in-swift-4)  
20. How to make UISlider default thumb to be smaller like the ones in the iOS control center, доступ отримано квітня 1, 2026, [https://stackoverflow.com/questions/42092907/how-to-make-uislider-default-thumb-to-be-smaller-like-the-ones-in-the-ios-contro](https://stackoverflow.com/questions/42092907/how-to-make-uislider-default-thumb-to-be-smaller-like-the-ones-in-the-ios-contro)  
21. UIStepper size of decrement and increment images \- Stack Overflow, доступ отримано квітня 1, 2026, [https://stackoverflow.com/questions/13665656/uistepper-size-of-decrement-and-increment-images](https://stackoverflow.com/questions/13665656/uistepper-size-of-decrement-and-increment-images)  
22. UIStepper control \- Use Your Loaf, доступ отримано квітня 1, 2026, [https://useyourloaf.com/blog/uistepper-control/](https://useyourloaf.com/blog/uistepper-control/)  
23. Problems customizing UIStepper with translucent divider, button sizes and deferring tint color \- Stack Overflow, доступ отримано квітня 1, 2026, [https://stackoverflow.com/questions/70596478/problems-customizing-uistepper-with-translucent-divider-button-sizes-and-deferr](https://stackoverflow.com/questions/70596478/problems-customizing-uistepper-with-translucent-divider-button-sizes-and-deferr)  
24. menu | Apple Developer Documentation, доступ отримано квітня 1, 2026, [https://developer.apple.com/documentation/swiftui/pickerstyle/menu](https://developer.apple.com/documentation/swiftui/pickerstyle/menu)  
25. 4 Picker styles in SwiftUI Form \- Sarunw, доступ отримано квітня 1, 2026, [https://sarunw.com/posts/swiftui-form-picker-styles/](https://sarunw.com/posts/swiftui-form-picker-styles/)  
26. SwiftUI 2.0 Picker Styles Quick Comparison \- Johnny Cheng \- Medium, доступ отримано квітня 1, 2026, [https://johnny0116.medium.com/swiftui-2-0-picker-styles-comparison-767e562a33d4](https://johnny0116.medium.com/swiftui-2-0-picker-styles-comparison-767e562a33d4)  
27. UIPickerView | Apple Developer Documentation, доступ отримано квітня 1, 2026, [https://developer.apple.com/documentation/uikit/uipickerview](https://developer.apple.com/documentation/uikit/uipickerview)  
28. How to change UIPickerView height \- ios \- Stack Overflow, доступ отримано квітня 1, 2026, [https://stackoverflow.com/questions/573979/how-to-change-uipickerview-height](https://stackoverflow.com/questions/573979/how-to-change-uipickerview-height)  
29. Change UIPickerView's component height? \- Stack Overflow, доступ отримано квітня 1, 2026, [https://stackoverflow.com/questions/34364835/change-uipickerviews-component-height](https://stackoverflow.com/questions/34364835/change-uipickerviews-component-height)  
30. Setup SwiftUI Picker with a label | by David Krcek \- Medium, доступ отримано квітня 1, 2026, [https://switch2mac.medium.com/setup-swiftui-picker-with-a-label-1614e9a7c126](https://switch2mac.medium.com/setup-swiftui-picker-with-a-label-1614e9a7c126)  
31. Populating SwiftUI menus with adaptive controls | Apple Developer Documentation, доступ отримано квітня 1, 2026, [https://developer.apple.com/documentation/SwiftUI/Populating-SwiftUI-menus-with-adaptive-controls](https://developer.apple.com/documentation/SwiftUI/Populating-SwiftUI-menus-with-adaptive-controls)  
32. InlinePickerStyle | Apple Developer Documentation, доступ отримано квітня 1, 2026, [https://developer.apple.com/documentation/SwiftUI/InlinePickerStyle](https://developer.apple.com/documentation/SwiftUI/InlinePickerStyle)  
33. Picker in SwiftUI explained with code examples \- SwiftLee, доступ отримано квітня 1, 2026, [https://www.avanderlee.com/swiftui/picker-styles-color/](https://www.avanderlee.com/swiftui/picker-styles-color/)  
34. Create and Style Picker in SwiftUI Form \- Swift Anytime, доступ отримано квітня 1, 2026, [https://www.swiftanytime.com/blog/picker-in-form-swiftui](https://www.swiftanytime.com/blog/picker-in-form-swiftui)  
35. Advanced SwiftUI: Implementing a custom Picker | by Julien Sagot \- Medium, доступ отримано квітня 1, 2026, [https://medium.com/@Barbapapapps/beyond-basics-implementing-a-custom-picker-in-swiftui-88c01e283ac1](https://medium.com/@Barbapapapps/beyond-basics-implementing-a-custom-picker-in-swiftui-88c01e283ac1)  
36. insetGrouped | Apple Developer Documentation, доступ отримано квітня 1, 2026, [https://developer.apple.com/documentation/SwiftUI/ListStyle/insetGrouped](https://developer.apple.com/documentation/SwiftUI/ListStyle/insetGrouped)  
37. SwiftUI — InsetGroupedListStyle list style | by Stanciu Valentin \- Medium, доступ отримано квітня 1, 2026, [https://medium.com/@stvalentin/swiftui-insetgroupedliststyle-list-style-7dea4d661648](https://medium.com/@stvalentin/swiftui-insetgroupedliststyle-list-style-7dea4d661648)  
38. padding(\_:\_:) | Apple Developer Documentation, доступ отримано квітня 1, 2026, [https://developer.apple.com/documentation/SwiftUI/View/padding(\_:\_:)](https://developer.apple.com/documentation/SwiftUI/View/padding\(_:_:\))  
39. Grouped UITableView corner radius default value \- Stack Overflow, доступ отримано квітня 1, 2026, [https://stackoverflow.com/questions/17253255/grouped-uitableview-corner-radius-default-value](https://stackoverflow.com/questions/17253255/grouped-uitableview-corner-radius-default-value)

[image1]: <data:image/png;base64,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>