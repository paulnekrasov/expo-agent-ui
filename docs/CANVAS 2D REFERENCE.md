```
---
CANVAS 2D REFERENCE: Background fills and borders
---

  ctx.fillRect(x, y, width, height)
    Description: Draws a rectangle filled according to the current fillStyle, directly to
    the canvas without modifying the current path.
    iOS use: Navigation bar background fill, List row background, Tab bar opaque base layer.
    Example for SwiftUI renderer:
      const bg = resolveSemanticColor('systemBackground', colorScheme);
      ctx.fillStyle = bg;
      ctx.fillRect(node.frame.x, node.frame.y, node.frame.width, node.frame.height);

  ctx.strokeRect(x, y, width, height)
    Description: Draws a rectangle outlined according to the current strokeStyle and other
    context settings, directly to the canvas without modifying the current path.
    iOS use: TextField border, Card outline, Segmented control divider frame.
    Example for SwiftUI renderer:
      ctx.strokeStyle = resolveSemanticColor('separator', colorScheme);
      ctx.lineWidth = 1 / devicePixelRatio;
      ctx.strokeRect(node.frame.x + 0.5, node.frame.y + 0.5, node.frame.width, node.frame.height);

  ctx.roundRect(x, y, width, height, radii)
    Description: Adds a rounded rectangle to the current path. Radii follow CSS
    border-radius shorthand: 1 value = all corners, 4 values = [topLeft, topRight,
    bottomRight, bottomLeft]. Must call fill() or stroke() to render.
    iOS use: Button backgrounds, Card views, Toggle track, grouped List section containers.
    Example for SwiftUI renderer:
      ctx.beginPath();
      ctx.roundRect(node.frame.x, node.frame.y, node.frame.width, node.frame.height,
        node.cornerRadius ?? 10);
      ctx.fillStyle = resolveSemanticColor('secondarySystemGroupedBackground', colorScheme);
      ctx.fill();
    Availability: Chrome 99+, Firefox 112+, Safari 16.4+. Baseline since April 2023.
    For older WebViews, use arcTo() polyfill:
      function rrect(ctx, x, y, w, h, r) {
        r = Math.min(r, w / 2, h / 2);
        ctx.beginPath(); ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
      }

  ctx.arc(x, y, radius, startAngle, endAngle, counterclockwise?)
    Description: Adds a circular arc to the current sub-path. Angles in radians, measured
    from the positive x-axis. counterclockwise defaults to false.
    iOS use: Circular progress indicator, Toggle thumb, Avatar clip path, SF Symbol dot.
    Example for SwiftUI renderer:
      const cx = node.frame.x + node.frame.width / 2;
      const cy = node.frame.y + node.frame.height / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, node.frame.width / 2, 0, Math.PI * 2);
      ctx.fillStyle = resolveSemanticColor('systemBlue', colorScheme);
      ctx.fill();

  ctx.beginPath()
    Description: Starts a new path by emptying the list of sub-paths. Call when creating
    a new path.
    iOS use: Required before every shape sequence — toggle tracks, tab bar icons, badges.
    Example for SwiftUI renderer:
      ctx.beginPath();
      ctx.roundRect(trackX, trackY, trackW, trackH, trackH / 2);
      ctx.fillStyle = isOn ? resolveSemanticColor('systemGreen', colorScheme) : '#e9e9ea';
      ctx.fill();

  ctx.closePath()
    Description: Adds a straight line from the current point to the start of the current
    sub-path. Does not draw anything — call stroke() or fill() afterward.
    iOS use: Closing custom icon paths, chevron shapes, tab bar outlines.
    Example for SwiftUI renderer:
      ctx.beginPath();
      ctx.moveTo(node.frame.x, node.frame.y + node.frame.height);
      ctx.lineTo(node.frame.x + node.frame.width / 2, node.frame.y);
      ctx.lineTo(node.frame.x + node.frame.width, node.frame.y + node.frame.height);
      ctx.closePath();
      ctx.fillStyle = resolveSemanticColor('systemRed', colorScheme);
      ctx.fill();

---
CANVAS 2D REFERENCE: Text rendering
---

  ctx.fillText(text, x, y, maxWidth?)
    Description: Draws a text string at the specified coordinates, filling characters with
    the current fillStyle. Optional maxWidth compresses or scales text to fit.
    iOS use: Navigation title, List cell label, Button title, Tab bar label.
    Example for SwiftUI renderer:
      ctx.fillStyle = resolveSemanticColor('label', colorScheme);
      ctx.font = `${node.fontSize * devicePixelRatio}px -apple-system, SF Pro Text`;
      ctx.textBaseline = 'middle';
      ctx.fillText(node.text, node.frame.x, node.frame.y + node.frame.height / 2);

  ctx.measureText(text) → TextMetrics
    Description: Returns a TextMetrics object containing information about the measured
    text, including width, actualBoundingBoxAscent, and actualBoundingBoxDescent.
    iOS use: Dynamic label width for pill badges, truncation detection, centering.
    Example for SwiftUI renderer:
      ctx.font = `600 13px -apple-system`;
      const metrics = ctx.measureText(badgeCount);
      const badgeW = Math.max(metrics.width + 12, 22);
      const textH = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

  ctx.font = value  (property)
    Description: Specifies the current text style using CSS font shorthand syntax.
    Default is "10px sans-serif".
    iOS use: Mapping SwiftUI font weights (.body, .headline, .caption) to CSS font strings.
    Example for SwiftUI renderer:
      const fontMap = { title: '700 20px', headline: '600 17px', body: '400 17px',
        callout: '400 16px', subheadline: '400 15px', footnote: '400 13px', caption: '400 12px' };
      ctx.font = `${fontMap[node.textStyle]} -apple-system, SF Pro Text`;

  ctx.textAlign = value  (property)
    Description: Specifies current text alignment relative to the x coordinate of
    fillText(). Values: "start" (default), "end", "left", "right", "center".
    iOS use: Center-aligned navigation titles, right-aligned detail labels in List rows.
    Example for SwiftUI renderer:
      ctx.textAlign = 'center';
      const navCenterX = node.frame.x + node.frame.width / 2;
      ctx.fillText(node.title, navCenterX, navBarY + navBarHeight / 2);

  ctx.textBaseline = value  (property)
    Description: Specifies the current text baseline. Values: "top", "hanging", "middle",
    "alphabetic" (default), "ideographic", "bottom".
    iOS use: Vertical centering of labels in fixed-height cells (44pt), nav bars (44pt).
    Example for SwiftUI renderer:
      ctx.textBaseline = 'middle';
      const cellMidY = node.frame.y + 22;  // 44pt iOS standard row / 2
      ctx.fillText(node.text, node.frame.x + 16, cellMidY);

---
CANVAS 2D REFERENCE: Gradients and shadows
---

  ctx.createLinearGradient(x0, y0, x1, y1) → CanvasGradient
    Description: Creates a gradient along the line connecting two coordinates. Returns a
    CanvasGradient object. Coordinates are relative to the current coordinate space, not
    to any shape.
    iOS use: iOS toolbar tint gradient, status bar fade-out overlay, grouped section header.
    Example for SwiftUI renderer:
      const grad = ctx.createLinearGradient(node.frame.x, node.frame.y,
        node.frame.x, node.frame.y + node.frame.height);
      grad.addColorStop(0, resolveSemanticColor('systemBackground', colorScheme));
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(node.frame.x, node.frame.y, node.frame.width, node.frame.height);

  ctx.createRadialGradient(x0, y0, r0, x1, y1, r1) → CanvasGradient
    Description: Creates a radial gradient defined by two circles (start circle at
    x0,y0,r0 and end circle at x1,y1,r1). Returns a CanvasGradient object.
    iOS use: Pressed-state highlight on circular buttons, spotlight/focus ring, SF Symbol glow.
    Example for SwiftUI renderer:
      const cx = node.frame.x + node.frame.width / 2;
      const cy = node.frame.y + node.frame.height / 2;
      const rGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, node.frame.width / 2);
      rGrad.addColorStop(0, 'rgba(0,122,255,0.3)');
      rGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = rGrad;
      ctx.fill();

  gradient.addColorStop(offset, color)
    Description: Adds a new color stop to a CanvasGradient. Offset is a number between
    0 (start) and 1 (end). Color is any CSS <color> value.
    iOS use: Building multi-stop iOS system gradients (e.g. the 3-stop grouped background).
    Example for SwiftUI renderer:
      const navGrad = ctx.createLinearGradient(0, 0, 0, 44 * devicePixelRatio);
      navGrad.addColorStop(0, resolveSemanticColor('systemBackground', colorScheme));
      navGrad.addColorStop(0.95, resolveSemanticColor('systemBackground', colorScheme));
      navGrad.addColorStop(1, 'transparent');

  ctx.shadowColor = value  (property)
    Description: Specifies the color of shadows. Default is fully-transparent black
    "rgba(0, 0, 0, 0)" — no visible shadow until explicitly set.
    iOS use: Card elevation shadow, floating action button drop shadow, modal sheet edge.
    Example for SwiftUI renderer:
      ctx.shadowColor = colorScheme === 'dark'
        ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.15)';

  ctx.shadowBlur = value  (property)
    Description: Specifies the blur level for shadows. Default is 0. Value does not map
    directly to pixels. Non-negative float.
    iOS use: Card shadows (blur ~8), modal sheets (blur ~20), popovers (blur ~16).
    Example for SwiftUI renderer:
      ctx.shadowBlur = node.elevation === 'card' ? 8 : node.elevation === 'modal' ? 20 : 0;

  ctx.shadowOffsetX = value / ctx.shadowOffsetY = value  (properties)
    Description: shadowOffsetX specifies horizontal shadow distance; shadowOffsetY
    specifies vertical shadow distance. Both default to 0. Not affected by transforms.
    iOS use: iOS shadows are typically y-biased (offset 0, 2–4) to simulate top-down light.
    Example for SwiftUI renderer:
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = node.elevation === 'card' ? 2 * devicePixelRatio : 4 * devicePixelRatio;
      ctx.shadowBlur = 8 * devicePixelRatio;
      ctx.shadowColor = colorScheme === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.12)';

---
CANVAS 2D REFERENCE: State management
---

  ctx.save()
    Description: Saves the entire canvas state by pushing it onto a stack. Saved state
    includes transformations, clipping region, and all style properties (fillStyle,
    strokeStyle, globalAlpha, font, shadow*, lineWidth, etc.).
    iOS use: Isolating per-node transforms and styles; required before every clip() call.
    Example for SwiftUI renderer:
      ctx.save();
      ctx.translate(node.frame.x, node.frame.y);
      ctx.rotate(node.rotation ?? 0);
      renderChildren(ctx, node.children, colorScheme);
      ctx.restore();

  ctx.restore()
    Description: Restores the most recently saved canvas state by popping the top entry
    from the drawing state stack. If no saved state exists, does nothing.
    iOS use: Paired with save() after rendering each node subtree, undoing clips and transforms.
    Example for SwiftUI renderer:
      // Pattern: every renderNode call is bracketed
      function renderNode(ctx, node, colorScheme) {
        ctx.save();
        applyTransform(ctx, node);
        drawBackground(ctx, node, colorScheme);
        drawContent(ctx, node, colorScheme);
        ctx.restore();  // clipping, transforms, styles fully reverted
      }

  ctx.translate(x, y)
    Description: Adds a translation transformation, moving the canvas origin x units
    horizontally and y units vertically.
    iOS use: Positioning each SwiftUI node at its frame origin before drawing at (0,0).
    Example for SwiftUI renderer:
      ctx.save();
      ctx.translate(node.frame.x * devicePixelRatio, node.frame.y * devicePixelRatio);
      // Draw node content at local origin (0, 0)
      ctx.fillRect(0, 0, node.frame.width * devicePixelRatio, node.frame.height * devicePixelRatio);
      ctx.restore();

  ctx.scale(x, y)
    Description: Adds a scaling transformation. x scales horizontally, y vertically.
    Values < 1.0 reduce, > 1.0 enlarge. Negative values mirror.
    iOS use: HiDPI rendering (scale by devicePixelRatio), button press-down animation scale(0.97).
    Example for SwiftUI renderer:
      // HiDPI setup at canvas init
      ctx.scale(devicePixelRatio, devicePixelRatio);
      // Press animation
      if (node.isPressed) {
        ctx.translate(cx, cy);
        ctx.scale(0.97, 0.97);
        ctx.translate(-cx, -cy);
      }

  ctx.rotate(angle)
    Description: Adds a rotation to the transformation matrix. Angle is clockwise in
    radians. Rotation center is always the current canvas origin — use translate() first
    to rotate around an object's center.
    iOS use: Disclosure chevron animation (0 → π/2), loading spinner segments, icon rotation.
    Example for SwiftUI renderer:
      const cx = node.frame.x + node.frame.width / 2;
      const cy = node.frame.y + node.frame.height / 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(node.disclosureAngle ?? 0);  // 0 = collapsed, Math.PI/2 = expanded
      ctx.translate(-cx, -cy);
      drawChevron(ctx, node);
      ctx.restore();

---
CANVAS 2D REFERENCE: Image drawing
---

  ctx.drawImage(image, dx, dy)
  ctx.drawImage(image, dx, dy, dWidth, dHeight)
  ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    Description: Draws an image onto the canvas. Overload 1 draws at natural size at
    (dx,dy). Overload 2 scales to dWidth×dHeight. Overload 3 crops a source rectangle
    (sx,sy,sWidth,sHeight) and draws it scaled into the destination rectangle.
    Accepted sources: HTMLImageElement, HTMLCanvasElement, ImageBitmap, OffscreenCanvas.
    iOS use: App icon rendering, avatar images, pre-rasterized SF Symbols, image content views.
    Example for SwiftUI renderer:
      // Pre-cached icon from sprite sheet (overload 3 — source crop)
      const icon = iconCache[node.sfSymbol];
      if (icon.complete) {
        ctx.drawImage(icon.sheet, icon.sx, icon.sy, icon.sw, icon.sh,
          node.frame.x, node.frame.y, node.frame.width, node.frame.height);
      }
      // Simple avatar (overload 2 — scaled)
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, avatarRadius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatarImg, node.frame.x, node.frame.y, avatarSize, avatarSize);
      ctx.restore();

---
CANVAS 2D REFERENCE: Clipping
---

  ctx.clip(fillRule?)
  ctx.clip(path, fillRule?)
    Description: Turns the current path (or a given Path2D) into the current clipping
    region, intersected with any existing clip. fillRule is "nonzero" (default) or
    "evenodd". Clipping cannot be undone — use save()/restore() to revert.
    iOS use: Circular avatar masks, rounded-rect card content clipping, safe-area masking.
    Example for SwiftUI renderer:
      // Rounded-rect content clip (e.g. Card with image overflow)
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(node.frame.x, node.frame.y,
        node.frame.width, node.frame.height, node.cornerRadius);
      ctx.clip();
      renderChildren(ctx, node.children, colorScheme);
      ctx.restore();  // Always restore after clip

---
BACKDROP-FILTER TECHNIQUE: Navigation bar frosted glass
---

  CSS property: backdrop-filter: blur(20px) saturate(180%)
  iOS visual spec: UINavigationBar default material uses ~20px Gaussian blur with slight
  saturation boost over scrolled content. Semi-transparent background is required for
  the effect to be visible.

  HTML structure required:

    <div id="scroll-content" style="
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      overflow-y: auto;
      padding-top: 91px; /* statusBar(47) + navBar(44) */
    ">
      <!-- Scrollable SwiftUI node tree renders here -->
    </div>

    <div id="nav-bar-blur" style="
      position: fixed;
      top: 0; left: 0; right: 0;
      height: 91px; /* statusBar + navBar */
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      backdrop-filter: blur(20px) saturate(180%);
      background-color: rgba(249, 249, 249, 0.78); /* iOS light systemNavigationBar */
      z-index: 1000;
      border-bottom: 0.5px solid rgba(0, 0, 0, 0.12);
    "></div>

    <div id="nav-bar-content" style="
      position: fixed;
      top: 47px; left: 0; right: 0;
      height: 44px;
      display: flex; align-items: center; justify-content: center;
      z-index: 1001;
    ">
      <span style="
        font: 600 17px/22px -apple-system, 'SF Pro Text', system-ui;
        color: #000;
        letter-spacing: -0.4px;
      ">Page Title</span>
    </div>

  Dark mode variant:
    #nav-bar-blur {
      background-color: rgba(29, 29, 31, 0.78);  /* iOS dark systemNavigationBar */
      border-bottom-color: rgba(255, 255, 255, 0.08);
    }

  Canvas alternative (when backdrop-filter is unavailable):
    Step 1: Render full scene to an offscreen canvas at full resolution.
      const offscreen = new OffscreenCanvas(w * dpr, h * dpr);
      const offCtx = offscreen.getContext('2d');
      renderScene(offCtx, rootNode, colorScheme);

    Step 2: Crop the region behind the nav bar from the offscreen canvas.
      const navH = 91 * dpr;
      const blurCanvas = new OffscreenCanvas(w * dpr, navH);
      const blurCtx = blurCanvas.getContext('2d');
      blurCtx.drawImage(offscreen, 0, 0, w * dpr, navH, 0, 0, w * dpr, navH);

    Step 3: Apply Gaussian blur via ctx.filter (Chromium 63+).
      blurCtx.filter = 'blur(20px) saturate(180%)';
      blurCtx.drawImage(blurCanvas, 0, 0);

    Step 4: Composite blurred region + tint onto the main canvas.
      ctx.drawImage(blurCanvas, 0, 0);
      ctx.fillStyle = colorScheme === 'dark'
        ? 'rgba(29,29,31,0.78)' : 'rgba(249,249,249,0.78)';
      ctx.fillRect(0, 0, w * dpr, navH);

    Performance note: The offscreen-canvas approach costs ~2–4ms per frame on a
    mid-range laptop GPU at 390×844 @2x. At 60fps this consumes 12–25% of the 16.6ms
    frame budget — acceptable for a static preview but will cause jank during continuous
    scroll animation. Prefer the CSS backdrop-filter path in all Chromium-based WebViews
    and use the canvas fallback only as a one-shot render for static previews.

  VS Code WebView compatibility:
    backdrop-filter is natively supported in Chromium 76+ (unprefixed). VS Code ships
    on Electron ≥6 (Chromium ≥76) since late 2019, so all modern VS Code versions
    support backdrop-filter without flags. The -webkit- prefix is NOT required in the
    Electron/Chromium context but may be added for defensive compatibility:
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      backdrop-filter: blur(20px) saturate(180%);
    Current VS Code (1.96+, early 2026) ships Electron 32+ / Chromium 128+. ctx.filter
    for the canvas fallback requires Chromium 63+, also universally available. Feature
    detection: @supports (backdrop-filter: blur(1px)) { ... }

---
QUICK-REFERENCE: resolveSemanticColor() helper
---

  Used throughout the examples above. Maps iOS semantic color names to concrete values:

    function resolveSemanticColor(name, colorScheme) {
      const light = {
        systemBackground: '#FFFFFF', secondarySystemBackground: '#F2F2F7',
        secondarySystemGroupedBackground: '#FFFFFF', systemGroupedBackground: '#F2F2F7',
        label: '#000000', secondaryLabel: '#3C3C43CC', separator: '#3C3C4349',
        systemBlue: '#007AFF', systemGreen: '#34C759', systemRed: '#FF3B30',
        systemGray5: '#E5E5EA',
      };
      const dark = {
        systemBackground: '#000000', secondarySystemBackground: '#1C1C1E',
        secondarySystemGroupedBackground: '#1C1C1E', systemGroupedBackground: '#000000',
        label: '#FFFFFF', secondaryLabel: '#EBEBF599', separator: '#54545899',
        systemBlue: '#0A84FF', systemGreen: '#30D158', systemRed: '#FF453A',
        systemGray5: '#2C2C2E',
      };
      return (colorScheme === 'dark' ? dark : light)[name] ?? '#FF00FF';
    }

---
QUICK-REFERENCE: HiDPI canvas setup pattern
---

  Required for crisp rendering in SwiftUI Preview WebViews on Retina displays:

    const dpr = window.devicePixelRatio || 2;
    canvas.width = node.frame.width * dpr;
    canvas.height = node.frame.height * dpr;
    canvas.style.width = node.frame.width + 'px';
    canvas.style.height = node.frame.height + 'px';
    ctx.scale(dpr, dpr);
    // All subsequent drawing uses point coordinates (not pixels)
```