# PWA Test Checklist

> **Version**: 2.1  
> **Status**: Production  
> **Last Updated**: 2026-02-06

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
- [ ] Verify notification appears in system tray when triggered
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
- [ ] Verify notification appears when triggered
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
- [ ] Make a code change or wait for new version
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
- [ ] Verify all 14 help topic cards are visible
- [ ] Verify each topic opens its full article
- [ ] Verify safety disclaimers present on health/legal articles
- [ ] Verify "Contact Support" section is visible
- [ ] Navigate to /help/contact
- [ ] Fill out and submit form
- [ ] Verify success message appears

### Settings
- [ ] Navigate to Settings
- [ ] Verify Help/Support link is accessible

---

## Part F: Admin Push Testing

### Admin Dashboard
- [ ] Navigate to /admin (as admin user)
- [ ] Go to Push tab
- [ ] Enter test message
- [ ] Tap "Send Test Push"
- [ ] Verify notification arrives on device
- [ ] Verify audit log entry created (check Audit tab)

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
| Desktop Firefox | | | | |

---

## Automated Tests

The following E2E tests cover some of these scenarios:

```bash
# Run PWA tests
npx playwright test --grep "pwa"
```

Test files:
- `tests/e2e/core-features.spec.ts` - Route accessibility
- `tests/e2e/auth.spec.ts` - Authentication flows
- `tests/e2e/subscription-gating.spec.ts` - Feature gating

---

## Known Limitations

1. **iOS Browser Push**: Web Push only works in installed PWA mode on iOS 16.4+
2. **Background Sync**: Limited browser support, not fully reliable
3. **VAPID Keys**: Must be configured in production for real push delivery
4. **Offline Data**: Only cached views work offline; real-time features require connection

---

## Production Readiness Checklist

Before production launch:

- [ ] VAPID keys configured in secrets
- [ ] Service worker registered and active
- [ ] Manifest serves correctly
- [ ] Push subscriptions persisting
- [ ] Offline fallback page functional
- [ ] Update prompt working
- [ ] All platforms tested per above
- [ ] Help Center verified (all 14 articles accessible)

---

## Related Documentation

- `docs/SECURITY_MODEL.md` - Security architecture
- `docs/GATED_FEATURES.md` - Feature access rules
- `docs/INVESTOR_HANDOFF.md` - Investor-facing project overview
- `README.md` - Project overview

---

_End of PWA Test Checklist_