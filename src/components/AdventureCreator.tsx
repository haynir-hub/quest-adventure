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
import MapSearchControl from "./MapSearchControl";

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

const createNumberedIcon = (n: number) =>
  L.divIcon({
    className: "",
    html: `<div style="width:32px;height:32px;background:#3b82f6;color:#fff;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;box-shadow:0 2px 8px rgba(59,130,246,.5)">${n}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

const userIcon = L.divIcon({
  className: "user-location-icon",
  html: `<div class="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-md animate-pulse"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const AREA_STORAGE_KEY = "quest_creator_last_area";
const ISRAEL_WIDE_AREA: CreatorArea = {
  lat: 31.5,
  lng: 35.0,
  name: "תצוגה ארצית",
};
const ISRAEL_WIDE_ZOOM = 8;
const LOCAL_ZOOM = 16;

interface CreatorArea {
  lat: number;
  lng: number;
  name?: string;
}

const AdventureCreator: React.FC<AdventureCreatorProps> = ({ onClose }) => {
  const [worldId, setWorldId] = useState<string | null>(null);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [missions, setMissions] = useState<Partial<Mission>[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [adventureName, setAdventureName] = useState("");
  const [savedAdventure, setSavedAdventure] = useState<Adventure | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [creatorArea, setCreatorArea] = useState<CreatorArea | null>(() => {
    try {
      const saved = localStorage.getItem(AREA_STORAGE_KEY);
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (
        parsed &&
        typeof parsed.lat === "number" &&
        typeof parsed.lng === "number"
      ) {
        return parsed as CreatorArea;
      }
      return null;
    } catch {
      return null;
    }
  });
  const [locationError, setLocationError] = useState<string | null>(null);
  const [autoFocusSearch, setAutoFocusSearch] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const prevMissionsRef = useRef(missions);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => {},
    );
  }, []);

  useEffect(() => {
    if (!creatorArea) return;
    try {
      localStorage.setItem(AREA_STORAGE_KEY, JSON.stringify(creatorArea));
    } catch {
      // localStorage full or blocked — silently ignore
    }
  }, [creatorArea]);

  useEffect(() => {
    if (savedAdventure && qrCanvasRef.current) {
      QRCode.toCanvas(qrCanvasRef.current, shareUrl, { width: 160 });
    }
  }, [savedAdventure, shareUrl]);

  useEffect(() => {
    if (savedAdventure && prevMissionsRef.current !== missions) {
      setSavedAdventure(null);
      setShareUrl("");
    }
    prevMissionsRef.current = missions;
  }, [missions, savedAdventure]);

  const theme = worldId
    ? worldThemes[worldId === "treasure" ? "treasures" : worldId]
    : null;

  const handleMapClick = (lat: number, lng: number) => {
    const nextIdx = missions.length;
    const newMission: Partial<Mission> = {
      id: uuidv4(),
      lat,
      lng,
      missionType: "",
      amount: "",
      title: `משימה ${nextIdx + 1}`,
      description: "",
    };
    setMissions((prev) => [...prev, newMission]);
    setSelectedIdx(nextIdx);
    setSheetExpanded(true);
  };

  const toggleMissionRow = (i: number) => {
    setSelectedIdx((prev) => (prev === i ? null : i));
    setSheetExpanded(true);
  };

  const selectMissionFromMap = (i: number) => {
    setSelectedIdx(i);
    setSheetExpanded(true);
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
      localStorage.getItem("adventures") ?? "[]",
    );
    localStorage.setItem(
      "adventures",
      JSON.stringify([...existing, adventure]),
    );
    const url = buildShareUrl(adventure);
    setShareUrl(url);
    setSavedAdventure(adventure);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("הקישור הועתק!");
    } catch {
      window.prompt("העתק את הקישור:", shareUrl);
    }
  };

  const updateMissionField = <K extends keyof Mission>(
    idx: number,
    key: K,
    value: Mission[K],
  ) => {
    setMissions((prev) => {
      const arr = [...prev];
      arr[idx] = { ...arr[idx], [key]: value };
      return arr;
    });
  };

  const handlePickMyLocation = () => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("הדפדפן שלך אינו תומך בשירות מיקום");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserPos([lat, lng]);
        setCreatorArea({ lat, lng, name: "מיקומי" });
      },
      () => {
        setLocationError("לא ניתן לקבל מיקום — בדקו הרשאות");
      },
    );
  };

  const handleChangeArea = () => {
    setCreatorArea(null);
    setMissions([]);
    setSelectedIdx(null);
    setSheetExpanded(false);
    setSavedAdventure(null);
    setShareUrl("");
    setAutoFocusSearch(false);
    setLocationError(null);
  };

  if (!worldId) {
    return (
      <div
        className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-8"
        dir="rtl"
      >
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

  if (!creatorArea) {
    return (
      <div
        className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 md:p-8"
        dir="rtl"
      >
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl p-6 md:p-10 relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 text-slate-500 hover:text-slate-800 text-2xl font-bold w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100"
            aria-label="סגור"
          >
            ✕
          </button>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 text-center mb-2">
            איפה תרצו ליצור את ההרפתקה?
          </h2>
          <p className="text-slate-500 text-center text-sm mb-6">
            בחרו אזור התחלה למפה
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <button
              type="button"
              onClick={handlePickMyLocation}
              className="flex flex-col items-center justify-center gap-2 py-6 px-4 bg-blue-50 hover:bg-blue-100 active:scale-95 border-2 border-blue-200 rounded-2xl text-slate-800 font-bold text-sm transition-all min-h-[112px]"
            >
              <span className="text-3xl">📍</span>
              <span>המיקום שלי עכשיו</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCreatorArea(ISRAEL_WIDE_AREA);
                setAutoFocusSearch(true);
              }}
              className="flex flex-col items-center justify-center gap-2 py-6 px-4 bg-green-50 hover:bg-green-100 active:scale-95 border-2 border-green-200 rounded-2xl text-slate-800 font-bold text-sm transition-all min-h-[112px]"
            >
              <span className="text-3xl">🔍</span>
              <span>חיפוש כתובת</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCreatorArea(ISRAEL_WIDE_AREA);
                setAutoFocusSearch(false);
              }}
              className="flex flex-col items-center justify-center gap-2 py-6 px-4 bg-amber-50 hover:bg-amber-100 active:scale-95 border-2 border-amber-200 rounded-2xl text-slate-800 font-bold text-sm transition-all min-h-[112px]"
            >
              <span className="text-3xl">🗺️</span>
              <span>בחר על המפה</span>
            </button>
          </div>
          {locationError && (
            <div className="mt-4 text-center text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl py-2 px-3">
              {locationError}
            </div>
          )}
        </div>
      </div>
    );
  }

  const mapCenter: [number, number] = [creatorArea.lat, creatorArea.lng];
  const initialZoom =
    creatorArea.name === ISRAEL_WIDE_AREA.name ? ISRAEL_WIDE_ZOOM : LOCAL_ZOOM;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col md:flex-row-reverse"
      dir="rtl"
    >
      {/* SIDEBAR (desktop) / BOTTOM SHEET (mobile) */}
      <div
        className={`order-2 md:order-none w-full md:w-[360px] md:min-w-[320px] flex flex-col bg-white border-t md:border-t-0 md:border-l border-slate-200 shadow-xl overflow-hidden transition-[max-height] duration-300 ease-out md:max-h-none ${
          sheetExpanded ? "max-h-[80vh]" : "max-h-[140px]"
        }`}
      >
        {/* Drag handle (mobile only) */}
        <button
          type="button"
          onClick={() => setSheetExpanded((v) => !v)}
          className="md:hidden flex items-center justify-center min-h-[32px] shrink-0 bg-white"
          aria-label={sheetExpanded ? "כווץ" : "הרחב"}
          aria-expanded={sheetExpanded}
        >
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </button>

        <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {theme?.missionPointName ?? "נקודות"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {missions.length > 0
                ? `${missions.length} נקודות • לחץ על המפה להוספת`
                : "לחץ על המפה להוספת נקודה"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xl font-bold w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
          {missions.length === 0 && (
            <div className="text-center text-slate-400 text-sm py-8 border-2 border-dashed border-slate-200 rounded-2xl">
              <div className="text-3xl mb-2">👆</div>
              לחץ על המפה להוספת נקודת משימה ראשונה
            </div>
          )}

          {missions.map((m, i) => (
            <div key={m.id}>
              <div
                onClick={() => toggleMissionRow(i)}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReorder(i, -1);
                    }}
                    disabled={i === 0}
                    className="text-slate-400 hover:text-slate-700 disabled:opacity-20 w-7 h-7 flex items-center justify-center rounded hover:bg-slate-200"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReorder(i, 1);
                    }}
                    disabled={i === missions.length - 1}
                    className="text-slate-400 hover:text-slate-700 disabled:opacity-20 w-7 h-7 flex items-center justify-center rounded hover:bg-slate-200"
                  >
                    ↓
                  </button>
                </div>
              </div>

              {selectedIdx === i && (
                <div className="mt-1 border-2 border-blue-200 bg-blue-50 rounded-2xl p-4">
                  <h3 className="text-sm font-bold text-blue-700 mb-3">
                    ✏️ עריכת נקודה {i + 1}
                  </h3>

                  {theme && (
                    <div className="mb-3">
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        {theme.entityLabel}
                      </label>
                      <select
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:border-blue-400"
                        value={
                          missions[i]?.emoji
                            ? (theme.missionEntities.find(
                                (e) => e.emoji === missions[i]?.emoji,
                              )?.name ?? "")
                            : ""
                        }
                        onChange={(e) => {
                          const name = e.target.value;
                          const entity = theme.missionEntities.find(
                            (en) => en.name === name,
                          );
                          if (!entity) return;
                          const actionPrefix =
                            worldId === "pokemon"
                              ? "תפיסת"
                              : worldId === "mario"
                                ? "איסוף/הבסת"
                                : "מציאת";
                          updateMissionField(
                            i,
                            "title",
                            `${actionPrefix} ${name}`,
                          );
                          updateMissionField(i, "emoji", entity.emoji);
                          if (entity.imageUrl)
                            updateMissionField(i, "imageUrl", entity.imageUrl);
                        }}
                      >
                        <option value="">בחר מהרשימה...</option>
                        {theme.missionEntities.map((en) => (
                          <option key={en.name} value={en.name}>
                            {en.emoji} {en.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      כותרת
                    </label>
                    <input
                      type="text"
                      value={missions[i]?.title ?? ""}
                      onChange={(e) =>
                        updateMissionField(i, "title", e.target.value)
                      }
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      תיאור (אופציונלי)
                    </label>
                    <textarea
                      value={missions[i]?.description ?? ""}
                      onChange={(e) =>
                        updateMissionField(i, "description", e.target.value)
                      }
                      rows={2}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:border-blue-400 resize-none"
                      placeholder="לדוגמה: רוצו הכי מהר שאפשר!"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        סוג פעילות
                      </label>
                      <input
                        type="text"
                        value={missions[i]?.missionType ?? ""}
                        onChange={(e) =>
                          updateMissionField(i, "missionType", e.target.value)
                        }
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:border-blue-400"
                        placeholder="ריצה, קפיצות..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        כמות / זמן
                      </label>
                      <input
                        type="text"
                        value={
                          missions[i]?.amount !== undefined
                            ? String(missions[i]?.amount)
                            : ""
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          const num = parseInt(val);
                          updateMissionField(
                            i,
                            "amount",
                            !isNaN(num) && num.toString() === val ? num : val,
                          );
                        }}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:border-blue-400"
                        placeholder="10, דקה..."
                      />
                    </div>
                  </div>

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
          ))}
        </div>

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
              <div className="text-green-600 font-bold text-sm mb-3">
                ✅ ההרפתקה נשמרה!
              </div>
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

      {/* MAP PANE */}
      <div className="order-1 md:order-none flex-1 min-h-0 relative bg-slate-200">
        <MapContainer
          center={mapCenter}
          zoom={initialZoom}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <InvalidateSize />
          <FlyToUser center={mapCenter} />
          <MapClickHandler onMapClick={handleMapClick} />
          <MapSearchControl
            autoFocus={autoFocusSearch}
            onSelect={(lat, lng, name) => {
              setCreatorArea({ lat, lng, name });
              setAutoFocusSearch(false);
            }}
          />
          {userPos && (
            <Marker position={userPos} icon={userIcon} interactive={false} />
          )}
          {missions.map((m, i) => (
            <Marker
              key={m.id}
              position={[m.lat as number, m.lng as number]}
              icon={createNumberedIcon(i + 1)}
              eventHandlers={{ click: () => selectMissionFromMap(i) }}
            />
          ))}
        </MapContainer>

        <button
          type="button"
          onClick={handleChangeArea}
          className="absolute top-3 right-3 z-[500] bg-white/95 hover:bg-white text-slate-700 text-xs font-bold px-3 py-2 rounded-xl shadow-md border border-slate-200 min-h-[44px] min-w-[44px] flex items-center gap-1"
          aria-label="שנה אזור"
        >
          🗺️ שנה אזור
        </button>

        {missions.length === 0 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-sm font-bold px-5 py-3 rounded-full shadow-xl animate-bounce pointer-events-none">
            לחץ על המפה להוספת נקודת משימה
          </div>
        )}
      </div>
    </div>
  );
};

export default AdventureCreator;
