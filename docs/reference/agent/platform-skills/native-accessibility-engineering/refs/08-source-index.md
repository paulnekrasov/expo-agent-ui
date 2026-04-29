# Source Index

Use official sources first when updating this skill. Refresh these links before major changes because framework accessibility APIs and testing support evolve.

## React Native

- React Native Accessibility docs: https://reactnative.dev/docs/accessibility
- React Native latest versioned accessibility docs used during this rewrite: https://reactnative.dev/docs/0.83/accessibility

Important current points:

- React Native exposes complementary APIs for iOS VoiceOver and Android TalkBack.
- Android and iOS behavior differ, so shared components need platform verification.
- `role` takes precedence over `accessibilityRole` where supported.
- `accessibilityActions` plus `onAccessibilityAction` expose standard and custom actions.
- VoiceOver release testing should use a real device when possible.

## Android and Jetpack Compose

- Compose accessibility overview: https://developer.android.com/develop/ui/compose/accessibility
- Compose semantics: https://developer.android.com/develop/ui/compose/accessibility/semantics
- Compose API defaults: https://developer.android.com/develop/ui/compose/accessibility/api-defaults
- Compose merging and clearing: https://developer.android.com/develop/ui/compose/accessibility/merging-clearing
- Compose accessibility testing: https://developer.android.com/develop/ui/compose/accessibility/testing
- Android accessibility principles: https://developer.android.com/guide/topics/ui/accessibility/principles
- Espresso accessibility checks: https://developer.android.com/training/testing/espresso/accessibility-checking

Important current points:

- Compose Material, UI, and Foundation APIs provide built-in semantics, but custom components need review.
- The semantics tree powers accessibility and testing.
- Meaningful images/icons need localized descriptions; decorative content should be omitted.
- Compose accessibility checks are available through the Accessibility Test Framework for supported Compose versions.
- Android View tests can enable Espresso accessibility checks.

## Apple Platforms

- Apple Human Interface Guidelines, Accessibility: https://developer.apple.com/design/human-interface-guidelines/accessibility
- Supporting VoiceOver in UIKit apps: https://developer.apple.com/documentation/uikit/supporting-voiceover-in-your-app
- SwiftUI accessible descriptions: https://developer.apple.com/documentation/swiftui/accessible-descriptions
- SwiftUI accessibility child behavior: https://developer.apple.com/documentation/swiftui/accessibilitychildbehavior
- UIKit `UIAccessibilityCustomAction`: https://developer.apple.com/documentation/uikit/uiaccessibilitycustomaction

Important current points:

- Standard controls often provide baseline accessibility.
- Custom UI needs labels, values, hints, traits, grouping, custom actions, and focus management.
- VoiceOver testing should verify order, grouping, task completion, and visual dependency.
- Dynamic Type, Reduce Motion, Increase Contrast, Bold Text, and related settings are part of native quality.

## Flutter

- Flutter accessibility overview: https://docs.flutter.dev/ui/accessibility
- Flutter accessibility widgets: https://docs.flutter.dev/ui/widgets/accessibility
- Flutter web accessibility: https://docs.flutter.dev/ui/accessibility/web-accessibility

Important current points:

- Flutter provides first-class accessibility support through framework semantics and operating system support.
- `Semantics`, `MergeSemantics`, and `ExcludeSemantics` are core tools for custom widgets.
- Web builds expose semantics differently from native builds and should be tested separately.

## .NET MAUI

- .NET MAUI semantic properties: https://learn.microsoft.com/en-us/dotnet/maui/fundamentals/accessibility

Important current points:

- Semantic properties are the recommended approach.
- Automation properties are older/Xamarin.Forms-style and many are superseded or deprecated.
- Cross-platform behavior differs; test each target platform with its native screen reader.

## Windows

- Develop accessible Windows apps: https://learn.microsoft.com/en-us/windows/apps/develop/accessibility
- Windows accessibility overview: https://learn.microsoft.com/en-us/windows/apps/design/accessibility/accessibility-overview

Important current points:

- Windows accessibility primarily integrates through UI Automation.
- Standard WinUI controls carry accessible behavior; custom controls need correct peers, properties, and patterns.
- Test with Narrator, keyboard, high contrast, and Accessibility Insights.
