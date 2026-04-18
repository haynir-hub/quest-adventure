# Desktop Adventure Creator — Design Spec

**Date:** 2026-04-18
**Status:** Approved for implementation

## Background

The current `AdventureCreator` was built for mobile. The map is capped at `h-[60vh]`, shrinks as missions accumulate, and switches between Step 2 (map) and Step 3 (edit form) causing context loss. The user experience is confusing and full of friction.

**Split:** Adventure _creation_ happens on desktop. Adventure _playing_ happens on mobile. The creator shares a QR/link with themselves and opens it on their phone.

---

## Design

### Layout

`AdventureCreator` becomes a full-screen desktop two-column layout:

```
┌──────────────────────────────┬────────────────────┐
│                              │  📍 נקודות משימה   │
│                              │                    │
│        MAP (flex:1)          │  [1] תפיסת פיקאצ'ו │
│     full viewport height     │  [2] משימה 2       │
│                              │                    │
│                              │  ── edit form ──   │
│  click to add marker         │  [inline, no nav]  │
│                              │                    │
│                              │  ── footer ──      │
│                              │  [name input]      │
│                              │  [💾 שמור]         │
│                              │  [QR + link]       │
└──────────────────────────────┴────────────────────┘
```

- **Left pane:** `MapContainer` at 100vh, no height cap. Leaflet `zoomControl` visible.
- **Right panel:** fixed 360px width. Three zones stacked vertically:
  1. Mission list (scrollable) with ↑/↓ reorder buttons
  2. Inline edit form (replaces the Step 3 full-screen switch entirely)
  3. Footer: adventure name input + save button + QR/share section

### World Selector

Displayed as a centered modal/overlay on first open, before the two-column layout is active. Dismissed when a world is selected. Not a "step" in a stepper — the stepper UI is removed entirely.

### Interaction Flow

1. Open creator → world selector modal appears
2. Pick world → modal closes, map centers on user location
3. Click map → numbered marker added, inline edit form opens in right panel
4. Click existing marker → edit form updates to that mission (map stays put)
5. Edit form: entity picker, title, description, activity type, amount
6. Save mission → form closes, marker stays on map
7. Fill adventure name → "שמור הרפתקה" button activates
8. Save adventure → stored to localStorage, QR + copy-link appear in footer

### Inline Edit Form

Replaces `step === 3` entirely. State: `selectedMissionIndex: number | null`. When `null`, form is hidden and replaced by an "add more points" hint. No page navigation on mission tap.

The entity `<select>` must reflect the current saved value (fix: use `value=` not `defaultValue=`).

### Share / QR

After save:

- Deep-link URL: `?adventure=BASE64` (existing Task 5.2 mechanism)
- **Copy link** button: `navigator.clipboard.writeText(url)`
- **QR code**: generated client-side using `qrcode` npm package (~15 KB gzipped), rendered as canvas in the footer panel
- Mobile player scans QR → PWA opens → deep-link import loads the adventure directly into play mode

---

## Component Changes

| File                   | Change                                           |
| ---------------------- | ------------------------------------------------ |
| `AdventureCreator.tsx` | Full rewrite of layout and step logic            |
| `AdventureCreator.tsx` | Remove Step 2/3 stepper; remove `step` state     |
| `AdventureCreator.tsx` | Fix entity `<select>` to use controlled `value=` |
| `AdventureCreator.tsx` | Add `qrcode` package for QR generation           |
| `AdventureCreator.tsx` | Inline edit form replaces full-screen Step 3     |

---

## Out of Scope

- Mobile-responsive fallback for the creator (creator is desktop-only)
- Multi-user / collaborative editing
- Adventure editing after save (existing limitation, not addressed here)
