# Observability & DevOps Reference
_Sentry iOS · Xcode Cloud · Fastlane · Crash Monitoring · Analytics · Release Engineering_

## Table of Contents
1. [Sentry iOS Swift Setup](#1-sentry-ios-swift-setup)
2. [Xcode Cloud CI/CD](#2-xcode-cloud-cicd)
3. [Fastlane Automation](#3-fastlane-automation)
4. [Analytics & Feature Flags Strategy](#4-analytics--feature-flags-strategy)
5. [Privacy Manifest & App Store Compliance](#5-privacy-manifest--app-store-compliance)
6. [Release Engineering Checklist](#6-release-engineering-checklist)
7. [App Size Optimization](#7-app-size-optimization)

---

## 1. Sentry iOS Swift Setup

Source: https://github.com/getsentry/sentry-cocoa  
Targets: iOS 13+, Swift 5+, Xcode 15+, Sentry Cocoa 9.x

### Installation (SPM — preferred)
```swift
// Package.swift
.package(url: "https://github.com/getsentry/sentry-cocoa", from: "9.0.0")
```

Or CocoaPods:
```ruby
pod 'Sentry', :git => 'https://github.com/getsentry/sentry-cocoa', :tag => '9.0.0'
```

### Initialization (AppDelegate or @main App)
```swift
import Sentry

SentrySDK.start { options in
    options.dsn = "https://<key>@o<org>.ingest.sentry.io/<project>"

    // Performance monitoring
    options.tracesSampleRate = 0.2          // 20% of transactions
    options.profilesSampleRate = 0.1        // 10% of profiled transactions

    // Session replay (opt-in, PII-safe defaults)
    options.sessionReplay.onErrorSampleRate = 1.0   // Replay on every error
    options.sessionReplay.sessionSampleRate = 0.05  // 5% of sessions

    // Captures screenshots on crash
    options.attachScreenshot = true
    options.attachViewHierarchy = true

    // Environment & release
    options.environment = Bundle.main.infoDictionary?["SentryEnvironment"] as? String ?? "production"
    options.releaseName = "\(Bundle.main.bundleIdentifier!)@\(appVersion)+\(buildNumber)"

    // Production-safe defaults
    options.debug = false
    options.enableAutoPerformanceTracing = true
    options.enableFileIOTracing = true
    options.enableNetworkTracking = true
}
```

### Manual error capture
```swift
// Capture non-fatal error
SentrySDK.capture(error: error)

// Capture with context
let scope = Scope()
scope.setExtra(value: articleId, key: "article_id")
scope.setTag(value: "article-detail", key: "screen")
SentrySDK.capture(error: error, scope: scope)
```

### Breadcrumbs
```swift
SentrySDK.addBreadcrumb(Breadcrumb(level: .info, category: "navigation")) {
    crumb in crumb.message = "User opened ArticleDetail"; crumb.data = ["id": article.id.uuidString]
}
```

### Performance transactions
```swift
let transaction = SentrySDK.startTransaction(name: "article-load", operation: "load")
// ... work ...
transaction.finish()
```

### Session replay masking (PII)
```swift
// In SwiftUI — mask sensitive fields
TextField("Password", text: $password)
    .sentryReplayMask()

// Unmask non-sensitive views explicitly
Text(article.title)
    .sentryReplayUnmask()
```

### Verification
```swift
// Trigger a test crash (remove before release)
// SentrySDK.crash()
```

### Bundle size analysis
Use the Sentry Fastlane plugin to check SDK contribution:
```bash
bundle exec fastlane run sentry_upload_dsym dsym_path:"./MyApp.app.dSYM"
```

---

## 2. Xcode Cloud CI/CD

### Workflow structure
```
Start Condition      — Push to branch, PR, tag, or schedule
Environment         — Xcode version, macOS, Swift version
Actions             — Build, Test, Archive, Distribute
Post-Actions        — Notify Slack, post to TestFlight, tag release
```

### ci_scripts/ hooks
```bash
# ci_scripts/ci_post_clone.sh — runs after repo clone
#!/bin/sh
set -e

# Install Ruby dependencies
bundle install --path vendor/bundle

# Install additional tools
brew install swiftlint
```

```bash
# ci_scripts/ci_pre_xcodebuild.sh — runs before each Xcode action
#!/bin/sh
set -e

# Inject build number from CI
echo "Setting build number to $CI_BUILD_NUMBER"
agvtool new-version -all $CI_BUILD_NUMBER
```

### Environment variables
```
CI_XCODE_SCHEME         — Active scheme name
CI_PRODUCT_PLATFORM     — iOS, macOS, etc.
CI_BUILD_NUMBER         — Auto-incremented by Xcode Cloud
CI_BRANCH               — Current branch name
CI_PULL_REQUEST_NUMBER  — PR number (if triggered by PR)
```

### TestFlight distribution
- Archive action → set post-action to **TestFlight Internal Testing**.
- Use separate workflows for `develop` (internal testers) and `main` (external testers / App Store).

---

## 3. Fastlane Automation

### Fastfile structure
```ruby
default_platform(:ios)

platform :ios do
  before_all do
    setup_ci if ENV['CI']
  end

  desc "Run unit tests"
  lane :test do
    run_tests(
      scheme: "MyApp",
      device: "iPhone 15",
      derived_data_path: "DerivedData",
      result_bundle: true,
      output_directory: "fastlane/test_output"
    )
  end

  desc "Build and upload to TestFlight"
  lane :beta do
    increment_build_number(
      build_number: latest_testflight_build_number + 1
    )
    match(type: "appstore")     # Code signing via Match
    build_app(
      scheme: "MyApp",
      export_method: "app-store",
      include_bitcode: false
    )
    upload_to_testflight(
      skip_waiting_for_build_processing: true
    )
    slack(message: "New TestFlight build uploaded 🚀", webhook_url: ENV["SLACK_WEBHOOK"])
  end

  desc "Release to App Store"
  lane :release do
    match(type: "appstore")
    build_app(scheme: "MyApp", export_method: "app-store")
    upload_to_app_store(
      submit_for_review: true,
      automatic_release: false,
      force: true
    )
  end
end
```

### Match (code signing)
```bash
# Initialize match with App Store Connect
bundle exec fastlane match init

# Sync/create certs and profiles
bundle exec fastlane match appstore
bundle exec fastlane match development
```

### Useful plugins
```ruby
# Gemfile
gem 'fastlane-plugin-firebase_app_distribution'
gem 'fastlane-plugin-sentry'
gem 'fastlane-plugin-versioning'
```

---

## 4. Analytics & Feature Flags Strategy

### Analytics principles
- **No PII** in event names or properties without explicit user consent.
- Event names: `noun_verb` format — `article_opened`, `purchase_completed`, `onboarding_skipped`.
- Log to a single analytics abstraction, not directly to vendor SDKs in feature code.

### Analytics abstraction layer
```swift
protocol AnalyticsService: Sendable {
    func track(_ event: AnalyticsEvent)
    func identify(userId: String, traits: [String: Any])
}

enum AnalyticsEvent {
    case articleOpened(id: UUID, source: String)
    case purchaseCompleted(productId: String, price: Decimal)
    case onboardingSkipped(step: Int)

    var name: String {
        switch self {
        case .articleOpened: "article_opened"
        case .purchaseCompleted: "purchase_completed"
        case .onboardingSkipped: "onboarding_skipped"
        }
    }

    var properties: [String: Any] {
        switch self {
        case .articleOpened(let id, let source):
            return ["article_id": id.uuidString, "source": source]
        case .purchaseCompleted(let productId, let price):
            return ["product_id": productId, "price": NSDecimalNumber(decimal: price)]
        case .onboardingSkipped(let step):
            return ["step": step]
        }
    }
}
```

### Feature flags
```swift
// Simple UserDefaults-backed flags for internal testing
enum FeatureFlag: String {
    case newFeedDesign = "feature_new_feed_design"
    case aiSummaries = "feature_ai_summaries"

    var isEnabled: Bool {
        UserDefaults.standard.bool(forKey: rawValue)
    }
}

// Remote flags via LaunchDarkly / Firebase Remote Config / custom backend
protocol FeatureFlagService: Sendable {
    func isEnabled(_ flag: FeatureFlag) async -> Bool
}
```

---

## 5. Privacy Manifest & App Store Compliance

### PrivacyInfo.xcprivacy (required since iOS 17 / Xcode 15+)
Add `PrivacyInfo.xcprivacy` to the app target and every SDK target that uses tracked APIs.

Key categories requiring declaration:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "...">
<plist version="1.0">
<dict>
    <key>NSPrivacyTracking</key>
    <false/>
    <key>NSPrivacyTrackingDomains</key>
    <array/>
    <key>NSPrivacyCollectedDataTypes</key>
    <array>
        <!-- Declare each collected data type -->
        <dict>
            <key>NSPrivacyCollectedDataType</key>
            <string>NSPrivacyCollectedDataTypeCrashData</string>
            <key>NSPrivacyCollectedDataTypeLinked</key>
            <false/>
            <key>NSPrivacyCollectedDataTypeTracking</key>
            <false/>
            <key>NSPrivacyCollectedDataTypePurposes</key>
            <array>
                <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
            </array>
        </dict>
    </array>
    <key>NSPrivacyAccessedAPITypes</key>
    <array>
        <!-- Declare each required reason API usage -->
        <dict>
            <key>NSPrivacyAccessedAPIType</key>
            <string>NSPrivacyAccessedAPICategoryUserDefaults</string>
            <key>NSPrivacyAccessedAPITypeReasons</key>
            <array>
                <string>CA92.1</string>  <!-- Store app preferences -->
            </array>
        </dict>
    </array>
</dict>
</plist>
```

Required Reason APIs to declare:
- `NSUserDefaults` — CA92
- File timestamps — C617, DDA9
- System boot time — 35F9, 8FFB
- Disk space — E174, 85F4
- Active keyboard — 3EC4, 54BD

---

## 6. Release Engineering Checklist

### Pre-submission
- [ ] Build number incremented (never reused within same bundle ID)
- [ ] `PrivacyInfo.xcprivacy` accurate and complete
- [ ] All third-party SDKs have privacy manifests (check with `xcprivacy` audit tool)
- [ ] App Transport Security exceptions documented in Info.plist
- [ ] No debug-only code paths (print, SentrySDK.crash()) in release build
- [ ] `SWIFT_STRICT_CONCURRENCY = complete` — zero warnings in release target
- [ ] All API keys/secrets in `.xcconfig` files or environment — not in source

### TestFlight validation
- [ ] Tested on minimum deployment target device (not just latest)
- [ ] Dark mode + all Dynamic Type sizes verified
- [ ] Accessibility audit passed (Accessibility Inspector in Xcode)
- [ ] Localization: all user-facing strings in `.xcstrings`

### App Store submission
- [ ] Screenshots for all required device sizes (6.5", 6.7", 12.9" iPad)
- [ ] Age rating accurately reflects content
- [ ] URL scheme and Universal Links tested
- [ ] What's New text reviewed and localized

---

## 7. App Size Optimization

### Techniques
| Technique | Typical Saving |
|---|---|
| Enable Bitcode (where supported) | 10–30% install size |
| Asset Catalog slicing | Up to 50% for image assets |
| On-demand resources | Large assets downloaded as needed |
| Dead code stripping (`DEAD_CODE_STRIPPING = YES`) | 5–15% |
| Avoid shipping duplicate assets | Per-target audit |
| Use SF Symbols instead of custom icon PNGs | ~10 KB per icon saved |

### Auditing binary size
```bash
# Show all Swift symbols and sizes
nm -size-sort -demangle MyApp | tail -50

# App Store Connect → TestFlight → Build → App Size Report
# Or use Emerge Tools for detailed diff analysis
```

### Download size budget
| App Type | Target Download Size |
|---|---|
| Utility / Productivity | < 20 MB |
| Social / Content | < 50 MB |
| Game (initial) | < 200 MB (rest via On-Demand Resources) |
