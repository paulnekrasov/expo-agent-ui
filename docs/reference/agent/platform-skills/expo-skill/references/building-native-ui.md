# building-native-ui

Source: https://github.com/expo/skills/tree/main/plugins/expo/skills/building-native-ui

## Source SKILL.md

---
name: building-native-ui
description: Complete guide for building beautiful apps with Expo Router. Covers fundamentals, styling, components, navigation, animations, patterns, and native tabs.
version: 1.0.1
license: MIT
---

# Expo UI Guidelines

## References

Consult these resources as needed:

```
references/
  animations.md          Reanimated: entering, exiting, layout, scroll-driven, gestures
  controls.md            Native iOS: Switch, Slider, SegmentedControl, DateTimePicker, Picker
  form-sheet.md          Form sheets in expo-router: configuration, footers and background interaction. 
  gradients.md           CSS gradients via experimental_backgroundImage (New Arch only)
  icons.md               SF Symbols via expo-image (sf: source), names, animations, weights
  media.md               Camera, audio, video, and file saving
  route-structure.md     Route conventions, dynamic routes, groups, folder organization
  search.md              Search bar with headers, useSearch hook, filtering patterns
  storage.md             SQLite, AsyncStorage, SecureStore
  tabs.md                NativeTabs, migration from JS tabs, iOS 26 features
  toolbar-and-headers.md Stack headers and toolbar buttons, menus, search (iOS only)
  visual-effects.md      Blur (expo-blur) and liquid glass (expo-glass-effect)
  webgpu-three.md        3D graphics, games, GPU visualizations with WebGPU and Three.js
  zoom-transitions.md    Apple Zoom: fluid zoom transitions with Link.AppleZoom (iOS 18+)
```

## Running the App

**CRITICAL: Always try Expo Go first before creating custom builds.**

Most Expo apps work in Expo Go without any custom native code. Before running `npx expo run:ios` or `npx expo run:android`:

1. **Start with Expo Go**: Run `npx expo start` and scan the QR code with Expo Go
2. **Check if features work**: Test your app thoroughly in Expo Go
3. **Only create custom builds when required** - see below

### When Custom Builds Are Required

You need `npx expo run:ios/android` or `eas build` ONLY when using:

- **Local Expo modules** (custom native code in `modules/`)
- **Apple targets** (widgets, app clips, extensions via `@bacons/apple-targets`)
- **Third-party native modules** not included in Expo Go
- **Custom native configuration** that can't be expressed in `app.json`

### When Expo Go Works

Expo Go supports a huge range of features out of the box:

- All `expo-*` packages (camera, location, notifications, etc.)
- Expo Router navigation
- Most UI libraries (reanimated, gesture handler, etc.)
- Push notifications, deep links, and more

**If you're unsure, try Expo Go first.** Creating custom builds adds complexity, slower iteration, and requires Xcode/Android Studio setup.

## Code Style

- Be cautious of unterminated strings. Ensure nested backticks are escaped; never forget to escape quotes correctly.
- Always use import statements at the top of the file.
- Always use kebab-case for file names, e.g. `comment-card.tsx`
- Always remove old route files when moving or restructuring navigation
- Never use special characters in file names
- Configure tsconfig.json with path aliases, and prefer aliases over relative imports for refactors.

## Routes

See `./references/route-structure.md` for detailed route conventions.

- Routes belong in the `app` directory.
- Never co-locate components, types, or utilities in the app directory. This is an anti-pattern.
- Ensure the app always has a route that matches "/", it may be inside a group route.

## Library Preferences

- Never use modules removed from React Native such as Picker, WebView, SafeAreaView, or AsyncStorage
- Never use legacy expo-permissions
- `expo-audio` not `expo-av`
- `expo-video` not `expo-av`
- `expo-image` with `source="sf:name"` for SF Symbols, not `expo-symbols` or `@expo/vector-icons`
- `react-native-safe-area-context` not react-native SafeAreaView
- `process.env.EXPO_OS` not `Platform.OS`
- `React.use` not `React.useContext`
- `expo-image` Image component instead of intrinsic element `img`
- `expo-glass-effect` for liquid glass backdrops

## Responsiveness

- Always wrap root component in a scroll view for responsiveness
- Use `<ScrollView contentInsetAdjustmentBehavior="automatic" />` instead of `<SafeAreaView>` for smarter safe area insets
- `contentInsetAdjustmentBehavior="automatic"` should be applied to FlatList and SectionList as well
- Use flexbox instead of Dimensions API
- ALWAYS prefer `useWindowDimensions` over `Dimensions.get()` to measure screen size

## Behavior

- Use expo-haptics conditionally on iOS to make more delightful experiences
- Use views with built-in haptics like `<Switch />` from React Native and `@react-native-community/datetimepicker`
- When a route belongs to a Stack, its first child should almost always be a ScrollView with `contentInsetAdjustmentBehavior="automatic"` set
- When adding a `ScrollView` to the page it should almost always be the first component inside the route component
- Prefer `headerSearchBarOptions` in Stack.Screen options to add a search bar
- Use the `<Text selectable />` prop on text containing data that could be copied
- Consider formatting large numbers like 1.4M or 38k
- Never use intrinsic elements like 'img' or 'div' unless in a webview or Expo DOM component

# Styling

Follow Apple Human Interface Guidelines.

## General Styling Rules

- Prefer flex gap over margin and padding styles
- Prefer padding over margin where possible
- Always account for safe area, either with stack headers, tabs, or ScrollView/FlatList `contentInsetAdjustmentBehavior="automatic"`
- Ensure both top and bottom safe area insets are accounted for
- Inline styles not StyleSheet.create unless reusing styles is faster
- Add entering and exiting animations for state changes
- Use `{ borderCurve: 'continuous' }` for rounded corners unless creating a capsule shape
- ALWAYS use a navigation stack title instead of a custom text element on the page
- When padding a ScrollView, use `contentContainerStyle` padding and gap instead of padding on the ScrollView itself (reduces clipping)
- CSS and Tailwind are not supported - use inline styles

## Text Styling

- Add the `selectable` prop to every `<Text/>` element displaying important data or error messages
- Counters should use `{ fontVariant: 'tabular-nums' }` for alignment

## Shadows

Use CSS `boxShadow` style prop. NEVER use legacy React Native shadow or elevation styles.

```tsx
<View style={{ boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)" }} />
```

'inset' shadows are supported.

# Navigation

## Link

Use `<Link href="/path" />` from 'expo-router' for navigation between routes.

```tsx
import { Link } from 'expo-router';

// Basic link
<Link href="/path" />

// Wrapping custom components
<Link href="/path" asChild>
  <Pressable>...</Pressable>
</Link>
```

Whenever possible, include a `<Link.Preview>` to follow iOS conventions. Add context menus and previews frequently to enhance navigation.

## Stack

- ALWAYS use `_layout.tsx` files to define stacks
- Use Stack from 'expo-router/stack' for native navigation stacks

### Page Title

Set the page title in Stack.Screen options:

```tsx
<Stack.Screen options={{ title: "Home" }} />
```

## Context Menus

Add long press context menus to Link components:

```tsx
import { Link } from "expo-router";

<Link href="/settings" asChild>
  <Link.Trigger>
    <Pressable>
      <Card />
    </Pressable>
  </Link.Trigger>
  <Link.Menu>
    <Link.MenuAction
      title="Share"
      icon="square.and.arrow.up"
      onPress={handleSharePress}
    />
    <Link.MenuAction
      title="Block"
      icon="nosign"
      destructive
      onPress={handleBlockPress}
    />
    <Link.Menu title="More" icon="ellipsis">
      <Link.MenuAction title="Copy" icon="doc.on.doc" onPress={() => {}} />
      <Link.MenuAction
        title="Delete"
        icon="trash"
        destructive
        onPress={() => {}}
      />
    </Link.Menu>
  </Link.Menu>
</Link>;
```

## Link Previews

Use link previews frequently to enhance navigation:

```tsx
<Link href="/settings">
  <Link.Trigger>
    <Pressable>
      <Card />
    </Pressable>
  </Link.Trigger>
  <Link.Preview />
</Link>
```

Link preview can be used with context menus.

## Modal

Present a screen as a modal:

```tsx
<Stack.Screen name="modal" options={{ presentation: "modal" }} />
```

Prefer this to building a custom modal component.

## Sheet

Present a screen as a dynamic form sheet:

```tsx
<Stack.Screen
  name="sheet"
  options={{
    presentation: "formSheet",
    sheetGrabberVisible: true,
    sheetAllowedDetents: [0.5, 1.0],
    contentStyle: { backgroundColor: "transparent" },
  }}
/>
```

- Using `contentStyle: { backgroundColor: "transparent" }` makes the background liquid glass on iOS 26+.

## Common route structure

A standard app layout with tabs and stacks inside each tab:

```
app/
  _layout.tsx — <NativeTabs />
  (index,search)/
    _layout.tsx — <Stack />
    index.tsx — Main list
    search.tsx — Search view
```

```tsx
// app/_layout.tsx
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { Theme } from "../components/theme";

export default function Layout() {
  return (
    <Theme>
      <NativeTabs>
        <NativeTabs.Trigger name="(index)">
          <Icon sf="list.dash" />
          <Label>Items</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="(search)" role="search" />
      </NativeTabs>
    </Theme>
  );
}
```

Create a shared group route so both tabs can push common screens:

```tsx
// app/(index,search)/_layout.tsx
import { Stack } from "expo-router/stack";
import { PlatformColor } from "react-native";

export default function Layout({ segment }) {
  const screen = segment.match(/\((.*)\)/)?.[1]!;
  const titles: Record<string, string> = { index: "Items", search: "Search" };

  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: { backgroundColor: "transparent" },
        headerTitleStyle: { color: PlatformColor("label") },
        headerLargeTitle: true,
        headerBlurEffect: "none",
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen name={screen} options={{ title: titles[screen] }} />
      <Stack.Screen name="i/[id]" options={{ headerLargeTitle: false }} />
    </Stack>
  );
}
```

## Source Reference: references / animations.md

# Animations

Use Reanimated v4. Avoid React Native's built-in Animated API.

## Entering and Exiting Animations

Use Animated.View with entering and exiting animations. Layout animations can animate state changes.

```tsx
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";

function App() {
  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      layout={LinearTransition}
    />
  );
}
```

## On-Scroll Animations

Create high-performance scroll animations using Reanimated's hooks:

```tsx
import Animated, {
  useAnimatedRef,
  useScrollViewOffset,
  useAnimatedStyle,
  interpolate,
} from "react-native-reanimated";

function Page() {
  const ref = useAnimatedRef();
  const scroll = useScrollViewOffset(ref);

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(scroll.value, [0, 30], [0, 1], "clamp"),
  }));

  return (
    <Animated.ScrollView ref={ref}>
      <Animated.View style={style} />
    </Animated.ScrollView>
  );
}
```

## Common Animation Presets

### Entering Animations

- `FadeIn`, `FadeInUp`, `FadeInDown`, `FadeInLeft`, `FadeInRight`
- `SlideInUp`, `SlideInDown`, `SlideInLeft`, `SlideInRight`
- `ZoomIn`, `ZoomInUp`, `ZoomInDown`
- `BounceIn`, `BounceInUp`, `BounceInDown`

### Exiting Animations

- `FadeOut`, `FadeOutUp`, `FadeOutDown`, `FadeOutLeft`, `FadeOutRight`
- `SlideOutUp`, `SlideOutDown`, `SlideOutLeft`, `SlideOutRight`
- `ZoomOut`, `ZoomOutUp`, `ZoomOutDown`
- `BounceOut`, `BounceOutUp`, `BounceOutDown`

### Layout Animations

- `LinearTransition` — Smooth linear interpolation
- `SequencedTransition` — Sequenced property changes
- `FadingTransition` — Fade between states

## Customizing Animations

```tsx
<Animated.View
  entering={FadeInDown.duration(500).delay(200)}
  exiting={FadeOut.duration(300)}
/>
```

### Modifiers

```tsx
// Duration in milliseconds
FadeIn.duration(300);

// Delay before starting
FadeIn.delay(100);

// Spring physics
FadeIn.springify();
FadeIn.springify().damping(15).stiffness(100);

// Easing curves
FadeIn.easing(Easing.bezier(0.25, 0.1, 0.25, 1));

// Chaining
FadeInDown.duration(400).delay(200).springify();
```

## Shared Value Animations

For imperative control over animations:

```tsx
import {
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const offset = useSharedValue(0);

// Spring animation
offset.value = withSpring(100);

// Timing animation
offset.value = withTiming(100, { duration: 300 });

// Use in styles
const style = useAnimatedStyle(() => ({
  transform: [{ translateX: offset.value }],
}));
```

## Gesture Animations

Combine with React Native Gesture Handler:

```tsx
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

function DraggableBox() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd(() => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.box, style]} />
    </GestureDetector>
  );
}
```

## Keyboard Animations

Animate with keyboard height changes:

```tsx
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
} from "react-native-reanimated";

function KeyboardAwareView() {
  const keyboard = useAnimatedKeyboard();

  const style = useAnimatedStyle(() => ({
    paddingBottom: keyboard.height.value,
  }));

  return <Animated.View style={style}>{/* content */}</Animated.View>;
}
```

## Staggered List Animations

Animate list items with delays:

```tsx
{
  items.map((item, index) => (
    <Animated.View
      key={item.id}
      entering={FadeInUp.delay(index * 50)}
      exiting={FadeOutUp}
    >
      <ListItem item={item} />
    </Animated.View>
  ));
}
```

## Best Practices

- Add entering and exiting animations for state changes
- Use layout animations when items are added/removed from lists
- Use `useAnimatedStyle` for scroll-driven animations
- Prefer `interpolate` with "clamp" for bounded values
- You can't pass PlatformColors to reanimated views or styles; use static colors instead
- Keep animations under 300ms for responsive feel
- Use spring animations for natural movement
- Avoid animating layout properties (width, height) when possible — prefer transforms

## Source Reference: references / controls.md

# Native Controls

Native iOS controls provide built-in haptics, accessibility, and platform-appropriate styling.

## Switch

Use for binary on/off settings. Has built-in haptics.

```tsx
import { Switch } from "react-native";
import { useState } from "react";

const [enabled, setEnabled] = useState(false);

<Switch value={enabled} onValueChange={setEnabled} />;
```

### Customization

```tsx
<Switch
  value={enabled}
  onValueChange={setEnabled}
  trackColor={{ false: "#767577", true: "#81b0ff" }}
  thumbColor={enabled ? "#f5dd4b" : "#f4f3f4"}
  ios_backgroundColor="#3e3e3e"
/>
```

## Segmented Control

Use for non-navigational tabs or mode selection. Avoid changing default colors.

```tsx
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { useState } from "react";

const [index, setIndex] = useState(0);

<SegmentedControl
  values={["All", "Active", "Done"]}
  selectedIndex={index}
  onChange={({ nativeEvent }) => setIndex(nativeEvent.selectedSegmentIndex)}
/>;
```

### Rules

- Maximum 4 options — use a picker for more
- Keep labels short (1-2 words)
- Avoid custom colors — native styling adapts to dark mode

### With Icons (iOS 14+)

```tsx
<SegmentedControl
  values={[
    { label: "List", icon: "list.bullet" },
    { label: "Grid", icon: "square.grid.2x2" },
  ]}
  selectedIndex={index}
  onChange={({ nativeEvent }) => setIndex(nativeEvent.selectedSegmentIndex)}
/>
```

## Slider

Continuous value selection.

```tsx
import Slider from "@react-native-community/slider";
import { useState } from "react";

const [value, setValue] = useState(0.5);

<Slider
  value={value}
  onValueChange={setValue}
  minimumValue={0}
  maximumValue={1}
/>;
```

### Customization

```tsx
<Slider
  value={value}
  onValueChange={setValue}
  minimumValue={0}
  maximumValue={100}
  step={1}
  minimumTrackTintColor="#007AFF"
  maximumTrackTintColor="#E5E5EA"
  thumbTintColor="#007AFF"
/>
```

### Discrete Steps

```tsx
<Slider
  value={value}
  onValueChange={setValue}
  minimumValue={0}
  maximumValue={10}
  step={1}
/>
```

## Date/Time Picker

Compact pickers with popovers. Has built-in haptics.

```tsx
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";

const [date, setDate] = useState(new Date());

<DateTimePicker
  value={date}
  onChange={(event, selectedDate) => {
    if (selectedDate) setDate(selectedDate);
  }}
  mode="datetime"
/>;
```

### Modes

- `date` — Date only
- `time` — Time only
- `datetime` — Date and time

### Display Styles

```tsx
// Compact inline (default)
<DateTimePicker value={date} mode="date" />

// Spinner wheel
<DateTimePicker
  value={date}
  mode="date"
  display="spinner"
  style={{ width: 200, height: 150 }}
/>

// Full calendar
<DateTimePicker value={date} mode="date" display="inline" />
```

### Time Intervals

```tsx
<DateTimePicker
  value={date}
  mode="time"
  minuteInterval={15}
/>
```

### Min/Max Dates

```tsx
<DateTimePicker
  value={date}
  mode="date"
  minimumDate={new Date(2020, 0, 1)}
  maximumDate={new Date(2030, 11, 31)}
/>
```

## Stepper

Increment/decrement numeric values.

```tsx
import { Stepper } from "react-native";
import { useState } from "react";

const [count, setCount] = useState(0);

<Stepper
  value={count}
  onValueChange={setCount}
  minimumValue={0}
  maximumValue={10}
/>;
```

## TextInput

Native text input with various keyboard types.

```tsx
import { TextInput } from "react-native";

<TextInput
  placeholder="Enter text..."
  placeholderTextColor="#999"
  style={{
    padding: 12,
    fontSize: 16,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  }}
/>
```

### Keyboard Types

```tsx
// Email
<TextInput keyboardType="email-address" autoCapitalize="none" />

// Phone
<TextInput keyboardType="phone-pad" />

// Number
<TextInput keyboardType="numeric" />

// Password
<TextInput secureTextEntry />

// Search
<TextInput
  returnKeyType="search"
  enablesReturnKeyAutomatically
/>
```

### Multiline

```tsx
<TextInput
  multiline
  numberOfLines={4}
  textAlignVertical="top"
  style={{ minHeight: 100 }}
/>
```

## Picker (Wheel)

For selection from many options (5+ items).

```tsx
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";

const [selected, setSelected] = useState("js");

<Picker selectedValue={selected} onValueChange={setSelected}>
  <Picker.Item label="JavaScript" value="js" />
  <Picker.Item label="TypeScript" value="ts" />
  <Picker.Item label="Python" value="py" />
  <Picker.Item label="Go" value="go" />
</Picker>;
```

## Best Practices

- **Haptics**: Switch and DateTimePicker have built-in haptics — don't add extra
- **Accessibility**: Native controls have proper accessibility labels by default
- **Dark Mode**: Avoid custom colors — native styling adapts automatically
- **Spacing**: Use consistent padding around controls (12-16pt)
- **Labels**: Place labels above or to the left of controls
- **Grouping**: Group related controls in sections with headers

## Source Reference: references / form-sheet.md

# Form Sheets in Expo Router

This skill covers implementing form sheets with footers using Expo Router's Stack navigator and react-native-screens.

## Overview

Form sheets are modal presentations that appear as a card sliding up from the bottom of the screen. They're ideal for:

- Quick actions and confirmations
- Settings panels
- Login/signup flows
- Action sheets with custom content

**Requirements:**

- Expo Router Stack navigator

## Basic Usage

### Form Sheet with Footer

Configure the Stack.Screen with transparent backgrounds and sheet presentation:

```tsx
// app/_layout.tsx
import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="about"
        options={{
          presentation: "formSheet",
          sheetAllowedDetents: [0.25],
          headerTransparent: true,
          contentStyle: { backgroundColor: "transparent" },
          sheetGrabberVisible: true,
        }}
      >
        <Stack.Header style={{ backgroundColor: "transparent" }}></Stack.Header>
      </Stack.Screen>
    </Stack>
  );
}
```

### Form Sheet Screen Content

> Requires Expo SDK 55 or later.

Use `flex: 1` to allow the content to fill available space, enabling footer positioning:

```tsx
// app/about.tsx
import { View, Text, StyleSheet } from "react-native";

export default function AboutSheet() {
  return (
    <View style={styles.container}>
      {/* Main content */}
      <View style={styles.content}>
        <Text>Sheet Content</Text>
      </View>

      {/* Footer - stays at bottom */}
      <View style={styles.footer}>
        <Text>Footer Content</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  footer: {
    padding: 16,
  },
});
```

### Formsheet with interactive content below

Use `sheetLargestUndimmedDetentIndex` (zero-indexed) to keep content behind the form sheet interactive — e.g. letting users pan a map beneath it. Setting it to `1` allows interaction at the first two detents but dims on the third.

```tsx
// app/_layout.tsx
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="info-sheet"
        options={{
          presentation: "formSheet",
          sheetAllowedDetents: [0.2, 0.5, 1.0],
          sheetLargestUndimmedDetentIndex: 1,
          /* other options */
        }}
      />
    </Stack>
  )
}
```

## Key Options

| Option                | Type       | Description                                                 |
| --------------------- | ---------- | ----------------------------------------------------------- |
| `presentation`        | `string`   | Set to `'formSheet'` for sheet presentation                 |
| `sheetGrabberVisible` | `boolean`  | Shows the drag handle at the top of the sheet               |
| `sheetAllowedDetents` | `number[]` | Array of detent heights (0-1 range, e.g., `[0.25]` for 25%) |
| `headerTransparent`   | `boolean`  | Makes header background transparent                         |
| `contentStyle`        | `object`   | Style object for the screen content container               |
| `title`               | `string`   | Screen title (set to `''` for no title)                     |

## Common Detent Values

- `[0.25]` - Quarter sheet (compact actions)
- `[0.5]` - Half sheet (medium content)
- `[0.75]` - Three-quarter sheet (detailed forms)
- `[0.25, 0.5, 1]` - Multiple stops (expandable sheet)

## Complete Example

```tsx
// _layout.tsx
import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen
        name="confirm"
        options={{
          contentStyle: { backgroundColor: "transparent" },
          presentation: "formSheet",
          title: "",
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.25],
          headerTransparent: true,
        }}
      >
        <Stack.Header style={{ backgroundColor: "transparent" }}>
          <Stack.Header.Right />
        </Stack.Header>
      </Stack.Screen>
    </Stack>
  );
}
```

```tsx
// app/confirm.tsx
import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";

export default function ConfirmSheet() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Confirm Action</Text>
        <Text style={styles.description}>
          Are you sure you want to proceed?
        </Text>
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <Pressable style={styles.confirmButton} onPress={() => router.back()}>
          <Text style={styles.confirmText}>Confirm</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "500",
  },
  confirmButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#007AFF",
    alignItems: "center",
  },
  confirmText: {
    fontSize: 16,
    fontWeight: "500",
    color: "white",
  },
});
```

## Troubleshooting

### Content not filling sheet

Make sure the root View uses `flex: 1`:

```tsx
<View style={{ flex: 1 }}>{/* content */}</View>
```

### Sheet background showing through

Set `contentStyle: { backgroundColor: 'transparent' }` in options and style your content container with the desired background color instead.

## Source Reference: references / gradients.md

# CSS Gradients

> **New Architecture Only**: CSS gradients require React Native's New Architecture (Fabric). They are not available in the old architecture or Expo Go.

Use CSS gradients with the `experimental_backgroundImage` style property.

## Linear Gradients

```tsx
// Top to bottom
<View style={{
  experimental_backgroundImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 100%)'
}} />

// Left to right
<View style={{
  experimental_backgroundImage: 'linear-gradient(to right, #ff0000 0%, #0000ff 100%)'
}} />

// Diagonal
<View style={{
  experimental_backgroundImage: 'linear-gradient(45deg, #ff0000 0%, #00ff00 50%, #0000ff 100%)'
}} />

// Using degrees
<View style={{
  experimental_backgroundImage: 'linear-gradient(135deg, transparent 0%, black 100%)'
}} />
```

## Radial Gradients

```tsx
// Circle at center
<View style={{
  experimental_backgroundImage: 'radial-gradient(circle at center, rgba(255, 0, 0, 1) 0%, rgba(0, 0, 255, 1) 100%)'
}} />

// Ellipse
<View style={{
  experimental_backgroundImage: 'radial-gradient(ellipse at center, #fff 0%, #000 100%)'
}} />

// Positioned
<View style={{
  experimental_backgroundImage: 'radial-gradient(circle at top left, #ff0000 0%, transparent 70%)'
}} />
```

## Multiple Gradients

Stack multiple gradients by comma-separating them:

```tsx
<View style={{
  experimental_backgroundImage: `
    linear-gradient(to bottom, transparent 0%, black 100%),
    radial-gradient(circle at top right, rgba(255, 0, 0, 0.5) 0%, transparent 50%)
  `
}} />
```

## Common Patterns

### Overlay on Image

```tsx
<View style={{ position: 'relative' }}>
  <Image source={{ uri: '...' }} style={{ width: '100%', height: 200 }} />
  <View style={{
    position: 'absolute',
    inset: 0,
    experimental_backgroundImage: 'linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, transparent 50%)'
  }} />
</View>
```

### Frosted Glass Effect

```tsx
<View style={{
  experimental_backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
  backdropFilter: 'blur(10px)',
}} />
```

### Button Gradient

```tsx
<Pressable style={{
  experimental_backgroundImage: 'linear-gradient(to bottom, #4CAF50 0%, #388E3C 100%)',
  padding: 16,
  borderRadius: 8,
}}>
  <Text style={{ color: 'white', textAlign: 'center' }}>Submit</Text>
</Pressable>
```

## Important Notes

- Do NOT use `expo-linear-gradient` — use CSS gradients instead
- Gradients are strings, not objects
- Use `rgba()` for transparency, or `transparent` keyword
- Color stops use percentages (0%, 50%, 100%)
- Direction keywords: `to top`, `to bottom`, `to left`, `to right`, `to top left`, etc.
- Degree values: `45deg`, `90deg`, `135deg`, etc.

## Source Reference: references / icons.md

# Icons (SF Symbols)

Use SF Symbols for native feel. Never use FontAwesome or Ionicons.

## Basic Usage

```tsx
import { SymbolView } from "expo-symbols";
import { PlatformColor } from "react-native";

<SymbolView
  tintColor={PlatformColor("label")}
  resizeMode="scaleAspectFit"
  name="square.and.arrow.down"
  style={{ width: 16, height: 16 }}
/>;
```

## Props

```tsx
<SymbolView
  name="star.fill"                    // SF Symbol name (required)
  tintColor={PlatformColor("label")}  // Icon color
  size={24}                           // Shorthand for width/height
  resizeMode="scaleAspectFit"         // How to scale
  weight="regular"                    // thin | ultraLight | light | regular | medium | semibold | bold | heavy | black
  scale="medium"                      // small | medium | large
  style={{ width: 16, height: 16 }}   // Standard style props
/>
```

## Common Icons

### Navigation & Actions
- `house.fill` - home
- `gear` - settings
- `magnifyingglass` - search
- `plus` - add
- `xmark` - close
- `chevron.left` - back
- `chevron.right` - forward
- `arrow.left` - back arrow
- `arrow.right` - forward arrow

### Media
- `play.fill` - play
- `pause.fill` - pause
- `stop.fill` - stop
- `backward.fill` - rewind
- `forward.fill` - fast forward
- `speaker.wave.2.fill` - volume
- `speaker.slash.fill` - mute

### Camera
- `camera` - camera
- `camera.fill` - camera filled
- `arrow.triangle.2.circlepath` - flip camera
- `photo` - gallery/photos
- `bolt` - flash
- `bolt.slash` - flash off

### Communication
- `message` - message
- `message.fill` - message filled
- `envelope` - email
- `envelope.fill` - email filled
- `phone` - phone
- `phone.fill` - phone filled
- `video` - video call
- `video.fill` - video call filled

### Social
- `heart` - like
- `heart.fill` - liked
- `star` - favorite
- `star.fill` - favorited
- `hand.thumbsup` - thumbs up
- `hand.thumbsdown` - thumbs down
- `person` - profile
- `person.fill` - profile filled
- `person.2` - people
- `person.2.fill` - people filled

### Content Actions
- `square.and.arrow.up` - share
- `square.and.arrow.down` - download
- `doc.on.doc` - copy
- `trash` - delete
- `pencil` - edit
- `folder` - folder
- `folder.fill` - folder filled
- `bookmark` - bookmark
- `bookmark.fill` - bookmarked

### Status & Feedback
- `checkmark` - success/done
- `checkmark.circle.fill` - completed
- `xmark.circle.fill` - error/failed
- `exclamationmark.triangle` - warning
- `info.circle` - info
- `questionmark.circle` - help
- `bell` - notification
- `bell.fill` - notification filled

### Misc
- `ellipsis` - more options
- `ellipsis.circle` - more in circle
- `line.3.horizontal` - menu/hamburger
- `slider.horizontal.3` - filters
- `arrow.clockwise` - refresh
- `location` - location
- `location.fill` - location filled
- `map` - map
- `mappin` - pin
- `clock` - time
- `calendar` - calendar
- `link` - link
- `nosign` - block/prohibited

## Animated Symbols

```tsx
<SymbolView
  name="checkmark.circle"
  animationSpec={{
    effect: {
      type: "bounce",
      direction: "up",
    },
  }}
/>
```

### Animation Effects

- `bounce` - Bouncy animation
- `pulse` - Pulsing effect
- `variableColor` - Color cycling
- `scale` - Scale animation

```tsx
// Bounce with direction
animationSpec={{
  effect: { type: "bounce", direction: "up" }  // up | down
}}

// Pulse
animationSpec={{
  effect: { type: "pulse" }
}}

// Variable color (multicolor symbols)
animationSpec={{
  effect: {
    type: "variableColor",
    cumulative: true,
    reversing: true
  }
}}
```

## Symbol Weights

```tsx
// Lighter weights
<SymbolView name="star" weight="ultraLight" />
<SymbolView name="star" weight="thin" />
<SymbolView name="star" weight="light" />

// Default
<SymbolView name="star" weight="regular" />

// Heavier weights
<SymbolView name="star" weight="medium" />
<SymbolView name="star" weight="semibold" />
<SymbolView name="star" weight="bold" />
<SymbolView name="star" weight="heavy" />
<SymbolView name="star" weight="black" />
```

## Symbol Scales

```tsx
<SymbolView name="star" scale="small" />
<SymbolView name="star" scale="medium" />  // default
<SymbolView name="star" scale="large" />
```

## Multicolor Symbols

Some symbols support multiple colors:

```tsx
<SymbolView
  name="cloud.sun.rain.fill"
  type="multicolor"
/>
```

## Finding Symbol Names

1. Use the SF Symbols app on macOS (free from Apple)
2. Search at https://developer.apple.com/sf-symbols/
3. Symbol names use dot notation: `square.and.arrow.up`

## Best Practices

- Always use SF Symbols over vector icon libraries
- Match symbol weight to nearby text weight
- Use `.fill` variants for selected/active states
- Use PlatformColor for tint to support dark mode
- Keep icons at consistent sizes (16, 20, 24, 32)

## Source Reference: references / media.md

# Media

## Camera

- Hide navigation headers when there's a full screen camera
- Ensure to flip the camera with `mirror` to emulate social apps
- Use liquid glass buttons on cameras
- Icons: `arrow.triangle.2.circlepath` (flip), `photo` (gallery), `bolt` (flash)
- Eagerly request camera permission
- Lazily request media library permission

```tsx
import React, { useRef, useState } from "react";
import { View, TouchableOpacity, Text, Alert } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { SymbolView } from "expo-symbols";
import { PlatformColor } from "react-native";
import { GlassView } from "expo-glass-effect";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function Camera({ onPicture }: { onPicture: (uri: string) => Promise<void> }) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [type, setType] = useState<CameraType>("back");
  const { bottom } = useSafeAreaInsets();

  if (!permission?.granted) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: PlatformColor("systemBackground") }}>
        <Text style={{ color: PlatformColor("label"), padding: 16 }}>Camera access is required</Text>
        <GlassView isInteractive tintColor={PlatformColor("systemBlue")} style={{ borderRadius: 12 }}>
          <TouchableOpacity onPress={requestPermission} style={{ padding: 12, borderRadius: 12 }}>
            <Text style={{ color: "white" }}>Grant Permission</Text>
          </TouchableOpacity>
        </GlassView>
      </View>
    );
  }

  const takePhoto = async () => {
    await Haptics.selectionAsync();
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
    await onPicture(photo.uri);
  };

  const selectPhoto = async () => {
    await Haptics.selectionAsync();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      await onPicture(result.assets[0].uri);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <CameraView ref={cameraRef} mirror style={{ flex: 1 }} facing={type} />
      <View style={{ position: "absolute", left: 0, right: 0, bottom: bottom, gap: 16, alignItems: "center" }}>
        <GlassView isInteractive style={{ padding: 8, borderRadius: 99 }}>
          <TouchableOpacity onPress={takePhoto} style={{ width: 64, height: 64, borderRadius: 99, backgroundColor: "white" }} />
        </GlassView>
        <View style={{ flexDirection: "row", justifyContent: "space-around", paddingHorizontal: 8 }}>
          <GlassButton onPress={selectPhoto} icon="photo" />
          <GlassButton onPress={() => setType(t => t === "back" ? "front" : "back")} icon="arrow.triangle.2.circlepath" />
        </View>
      </View>
    </View>
  );
}
```

## Audio Playback

Use `expo-audio` not `expo-av`:

```tsx
import { useAudioPlayer } from 'expo-audio';

const player = useAudioPlayer({ uri: 'https://stream.nightride.fm/rektory.mp3' });

<Button title="Play" onPress={() => player.play()} />
```

## Audio Recording (Microphone)

```tsx
import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorderState,
} from 'expo-audio';
import { useEffect } from 'react';
import { Alert, Button } from 'react-native';

function App() {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const record = async () => {
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
  };

  const stop = () => audioRecorder.stop();

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (status.granted) {
        setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      } else {
        Alert.alert('Permission to access microphone was denied');
      }
    })();
  }, []);

  return (
    <Button
      title={recorderState.isRecording ? 'Stop' : 'Start'}
      onPress={recorderState.isRecording ? stop : record}
    />
  );
}
```

## Video Playback

Use `expo-video` not `expo-av`:

```tsx
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from 'expo';

const videoSource = 'https://example.com/video.mp4';

const player = useVideoPlayer(videoSource, player => {
  player.loop = true;
  player.play();
});

const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

<VideoView player={player} fullscreenOptions={{}} allowsPictureInPicture />
```

VideoView options:
- `allowsPictureInPicture`: boolean
- `contentFit`: 'contain' | 'cover' | 'fill'
- `nativeControls`: boolean
- `playsInline`: boolean
- `startsPictureInPictureAutomatically`: boolean

## Saving Media

```tsx
import * as MediaLibrary from "expo-media-library";

const { granted } = await MediaLibrary.requestPermissionsAsync();
if (granted) {
  await MediaLibrary.saveToLibraryAsync(uri);
}
```

### Saving Base64 Images

`MediaLibrary.saveToLibraryAsync` only accepts local file paths. Save base64 strings to disk first:

```tsx
import { File, Paths } from "expo-file-system/next";

function base64ToLocalUri(base64: string, filename?: string) {
  if (!filename) {
    const match = base64.match(/^data:(image\/[a-zA-Z]+);base64,/);
    const ext = match ? match[1].split("/")[1] : "jpg";
    filename = `generated-${Date.now()}.${ext}`;
  }

  if (base64.startsWith("data:")) base64 = base64.split(",")[1];
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(new ArrayBuffer(len));
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);

  const f = new File(Paths.cache, filename);
  f.create({ overwrite: true });
  f.write(bytes);
  return f.uri;
}
```

## Source Reference: references / route-structure.md

# Route Structure

## File Conventions

- Routes belong in the `app` directory
- Use `[]` for dynamic routes, e.g. `[id].tsx`
- Routes can never be named `(foo).tsx` - use `(foo)/index.tsx` instead
- Use `(group)` routes to simplify the public URL structure
- NEVER co-locate components, types, or utilities in the app directory - these should be in separate directories like `components/`, `utils/`, etc.
- The app directory should only contain route and `_layout` files; every file should export a default component
- Ensure the app always has a route that matches "/" so the app is never blank
- ALWAYS use `_layout.tsx` files to define stacks

## Dynamic Routes

Use square brackets for dynamic segments:

```
app/
  users/
    [id].tsx        # Matches /users/123, /users/abc
    [id]/
      posts.tsx     # Matches /users/123/posts
```

### Catch-All Routes

Use `[...slug]` for catch-all routes:

```
app/
  docs/
    [...slug].tsx   # Matches /docs/a, /docs/a/b, /docs/a/b/c
```

## Query Parameters

Access query parameters with the `useLocalSearchParams` hook:

```tsx
import { useLocalSearchParams } from "expo-router";

function Page() {
  const { id } = useLocalSearchParams<{ id: string }>();
}
```

For dynamic routes, the parameter name matches the file name:

- `[id].tsx` → `useLocalSearchParams<{ id: string }>()`
- `[slug].tsx` → `useLocalSearchParams<{ slug: string }>()`

## Pathname

Access the current pathname with the `usePathname` hook:

```tsx
import { usePathname } from "expo-router";

function Component() {
  const pathname = usePathname(); // e.g. "/users/123"
}
```

## Group Routes

Use parentheses for groups that don't affect the URL:

```
app/
  (auth)/
    login.tsx       # URL: /login
    register.tsx    # URL: /register
  (main)/
    index.tsx       # URL: /
    settings.tsx    # URL: /settings
```

Groups are useful for:

- Organizing related routes
- Applying different layouts to route groups
- Keeping URLs clean

## Stacks and Tabs Structure

When an app has tabs, the header and title should be set in a Stack that is nested INSIDE each tab. This allows tabs to have their own headers and distinct histories. The root layout should often not have a header.

- Set the 'headerShown' option to false on the tab layout
- Use (group) routes to simplify the public URL structure
- You may need to delete or refactor existing routes to fit this structure

Example structure:

```
app/
  _layout.tsx — <Tabs />
  (home)/
    _layout.tsx — <Stack />
    index.tsx — <ScrollView />
  (settings)/
    _layout.tsx — <Stack />
    index.tsx — <ScrollView />
  (home,settings)/
    info.tsx — <ScrollView /> (shared across tabs)
```

## Array Routes for Multiple Stacks

Use array routes '(index,settings)' to create multiple stacks. This is useful for tabs that need to share screens across stacks.

```
app/
  _layout.tsx — <Tabs />
  (index,settings)/
    _layout.tsx — <Stack />
    index.tsx — <ScrollView />
    settings.tsx — <ScrollView />
```

This requires a specialized layout with explicit anchor routes:

```tsx
// app/(index,settings)/_layout.tsx
import { useMemo } from "react";
import Stack from "expo-router/stack";

export const unstable_settings = {
  index: { anchor: "index" },
  settings: { anchor: "settings" },
};

export default function Layout({ segment }: { segment: string }) {
  const screen = segment.match(/\((.*)\)/)?.[1]!;

  const options = useMemo(() => {
    switch (screen) {
      case "index":
        return { headerRight: () => <></> };
      default:
        return {};
    }
  }, [screen]);

  return (
    <Stack>
      <Stack.Screen name={screen} options={options} />
    </Stack>
  );
}
```

## Complete App Structure Example

```
app/
  _layout.tsx — <NativeTabs />
  (index,search)/
    _layout.tsx — <Stack />
    index.tsx — Main list
    search.tsx — Search view
    i/[id].tsx — Detail page
components/
  theme.tsx
  list.tsx
utils/
  storage.ts
  use-search.ts
```

## Layout Files

Every directory can have a `_layout.tsx` file that wraps all routes in that directory:

```tsx
// app/_layout.tsx
import { Stack } from "expo-router/stack";

export default function RootLayout() {
  return <Stack />;
}
```

```tsx
// app/(tabs)/_layout.tsx
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        <Icon sf="house.fill" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

## Route Settings

Export `unstable_settings` to configure route behavior:

```tsx
export const unstable_settings = {
  anchor: "index",
};
```

- `initialRouteName` was renamed to `anchor` in v4

## Not Found Routes

Create a `+not-found.tsx` file to handle unmatched routes:

```tsx
// app/+not-found.tsx
import { Link } from "expo-router";
import { View, Text } from "react-native";

export default function NotFound() {
  return (
    <View>
      <Text>Page not found</Text>
      <Link href="/">Go home</Link>
    </View>
  );
}
```

## Source Reference: references / search.md

# Search

## Header Search Bar

Add a search bar to the stack header with `headerSearchBarOptions`:

```tsx
<Stack.Screen
  name="index"
  options={{
    headerSearchBarOptions: {
      placeholder: "Search",
      onChangeText: (event) => console.log(event.nativeEvent.text),
    },
  }}
/>
```

### Options

```tsx
headerSearchBarOptions: {
  // Placeholder text
  placeholder: "Search items...",

  // Auto-capitalize behavior
  autoCapitalize: "none",

  // Input type
  inputType: "text", // "text" | "phone" | "number" | "email"

  // Cancel button text (iOS)
  cancelButtonText: "Cancel",

  // Hide when scrolling (iOS)
  hideWhenScrolling: true,

  // Hide navigation bar during search (iOS)
  hideNavigationBar: true,

  // Obscure background during search (iOS)
  obscureBackground: true,

  // Placement
  placement: "automatic", // "automatic" | "inline" | "stacked"

  // Callbacks
  onChangeText: (event) => {},
  onSearchButtonPress: (event) => {},
  onCancelButtonPress: (event) => {},
  onFocus: () => {},
  onBlur: () => {},
}
```

## useSearch Hook

Reusable hook for search state management:

```tsx
import { useEffect, useState } from "react";
import { useNavigation } from "expo-router";

export function useSearch(options: any = {}) {
  const [search, setSearch] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerSearchBarOptions: {
        ...options,
        onChangeText(e: any) {
          setSearch(e.nativeEvent.text);
          options.onChangeText?.(e);
        },
        onSearchButtonPress(e: any) {
          setSearch(e.nativeEvent.text);
          options.onSearchButtonPress?.(e);
        },
        onCancelButtonPress(e: any) {
          setSearch("");
          options.onCancelButtonPress?.(e);
        },
      },
    });
  }, [options, navigation]);

  return search;
}
```

### Usage

```tsx
function SearchScreen() {
  const search = useSearch({ placeholder: "Search items..." });

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <FlatList
      data={filteredItems}
      renderItem={({ item }) => <ItemRow item={item} />}
    />
  );
}
```

## Filtering Patterns

### Simple Text Filter

```tsx
const filtered = items.filter(item =>
  item.name.toLowerCase().includes(search.toLowerCase())
);
```

### Multiple Fields

```tsx
const filtered = items.filter(item => {
  const query = search.toLowerCase();
  return (
    item.name.toLowerCase().includes(query) ||
    item.description.toLowerCase().includes(query) ||
    item.tags.some(tag => tag.toLowerCase().includes(query))
  );
});
```

### Debounced Search

For expensive filtering or API calls:

```tsx
import { useState, useEffect, useMemo } from "react";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

function SearchScreen() {
  const search = useSearch();
  const debouncedSearch = useDebounce(search, 300);

  const filteredItems = useMemo(() =>
    items.filter(item =>
      item.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    ),
    [debouncedSearch]
  );

  return <FlatList data={filteredItems} />;
}
```

## Search with Native Tabs

When using NativeTabs with a search role, the search bar integrates with the tab bar:

```tsx
// app/_layout.tsx
<NativeTabs>
  <NativeTabs.Trigger name="(home)">
    <Label>Home</Label>
    <Icon sf="house.fill" />
  </NativeTabs.Trigger>
  <NativeTabs.Trigger name="(search)" role="search">
    <Label>Search</Label>
  </NativeTabs.Trigger>
</NativeTabs>
```

```tsx
// app/(search)/_layout.tsx
<Stack>
  <Stack.Screen
    name="index"
    options={{
      headerSearchBarOptions: {
        placeholder: "Search...",
        onChangeText: (e) => setSearch(e.nativeEvent.text),
      },
    }}
  />
</Stack>
```

## Empty States

Show appropriate UI when search returns no results:

```tsx
function SearchResults({ search, items }) {
  const filtered = items.filter(/* ... */);

  if (search && filtered.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: PlatformColor("secondaryLabel") }}>
          No results for "{search}"
        </Text>
      </View>
    );
  }

  return <FlatList data={filtered} />;
}
```

## Search Suggestions

Show recent searches or suggestions:

```tsx
function SearchScreen() {
  const search = useSearch();
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  if (!search && recentSearches.length > 0) {
    return (
      <View>
        <Text style={{ color: PlatformColor("secondaryLabel") }}>
          Recent Searches
        </Text>
        {recentSearches.map((term) => (
          <Pressable key={term} onPress={() => /* apply search */}>
            <Text>{term}</Text>
          </Pressable>
        ))}
      </View>
    );
  }

  return <SearchResults search={search} />;
}
```

## Source Reference: references / storage.md

# Storage

## Key-Value Storage

Use the localStorage polyfill for key-value storage. **Never use AsyncStorage**

```tsx
import "expo-sqlite/localStorage/install";

// Simple get/set
localStorage.setItem("key", "value");
localStorage.getItem("key");

// Store objects as JSON
localStorage.setItem("user", JSON.stringify({ name: "John", id: 1 }));
const user = JSON.parse(localStorage.getItem("user") ?? "{}");
```

## When to Use What

| Use Case                                             | Solution                |
| ---------------------------------------------------- | ----------------------- |
| Simple key-value (settings, preferences, small data) | `localStorage` polyfill |
| Large datasets, complex queries, relational data     | Full `expo-sqlite`      |
| Sensitive data (tokens, passwords)                   | `expo-secure-store`     |

## Storage with React State

Create a storage utility with subscriptions for reactive updates:

```tsx
// utils/storage.ts
import "expo-sqlite/localStorage/install";

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  },

  set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
    listeners.get(key)?.forEach((fn) => fn());
  },

  subscribe(key: string, listener: Listener): () => void {
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key)!.add(listener);
    return () => listeners.get(key)?.delete(listener);
  },
};
```

## React Hook for Storage

```tsx
// hooks/use-storage.ts
import { useSyncExternalStore } from "react";
import { storage } from "@/utils/storage";

export function useStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T) => void] {
  const value = useSyncExternalStore(
    (cb) => storage.subscribe(key, cb),
    () => storage.get(key, defaultValue)
  );

  return [value, (newValue: T) => storage.set(key, newValue)];
}
```

Usage:

```tsx
function Settings() {
  const [theme, setTheme] = useStorage("theme", "light");

  return (
    <Switch
      value={theme === "dark"}
      onValueChange={(dark) => setTheme(dark ? "dark" : "light")}
    />
  );
}
```

## Full SQLite for Complex Data

For larger datasets or complex queries, use expo-sqlite directly:

```tsx
import * as SQLite from "expo-sqlite";

const db = await SQLite.openDatabaseAsync("app.db");

// Create table
await db.execAsync(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    location TEXT
  )
`);

// Insert
await db.runAsync("INSERT INTO events (title, date) VALUES (?, ?)", [
  "Meeting",
  "2024-01-15",
]);

// Query
const events = await db.getAllAsync("SELECT * FROM events WHERE date > ?", [
  "2024-01-01",
]);
```

## Source Reference: references / tabs.md

# Native Tabs

Always prefer NativeTabs from 'expo-router/unstable-native-tabs' for the best iOS experience.

**SDK 54+. SDK 55 recommended.**

## SDK Compatibility

| Aspect        | SDK 54                                                  | SDK 55+                                                     |
| ------------- | ------------------------------------------------------- | ----------------------------------------------------------- |
| Import        | `import { NativeTabs, Icon, Label, Badge, VectorIcon }` | `import { NativeTabs }` only                                |
| Icon          | `<Icon sf="house.fill" />`                              | `<NativeTabs.Trigger.Icon sf="house.fill" />`               |
| Label         | `<Label>Home</Label>`                                   | `<NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>` |
| Badge         | `<Badge>9+</Badge>`                                     | `<NativeTabs.Trigger.Badge>9+</NativeTabs.Trigger.Badge>`   |
| Android icons | `drawable` prop                                         | `md` prop (Material Symbols)                                |

All examples below use SDK 55 syntax. For SDK 54, replace `NativeTabs.Trigger.Icon/Label/Badge` with standalone `Icon`, `Label`, `Badge` imports.

## Basic Usage

```tsx
import { NativeTabs } from "expo-router/unstable-native-tabs";

export default function TabLayout() {
  return (
    <NativeTabs minimizeBehavior="onScrollDown">
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Badge>9+</NativeTabs.Trigger.Badge>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Icon sf="gear" md="settings" />
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(search)" role="search">
        <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

## Rules

- You must include a trigger for each tab
- The `NativeTabs.Trigger` 'name' must match the route name, including parentheses (e.g. `<NativeTabs.Trigger name="(search)">`)
- Prefer search tab to be last in the list so it can combine with the search bar
- Use the 'role' prop for common tab types
- Tabs must be static — no dynamic addition/removal at runtime (remounts navigator, loses state)

## Platform Features

Native Tabs use platform-specific tab bar implementations:

- **iOS 26+**: Liquid glass effects with system-native appearance
- **Android**: Material 3 bottom navigation
- Better performance and native feel

## Icon Component

```tsx
// SF Symbol (iOS) + Material Symbol (Android)
<NativeTabs.Trigger.Icon sf="house.fill" md="home" />

// State variants
<NativeTabs.Trigger.Icon sf={{ default: "house", selected: "house.fill" }} md="home" />

// Custom image
<NativeTabs.Trigger.Icon src={require('./icon.png')} />

// Xcode asset catalog — iOS only (SDK 55+)
<NativeTabs.Trigger.Icon xcasset="home-icon" />
<NativeTabs.Trigger.Icon xcasset={{ default: "home-outline", selected: "home-filled" }} />

// Rendering mode — iOS only (SDK 55+)
<NativeTabs.Trigger.Icon src={require('./icon.png')} renderingMode="template" />
<NativeTabs.Trigger.Icon src={require('./gradient.png')} renderingMode="original" />
```

`renderingMode`: `"template"` applies tint color (single-color icons), `"original"` preserves source colors (gradients). Android always uses original.

## Label & Badge

```tsx
// Label
<NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
<NativeTabs.Trigger.Label hidden>Home</NativeTabs.Trigger.Label>  {/* icon-only tab */}

// Badge
<NativeTabs.Trigger.Badge>9+</NativeTabs.Trigger.Badge>
<NativeTabs.Trigger.Badge />  {/* dot indicator */}
```

## iOS 26 Features

### Liquid Glass Tab Bar

The tab bar automatically adopts liquid glass appearance on iOS 26+.

### Minimize on Scroll

```tsx
<NativeTabs minimizeBehavior="onScrollDown">
```

### Search Tab

```tsx
<NativeTabs.Trigger name="(search)" role="search">
  <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
</NativeTabs.Trigger>
```

**Note**: Place search tab last for best UX.

### Role Prop

Use semantic roles for special tab types:

```tsx
<NativeTabs.Trigger name="search" role="search" />
<NativeTabs.Trigger name="favorites" role="favorites" />
<NativeTabs.Trigger name="more" role="more" />
```

Available roles: `search` | `more` | `favorites` | `bookmarks` | `contacts` | `downloads` | `featured` | `history` | `mostRecent` | `mostViewed` | `recents` | `topRated`

## Customization

### Tint Color

```tsx
<NativeTabs tintColor="#007AFF">
```

### Dynamic Colors (iOS)

Use DynamicColorIOS for colors that adapt to liquid glass:

```tsx
import { DynamicColorIOS, Platform } from 'react-native';

const adaptiveBlue = Platform.select({
  ios: DynamicColorIOS({ light: '#007AFF', dark: '#0A84FF' }),
  default: '#007AFF',
});

<NativeTabs tintColor={adaptiveBlue}>
```

## Conditional Tabs

```tsx
<NativeTabs.Trigger name="admin" hidden={!isAdmin}>
  <NativeTabs.Trigger.Label>Admin</NativeTabs.Trigger.Label>
  <NativeTabs.Trigger.Icon sf="shield.fill" md="shield" />
</NativeTabs.Trigger>
```

**Don't hide the tabs when they are visible - toggling visibility remounts the navigator; Do it only during the initial render.**

**Note**: Hidden tabs cannot be navigated to!

## Behavior Options

```tsx
<NativeTabs.Trigger
  name="home"
  disablePopToTop           // Don't pop stack when tapping active tab
  disableScrollToTop        // Don't scroll to top when tapping active tab
  disableAutomaticContentInsets  // Opt out of automatic safe area insets (SDK 55+)
>
```

## Hidden Tab Bar (SDK 55+)

Use `hidden` prop on `NativeTabs` to hide the entire tab bar dynamically:

```tsx
<NativeTabs hidden={isTabBarHidden}>{/* triggers */}</NativeTabs>
```

## Bottom Accessory (SDK 55+)

`NativeTabs.BottomAccessory` renders content above the tab bar (iOS 26+). Uses `usePlacement()` to adapt between `'regular'` and `'inline'` layouts.

**Important**: Two instances render simultaneously — store state outside the component (props, context, or external store).

```tsx
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

function MiniPlayer({
  isPlaying,
  onToggle,
}: {
  isPlaying: boolean;
  onToggle: () => void;
}) {
  const placement = NativeTabs.BottomAccessory.usePlacement();
  if (placement === "inline") {
    return (
      <Pressable onPress={onToggle}>
        <SymbolView name={isPlaying ? "pause.fill" : "play.fill"} />
      </Pressable>
    );
  }
  return <View>{/* full player UI */}</View>;
}

export default function TabLayout() {
  const [isPlaying, setIsPlaying] = useState(false);
  return (
    <NativeTabs>
      <NativeTabs.BottomAccessory>
        <MiniPlayer
          isPlaying={isPlaying}
          onToggle={() => setIsPlaying(!isPlaying)}
        />
      </NativeTabs.BottomAccessory>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

## Safe Area Handling (SDK 55+)

SDK 55 handles safe areas automatically:

- **Android**: Content wrapped in SafeAreaView (bottom inset)
- **iOS**: First ScrollView gets automatic `contentInsetAdjustmentBehavior`

To opt out per-tab, use `disableAutomaticContentInsets` and manage manually:

```tsx
<NativeTabs.Trigger name="index" disableAutomaticContentInsets>
  <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
</NativeTabs.Trigger>
```

```tsx
// In the screen
import { SafeAreaView } from "react-native-screens/experimental";

export default function HomeScreen() {
  return (
    <SafeAreaView edges={{ bottom: true }} style={{ flex: 1 }}>
      {/* content */}
    </SafeAreaView>
  );
}
```

## Using Vector Icons

If you must use @expo/vector-icons instead of SF Symbols:

```tsx
import { NativeTabs } from "expo-router/unstable-native-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";

<NativeTabs.Trigger name="home">
  <NativeTabs.Trigger.VectorIcon vector={Ionicons} name="home" />
  <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
</NativeTabs.Trigger>
```

**Prefer SF Symbols + `md` prop over vector icons for native feel.**

If you are using SDK 55 and later **use the md prop to specify Material Symbols used on Android**.

## Structure with Stacks

Native tabs don't render headers. Nest Stacks inside each tab for navigation headers:

```tsx
// app/(tabs)/_layout.tsx
import { NativeTabs } from "expo-router/unstable-native-tabs";

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="(home)">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

// app/(tabs)/(home)/_layout.tsx
import Stack from "expo-router/stack";

export default function HomeStack() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Home", headerLargeTitle: true }}
      />
      <Stack.Screen name="details" options={{ title: "Details" }} />
    </Stack>
  );
}
```

## Custom Web Layout

Use platform-specific files for separate native and web tab layouts:

```
app/
  _layout.tsx          # NativeTabs for iOS/Android
  _layout.web.tsx      # Headless tabs for web (expo-router/ui)
```

Or extract to a component: `components/app-tabs.tsx` + `components/app-tabs.web.tsx`.

## Migration from JS Tabs

### Before (JS Tabs)

```tsx
import { Tabs } from "expo-router";

<Tabs>
  <Tabs.Screen
    name="index"
    options={{
      title: "Home",
      tabBarIcon: ({ color }) => <IconSymbol name="house.fill" color={color} />,
      tabBarBadge: 3,
    }}
  />
</Tabs>;
```

### After (Native Tabs)

```tsx
import { NativeTabs } from "expo-router/unstable-native-tabs";

<NativeTabs>
  <NativeTabs.Trigger name="index">
    <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
    <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
    <NativeTabs.Trigger.Badge>3</NativeTabs.Trigger.Badge>
  </NativeTabs.Trigger>
</NativeTabs>;
```

### Key Differences

| JS Tabs                    | Native Tabs                  |
| -------------------------- | ---------------------------- |
| `<Tabs.Screen>`            | `<NativeTabs.Trigger>`       |
| `options={{ title }}`      | `<NativeTabs.Trigger.Label>` |
| `options={{ tabBarIcon }}` | `<NativeTabs.Trigger.Icon>`  |
| `tabBarBadge` option       | `<NativeTabs.Trigger.Badge>` |
| Props-based API            | Component-based API          |
| Headers built-in           | Nest `<Stack>` for headers   |

## Limitations

- **Android**: Maximum 5 tabs (Material Design constraint)
- **Nesting**: Native tabs cannot nest inside other native tabs
- **Tab bar height**: Cannot be measured programmatically
- **FlatList transparency**: Use `disableTransparentOnScrollEdge` to fix issues
- **Dynamic tabs**: Tabs must be static; changes remount navigator and lose state

## Keyboard Handling (Android)

Configure in app.json:

```json
{
  "expo": {
    "android": {
      "softwareKeyboardLayoutMode": "resize"
    }
  }
}
```

## Common Issues

1. **Icons not showing on Android**: Add `md` prop (SDK 55) or use VectorIcon
2. **Headers missing**: Nest a Stack inside each tab group
3. **Trigger name mismatch**: `name` must match exact route name including parentheses
4. **Badge not visible**: Badge must be a child of Trigger, not a prop
5. **Tab bar transparent on iOS 18 and earlier**: If the screen uses a `ScrollView` or `FlatList`, make sure it is the first opaque child of the screen component. If it needs to be wrapped in another `View`, ensure the wrapper uses `collapsable={false}`. If the screen does not use a `ScrollView` or `FlatList`, set `disableTransparentOnScrollEdge` to `true` in the `NativeTabs.Trigger` options, to make the tab bar opaque.
6. **Scroll to top not working**: Ensure `disableScrollToTop` is not set on the active tab's Trigger and `ScrollView` is the first child of the screen component.
7. **Header buttons flicker when navigating between tabs**: Make sure the app is wrapped in a `ThemeProvider`

```tsx
import {
  ThemeProvider,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";
import { useColorScheme } from "react-native";
import { Stack } from "expo-router";

export default function Layout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack />
    </ThemeProvider>
  );
}
```

If the app only uses a light or dark theme, you can directly pass `DarkTheme` or `DefaultTheme` to `ThemeProvider` without checking the color scheme.

```tsx
import { ThemeProvider, DarkTheme } from "@react-navigation/native";
import { Stack } from "expo-router";

export default function Layout() {
  return (
    <ThemeProvider theme={DarkTheme}>
      <Stack />
    </ThemeProvider>
  );
}
```

## Source Reference: references / toolbar-and-headers.md

# Toolbars and headers

Add native iOS toolbar items to Stack screens. Items can be placed in the header (left/right) or in a bottom toolbar area.

**Important:** iOS only. Available in Expo SDK 55+.

## Notes app example

```tsx
import { Stack } from "expo-router";
import { ScrollView } from "react-native";

export default function FoldersScreen() {
  return (
    <>
      {/* ScrollView must be the first child of the screen */}
      <ScrollView
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Screen content */}
      </ScrollView>
      <Stack.Screen.Title large>Folders</Stack.Screen.Title>
      <Stack.SearchBar placeholder="Search" onChangeText={() => {}} />
      {/* Header toolbar - right side */}
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button icon="folder.badge.plus" onPress={() => {}} />
        <Stack.Toolbar.Button onPress={() => {}}>Edit</Stack.Toolbar.Button>
      </Stack.Toolbar>

      {/* Bottom toolbar */}
      <Stack.Toolbar placement="bottom">
        <Stack.Toolbar.SearchBarSlot />
        <Stack.Toolbar.Button
          icon="square.and.pencil"
          onPress={() => {}}
          separateBackground
        />
      </Stack.Toolbar>
    </>
  );
}
```

## Mail inbox example

```tsx
import { Color, Stack } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

export default function InboxScreen() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  return (
    <>
      <ScrollView
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {/* Screen content */}
      </ScrollView>
      <Stack.Screen options={{ headerTransparent: true }} />
      <Stack.Screen.Title>Inbox</Stack.Screen.Title>
      <Stack.SearchBar placeholder="Search" onChangeText={() => {}} />
      {/* Header toolbar - right side */}
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button onPress={() => {}}>Select</Stack.Toolbar.Button>
        <Stack.Toolbar.Menu icon="ellipsis">
          <Stack.Toolbar.Menu inline>
            <Stack.Toolbar.Menu inline title="Sort By">
              <Stack.Toolbar.MenuAction isOn>
                Categories
              </Stack.Toolbar.MenuAction>
              <Stack.Toolbar.MenuAction>List</Stack.Toolbar.MenuAction>
            </Stack.Toolbar.Menu>
            <Stack.Toolbar.MenuAction icon="info.circle">
              About categories
            </Stack.Toolbar.MenuAction>
          </Stack.Toolbar.Menu>
          <Stack.Toolbar.MenuAction icon="person.circle">
            Show Contact Photos
          </Stack.Toolbar.MenuAction>
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>

      {/* Bottom toolbar */}
      <Stack.Toolbar placement="bottom">
        <Stack.Toolbar.Button
          icon="line.3.horizontal.decrease"
          selected={isFilterOpen}
          onPress={() => setIsFilterOpen((prev) => !prev)}
        />
        <Stack.Toolbar.View hidden={!isFilterOpen}>
          <View style={{ width: 70, height: 32, justifyContent: "center" }}>
            <Text style={{ fontSize: 12, fontWeight: 700 }}>Filter by</Text>
            <Text
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: Color.ios.systemBlue,
              }}
            >
              Unread
            </Text>
          </View>
        </Stack.Toolbar.View>
        <Stack.Toolbar.Spacer />
        <Stack.Toolbar.SearchBarSlot />
        <Stack.Toolbar.Button
          icon="square.and.pencil"
          onPress={() => {}}
          separateBackground
        />
      </Stack.Toolbar>
    </>
  );
}
```

## Placement

- `"left"` - Header left
- `"right"` - Header right
- `"bottom"` (default) - Bottom toolbar

## Components

### Button

- Icon button: `<Stack.Toolbar.Button icon="star.fill" onPress={() => {}} />`
- Text button: `<Stack.Toolbar.Button onPress={() => {}}>Done</Stack.Toolbar.Button>`

**Props:** `icon`, `image`, `onPress`, `disabled`, `hidden`, `variant` (`"plain"` | `"done"` | `"prominent"`), `tintColor`

### Menu

Dropdown menu for grouping actions.

```tsx
<Stack.Toolbar.Menu icon="ellipsis">
  <Stack.Toolbar.Menu inline>
    <Stack.Toolbar.MenuAction>Sort by Recently Added</Stack.Toolbar.MenuAction>
    <Stack.Toolbar.MenuAction isOn>
      Sort by Date Captured
    </Stack.Toolbar.MenuAction>
  </Stack.Toolbar.Menu>
  <Stack.Toolbar.Menu title="Filter">
    <Stack.Toolbar.Menu inline>
      <Stack.Toolbar.MenuAction isOn icon="square.grid.2x2">
        All Items
      </Stack.Toolbar.MenuAction>
    </Stack.Toolbar.Menu>
    <Stack.Toolbar.MenuAction icon="heart">Favorites</Stack.Toolbar.MenuAction>
    <Stack.Toolbar.MenuAction icon="photo">Photos</Stack.Toolbar.MenuAction>
    <Stack.Toolbar.MenuAction icon="video">Videos</Stack.Toolbar.MenuAction>
  </Stack.Toolbar.Menu>
</Stack.Toolbar.Menu>
```

**Menu Props:** All Button props plus `title`, `inline`, `palette`, `elementSize` (`"small"` | `"medium"` | `"large"`)

**MenuAction Props:** `icon`, `onPress`, `isOn`, `destructive`, `disabled`, `subtitle`

When creating a palette with dividers, use `inline` combined with `elementSize="small"`. `palette` will not apply dividers on iOS 26.

### Spacer

```tsx
<Stack.Toolbar.Spacer />           // Bottom toolbar - flexible
<Stack.Toolbar.Spacer width={16} /> // Header - requires explicit width
```

### View

Embed custom React Native components. When adding a custom view make sure that there is only a single child with **explicit width and height**.

```tsx
<Stack.Toolbar.View>
  <View style={{ width: 70, height: 32, justifyContent: "center" }}>
    <Text style={{ fontSize: 12, fontWeight: 700 }}>Filter by</Text>
  </View>
</Stack.Toolbar.View>
```

You can pass custom components to views as well:

```tsx
function CustomFilterView() {
  return (
    <View style={{ width: 70, height: 32, justifyContent: "center" }}>
      <Text style={{ fontSize: 12, fontWeight: 700 }}>Filter by</Text>
    </View>
  );
}
...
<Stack.Toolbar.View>
  <CustomFilterView />
</Stack.Toolbar.View>
```

## Recommendations

- When creating more complex headers, extract them to a single component

```tsx
export default function Page() {
  return (
    <>
      <ScrollView>{/* Screen content */}</ScrollView>
      <InboxHeader />
    </>
  );
}

function InboxHeader() {
  return (
    <>
      <Stack.Screen.Title>Inbox</Stack.Screen.Title>
      <Stack.SearchBar placeholder="Search" onChangeText={() => {}} />
      <Stack.Toolbar placement="right">{/* Toolbar buttons */}</Stack.Toolbar>
    </>
  );
}
```

- When using `Stack.Toolbar`, make sure that all `Stack.Toolbar.*` components are wrapped inside `Stack.Toolbar` component.

This will **not work**:

```tsx
function Buttons() {
  return (
    <>
      <Stack.Toolbar.Button icon="star.fill" onPress={() => {}} />
      <Stack.Toolbar.Button onPress={() => {}}>Done</Stack.Toolbar.Button>
    </>
  );
}

function Page() {
  return (
    <>
      <ScrollView>{/* Screen content */}</ScrollView>
      <Stack.Toolbar placement="right">
        <Buttons /> {/* ❌ This will NOT work */}
      </Stack.Toolbar>
    </>
  );
}
```

This will work:

```tsx
function ToolbarWithButtons() {
  return (
    <Stack.Toolbar>
      <Stack.Toolbar.Button icon="star.fill" onPress={() => {}} />
      <Stack.Toolbar.Button onPress={() => {}}>Done</Stack.Toolbar.Button>
    </Stack.Toolbar>
  );
}

function Page() {
  return (
    <>
      <ScrollView>{/* Screen content */}</ScrollView>
      <ToolbarWithButtons /> {/* ✅ This will work */}
    </>
  );
}
```

## Limitations

- iOS only
- `placement="bottom"` can only be used inside screen components (not in layout files)
- `Stack.Toolbar.Badge` only works with `placement="left"` or `"right"`
- Header Spacers require explicit `width`

## Reference

Docs https://docs.expo.dev/versions/unversioned/sdk/router - read to see the full API.

## Source Reference: references / visual-effects.md

# Visual Effects

## Backdrop Blur

Use `expo-blur` for blur effects. Prefer systemMaterial tints as they adapt to dark mode.

```tsx
import { BlurView } from "expo-blur";

<BlurView tint="systemMaterial" intensity={100} />;
```

### Tint Options

```tsx
// System materials (adapt to dark mode)
<BlurView tint="systemMaterial" />
<BlurView tint="systemThinMaterial" />
<BlurView tint="systemUltraThinMaterial" />
<BlurView tint="systemThickMaterial" />
<BlurView tint="systemChromeMaterial" />

// Basic tints
<BlurView tint="light" />
<BlurView tint="dark" />
<BlurView tint="default" />

// Prominent (more visible)
<BlurView tint="prominent" />

// Extra light/dark
<BlurView tint="extraLight" />
```

### Intensity

Control blur strength with `intensity` (0-100):

```tsx
<BlurView tint="systemMaterial" intensity={50} />  // Subtle
<BlurView tint="systemMaterial" intensity={100} /> // Full
```

### Rounded Corners

BlurView requires `overflow: 'hidden'` to clip rounded corners:

```tsx
<BlurView
  tint="systemMaterial"
  intensity={100}
  style={{
    borderRadius: 16,
    overflow: 'hidden',
  }}
/>
```

### Overlay Pattern

Common pattern for overlaying blur on content:

```tsx
<View style={{ position: 'relative' }}>
  <Image source={{ uri: '...' }} style={{ width: '100%', height: 200 }} />
  <BlurView
    tint="systemUltraThinMaterial"
    intensity={80}
    style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
    }}
  >
    <Text style={{ color: 'white' }}>Caption</Text>
  </BlurView>
</View>
```

## Glass Effects (iOS 26+)

Use `expo-glass-effect` for liquid glass backdrops on iOS 26+.

```tsx
import { GlassView } from "expo-glass-effect";

<GlassView style={{ borderRadius: 16, padding: 16 }}>
  <Text>Content inside glass</Text>
</GlassView>
```

### Interactive Glass

Add `isInteractive` for buttons and pressable glass:

```tsx
import { GlassView } from "expo-glass-effect";
import { SymbolView } from "expo-symbols";
import { PlatformColor } from "react-native";

<GlassView isInteractive style={{ borderRadius: 50 }}>
  <Pressable style={{ padding: 12 }} onPress={handlePress}>
    <SymbolView name="plus" tintColor={PlatformColor("label")} size={36} />
  </Pressable>
</GlassView>
```

### Glass Buttons

Create liquid glass buttons:

```tsx
function GlassButton({ icon, onPress }) {
  return (
    <GlassView isInteractive style={{ borderRadius: 50 }}>
      <Pressable style={{ padding: 12 }} onPress={onPress}>
        <SymbolView name={icon} tintColor={PlatformColor("label")} size={24} />
      </Pressable>
    </GlassView>
  );
}

// Usage
<GlassButton icon="plus" onPress={handleAdd} />
<GlassButton icon="gear" onPress={handleSettings} />
```

### Glass Card

```tsx
<GlassView style={{ borderRadius: 20, padding: 20 }}>
  <Text style={{ fontSize: 18, fontWeight: '600', color: PlatformColor("label") }}>
    Card Title
  </Text>
  <Text style={{ color: PlatformColor("secondaryLabel"), marginTop: 8 }}>
    Card content goes here
  </Text>
</GlassView>
```

### Checking Availability

```tsx
import { isLiquidGlassAvailable } from "expo-glass-effect";

if (isLiquidGlassAvailable()) {
  // Use GlassView
} else {
  // Fallback to BlurView or solid background
}
```

### Fallback Pattern

```tsx
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { BlurView } from "expo-blur";

function AdaptiveGlass({ children, style }) {
  if (isLiquidGlassAvailable()) {
    return <GlassView style={style}>{children}</GlassView>;
  }

  return (
    <BlurView tint="systemMaterial" intensity={80} style={style}>
      {children}
    </BlurView>
  );
}
```

## Sheet with Glass Background

Make sheet backgrounds liquid glass on iOS 26+:

```tsx
<Stack.Screen
  name="sheet"
  options={{
    presentation: "formSheet",
    sheetGrabberVisible: true,
    sheetAllowedDetents: [0.5, 1.0],
    contentStyle: { backgroundColor: "transparent" },
  }}
/>
```

## Best Practices

- Use `systemMaterial` tints for automatic dark mode support
- Always set `overflow: 'hidden'` on BlurView for rounded corners
- Use `isInteractive` on GlassView for buttons and pressables
- Check `isLiquidGlassAvailable()` and provide fallbacks
- Avoid nesting blur views (performance impact)
- Keep blur intensity reasonable (50-100) for readability

## Source Reference: references / webgpu-three.md

# WebGPU & Three.js for Expo

**Use this skill for ANY 3D graphics, games, GPU compute, or Three.js features in React Native.**

## Locked Versions (Tested & Working)

```json
{
  "react-native-wgpu": "^0.4.1",
  "three": "0.172.0",
  "@react-three/fiber": "^9.4.0",
  "wgpu-matrix": "^3.0.2",
  "@types/three": "0.172.0"
}
```

**Critical:** These versions are tested together. Mismatched versions cause type errors and runtime issues.

## Installation

```bash
npm install react-native-wgpu@^0.4.1 three@0.172.0 @react-three/fiber@^9.4.0 wgpu-matrix@^3.0.2 @types/three@0.172.0 --legacy-peer-deps
```

**Note:** `--legacy-peer-deps` may be required due to peer dependency conflicts with canary Expo versions.

## Metro Configuration

Create `metro.config.js` in project root:

```js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Force 'three' to webgpu build
  if (moduleName.startsWith("three")) {
    moduleName = "three/webgpu";
  }

  // Use standard react-three/fiber instead of React Native version
  if (platform !== "web" && moduleName.startsWith("@react-three/fiber")) {
    return context.resolveRequest(
      {
        ...context,
        unstable_conditionNames: ["module"],
        mainFields: ["module"],
      },
      moduleName,
      platform
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
```

## Required Lib Files

Create these files in `src/lib/`:

### 1. make-webgpu-renderer.ts

```ts
import type { NativeCanvas } from "react-native-wgpu";
import * as THREE from "three/webgpu";

export class ReactNativeCanvas {
  constructor(private canvas: NativeCanvas) {}

  get width() {
    return this.canvas.width;
  }
  get height() {
    return this.canvas.height;
  }
  set width(width: number) {
    this.canvas.width = width;
  }
  set height(height: number) {
    this.canvas.height = height;
  }
  get clientWidth() {
    return this.canvas.width;
  }
  get clientHeight() {
    return this.canvas.height;
  }
  set clientWidth(width: number) {
    this.canvas.width = width;
  }
  set clientHeight(height: number) {
    this.canvas.height = height;
  }

  addEventListener(_type: string, _listener: EventListener) {}
  removeEventListener(_type: string, _listener: EventListener) {}
  dispatchEvent(_event: Event) {}
  setPointerCapture() {}
  releasePointerCapture() {}
}

export const makeWebGPURenderer = (
  context: GPUCanvasContext,
  { antialias = true }: { antialias?: boolean } = {}
) =>
  new THREE.WebGPURenderer({
    antialias,
    // @ts-expect-error
    canvas: new ReactNativeCanvas(context.canvas),
    context,
  });
```

### 2. fiber-canvas.tsx

```tsx
import * as THREE from "three/webgpu";
import React, { useEffect, useRef } from "react";
import type { ReconcilerRoot, RootState } from "@react-three/fiber";
import {
  extend,
  createRoot,
  unmountComponentAtNode,
  events,
} from "@react-three/fiber";
import type { ViewProps } from "react-native";
import { PixelRatio } from "react-native";
import { Canvas, type CanvasRef } from "react-native-wgpu";

import {
  makeWebGPURenderer,
  ReactNativeCanvas,
} from "@/lib/make-webgpu-renderer";

// Extend THREE namespace for R3F - add all components you use
extend({
  AmbientLight: THREE.AmbientLight,
  DirectionalLight: THREE.DirectionalLight,
  PointLight: THREE.PointLight,
  SpotLight: THREE.SpotLight,
  Mesh: THREE.Mesh,
  Group: THREE.Group,
  Points: THREE.Points,
  BoxGeometry: THREE.BoxGeometry,
  SphereGeometry: THREE.SphereGeometry,
  CylinderGeometry: THREE.CylinderGeometry,
  ConeGeometry: THREE.ConeGeometry,
  DodecahedronGeometry: THREE.DodecahedronGeometry,
  BufferGeometry: THREE.BufferGeometry,
  BufferAttribute: THREE.BufferAttribute,
  MeshStandardMaterial: THREE.MeshStandardMaterial,
  MeshBasicMaterial: THREE.MeshBasicMaterial,
  PointsMaterial: THREE.PointsMaterial,
  PerspectiveCamera: THREE.PerspectiveCamera,
  Scene: THREE.Scene,
});

interface FiberCanvasProps {
  children: React.ReactNode;
  style?: ViewProps["style"];
  camera?: THREE.PerspectiveCamera;
  scene?: THREE.Scene;
}

export const FiberCanvas = ({
  children,
  style,
  scene,
  camera,
}: FiberCanvasProps) => {
  const root = useRef<ReconcilerRoot<OffscreenCanvas>>(null!);
  const canvasRef = useRef<CanvasRef>(null);

  useEffect(() => {
    const context = canvasRef.current!.getContext("webgpu")!;
    const renderer = makeWebGPURenderer(context);

    // @ts-expect-error - ReactNativeCanvas wraps native canvas
    const canvas = new ReactNativeCanvas(context.canvas) as HTMLCanvasElement;
    canvas.width = canvas.clientWidth * PixelRatio.get();
    canvas.height = canvas.clientHeight * PixelRatio.get();
    const size = {
      top: 0,
      left: 0,
      width: canvas.clientWidth,
      height: canvas.clientHeight,
    };

    if (!root.current) {
      root.current = createRoot(canvas);
    }
    root.current.configure({
      size,
      events,
      scene,
      camera,
      gl: renderer,
      frameloop: "always",
      dpr: 1,
      onCreated: async (state: RootState) => {
        // @ts-expect-error - WebGPU renderer has init method
        await state.gl.init();
        const renderFrame = state.gl.render.bind(state.gl);
        state.gl.render = (s: THREE.Scene, c: THREE.Camera) => {
          renderFrame(s, c);
          context?.present();
        };
      },
    });
    root.current.render(children);
    return () => {
      if (canvas != null) {
        unmountComponentAtNode(canvas!);
      }
    };
  });

  return <Canvas ref={canvasRef} style={style} />;
};
```

## Basic 3D Scene

```tsx
import * as THREE from "three/webgpu";
import { View } from "react-native";
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { FiberCanvas } from "@/lib/fiber-canvas";

function RotatingBox() {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    ref.current.rotation.x += delta;
    ref.current.rotation.y += delta * 0.5;
  });

  return (
    <mesh ref={ref}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
}

function Scene() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 2, 5);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <RotatingBox />
    </>
  );
}

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <FiberCanvas style={{ flex: 1 }}>
        <Scene />
      </FiberCanvas>
    </View>
  );
}
```

## Lazy Loading (Recommended)

Use React.lazy to code-split Three.js for better loading:

```tsx
import React, { Suspense } from "react";
import { ActivityIndicator, View } from "react-native";

const Scene = React.lazy(() => import("@/components/scene"));

export default function Page() {
  return (
    <View style={{ flex: 1 }}>
      <Suspense fallback={<ActivityIndicator size="large" />}>
        <Scene />
      </Suspense>
    </View>
  );
}
```

## Common Geometries

```tsx
// Box
<mesh>
  <boxGeometry args={[width, height, depth]} />
  <meshStandardMaterial color="red" />
</mesh>

// Sphere
<mesh>
  <sphereGeometry args={[radius, widthSegments, heightSegments]} />
  <meshStandardMaterial color="blue" />
</mesh>

// Cylinder
<mesh>
  <cylinderGeometry args={[radiusTop, radiusBottom, height, segments]} />
  <meshStandardMaterial color="green" />
</mesh>

// Cone
<mesh>
  <coneGeometry args={[radius, height, segments]} />
  <meshStandardMaterial color="yellow" />
</mesh>
```

## Lighting

```tsx
// Ambient (uniform light everywhere)
<ambientLight intensity={0.5} />

// Directional (sun-like)
<directionalLight position={[10, 10, 5]} intensity={1} />

// Point (light bulb)
<pointLight position={[0, 5, 0]} intensity={2} distance={10} />

// Spot (flashlight)
<spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={2} />
```

## Animation with useFrame

```tsx
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three/webgpu";

function AnimatedMesh() {
  const ref = useRef<THREE.Mesh>(null!);

  // Runs every frame - delta is time since last frame
  useFrame((state, delta) => {
    // Rotate
    ref.current.rotation.y += delta;

    // Oscillate position
    ref.current.position.y = Math.sin(state.clock.elapsedTime) * 2;
  });

  return (
    <mesh ref={ref}>
      <boxGeometry />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}
```

## Particle Systems

```tsx
import * as THREE from "three/webgpu";
import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";

function Particles({ count = 500 }) {
  const ref = useRef<THREE.Points>(null!);
  const positions = useRef<Float32Array>(new Float32Array(count * 3));

  useEffect(() => {
    for (let i = 0; i < count; i++) {
      positions.current[i * 3] = (Math.random() - 0.5) * 50;
      positions.current[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions.current[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
  }, [count]);

  useFrame((_, delta) => {
    // Animate particles
    for (let i = 0; i < count; i++) {
      positions.current[i * 3 + 1] -= delta * 2;
      if (positions.current[i * 3 + 1] < -25) {
        positions.current[i * 3 + 1] = 25;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions.current, 3]}
        />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.2} sizeAttenuation />
    </points>
  );
}
```

## Touch Controls (Orbit)

See the full `orbit-controls.tsx` implementation in the lib files. Usage:

```tsx
import { View } from "react-native";
import { FiberCanvas } from "@/lib/fiber-canvas";
import useControls from "@/lib/orbit-controls";

function Scene() {
  const [OrbitControls, events] = useControls();

  return (
    <View style={{ flex: 1 }} {...events}>
      <FiberCanvas style={{ flex: 1 }}>
        <OrbitControls />
        {/* Your 3D content */}
      </FiberCanvas>
    </View>
  );
}
```

## Common Issues & Solutions

### 1. "X is not part of the THREE namespace"

**Problem:** Error like `AmbientLight is not part of the THREE namespace`

**Solution:** Add the missing component to the `extend()` call in fiber-canvas.tsx:

```tsx
extend({
  AmbientLight: THREE.AmbientLight,
  // Add other missing components...
});
```

### 2. TypeScript Errors with Three.js

**Problem:** Type mismatches between three.js and R3F

**Solution:** Use `@ts-expect-error` comments where needed:

```tsx
// @ts-expect-error - WebGPU renderer types don't match
await state.gl.init();
```

### 3. Blank Screen

**Problem:** Canvas renders but nothing visible

**Solution:**

1. Ensure camera is positioned correctly and looking at scene
2. Add lighting (objects are black without light)
3. Check that `extend()` includes all components used

### 4. Performance Issues

**Problem:** Low frame rate or stuttering

**Solution:**

- Reduce polygon count in geometries
- Use `useMemo` for static data
- Limit particle count
- Use `instancedMesh` for many identical objects

### 5. Peer Dependency Errors

**Problem:** npm install fails with ERESOLVE

**Solution:** Use `--legacy-peer-deps`:

```bash
npm install <packages> --legacy-peer-deps
```

## Building

WebGPU requires a custom build:

```bash
npx expo prebuild
npx expo run:ios
```

**Note:** WebGPU does NOT work in Expo Go.

## File Structure

```
src/
├── app/
│   └── index.tsx           # Entry point with lazy loading
├── components/
│   ├── scene.tsx           # Main 3D scene
│   └── game.tsx            # Game logic
└── lib/
    ├── fiber-canvas.tsx    # R3F canvas wrapper
    ├── make-webgpu-renderer.ts  # WebGPU renderer
    └── orbit-controls.tsx  # Touch controls
```

## Decision Tree

```
Need 3D graphics?
├── Simple shapes → mesh + geometry + material
├── Animated objects → useFrame + refs
├── Many objects → instancedMesh
├── Particles → Points + BufferGeometry
│
Need interaction?
├── Orbit camera → useControls hook
├── Touch objects → onClick on mesh
├── Gestures → react-native-gesture-handler
│
Performance critical?
├── Static geometry → useMemo
├── Many instances → InstancedMesh
└── Complex scenes → LOD (Level of Detail)
```

## Example: Complete Game Scene

```tsx
import * as THREE from "three/webgpu";
import { View, Text, Pressable } from "react-native";
import { useRef, useState, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { FiberCanvas } from "@/lib/fiber-canvas";

function Player({ position }: { position: THREE.Vector3 }) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    ref.current.position.copy(position);
  });

  return (
    <mesh ref={ref}>
      <coneGeometry args={[0.5, 1, 8]} />
      <meshStandardMaterial color="#00ffff" />
    </mesh>
  );
}

function GameScene({ playerX }: { playerX: number }) {
  const { camera } = useThree();
  const playerPos = useRef(new THREE.Vector3(0, 0, 0));

  playerPos.current.x = playerX;

  useEffect(() => {
    camera.position.set(0, 10, 15);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} />
      <Player position={playerPos.current} />
    </>
  );
}

export default function Game() {
  const [playerX, setPlayerX] = useState(0);

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <FiberCanvas style={{ flex: 1 }}>
        <GameScene playerX={playerX} />
      </FiberCanvas>

      <View style={{ position: "absolute", bottom: 40, flexDirection: "row" }}>
        <Pressable onPress={() => setPlayerX((x) => x - 1)}>
          <Text style={{ color: "#fff", fontSize: 32 }}>◀</Text>
        </Pressable>
        <Pressable onPress={() => setPlayerX((x) => x + 1)}>
          <Text style={{ color: "#fff", fontSize: 32 }}>▶</Text>
        </Pressable>
      </View>
    </View>
  );
}
```

## Source Reference: references / zoom-transitions.md

# Apple Zoom Transitions

Fluid zoom transitions for navigating between screens. iOS 18+, Expo SDK 55+, Stack navigator only.

```tsx
import { Link } from "expo-router";
```

## Basic Zoom

Use `withAppleZoom` on `Link.Trigger` to zoom the entire trigger element into the destination screen:

```tsx
<Link href="/photo" asChild>
  <Link.Trigger withAppleZoom>
    <Pressable>
      <Image
        source={{ uri: "https://example.com/thumb.jpg" }}
        style={{ width: 120, height: 120, borderRadius: 12 }}
      />
    </Pressable>
  </Link.Trigger>
</Link>
```

## Targeted Zoom with `Link.AppleZoom`

Wrap only the element that should animate. Siblings outside `Link.AppleZoom` are not part of the transition:

```tsx
<Link href="/photo" asChild>
  <Link.Trigger>
    <Pressable style={{ alignItems: "center" }}>
      <Link.AppleZoom>
        <Image
          source={{ uri: "https://example.com/thumb.jpg" }}
          style={{ width: 200, aspectRatio: 4 / 3 }}
        />
      </Link.AppleZoom>
      <Text>Caption text (not zoomed)</Text>
    </Pressable>
  </Link.Trigger>
</Link>
```

`Link.AppleZoom` accepts only a single child element.

## Destination Target

Use `Link.AppleZoomTarget` on the destination screen to align the zoom animation to a specific element:

```tsx
// Destination screen (e.g., app/photo.tsx)
import { Link } from "expo-router";

export default function PhotoScreen() {
  return (
    <View style={{ flex: 1 }}>
      <Link.AppleZoomTarget>
        <Image
          source={{ uri: "https://example.com/full.jpg" }}
          style={{ width: "100%", aspectRatio: 4 / 3 }}
        />
      </Link.AppleZoomTarget>
      <Text>Photo details below</Text>
    </View>
  );
}
```

Without a target, the zoom animates to fill the entire destination screen.

## Custom Alignment Rectangle

For manual control over where the zoom lands on the destination, use `alignmentRect` instead of `Link.AppleZoomTarget`:

```tsx
<Link.AppleZoom alignmentRect={{ x: 0, y: 0, width: 200, height: 300 }}>
  <Image source={{ uri: "https://example.com/thumb.jpg" }} />
</Link.AppleZoom>
```

Coordinates are in the destination screen's coordinate space. Prefer `Link.AppleZoomTarget` when possible — use `alignmentRect` only when the target element isn't available as a React component.

## Controlling Dismissal

Zoom screens support interactive dismissal gestures by default (pinch, swipe down when scrolled to top, swipe from leading edge). Use `usePreventZoomTransitionDismissal` on the destination screen to control this.

### Disable all dismissal gestures

```tsx
import { usePreventZoomTransitionDismissal } from "expo-router";

export default function PhotoScreen() {
  usePreventZoomTransitionDismissal();
  return <Image source={{ uri: "https://example.com/full.jpg" }} />;
}
```

### Restrict dismissal to a specific area

Use `unstable_dismissalBoundsRect` to prevent conflicts with scrollable content:

```tsx
usePreventZoomTransitionDismissal({
  unstable_dismissalBoundsRect: {
    minX: 0,
    minY: 0,
    maxX: 300,
    maxY: 300,
  },
});
```

This is useful when the destination contains a zoomable scroll view — the system gives that scroll view precedence over the dismiss gesture.

## Combining with Link.Preview

Zoom transitions work alongside long-press previews:

```tsx
<Link href="/photo" asChild>
  <Link.Trigger withAppleZoom>
    <Pressable>
      <Image
        source={{ uri: "https://example.com/thumb.jpg" }}
        style={{ width: 120, height: 120 }}
      />
    </Pressable>
  </Link.Trigger>
  <Link.Preview />
</Link>
```

## Best Practices

**Good use cases:**
- Thumbnail → full image (gallery, profile photos)
- Card → detail screen with similar visual content
- Source and destination with similar aspect ratios

**Avoid:**
- Skinny full-width list rows as zoom sources — the transition looks unnatural
- Mismatched aspect ratios between source and destination without `alignmentRect`
- Using zoom with sheets or popovers — only works in Stack navigator
- Hiding the navigation bar — known issues with header visibility during transitions

**Tips:**
- Always provide a close or back button — dismissal gestures are not discoverable
- If the destination has a zoomable scroll view, use `unstable_dismissalBoundsRect` to avoid gesture conflicts
- Source view doesn't need to match the tap target — only the `Link.AppleZoom` wrapped element animates
- When source is unavailable (e.g., scrolled off screen), the transition zooms from the center of the screen

## References

- Expo Router Zoom Transitions: https://docs.expo.dev/router/advanced/zoom-transition/
- Link.AppleZoom API: https://docs.expo.dev/versions/v55.0.0/sdk/router/#linkapplezoom
- Apple UIKit Fluid Transitions: https://developer.apple.com/documentation/uikit/enhancing-your-app-with-fluid-transitions

