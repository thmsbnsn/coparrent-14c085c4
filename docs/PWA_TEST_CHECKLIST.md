# PWA Test Checklist

## Overview
This checklist documents manual QA steps for verifying PWA functionality on iOS and Android.
All testers must complete these steps before a release is considered PWA-ready.

---

## Part A: PWA Installability

### Android (Chrome/Edge)
- [ ] Visit app in Chrome
- [ ] Verify "Add to Home Screen" banner appears (or use menu)
- [ ] Install to Home Screen
- [ ] Verify app icon appears on Home Screen
- [ ] Open app - verify standalone mode (no browser chrome)
- [ ] Verify app works offline (airplane mode) - shows offline indicator

### iOS (Safari 16.4+)
- [ ] Visit app in Safari
- [ ] Tap Share button
- [ ] Tap "Add to Home Screen"
- [ ] Verify icon and name are correct
- [ ] Open app from Home Screen
- [ ] Verify standalone mode (status bar style correct)
- [ ] Verify app works offline - shows offline fallback

---

## Part B: Push Notifications

### Android
- [ ] Install PWA (or use browser)
- [ ] Navigate to Settings → Notifications
- [ ] Tap "Enable Notifications"
- [ ] Grant permission when prompted
- [ ] Verify "Subscribed" badge appears
- [ ] Navigate to /pwa-diagnostics
- [ ] Verify Push Subscribed = Yes
- [ ] Tap "Test Notification"
- [ ] Verify notification appears in system tray
- [ ] Tap notification → verify app opens to correct route

### iOS (PWA Mode Only)
- [ ] Install PWA to Home Screen first
- [ ] Open app from Home Screen
- [ ] Navigate to Settings → Notifications
- [ ] Tap "Enable Notifications"
- [ ] Grant permission when prompted
- [ ] Verify "Subscribed" badge appears
- [ ] Navigate to /pwa-diagnostics
- [ ] Verify Push Subscribed = Yes
- [ ] Tap "Test Notification"
- [ ] Verify notification appears
- [ ] Lock device → verify notification on lock screen
- [ ] Tap notification → verify app opens correctly

### iOS (Browser - Not Installed)
- [ ] Visit app in Safari (not installed)
- [ ] Navigate to Settings → Notifications
- [ ] Verify "Install Required" message appears
- [ ] Verify iOS installation instructions are shown

---

## Part C: Offline Behavior

### Network Resilience
- [ ] Load app while online
- [ ] Enable airplane mode
- [ ] Navigate between cached pages
- [ ] Verify offline indicator appears at top
- [ ] Verify destructive actions are disabled
- [ ] Verify "Try Again" button works when back online
- [ ] Verify data syncs when reconnected

### Service Worker Updates
- [ ] Load app
- [ ] Make a code change (dev) or wait for new version
- [ ] Refresh page
- [ ] Verify update prompt appears
- [ ] Tap "Refresh"
- [ ] Verify new version loads without broken state

---

## Part D: Diagnostics Verification

### /pwa-diagnostics Page
- [ ] Navigate to /pwa-diagnostics
- [ ] Verify Service Worker = Active
- [ ] Verify Manifest Detected = Yes
- [ ] Verify Display Mode shows correct value
- [ ] Verify Online Status is accurate
- [ ] Verify Platform detection is correct
- [ ] Verify Backend Health shows healthy
- [ ] Verify Push status reflects actual subscription state

---

## Part E: Error & Support Paths

### Error States
- [ ] Force an error (e.g., invalid route)
- [ ] Verify error boundary shows friendly message
- [ ] Verify "Contact Support" button is visible
- [ ] Tap button → verify navigates to /help/contact

### Help Center
- [ ] Navigate to /help
- [ ] Verify "Contact Support" section is visible
- [ ] Navigate to /help/contact
- [ ] Fill out and submit form
- [ ] Verify success message appears

### Settings
- [ ] Navigate to Settings
- [ ] Verify Help/Support link is accessible

---

## Sign-Off

| Platform | Tester | Date | Pass/Fail | Notes |
|----------|--------|------|-----------|-------|
| Android Chrome | | | | |
| Android Edge | | | | |
| iOS Safari (PWA) | | | | |
| iOS Safari (Browser) | | | | |
| Desktop Chrome | | | | |
| Desktop Safari | | | | |

---

## Automated Tests

The following E2E tests cover some of these scenarios:

```bash
# Run PWA tests
npx playwright test --grep "pwa"
```

- `e2e/pwa.spec.ts` - Service worker, offline fallback
- `e2e/route-audit.spec.ts` - All routes accessible

---

## Known Limitations

1. **iOS Browser Push**: Web Push only works in installed PWA mode on iOS 16.4+
2. **Background Sync**: Limited browser support, not fully reliable
3. **VAPID Keys**: Must be configured in production for real push delivery
4. **Offline Data**: Only cached views work offline; real-time features require connection
