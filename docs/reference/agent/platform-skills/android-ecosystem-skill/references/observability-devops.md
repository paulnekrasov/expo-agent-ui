# Observability, CI/CD, and Distribution

Load this file when preparing release infrastructure, CI, monitoring, Play
Console rollout, signing, Crashlytics, performance monitoring, remote config,
incident response, or store readiness.

## Observability Defaults

- Crash reporting: Firebase Crashlytics or the project's approved equivalent.
- Performance monitoring: Firebase Performance, Android vitals, macrobenchmark
  outputs, profiler traces, and Play Console vitals.
- Logging: structured logs with a project-approved facade such as Timber; no PII
  or secrets in logs.
- Release symbols: upload mapping files and native symbols for every release
  variant that can reach users.
- Metrics: track cold start, jank, ANR, crash-free users/sessions, memory, and
  key business flow failures.

## CI Gates

Minimum CI for production Android apps:

- Static checks: lint, ktlint/detekt or project equivalent.
- Unit tests: JVM domain, ViewModel, coroutine, mapper tests.
- Build: debug and release or release-like variant.
- Instrumented tests: scheduled or required for release-critical modules.
- Screenshot tests: required for design system or high-risk UI changes.
- Macrobenchmarks/baseline profile generation for performance-sensitive apps.
- R8/minified release validation before Play rollout.

## Signing and Secrets

- Use Play App Signing for Play distribution.
- Keep upload keys and keystores in protected CI secret storage.
- Do not commit signing files, passwords, service account JSON, API keys, or
  tokens.
- Rotate compromised keys and document recovery steps.
- Keep service accounts least-privileged for Play Console, Firebase, and CI.

## Play Release Checklist

- AAB built from clean release source.
- Version code/name and changelog are correct.
- Target SDK and Play policy requirements are current.
- Data safety form, privacy policy, content rating, ads declaration, permissions,
  and sensitive API declarations are accurate.
- Mapping/native symbol files are uploaded.
- Crashlytics and analytics build identifiers match the release.
- Baseline profiles are packaged and performance budgets are met.
- Internal testing passes before closed/open/staged production rollout.

## Rollout Strategy

- Use internal tracks for smoke testing and signing validation.
- Use closed/open testing for risky feature or billing changes.
- Use staged rollout for production when the app has meaningful active users.
- Monitor vitals, crash-free metrics, ANR, startup, and user feedback after each
  rollout step.
- Pause or halt rollout on statistically meaningful crash/ANR/performance
  regression.

## Remote Config and A/B Testing

- Use Remote Config for server-controlled flags, kill switches, and experiments.
- Default values must be safe when config fetch fails.
- Keep experiment assignment and analytics privacy-compliant.
- Avoid hiding broken releases behind flags instead of fixing release blockers.

## Incident Response

When production signals regress:

1. Identify affected version codes, devices, API levels, locales, and rollout
   percentage.
2. Correlate with recent changes: target SDK, R8, dependencies, backend flags,
   migrations, permissions, and platform APIs.
3. Reproduce on a representative device or emulator.
4. Decide rollback, hotfix, config disable, or rollout halt.
5. Add a regression test or release gate for the failure class.

## DevOps Review Checklist

- Does CI build and test the same variant that ships?
- Are release artifacts reproducible and traceable to commits?
- Are mapping files and symbols uploaded?
- Are Play Console policy declarations current?
- Is staged rollout monitored with clear halt criteria?
- Are secrets and signing materials outside source control?
