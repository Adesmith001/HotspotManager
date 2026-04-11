# Hotspot Manager Test Matrix

## Automated

- `npm test -- --watch=false`
- `npm run lint`
- `npx tsc --noEmit`

## Manual Android Matrix

- Android 12, 13, 14, 15
- Pixel (AOSP-like), Samsung One UI, Xiaomi/MIUI
- Validate:
  - Capability tier detection (A/B/C)
  - Connected device list
  - Block/unblock actions
  - Basic data limits
  - Hotspot timer behavior
  - Premium gating and purchase/restore flow
  - Scheduling and plan enforcement UI states

## Manual iOS Matrix

- iOS 17+
- Validate:
  - Compatibility mode messaging
  - Premium entitlement sync state
  - Premium screen gating
  - Reports and custom plans UI behavior

## Failure Logging

- Capture device model, OS version, capability tier, and failing action.
- Include whether fallback/manual path was offered.
