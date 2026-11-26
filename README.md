# Hotspot Manager

A React Native app for tracking personal hotspot data on Android and iOS. Add devices and log their usage manually. The app stores the device list, budgets, and history locally.

- **Free** includes device tracking, daily, weekly and monthly budgets, activity, and a timer reminder. Weekly budgets start on Monday. The reminder appears in the app at expiry or when you return.
- **Pro** adds per-device caps, scheduled budgets, reminders, per-device reports, and CSV and JSON sharing. Schedules use local time. A device schedule sets that device's cap during its active window.

Use system settings to start or stop the hotspot and manage connections. Android provides a shortcut to network settings. On iPhone, open **Settings → Personal Hotspot**.

## Test builds

The **Mobile test builds** GitHub Actions workflow builds an Android test APK and an iOS Simulator app on pull requests. You can also run it manually once the workflow is available on the default branch. Both builds bundle JavaScript and run without Metro.

### Android

With Node 22.11+, a JDK 17 installation, and the Android SDK configured, run:

```powershell
npm ci
cd android
.\gradlew.bat :app:assembleRelease "-PreactNativeArchitectures=arm64-v8a,x86_64"
```

Install `android/app/build/outputs/apk/release/app-release.apk` on an ARM64 phone or x86_64 emulator. This test APK uses the repository's debug signing key.

### iOS

Download and extract the **HotspotManager-iOS-Simulator** artifact on a Mac with Xcode. Boot an iPhone simulator, then run:

```sh
xcrun simctl install booted /path/to/HotspotManager.app
```

The Simulator artifact targets the architecture of its macOS runner. To build locally, run `npm ci` and `cd ios && pod install`, then open `HotspotManager.xcworkspace` in Xcode. Choose the **HotspotManager** scheme and an iPhone simulator. Use a registered development device or TestFlight with your Apple signing configuration for a physical iPhone.

## RevenueCat

Set the platform SDK keys in [src/config/revenueCat.ts](src/config/revenueCat.ts). Attach the store products to the `premium` entitlement and add them to the current offering. Use store sandbox accounts to test purchase and restore.

## Checks

```sh
npm test -- --watch=false --runInBand
npm run lint
npx tsc --noEmit
```
