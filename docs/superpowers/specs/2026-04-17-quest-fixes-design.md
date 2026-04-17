# Quest Adventure — Full System Fix Design

**Date:** 2026-04-17  
**Approach:** Batch B — group fixes by category, 5 batches in sequence

---

## Overview

Quest Adventure is a location-based fitness PWA with 3 themed worlds (Mario, Pokémon, Treasure). A thorough audit found 16 issues across 4 categories: critical bugs, medium-severity issues, system gaps, and UX friction. This spec covers all fixes, organized into 5 implementation batches.

---

## Batch 1 — Assets

**Problem:** All Mario and Treasure world images are referenced in `worldThemes.ts` and `worldsData.ts` but the files don't exist in `/public/images/`. The AR camera view silently fails for these worlds.

**Fix:**

- Remove all `imageUrl` references pointing to non-existent Mario/Treasure image files from `worldThemes.ts` and `worldsData.ts`
- Replace with emoji-only representations (already supported as fallback — just make it the primary)
- In `ARCameraView.tsx`, replace `ui_mario_fireball.png` and `ui_pirate_net.png` throw-button images with themed emoji (`🔥` / `🪝`)
- Keep Pokémon images as-is (they exist and work)

**Files:** `worldThemes.ts`, `worldsData.ts`, `ARCameraView.tsx`

---

## Batch 2 — Error Handling + Permissions

**Problems:**

1. Fallback GPS coordinates (Tel Aviv: 32.0853, 34.7818) are hardcoded in 3 separate files
2. GPS denial/timeout shows no UI feedback — user sees wrong map silently
3. Camera denial shows a black screen with no explanation
4. localStorage parse errors crash the app with no recovery path
5. iOS Safari: Web Audio API requires a direct user gesture; current code silently fails

**Fixes:**

### 2a. Shared location constant

Create `src/constants.ts` exporting:

```ts
export const DEFAULT_LOCATION = { lat: 32.0853, lng: 34.7818 };
export const GPS_ARRIVAL_THRESHOLD_METERS = 30;
```

Replace all 3 hardcoded instances with this import.

### 2b. GPS permission error UI

In `useNavigation.ts`, expose a `gpsError: string | null` state. On denial or timeout, set a Hebrew error message. In `MapView.tsx`, render a dismissible banner at the top: `"לא הצלחנו לאתר את המיקום שלך. אנא אפשר גישה למיקום בהגדרות הדפדפן."` with a link to `chrome://settings` on Android or instructions for iOS Settings.

### 2c. Camera denial fallback UI

In `ARCameraView.tsx`, when camera access fails, show a themed full-screen fallback instead of black: world-colored background, the mission's emoji large in center, and a "המשך בלי מצלמה" button that advances to the mission screen.

### 2d. localStorage crash recovery

In `App.tsx`, wrap all `localStorage.getItem` + `JSON.parse` calls in individual try/catch blocks. On parse failure, clear the corrupted key and show a "משהו השתבש" screen with a single "התחל מחדש" button that calls `localStorage.clear()` and reloads.

### 2e. iOS audio fix

In `audio.ts`, do not call `audioCtx.resume()` directly. Instead, export a `primeAudio()` function that resumes the context. Call `primeAudio()` from the first user button tap in `MissionScreen.tsx` (the start/count button), so audio is unlocked by a real gesture.

**Files:** new `src/constants.ts`, `useNavigation.ts`, `MapView.tsx`, `ARCameraView.tsx`, `App.tsx`, `audio.ts`, `MissionScreen.tsx`

---

## Batch 3 — Compass Navigation Fix

**Problem:** `MapView.tsx` calculates a bearing angle toward the mission but never reads device heading. The directional arrow always points up (north), making it useless for navigation.

**Fix:**

- In `MapView.tsx`, add a `deviceHeading` state initialized to `null`
- Subscribe to `window.addEventListener('deviceorientation', ...)` on mount; unsubscribe on unmount
- On iOS 13+, call `DeviceOrientationEvent.requestPermission()` before subscribing (wrap in feature detection)
- Compute display angle: `(bearing - deviceHeading + 360) % 360`
- Apply as CSS `transform: rotate(Xdeg)` on the arrow element
- If `deviceHeading === null` (device doesn't support it), show static arrow + small text: `"הכיוון מחושב לפי GPS"`

**Files:** `MapView.tsx`, `useNavigation.ts` (expose `bearing` in return value if not already)

---

## Batch 4 — UX & Escape Hatches

### 4a. Onboarding splash (one-time)

Create `src/components/OnboardingScreen.tsx`: a single screen shown once before the first adventure. Displays in the world's theme colors with:

- App icon / logo
- Two-line explanation of GPS + Camera usage in Hebrew
- "בואו נתחיל!" button

Store `quest_onboarding_done: "true"` in localStorage on dismiss. Check this flag in `App.tsx` before showing HOME — if not set, render `OnboardingScreen` first.

### 4b. Skip mission (long-press)

In `MapView.tsx`, add a small `⋮` menu icon in the top-right corner. Tapping it shows a bottom sheet with a single option: "דלג על המשימה". On confirm via a `window.confirm()` dialog (`"לדלג על המשימה הזו?"`), advance `currentMissionIndex` exactly as a normal mission completion would. This requires passing an `onSkip` callback from `App.tsx` down to `MapView.tsx`.

### 4c. PWA install button — persistent

Move the install prompt `deferredPrompt` state and the install button out of the HOME-screen JSX. Render it as a floating button (bottom-right, `position: fixed`) that appears on all screens when `deferredPrompt` is set, dismissible per session via a separate `installDismissed` state.

### 4d. Adventure creator hints

In `AdventureCreator.tsx` step 2 (map placement), add a pulsing overlay tooltip: `"לחץ על המפה כדי להוסיף תחנה"`. Show it until the first marker is placed, then hide it.

### 4e. GPS fallback detection warning

In `MapView.tsx`, if the user's position matches `DEFAULT_LOCATION` (within 10m) and at least one mission is >500m away, show a non-blocking banner: `"נראה שה-GPS לא עובד. אנא בדוק את הגדרות המיקום."` with a manual "המשך בכל זאת" button that hides the banner.

**Files:** new `OnboardingScreen.tsx`, `App.tsx`, `MapView.tsx`, `AdventureCreator.tsx`

---

## Batch 5 — System Features

### 5a. Deep-link sharing

On the FINISH screen (end of all missions — not the per-mission REWARD screen), add a "שתף הרפתקה" button. On click:

- Encode the current adventure as base64 (already done for import)
- Construct `https://haynir-hub.github.io/quest-adventure/?adventure=BASE64`
- Use `navigator.share()` if available (mobile native share sheet), fall back to `navigator.clipboard.writeText(url)` with a "הקישור הועתק!" toast

On app load in `App.tsx`, check `new URLSearchParams(window.location.search).get('adventure')`. If present, decode and import the adventure directly, then navigate to the GAME_LIBRARY screen with it pre-selected.

### 5b. Mission reordering in creator

In `AdventureCreator.tsx` step 3 (mission edit list), add ↑ / ↓ arrow buttons next to each mission. On click, swap the mission with its neighbor in the array. Buttons are disabled at array boundaries (first item has no ↑, last has no ↓).

**Files:** `RewardScreen.tsx`, `App.tsx`, `AdventureCreator.tsx`

---

## Implementation Order

| Batch              | Scope                               | Risk       |
| ------------------ | ----------------------------------- | ---------- |
| 1 — Assets         | Remove broken refs, emoji fallbacks | Low        |
| 2 — Error handling | GPS/camera/localStorage/audio fixes | Medium     |
| 3 — Compass        | DeviceOrientation API wiring        | Medium     |
| 4 — UX             | Onboarding, skip, install, hints    | Low-Medium |
| 5 — Features       | Deep links, reordering              | Low        |

---

## Out of Scope

- Unit tests / E2E test suite
- New worlds beyond Mario, Pokémon, Treasure
- Backend / server-side storage
- Multi-player / social features
