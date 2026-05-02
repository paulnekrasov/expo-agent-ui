# Component Reference — Expo Agent UI

All components import from `@expo-agent-ui/core`. Every component accepts accessibility props
(`accessibilityLabel`, `testID`) and semantic props (`id`, `intent`).

## Provider

### AgentUIProvider

Root provider. Must wrap the app. Gating ensures agent control only in development.

| Prop | Type | Default |
|---|---|---|
| `children` | `React.ReactNode` | **required** |
| `bridge` | `AgentUIBridgeConfig` | `undefined` |
| `runtime` | `AgentUISemanticRuntime` | auto-created in dev |

```tsx
<AgentUIProvider agentEnabled={__DEV__}>
  {/* screens */}
</AgentUIProvider>
```

---

## Containers

### Screen (`ScreenProps`)

Top-level screen. Registers as `role: "screen"`. Actions: `["observe"]`.

| Prop | Type | Default |
|---|---|---|
| `id` | `string` | — |
| `name` | `string` | — |
| `title` | `string` | — |
| `intent` | `string` | — |
| `accessibilityLabel` | `string` | — |
| `testID` | `string` | — |
| `children` | `React.ReactNode` | — |
| `style` | `ViewStyle` | — |

### VStack / HStack (`StackProps`)

Vertical/horizontal layout. Registers as `role: "stack"`. Actions: `["observe"]`.

| Prop | Type | Default |
|---|---|---|
| `id` | `string` | — |
| `alignment` | `"start" \| "center" \| "end" \| "stretch"` | — |
| `spacing` | `number` | — |
| `intent` | `string` | — |
| `children` | `React.ReactNode` | — |
| `style` | `ViewStyle` | — |

### ZStack (`ZStackProps`)

Layers children on top of each other like an absolute-position overlay.

| Prop | Type | Default |
|---|---|---|
| `fill` | `boolean` | `false` |

Plus all `StackProps`.

### Spacer (`SpacerProps`)

Flexible space filler. Registers as `role: "spacer"`.

| Prop | Type | Default |
|---|---|---|
| `id` | `string` | — |
| `minLength` | `number` | — |
| `style` | `ViewStyle` | — |

### Scroll (`AgentUIScrollProps`)

Scrollable container. Registers as `role: "scroll"`. Actions: `["scroll"]`.

| Prop | Type | Default |
|---|---|---|
| `id` | `string` | — |
| `contentSpacing` | `number` | — |
| `children` | `React.ReactNode` | — |
| `style` | `ViewStyle` | — |

Plus all `ScrollViewProps` (React Native).

### List (`AgentUIListProps`)

Semantic list container. Registers as `role: "list"`. Actions: `["observe"]`.

| Prop | Type | Default |
|---|---|---|
| `id` | `string` | — |
| `spacing` | `number` | — |
| `children` | `React.ReactNode` | — |
| `style` | `ViewStyle` | — |

### Section (`AgentUISectionProps`)

Grouped section with optional header/footer. Registers as `role: "section"`. Actions: `["observe"]`.

| Prop | Type | Default |
|---|---|---|
| `id` | `string` | — |
| `title` | `string` | — |
| `header` | `React.ReactNode` | — |
| `footer` | `React.ReactNode` | — |
| `spacing` | `number` | — |
| `titleStyle` | `TextStyle` | — |
| `style` | `ViewStyle` | — |

### Form (`AgentUIFormProps`)

Semantic form container. Registers as `role: "form"`. Actions: `["observe"]`.

| Prop | Type | Default |
|---|---|---|
| `id` | `string` | — |
| `spacing` | `number` | — |
| `children` | `React.ReactNode` | — |
| `style` | `ViewStyle` | — |

---

## Content

### Text (`AgentUITextProps`)

Registers as `role: "text"`. Actions: `["observe"]`.

| Prop | Type | Default |
|---|---|---|
| `id` | `string` | — |
| `variant` | `"body" \| "title" \| "headline" \| "caption"` | `"body"` |
| `children` | `React.ReactNode` | — |
| `style` | `TextStyle` | — |

### Image (`AgentUIImageProps`)

Registers as `role: "image"`. Actions: `["observe"]`.

| Prop | Type | Default |
|---|---|---|
| `id` | `string` | — |
| `decorative` | `boolean` | `false` |
| `style` | `ImageStyle` | — |

Plus all `ImageProps` (React Native) except accessibility overrides.

### Icon (`AgentUIIconProps`)

SF Symbol / Material Symbol icon rendered as text. Registers as `role: "icon"`.

| Prop | Type | Default |
|---|---|---|
| `id` | `string` | — |
| `name` | `string` | **required** |
| `size` | `number` | `18` |
| `color` | `string` | — |
| `decorative` | `boolean` | `true` |
| `style` | `TextStyle` | — |

### Label (`AgentUILabelProps`)

Icon + text row. Registers as `role: "label"`. Actions: `["observe"]`.

| Prop | Type | Default |
|---|---|---|
| `id` | `string` | — |
| `icon` | `string` | — |
| `spacing` | `number` | `8` |
| `children` | `React.ReactNode` | **required** |
| `style` | `ViewStyle` | — |

---

## Controls (Actionable — `id` is REQUIRED)

Controls extend `AgentUIActionablePrimitiveProps`: `id` is mandatory, `disabled` and `busy` are optional.

### Button (`AgentUIButtonProps`)

**Role:** `"button"`. **Actions:** `["activate", "tap"]`. **Privacy:** `"none"`.

```tsx
<Button
  id="checkout.submit"
  intent="submit_order"
  disabled={false}
  onPress={() => submitOrder()}
>
  Place Order
</Button>
```

| Prop | Type | Default |
|---|---|---|
| `id` | `string` | **required** |
| `disabled` | `boolean` | `false` |
| `busy` | `boolean` | — |
| `intent` | `string` | — |
| `children` | `React.ReactNode` | **required** |
| `style` | `PressableStyle` | — |
| `textStyle` | `TextStyle` | — |

Plus all `PressableProps` (React Native) except accessibility/semantic overrides.

### TextField (`AgentUITextFieldProps`)

**Role:** `"textInput"`. **Actions:** `["focus", "input", "clear", "submit"]`.
**Privacy:** `"none"` (values visible). Set `secure` mode via `SecureField`.

```tsx
<TextField
  id="checkout.email"
  label="Email"
  placeholder="you@example.com"
  keyboardType="email-address"
  onChangeText={(text) => setEmail(text)}
/>
```

| Prop | Type | Default |
|---|---|---|
| `id` | `string` | **required** |
| `disabled` | `boolean` | `false` |
| `label` | `string` | — |
| `editable` | `boolean` | `true` |
| `style` | `TextStyle` | — |

Plus all `TextInputProps` (React Native) except accessibility/semantic overrides.

### SecureField (`AgentUISecureFieldProps`)

Identical to `TextField` but passes `secureTextEntry={true}`. **Privacy:** `"redacted"` —
values appear as `"[redacted]"` in semantic snapshots and MCP responses.

```tsx
<SecureField
  id="checkout.password"
  label="Password"
  onChangeText={(text) => setPassword(text)}
/>
```

### Toggle (`AgentUIToggleProps`)

**Role:** `"toggle"`. **Actions:** `["toggle", "activate"]`.
**Semantic value:** `{ checked: boolean }`.

```tsx
<Toggle
  id="settings.notifications"
  label="Push Notifications"
  value={notificationsEnabled}
  onValueChange={(v) => setNotifications(v)}
/>
```

| Prop | Type | Default |
|---|---|---|
| `id` | `string` | **required** |
| `disabled` | `boolean` | `false` |
| `label` | `string` | — |
| `value` | `boolean` | **required** |

### Slider (`AgentUISliderProps`)

**Role:** `"slider"`. **Actions:** `["increment", "decrement", "set_value"]`.
**Semantic value:** `{ min, max, now, step }`.

```tsx
<Slider
  id="settings.volume"
  label="Volume"
  value={0.5}
  minimumValue={0}
  maximumValue={1}
  step={0.1}
  onValueChange={(v) => setVolume(v)}
/>
```

| Prop | Type | Default |
|---|---|---|
| `id` | `string` | **required** |
| `disabled` | `boolean` | `false` |
| `label` | `string` | — |
| `value` | `number` | **required** |
| `minimumValue` | `number` | `0` |
| `maximumValue` | `number` | `1` |
| `step` | `number` | `(max-min)/100` |
| `onValueChange` | `(v: number) => void` | — |
| `fillStyle` | `ViewStyle` | — |
| `thumbStyle` | `ViewStyle` | — |
| `trackStyle` | `ViewStyle` | — |

### Picker (`AgentUIPickerProps`)

**Role:** `"picker"`. **Actions:** `["select"]`.

```tsx
<Picker
  id="settings.theme"
  label="Theme"
  options={[
    { id: "light", label: "Light", value: "light" },
    { id: "dark",  label: "Dark",  value: "dark" },
  ]}
  selectedValue="light"
  onValueChange={(v) => setTheme(v)}
/>
```

| Prop | Type | Default |
|---|---|---|
| `id` | `string` | **required** |
| `disabled` | `boolean` | `false` |
| `label` | `string` | — |
| `options` | `AgentUIPickerOption[]` | **required** |
| `selectedValue` | `string \| number` | — |
| `onValueChange` | `(value, option) => void` | — |
| `spacing` | `number` | — |

`AgentUIPickerOption`: `{ id: string; label: string; value: string | number; disabled?: boolean }`

### Stepper (`AgentUIStepperProps`)

**Role:** `"stepper"`. **Actions:** `["increment", "decrement", "set_value"]`.
**Semantic value:** `{ min, max, now, step }`.

```tsx
<Stepper
  id="checkout.quantity"
  label="Quantity"
  value={1}
  minimumValue={1}
  maximumValue={10}
  onValueChange={(v) => setQuantity(v)}
/>
```

| Prop | Type | Default |
|---|---|---|
| `id` | `string` | **required** |
| `disabled` | `boolean` | `false` |
| `label` | `string` | — |
| `value` | `number` | **required** |
| `minimumValue` | `number` | `0` |
| `maximumValue` | `number` | `1` |
| `step` | `number` | `(max-min)/100` |
| `onValueChange` | `(v: number) => void` | — |
| `incrementLabel` | `string` | `"Increase"` |
| `decrementLabel` | `string` | `"Decrease"` |

---

## Native Adapters (Optional)

Import from `@expo-agent-ui/core` (type-only for contracts; requires `@expo/ui` for native rendering):

```tsx
// iOS SwiftUI adapter (requires @expo/ui/swift-ui)
import { createAgentUISwiftUIButton } from "@expo-agent-ui/core";

// Android Compose adapter (requires @expo/ui/jetpack-compose)
import { createAgentUIComposeButton } from "@expo-agent-ui/core";
```

Native adapters fall back to React Native primitives when `@expo/ui` is not installed.
All adapter components accept the same semantic props as their core counterparts.
