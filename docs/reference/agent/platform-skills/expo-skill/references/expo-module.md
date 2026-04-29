# expo-module

Source: https://github.com/expo/skills/tree/main/plugins/expo/skills/expo-module

## Source SKILL.md

---
name: expo-module
description: Guide for writing Expo native modules and views using the Expo Modules API (Swift, Kotlin, TypeScript). Covers module definition DSL, native views, shared objects, config plugins, lifecycle hooks, autolinking, and type system. Use when building or modifying native modules for Expo.
version: 1.0.0
license: MIT
---

# Writing Expo Modules

Complete reference for building native modules and views using the Expo Modules API. Covers Swift (iOS), Kotlin (Android), and TypeScript.

## When to Use

- Creating a new Expo native module or native view
- Adding native functionality (camera, sensors, system APIs) to an Expo app
- Wrapping platform SDKs for React Native consumption
- Building config plugins that modify native project files

## References

Consult these resources as needed:

```
references/
  native-module.md           Module definition DSL: Name, Function, AsyncFunction, Property, Constant, Events, type system, shared objects
  native-view.md             Native view components: View, Prop, EventDispatcher, view lifecycle, ref-based functions
  lifecycle.md               Lifecycle hooks: module, iOS app/AppDelegate, Android activity/application listeners
  config-plugin.md           Config plugins: modifying Info.plist, AndroidManifest.xml, reading values in native code
  module-config.md           expo-module.config.json fields and autolinking configuration
```

## Quick Start

### Create a Local Module (in existing app)

**Always scaffold with `create-expo-module` first**, then modify the generated code. This ensures correct podspec, build.gradle, and module config — avoiding common build errors.

```bash
CI=1 npx create-expo-module@latest --local \
  --name MyModule \
  --description "My Expo module" \
  --package expo.modules.mymodule
```

`CI=1` skips interactive prompts and uses the provided flags.

> **Important:** In `CI=1` (non-interactive) mode, the scaffold always creates the directory as `modules/my-module/` because the slug is derived from `customTargetPath` which is `undefined` for `--local` modules — the `--name` flag only sets the native class name, not the directory. After scaffolding, rename it to a kebab-case name matching your module (e.g., `KeyValueStore` → `modules/key-value-store/`), then run `cd ios && pod install` so CocoaPods picks up the correct path. Skipping the rename is fine functionally, but skipping `pod install` after any rename causes iOS build failures ("Build input file cannot be found").

Available flags:

| Flag | Description | Example |
|------|-------------|---------|
| `--name` | Native module name (PascalCase) | `--name KeyValueStore` |
| `--description` | Module description | `--description "Native key-value storage"` |
| `--package` | Android package name | `--package expo.modules.keyvaluestore` |
| `--author-name` | Author name | `--author-name "dev"` |
| `--author-email` | Author email | `--author-email "dev@example.com"` |
| `--author-url` | Author profile URL | `--author-url "https://github.com/dev"` |
| `--repo` | Repository URL | `--repo "https://github.com/dev/repo"` |

The scaffold generates both a **native module** (functions, events, constants) and a **native view component** (WebView example with props and events). After scaffolding:

1. **Decide what you need**: If you only need a native module (no UI), remove the view files. If you only need a native view, remove the module function boilerplate. If you need both, keep both and replace the implementations.
2. **Remove unnecessary boilerplate**: The scaffold includes example code (`hello()` function, `PI` constant, `onChange` event, WebView-based view with `url` prop). Strip all of this and replace with your actual implementation.
3. **Remove web files if not needed**: The scaffold generates `*.web.ts`/`*.web.tsx` files for web platform support. Remove these if the module is native-only. Also remove `"web"` from the `platforms` array in `expo-module.config.json`.

#### What to remove for a module-only (no native view):

- Delete `ios/MyModuleView.swift`, `android/.../MyModuleView.kt`
- Delete `src/MyModuleView.tsx`, `src/MyModuleView.web.tsx`
- Remove the `View(...)` block from the module definition in both Swift and Kotlin
- Remove view-related types from `MyModule.types.ts` and view export from `index.ts`

#### What to remove for a view-only (no module functions):

- Remove `Function`, `AsyncFunction`, `Constant`, `Events` blocks from the module definition (keep `Name` and `View`)
- Simplify the TypeScript module file to only export the view

Generated structure (after renaming from `my-module` to your module's kebab-case name):

```
modules/
  my-module/                     # Rename to kebab-case, e.g. key-value-store/
    android/
      build.gradle
      src/main/java/expo/modules/mymodule/
        MyModule.kt              # Module definition (functions, events, view registration)
        MyModuleView.kt          # Native view (ExpoView subclass)
    ios/
      MyModule.podspec
      MyModule.swift             # Module definition
      MyModuleView.swift         # Native view (ExpoView subclass)
    src/
      MyModule.ts                # Native module binding
      MyModule.web.ts            # Web implementation
      MyModule.types.ts          # Shared types
      MyModuleView.tsx           # Native view component
      MyModuleView.web.tsx       # Web view component
    expo-module.config.json
    index.ts                     # Re-exports module + view
```

### Create a Standalone Module (for publishing)

```bash
npx create-expo-module@latest my-module
```

---

## Module Structure Reference

The Swift and Kotlin DSL share the same structure. Both platforms are shown here for reference — in other reference files, Swift is shown as the primary language unless the Kotlin pattern meaningfully differs.

**Swift (iOS):**

```swift
import ExpoModulesCore

public class MyModule: Module {
  public func definition() -> ModuleDefinition {
    Name("MyModule")

    Function("hello") { (name: String) -> String in
      return "Hello \(name)!"
    }
  }
}
```

**Kotlin (Android):**

```kotlin
package expo.modules.mymodule

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class MyModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("MyModule")

    Function("hello") { name: String ->
      "Hello $name!"
    }
  }
}
```

**TypeScript:**

```typescript
import { requireNativeModule } from "expo";

const MyModule = requireNativeModule("MyModule");

export function hello(name: string): string {
  return MyModule.hello(name);
}
```

### expo-module.config.json

```json
{
  "platforms": ["android", "apple"],
  "apple": {
    "modules": ["MyModule"]
  },
  "android": {
    "modules": ["expo.modules.mymodule.MyModule"]
  }
}
```

Note: iOS uses just the class name; Android uses the fully-qualified class name (package + class). See `references/module-config.md` for all fields.

## Source Reference: references / config-plugin.md

# Config Plugins Reference

Config plugins customize native Android and iOS projects generated with `npx expo prebuild`. They are synchronous functions that accept an `ExpoConfig` and return a modified version.

## Plugin Structure

```
my-module/
  plugin/
    tsconfig.json
    src/
      index.ts
  app.plugin.js         # Entry: module.exports = require('./plugin/build');
```

## Writing a Plugin

Plugin functions follow the `with` prefix naming convention.

```typescript
import {
  ConfigPlugin,
  withInfoPlist,
  withAndroidManifest,
  AndroidConfig,
} from "expo/config-plugins";

const withMyConfig: ConfigPlugin<{ apiKey: string }> = (config, { apiKey }) => {
  // iOS: modify Info.plist
  config = withInfoPlist(config, (config) => {
    config.modResults["MY_API_KEY"] = apiKey;
    return config;
  });

  // Android: modify AndroidManifest.xml
  config = withAndroidManifest(config, (config) => {
    const mainApp =
      AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);
    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApp,
      "MY_API_KEY",
      apiKey
    );
    return config;
  });

  return config;
};

export default withMyConfig;
```

## Using in app.json

```json
{
  "expo": {
    "plugins": [["my-module", { "apiKey": "secret_key" }]]
  }
}
```

## Reading Config Values in Native Code

**Swift:**

```swift
Function("getApiKey") {
  return Bundle.main.object(forInfoDictionaryKey: "MY_API_KEY") as? String
}
```

**Kotlin:**

```kotlin
Function("getApiKey") {
  val appInfo = appContext?.reactContext?.packageManager?.getApplicationInfo(
    appContext?.reactContext?.packageName.toString(),
    PackageManager.GET_META_DATA
  )
  return@Function appInfo?.metaData?.getString("MY_API_KEY")
}
```

## Key Rules

- Plugins must be synchronous; return values must be serializable (except `mods`)
- `Mods` are async functions invoked during the prebuild "syncing" phase
- Use `npm run build plugin` to compile TypeScript plugins
- Test with `npx expo prebuild --clean`

## Source Reference: references / lifecycle.md

# Lifecycle Hooks Reference

## Module Lifecycle (in module definition)

```swift
OnCreate {
  // Module initialized - preferred over class initializers
}

OnDestroy {
  // Module deallocated - clean up resources
}

OnAppContextDestroys {
  // App context is being deallocated
}
```

## iOS App Lifecycle (in module definition)

```swift
OnAppEntersForeground { /* UIApplication.willEnterForegroundNotification */ }
OnAppEntersBackground { /* UIApplication.didEnterBackgroundNotification */ }
OnAppBecomesActive { /* UIApplication.didBecomeActiveNotification */ }
```

## Android Activity Lifecycle (in module definition)

```kotlin
OnActivityEntersForeground { /* Activity resumed */ }
OnActivityEntersBackground { /* Activity paused */ }
OnActivityDestroys { /* Activity destroyed */ }
OnNewIntent { intent -> /* Deep link received */ }
OnActivityResult { activity, result -> /* startActivityForResult callback */ }
OnUserLeavesActivity { /* User-initiated background transition */ }
RegisterActivityContracts { /* Modern activity result contracts */ }
```

---

## iOS AppDelegate Subscribers

For hooking into AppDelegate events without editing AppDelegate directly. Requires app's AppDelegate to extend `ExpoAppDelegate`.

```swift
import ExpoModulesCore

public class MyAppDelegateSubscriber: ExpoAppDelegateSubscriber {
  public func applicationDidBecomeActive(_ application: UIApplication) {}
  public func applicationWillResignActive(_ application: UIApplication) {}
  public func applicationDidEnterBackground(_ application: UIApplication) {}
  public func applicationWillEnterForeground(_ application: UIApplication) {}
  public func applicationWillTerminate(_ application: UIApplication) {}

  public func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    return false  // Return true if handled
  }
}
```

Register in `expo-module.config.json`:

```json
{
  "apple": {
    "appDelegateSubscribers": ["MyAppDelegateSubscriber"]
  }
}
```

Result aggregation:
- `didFinishLaunchingWithOptions`: Returns `true` if **any** subscriber returns `true`
- `didReceiveRemoteNotification`: Priority: `failed` > `newData` > `noData`

---

## Android Lifecycle Listeners

For hooking into Activity/Application lifecycle outside module definitions. Useful for handling deep links, intents, and app-level initialization.

### ReactActivityLifecycleListener

Supported callbacks: `onCreate`, `onResume`, `onPause`, `onDestroy`, `onNewIntent`, `onBackPressed`.

> Note: `onStart` and `onStop` are **not supported** — the implementation hooks into `ReactActivityDelegate` which lacks these methods.

```kotlin
class MyPackage : Package {
  override fun createReactActivityLifecycleListeners(
    activityContext: Context
  ): List<ReactActivityLifecycleListener> {
    return listOf(MyActivityListener())
  }
}

class MyActivityListener : ReactActivityLifecycleListener {
  override fun onCreate(activity: Activity, savedInstanceState: Bundle?) { }
  override fun onResume(activity: Activity) { }
  override fun onPause(activity: Activity) { }
  override fun onDestroy(activity: Activity) { }
  override fun onNewIntent(intent: Intent?): Boolean { return false }
  override fun onBackPressed(): Boolean { return false }
}
```

### ApplicationLifecycleListener

Supported callbacks: `onCreate`, `onConfigurationChanged`.

```kotlin
class MyPackage : Package {
  override fun createApplicationLifecycleListeners(
    context: Context
  ): List<ApplicationLifecycleListener> {
    return listOf(MyAppListener())
  }
}

class MyAppListener : ApplicationLifecycleListener {
  override fun onCreate(application: Application) {
    // App-level initialization
  }
}
```

## Source Reference: references / module-config.md

# Module Configuration Reference

## expo-module.config.json

Required for autolinking. Must be adjacent to `package.json`.

```json
{
  "platforms": ["android", "apple", "web"],
  "apple": {
    "modules": ["MyModule"],
    "appDelegateSubscribers": ["MyAppDelegateSubscriber"]
  },
  "android": {
    "modules": ["expo.modules.mymodule.MyModule"]
  }
}
```

### Fields

| Field | Description |
|-------|-------------|
| `platforms` | Array: `"android"`, `"apple"` (or `"ios"`, `"macos"`, `"tvos"`), `"web"`, `"devtools"` |
| `apple.modules` | Swift module class names |
| `apple.appDelegateSubscribers` | Swift AppDelegate subscriber class names |
| `android.modules` | Fully-qualified Kotlin module class names (package + class) |

## Autolinking

Expo autolinking automatically discovers and links modules that have `expo-module.config.json`. No manual native project configuration needed — install via npm, run `pod install`.

### Resolution Order

1. Explicit dependencies in `react-native.config.js`
2. Custom `searchPaths` directories
3. Local `nativeModulesDir` (defaults to `./modules/`)
4. Recursive npm dependency resolution

## Source Reference: references / native-module.md

# Native Module DSL Reference

Swift is shown as the primary language. Kotlin follows the same DSL structure (see SKILL.md for both). Kotlin-specific syntax is noted where it meaningfully differs.

## Name

Sets the module identifier used in JavaScript.

```swift
Name("MyModule")
```

## Constant

Computed once on first access, then cached.

```swift
Constant("PI") { 3.14159 }
```

## Function (Synchronous)

Blocks the JS thread until completion. Supports up to 8 arguments.

```swift
Function("add") { (a: Int, b: Int) -> Int in
  return a + b
}
```

## AsyncFunction

Returns a Promise. Runs on a background thread by default.

```swift
AsyncFunction("fetchData") { (url: URL) -> String in
  let data = try Data(contentsOf: url)
  return String(data: data, encoding: .utf8) ?? ""
}

// Force main queue execution
AsyncFunction("updateUI") { () -> Void in
  // UI work
}.runOnQueue(.main)
```

**Kotlin differences:**

```kotlin
// Supports Kotlin coroutines
AsyncFunction("fetchData") Coroutine { url: java.net.URL ->
  withContext(Dispatchers.IO) {
    url.readText()
  }
}
```

## Property

Getter/setter for JS object properties.

```swift
// Read-only
Property("version") { "1.0.0" }

// Read-write
Property("volume")
  .get { () -> Float in self.volume }
  .set { (newValue: Float) in self.volume = newValue }
```

## Events

Declares events the module can send to JS. Must be declared before using `sendEvent`.

```swift
// Declaration
Events("onChange", "onError")

// Sending from native (Swift)
sendEvent("onChange", ["value": newValue])
```

**Kotlin difference** — uses `bundleOf`:

```kotlin
sendEvent("onChange", bundleOf("value" to newValue))
```

**JS subscription:**

```typescript
import { useEvent } from "expo";
import MyModule from "./MyModule";

// Hook-based (recommended)
const event = useEvent(MyModule, "onChange");

// Manual subscription
const subscription = MyModule.addListener("onChange", (event) => {
  console.log(event.value);
});
// Clean up: subscription.remove()
```

### OnStartObserving / OnStopObserving

Called when the first listener attaches / last listener detaches. Can be scoped to specific events.

```swift
OnStartObserving("onChange") {
  // Start producing events
}

OnStopObserving("onChange") {
  // Stop producing events
}
```

---

## Type System

### Primitives

| Swift | Kotlin | JS |
|-------|--------|----|
| `Bool` | `Boolean` | `boolean` |
| `Int`, `Int32` | `Int` | `number` |
| `Int64` | `Long` | `number` |
| `Float`, `Float32` | `Float` | `number` |
| `Double` | `Double` | `number` |
| `String` | `String` | `string` |
| `URL` | `java.net.URL` / `android.net.Uri` | `string` |
| `CGPoint` | - | `{ x, y }` |
| `CGSize` | - | `{ width, height }` |
| `CGRect` | - | `{ x, y, width, height }` |
| `UIColor` / `CGColor` | `android.graphics.Color` | `string` (ProcessedColorValue) |
| `Data` | `kotlin.ByteArray` | `Uint8Array` |

### Records (Struct-like types)

```swift
struct UserRecord: Record {
  @Field var name: String = ""
  @Field var age: Int = 0
  @Field var email: String?
}

Function("createUser") { (user: UserRecord) -> Bool in
  return true
}
```

**Kotlin difference** — uses `class` instead of `struct`, optional fields need explicit `= null`:

```kotlin
class UserRecord : Record {
  @Field var name: String = ""
  @Field var age: Int = 0
  @Field var email: String? = null
}
```

### Enums (Enumerable)

```swift
enum Theme: String, Enumerable {
  case light
  case dark
  case system
}

Function("setTheme") { (theme: Theme) in
  // type-safe enum value
}
```

**Kotlin difference** — uses `enum class` with explicit `value` property:

```kotlin
enum class Theme(val value: String) : Enumerable {
  LIGHT("light"),
  DARK("dark"),
  SYSTEM("system")
}
```

### Either Types (Union types)

```swift
Function("process") { (input: Either<String, Int>) in
  if let str = input.get(String.self) {
    // handle string
  } else if let num = input.get(Int.self) {
    // handle number
  }
}
```

Also available: `EitherOfThree<A, B, C>`, `EitherOfFour<A, B, C, D>`.

### JavaScript Values (Direct JS manipulation)

For advanced use in synchronous functions running on JS thread:

```swift
Function("callback") { (fn: JavaScriptFunction<String>) in
  let result = fn("arg1", "arg2")
}
```

---

## Shared Objects

Bridge native class instances to JS with automatic lifecycle management. Instances are deallocated when neither JS nor native code holds a reference.

### Defining a Shared Object

```swift
class ImageContext: SharedObject {
  private var image: UIImage

  init(image: UIImage) {
    self.image = image
    super.init()
  }

  func rotate(degrees: Double) {
    image = image.rotated(degrees: degrees)
  }
}
```

**Kotlin difference** — takes `RuntimeContext` in constructor, override `sharedObjectDidRelease()` for cleanup:

```kotlin
class ImageContext(
  runtimeContext: RuntimeContext,
  private var bitmap: Bitmap
) : SharedObject(runtimeContext) {

  fun rotate(degrees: Float) { /* ... */ }

  override fun sharedObjectDidRelease() {
    if (!bitmap.isRecycled) bitmap.recycle()
  }
}
```

### Exposing via Class DSL

```swift
Class("Context", ImageContext.self) {
  Constructor { (path: String) -> ImageContext in
    return ImageContext(image: UIImage(contentsOfFile: path)!)
  }

  Function("rotate") { (ctx: ImageContext, degrees: Double) -> ImageContext in
    ctx.rotate(degrees: degrees)
    return ctx
  }

  Property("width")
    .get { (ctx: ImageContext) -> Int in ctx.width }
}
```

Other Class DSL components: `StaticFunction`, `StaticAsyncFunction`, `AsyncFunction`.

### SharedRef

Specialized shared reference for passing typed objects between modules:

```swift
final class ImageRef: SharedRef<UIImage> {}
```

### JS Usage

```typescript
const ctx = await ImageModule.create("/path/to/image.png");
ctx.rotate(90);
console.log(ctx.width);
```

## Source Reference: references / native-view.md

# Native View Reference

Native views let you render platform UI components (UIView on iOS, Android View on Android) as React components.

## Defining a View

**Swift:**

```swift
public class MyViewModule: Module {
  public func definition() -> ModuleDefinition {
    Name("MyView")

    View(MyNativeView.self) {
      Prop("title") { (view: MyNativeView, title: String) in
        view.titleLabel.text = title
      }

      Events("onPress", "onLoad")

      AsyncFunction("reset") { (view: MyNativeView) in
        view.reset()
      }
    }
  }
}

class MyNativeView: ExpoView {
  let titleLabel = UILabel()

  required init(appContext: AppContext) {
    super.init(appContext: appContext)
    clipsToBounds = true
    addSubview(titleLabel)
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    titleLabel.frame = bounds
  }
}
```

**Kotlin:**

```kotlin
class MyViewModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("MyView")

    View(MyNativeView::class) {
      Prop("title") { view: MyNativeView, title: String ->
        view.titleView.text = title
      }

      Events("onPress", "onLoad")

      AsyncFunction("reset") { view: MyNativeView ->
        view.reset()
      }
    }
  }
}

class MyNativeView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  val titleView = TextView(context).also {
    addView(it, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
  }
}
```

**TypeScript:**

```typescript
import { requireNativeView } from "expo";

export type MyViewProps = {
  title?: string;
  onPress?: (event: { nativeEvent: { x: number; y: number } }) => void;
  onLoad?: () => void;
} & ViewProps;

const NativeView = requireNativeView<MyViewProps>("MyView");

export function MyView(props: MyViewProps) {
  return <NativeView {...props} />;
}
```

## View Event Dispatching

**Swift:**

```swift
class MyNativeView: ExpoView {
  let onPress = EventDispatcher()

  func handleTap(at point: CGPoint) {
    onPress(["x": point.x, "y": point.y])
  }
}
```

**Kotlin:**

```kotlin
class MyNativeView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  private val onPress by EventDispatcher()

  fun handleTap(x: Float, y: Float) {
    onPress(mapOf("x" to x, "y" to y))
  }
}
```

## View Lifecycle

```swift
// Called after all props have been set
OnViewDidUpdateProps { (view: MyNativeView) in
  view.applyChanges()
}
```

```kotlin
// Android only - called when view is no longer used
OnViewDestroys { view: MyNativeView ->
  view.cleanup()
}
```

## AsyncFunction on Views

Functions defined inside `View` are accessible via React ref:

```typescript
const ref = useRef<MyView>(null);
// Call native function
await ref.current?.reset();
```

## PropGroup (Android)

Batch-register multiple props with shared setter logic:

```kotlin
View(MyNativeView::class) {
  PropGroup("border", "width" to Float::class, "color" to Int::class) { view, index, value ->
    when (index) {
      0 -> view.borderWidth = value as Float
      1 -> view.borderColor = value as Int
    }
  }
}
```

## GroupView (Android)

Enable view group functionality for managing child views:

```kotlin
View(MyContainerView::class) {
  GroupView {
    AddChildView { parent, child, index -> parent.addView(child, index) }
    GetChildCount { parent -> parent.childCount }
    GetChildViewAt { parent, index -> parent.getChildAt(index) }
    RemoveChildView { parent, child -> parent.removeView(child) }
    RemoveChildViewAt { parent, index -> parent.removeViewAt(index) }
  }
}
```

