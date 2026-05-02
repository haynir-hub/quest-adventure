# Mobile-First Creator & Map Search — Execution Result

**Plan:** [`2026-05-02-mobile-creator-and-search.md`](./2026-05-02-mobile-creator-and-search.md)
**Branch:** `feature/mobile-creator-2026-05-02` (NOT yet pushed; user prefers to push later when adding more design changes)
**Executed:** 2026-05-02
**Deployed live:** https://140-82-32-36.sslip.io/quest/ (rsync to Vultr VPS)

---

## Commits delivered (10 on branch, 9 of them new feature work)

| Hash      | Type  | Subject                                                       |
| --------- | ----- | ------------------------------------------------------------- |
| `ed3c32c` | fix   | GameState shape + workbox limit to unblock build (Batch 0)    |
| `689ecc1` | docs  | add mobile-first creator + map search autonomous plan         |
| `219f44b` | feat  | shared MapSearchControl with autocomplete + Israel bias       |
| `557f24b` | feat  | responsive creator — mobile bottom sheet, desktop sidebar     |
| `38bed55` | chore | mark batch 2 complete                                         |
| `5079b33` | feat  | where-to-create entry screen + remembered area                |
| `787531d` | chore | mark batch 3 complete                                         |
| `bcdd810` | fix   | mobile zoom controls, recenter, iOS compass, badge stickiness |
| `d40bcdc` | chore | mark batch 4 complete                                         |

**Diffstat vs `main`:** 7 files changed, 1083 insertions(+), 45 deletions(-)

---

## What shipped, by user-facing capability

1. **Search any address inside Israel from the creator and player maps.** Autocomplete dropdown, Hebrew biased, recent searches remembered, debounced 500ms.
2. **Creator works on a phone.** Map fills the screen; the editor is a bottom sheet with a drag handle (collapsed shows mission count, expanded shows full editor). Auto-expands on marker tap.
3. **"Where do you want to create?" entry screen.** Three options on first creation: GPS, address search, free pan from Israel-wide view. Selection persists across sessions; "🗺️ שנה אזור" button on the map resets it.
4. **In-game map mobile fixes.** Zoom buttons restored, floating recenter button (📍), iOS compass uses true north (`webkitCompassHeading` with Android fallback), distance card no longer overlaps the button stack.

---

## Frozen Decisions — honored

All 15 entries from the Frozen Decisions table were honored, with the following nuances logged below.

## Decisions Recorded During Execution (full list)

The plan file's "Decisions Recorded During Execution" section contains the verbatim entries. Summary of what deviated from the literal plan and why:

- **Batch 0** — pulled 2 hunks out of the pre-work stash to unblock the build (`App.tsx` GameState shape + `vite.config.ts` workbox limit). Rest of the stash remains untouched.
- **Batch 0** — QA Gate's tsc command corrected to `npx tsc -b --noEmit` (project references).
- **Batch 1** — `MapSearchControl` created from scratch (the original referenced version was in the stash, not committed).
- **Batch 2** — auto-expand on marker selection moved out of `useEffect` and into event handlers (`react-hooks/set-state-in-effect` lint rule).
- **Batch 2** — desktop layout retains pre-existing `flex-row-reverse + dir="rtl"` (sidebar left, map right). Plan's "sidebar on right, map on left" was a typo.
- **Batch 3** — `🔍 חיפוש כתובת` opens the map at Israel-wide view with the search input auto-focused, instead of an inline pre-map search (avoids duplicating ~200 lines of search logic).
- **Batch 3** — geolocation fallback removed; the green "user dot" is rendered only when GPS is available (no more spurious dot in Tel Aviv when user is elsewhere).
- **Batch 4** — recenter button rendered as **sibling** of `<MapContainer>`, with the map instance synced to a `useRef` via a tiny `<MapRefSync>` child. First attempt as a child placed the button at `top: -120` because of Leaflet's pane transforms.
- **Batch 4** — "satellite toggle" referenced in the plan's Task 4.3 doesn't exist in `main` (it's in the user's stash WIP), so the cleanup step only stacked recenter + zoom on the existing layout.
- **Batch 4** — distance-card overlap fix uses `left-[80px] md:left-4` (the buttons are on the LEFT, plan said `right-[80px]` which was a typo for the side).

## Lint baseline

| Stage   | Errors | Warnings |
| ------- | ------ | -------- |
| Batch 0 | 48     | 7        |
| Final   | 47     | 7        |

One pre-existing `react-hooks/set-state-in-effect` was eliminated when the geolocation fallback was removed in Batch 3. No new errors were introduced.

## Bundle size

| Stage    | JS (gzipped) | CSS (gzipped) |
| -------- | ------------ | ------------- |
| Baseline | 137.17 kB    | 12.98 kB      |
| Final    | 138.49 kB    | 13.30 kB      |
| Delta    | +1.32 kB     | +0.32 kB      |

Well within the "no chunk grew by >50KB" acceptance criterion.

---

## Known limitations

- **iOS compass** — fix verified against the spec (`webkitCompassHeading`), but Chrome DevTools cannot simulate `DeviceOrientationEvent.webkitCompassHeading`. Real-device test on an iPhone is still required to confirm true-north tracking.
- **Search rate limiting** — Nominatim's free tier allows ~1 req/sec. Current implementation debounces at 500ms which can spike to 2 req/sec under fast typing. If 429s appear in production, raise debounce to 1000ms (Frozen Decision #8).
- **PR not yet opened** — user requested deferring the `git push + gh pr create` step to a later session when more design polish is added.
- **Open feedback received post-deploy** — three UX issues reported by the user during live testing (mission editor covers map; search results dropdown hidden; map auto-recenters when free-panning). To be fixed in a follow-up before the next deploy.

## Server deployment

- Production target: `/var/www/quest-adventure/` on `root@140.82.32.36` (Vultr VPS, Frankfurt).
- Public URL: https://140-82-32-36.sslip.io/quest/ (Nginx reverse proxy with `/quest/` location alias).
- Build command: `VITE_BASE_PATH=/quest/ npm run build` (env var rewrites all asset paths and the manifest to be sub-path-correct).
- Sync command: `rsync -avz --delete --exclude='.DS_Store' dist/ root@140.82.32.36:/var/www/quest-adventure/`.
- **Pre-deploy backup:** `/var/www/quest-adventure.bak.20260502-091408` (49 MB). Roll back with `rm -rf /var/www/quest-adventure && mv /var/www/quest-adventure.bak.20260502-091408 /var/www/quest-adventure`.
- Smoke verification: `curl -k https://140-82-32-36.sslip.io/quest/` → 200, JS asset → 200.

---

## How to restore the pre-work stash

The pre-mobile-plan stash (~680 lines of WIP across MapView/MissionScreen/RewardScreen/WorldSelector/worldsData/worldThemes — including a satellite toggle and other features) was intentionally left in place.

```bash
git stash list
# look for: stash@{N}: On main: pre-mobile-plan-2026-05-02
git stash pop stash@{N}
```

After popping, expect merge conflicts with the new code in `MapView.tsx` (zoom/recenter/compass) and `AdventureCreator.tsx` (entry screen / bottom sheet). Resolve by keeping the new structure and re-applying the stash's feature additions on top.

---

## Out of scope (for follow-up plans)

- Drag-to-move existing markers (gesture conflict with map pan)
- Long-press to add waypoint
- Replanning Batches 4-5 of `2026-04-17-quest-fixes.md` (separate plan)
- Replacing Nominatim with a paid geocoder
- Re-integrating the satellite toggle from the stash
