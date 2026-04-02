# SwiftUI preview stub contracts for data-flow property wrappers

A Stage 3 Resolver for static SwiftUI previews needs deterministic, read-only stubs for the four primary data-flow property wrappers. **The core insight: in a static preview, no mutation ever propagates**, so every wrapper can be reduced to a constant value or a default-initialized object. Below are the verified semantic contracts derived from Apple's official SwiftUI documentation, WWDC session guidance, and the Combine framework's `ObservableObject` protocol specification.

Each wrapper falls into one of two categories: **value wrappers** (`@State`, `@Binding`) that carry a generic `Value` with no protocol constraints, and **object wrappers** (`@ObservedObject`, `@EnvironmentObject`) that require `ObjectType: ObservableObject` (class-only, Combine-based). The stub injector must handle these categories differently — value wrappers get type-zero constants, while object wrappers need a default-constructed class instance or a sentinel `EmptyNode`.

---

## The two value-type wrappers: @State and @Binding

`@State` is the view-owned source of truth. SwiftUI stores its value in hidden external storage (accessed via an internal `_location` reference), which is why mutation works through a `nonmutating set` even though view structs are immutable. The critical property for stubbing: **@State self-initializes from its declaration**, so the resolver simply reads the declared initializer or falls back to the type zero.

`@Binding` never owns data — it is a reference-like conduit to an existing source of truth. Its `projectedValue` returns itself (the same `Binding<Value>`), enabling pass-through down the view hierarchy. For static previews, **`Binding.constant(_:)` is the canonical stub mechanism**: it creates a binding whose getter returns the provided value and whose setter is a no-op.

```
WRAPPER STUB CONTRACT: @State
  Source: developer.apple.com/documentation/swiftui/state [SPEC]

  Declaration:    @propertyWrapper struct State<Value> : DynamicProperty
  Constraints:    Value is unconstrained (no protocol conformance required)

  wrappedValue type:   Value  (get, nonmutating set)
  projectedValue type: Binding<Value>  (get)

  Initial value:
    - If explicit initializer present → uses init(wrappedValue:) with that value
    - If no initializer → no compiler-synthesized default; declaration must
      eventually be initialized (via memberwise init or _property = State(...))
    - SwiftUI persists the initial value in external storage; it is set once and
      reused across view struct re-creations

  Ownership: View-owned. The declaring view is the single source of truth.
             Apple recommends marking @State properties `private`.

  Mutation in preview:
    Static preview never triggers the SwiftUI render loop. The nonmutating set
    writes to external storage managed by the framework, but in a static preview
    context no re-render occurs — the stub is effectively read-only.

  Stub rule:
    If declaration has explicit initializer (e.g., @State var count: Int = 0):
      → use declared initial value (0)
    If no initializer (e.g., @State var name: String):
      → use type default: "" for String, 0 for Int, false for Bool, nil for Optional<T>
    For collection types (Array, Set, Dictionary):
      → use empty collection ([], [:])
    For custom structs:
      → attempt default memberwise init with all fields at their type defaults
    For Optional<T>:
      → use nil

  IR representation:
    { kind: "state_stub", name: "<property_name>", type: "<T>", value: <resolved_default> }
    Example: { kind: "state_stub", name: "count", type: "Int", value: 0 }

  Renderer behaviour:
    The view renders as if the @State property equals the stub value.
    The projectedValue ($property) yields a Binding.constant(<stub_value>)
    equivalent — reads return the stub, writes are discarded.
```

```
WRAPPER STUB CONTRACT: @Binding
  Source: developer.apple.com/documentation/swiftui/binding [SPEC]

  Declaration:    @propertyWrapper @frozen struct Binding<Value> : DynamicProperty
  Constraints:    Value is unconstrained (no protocol conformance required)
                  Apple warns: "if Value is not value semantic, the updating
                  behavior for any views that make use of the resulting Binding
                  is unspecified."

  wrappedValue type:   Value  (get, nonmutating set)
  projectedValue type: Binding<Value>  (get — returns self)

  Initial value:
    - @Binding properties are NEVER self-initialized from a declaration default.
      They receive their value from an external source of truth (a parent's
      @State projectedValue, an @ObservedObject Wrapper keypath, or
      Binding.constant(_:)).
    - Binding.constant(_: Value) → Binding<Value> creates an immutable binding
      whose getter always returns the given value and whose setter is a no-op.

  Ownership: None. Binding is a read-write conduit to someone else's data.
             It does not store data itself.

  Mutation in preview:
    Binding.constant() setter is a no-op — writes are silently discarded.
    In a static preview, interactive controls (Toggle, TextField) appear
    functional visually but the underlying value never changes.

  Stub rule:
    Always wrap in Binding.constant(<stub_value>):
      @Binding var isOn: Bool       → .constant(false)
      @Binding var text: String     → .constant("")
      @Binding var count: Int       → .constant(0)
      @Binding var item: T?         → .constant(nil)
      @Binding var items: [T]       → .constant([])
    The stub value follows the same type-default rules as @State.
    If a sibling @State stub exists for the same logical property, use its value.

  IR representation:
    { kind: "binding_stub", name: "<property_name>", type: "<T>",
      value: <resolved_default>, mechanism: "Binding.constant" }
    Example: { kind: "binding_stub", name: "isOn", type: "Bool",
               value: false, mechanism: "Binding.constant" }

  Renderer behaviour:
    The view renders as if the bound value equals the stub value.
    $property (projectedValue) returns the same Binding (pass-through).
    User interaction in the preview is visually rendered but has no effect
    on the underlying value.
```

---

## The two object wrappers: @ObservedObject and @EnvironmentObject

Both require their generic parameter to conform to **`ObservableObject`** — a class-only Combine protocol whose single requirement is an `objectWillChange` publisher (auto-synthesized when using `@Published`). The key stubbing difference: `@ObservedObject` is injected via the view's initializer (explicit dependency), while `@EnvironmentObject` is resolved from the SwiftUI environment at runtime (implicit dependency). **A missing `@EnvironmentObject` causes a fatal runtime error**, making guaranteed stub injection critical.

Both wrappers expose a `projectedValue` of type `Wrapper` — a `@dynamicMemberLookup` struct that converts keypath access (`$viewModel.name`) into `Binding<PropertyType>` via `ReferenceWritableKeyPath`. This means the stub injector must provide a fully constructed object whose `@Published` properties have sensible defaults.

```
WRAPPER STUB CONTRACT: @ObservedObject
  Source: developer.apple.com/documentation/swiftui/observedobject [SPEC]

  Declaration:    @propertyWrapper @frozen struct ObservedObject<ObjectType> : DynamicProperty
                      where ObjectType : ObservableObject
  Constraints:    ObjectType must conform to ObservableObject (class-only, AnyObject).
                  ObservableObject requires:
                    var objectWillChange: ObjectWillChangePublisher { get }
                  (auto-synthesized by compiler when @Published properties exist)

  wrappedValue type:   ObjectType  (the observable object instance)
  projectedValue type: ObservedObject<ObjectType>.Wrapper
                       (@dynamicMemberLookup — $vm.prop yields Binding<PropType>
                        via ReferenceWritableKeyPath<ObjectType, PropType>)

  Initial value:
    - Has init(wrappedValue:) — technically allows a default
      (e.g., @ObservedObject var vm = MyVM()), but this is STRONGLY DISCOURAGED
      because SwiftUI does not own the object's lifecycle and may re-create
      the view struct, constructing a new instance each time.
    - Canonical usage: no default; object is passed via the view's init by a parent.

  Ownership: Externally owned. The view observes but does NOT own the lifecycle.
             The parent (or a @StateObject higher up) owns the object.

  Mutation in preview:
    In a static preview the Combine subscription to objectWillChange is inert.
    Mutations to @Published properties do not trigger re-renders.
    The stub object's initial property values are what the view sees.

  Stub rule:
    If ObjectType has a no-argument initializer (init()):
      → construct via ObjectType() — all @Published properties take their
        declaration defaults
    If ObjectType requires init parameters:
      → attempt construction with type-zero arguments for each parameter
        (0 for Int, "" for String, false for Bool, nil for Optional, [] for Array)
    If construction is not possible (no accessible init, required external deps):
      → emit EmptyNode sentinel and flag the property for manual resolution
    The stub object's @Published properties should each be at their type default.

  IR representation:
    { kind: "observedobject_stub", name: "<property_name>",
      type: "<ObjectType>", init: "default" | "parameterized" | "empty_node",
      published_defaults: { "<prop>": <value>, ... } }
    Example: { kind: "observedobject_stub", name: "viewModel",
               type: "CounterViewModel", init: "default",
               published_defaults: { "count": 0, "label": "" } }

  Renderer behaviour:
    The view renders using the stub object's @Published property values.
    $viewModel.property yields a Binding whose getter returns the current
    @Published value and whose setter mutates the object (but no re-render
    occurs in a static preview).
```

```
WRAPPER STUB CONTRACT: @EnvironmentObject
  Source: developer.apple.com/documentation/swiftui/environmentobject [SPEC]

  Declaration:    @frozen @propertyWrapper struct EnvironmentObject<ObjectType>
                      where ObjectType : ObservableObject
  Constraints:    Identical to @ObservedObject — ObjectType must conform to
                  ObservableObject (class-only).

  wrappedValue type:   ObjectType  (resolved from the SwiftUI environment)
  projectedValue type: EnvironmentObject<ObjectType>.Wrapper
                       (@dynamicMemberLookup — same pattern as ObservedObject.Wrapper,
                        $envObj.prop yields Binding<PropType>)

  Initial value:
    - init() takes NO parameters. The object is NOT passed at init time.
    - The value is resolved from the SwiftUI environment at runtime, keyed by
      ObjectType.self (one instance per type per environment scope).
    - Internally behaves like an implicitly unwrapped optional — nil until
      resolved by the framework.

  Injection mechanism:
    Ancestor view must call .environmentObject(instance) modifier.
    All descendants in that subtree can access the object.
    Intermediate views do NOT need to know about or forward the object.

  CRITICAL — Missing injection behavior:
    If no ancestor has injected an instance of ObjectType, accessing the
    wrappedValue causes a FATAL RUNTIME ERROR:
      "Fatal error: No ObservableObject of type <ObjectType> found.
       A View.environmentObject(_:) for <ObjectType> may be missing
       as an ancestor of this view."
    This crash occurs in production AND in Xcode Previews.
    → The stub injector MUST guarantee injection for every @EnvironmentObject.

  Ownership: Not view-owned. Lifecycle managed by whoever created the object
             (typically a @StateObject at the app/scene level).

  Mutation in preview:
    Same as @ObservedObject — Combine subscription is inert in static previews.
    Stub object's initial @Published values are what the view sees.

  Stub rule:
    MUST inject via .environmentObject(<stub_instance>) on the preview view.
    Injection is mandatory — omission causes a fatal crash, not a graceful fallback.

    If ObjectType has a no-argument initializer (init()):
      → construct via ObjectType() and inject with .environmentObject(ObjectType())
    If ObjectType requires init parameters:
      → attempt construction with type-zero arguments for each parameter
    If construction is not possible:
      → emit EmptyNode sentinel AND flag as CRITICAL (preview will crash without
        resolution)
    For views with multiple @EnvironmentObject properties of different types:
      → inject ALL of them; each is independently resolved by type.

  IR representation:
    { kind: "environmentobject_stub", name: "<property_name>",
      type: "<ObjectType>", init: "default" | "parameterized" | "empty_node",
      injection: ".environmentObject(<ObjectType>())",
      published_defaults: { "<prop>": <value>, ... },
      critical: true }
    Example: { kind: "environmentobject_stub", name: "settings",
               type: "UserSettings", init: "default",
               injection: ".environmentObject(UserSettings())",
               published_defaults: { "theme": "light", "fontSize": 14 },
               critical: true }

  Renderer behaviour:
    The view renders using the injected stub object's @Published property values.
    Without injection the preview fatally crashes before body is evaluated.
    $settings.property yields a Binding via the Wrapper's dynamicMemberLookup.
```

---

## How projected values map to stub bindings

Understanding the `$` prefix behavior is essential for the resolver. The **value wrappers** both project `Binding<Value>` directly, while the **object wrappers** project a `Wrapper` struct that uses `@dynamicMemberLookup` to synthesize `Binding<PropertyType>` on keypath access. In a static preview, all these bindings are effectively read-only because no render loop propagates changes.

| Wrapper | `$property` type | Stub equivalent |
|---|---|---|
| `@State<Value>` | `Binding<Value>` | `Binding.constant(<stub_value>)` |
| `@Binding<Value>` | `Binding<Value>` (self) | `Binding.constant(<stub_value>)` |
| `@ObservedObject<T>` | `ObservedObject<T>.Wrapper` | Wrapper around stub `T()` instance |
| `@EnvironmentObject<T>` | `EnvironmentObject<T>.Wrapper` | Wrapper around injected stub `T()` instance |

---

## Thread-safety and ownership constraints relevant to stubbing

For a static preview stub injector, thread-safety concerns are largely moot — no concurrent access occurs. However, two ownership rules constrain stub design. First, `@State` storage is framework-managed and the resolver should not attempt to externally mutate it; the initial declaration value is the only control point. Second, `@ObservedObject` must never be constructed inline with a default (`@ObservedObject var vm = VM()`) in production code because SwiftUI can discard and re-create the view struct, instantiating a new object each time. **In a static preview stub, this concern does not apply** — the view struct is instantiated exactly once, so default construction is safe for stubbing purposes.

The `@MainActor` annotation on the `View` protocol (Xcode 16+ / Swift 6) means all property access occurs on the main thread. The stub injector should construct all stub objects on the main thread to satisfy this constraint, even though static previews don't enforce it at runtime.

---

```
STUB RESOLUTION TABLE
══════════════════════════════════════════════════════════════════════════

  Pattern                              Stub value                         Mechanism
  ─────────────────────────────────    ──────────────────────────────     ─────────────────────────
  @State var x: T = default            default                            Use declared initializer
  @State var x: T                      type_zero(T)                       "" | 0 | false | nil | []
  @Binding var x: T                    Binding.constant(type_zero(T))     Wraps a constant binding
  @ObservedObject var vm: VM           VM() if default init available     Default-construct the object
  @ObservedObject var vm: VM           EmptyNode if no default init       Flag for manual resolution
  @EnvironmentObject var vm: VM        .environmentObject(VM())           MUST inject; crash if missing
  @EnvironmentObject var vm: VM        EmptyNode if no default init       CRITICAL — preview will crash

  Type-zero defaults:
    String  → ""          Int     → 0           Double  → 0.0
    Bool    → false       Optional<T> → nil     Array<T> → []
    Set<T>  → Set()       Dictionary<K,V> → [:] Date    → Date()
    UUID    → UUID()      URL     → URL(string: "about:blank")!
    CGFloat → 0.0         Data    → Data()

  ProjectedValue ($) stub mapping:
    @State $x        → Binding.constant(stub_value)
    @Binding $x      → Binding.constant(stub_value)  [pass-through]
    @ObservedObject  → ObservedObject.Wrapper around stub VM()
      $vm.prop       → Binding to stub VM()'s property value
    @EnvironmentObject → EnvironmentObject.Wrapper around injected stub VM()
      $vm.prop       → Binding to injected stub VM()'s property value

══════════════════════════════════════════════════════════════════════════
```

## Conclusion

The four contracts reduce to two fundamental stub strategies. **Value wrappers** (`@State`, `@Binding`) resolve to `Binding.constant(type_zero(T))` or the declared default — no external injection needed, no crash risk. **Object wrappers** (`@ObservedObject`, `@EnvironmentObject`) resolve to a default-constructed `ObservableObject` instance, with `@EnvironmentObject` requiring explicit `.environmentObject()` injection to prevent a fatal runtime crash. The resolver should treat every `@EnvironmentObject` stub as **critical priority** — it is the only wrapper whose absence causes an unrecoverable error rather than a silent degradation. For all wrappers, the static preview context guarantees that mutation is inert: the Combine subscription to `objectWillChange` never fires a re-render, and `Binding.constant()` silently discards writes.