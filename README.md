# Hotspot Manager (Capability-Tiered)

Bare React Native app for managing a personal hotspot with Android-first native control and iOS compatibility mode.

## Free Features

- Device management: view connected devices, block/unblock
- Basic data limit settings
- Hotspot timer

## Premium Features

- Specific data scheduling
- Detailed per-device usage reports
- Custom data plans for connected users

Premium access is controlled by RevenueCat entitlement: `premium`.

## Architecture Summary

- Capability tiers:
  - Tier A: full native control
  - Tier B: partial control with fallback guidance
  - Tier C: compatibility mode
- State: Redux Toolkit (`hotspot` + `subscription` slices)
- Persistence: SQLite migrations/repositories
- Billing: RevenueCat (`react-native-purchases`)
- Native Android bridge: `android/app/src/main/java/com/hotspotmanager/hotspot`

## Configure RevenueCat

Set API keys in [revenueCat.ts](C:/Users/USER/Downloads/Documents/Codes/hotspot-manager/HotspotManager/src/config/revenueCat.ts):

- `REVENUECAT_ANDROID_API_KEY`
- `REVENUECAT_IOS_API_KEY`

Create an entitlement named `premium` and attach your products/packages in RevenueCat.

## Run

```bash
npm install
npm start
```

In a second terminal:

```bash
npm run android
```

## Verify

```bash
npm test -- --watch=false
npm run lint
npx tsc --noEmit
```

## Android Build Note

`./gradlew.bat assembleDebug` requires Android SDK configuration:

- Set `ANDROID_HOME`, or
- add `sdk.dir=...` in `android/local.properties`.

## iOS Note

iOS hotspot system-level controls are restricted. The app runs in compatibility mode for unsupported actions while preserving scheduling/reporting/plan UX and billing state.
