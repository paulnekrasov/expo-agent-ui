# expo-deployment

Source: https://github.com/expo/skills/tree/main/plugins/expo/skills/expo-deployment

## Source SKILL.md

---
name: expo-deployment
description: Deploying Expo apps to iOS App Store, Android Play Store, web hosting, and API routes
version: 1.0.0
license: MIT
---

# Deployment

This skill covers deploying Expo applications across all platforms using EAS (Expo Application Services).

## References

Consult these resources as needed:

- ./references/workflows.md -- CI/CD workflows for automated deployments and PR previews
- ./references/testflight.md -- Submitting iOS builds to TestFlight for beta testing
- ./references/app-store-metadata.md -- Managing App Store metadata and ASO optimization
- ./references/play-store.md -- Submitting Android builds to Google Play Store
- ./references/ios-app-store.md -- iOS App Store submission and review process

## Quick Start

### Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

### Initialize EAS

```bash
npx eas-cli@latest init
```

This creates `eas.json` with build profiles.

## Build Commands

### Production Builds

```bash
# iOS App Store build
npx eas-cli@latest build -p ios --profile production

# Android Play Store build
npx eas-cli@latest build -p android --profile production

# Both platforms
npx eas-cli@latest build --profile production
```

### Submit to Stores

```bash
# iOS: Build and submit to App Store Connect
npx eas-cli@latest build -p ios --profile production --submit

# Android: Build and submit to Play Store
npx eas-cli@latest build -p android --profile production --submit

# Shortcut for iOS TestFlight
npx testflight
```

## Web Deployment

Deploy web apps using EAS Hosting:

```bash
# Deploy to production
npx expo export -p web
npx eas-cli@latest deploy --prod

# Deploy PR preview
npx eas-cli@latest deploy
```

## EAS Configuration

Standard `eas.json` for production deployments:

```json
{
  "cli": {
    "version": ">= 16.0.1",
    "appVersionSource": "remote"
  },
  "build": {
    "production": {
      "autoIncrement": true,
      "ios": {
        "resourceClass": "m-medium"
      }
    },
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@email.com",
        "ascAppId": "1234567890"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

## Platform-Specific Guides

### iOS

- Use `npx testflight` for quick TestFlight submissions
- Configure Apple credentials via `eas credentials`
- See ./reference/testflight.md for credential setup
- See ./reference/ios-app-store.md for App Store submission

### Android

- Set up Google Play Console service account
- Configure tracks: internal → closed → open → production
- See ./reference/play-store.md for detailed setup

### Web

- EAS Hosting provides preview URLs for PRs
- Production deploys to your custom domain
- See ./reference/workflows.md for CI/CD automation

## Automated Deployments

Use EAS Workflows for CI/CD:

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

See ./reference/workflows.md for more workflow examples.

## Version Management

EAS manages version numbers automatically with `appVersionSource: "remote"`:

```bash
# Check current versions
eas build:version:get

# Manually set version
eas build:version:set -p ios --build-number 42
```

## Monitoring

```bash
# List recent builds
eas build:list

# Check build status
eas build:view

# View submission status
eas submit:list
```

## Source Reference: references / app-store-metadata.md

# App Store Metadata

Manage App Store metadata and optimize for ASO using EAS Metadata.

## What is EAS Metadata?

EAS Metadata automates App Store presence management from the command line using a `store.config.json` file instead of manually filling forms in App Store Connect. It includes built-in validation to catch common rejection pitfalls.

**Current Status:** Preview, Apple App Store only.

## Getting Started

### Pull Existing Metadata

If your app is already published, pull current metadata:

```bash
eas metadata:pull
```

This creates `store.config.json` with your current App Store configuration.

### Push Metadata Updates

After editing your config, push changes:

```bash
eas metadata:push
```

**Important:** You must submit a binary via `eas submit` before pushing metadata for new apps.

## Configuration File

Create `store.config.json` at your project root:

```json
{
  "configVersion": 0,
  "apple": {
    "copyright": "2025 Your Company",
    "categories": ["UTILITIES", "PRODUCTIVITY"],
    "info": {
      "en-US": {
        "title": "App Name",
        "subtitle": "Your compelling tagline",
        "description": "Full app description...",
        "keywords": ["keyword1", "keyword2", "keyword3"],
        "releaseNotes": "What's new in this version...",
        "promoText": "Limited time offer!",
        "privacyPolicyUrl": "https://example.com/privacy",
        "supportUrl": "https://example.com/support",
        "marketingUrl": "https://example.com"
      }
    },
    "advisory": {
      "alcoholTobaccoOrDrugUseOrReferences": "NONE",
      "gamblingSimulated": "NONE",
      "medicalOrTreatmentInformation": "NONE",
      "profanityOrCrudeHumor": "NONE",
      "sexualContentGraphicAndNudity": "NONE",
      "sexualContentOrNudity": "NONE",
      "horrorOrFearThemes": "NONE",
      "matureOrSuggestiveThemes": "NONE",
      "violenceCartoonOrFantasy": "NONE",
      "violenceRealistic": "NONE",
      "violenceRealisticProlongedGraphicOrSadistic": "NONE",
      "contests": "NONE",
      "gambling": false,
      "unrestrictedWebAccess": false,
      "seventeenPlus": false
    },
    "release": {
      "automaticRelease": true,
      "phasedRelease": true
    },
    "review": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "review@example.com",
      "phone": "+1 555-123-4567",
      "notes": "Demo account: test@example.com / password123"
    }
  }
}
```

## App Store Optimization (ASO)

### Title Optimization (30 characters max)

The title is the most important ranking factor. Include your brand name and 1-2 strongest keywords.

```json
{
  "title": "Budgetly - Money Tracker"
}
```

**Best Practices:**

- Brand name first for recognition
- Include highest-volume keyword
- Avoid generic words like "app" or "the"
- Title keywords boost rankings by ~10%

### Subtitle Optimization (30 characters max)

The subtitle appears below your title in search results. Use it for your unique value proposition.

```json
{
  "subtitle": "Smart Expense & Budget Planner"
}
```

**Best Practices:**

- Don't duplicate keywords from title (Apple counts each word once)
- Highlight your main differentiator
- Include secondary high-value keywords
- Focus on benefits, not features

### Keywords Field (100 characters max)

Hidden from users but crucial for discoverability. Use comma-separated keywords without spaces after commas.

```json
{
  "keywords": [
    "finance,budget,expense,money,tracker,savings,bills,income,spending,wallet,personal,weekly,monthly"
  ]
}
```

**Best Practices:**

- Use all 100 characters
- Separate with commas only (no spaces)
- No duplicates from title/subtitle
- Include singular forms (Apple handles plurals)
- Add synonyms and alternate spellings
- Include competitor brand names (carefully)
- Use digits instead of spelled numbers ("5" not "five")
- Skip articles and prepositions

### Description Optimization

The iOS description is NOT indexed for search but critical for conversion. Focus on convincing users to download.

```json
{
  "description": "Take control of your finances with Budgetly, the intuitive money management app trusted by over 1 million users.\n\nKEY FEATURES:\n• Smart budget tracking - Set limits and watch your progress\n• Expense categorization - Know exactly where your money goes\n• Bill reminders - Never miss a payment\n• Beautiful charts - Visualize your financial health\n• Bank sync - Connect 10,000+ institutions\n• Cloud backup - Your data, always safe\n\nWHY BUDGETLY?\nUnlike complex spreadsheets or basic calculators, Budgetly learns your spending habits and provides personalized insights. Our users save an average of $300/month within 3 months.\n\nPRIVACY FIRST\nYour financial data is encrypted end-to-end. We never sell your information.\n\nDownload Budgetly today and start your journey to financial freedom!"
}
```

**Best Practices:**

- Front-load the first 3 lines (visible before "more")
- Use bullet points for features
- Include social proof (user counts, ratings, awards)
- Add a clear call-to-action
- Mention privacy/security for sensitive apps
- Update with each release

### Release Notes

Shown to existing users deciding whether to update.

```json
{
  "releaseNotes": "Version 2.5 brings exciting improvements:\n\n• NEW: Dark mode support\n• NEW: Widget for home screen\n• IMPROVED: 50% faster sync\n• FIXED: Notification timing issues\n\nLove Budgetly? Please leave a review!"
}
```

### Promo Text (170 characters max)

Appears above description; can be updated without new binary. Great for time-sensitive promotions.

```json
{
  "promoText": "🎉 New Year Special: Premium features free for 30 days! Start 2025 with better finances."
}
```

## Categories

Primary category is most important for browsing and rankings.

```json
{
  "categories": ["FINANCE", "PRODUCTIVITY"]
}
```

**Available Categories:**

- BOOKS, BUSINESS, DEVELOPER_TOOLS, EDUCATION
- ENTERTAINMENT, FINANCE, FOOD_AND_DRINK
- GAMES (with subcategories), GRAPHICS_AND_DESIGN
- HEALTH_AND_FITNESS, KIDS (age-gated)
- LIFESTYLE, MAGAZINES_AND_NEWSPAPERS
- MEDICAL, MUSIC, NAVIGATION, NEWS
- PHOTO_AND_VIDEO, PRODUCTIVITY, REFERENCE
- SHOPPING, SOCIAL_NETWORKING, SPORTS
- STICKERS (with subcategories), TRAVEL
- UTILITIES, WEATHER

## Localization

Localize metadata for each target market. Keywords should be researched per locale—direct translations often miss regional search terms.

```json
{
  "info": {
    "en-US": {
      "title": "Budgetly - Money Tracker",
      "subtitle": "Smart Expense Planner",
      "keywords": ["budget,finance,money,expense,tracker"]
    },
    "es-ES": {
      "title": "Budgetly - Control de Gastos",
      "subtitle": "Planificador de Presupuesto",
      "keywords": ["presupuesto,finanzas,dinero,gastos,ahorro"]
    },
    "ja": {
      "title": "Budgetly - 家計簿アプリ",
      "subtitle": "簡単支出管理",
      "keywords": ["家計簿,支出,予算,節約,お金"]
    },
    "de-DE": {
      "title": "Budgetly - Haushaltsbuch",
      "subtitle": "Ausgaben Verwalten",
      "keywords": ["budget,finanzen,geld,ausgaben,sparen"]
    }
  }
}
```

**Supported Locales:**
`ar-SA`, `ca`, `cs`, `da`, `de-DE`, `el`, `en-AU`, `en-CA`, `en-GB`, `en-US`, `es-ES`, `es-MX`, `fi`, `fr-CA`, `fr-FR`, `he`, `hi`, `hr`, `hu`, `id`, `it`, `ja`, `ko`, `ms`, `nl-NL`, `no`, `pl`, `pt-BR`, `pt-PT`, `ro`, `ru`, `sk`, `sv`, `th`, `tr`, `uk`, `vi`, `zh-Hans`, `zh-Hant`

## Dynamic Configuration

Use JavaScript for dynamic values like copyright year or fetched translations.

### Basic Dynamic Config

```js
// store.config.js
const baseConfig = require("./store.config.json");

const year = new Date().getFullYear();

module.exports = {
  ...baseConfig,
  apple: {
    ...baseConfig.apple,
    copyright: `${year} Your Company, Inc.`,
  },
};
```

### Async Configuration (External Localization)

```js
// store.config.js
module.exports = async () => {
  const baseConfig = require("./store.config.json");

  // Fetch translations from CMS/localization service
  const translations = await fetch(
    "https://api.example.com/app-store-copy"
  ).then((r) => r.json());

  return {
    ...baseConfig,
    apple: {
      ...baseConfig.apple,
      info: translations,
    },
  };
};
```

### Environment-Based Config

```js
// store.config.js
const baseConfig = require("./store.config.json");

const isProduction = process.env.EAS_BUILD_PROFILE === "production";

module.exports = {
  ...baseConfig,
  apple: {
    ...baseConfig.apple,
    info: {
      "en-US": {
        ...baseConfig.apple.info["en-US"],
        promoText: isProduction
          ? "Download now and get started!"
          : "[BETA] Help us test new features!",
      },
    },
  },
};
```

Update `eas.json` to use JS config:

```json
{
  "cli": {
    "metadataPath": "./store.config.js"
  }
}
```

## Age Rating (Advisory)

Answer content questions honestly to get an appropriate age rating.

**Content Descriptors:**

- `NONE` - Content not present
- `INFREQUENT_OR_MILD` - Occasional mild content
- `FREQUENT_OR_INTENSE` - Regular or strong content

```json
{
  "advisory": {
    "alcoholTobaccoOrDrugUseOrReferences": "NONE",
    "contests": "NONE",
    "gambling": false,
    "gamblingSimulated": "NONE",
    "horrorOrFearThemes": "NONE",
    "matureOrSuggestiveThemes": "NONE",
    "medicalOrTreatmentInformation": "NONE",
    "profanityOrCrudeHumor": "NONE",
    "sexualContentGraphicAndNudity": "NONE",
    "sexualContentOrNudity": "NONE",
    "unrestrictedWebAccess": false,
    "violenceCartoonOrFantasy": "NONE",
    "violenceRealistic": "NONE",
    "violenceRealisticProlongedGraphicOrSadistic": "NONE",
    "seventeenPlus": false,
    "kidsAgeBand": "NINE_TO_ELEVEN"
  }
}
```

**Kids Age Bands:** `FIVE_AND_UNDER`, `SIX_TO_EIGHT`, `NINE_TO_ELEVEN`

## Release Strategy

Control how your app rolls out to users.

```json
{
  "release": {
    "automaticRelease": true,
    "phasedRelease": true
  }
}
```

**Options:**

- `automaticRelease: true` - Release immediately upon approval
- `automaticRelease: false` - Manual release after approval
- `automaticRelease: "2025-02-01T10:00:00Z"` - Schedule release (RFC 3339)
- `phasedRelease: true` - 7-day gradual rollout (1%, 2%, 5%, 10%, 20%, 50%, 100%)

## Review Information

Provide contact info and test credentials for the App Review team.

```json
{
  "review": {
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "app-review@company.com",
    "phone": "+1 (555) 123-4567",
    "demoUsername": "demo@example.com",
    "demoPassword": "ReviewDemo2025!",
    "notes": "To test premium features:\n1. Log in with demo credentials\n2. Navigate to Settings > Subscription\n3. Tap 'Restore Purchase' - sandbox purchase will be restored\n\nFor location features, allow location access when prompted."
  }
}
```

## ASO Checklist

### Before Each Release

- [ ] Update keywords based on performance data
- [ ] Refresh description with new features
- [ ] Write compelling release notes
- [ ] Update promo text if running campaigns
- [ ] Verify all URLs are valid

### Monthly ASO Tasks

- [ ] Analyze keyword rankings
- [ ] Research competitor keywords
- [ ] Check conversion rates in App Analytics
- [ ] Review user feedback for keyword ideas
- [ ] A/B test screenshots in App Store Connect

### Keyword Research Tips

1. **Brainstorm features** - List all app capabilities
2. **Mine reviews** - Find words users actually use
3. **Analyze competitors** - Check their titles/subtitles
4. **Use long-tail keywords** - Less competition, higher intent
5. **Consider misspellings** - Common typos can drive traffic
6. **Track seasonality** - Some keywords peak at certain times

### Metrics to Monitor

- **Impressions** - How often your app appears in search
- **Product Page Views** - Users who tap to learn more
- **Conversion Rate** - Views → Downloads
- **Keyword Rankings** - Position for target keywords
- **Category Ranking** - Position in your categories

## VS Code Integration

Install the [Expo Tools extension](https://marketplace.visualstudio.com/items?itemName=expo.vscode-expo-tools) for:

- Auto-complete for all schema properties
- Inline validation and warnings
- Quick fixes for common issues

## Common Issues

### "Binary not found"

Push a binary with `eas submit` before pushing metadata.

### "Invalid keywords"

- Check total length is ≤100 characters
- Remove spaces after commas
- Remove duplicate words

### "Description too long"

Description maximum is 4000 characters.

### Pull doesn't update JS config

`eas metadata:pull` creates a JSON file; import it into your JS config.

## CI/CD Integration

Automate metadata updates in your deployment pipeline:

```yaml
# .eas/workflows/release.yml
jobs:
  submit-and-metadata:
    steps:
      - name: Submit to App Store
        run: eas submit -p ios --latest

      - name: Push Metadata
        run: eas metadata:push
```

## Tips

- Update metadata every 4-6 weeks for optimal ASO
- 70% of App Store visitors use search to find apps
- Apps with 4+ star ratings get featured more often
- Localized apps see 128% more downloads per country
- First 3 lines of description are most critical (shown before "more")
- Use all 100 keyword characters—every character counts

## Source Reference: references / ios-app-store.md

# Submitting to iOS App Store

## Prerequisites

1. **Apple Developer Account** - Enroll at [developer.apple.com](https://developer.apple.com)
2. **App Store Connect App** - Create your app record before first submission
3. **Apple Credentials** - Configure via EAS or environment variables

## Credential Setup

### Using EAS Credentials

```bash
eas credentials -p ios
```

This interactive flow helps you:
- Create or select a distribution certificate
- Create or select a provisioning profile
- Configure App Store Connect API key (recommended)

### App Store Connect API Key (Recommended)

API keys avoid 2FA prompts in CI/CD:

1. Go to App Store Connect → Users and Access → Keys
2. Click "+" to create a new key
3. Select "App Manager" role (minimum for submissions)
4. Download the `.p8` key file

Configure in `eas.json`:

```json
{
  "submit": {
    "production": {
      "ios": {
        "ascApiKeyPath": "./AuthKey_XXXXX.p8",
        "ascApiKeyIssuerId": "xxxxx-xxxx-xxxx-xxxx-xxxxx",
        "ascApiKeyId": "XXXXXXXXXX"
      }
    }
  }
}
```

Or use environment variables:

```bash
EXPO_ASC_API_KEY_PATH=./AuthKey.p8
EXPO_ASC_API_KEY_ISSUER_ID=xxxxx-xxxx-xxxx-xxxx-xxxxx
EXPO_ASC_API_KEY_ID=XXXXXXXXXX
```

### Apple ID Authentication (Alternative)

For manual submissions, you can use Apple ID:

```bash
EXPO_APPLE_ID=your@email.com
EXPO_APPLE_TEAM_ID=XXXXXXXXXX
```

Note: Requires app-specific password for accounts with 2FA.

## Submission Commands

```bash
# Build and submit to App Store Connect
eas build -p ios --profile production --submit

# Submit latest build
eas submit -p ios --latest

# Submit specific build
eas submit -p ios --id BUILD_ID

# Quick TestFlight submission
npx testflight
```

## App Store Connect Configuration

### First-Time Setup

Before submitting, complete in App Store Connect:

1. **App Information**
   - Primary language
   - Bundle ID (must match `app.json`)
   - SKU (unique identifier)

2. **Pricing and Availability**
   - Price tier
   - Available countries

3. **App Privacy**
   - Privacy policy URL
   - Data collection declarations

4. **App Review Information**
   - Contact information
   - Demo account (if login required)
   - Notes for reviewers

### EAS Configuration

```json
{
  "cli": {
    "version": ">= 16.0.1",
    "appVersionSource": "remote"
  },
  "build": {
    "production": {
      "ios": {
        "resourceClass": "m-medium",
        "autoIncrement": true
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@email.com",
        "ascAppId": "1234567890",
        "appleTeamId": "XXXXXXXXXX"
      }
    }
  }
}
```

Find `ascAppId` in App Store Connect → App Information → Apple ID.

## TestFlight vs App Store

### TestFlight (Beta Testing)

- Builds go to TestFlight automatically after submission
- Internal testers (up to 100) - immediate access
- External testers (up to 10,000) - requires beta review
- Builds expire after 90 days

### App Store (Production)

- Requires passing App Review
- Submit for review from App Store Connect
- Choose release timing (immediate, scheduled, manual)

## App Review Process

### What Reviewers Check

1. **Functionality** - App works as described
2. **UI/UX** - Follows Human Interface Guidelines
3. **Content** - Appropriate and accurate
4. **Privacy** - Data handling matches declarations
5. **Legal** - Complies with local laws

### Common Rejection Reasons

| Issue | Solution |
|-------|----------|
| Crashes/bugs | Test thoroughly before submission |
| Incomplete metadata | Fill all required fields |
| Placeholder content | Remove "lorem ipsum" and test data |
| Missing login credentials | Provide demo account |
| Privacy policy missing | Add URL in App Store Connect |
| Guideline 4.2 (minimum functionality) | Ensure app provides value |

### Expedited Review

Request expedited review for:
- Critical bug fixes
- Time-sensitive events
- Security issues

Go to App Store Connect → your app → App Review → Request Expedited Review.

## Version and Build Numbers

iOS uses two version identifiers:

- **Version** (`CFBundleShortVersionString`): User-facing, e.g., "1.2.3"
- **Build Number** (`CFBundleVersion`): Internal, must increment for each upload

Configure in `app.json`:

```json
{
  "expo": {
    "version": "1.2.3",
    "ios": {
      "buildNumber": "1"
    }
  }
}
```

With `autoIncrement: true`, EAS handles build numbers automatically.

## Release Options

### Automatic Release

Release immediately when approved:

```json
{
  "apple": {
    "release": {
      "automaticRelease": true
    }
  }
}
```

### Scheduled Release

```json
{
  "apple": {
    "release": {
      "automaticRelease": "2025-03-01T10:00:00Z"
    }
  }
}
```

### Phased Release

Gradual rollout over 7 days:

```json
{
  "apple": {
    "release": {
      "phasedRelease": true
    }
  }
}
```

Rollout: Day 1 (1%) → Day 2 (2%) → Day 3 (5%) → Day 4 (10%) → Day 5 (20%) → Day 6 (50%) → Day 7 (100%)

## Certificates and Provisioning

### Distribution Certificate

- Required for App Store submissions
- Limited to 3 per Apple Developer account
- Valid for 1 year
- EAS manages automatically

### Provisioning Profile

- Links app, certificate, and entitlements
- App Store profiles don't include device UDIDs
- EAS creates and manages automatically

### Check Current Credentials

```bash
eas credentials -p ios

# Sync with Apple Developer Portal
eas credentials -p ios --sync
```

## App Store Metadata

Use EAS Metadata to manage App Store listing from code:

```bash
# Pull existing metadata
eas metadata:pull

# Push changes
eas metadata:push
```

See ./app-store-metadata.md for detailed configuration.

## Troubleshooting

### "No suitable application records found"

Create the app in App Store Connect first with matching bundle ID.

### "The bundle version must be higher"

Increment build number. With `autoIncrement: true`, this is automatic.

### "Missing compliance information"

Add export compliance to `app.json`:

```json
{
  "expo": {
    "ios": {
      "config": {
        "usesNonExemptEncryption": false
      }
    }
  }
}
```

### "Invalid provisioning profile"

```bash
eas credentials -p ios --sync
```

### Build stuck in "Processing"

App Store Connect processing can take 5-30 minutes. Check status in App Store Connect → TestFlight.

## CI/CD Integration

For automated submissions in CI/CD:

```yaml
# .eas/workflows/release.yml
name: Release to App Store

on:
  push:
    tags: ['v*']

jobs:
  build:
    type: build
    params:
      platform: ios
      profile: production

  submit:
    type: submit
    needs: [build]
    params:
      platform: ios
      profile: production
```

## Tips

- Submit to TestFlight early and often for feedback
- Use beta app review for external testers to catch issues before App Store review
- Respond to reviewer questions promptly in App Store Connect
- Keep demo account credentials up to date
- Monitor App Store Connect notifications for review updates
- Use phased release for major updates to catch issues early

## Source Reference: references / play-store.md

# Submitting to Google Play Store

## Prerequisites

1. **Google Play Console Account** - Register at [play.google.com/console](https://play.google.com/console)
2. **App Created in Console** - Create your app listing before first submission
3. **Service Account** - For automated submissions via EAS

## Service Account Setup

### 1. Create Service Account

1. Go to Google Cloud Console → IAM & Admin → Service Accounts
2. Create a new service account
3. Grant the "Service Account User" role
4. Create and download a JSON key

### 2. Link to Play Console

1. Go to Play Console → Setup → API access
2. Click "Link" next to your Google Cloud project
3. Under "Service accounts", click "Manage Play Console permissions"
4. Grant "Release to production" permission (or appropriate track permissions)

### 3. Configure EAS

Add the service account key path to `eas.json`:

```json
{
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

Store the key file securely and add it to `.gitignore`.

## Environment Variables

For CI/CD, use environment variables instead of file paths:

```bash
# Base64-encoded service account JSON
EXPO_ANDROID_SERVICE_ACCOUNT_KEY_BASE64=...
```

Or use EAS Secrets:

```bash
eas secret:create --name GOOGLE_SERVICE_ACCOUNT --value "$(cat google-service-account.json)" --type file
```

Then reference in `eas.json`:

```json
{
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "@secret:GOOGLE_SERVICE_ACCOUNT"
      }
    }
  }
}
```

## Release Tracks

Google Play uses tracks for staged rollouts:

| Track | Purpose |
|-------|---------|
| `internal` | Internal testing (up to 100 testers) |
| `alpha` | Closed testing |
| `beta` | Open testing |
| `production` | Public release |

### Track Configuration

```json
{
  "submit": {
    "production": {
      "android": {
        "track": "production",
        "releaseStatus": "completed"
      }
    },
    "internal": {
      "android": {
        "track": "internal",
        "releaseStatus": "completed"
      }
    }
  }
}
```

### Release Status Options

- `completed` - Immediately available on the track
- `draft` - Upload only, release manually in Console
- `halted` - Pause an in-progress rollout
- `inProgress` - Staged rollout (requires `rollout` percentage)

## Staged Rollout

```json
{
  "submit": {
    "production": {
      "android": {
        "track": "production",
        "releaseStatus": "inProgress",
        "rollout": 0.1
      }
    }
  }
}
```

This releases to 10% of users. Increase via Play Console or subsequent submissions.

## Submission Commands

```bash
# Build and submit to internal track
eas build -p android --profile production --submit

# Submit existing build to Play Store
eas submit -p android --latest

# Submit specific build
eas submit -p android --id BUILD_ID
```

## App Signing

### Google Play App Signing (Recommended)

EAS uses Google Play App Signing by default:

1. First upload: EAS creates upload key, Play Store manages signing key
2. Play Store re-signs your app with the signing key
3. Upload key can be reset if compromised

### Checking Signing Status

```bash
eas credentials -p android
```

## Version Codes

Android requires incrementing `versionCode` for each upload:

```json
{
  "build": {
    "production": {
      "autoIncrement": true
    }
  }
}
```

With `appVersionSource: "remote"`, EAS tracks version codes automatically.

## First Submission Checklist

Before your first Play Store submission:

- [ ] Create app in Google Play Console
- [ ] Complete app content declaration (privacy policy, ads, etc.)
- [ ] Set up store listing (title, description, screenshots)
- [ ] Complete content rating questionnaire
- [ ] Set up pricing and distribution
- [ ] Create service account with proper permissions
- [ ] Configure `eas.json` with service account path

## Common Issues

### "App not found"

The app must exist in Play Console before EAS can submit. Create it manually first.

### "Version code already used"

Increment `versionCode` in `app.json` or use `autoIncrement: true` in `eas.json`.

### "Service account lacks permission"

Ensure the service account has "Release to production" permission in Play Console → API access.

### "APK not acceptable"

Play Store requires AAB (Android App Bundle) for new apps:

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

## Internal Testing Distribution

For quick internal distribution without Play Store:

```bash
# Build with internal distribution
eas build -p android --profile development

# Share the APK link with testers
```

Or use EAS Update for OTA updates to existing installs.

## Monitoring Submissions

```bash
# Check submission status
eas submit:list -p android

# View specific submission
eas submit:view SUBMISSION_ID
```

## Tips

- Start with `internal` track for testing before production
- Use staged rollouts for production releases
- Keep service account key secure - never commit to git
- Set up Play Console notifications for review status
- Pre-launch reports in Play Console catch issues before review

## Source Reference: references / testflight.md

# TestFlight

Always ship to TestFlight first. Internal testers, then external testers, then App Store. Never skip this.

## Submit

```bash
npx testflight
```

That's it. One command builds and submits to TestFlight.

## Skip the Prompts

Set these once and forget:

```bash
EXPO_APPLE_ID=you@email.com
EXPO_APPLE_TEAM_ID=XXXXXXXXXX
```

The CLI prints your Team ID when you run `npx testflight`. Copy it.

## Why TestFlight First

- Internal testers get builds instantly (no review)
- External testers require one Beta App Review, then instant updates
- Catch crashes before App Store review rejects you
- TestFlight crash reports are better than App Store crash reports
- 90 days to test before builds expire
- Real users on real devices, not simulators

## Tester Strategy

**Internal (100 max)**: Your team. Immediate access. Use for every build.

**External (10,000 max)**: Beta users. First build needs review (~24h), then instant. Always have an external group—even if it's just friends. Real feedback beats assumptions.

## Tips

- Submit to external TestFlight the moment internal looks stable
- Beta App Review is faster and more lenient than App Store Review
- Add release notes—testers actually read them
- Use TestFlight's built-in feedback and screenshots
- Never go straight to App Store. Ever.

## Troubleshooting

**"No suitable application records found"**
Create the app in App Store Connect first. Bundle ID must match.

**"The bundle version must be higher"**
Use `autoIncrement: true` in `eas.json`. Problem solved.

**Credentials issues**
```bash
eas credentials -p ios
```

## Source Reference: references / workflows.md

# EAS Workflows

Automate builds, submissions, and deployments with EAS Workflows.

## Web Deployment

Deploy web apps on push to main:

`.eas/workflows/deploy.yml`

```yaml
name: Deploy

on:
  push:
    branches:
      - main

# https://docs.expo.dev/eas/workflows/syntax/#deploy
jobs:
  deploy_web:
    type: deploy
    params:
      prod: true
```

## PR Previews

### Web PR Previews

```yaml
name: Web PR Preview

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  preview:
    type: deploy
    params:
      prod: false
```

### Native PR Previews with EAS Updates

Deploy OTA updates for pull requests:

```yaml
name: PR Preview

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  publish:
    type: update
    params:
      branch: "pr-${{ github.event.pull_request.number }}"
      message: "PR #${{ github.event.pull_request.number }}"
```

## Production Release

Complete release workflow for both platforms:

```yaml
name: Release

on:
  push:
    tags: ['v*']

jobs:
  build-ios:
    type: build
    params:
      platform: ios
      profile: production

  build-android:
    type: build
    params:
      platform: android
      profile: production

  submit-ios:
    type: submit
    needs: [build-ios]
    params:
      platform: ios
      profile: production

  submit-android:
    type: submit
    needs: [build-android]
    params:
      platform: android
      profile: production
```

## Build on Push

Trigger builds when pushing to specific branches:

```yaml
name: Build

on:
  push:
    branches:
      - main
      - release/*

jobs:
  build:
    type: build
    params:
      platform: all
      profile: production
```

## Conditional Jobs

Run jobs based on conditions:

```yaml
name: Conditional Release

on:
  push:
    branches: [main]

jobs:
  check-changes:
    type: run
    params:
      command: |
        if git diff --name-only HEAD~1 | grep -q "^src/"; then
          echo "has_changes=true" >> $GITHUB_OUTPUT
        fi

  build:
    type: build
    needs: [check-changes]
    if: needs.check-changes.outputs.has_changes == 'true'
    params:
      platform: all
      profile: production
```

## Workflow Syntax Reference

### Triggers

```yaml
on:
  push:
    branches: [main, develop]
    tags: ['v*']
  pull_request:
    types: [opened, synchronize, reopened]
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight
  workflow_dispatch:  # Manual trigger
```

### Job Types

| Type | Purpose |
|------|---------|
| `build` | Create app builds |
| `submit` | Submit to app stores |
| `update` | Publish OTA updates |
| `deploy` | Deploy web apps |
| `run` | Execute custom commands |

### Job Dependencies

```yaml
jobs:
  first:
    type: build
    params:
      platform: ios

  second:
    type: submit
    needs: [first]  # Runs after 'first' completes
    params:
      platform: ios
```

## Tips

- Use `workflow_dispatch` for manual production releases
- Combine PR previews with GitHub status checks
- Use tags for versioned releases
- Keep sensitive values in EAS Secrets, not workflow files

