# Expo Deployment, Updates & CI/CD

_Read-only reference · Distilled from `expo-skill/references/expo-deployment.md`,
`eas-update-insights.md`, `expo-cicd-workflows.md`, and `expo-dev-client.md`_

## When to Load

| Task | Load? |
|---|---|
| Building and submitting to app stores | **Yes** |
| Setting up CI/CD for Expo app | **Yes** |
| Monitoring OTA update health | **Yes** |
| Creating development builds | **Yes** |
| Writing Expo components or modules | No |
| Configuring Reanimated or motion | No |

---

## 1. EAS Build & Submit

### Production Builds

```bash
# iOS App Store
eas build -p ios --profile production

# Android Play Store
eas build -p android --profile production

# Build + auto-submit
eas build -p ios --profile production --submit

# Quick TestFlight
npx testflight
```

### eas.json Configuration

```json
{
    "cli": { "version": ">= 16.0.1", "appVersionSource": "remote" },
    "build": {
        "production": {
            "autoIncrement": true,
            "ios": { "resourceClass": "m-medium" }
        },
        "development": {
            "developmentClient": true,
            "distribution": "internal"
        }
    },
    "submit": {
        "production": {
            "ios": { "appleId": "you@email.com", "ascAppId": "1234567890" },
            "android": {
                "serviceAccountKeyPath": "./google-service-account.json",
                "track": "internal"
            }
        }
    }
}
```

---

## 2. Development Builds

**Only needed when:**
- Local Expo modules (custom native code)
- Apple targets (widgets, app clips, extensions)
- Third-party native modules not in Expo Go

```bash
# TestFlight dev build
eas build -p ios --profile development --submit

# Local build
eas build -p ios --profile development --local

# Connect after install
npx expo start --dev-client
```

---

## 3. OTA Updates & Health Monitoring

### Publish an Update

```bash
eas update --branch production --message "Fix checkout crash"
```

### Check Update Health

```bash
# Get latest group ID
GROUP_ID=$(eas update:list --branch production --json --non-interactive \
    | jq -r '.currentPage[0].group')

# Check crash rate per platform
eas update:insights "$GROUP_ID" --json --non-interactive \
    | jq '.platforms[] | {platform, installs: .totals.installs, crashRate: .totals.crashRatePercent}'
```

### Key Metrics

| Metric | JSON Path | Meaning |
|---|---|---|
| Crash rate | `platforms[].totals.crashRatePercent` | `failedInstalls / (installs + failedInstalls) * 100` |
| Adoption | `platforms[].totals.uniqueUsers` | Distinct users running update |
| Bundle size | `platforms[].payload.averageUpdatePayloadBytes` | Mean update payload |
| Daily trend | `platforms[].daily[]` | Time series for spike detection |

### Embedded vs OTA Users

```bash
eas channel:insights --channel production --runtime-version 1.0.6
```

Returns `embeddedUpdateTotalUniqueUsers` vs `otaTotalUniqueUsers`.

### Regression Detection

```bash
eas update:insights "$GROUP_ID" --days 1 --json --non-interactive \
    | jq '.platforms[] | select(.totals.crashRatePercent > 1)'
```

---

## 4. CI/CD with EAS Workflows

### Release Workflow

```yaml
# .eas/workflows/release.yml
name: Release
on:
    push:
        branches: [main]
jobs:
    build-ios:
        type: build
        params:
            platform: ios
            profile: production
    submit-ios:
        type: submit
        needs: [build-ios]
        params:
            platform: ios
            profile: production
```

### Web Deployment

```bash
npx expo export -p web
npx eas-cli@latest deploy --prod    # Production
npx eas-cli@latest deploy           # PR preview
```

---

## 5. App Store Metadata (iOS)

Use `store.config.json` with EAS Metadata:

```bash
eas metadata:pull    # Pull existing metadata
eas metadata:push    # Push changes
```

### ASO Essentials
- **Title** (30 chars): Brand + strongest keyword. No "app" or "the".
- **Subtitle** (30 chars): Unique value prop. Don't duplicate title keywords.
- **Keywords** (100 chars): Comma-separated, no spaces, no duplicates from title.
- **Description** (4000 chars): Front-load first 3 lines. Bullets for features.

---

## 6. Version Management

```bash
eas build:version:get              # Check current versions
eas build:version:set -p ios --build-number 42   # Manual set
```

With `appVersionSource: "remote"` and `autoIncrement: true`, EAS manages versions automatically.

---

## 7. Android-Specific

- **Gradle cache**: Enable `EAS_GRADLE_CACHE=1` for Compose builds on EAS.
- **Tracks**: `internal` → `closed` → `open` → `production`.
- **Service account**: Required for Play Store submission (`serviceAccountKeyPath`).

---

## 8. Key Commands Reference

| Command | Purpose |
|---|---|
| `eas build -p ios --profile production` | Production iOS build |
| `eas build -p ios --profile production --submit` | Build + submit to App Store |
| `npx testflight` | Quick TestFlight submission |
| `eas update --branch production --message "..."` | Publish OTA update |
| `eas update:insights <groupId>` | Check update health |
| `eas channel:insights --channel <name> --runtime-version <ver>` | Embedded vs OTA users |
| `eas credentials` | Manage signing credentials |
| `eas metadata:push` | Push App Store metadata |
| `eas build:list` | List recent builds |

---

## Skill Sources

- `expo-skill/references/expo-deployment.md`
- `expo-skill/references/eas-update-insights.md`
- `expo-skill/references/expo-cicd-workflows.md`
- `expo-skill/references/expo-dev-client.md`
