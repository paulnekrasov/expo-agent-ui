# Component Primitives Reference

The complete Agent UI component surface. Every component is React Native-first, emits
accessibility props, and registers itself in the semantic tree when rendered inside
`<AgentUIProvider>`.

## Provider

### AgentUIProvider

```tsx
import { AgentUIProvider } from "@expo-agent-ui/core";

export default function App() {
  return (
    <AgentUIProvider
      sessionId="my-app-session"
      pairingToken="random-token-string"
    >
      {/* app content */}
    </AgentUIProvider>
  );
}
```

Props:
- `sessionId: string` — Unique session identifier for the MCP bridge
- `pairingToken: string` — Short-lived token for bridge authentication
- `children: React.ReactNode`

## Layout

### VStack, HStack, ZStack

Stack containers with alignment and spacing. All accept `alignment`, `spacing`, and `style`.

```tsx
<VStack alignment="leading" spacing={12}>
  <Text id="header">Title</Text>
  <HStack spacing={8}>
    <Button id="yes-btn" label="Yes" onPress={handleYes} />
    <Spacer />
    <Button id="no-btn" label="No" onPress={handleNo} />
  </HStack>
</VStack>
```

### Spacer

Flexible spacer that fills available space in a stack.

### Scroll

Scrollable container with optional horizontal/vertical direction.

### List, Section

Scrollable list with section grouping. Supports `data` prop for flat list rendering.

### Form

Grouped form container with automatic section styling.

## Display

### Text

Text display with variant support (body, headline, caption).

```tsx
<Text id="welcome-text" variant="headline">Welcome back</Text>
```

### Image

Image component with `source`, `resizeMode`, and accessibility.

### Icon

Icon component mapping to SF Symbols / Material Symbols.

### Label

Combined icon + text label for list rows and form fields.

## Controls

### Button

```tsx
<Button
  id="save-btn"
  label="Save"
  onPress={handleSave}
  disabled={isSaving}
  busy={isSaving}
  intent="primary"
/>
```

Props: `id` (required), `label`, `onPress`, `disabled`, `busy`, `intent`, `testID`, `style`.

### TextField

```tsx
<TextField
  id="email-field"
  placeholder="Email"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
/>
```

Props: `id`, `value`, `defaultValue`, `placeholder`, `onChangeText`, `onSubmitEditing`,
`keyboardType`, `secureTextEntry`, `disabled`, `style`.

### SecureField

Same as TextField but with `secureTextEntry` always true. Use for passwords.

### Toggle

```tsx
<Toggle
  id="notifications-toggle"
  checked={notifications}
  onValueChange={setNotifications}
  label="Enable notifications"
/>
```

Props: `id`, `checked`, `onValueChange`, `label`, `disabled`, `style`.

### Slider

```tsx
<Slider
  id="volume-slider"
  value={0.7}
  minimumValue={0}
  maximumValue={1}
  step={0.1}
  onValueChange={setVolume}
/>
```

### Picker

```tsx
<Picker
  id="theme-picker"
  selectedValue={theme}
  options={[
    { label: "Light", value: "light" },
    { label: "Dark", value: "dark" },
  ]}
  onValueChange={setTheme}
/>
```

### Stepper

Increment/decrement control with min/max bounds.

## Screen

### Screen

Top-level screen container that registers screen metadata in the semantic tree.

```tsx
<Screen id="settings-screen" title="Settings">
  {/* screen content */}
</Screen>
```

## Native Adapters (Stage 7)

Optional native adapters provide platform-specific rendering when `@expo/ui` is installed.

### SwiftUI Adapter (iOS)

```tsx
import {
  agentUISwiftUIAdapter,
  createAgentUISwiftUIButton,
} from "@expo-agent-ui/core";

if (agentUISwiftUIAdapter.isAvailable()) {
  const NativeButton = createAgentUISwiftUIButton();
  // Use NativeButton with Host boundary
}
```

6 SwiftUI component factories: Button, Toggle, TextField, SecureField, Slider, Picker.
14 capability flags. Requires `@expo/ui/swift-ui` and `<Host>` boundary.

### Jetpack Compose Adapter (Android)

```tsx
import {
  agentUIComposeAdapter,
  createAgentUIComposeButton,
} from "@expo-agent-ui/core";

if (agentUIComposeAdapter.isAvailable()) {
  const NativeButton = createAgentUIComposeButton();
  // Use NativeButton with Host boundary
}
```

4 Compose component factories: Button, TextField, Switch, Slider.
29 capability flags. Requires `@expo/ui/jetpack-compose` and `<Host>` boundary.
