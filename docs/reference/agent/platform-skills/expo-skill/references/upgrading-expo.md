# upgrading-expo

Source: https://github.com/expo/skills/tree/main/plugins/expo/skills/upgrading-expo

## Source SKILL.md

---
name: upgrading-expo
description: Guidelines for upgrading Expo SDK versions and fixing dependency issues
version: 1.0.0
license: MIT
---

## References

- ./references/new-architecture.md -- SDK +53: New Architecture migration guide
- ./references/react-19.md -- SDK +54: React 19 changes (useContext → use, Context.Provider → Context, forwardRef removal)
- ./references/react-compiler.md -- SDK +54: React Compiler setup and migration guide
- ./references/native-tabs.md -- SDK +55: Native tabs changes (Icon/Label/Badge now accessed via NativeTabs.Trigger.\*)
- ./references/expo-av-to-audio.md -- Migrate audio playback and recording from expo-av to expo-audio
- ./references/expo-av-to-video.md -- Migrate video playback from expo-av to expo-video

## Beta/Preview Releases

Beta versions use `.preview` suffix (e.g., `55.0.0-preview.2`), published under `@next` tag.

Check if latest is beta: https://exp.host/--/api/v2/versions (look for `-preview` in `expoVersion`)

```bash
npx expo install expo@next --fix  # install beta
```

## Step-by-Step Upgrade Process

1. Upgrade Expo and dependencies

```bash
npx expo install expo@latest
npx expo install --fix
```

2. Run diagnostics: `npx expo-doctor`

3. Clear caches and reinstall

```bash
npx expo export -p ios --clear
rm -rf node_modules .expo
watchman watch-del-all
```

## Breaking Changes Checklist

- Check for removed APIs in release notes
- Update import paths for moved modules
- Review native module changes requiring prebuild
- Test all camera, audio, and video features
- Verify navigation still works correctly

## Prebuild for Native Changes

**First check if `ios/` and `android/` directories exist in the project.** If neither directory exists, the project uses Continuous Native Generation (CNG) and native projects are regenerated at build time — skip this section and "Clear caches for bare workflow" entirely.

If upgrading requires native changes:

```bash
npx expo prebuild --clean
```

This regenerates the `ios` and `android` directories. Ensure the project is not a bare workflow app before running this command.

## Clear caches for bare workflow

These steps only apply when `ios/` and/or `android/` directories exist in the project:

- Clear the cocoapods cache for iOS: `cd ios && pod install --repo-update`
- Clear derived data for Xcode: `npx expo run:ios --no-build-cache`
- Clear the Gradle cache for Android: `cd android && ./gradlew clean`

## Housekeeping

- Review release notes for the target SDK version at https://expo.dev/changelog
- If using Expo SDK 54 or later, ensure react-native-worklets is installed — this is required for react-native-reanimated to work.
- Enable React Compiler in SDK 54+ by adding `"experiments": { "reactCompiler": true }` to app.json — it's stable and recommended
- Delete sdkVersion from `app.json` to let Expo manage it automatically
- Remove implicit packages from `package.json`: `@babel/core`, `babel-preset-expo`, `expo-constants`.
- If the babel.config.js only contains 'babel-preset-expo', delete the file
- If the metro.config.js only contains expo defaults, delete the file

## Deprecated Packages

| Old Package          | Replacement                                          |
| -------------------- | ---------------------------------------------------- |
| `expo-av`            | `expo-audio` and `expo-video`                        |
| `expo-permissions`   | Individual package permission APIs                   |
| `@expo/vector-icons` | `expo-symbols` (for SF Symbols)                      |
| `AsyncStorage`       | `expo-sqlite/localStorage/install`                   |
| `expo-app-loading`   | `expo-splash-screen`                                 |
| expo-linear-gradient | experimental_backgroundImage + CSS gradients in View |

When migrating deprecated packages, update all code usage before removing the old package. For expo-av, consult the migration references to convert Audio.Sound to useAudioPlayer, Audio.Recording to useAudioRecorder, and Video components to VideoView with useVideoPlayer.

## expo.install.exclude

Check if package.json has excluded packages:

```json
{
  "expo": { "install": { "exclude": ["react-native-reanimated"] } }
}
```

Exclusions are often workarounds that may no longer be needed after upgrading. Review each one.
## Removing patches

Check if there are any outdated patches in the `patches/` directory. Remove them if they are no longer needed.

## Postcss

- `autoprefixer` isn't needed in SDK +53. Remove it from dependencies and check `postcss.config.js` or `postcss.config.mjs` to remove it from the plugins list.
- Use `postcss.config.mjs` in SDK +53.

## Metro

Remove redundant metro config options:

- resolver.unstable_enablePackageExports is enabled by default in SDK +53.
- `experimentalImportSupport` is enabled by default in SDK +54.
- `EXPO_USE_FAST_RESOLVER=1` is removed in SDK +54.
- cjs and mjs extensions are supported by default in SDK +50.
- Expo webpack is deprecated, migrate to [Expo Router and Metro web](https://docs.expo.dev/router/migrate/from-expo-webpack/).

## Hermes engine v1

Since SDK 55, users can opt-in to use Hermes engine v1 for improved runtime performance. This requires setting `useHermesV1: true` in the `expo-build-properties` config plugin, and may require a specific version of the `hermes-compiler` npm package. Hermes v1 will become a default in some future SDK release.

## New Architecture

The new architecture is enabled by default, the app.json field `"newArchEnabled": true` is no longer needed as it's the default. Expo Go only supports the new architecture as of SDK +53.

## Source Reference: references / expo-av-to-audio.md

# Migrating from expo-av to expo-audio

## Imports

```tsx
// Before
import { Audio } from 'expo-av';

// After
import { useAudioPlayer, useAudioRecorder, RecordingPresets, AudioModule, setAudioModeAsync } from 'expo-audio';
```

## Audio Playback

### Before (expo-av)

```tsx
const [sound, setSound] = useState<Audio.Sound>();

async function playSound() {
  const { sound } = await Audio.Sound.createAsync(require('./audio.mp3'));
  setSound(sound);
  await sound.playAsync();
}

useEffect(() => {
  return sound ? () => { sound.unloadAsync(); } : undefined;
}, [sound]);
```

### After (expo-audio)

```tsx
const player = useAudioPlayer(require('./audio.mp3'));

// Play
player.play();
```

## Audio Recording

### Before (expo-av)

```tsx
const [recording, setRecording] = useState<Audio.Recording>();

async function startRecording() {
  await Audio.requestPermissionsAsync();
  await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
  const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
  setRecording(recording);
}

async function stopRecording() {
  await recording?.stopAndUnloadAsync();
  const uri = recording?.getURI();
}
```

### After (expo-audio)

```tsx
const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

async function startRecording() {
  await AudioModule.requestRecordingPermissionsAsync();
  await recorder.prepareToRecordAsync();
  recorder.record();
}

async function stopRecording() {
  await recorder.stop();
  const uri = recorder.uri;
}
```

## Audio Mode

### Before (expo-av)

```tsx
await Audio.setAudioModeAsync({
  allowsRecordingIOS: true,
  playsInSilentModeIOS: true,
  staysActiveInBackground: true,
  interruptionModeIOS: InterruptionModeIOS.DoNotMix,
});
```

### After (expo-audio)

```tsx
await setAudioModeAsync({
  playsInSilentMode: true,
  shouldPlayInBackground: true,
  interruptionMode: 'doNotMix',
});
```

## API Mapping

| expo-av | expo-audio |
|---------|------------|
| `Audio.Sound.createAsync()` | `useAudioPlayer(source)` |
| `sound.playAsync()` | `player.play()` |
| `sound.pauseAsync()` | `player.pause()` |
| `sound.setPositionAsync(ms)` | `player.seekTo(seconds)` |
| `sound.setVolumeAsync(vol)` | `player.volume = vol` |
| `sound.setRateAsync(rate)` | `player.playbackRate = rate` |
| `sound.setIsLoopingAsync(loop)` | `player.loop = loop` |
| `sound.unloadAsync()` | Automatic via hook |
| `playbackStatus.positionMillis` | `player.currentTime` (seconds) |
| `playbackStatus.durationMillis` | `player.duration` (seconds) |
| `playbackStatus.isPlaying` | `player.playing` |
| `Audio.Recording.createAsync()` | `useAudioRecorder(preset)` |
| `Audio.RecordingOptionsPresets.*` | `RecordingPresets.*` |
| `recording.stopAndUnloadAsync()` | `recorder.stop()` |
| `recording.getURI()` | `recorder.uri` |
| `Audio.requestPermissionsAsync()` | `AudioModule.requestRecordingPermissionsAsync()` |

## Key Differences

- **No auto-reset on finish**: After `play()` completes, the player stays paused at the end. To replay, call `player.seekTo(0)` then `play()`
- **Time in seconds**: expo-audio uses seconds, not milliseconds (matching web standards)
- **Immediate loading**: Audio loads immediately when the hook mounts—no explicit preloading needed
- **Automatic cleanup**: No need to call `unloadAsync()`, hooks handle resource cleanup on unmount
- **Multiple players**: Create multiple `useAudioPlayer` instances and store them—all load immediately
- **Direct property access**: Set volume, rate, loop directly on the player object (`player.volume = 0.5`)

## API Reference

https://docs.expo.dev/versions/latest/sdk/audio/

## Source Reference: references / expo-av-to-video.md

# Migrating from expo-av to expo-video

## Imports

```tsx
// Before
import { Video, ResizeMode } from 'expo-av';

// After
import { useVideoPlayer, VideoView, VideoSource } from 'expo-video';
import { useEvent, useEventListener } from 'expo';
```

## Video Playback

### Before (expo-av)

```tsx
const videoRef = useRef<Video>(null);
const [status, setStatus] = useState({});

<Video
  ref={videoRef}
  source={{ uri: 'https://example.com/video.mp4' }}
  style={{ width: 350, height: 200 }}
  resizeMode={ResizeMode.CONTAIN}
  isLooping
  onPlaybackStatusUpdate={setStatus}
/>

// Control
videoRef.current?.playAsync();
videoRef.current?.pauseAsync();
```

### After (expo-video)

```tsx
const player = useVideoPlayer('https://example.com/video.mp4', player => {
  player.loop = true;
});

const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

<VideoView
  player={player}
  style={{ width: 350, height: 200 }}
  contentFit="contain"
/>

// Control
player.play();
player.pause();
```

## Status Updates

### Before (expo-av)

```tsx
<Video
  onPlaybackStatusUpdate={status => {
    if (status.isLoaded) {
      console.log(status.positionMillis, status.durationMillis, status.isPlaying);
      if (status.didJustFinish) console.log('finished');
    }
  }}
/>
```

### After (expo-video)

```tsx
// Reactive state
const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

// Side effects
useEventListener(player, 'playToEnd', () => console.log('finished'));

// Direct access
console.log(player.currentTime, player.duration, player.playing);
```

## Local Files

### Before (expo-av)

```tsx
<Video source={require('./video.mp4')} />
```

### After (expo-video)

```tsx
const player = useVideoPlayer({ assetId: require('./video.mp4') });
```

## Fullscreen and PiP

```tsx
<VideoView
  player={player}
  allowsFullscreen
  allowsPictureInPicture
  onFullscreenEnter={() => {}}
  onFullscreenExit={() => {}}
/>
```

For PiP and background playback, add to app.json:

```json
{
  "expo": {
    "plugins": [
      ["expo-video", { "supportsBackgroundPlayback": true, "supportsPictureInPicture": true }]
    ]
  }
}
```

## API Mapping

| expo-av | expo-video |
|---------|------------|
| `<Video>` | `<VideoView>` |
| `ref={videoRef}` | `player={useVideoPlayer()}` |
| `source={{ uri }}` | Pass to `useVideoPlayer(uri)` |
| `resizeMode={ResizeMode.CONTAIN}` | `contentFit="contain"` |
| `isLooping` | `player.loop = true` |
| `shouldPlay` | `player.play()` in setup |
| `isMuted` | `player.muted = true` |
| `useNativeControls` | `nativeControls={true}` |
| `onPlaybackStatusUpdate` | `useEvent` / `useEventListener` |
| `videoRef.current.playAsync()` | `player.play()` |
| `videoRef.current.pauseAsync()` | `player.pause()` |
| `videoRef.current.replayAsync()` | `player.replay()` |
| `videoRef.current.setPositionAsync(ms)` | `player.currentTime = seconds` |
| `status.positionMillis` | `player.currentTime` (seconds) |
| `status.durationMillis` | `player.duration` (seconds) |
| `status.didJustFinish` | `useEventListener(player, 'playToEnd')` |

## Key Differences

- **Separate player and view**: Player logic decoupled from the view—one player can be used across multiple views
- **Time in seconds**: Uses seconds, not milliseconds
- **Event system**: Uses `useEvent`/`useEventListener` from `expo` instead of callback props
- **Video preloading**: Create a player without mounting a VideoView to preload for faster transitions
- **Built-in caching**: Set `useCaching: true` in VideoSource for persistent offline caching

## Known Issues

- **Uninstall expo-av first**: On Android, having both expo-av and expo-video installed can cause VideoView to show a black screen. Uninstall expo-av before installing expo-video
- **Android: Reusing players**: Mounting the same player in multiple VideoViews simultaneously can cause black screens on Android (works on iOS)
- **Android: currentTime in setup**: Setting `player.currentTime` in the `useVideoPlayer` setup callback may not work on Android—set it after mount instead
- **Changing source**: Use `player.replace(newSource)` to change videos without recreating the player

## API Reference

https://docs.expo.dev/versions/latest/sdk/video/

## Source Reference: references / native-tabs.md

# Native Tabs Migration (SDK 55)

In SDK 55, `Label`, `Icon`, `Badge`, and `VectorIcon` are now accessed as static properties on `NativeTabs.Trigger` rather than separate imports.

## Import Changes

```tsx
// SDK 53/54
import {
  NativeTabs,
  Icon,
  Label,
  Badge,
  VectorIcon,
} from "expo-router/unstable-native-tabs";

// SDK 55+
import { NativeTabs } from "expo-router/unstable-native-tabs";
```

## Component Changes

| SDK 53/54        | SDK 55+                             |
| ---------------- | ----------------------------------- |
| `<Icon />`       | `<NativeTabs.Trigger.Icon />`       |
| `<Label />`      | `<NativeTabs.Trigger.Label />`      |
| `<Badge />`      | `<NativeTabs.Trigger.Badge />`      |
| `<VectorIcon />` | `<NativeTabs.Trigger.VectorIcon />` |
| (n/a)            | `<NativeTabs.BottomAccessory />`    |

## New in SDK 55

### BottomAccessory

New component for Apple Music-style mini players on iOS +26 that float above the tab bar:

```tsx
<NativeTabs>
  <NativeTabs.BottomAccessory>
    {/* Content above tabs */}
  </NativeTabs.BottomAccessory>
  <NativeTabs.Trigger name="(index)">
    <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
  </NativeTabs.Trigger>
</NativeTabs>
```

On Android and web, this component will render as a no-op. Position a view absolutely above the tab bar instead.

### Icon `md` Prop

New `md` prop for Material icon glyphs on Android (alongside existing `drawable`):

```tsx
<NativeTabs.Trigger.Icon sf="house" md="home" />
```

## Full Migration Example

### Before (SDK 53/54)

```tsx
import {
  NativeTabs,
  Icon,
  Label,
  Badge,
} from "expo-router/unstable-native-tabs";

export default function TabLayout() {
  return (
    <NativeTabs minimizeBehavior="onScrollDown">
      <NativeTabs.Trigger name="(index)">
        <Label>Home</Label>
        <Icon sf="house.fill" />
        <Badge>3</Badge>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(settings)">
        <Label>Settings</Label>
        <Icon sf="gear" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(search)" role="search">
        <Label>Search</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

### After (SDK 55+)

```tsx
import { NativeTabs } from "expo-router/unstable-native-tabs";

export default function TabLayout() {
  return (
    <NativeTabs minimizeBehavior="onScrollDown">
      <NativeTabs.Trigger name="(index)">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
        <NativeTabs.Trigger.Badge>3</NativeTabs.Trigger.Badge>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(settings)">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="gear" md="settings" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(search)" role="search">
        <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

## Migration Checklist

1. Remove `Icon`, `Label`, `Badge`, `VectorIcon` from imports
2. Keep only `NativeTabs` import from `expo-router/unstable-native-tabs`
3. Replace `<Icon />` with `<NativeTabs.Trigger.Icon />`
4. Replace `<Label />` with `<NativeTabs.Trigger.Label />`
5. Replace `<Badge />` with `<NativeTabs.Trigger.Badge />`
6. Replace `<VectorIcon />` with `<NativeTabs.Trigger.VectorIcon />`

- Read docs for more info https://docs.expo.dev/versions/v55.0.0/sdk/router-native-tabs/

## Source Reference: references / new-architecture.md

# New Architecture

The New Architecture is enabled by default in Expo SDK 53+. It replaces the legacy bridge with a faster, synchronous communication layer between JavaScript and native code.

## Documentation

Full guide: https://docs.expo.dev/guides/new-architecture/

## What Changed

- **JSI (JavaScript Interface)** — Direct synchronous calls between JS and native
- **Fabric** — New rendering system with concurrent features
- **TurboModules** — Lazy-loaded native modules with type safety

## SDK Compatibility

| SDK Version | New Architecture Status |
| ----------- | ----------------------- |
| SDK 53+     | Enabled by default      |
| SDK 52      | Opt-in via app.json     |
| SDK 51-     | Experimental            |

## Configuration

New Architecture is enabled by default. To explicitly disable (not recommended):

```json
{
  "expo": {
    "newArchEnabled": false
  }
}
```

## Expo Go

Expo Go only supports the New Architecture as of SDK 53. Apps using the old architecture must use development builds.

## Common Migration Issues

### Native Module Compatibility

Some older native modules may not support the New Architecture. Check:

1. Module documentation for New Architecture support
2. GitHub issues for compatibility discussions
3. Consider alternatives if module is unmaintained

### Reanimated

React Native Reanimated requires `react-native-worklets` in SDK 54+:

```bash
npx expo install react-native-worklets
```

### Layout Animations

Some layout animations behave differently. Test thoroughly after upgrading.

## Verifying New Architecture

Check if New Architecture is active:

```tsx
import { Platform } from "react-native";

// Returns true if Fabric is enabled
const isNewArch = global._IS_FABRIC !== undefined;
```

Verify from the command line if the currently running app uses the New Architecture: `bunx xcobra expo eval "_IS_FABRIC"` -> `true`

## Troubleshooting

1. **Clear caches** — `npx expo start --clear`
2. **Clean prebuild** — `npx expo prebuild --clean`
3. **Check native modules** — Ensure all dependencies support New Architecture
4. **Review console warnings** — Legacy modules log compatibility warnings

## Source Reference: references / react-19.md

# React 19

React 19 is included in Expo SDK 54. This release simplifies several common patterns.

## Context Changes

### useContext → use

The `use` hook replaces `useContext`:

```tsx
// Before (React 18)
import { useContext } from "react";
const value = useContext(MyContext);

// After (React 19)
import { use } from "react";
const value = use(MyContext);
```

- The `use` hook can also read promises, enabling Suspense-based data fetching.
- `use` can be called conditionally, this simplifies components that consume multiple contexts.

### Context.Provider → Context

Context providers no longer need the `.Provider` suffix:

```tsx
// Before (React 18)
<ThemeContext.Provider value={theme}>
  {children}
</ThemeContext.Provider>

// After (React 19)
<ThemeContext value={theme}>
  {children}
</ThemeContext>
```

## ref as a Prop

### Removing forwardRef

Components can now receive `ref` as a regular prop. `forwardRef` is no longer needed:

```tsx
// Before (React 18)
import { forwardRef } from "react";

const Input = forwardRef<TextInput, Props>((props, ref) => {
  return <TextInput ref={ref} {...props} />;
});

// After (React 19)
function Input({ ref, ...props }: Props & { ref?: React.Ref<TextInput> }) {
  return <TextInput ref={ref} {...props} />;
}
```

### Migration Steps

1. Remove `forwardRef` wrapper
2. Add `ref` to the props destructuring
3. Update the type to include `ref?: React.Ref<T>`

## Other React 19 Features

- **Actions** — Functions that handle async transitions
- **useOptimistic** — Optimistic UI updates
- **useFormStatus** — Form submission state (web)
- **Document Metadata** — Native `<title>` and `<meta>` support (web)

## Cleanup Checklist

When upgrading to SDK 54:

- [ ] Replace `useContext` with `use`
- [ ] Remove `.Provider` from Context components
- [ ] Remove `forwardRef` wrappers, use `ref` prop instead

## Source Reference: references / react-compiler.md

# React Compiler

React Compiler is stable in Expo SDK 54 and later. It automatically memoizes components and hooks, eliminating the need for manual `useMemo`, `useCallback`, and `React.memo`.

## Enabling React Compiler

Add to `app.json`:

```json
{
  "expo": {
    "experiments": {
      "reactCompiler": true
    }
  }
}
```

## What React Compiler Does

- Automatically memoizes components and values
- Eliminates unnecessary re-renders
- Removes the need for manual `useMemo` and `useCallback`
- Works with existing code without modifications

## Cleanup After Enabling

Once React Compiler is enabled, you can remove manual memoization:

```tsx
// Before (manual memoization)
const memoizedValue = useMemo(() => computeExpensive(a, b), [a, b]);
const memoizedCallback = useCallback(() => doSomething(a), [a]);
const MemoizedComponent = React.memo(MyComponent);

// After (React Compiler handles it)
const value = computeExpensive(a, b);
const callback = () => doSomething(a);
// Just use MyComponent directly
```

## Requirements

- Expo SDK 54 or later
- New Architecture enabled (default in SDK 54+)

## Verifying It's Working

React Compiler runs at build time. Check the Metro bundler output for compilation messages. You can also use React DevTools to verify components are being optimized.

## Troubleshooting

If you encounter issues:

1. Ensure New Architecture is enabled
2. Clear Metro cache: `npx expo start --clear`
3. Check for incompatible patterns in your code (rare)

React Compiler is designed to work with idiomatic React code. If it can't safely optimize a component, it skips that component without breaking your app.

