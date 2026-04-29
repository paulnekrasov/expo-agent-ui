# Platform APIs and Jetpack Baselines

Load this file when touching Android platform behavior, permissions, background
work, authentication, media, camera, health, notifications, insets, predictive
back, large screens, or API-level migrations.

## Live Docs Rule

Platform behavior changes yearly. Before changing `targetSdk`, permissions,
background execution, intents, storage, notifications, health data, billing, or
Play policy, check current developer.android.com and Play Console docs.

## Android 15/16 Behavior Areas

Creation-time baseline:

- Android 15/API 35 enforced edge-to-edge for target 35 apps.
- Android 16/API 36 behavior changes include JobScheduler quota changes,
  accessibility announcement deprecation, intent redirection hardening, and
  target-36 edge-to-edge opt-out removal.
- Android 16 target behavior affects large screens: orientation, resizability,
  and aspect ratio assumptions may be ignored on larger displays.

Use this only as a routing note; verify exact behavior before code changes.

## WorkManager

Use WorkManager for deferrable, guaranteed background work:

- Offline sync and retry queues.
- Uploads/downloads that can wait for constraints.
- Periodic maintenance where exact timing is not required.

Do not use custom services, alarms, or unscoped coroutines for work that should
survive process death and respect system quotas.

## Notifications

- Android 13+ requires runtime notification permission for most notification
  flows.
- Use notification channels deliberately; channel behavior cannot be silently
  changed after users see it.
- Test foreground service notifications and permission-denied paths.
- For FCM, verify manifest services, token lifecycle, background handling, and
  notification delegation behavior.

## Credential Manager and Passkeys

- Prefer Credential Manager for passkeys and modern sign-in.
- Avoid custom password/token storage flows when platform APIs solve the use
  case.
- Store tokens only in secure storage and design refresh/rotation explicitly.
- Test fallback providers and devices without the newest Google Play services.

## Play Integrity

- Prefer Play Integrity API over deprecated SafetyNet-style checks.
- Treat integrity verdicts as risk signals, not sole authorization.
- Keep server-side verification and abuse response paths outside UI code.

## CameraX and Media3

- Use CameraX for camera capture unless a lower-level camera API is required.
- Use Media3/ExoPlayer for playback, media sessions, and modern media controls.
- Test lifecycle, permissions, background/foreground transitions, audio focus,
  and device rotation.

## Health Connect

- Use Health Connect for supported health data exchange.
- Implement explicit permission education, partial permission handling, and data
  deletion/account disconnect paths.
- Re-check policy and API availability because health data rules are sensitive
  and change over time.

## Insets, Predictive Back, and Large Screens

- Use platform/Compose insets APIs consistently; do not manually pad random
  screens until they "look right".
- Implement predictive back through official APIs and test nested navigation.
- Use adaptive layouts for tablets, foldables, Chromebooks, and virtual displays.
- Validate orientation and resizability assumptions as target SDK increases.

## Per-App Languages

- Use AndroidX/appcompat or platform-supported per-app language APIs as
  appropriate for the min SDK and stack.
- Persist language selection through supported APIs, not custom locale hacks.
- Test process recreation, deep links, and notifications after language changes.

## Platform Review Checklist

- Has the target API behavior been checked against current official docs?
- Are permissions requested only when needed and with denied-state UX?
- Does background work use the right system API and constraints?
- Are auth, integrity, health, and storage choices policy-aligned?
- Are large-screen, rotation, multi-window, and edge-to-edge paths tested?
