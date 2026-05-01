# Mobile-First Creator & Map Search — Implementation Plan

**Date:** 2026-05-02
**Source feedback:** `_inbox/2026-04-18-1900-תיקונים-במשחק-adventures.md`
**Supersedes (in part):** Tasks 4.5 and 5.3 of `2026-04-17-quest-fixes.md` (they reference a wizard structure that no longer exists after commit `fd2ecd0`)
**Status:** Ready for autonomous execution

---

## Operating Mode: Fully Autonomous

This plan is designed to execute end-to-end without user confirmation. The implementing agent:

1. **Decides without asking.** All architectural choices are pre-resolved in the "Frozen Decisions" table below. If a new ambiguity arises mid-execution, the agent chooses the simpler/safer option, records the choice in this file under "Decisions Recorded During Execution", and continues.
2. **Runs the full QA Gate at the end of every batch.** Does not commit or proceed to the next batch unless every check passes.
3. **Auto-triggers `/clear` at 50-60% context utilization** between batches (never mid-task). Writes a self-contained resume prompt before pausing.
4. **Delivers a high-quality final product** — Batch 5 is a full integration QA pass + summary report + PR.

**Only human interaction allowed:** running `/clear` and pasting the resume prompt when prompted. Nothing else.

**Hard blockers** (genuinely unresolvable: missing API key, broken local environment, ambiguous user data) are documented in the "Blockers" section below, work is committed, and the agent stops with a clear explanation.

---

## Frozen Decisions

These are pre-resolved to avoid mid-execution decision points:

| #   | Decision                                           | Choice                                                                                                                                                                      | Reason                                                                                 |
| --- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 1   | Pre-work for 9 uncommitted files                   | `git stash push -m "pre-mobile-plan-2026-05-02"` (do not interpret)                                                                                                         | Preserves work; out of scope for this plan; user can restore later                     |
| 2   | Branch strategy                                    | Create `feature/mobile-creator-2026-05-02` from current `main` at start of Batch 0; PR at end of Batch 5                                                                    | Standard feature flow; doesn't pollute main                                            |
| 3   | Worktree                                           | Use repo root directly (no `.worktrees/`); the autonomous flow benefits from a single working copy                                                                          | Simpler; older `.worktrees/quest-fixes` referenced in `checkpoint.md` is stale anyway  |
| 4   | Zoom controls (Task 4.1)                           | `<ZoomControl position="bottomleft" />` from `react-leaflet`                                                                                                                | Native styling; less code than custom buttons                                          |
| 5   | Bottom-sheet animation (Task 2.2)                  | CSS-only via `transition-transform` on a `translate-y` toggle                                                                                                               | Zero new deps; performant on mobile; framework-agnostic                                |
| 6   | Recent searches                                    | `quest_recent_searches` localStorage key; JSON array of `{name, lat, lng}`; max 5; FIFO eviction                                                                            | Bounded; simple                                                                        |
| 7   | Geocoding bias                                     | `&countrycodes=il` always                                                                                                                                                   | Per source feedback (RH/PT example) — Israel-focused product                           |
| 8   | Search debounce                                    | 500ms initial; if `429 Too Many Requests` observed during QA, raise to 1000ms and add `Accept-Language: he` to existing request (already present)                           | Conservative; adaptive                                                                 |
| 9   | iOS compass formula                                | Prefer `(e as any).webkitCompassHeading`; fallback `360 - e.alpha`; if both null, leave heading as previous value                                                           | iOS exposes true compass via the webkit prop; Android `alpha` is normalized z-rotation |
| 10  | User-marker on creator map                         | Reuse the existing `userIcon` divIcon pattern from `MapView.tsx:207-212` (small green pulsing dot)                                                                          | Visual consistency across player and creator                                           |
| 11  | Where-to-create entry screen layout                | 3 vertical buttons on mobile, 3-column grid on desktop, single Tailwind `md:` breakpoint                                                                                    | Matches the "responsive without JS" approach used elsewhere                            |
| 12  | "Israel-wide view" coords for "בחר על המפה" option | `{ lat: 31.5, lng: 35.0 }`, zoom 8                                                                                                                                          | Centers Israel; comfortable starting view for free pan                                 |
| 13  | PR creation                                        | Best-effort via `gh pr create`. Failure is logged but not blocking — committed code is the deliverable                                                                      | `gh` may not be authenticated; not critical                                            |
| 14  | Browser QA tooling                                 | Chrome DevTools MCP if available (load via `ToolSearch` once at start of any browser-QA step). If not available, mark browser QA as "skipped — manual required" and proceed | Don't block on MCP availability                                                        |
| 15  | Stash restoration at end                           | Do **not** auto-restore the pre-work stash. Final summary tells the user how.                                                                                               | Safer — user reviews context before restoring                                          |

---

## Goal

`AdventureCreator` was rewritten as a desktop two-column layout in commit `fd2ecd0`, breaking mobile usability. The inbox feedback identifies:

1. **המפה במהלך משחק קשה ומסורבלת בנייד** — in-game map hard to operate on mobile
2. **יצירת משחק דרך הנייד לא ידידותית** — creating an adventure on mobile is unfriendly
3. **Plus:** planning an adventure in Ramat HaSharon while located in Petah Tikva requires manual map panning — the creator has no address/area search (though `MapView` already has one for the player)

## Tech Stack

React 19, TypeScript, Tailwind CSS, react-leaflet, Nominatim (OpenStreetMap geocoding, free, no API key), Geolocation API, DeviceOrientation API.

## Architecture

| Batch | Scope                                             | Independently shippable? |
| ----- | ------------------------------------------------- | ------------------------ |
| 0     | Pre-work: stash + branch + baseline QA            | Gating                   |
| 1     | Shared `MapSearchControl` (creator + player)      | Yes                      |
| 2     | Mobile-responsive Creator layout                  | Yes                      |
| 3     | "Where to create?" entry screen + remembered area | Yes                      |
| 4     | Player MapView mobile interaction fixes           | Yes                      |
| 5     | Final integration QA + summary + PR               | Final delivery           |

Each batch ends with the **QA Gate** (next section) — non-skippable.

---

## QA Gate (run at the end of every batch)

The agent does **not** commit or move to the next batch until every check below passes.

### Gate Step 1: Static checks

```bash
# A. TypeScript (must be clean)
npx tsc --noEmit

# B. Lint (warnings OK; errors not OK)
npm run lint

# C. Production build (must succeed)
npm run build
```

If any step fails: fix the issue, rerun until clean. Do not commit broken code.

### Gate Step 2: Browser functional + regression QA

**Tooling:** Chrome DevTools MCP. Load schemas once via `ToolSearch` with query `select:mcp__plugin_chrome-devtools-mcp_chrome-devtools__navigate_page,mcp__plugin_chrome-devtools-mcp_chrome-devtools__list_console_messages,mcp__plugin_chrome-devtools-mcp_chrome-devtools__take_screenshot,mcp__plugin_chrome-devtools-mcp_chrome-devtools__resize_page,mcp__plugin_chrome-devtools-mcp_chrome-devtools__click,mcp__plugin_chrome-devtools-mcp_chrome-devtools__fill,mcp__plugin_chrome-devtools-mcp_chrome-devtools__evaluate_script,mcp__plugin_chrome-devtools-mcp_chrome-devtools__new_page` (max_results 10). If MCP is unavailable: skip Step 2, document in plan, continue.

```bash
# Start dev server in background
npm run dev
```

Wait for `Local: http://localhost:5173/` line in output, then:

1. **Mobile viewport (375x667 — iPhone SE):**
   - Resize page to 375x667
   - Navigate to localhost:5173
   - Save screenshot to `.qa-screenshots/batch-N-mobile-home.png`
   - Run the batch-specific functional script (defined per batch)
   - List console messages — expect zero `error` level entries (warnings about React DevTools are fine)

2. **Desktop viewport (1440x900):**
   - Resize page to 1440x900
   - Reload
   - Save screenshot to `.qa-screenshots/batch-N-desktop-home.png`
   - Run the same functional script
   - Check console again

3. **Player-flow regression smoke test (both viewports):**
   - Navigate Home → World Selector → pick a world → Game Library → start any existing adventure → MapView
   - Verify map loads, distance card renders, no console errors
   - This runs in <30s and catches "broke the player while fixing the creator" regressions

Stop dev server (kill background process) before commit.

### Gate Step 3: Commit

Stage only files modified for this batch. Do **not** `git add -A` — that risks pulling in unrelated artifacts. Commit message format:

```
<type>: <batch summary>

<bullet list of what changed>

Refs: docs/superpowers/plans/2026-05-02-mobile-creator-and-search.md
```

`<type>`: `feat` for new behavior, `fix` for behavior corrections, `refactor` for non-behavioral cleanup.

### Gate Step 4: Update this plan

- Mark all completed `- [ ]` checkboxes as `- [x]`
- If any decision was made beyond the Frozen Decisions table, append it to the "Decisions Recorded During Execution" section at the bottom of this file
- Stage and commit the plan update separately: `chore(plan): mark batch N complete`

### Gate Step 5: Context check + maybe `/clear`

After commits land, evaluate context utilization. If at 50-60%, follow the **Context Management Protocol** below.

---

## Batch 0 — Pre-work: Stash, Branch, Baseline

**Why:** Establishes a clean working state on a feature branch before any code changes.

- [ ] Run `git status` to confirm 9 modified files match what `checkpoint.md` describes (sanity check)
- [ ] `git stash push -m "pre-mobile-plan-2026-05-02"` to preserve all uncommitted work
- [ ] Verify `git status` is now clean
- [ ] Create branch: `git checkout -b feature/mobile-creator-2026-05-02`
- [ ] Run baseline QA Gate Step 1 (tsc + lint + build) on clean main to confirm green starting point
- [ ] Browser QA Step 2 baseline: load app, take "before" screenshots at both viewports, save to `.qa-screenshots/baseline-mobile.png` and `.qa-screenshots/baseline-desktop.png`
- [ ] Add `.qa-screenshots/` to `.gitignore` (don't commit screenshots)
- [ ] Commit `.gitignore` update + create the directory: `chore: add .qa-screenshots to gitignore for plan execution`

**Acceptance:** On branch `feature/mobile-creator-2026-05-02`, working tree clean (except gitignored QA dir), all baseline static checks pass, baseline screenshots saved.

---

## Batch 1 — Shared Map Search Component

**Why:** Eliminates duplication, fixes the "search for an area" complaint, and gives the creator the same capability the player already has.

### Task 1.1 — Create `src/components/MapSearchControl.tsx`

Extract from `MapView.tsx:51-118`. Improvements:

- [ ] Replace `&limit=1` with `&limit=5`; render a dropdown of suggestions (auto-flying to the first result hides alternatives)
- [ ] Add `&countrycodes=il` to the URL — biases results to Israel
- [ ] Replace `onKeyDown=Enter` trigger with 500ms debounce on input change. Cancel pending fetch on new keystrokes via `AbortController`
- [ ] Add localStorage-backed recent searches: `quest_recent_searches`, capped at 5, shown when input is focused but empty
- [ ] Render a clear (✕) button inside the input when there's text
- [ ] Add a `User-Agent`-equivalent: include `email` query param if available, otherwise the `Accept-Language: he` header (already present) is sufficient

**Component shape:**

```ts
interface MapSearchControlProps {
  onSelect?: (lat: number, lng: number, displayName: string) => void;
}
```

The component uses `useMap()` internally to fly to results. The optional `onSelect` lets the creator persist the selected area.

### Task 1.2 — Replace `SearchControl` in `MapView.tsx`

- [ ] Delete the inline `SearchControl` function (lines 51-118)
- [ ] Import and use `<MapSearchControl />` inside the existing `<MapContainer>`
- [ ] No `onSelect` prop needed in player view — search just flies the map

### Task 1.3 — Add search to `AdventureCreator.tsx`

- [ ] Inside the `<MapContainer>` (around line 463), add `<MapSearchControl onSelect={(lat, lng) => setUserPos([lat, lng])} />`
- [ ] Update `FlyToUser` so it re-flies when `userPos` changes from search (currently guarded by `didFly.current` for one-time only)

### Batch 1 QA Gate

Static checks (tsc + lint + build).

**Functional script (run at both viewports):**

1. Open the creator (Home → "+ הרפתקה חדשה")
2. Pick world "מריו"
3. Wait for map to load
4. Type "רמת השרון" in the search box → verify dropdown shows ≥1 suggestion
5. Click the first suggestion → verify map flies to Ramat HaSharon
6. Click on the map → verify a numbered marker appears at the click point (in Ramat HaSharon, not Petah Tikva)
7. Console must show zero errors

**Regression script:** player-flow smoke test as defined in QA Gate Step 2.3.

**Commit:** `feat: shared MapSearchControl with autocomplete + Israel bias`

---

## Batch 2 — Mobile-Responsive Creator Layout

**Why:** The user's #1 complaint. Current `w-[360px]` sidebar leaves the map at ~15px on a 375px iPhone.

### Approach

Single component with Tailwind `md:` breakpoints. Mobile = full-screen map + bottom sheet. Desktop = sidebar (unchanged from current).

### Task 2.1 — Restructure layout

- [ ] Change root div from `flex flex-row-reverse` to `flex flex-col md:flex-row-reverse`
- [ ] Change sidebar from `w-[360px] min-w-[320px]` to `w-full md:w-[360px] md:min-w-[320px]`
- [ ] Add ordering: map gets `order-1`, sidebar gets `order-2` on mobile (so on desktop the row-reverse keeps sidebar on right; on mobile column means map first, sheet below)
- [ ] Map container: `flex-1 min-h-0` so it grows to fill remaining space

### Task 2.2 — Bottom-sheet behavior (mobile only)

- [ ] Add state: `const [sheetExpanded, setSheetExpanded] = useState(false)`
- [ ] Sidebar gets two heights based on state and viewport:
  - Mobile collapsed: `max-h-[140px]` (drag handle + summary row)
  - Mobile expanded: `max-h-[80vh]` (full editing UI)
  - Desktop: ignore the state, use `md:max-h-none`
- [ ] Animation: `transition-[max-height] duration-300 ease-out`
- [ ] Add a drag-handle bar at the top of the sheet (mobile only): a small horizontal pill with a tap area covering the top 32px that toggles `sheetExpanded`
- [ ] Auto-expand on marker selection: when `selectedIdx` becomes non-null on mobile, set `sheetExpanded = true`
- [ ] Auto-collapse on map click in empty area: if a click adds a new marker, expand; if a click on the map outside any marker doesn't add anything (it does, currently), keep expanded

### Task 2.3 — Show user-location marker on the creator map

- [ ] In `<MapContainer>`, add a `<Marker>` at `userPos` using a divIcon copied from `MapView.tsx:207-212` (small green pulsing dot)
- [ ] Critical UX: without this, the teacher doesn't know where they're standing relative to the markers they're placing

### Task 2.4 — Replace hardcoded fallback location

- [ ] `AdventureCreator.tsx:89,94` uses `[32.0853, 34.7818]`. Replace with `DEFAULT_LOCATION` from `src/constants.ts`
- [ ] `DEFAULT_LOCATION` is `{ lat, lng }` — convert to `[lat, lng]` tuple here

### Batch 2 QA Gate

Static checks.

**Functional script — mobile (375x667):**

1. Open creator → pick world
2. Verify map fills majority of viewport (≥60% of height)
3. Verify bottom sheet is collapsed by default, showing drag handle + mission count summary
4. Tap the drag handle → sheet expands to ~80% of viewport
5. Tap the drag handle again → sheet collapses
6. Tap the map → marker appears AND sheet auto-expands with edit panel for new marker
7. Verify user-location dot is visible on the map

**Functional script — desktop (1440x900):**

1. Open creator → pick world
2. Verify layout looks like before this batch (sidebar on right, map on left)
3. Tap on map → marker appears, sidebar shows edit panel inline
4. Verify user-location dot is visible

**Regression:** player-flow smoke test.

**Commit:** `feat: responsive creator — mobile bottom sheet, desktop sidebar`

---

## Batch 3 — "Where to Create?" Entry Screen

**Why:** A teacher planning a Ramat HaSharon adventure from home in Petah Tikva should not be auto-flown to Petah Tikva.

### Task 3.1 — Add entry-screen state

- [ ] In `AdventureCreator.tsx`, after world selection but before map render, gate on a new state `creatorArea: { lat: number; lng: number; name?: string } | null`
- [ ] On mount, check `localStorage.getItem('quest_creator_last_area')`. If present, parse and use as default. If not, leave `creatorArea = null` — show entry screen.
- [ ] If `creatorArea === null` AND `worldId !== null`, render the entry screen instead of the map UI

### Task 3.2 — Entry screen UI

Three buttons (vertical-stack on mobile, 3-column grid on desktop with `grid grid-cols-1 md:grid-cols-3 gap-4`):

- [ ] 📍 **המיקום שלי עכשיו** — calls `navigator.geolocation.getCurrentPosition`, on success sets `creatorArea = { lat, lng, name: 'מיקומי' }`. On failure: shows inline error and disables this button only.
- [ ] 🔍 **חיפוש כתובת** — opens an inline `MapSearchControl` (no map; just the search box). When user picks a result, set `creatorArea = { lat, lng, name }`.
- [ ] 🗺️ **בחר על המפה** — sets `creatorArea = { lat: 31.5, lng: 35.0, name: 'תצוגה ארצית' }`. The user pans freely from there.

### Task 3.3 — Persist + offer "change area"

- [ ] On `creatorArea` set, write `JSON.stringify({ lat, lng, name })` to `localStorage('quest_creator_last_area')`
- [ ] On the creator map, add a small "🗺️ שנה אזור" text button (top-right of the map area, mobile-friendly tap target ≥44px) that resets `creatorArea = null` and re-shows the entry screen

### Batch 3 QA Gate

Static checks.

**Functional script (both viewports):**

1. Clear localStorage in DevTools
2. Open creator → pick world → entry screen appears with 3 options
3. Click "חיפוש כתובת" → search box appears
4. Type "רמת השרון" → click first result
5. Map opens centered on Ramat HaSharon (verify by reading the visible area in screenshot)
6. Add a marker → it lands in Ramat HaSharon
7. Reload page → start new adventure → no entry screen shown (remembered area used)
8. Click "🗺️ שנה אזור" on the map → entry screen reappears
9. Choose "המיקום שלי עכשיו" → map flies to current location

**Regression:** player-flow smoke test.

**Commit:** `feat: where-to-create entry screen + remembered area`

---

## Batch 4 — Player MapView Mobile Fixes

**Why:** Addresses the in-game half of the user's #1 complaint.

### Task 4.1 — Re-enable zoom controls

- [ ] Import `ZoomControl` from `react-leaflet`
- [ ] In `<MapContainer>` keep `zoomControl={false}` (default position is top-right; we want bottom-left)
- [ ] Add `<ZoomControl position="bottomleft" />` as a child of `<MapContainer>`

### Task 4.2 — Recenter button

- [ ] Custom component (similar to `ChangeView`) that exposes a `flyToUser` callback via a render prop OR uses `useMap` directly
- [ ] Floating button (📍) that calls `map.flyTo([currentPosition.lat, currentPosition.lng], 17, { duration: 0.8 })`
- [ ] Disabled state if `currentPosition === null` (greyed out, no-op)
- [ ] Position: just above the zoom controls in the same column

### Task 4.3 — Z-index / position cleanup

Currently the satellite toggle (`bottom-[220px]`), distance card (`bottom-6`), and the new zoom + recenter buttons all use absolute positioning with magic offsets. This collides on phones.

- [ ] Replace satellite toggle's standalone position with a `flex flex-col gap-2` stack at `absolute bottom-6 left-4 z-[400]` containing: satellite toggle (top), recenter (middle), zoom controls (bottom — note that ZoomControl renders itself, so wrap in a sibling or accept that it self-positions; if hard to combine, keep ZoomControl at default `bottomleft` and stack our custom buttons above it at `bottom-[120px]`)
- [ ] Distance card stays at `bottom-6 left-4 right-4` but with `right-[80px]` on mobile (`md:right-4`) so it doesn't overlap the button stack

### Task 4.4 — iOS compass fix

- [ ] In `MapView.tsx:228-230`, replace the existing handler with:

```ts
const handler = (e: DeviceOrientationEvent) => {
  // iOS exposes true compass heading via this non-standard property
  const iosHeading = (e as unknown as { webkitCompassHeading?: number })
    .webkitCompassHeading;
  if (typeof iosHeading === "number") {
    setDeviceHeading(iosHeading);
  } else if (e.alpha !== null) {
    // Android: alpha is rotation around z-axis; subtract from 360 for compass-like behavior
    setDeviceHeading((360 - e.alpha + 360) % 360);
  }
};
```

- [ ] Without this fix, on iOS the compass arrow rotates relative to the device's _initial_ orientation when the page loaded, not relative to true north

### Task 4.5 — Verify "מיקום משוער" badge stickiness

- [ ] Trace the `gpsError` path: `useNavigation.ts:392` already calls `setGpsError(null)` on fresh position. Verify the badge in `MapView.tsx:407` actually disappears when GPS recovers.
- [ ] If sticky, derive badge from a `currentPosition.timestamp` freshness check instead of `gpsError` truthiness

### Batch 4 QA Gate

Static checks.

**Functional script (mobile viewport):**

1. Start any existing adventure → MapView
2. Verify zoom +/- buttons present at bottom-left
3. Tap zoom in → map zooms in. Tap zoom out → zooms out.
4. Tap recenter (📍) → map flies to user position
5. Toggle satellite → tile changes
6. Verify no overlap between distance card and any button at 375px wide
7. In DevTools Sensors panel, set Override to "Berlin" then back to "No override" — verify "מיקום משוער" badge appears and disappears in sync (this approximates GPS recovery)

**iOS compass test:** documented as "manual test required" in `.qa-screenshots/batch-4-notes.md` since DevTools cannot simulate `DeviceOrientationEvent.webkitCompassHeading`. The test instructions: open on a real iPhone, navigate to a mission, rotate the phone — arrow should consistently point at the next mission regardless of device rotation.

**Regression:** player-flow smoke test, plus run all of Batch 1-3 functional scripts to ensure none broke.

**Commit:** `fix: mobile zoom controls, recenter, iOS compass, badge stickiness`

---

## Batch 5 — Final Integration QA + Summary + PR

**Why:** End-to-end verification + handoff.

### Task 5.1 — Full integration QA

Run the **entire user journey** at both viewports:

1. **Creator end-to-end (mobile):**
   - Open creator → pick world → entry screen → "חיפוש כתובת" → "רמת השרון" → map opens in RH
   - Add 3 markers
   - Edit each via the bottom sheet
   - Reorder using ↑/↓
   - Save adventure → QR code + share URL appear
   - Copy share URL — verify it's a valid `quest-adventure?adventure=...` link

2. **Player end-to-end (mobile):**
   - Open Game Library → start the adventure created above
   - Map view loads with zoom controls and recenter button
   - Use spoof location to "arrive" at first mission
   - Mission screen → counter mission → tap to count → reach reward
   - Continue through all 3 missions → finish screen

3. **Desktop:** same flows at 1440x900

4. **Take final screenshots:** `.qa-screenshots/final-mobile-{home,creator-entry,creator-map,player-map,player-finish}.png` and same for desktop

### Task 5.2 — Bundle / perf sanity

- [ ] `npm run build` and inspect output. If any chunk grew by >50KB vs the baseline (Batch 0), investigate before merge.
- [ ] Check `dist/` for the expected files (`index.html`, hashed JS/CSS in `assets/`)

### Task 5.3 — Generate summary report

Create `docs/superpowers/plans/2026-05-02-mobile-creator-and-search-RESULT.md` with:

- Batches completed (with commit hashes)
- Frozen Decisions that were honored vs deviated from
- Decisions Recorded During Execution (any mid-flight choices)
- Known limitations (e.g., "iOS compass requires device test, not validated in DevTools")
- How to restore the pre-work stash if the user wants those changes back: `git stash list` then `git stash pop stash@{N}` (where N is the index of `pre-mobile-plan-2026-05-02`)

### Task 5.4 — PR (best-effort)

- [ ] `git push -u origin feature/mobile-creator-2026-05-02`
- [ ] `gh pr create --base main --title "..." --body "$(cat <<'EOF'... EOF)"` with body referencing the plan and the RESULT.md
- [ ] If `gh` fails (auth, no remote, etc.), log the failure and continue. The pushed branch + summary doc are the deliverable.

### Final Acceptance

- All batches committed on `feature/mobile-creator-2026-05-02`
- Final QA pass clean
- Summary doc exists and accurately reflects what shipped
- PR exists OR a clear note explains why not (and what to run manually)

---

## Context Management Protocol

### Trigger

Context utilization at **50-60%**, evaluated **after** any QA Gate (between batches or between numbered tasks within a batch — never mid-edit).

### When triggered, the agent does this autonomously

1. **Ensure clean working tree:** if there are uncommitted changes, finish the current task to a stable point and commit with the QA Gate. If that's not possible (mid-edit), commit a `wip:` prefixed commit and note it in the resume prompt.
2. **Update this plan:** check off completed tasks; add any non-obvious decisions to "Decisions Recorded During Execution".
3. **Print the resume prompt** (template below) directly to the user.
4. **Tell the user verbatim:**

   > **Context approaching 60% — pausing for `/clear`.**
   >
   > Run `/clear`, then paste this prompt to continue autonomous execution:
   >
   > ```
   > [resume prompt here]
   > ```

5. **Stop.** Do not continue work after the message above. Wait for the user to `/clear` and re-invoke.

### Resume Prompt Template

```
המשך עבודה אוטונומית מהתוכנית:
docs/superpowers/plans/2026-05-02-mobile-creator-and-search.md

מצב נוכחי: Batch [N] [batch-name] — [completed | in progress at Task N.M]
קומיט אחרון: [short-hash] [commit-message]
ענף עבודה: feature/mobile-creator-2026-05-02
הערות מה-session הקודם: [any non-obvious decisions / blockers / deviations NOT yet in the plan file]

הוראות:
1. קרא את התוכנית במלואה (היא מכילה Operating Mode + Frozen Decisions + QA Gate)
2. הרץ git status ו-git log --oneline -10 כדי לאמת את המצב
3. הרץ npx tsc --noEmit כדי לוודא בסיס ירוק
4. המשך אוטונומית מ-Batch [N+1] (או מהמשך Batch [N] אם לא הושלם)
5. אל תשאל אותי שאלות אישוריות — כל ההחלטות מוכנות בטבלת Frozen Decisions
6. בסיום כל batch הרץ את ה-QA Gate המלא
7. ב-50-60% context שוב, חזור על ה-protocol הזה
```

### Why this works

- **The plan file is the durable artifact.** Conversation context is disposable.
- The resume prompt restores only the **delta** — what was decided that isn't already in the plan.
- `git log` provides a second authoritative source: if resume prompt and plan disagree, `git log` is truth.
- The "אל תשאל שאלות אישוריות" line + Frozen Decisions table is what preserves autonomy across context-clears.

---

## Self-Review Checklist (every commit)

- [ ] `npx tsc --noEmit` clean
- [ ] `npm run lint` clean (warnings OK, errors no)
- [ ] `npm run build` succeeds
- [ ] Browser QA at both 375x667 and 1440x900 (or marked "MCP unavailable")
- [ ] Player-flow regression smoke test passes
- [ ] No new files committed that shouldn't be (`git status` reviewed)
- [ ] Hebrew text in UI strings reads naturally (not machine-translated tone)
- [ ] No `console.log` left in committed code

## Known Edge Cases

- **Nominatim rate limit:** 1 req/sec per public usage policy. With 500ms debounce, worst case is 2 req/sec. If 429s observed in QA, raise debounce to 1000ms (covered in Frozen Decision #8).
- **iOS DeviceOrientation permission:** existing code (`MapView.tsx:227-242`) already handles `requestPermission()`. Batch 4.4 preserves this; only the heading-extraction logic changes.
- **localStorage quotas:** new keys add ~500 bytes total. Well under 5MB.
- **Backward compat:** existing saved adventures predate the area selector. They have a hardcoded center but no "creator area" — fine, it's only used at creation time.
- **Search + map-click:** in the creator, after a search-result `flyTo`, the next map click should add a marker at the new location. Verify `MapClickHandler` (lines 34-45) responds regardless of how the map got centered.
- **Stash restoration:** the pre-work stash (`pre-mobile-plan-2026-05-02`) is intentionally NOT auto-restored. The Final Summary explains how.

## Out of Scope

- Drag-to-move existing markers (deferred — needs careful touch handling)
- Long-press to add waypoint (deferred — risk of conflict with map-pan gesture)
- Re-planning batches 4-5 of `2026-04-17-quest-fixes.md` (separate plan after this ships)
- Replacing Nominatim with a paid geocoder (only if rate-limiting is observed in production)

---

## Decisions Recorded During Execution

> Append below as the plan executes. Each entry: `Batch N.M — <decision> — <reason>`.

- **Batch 0 — Partial override of Frozen Decision #1.** The stash contained two changes that were required to get a green baseline build: (a) `src/App.tsx` line 117-122: corrected `setGameState` shape to match `GameState` type (added `adventureId`, removed `collectedItems`/`score` which don't exist on the type) — without this `tsc -b` failed; (b) `vite.config.ts` line 41: added `workbox.maximumFileSizeToCacheInBytes: 10 * 1024 * 1024` — without this the PWA service-worker generation failed because the user's untracked `public/images/poppy-playtime/*.png` files exceed 2 MiB. **The remaining ~680 lines of stashed feature work in MapView/MissionScreen/RewardScreen/WorldSelector/worldsData/worldThemes are out of scope for this plan and remain stashed.**
- **Batch 0 — QA Gate static-check command corrected.** Plan said `npx tsc --noEmit` but this project uses TypeScript project references — that command misses errors caught only via `tsc -b`. From now on the QA Gate uses `npx tsc -b --noEmit` (or simply `npm run build` which runs `tsc -b && vite build`).
- **Batch 0 — Lint baseline note.** `npm run lint` reports 48 errors + 7 warnings on the existing codebase (mostly `react-hooks/set-state-in-effect` and pre-existing `no-explicit-any`). These pre-date this plan. Acceptance criterion adjusted: do not introduce _new_ lint errors. Final delivery (Batch 5) will compare error counts before/after to confirm no regressions.

## Blockers Encountered

> Append below if a hard blocker is hit. Each entry: `Batch N.M — <blocker> — <state of work> — <what user needs to unblock>`.

(empty — to be filled if needed)
