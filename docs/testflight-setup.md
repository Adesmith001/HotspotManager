# Uploading HotspotManager to TestFlight

The `Upload iOS build to TestFlight` GitHub Actions workflow creates a signed iPhone archive and uploads it to App Store Connect. GitHub-hosted runners cannot install an app directly over USB onto a physical iPhone; TestFlight is Apple's route for installing hosted builds.

## One-time Apple setup

1. Enroll in the Apple Developer Program and accept the current agreements.
2. In App Store Connect, create a new iOS app record for HotspotManager. Its bundle ID must exactly match the registered App ID used below. The workflow sets marketing version `1.0` and uses the GitHub Actions run number as the build number.
3. In App Store Connect, create an API key with **App Manager** access. Download its `.p8` private key once. Copy the Key ID, Issuer ID, and your 10-character Team ID.

## GitHub configuration

Open the repository's **Settings → Secrets and variables → Actions**.

Add these repository secrets:

- `APP_STORE_CONNECT_API_KEY_ID`: the API key's Key ID.
- `APP_STORE_CONNECT_API_ISSUER_ID`: the API key's Issuer ID.
- `APP_STORE_CONNECT_API_KEY_P8_BASE64`: Base64-encode the downloaded `.p8` file and paste the result. On PowerShell, use `[Convert]::ToBase64String([IO.File]::ReadAllBytes('AuthKey_XXXXXXXXXX.p8'))`.

Add these repository variables:

- `APPLE_TEAM_ID`: the 10-character Apple Developer Team ID.
- `IOS_BUNDLE_ID`: the registered reverse-DNS bundle ID associated with the App Store Connect app record.

Then open **Actions → Upload iOS build to TestFlight → Run workflow** and run it on the `codex/ios-device-build` branch. The workflow will stop with a clear configuration error if any values are missing.

After upload, Apple processes the build. Add your Apple Account as an internal tester in App Store Connect, install TestFlight on the iPhone, and accept the invitation. External testers may need Apple's beta review. TestFlight builds expire after 90 days.

## What the workflow signs

Xcode automatic signing uses the App Store Connect API key and Team ID to create or fetch distribution signing assets. The bundle ID must be registered to that developer team, and the API key needs permission to manage the app and signing resources. The workflow does not store signing certificates or private keys in the repository.
