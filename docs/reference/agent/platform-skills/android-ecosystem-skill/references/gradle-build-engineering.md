# Gradle and Build Engineering

Load this file when changing Kotlin, Compose compiler, Compose BOM, Android
Gradle Plugin, Gradle, KSP/KAPT, R8, dependency locking, build variants, baseline
profiles, or release packaging.

## Version Volatility Rule

Before applying exact versions, check official compatibility docs for:

- Kotlin and Compose Compiler Gradle Plugin.
- Compose BOM mapping.
- Android Gradle Plugin and Gradle wrapper compatibility.
- Hilt, KSP, Room, Navigation, and AndroidX release constraints.
- Google Play target API requirements.

Known creation baseline: Kotlin 2.x enables the Compose Compiler Gradle Plugin;
the April 2026 Compose release used BOM `2026.04.01` and Compose core 1.11.
Treat this as a timestamped baseline, not a permanent target.

## Kotlin 2 and Compose Compiler

- Use the Compose Compiler Gradle Plugin with Kotlin 2.x.
- Keep Kotlin, compose compiler plugin, AGP, and Compose BOM aligned.
- Avoid manual Compose compiler version pinning unless the official docs require
  it for the selected Kotlin version.
- Watch for test timing changes in Compose releases. Compose 1.11 made the newer
  test timing APIs/default dispatcher behavior the standard; confirm project
  assumptions when tests become flaky after a BOM update.

## KSP over KAPT

- Prefer KSP for Room and supported annotation processing.
- Treat KAPT as legacy interop for dependencies that have no KSP path.
- When migrating from KAPT, update plugins, generated source references, CI
  cache paths, and incremental build expectations together.

## Dependency Management

- Use version catalogs for dependency coordinates.
- Use dependency locking for reproducible CI and release builds.
- Avoid dynamic versions in production Android apps.
- Keep debug-only dependencies out of release variants.
- Review transitive dependency changes during BOM or AGP upgrades.

## Build Performance

- Enable Gradle configuration cache only after confirming all plugins and custom
  tasks are compatible.
- Use build cache and remote cache where team infrastructure supports it.
- Avoid expensive work during configuration phase.
- Keep modules meaningful: modules should improve ownership, boundaries, or
  incremental builds.
- Measure build changes rather than assuming modularization improves speed.

## Variants and Secrets

- Use product flavors/build types for environment differences.
- Do not hardcode secrets in Gradle files, source, or resources.
- Keep signing configuration secure; CI should inject signing material through
  protected environment or secret storage.
- Make debug, staging, and release endpoints explicit and testable.

## R8 and Shrinking

- Release builds should use shrinking, optimization, and resource shrinking where
  appropriate.
- Validate serialization, reflection, DI, Retrofit/Moshi/Gson/Kotlinx
  serialization, and dynamically loaded classes under R8.
- Add keep rules only when grounded by a failure mode or library docs.
- Use R8 analyzer or mapping inspection for size regressions and obfuscation
  breakages.

## Baseline Profiles and Macrobenchmarks

- Add baseline profiles for startup, main navigation, feed/list loading, and
  other hot paths.
- Generate profiles through macrobenchmark or project-approved tooling.
- Verify profile installation and startup improvements on release/profileable
  builds.
- Treat baseline profiles as part of release performance, not an optional
  polish step.

## Packaging and Delivery

- Google Play delivery uses Android App Bundles for standard store release.
- Keep APK outputs for local QA or channels that explicitly require them.
- Verify minification, resource shrinking, native symbols, mapping upload, and
  crash symbolication before rollout.

## Build Review Checklist

- Kotlin, AGP, Gradle, Compose BOM, and AndroidX versions are compatible.
- KSP is used where supported; KAPT use is justified.
- Configuration cache and build cache are either enabled and green or explicitly
  deferred due to incompatibility.
- Dependency locks or equivalent reproducibility controls are present.
- Release variant is tested with R8 and baseline profiles.
- Signing, version codes, application IDs, manifest placeholders, and permissions
  differ correctly by variant.
