# Desktop Adventure Creator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite `AdventureCreator` as a full-screen desktop two-column layout — big map on the left, mission list + inline edit form on the right — replacing the broken mobile step-based UI.

**Architecture:** Single component rewrite of `AdventureCreator.tsx`. A new `src/utils/share.ts` extracts the share-URL builder (shared with `App.tsx`). The `qrcode` npm package renders a QR canvas inline in the right panel after save.

**Tech Stack:** React 19, TypeScript, Leaflet / react-leaflet, Tailwind CSS, `qrcode` npm package

---

## File Map

| File                                  | Action  | Purpose                                                           |
| ------------------------------------- | ------- | ----------------------------------------------------------------- |
| `src/utils/share.ts`                  | Create  | Builds base64 deep-link URL; shared by App.tsx + AdventureCreator |
| `src/App.tsx`                         | Modify  | Import `buildShareUrl` from share.ts instead of inlining          |
| `src/components/AdventureCreator.tsx` | Rewrite | Full desktop two-column layout                                    |
| `package.json` / `package-lock.json`  | Modify  | Add `qrcode` + `@types/qrcode`                                    |

---

## Task 1: Install QR dependency + extract share utility

**Files:**

- Create: `src/utils/share.ts`
- Modify: `src/App.tsx` (lines ~689–696 — inline URL builder)

- [ ] **Step 1: Install packages**

```bash
cd "/Users/haynir/Documents/WebApps _by_HayNir/quest-adventure"
npm install qrcode
npm install --save-dev @types/qrcode
```

Expected: No errors, `qrcode` appears in `package.json` dependencies.

- [ ] **Step 2: Create `src/utils/share.ts`**

```typescript
import type { Adventure } from "../types/index";

export function buildShareUrl(adventure: Adventure): string {
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(adventure))));
  return `${window.location.origin}${window.location.pathname}?adventure=${encoded}`;
}
```

- [ ] **Step 3: Update `App.tsx` to use `buildShareUrl`**

Find the `handleShare` function in `App.tsx` (around line 687). Replace the inline URL builder:

```typescript
// Add import at top of App.tsx:
import { buildShareUrl } from "./utils/share";

// Replace the handleShare function body:
const handleShare = async () => {
  if (!currentAdventure) return;
  const url = buildShareUrl(currentAdventure);
  if (navigator.share) {
    await navigator.share({ title: currentAdventure.name, url });
  } else {
    await navigator.clipboard.writeText(url);
    alert("הקישור הועתק ללוח!");
  }
};
```

- [ ] **Step 4: TypeScript check**

```bash
cd "/Users/haynir/Documents/WebApps _by_HayNir/quest-adventure"
./node_modules/.bin/tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add src/utils/share.ts src/App.tsx package.json package-lock.json
git commit -m "feat: extract buildShareUrl utility, install qrcode"
```

---

## Task 2: Skeleton — two-column layout + world selector modal

**Files:**

- Modify: `src/components/AdventureCreator.tsx` (full rewrite begins here)

The goal of this task is to get the structural shell rendering correctly with no broken state. Map and panel content come in later tasks.

- [ ] **Step 1: Replace `AdventureCreator.tsx` with the skeleton**

Replace the entire file with:

```typescript
import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import QRCode from "qrcode";
import type { Mission, Adventure } from "../types/index";
import WorldSelector from "./WorldSelector";
import { worldThemes } from "../worlds/worldThemes";
import { buildShareUrl } from "../utils/share";

// Fix default marker icons (Leaflet + Vite issue)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface AdventureCreatorProps {
  onClose: () => void;
}

const MapClickHandler = ({
  onMapClick,
}: {
  onMapClick: (lat: number, lng: number) => void;
}) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const FlyToUser = ({ center }: { center: [number, number] | null }) => {
  const map = useMap();
  const didFly = useRef(false);
  useEffect(() => {
    if (center && !didFly.current) {
      didFly.current = true;
      map.setView(center, 16);
    }
  }, [center, map]);
  return null;
};

const InvalidateSize = () => {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(t);
  }, [map]);
  return null;
};

const AdventureCreator: React.FC<AdventureCreatorProps> = ({ onClose }) => {
  const [worldId, setWorldId] = useState<string | null>(null);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [missions, setMissions] = useState<Partial<Mission>[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [adventureName, setAdventureName] = useState("");
  const [savedAdventure, setSavedAdventure] = useState<Adventure | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setUserPos([32.0853, 34.7818]);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => setUserPos([32.0853, 34.7818])
    );
  }, []);

  // Render QR into canvas whenever savedAdventure changes
  useEffect(() => {
    if (savedAdventure && qrCanvasRef.current) {
      QRCode.toCanvas(qrCanvasRef.current, shareUrl, { width: 160 });
    }
  }, [savedAdventure, shareUrl]);

  const theme =
    worldId
      ? worldThemes[worldId === "treasure" ? "treasures" : worldId]
      : null;

  const createNumberedIcon = (n: number) =>
    L.divIcon({
      className: "",
      html: `<div style="width:32px;height:32px;background:#3b82f6;color:#fff;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;box-shadow:0 2px 8px rgba(59,130,246,.5)">${n}</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

  const handleMapClick = (lat: number, lng: number) => {
    const newMission: Partial<Mission> = {
      id: uuidv4(),
      lat,
      lng,
      missionType: "",
      amount: "",
      title: `משימה ${missions.length + 1}`,
      description: "",
    };
    setMissions((prev) => [...prev, newMission]);
    setSelectedIdx(missions.length);
  };

  const handleReorder = (idx: number, dir: -1 | 1) => {
    const next = idx + dir;
    if (next < 0 || next >= missions.length) return;
    setMissions((prev) => {
      const arr = [...prev];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });
    setSelectedIdx(next);
  };

  const handleDeleteMission = () => {
    if (selectedIdx === null) return;
    setMissions((prev) => prev.filter((_, i) => i !== selectedIdx));
    setSelectedIdx(null);
  };

  const handleSaveAdventure = () => {
    if (!worldId || !adventureName.trim() || missions.length === 0) return;
    const adventure: Adventure = {
      id: uuidv4(),
      name: adventureName.trim(),
      worldId,
      createdAt: Date.now(),
      missions: missions as Mission[],
    };
    const existing: Adventure[] = JSON.parse(
      localStorage.getItem("adventures") ?? "[]"
    );
    localStorage.setItem(
      "adventures",
      JSON.stringify([...existing, adventure])
    );
    const url = buildShareUrl(adventure);
    setShareUrl(url);
    setSavedAdventure(adventure);
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    alert("הקישור הועתק!");
  };

  const updateMissionField = <K extends keyof Mission>(
    idx: number,
    key: K,
    value: Mission[K]
  ) => {
    setMissions((prev) => {
      const arr = [...prev];
      arr[idx] = { ...arr[idx], [key]: value };
      return arr;
    });
  };

  // ── World selector modal (shown until world chosen) ──────────────────
  if (!worldId) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-8" dir="rtl">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 text-slate-500 hover:text-slate-800 text-2xl font-bold"
          >
            ✕
          </button>
          <WorldSelector onSelect={setWorldId} />
        </div>
      </div>
    );
  }

  // ── Main two-column desktop layout ───────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex flex-row-reverse" dir="rtl">
      {/* ── RIGHT PANEL ── */}
      <div className="w-[360px] min-w-[320px] flex flex-col bg-white border-l border-slate-200 shadow-xl overflow-hidden">

        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {theme?.missionPointName ?? "נקודות"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">לחץ על המפה להוספת נקודה</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xl font-bold w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        {/* Mission list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
          {missions.length === 0 && (
            <div className="text-center text-slate-400 text-sm py-8 border-2 border-dashed border-slate-200 rounded-2xl">
              <div className="text-3xl mb-2">👆</div>
              לחץ על המפה להוספת נקודת משימה ראשונה
            </div>
          )}

          {missions.map((m, i) => (
            <div
              key={m.id}
              onClick={() => setSelectedIdx(i)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
                selectedIdx === i
                  ? "border-blue-400 bg-blue-50"
                  : "border-slate-200 bg-slate-50 hover:border-blue-200 hover:bg-blue-50/50"
              }`}
            >
              <span className="w-7 h-7 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <span className="flex-1 text-sm font-medium text-slate-700 truncate">
                {m.title || `משימה ${i + 1}`}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleReorder(i, -1); }}
                  disabled={i === 0}
                  className="text-slate-400 hover:text-slate-700 disabled:opacity-20 w-7 h-7 flex items-center justify-center rounded hover:bg-slate-200"
                >↑</button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleReorder(i, 1); }}
                  disabled={i === missions.length - 1}
                  className="text-slate-400 hover:text-slate-700 disabled:opacity-20 w-7 h-7 flex items-center justify-center rounded hover:bg-slate-200"
                >↓</button>
              </div>
            </div>
          ))}

          {/* Inline edit form */}
          {selectedIdx !== null && missions[selectedIdx] && (
            <div className="mt-2 border-2 border-blue-200 bg-blue-50 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-blue-700 mb-3">
                ✏️ עריכת נקודה {selectedIdx + 1}
              </h3>

              {/* Entity picker */}
              {theme && (
                <div className="mb-3">
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    {theme.entityLabel}
                  </label>
                  <select
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:border-blue-400"
                    value={missions[selectedIdx]?.emoji
                      ? theme.missionEntities.find(
                          (e) => e.emoji === missions[selectedIdx]?.emoji
                        )?.name ?? ""
                      : ""}
                    onChange={(e) => {
                      const name = e.target.value;
                      const entity = theme.missionEntities.find(
                        (en) => en.name === name
                      );
                      if (!entity) return;
                      const actionPrefix =
                        worldId === "pokemon"
                          ? "תפיסת"
                          : worldId === "mario"
                          ? "איסוף/הבסת"
                          : "מציאת";
                      updateMissionField(selectedIdx, "title", `${actionPrefix} ${name}`);
                      updateMissionField(selectedIdx, "emoji", entity.emoji);
                      if (entity.imageUrl)
                        updateMissionField(selectedIdx, "imageUrl", entity.imageUrl);
                    }}
                  >
                    <option value="">בחר מהרשימה...</option>
                    {theme.missionEntities.map((en, idx) => (
                      <option key={idx} value={en.name}>
                        {en.emoji} {en.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Title */}
              <div className="mb-3">
                <label className="block text-xs font-bold text-slate-600 mb-1">כותרת</label>
                <input
                  type="text"
                  value={missions[selectedIdx]?.title ?? ""}
                  onChange={(e) => updateMissionField(selectedIdx, "title", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:border-blue-400"
                />
              </div>

              {/* Description */}
              <div className="mb-3">
                <label className="block text-xs font-bold text-slate-600 mb-1">תיאור (אופציונלי)</label>
                <textarea
                  value={missions[selectedIdx]?.description ?? ""}
                  onChange={(e) => updateMissionField(selectedIdx, "description", e.target.value)}
                  rows={2}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:border-blue-400 resize-none"
                  placeholder="לדוגמה: רוצו הכי מהר שאפשר!"
                />
              </div>

              {/* Type + Amount */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">סוג פעילות</label>
                  <input
                    type="text"
                    value={missions[selectedIdx]?.missionType ?? ""}
                    onChange={(e) => updateMissionField(selectedIdx, "missionType", e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:border-blue-400"
                    placeholder="ריצה, קפיצות..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">כמות / זמן</label>
                  <input
                    type="text"
                    value={
                      missions[selectedIdx]?.amount !== undefined
                        ? String(missions[selectedIdx]?.amount)
                        : ""
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      const num = parseInt(val);
                      updateMissionField(
                        selectedIdx,
                        "amount",
                        !isNaN(num) && num.toString() === val ? num : val
                      );
                    }}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:border-blue-400"
                    placeholder="10, דקה..."
                  />
                </div>
              </div>

              {/* Delete */}
              <button
                type="button"
                onClick={handleDeleteMission}
                className="text-red-500 hover:text-red-700 text-xs font-bold underline"
              >
                🗑 מחק נקודה זו
              </button>
            </div>
          )}
        </div>

        {/* Footer: name + save + QR */}
        <div className="border-t border-slate-200 p-4 bg-slate-50">
          {!savedAdventure ? (
            <>
              <input
                type="text"
                placeholder="שם ההרפתקה..."
                value={adventureName}
                onChange={(e) => setAdventureName(e.target.value)}
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 bg-white focus:outline-none focus:border-blue-400 mb-3"
              />
              <button
                onClick={handleSaveAdventure}
                disabled={!adventureName.trim() || missions.length === 0}
                className={`w-full py-3 rounded-xl font-bold text-white text-sm transition-all ${
                  adventureName.trim() && missions.length > 0
                    ? "bg-green-500 hover:bg-green-600 active:scale-95"
                    : "bg-slate-300 cursor-not-allowed"
                }`}
              >
                💾 שמור הרפתקה ({missions.length} נקודות)
              </button>
            </>
          ) : (
            <div className="text-center">
              <div className="text-green-600 font-bold text-sm mb-3">✅ ההרפתקה נשמרה!</div>
              <canvas ref={qrCanvasRef} className="mx-auto rounded-lg mb-3" />
              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-sm mb-2 transition-all"
              >
                🔗 העתק לינק
              </button>
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all"
              >
                סגור
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── LEFT: MAP PANE ── */}
      <div className="flex-1 relative bg-slate-200">
        {userPos ? (
          <MapContainer
            center={userPos}
            zoom={16}
            style={{ height: "100%", width: "100%" }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <InvalidateSize />
            <FlyToUser center={userPos} />
            <MapClickHandler onMapClick={handleMapClick} />
            {missions.map((m, i) => (
              <Marker
                key={m.id}
                position={[m.lat as number, m.lng as number]}
                icon={createNumberedIcon(i + 1)}
                eventHandlers={{ click: () => setSelectedIdx(i) }}
              />
            ))}
          </MapContainer>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3" />
            טוען מפה...
          </div>
        )}

        {/* Map tap hint */}
        {missions.length === 0 && userPos && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-sm font-bold px-5 py-3 rounded-full shadow-xl animate-bounce pointer-events-none">
            לחץ על המפה להוספת נקודת משימה
          </div>
        )}
      </div>
    </div>
  );
};

export default AdventureCreator;
```

- [ ] **Step 2: TypeScript check**

```bash
cd "/Users/haynir/Documents/WebApps _by_HayNir/quest-adventure"
./node_modules/.bin/tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Visual verify in browser**

```bash
./node_modules/.bin/vite --host
```

Open https://localhost:5174 (or next available port). Click "צור הרפתקה חדשה" (or however the creator is opened from App.tsx).

Verify:

- World selector modal appears centered over a dark overlay
- Choosing a world closes the modal and shows the two-column layout
- Map fills the left side (full height, no grey tiles)
- Right panel shows at 360px with header and empty state hint
- Clicking the map adds a numbered marker and opens the inline edit form
- Clicking a marker selects it and shows its edit form
- Reorder ↑/↓ buttons work
- Delete link works
- Save button activates when name is filled and missions > 0
- After save: QR canvas + copy link appear

- [ ] **Step 4: Build verify**

```bash
cd "/Users/haynir/Documents/WebApps _by_HayNir/quest-adventure"
./node_modules/.bin/vite build
```

Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/AdventureCreator.tsx
git commit -m "feat: rewrite AdventureCreator as desktop two-column layout"
```

---

## Task 3: Final polish + production build

**Files:**

- Modify: `src/components/AdventureCreator.tsx` (minor polish if needed)

- [ ] **Step 1: Test entity select controlled value**

Open the creator, add a mission with a Pokémon world. Select "פיקאצ'ו" from the dropdown. Navigate away (click another marker) then click back — verify the dropdown still shows "פיקאצ'ו" (not the blank placeholder). This confirms the controlled `value=` fix works.

- [ ] **Step 2: Test share URL on mobile**

After saving an adventure, copy the link. Open it on a mobile device or paste in browser. Verify the PWA loads and the adventure is auto-imported to play mode.

- [ ] **Step 3: Production build**

```bash
cd "/Users/haynir/Documents/WebApps _by_HayNir/quest-adventure"
./node_modules/.bin/vite build
```

Expected: Build succeeds. Check `dist/` has updated `assets/index-*.js`.

- [ ] **Step 4: Commit + push**

```bash
git add -A
git commit -m "feat: desktop adventure creator complete — map, inline edit, QR share"
git push origin main
```
