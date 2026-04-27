# Navigation Adapter Research

## Executive Summary
- Build two first-party adapters behind one `AgentNavigationAdapter`: an Expo Router adapter for file-based apps and a React Navigation adapter for apps that own `NavigationContainer`.
- Do not create a navigation framework. All commands must delegate to Expo Router or React Navigation public APIs.
- Use semantic screen IDs as the agent-facing stable key. Route names, file segments, and URL paths are implementation details that may change during refactors.
- Expo Router should be read through public hooks such as `usePathname`, `useSegments`, `useLocalSearchParams`, `useGlobalSearchParams`, and `useRootNavigationState`, with imperative commands delegated to `router` or `useRouter`.
- Expo Router does not expose a complete stable public "route tree metadata" API suitable for agent control. Treat `useSitemap` and `SitemapType` as diagnostic-only until proven stable in implementation.
- React Navigation should be read through an app-provided navigation ref created with `createNavigationContainerRef`, using `isReady`, `getRootState`, `getCurrentRoute`, and `getCurrentOptions`.
- Navigation params exposed to agents must be JSON-serializable primitives or arrays/records of primitives. React Navigation recommends JSON-serializable params, and Expo Router `Href` params are URL/query oriented.
- Nested navigators, route groups, protected routes, redirects, shared routes, modals, and stale params require post-navigation verification. A `navigate(screenId)` call is not complete until the adapter observes the expected focused screen or returns a structured mismatch.
- V0 should support current-screen inspection, explicit screen registration, explicit semantic-ID-to-route mapping, primitive params, and basic push/replace/back. Defer automatic route discovery and independent navigation trees.

## Expo Router Findings

### route state APIs
- Expo Router is a file-based routing library for React Native and web apps, built on top of React Navigation. Source: Expo Router SDK reference, https://docs.expo.dev/versions/latest/sdk/router/, accessed 2026-04-27.
- `useRootNavigationState()` returns the root navigation state and should be used only as a public state-read hook, not as a reason to mutate React Navigation internals. Source: Expo Router SDK reference, https://docs.expo.dev/versions/latest/sdk/router/, accessed 2026-04-27.
- `usePathname()` returns the current route path without search params. The docs describe normalized paths, for example dynamic route file segments are resolved to concrete pathname values. Source: Expo Router SDK reference, https://docs.expo.dev/versions/latest/sdk/router/, accessed 2026-04-27.
- `useSegments()` returns selected file segments for the current route and explicitly does not normalize them; the values match the file path shape such as `["[id]"]`. Source: Expo Router SDK reference, https://docs.expo.dev/versions/latest/sdk/router/, accessed 2026-04-27.
- `useLocalSearchParams()` and `useGlobalSearchParams()` split URL-param reads by local route conformance versus global URL changes. Use local params for active screen metadata, and reserve global params for diagnostics or cross-screen observers. Source: Expo URL parameters reference, https://docs.expo.dev/router/reference/url-parameters/, accessed 2026-04-27.

### navigation APIs
- `useRouter()` returns the Router object for imperative navigation. The same module also exports a global `router` object. Source: Expo Router SDK reference, https://docs.expo.dev/versions/latest/sdk/router/, accessed 2026-04-27.
- Router methods include `navigate`, `push`, `replace`, `back`, `canGoBack`, `dismiss`, `prefetch`, and `setParams`. `push` navigates using a push operation when possible; `replace` navigates without appending to history; `setParams` updates current route query params. Source: Expo Router SDK reference, https://docs.expo.dev/versions/latest/sdk/router/, accessed 2026-04-27.
- `<Link href>` is the declarative navigation path. `href` can be a string path or an object with `pathname` and optional `params`. Source: Expo Router Link reference, https://docs.expo.dev/versions/latest/sdk/router/link/, accessed 2026-04-27.
- Relative routes are supported by runtime navigation APIs such as `router.navigate("./article")`, but an agent-facing adapter should prefer registered absolute paths to avoid ambiguity across layout boundaries. Source: Expo navigation basics, https://docs.expo.dev/router/basics/navigation/, accessed 2026-04-27.

### segment/path APIs
- File notation is semantically important: static file names map to URL segments, bracketed names are dynamic segments, parentheses create route groups, `_layout.tsx` defines layout boundaries, and plus-prefixed files are special routes. Source: Expo Router notation, https://docs.expo.dev/router/basics/notation/, accessed 2026-04-27.
- Route groups do not affect the URL. Example: `src/app/(home)/settings.tsx` maps to `/settings`. Agent UI must not treat group names as stable screen IDs. Source: Expo Router notation, https://docs.expo.dev/router/basics/notation/, accessed 2026-04-27.
- Shared routes can match the same URL through different route groups and layouts. Expo documents that shared routes may be navigated directly by including the group name, and array syntax has group-matching rules. This makes automatic screen identity from path alone unsafe. Source: Expo shared routes, https://docs.expo.dev/router/advanced/shared-routes/, accessed 2026-04-27.

### params
- URL parameters include route parameters from dynamic segments and search parameters appended to URLs. Source: Expo URL parameters reference, https://docs.expo.dev/router/reference/url-parameters/, accessed 2026-04-27.
- Local params update only when the global URL conforms to the route where the hook is used. Global params update on every URL param change. For agents, local params are the default for focused screen state; global params are useful only for observing navigation changes. Source: Expo URL parameters reference, https://docs.expo.dev/router/reference/url-parameters/, accessed 2026-04-27.
- `HrefObject.params` is documented as optional route input params on an object with `pathname`. Treat params as URL-serializable data and reject functions/classes before exposing them to MCP or flow files. Source: Expo Router SDK reference, https://docs.expo.dev/versions/latest/sdk/router/, accessed 2026-04-27.

### route groups
- Route groups are organizational directories wrapped in parentheses and do not factor into the URL. They are useful for organization and complex relationships between routes. Source: Expo Router notation, https://docs.expo.dev/router/basics/notation/, accessed 2026-04-27.
- Because groups can change without URL changes, the adapter should bind screen IDs inside screen code or layout registration, not by scraping folder names.
- Shared routes and group arrays create cases where one URL can be reached through multiple group/layout contexts. A screen contract must include both `path` and `segments`, and it may need an optional `layoutId` or `groupHint` for diagnostics.

### layouts
- `_layout.tsx` files define how pages relate to each other. `Stack` uses React Navigation native stack and can use the same screen options; `Tabs` uses React Navigation native bottom tabs and supports corresponding options. Source: Expo navigation layouts, https://docs.expo.dev/router/basics/navigation-layouts/, accessed 2026-04-27.
- Layouts can keep non-visible pages mounted. Expo documents that pushed stack pages can remain rendered even when not visible. Agent UI must mark semantic nodes outside the focused screen as not actionable unless the adapter confirms they are in the active modal/top route. Source: Expo navigation layouts, https://docs.expo.dev/router/basics/navigation-layouts/, accessed 2026-04-27.
- `unstable_settings.initialRouteName` can set a default stack screen for deep linking. The same page notes that during app navigation, the route being navigated to is the initial route unless that behavior is disabled. Source: Expo router settings, https://docs.expo.dev/router/advanced/router-settings/, accessed 2026-04-27.

### limitations
- Expo Router manages the navigation layer for Router apps, so Agent UI should not ask users to wrap a second `NavigationContainer` around an Expo Router tree.
- The public docs expose hooks and a sitemap type, but they do not document a complete stable API for enumerating every route with developer metadata, auth state, layout relationship, and route options. Automatic route-tree discovery is therefore post-v0 and NEEDS_VERIFICATION against source/types before shipping.
- Protected screens may redirect to an anchor route or first available stack screen when guard conditions fail, and history entries are removed when a guard changes from true to false. The adapter must detect redirect mismatch after navigation. Source: Expo protected routes, https://docs.expo.dev/router/advanced/protected/, accessed 2026-04-27.
- Static redirects and `<Redirect href>` can move the user to another route without an explicit agent command. The adapter must observe final route state rather than assuming command target equals final screen. Source: Expo redirects and rewrites, https://docs.expo.dev/router/advanced/redirects/, accessed 2026-04-27.

### source URLs
- Expo Router SDK reference: https://docs.expo.dev/versions/latest/sdk/router/ (accessed 2026-04-27)
- Expo Router Link reference: https://docs.expo.dev/versions/latest/sdk/router/link/ (accessed 2026-04-27)
- Expo navigation basics: https://docs.expo.dev/router/basics/navigation/ (accessed 2026-04-27)
- Expo Router notation: https://docs.expo.dev/router/basics/notation/ (accessed 2026-04-27)
- Expo URL parameters reference: https://docs.expo.dev/router/reference/url-parameters/ (accessed 2026-04-27)
- Expo navigation layouts: https://docs.expo.dev/router/basics/navigation-layouts/ (accessed 2026-04-27)
- Expo router settings: https://docs.expo.dev/router/advanced/router-settings/ (accessed 2026-04-27)
- Expo shared routes: https://docs.expo.dev/router/advanced/shared-routes/ (accessed 2026-04-27)
- Expo protected routes: https://docs.expo.dev/router/advanced/protected/ (accessed 2026-04-27)
- Expo redirects and rewrites: https://docs.expo.dev/router/advanced/redirects/ (accessed 2026-04-27)

## React Navigation Findings

### navigation container state
- `NavigationContainer` owns linking, initial state, state changes, and unhandled-action behavior for a React Navigation app. Source: React Navigation `NavigationContainer`, https://reactnavigation.org/docs/navigation-container/, accessed 2026-04-27.
- React Navigation warns that the navigation state object is internal and subject to change in a minor release; consumers should avoid using properties except `index` and `routes` unless necessary. Agent UI should traverse only `index`, `routes`, nested `state`, route `name`, and route `params`, and keep raw state in diagnostics. Source: React Navigation `NavigationContainer`, https://reactnavigation.org/docs/navigation-container/, accessed 2026-04-27.
- `onStateChange` is a public prop called whenever navigation state changes. It can drive Agent UI navigation event logs for React Navigation apps. Source: React Navigation `NavigationContainer`, https://reactnavigation.org/docs/navigation-container/, accessed 2026-04-27.

### refs
- React Navigation supports navigation refs for imperative navigation outside components, and the docs show `createNavigationContainerRef` plus helper functions that call `navigationRef.navigate` after checking readiness. Source: React Navigation "Navigating without the navigation prop", https://reactnavigation.org/docs/navigating-without-navigation-prop/, accessed 2026-04-27.
- The container/ref API exposes `getRootState`, which returns navigation states for all navigators in the tree, and `getCurrentRoute`, which returns the route object for the currently focused screen. Source: React Navigation `NavigationContainer`, https://reactnavigation.org/docs/navigation-container/, accessed 2026-04-27.
- The same API exposes `getCurrentOptions`, which returns options for the currently focused screen. Use this only as optional title/header metadata, not as the semantic ID source. Source: React Navigation `NavigationContainer`, https://reactnavigation.org/docs/navigation-container/, accessed 2026-04-27.
- `navigationRef.isReady()` must gate agent navigation because refs can be initially null/not ready, especially with linking and async startup. Source: React Navigation "Navigating without the navigation prop", https://reactnavigation.org/docs/navigating-without-navigation-prop/, accessed 2026-04-27.

### route names
- React Navigation screens have explicit route names, and `navigation.navigate(name, params)` targets those names. Source: React Navigation "Moving between screens", https://reactnavigation.org/docs/navigating/, accessed 2026-04-27.
- Route names are developer-defined and may not be stable enough for agent workflows. Agent UI should require explicit mapping from stable `screenId` to route name or nested navigation target.

### params
- React Navigation recommends JSON-serializable params so state persistence and deep linking work correctly. Source: React Navigation "Passing parameters to routes", https://reactnavigation.org/docs/params/, accessed 2026-04-27.
- Params are available as `route.params`, can be passed as the second argument to navigation methods, and can be updated with `setParams` or `replaceParams`. Source: React Navigation "Passing parameters to routes", https://reactnavigation.org/docs/params/, accessed 2026-04-27.
- Reserved param names for nested navigation are `screen`, `params`, `initial`, and `state`; using them as ordinary app params can cause unexpected behavior. Agent UI must reject or namespace these keys unless constructing an explicit nested navigation target. Source: React Navigation "Passing parameters to routes", https://reactnavigation.org/docs/params/, accessed 2026-04-27.

### linking
- The `linking` prop configures deep links, browser URLs, prefixes, and path-to-route mappings. React Navigation can handle incoming links through React Native Linking on iOS/Android and browser history on web. Source: React Navigation "Configuring links", https://reactnavigation.org/docs/configuring-links/, accessed 2026-04-27.
- Linking can auto-generate paths for screens with `enabled: "auto"`, but path generation only handles leaf screens unless paths are specified explicitly. Agent UI should not assume every navigator screen has a usable path. Source: React Navigation "Configuring links", https://reactnavigation.org/docs/configuring-links/, accessed 2026-04-27.
- React Navigation can customize `getPathFromState`, `getStateFromPath`, and `getActionFromState`. These are useful for diagnostics and optional URL support, but v0 should navigate by route mapping rather than inventing URL paths. Source: React Navigation `NavigationContainer`, https://reactnavigation.org/docs/navigation-container/, accessed 2026-04-27.

### nested navigators
- Nested navigators each keep their own navigation history, options, params, and event behavior. Source: React Navigation "Nesting navigators", https://reactnavigation.org/docs/nesting-navigators/, accessed 2026-04-27.
- To navigate into a nested navigator, React Navigation uses nested params such as `{ screen: "Messages", params: { ... } }`. The `screen` and related params are reserved for internal nested navigation behavior and should not be read as ordinary parent-screen params. Source: React Navigation "Nesting navigators", https://reactnavigation.org/docs/nesting-navigators/, accessed 2026-04-27.
- `getCurrentRoute()` can identify the focused route in the whole tree, while `getRootState()` can support broader diagnostics. Agent UI should recursively derive a focused path using only stable state fields.

### limitations
- React Navigation's full state shape is not a stable public contract beyond `index` and `routes`. Deep route-tree diagnostics should be best-effort and version-tolerant. Source: React Navigation `NavigationContainer`, https://reactnavigation.org/docs/navigation-container/, accessed 2026-04-27.
- Independent navigation containers/trees can intentionally isolate state. Agent UI v0 should require a separate adapter/ref per independent tree and report `INDEPENDENT_TREE_UNSUPPORTED` when one global ref cannot observe a screen. Source: React Navigation `NavigationContainer`, https://reactnavigation.org/docs/navigation-container/, accessed 2026-04-27.
- React Navigation route names do not encode paths or files. Apps without linking config need explicit semantic route mapping.

### source URLs
- React Navigation `NavigationContainer`: https://reactnavigation.org/docs/navigation-container/ (accessed 2026-04-27)
- React Navigation "Navigating without the navigation prop": https://reactnavigation.org/docs/navigating-without-navigation-prop/ (accessed 2026-04-27)
- React Navigation "Moving between screens": https://reactnavigation.org/docs/navigating/ (accessed 2026-04-27)
- React Navigation "Passing parameters to routes": https://reactnavigation.org/docs/params/ (accessed 2026-04-27)
- React Navigation "Configuring links": https://reactnavigation.org/docs/configuring-links/ (accessed 2026-04-27)
- React Navigation "Nesting navigators": https://reactnavigation.org/docs/nesting-navigators/ (accessed 2026-04-27)

## Semantic Screen Contract

| Field | Requirement | Type | Meaning |
|---|---|---|---|
| `screenId` | Required | `string` | Stable agent-facing ID, for example `checkout.payment`. Must not be generated from a mutable file path alone. |
| `adapter` | Required | `"expo-router" | "react-navigation"` | Navigation backend that owns this screen. |
| `routeName` | Required for React Navigation; optional for Expo Router | `string` | React Navigation screen name or Expo Router screen/layout name when available. |
| `path` | Required for Expo Router; optional for React Navigation | `string` | Normalized path used for Expo Router navigation, or a linking-derived path in React Navigation. |
| `segments` | Optional | `string[]` | Expo Router file segments from `useSegments`, useful for diagnostics and route group ambiguity. |
| `params` | Optional | `Record<string, JsonPrimitive | JsonPrimitive[]>` | Sanitized route/search params exposed to agents. Sensitive values must be redacted by the semantic runtime privacy policy. |
| `title` | Optional | `string` | Human-readable title from screen options, layout config, or explicit registration. |
| `isFocused` | Required | `boolean` | Whether this screen is the current actionable screen. |
| `parent` | Optional | `string` | Parent screen, layout, navigator, or semantic screen ID. |
| `children` | Optional | `SemanticNode[]` | Semantic UI nodes mounted within this screen boundary. |
| `navigationKey` | Optional | `string` | Backend-specific diagnostic key, such as a React Navigation route key. Do not expose as a stable agent target. |
| `canGoBack` | Optional | `boolean` | Current back capability if the backend exposes it. |
| `source` | Required | `"registered" | "observed" | "diagnostic"` | Whether metadata came from explicit registration, runtime observation, or diagnostics only. |

Decision: `screenId`, `adapter`, `isFocused`, and `source` are mandatory for every screen record. At least one of `path` or `routeName` must be present. For agent commands, only `screenId` is the stable external target.

## Adapter API Recommendation

### registering a screen
- Public concept: `registerScreen(metadata)` on the runtime registry, usually called by an Agent UI `<Screen id>` boundary or an adapter hook inside a route component.
- Expo Router registration should capture `screenId`, `path` from `usePathname`, `segments` from `useSegments`, local params from `useLocalSearchParams`, optional title, and focus state.
- React Navigation registration should capture `screenId`, route name, optional nested target, optional linking path, params, and title/options if available.
- Duplicate `screenId` values should warn in development and return a structured diagnostic in agent tools.

### reading current screen
- Public concept: `getCurrentScreen()` returns the focused `SemanticScreenMetadata`.
- Expo Router implementation: use observed pathname/segments/local params from an adapter component under the Router tree. Do not read private Router internals.
- React Navigation implementation: use `navigationRef.getCurrentRoute()` and optionally `getCurrentOptions()`, plus registry mapping from route names/keys to semantic screen IDs.

### navigating by semantic screen ID
- Public concept: `navigate({ screenId, params, mode })`, where `mode` is `push`, `replace`, `navigate`, or `back` when supported.
- Expo Router implementation: look up the registered absolute `path` or `HrefObject`, sanitize params, then call `router.push`, `router.replace`, or `router.navigate`.
- React Navigation implementation: look up route target metadata, check `navigationRef.isReady()`, then call `navigationRef.navigate` or dispatch a navigation action. Nested targets must use React Navigation's documented nested `screen`/`params` shape.
- Every navigation command should observe the next focused screen and return `ok: true` only if the final observed `screenId` matches the target or an allowed redirect target.

### mapping screen IDs to routes
- Provide explicit mapping APIs because route names and file paths are not stable agent contracts.
- Expo Router mapping target: `{ path, segments?, title?, allowedRedirects? }`.
- React Navigation mapping target: `{ routeName, nestedTarget?, path?, title?, allowedRedirects? }`.
- Automatic mapping from current mounted screens is acceptable for diagnostics, but v0 should require explicit mapping for agent navigation commands.

### handling params
- Accept only JSON-safe primitives, arrays, and shallow records for v0.
- Reject functions, symbols, class instances, React elements, cyclic objects, and reserved React Navigation nested keys unless the caller is explicitly constructing a nested target.
- Redact sensitive params before returning navigation state to MCP tools.
- Preserve a distinction between route params and search/query params in diagnostics.

### collecting navigation diagnostics
- Public concept: `collectNavigationDiagnostics()` returns backend type, readiness, current screen, registered mappings, last navigation event, and sanitized raw backend state.
- Expo Router diagnostics may include pathname, segments, local/global params, root navigation state readiness, and sitemap data only as best-effort/diagnostic.
- React Navigation diagnostics may include `isReady`, `getCurrentRoute`, `getCurrentOptions`, and a sanitized traversal of `getRootState` limited to `index`, `routes`, route names, keys, params, and nested state.

## Edge Cases
- Nested navigators: derive the focused screen recursively; mark background mounted nodes as not actionable unless an adapter confirms they are visible.
- Tabs: switching tabs may preserve each tab's stack. Agent commands should distinguish `currentScreen` from `mountedScreens`.
- Stacks: pushed screens can leave previous screens mounted. Agent actions should default to the top/focused route only.
- Modals: treat modal routes as normal focused screens in v0. Modal presentation detection from options is optional and should not be required for basic tools.
- Dynamic routes: map the semantic ID to a route template or absolute path, then expose concrete param values separately.
- Deep links: do not assume prior flow state. Rebuild current screen metadata after the link resolves.
- Protected routes: navigation can redirect to an anchor or first available route. Return `ROUTE_REDIRECTED` if final observed screen differs from the requested screen and is not listed in `allowedRedirects`.
- Redirects: `<Redirect>` and static redirects may change final route. Always verify after transition.
- Route groups: ignore group names as stable agent targets; keep segments only for diagnostics.
- Shared routes: same path can exist under multiple layouts/groups. Require explicit `screenId` mapping when path alone is ambiguous.
- Initial routes: deep-linked routes may add initial back-stack behavior through `initialRouteName`. `canGoBack` may not mean the agent visited the previous screen in the current flow.
- Stale params: prefer Expo Router local params for screen metadata; for React Navigation, read params from the focused route and sanitize before returning.
- Linking config gaps: React Navigation apps without complete linking config may have no path for a route. Use route-name mapping instead.
- Reserved param names: React Navigation reserves `screen`, `params`, `initial`, and `state` for nested navigation. Avoid exposing them as ordinary app params.
- Independent navigation trees: v0 should report unsupported unless a separate adapter/ref is registered for that tree.
- Unmounted target screens: navigation by semantic ID requires an explicit static mapping. Runtime-only registration cannot navigate to a screen that has never mounted.
- Web/browser history: Expo Router and React Navigation web behavior can differ. V0 should verify current screen through the same adapter observation path after navigation.

## V0 Scope

| Feature | Classification | Decision |
|---|---|---|
| Expo Router current screen inspection | v0 required | Needed for Expo-first apps. |
| Expo Router navigate by registered `screenId` | v0 required | Delegate to public router APIs. |
| React Navigation current screen inspection | v0 required | Needed for non-Router apps. |
| React Navigation navigate by registered `screenId` | v0 required | Requires app-provided navigation ref. |
| Explicit screen registration | v0 required | Stable semantic IDs cannot be inferred safely. |
| Param sanitization | v0 required | Prevents MCP/flow serialization failures. |
| Post-navigation verification | v0 required | Required for redirects, protected routes, and failed actions. |
| Diagnostics snapshot | v0 required | Needed for agent self-correction. |
| Nested navigator target mapping | v0 optional | Support documented mappings, but keep UX explicit. |
| Modal presentation metadata | v0 optional | Treat as focused screens first. |
| Sitemap/route-tree auto-discovery | post-v0 | NEEDS_VERIFICATION against public stability and types. |
| Independent navigation trees | post-v0 | Needs multiple adapters/refs. |
| Automatic path generation for every React Navigation route | post-v0 | Linking config is not guaranteed. |
| Private Expo Router internals | avoid | Too brittle. |
| Coordinate/screenshot navigation | avoid | Violates semantic control goal. |
| New navigation framework | avoid | Explicit non-goal. |

## Source Index

| Source | URL | Access Date | Supported claim |
|---|---|---|---|
| Expo Router SDK reference | https://docs.expo.dev/versions/latest/sdk/router/ | 2026-04-27 | Expo Router is built on React Navigation; documents `useRootNavigationState`, `useRouter`, `usePathname`, `useSegments`, Router methods, `HrefObject`, and `SitemapType`. |
| Expo Router Link reference | https://docs.expo.dev/versions/latest/sdk/router/link/ | 2026-04-27 | Documents `Link` `href` as string or object with `pathname` and optional `params`. |
| Expo navigation basics | https://docs.expo.dev/router/basics/navigation/ | 2026-04-27 | Documents relative routes, dynamic routes, router navigation, and initial-route behavior for deep links. |
| Expo Router notation | https://docs.expo.dev/router/basics/notation/ | 2026-04-27 | Documents static routes, dynamic routes, route groups, `_layout.tsx`, plus routes, and URL effects. |
| Expo URL parameters | https://docs.expo.dev/router/reference/url-parameters/ | 2026-04-27 | Documents route/search params and local versus global URL parameter hooks. |
| Expo navigation layouts | https://docs.expo.dev/router/basics/navigation-layouts/ | 2026-04-27 | Documents layouts, Stack/Tabs relationships to React Navigation, and mounted stack pages. |
| Expo router settings | https://docs.expo.dev/router/advanced/router-settings/ | 2026-04-27 | Documents `unstable_settings.initialRouteName` and initial route behavior during deep links/navigation. |
| Expo shared routes | https://docs.expo.dev/router/advanced/shared-routes/ | 2026-04-27 | Documents shared route patterns, group navigation, and array group rules. |
| Expo protected routes | https://docs.expo.dev/router/advanced/protected/ | 2026-04-27 | Documents protected screen redirects, history removal, nesting, and tabs/drawer support. |
| Expo redirects and rewrites | https://docs.expo.dev/router/advanced/redirects/ | 2026-04-27 | Documents `<Redirect>` and static redirect behavior. |
| React Navigation `NavigationContainer` | https://reactnavigation.org/docs/navigation-container/ | 2026-04-27 | Documents state warning, `onStateChange`, linking, `getRootState`, `getCurrentRoute`, and `getCurrentOptions`. |
| React Navigation navigating without prop | https://reactnavigation.org/docs/navigating-without-navigation-prop/ | 2026-04-27 | Documents navigation refs, `createNavigationContainerRef`, `isReady`, and imperative navigation outside components. |
| React Navigation moving between screens | https://reactnavigation.org/docs/navigating/ | 2026-04-27 | Documents navigation by route name. |
| React Navigation params | https://reactnavigation.org/docs/params/ | 2026-04-27 | Documents JSON-serializable params recommendation, route params, updates, nested params, and reserved names. |
| React Navigation linking | https://reactnavigation.org/docs/configuring-links/ | 2026-04-27 | Documents linking config, path mappings, auto path generation limits, and URL/state conversion hooks. |
| React Navigation nesting navigators | https://reactnavigation.org/docs/nesting-navigators/ | 2026-04-27 | Documents nested navigator history, params, options, event behavior, and nested navigation params. |

## Final Recommendation
Implement a polymorphic `AgentNavigationAdapter` in Stage 4 with explicit Expo Router and React Navigation adapters selected by provider configuration. For Expo Router, mount an adapter observer under the Router tree and delegate actions to public Router APIs using registered absolute paths. For React Navigation, require the app to pass a navigation ref created by `createNavigationContainerRef`, then read state and execute commands only after `isReady()`.

The agent-facing API should never expose route names or file paths as the primary target. It should expose stable `screenId` values, explicit mappings, sanitized params, and post-navigation verification. Automatic route-tree discovery, sitemap interpretation, independent navigation trees, and modal-specific semantics can wait until after v0.

DONE
