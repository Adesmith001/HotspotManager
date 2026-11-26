# Hotspot Manager test matrix

## Android and iOS smoke tests

- Launch the standalone test build without Metro. Confirm a fresh install opens with no tracked devices.
- Add a device, rename it, mark it trusted, and log 100 MiB of usage. Reopen the app and confirm the data persists.
- Switch between daily, weekly, and monthly budgets and change the cap. Verify that logged usage appears in the correct calendar period and that threshold events appear in Activity.
- Start and stop the timer. Confirm an expired timer records an event and shows a reminder on returning to the app.
- Open Hotspot settings. Confirm Android opens network settings and iOS shows the Settings path.
- With RevenueCat sandbox products configured, purchase and restore Pro. Create a device cap and a scheduled budget. Log usage above each cap and confirm the corresponding activity event. Share the CSV and JSON from Insights.
- When upgrading from an earlier build, check that the sample devices and their usage are absent and that saved limits and timer settings persist.
