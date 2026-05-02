# Expo Modules API & Config Plugins

_Read-only reference · Distilled from `expo-skill/references/expo-module.md`_

## When to Load

| Task | Load? |
|---|---|
| Creating a new Expo native module | **Yes** |
| Adding native views to an Expo app | **Yes** |
| Writing config plugins for native configuration | **Yes** |
| Building Stage 7 native adapters | **Yes** |
| Working with JS-only Expo code | No |
| EAS builds and deployment | No — use `expo/expo-deployment-and-updates.md` |

---

## 1. Quick Start — Local Module

```bash
CI=1 npx create-expo-module@latest --local \
  --name MyModule \
  --description "My Expo module" \
  --package expo.modules.mymodule
```

After scaffolding:
1. Rename `modules/my-module/` to kebab-case matching your module.
2. Remove unnecessary boilerplate (hello(), PI constant, WebView example).
3. Remove web files if native-only. Remove `"web"` from `expo-module.config.json` platforms.
4. Run `cd ios && pod install` after any rename.

---

## 2. Module Definition DSL

### Swift (iOS)

```swift
import ExpoModulesCore

public class MyModule: Module {
    public func definition() -> ModuleDefinition {
        Name("MyModule")

        // Synchronous — blocks JS thread. Keep fast (<1ms).
        Function("add") { (a: Int, b: Int) -> Int in
            return a + b
        }

        // Async — returns Promise. Background thread by default.
        AsyncFunction("fetchData") { (url: URL) -> String in
            let data = try Data(contentsOf: url)
            return String(data: data, encoding: .utf8) ?? ""
        }

        // Force main thread
        AsyncFunction("updateUI") { () -> Void in
            // UI work
        }.runOnQueue(.main)

        // Events
        Events("onChange", "onError")

        // Constant (computed once, cached)
        Constant("version") { "1.0.0" }
    }
}
```

### Kotlin (Android)

```kotlin
class MyModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("MyModule")

        Function("add") { a: Int, b: Int -> a + b }

        // Coroutine support
        AsyncFunction("fetchData") Coroutine { url: java.net.URL ->
            withContext(Dispatchers.IO) { url.readText() }
        }

        Events("onChange", "onError")
        Constant("version") { "1.0.0" }
    }
}
```

### TypeScript Binding

```typescript
import { requireNativeModule } from "expo";
const MyModule = requireNativeModule("MyModule");
export function add(a: number, b: number): number {
    return MyModule.add(a, b);
}
```

---

## 3. Native Views

### Swift

```swift
View(MyNativeView.self) {
    Prop("title") { (view: MyNativeView, title: String) in
        view.titleLabel.text = title
    }
    Events("onPress", "onLoad")
    AsyncFunction("reset") { (view: MyNativeView) in view.reset() }
}

class MyNativeView: ExpoView {
    let titleLabel = UILabel()
    required init(appContext: AppContext) {
        super.init(appContext: appContext)
        clipsToBounds = true
        addSubview(titleLabel)
    }
}
```

### Kotlin

```kotlin
View(MyNativeView::class) {
    Prop("title") { view: MyNativeView, title: String ->
        view.titleView.text = title
    }
    Events("onPress", "onLoad")
}

class MyNativeView(context: Context, appContext: AppContext)
    : ExpoView(context, appContext) {
    val titleView = TextView(context).also { addView(it) }
}
```

---

## 4. Type System

| Swift | Kotlin | JS |
|---|---|---|
| `Bool` | `Boolean` | `boolean` |
| `Int` | `Int` | `number` |
| `String` | `String` | `string` |
| `URL` | `java.net.URL` | `string` |
| `UIColor` | `android.graphics.Color` | `string` |
| `Data` | `ByteArray` | `Uint8Array` |

### Records

```swift
struct UserRecord: Record {
    @Field var name: String = ""
    @Field var age: Int = 0
}
```

### Enums

```swift
enum Theme: String, Enumerable {
    case light, dark, system
}
```

---

## 5. Shared Objects

Bridge native class instances to JS with automatic lifecycle:

```swift
class ImageContext: SharedObject {
    private var image: UIImage
    init(image: UIImage) { self.image = image; super.init() }
}

// Expose via Class DSL
Class("Context", ImageContext.self) {
    Constructor { (path: String) -> ImageContext in
        return ImageContext(image: UIImage(contentsOfFile: path)!)
    }
    Function("rotate") { (ctx: ImageContext, degrees: Double) -> ImageContext in
        ctx.rotate(degrees: degrees); return ctx
    }
}
```

---

## 6. Lifecycle Hooks

### Module Lifecycle
- `OnCreate { }` — Module initialized.
- `OnDestroy { }` — Module deallocated.

### iOS App Lifecycle
- `OnAppEntersForeground { }`, `OnAppEntersBackground { }`, `OnAppBecomesActive { }`

### Android Activity Lifecycle
- `OnActivityEntersForeground { }`, `OnActivityEntersBackground { }`, `OnActivityDestroys { }`
- `OnNewIntent { intent -> }` — Deep link received.

---

## 7. Config Plugins

```typescript
import { ConfigPlugin, withInfoPlist, withAndroidManifest } from "expo/config-plugins";

const withMyConfig: ConfigPlugin<{ apiKey: string }> = (config, { apiKey }) => {
    config = withInfoPlist(config, (c) => {
        c.modResults["MY_API_KEY"] = apiKey;
        return c;
    });
    config = withAndroidManifest(config, (c) => {
        // Add meta-data to AndroidManifest.xml
        return c;
    });
    return config;
};
```

Usage in `app.json`:
```json
{ "plugins": [["my-module", { "apiKey": "secret_key" }]] }
```

---

## 8. expo-module.config.json

```json
{
    "platforms": ["android", "apple"],
    "apple": { "modules": ["MyModule"] },
    "android": { "modules": ["expo.modules.mymodule.MyModule"] }
}
```

- iOS: class name only. Android: fully-qualified name.
- Autolinking resolves modules from `node_modules` and local `modules/` directory.
- No manual native project configuration needed after `pod install`.

---

## 9. Events from JS

```typescript
import { useEvent } from "expo";
import MyModule from "./MyModule";

// Hook-based (recommended)
const event = useEvent(MyModule, "onChange");

// Manual subscription
const sub = MyModule.addListener("onChange", (e) => console.log(e.value));
// Cleanup: sub.remove()
```

---

## Skill Sources

- `expo-skill/references/expo-module.md` (module DSL, views, shared objects, lifecycle, type system)
- `expo-skill/SKILL.md` (workflow, guardrails)
