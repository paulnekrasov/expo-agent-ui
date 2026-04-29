# Native Performance Diagnosis

### Native Performance Checklist

- Are animations smooth on low-end devices and under CPU load?[^4][^24][^30]
- Are you animating transforms/opacity equivalents instead of re-layouting large hierarchies?[^4][^38]
- Do infinite animations pause or simplify when off-screen?[^4][^30]
- Does Reduce Motion shorten or remove large, sweeping animations?[^27][^35][^4]


### SwiftUI

- Use Instruments SwiftUI and Time Profiler to detect hitches; look for long updates in view recomposition or layout.[^24]
- Avoid heavy work in `body`; move expensive calculations outside or cache.[^24]
- Prefer `Canvas` for particle effects; drive time via `TimelineView`.[^16]
- Beware nested `GeometryReader` with complex layout + animations.


### Compose

- Use `remember` for states and animation specs; avoid repeated allocations per frame.[^33][^38]
- Inspect recomposition with Compose tooling; consider `graphicsLayer` for transforms.[^38]
- For gesture animations, use `Animatable` rather than multiple `animate*AsState` and re-layout loops.[^34]


### Common Mistakes \& Fixes

- **Mistake**: Compose `animateColorAsState` used deep in a long recomposition chain, causing entire subtree to recompose.
**Fix**: Hoist animation state closer to leaf nodes or wrap subtrees in dedicated composables.[^33][^38]
- **Mistake**: SwiftUI `@State` driving frequent background updates for animation.
**Fix**: Use timeline-based views or `withAnimation` on discrete state changes instead of per-frame updates.[^13][^24]
