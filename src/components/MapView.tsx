import React, { useEffect } from "react";
import * as maplibregl from "maplibre-gl";
import type { Map as MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Mission } from "../types";
import { assetUrl } from "../utils/assets";
import { calculateDistance, calculateBearing } from "../utils/geo";
import { playSuccessSound } from "../utils/audio";
import { worldsData } from "../worlds/worldsData";

interface MapViewProps {
  missions: Mission[];
  currentMissionIndex: number;
  onArrived: () => void;
  onSkip?: () => void;
  currentPosition: { lat: number; lng: number } | null;
  worldId: string;
  gpsError?: string | null;
}

const NAVIGATION_ZOOM = 18.3;
const NAVIGATION_PITCH = 58;
maplibregl.setWorkerUrl(`${import.meta.env.BASE_URL}assets/maplibre-gl-worker.js`);
const compassNeedsPermission = () =>
  typeof DeviceOrientationEvent !== "undefined" &&
  typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })
    .requestPermission === "function";

const navigationStyle = {
  version: 8 as const,
  sources: {
    osm: {
      type: "raster" as const,
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "osm",
      type: "raster" as const,
      source: "osm",
      paint: {
        "raster-saturation": -0.45,
        "raster-contrast": 0.12,
        "raster-brightness-max": 0.82,
      },
    },
  ],
};

export const MapView: React.FC<MapViewProps> = ({
  missions,
  currentMissionIndex,
  onArrived,
  onSkip,
  currentPosition,
  worldId,
  gpsError,
}) => {
  const nextMission = missions[currentMissionIndex];
  const [hasPlayedSound, setHasPlayedSound] = React.useState(false);
  const [gpsErrorDismissed, setGpsErrorDismissed] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [deviceHeading, setDeviceHeading] = React.useState<number | null>(null);
  const [compassPermissionGranted, setCompassPermissionGranted] = React.useState(
    () => !compassNeedsPermission(),
  );
  const [needsCompassPermission, setNeedsCompassPermission] = React.useState(
    () => compassNeedsPermission(),
  );
  const [followGps, setFollowGps] = React.useState(true);
  const [previewIndex, setPreviewIndex] = React.useState<number | null>(null);
  const mapContainerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<MapLibreMap | null>(null);
  const missionMarkersRef = React.useRef<maplibregl.Marker[]>([]);
  const playerMarkerRef = React.useRef<maplibregl.Marker | null>(null);
  const routeOverlayRef = React.useRef<HTMLDivElement | null>(null);
  const currentPositionRef = React.useRef(currentPosition);
  const nextMissionRef = React.useRef(nextMission);
  currentPositionRef.current = currentPosition;
  nextMissionRef.current = nextMission;

  const world = worldsData.find((w) => w.id === worldId);
  const worldEmoji = world?.emoji || "📍";
  const worldColor = world?.primaryColor || "#3B82F6";
  const isDoctorWorld = worldId === "doctor";

  const distanceToNext =
    currentPosition && nextMission
      ? calculateDistance(
          currentPosition.lat,
          currentPosition.lng,
          nextMission.lat,
          nextMission.lng,
        )
      : null;

  const bearingToNext =
    currentPosition && nextMission
      ? calculateBearing(
          currentPosition.lat,
          currentPosition.lng,
          nextMission.lat,
          nextMission.lng,
        )
      : null;

  const handleRecenter = () => {
    if (currentPosition && mapRef.current) {
      setFollowGps(true);
      mapRef.current.easeTo({
        center: [currentPosition.lng, currentPosition.lat],
        zoom: NAVIGATION_ZOOM,
        pitch: NAVIGATION_PITCH,
        bearing: deviceHeading ?? bearingToNext ?? 0,
        offset: [0, 55],
        duration: 700,
      });
    }
  };

  const createMissionMarker = (
    number: number,
    index: number,
    isCurrent: boolean,
    missionEmoji?: string,
    missionImageUrl?: string,
  ) => {
    const isCompleted = index < currentMissionIndex;
    // Current mission is full color and big, future missions are grayscale, completed green check

    const displayEmoji = missionEmoji || worldEmoji;

    let markerState = "mission-marker--future";

    if (isCurrent) {
      markerState = "mission-marker--current";
    } else if (isCompleted) {
      markerState = "mission-marker--completed";
    }

    const element = document.createElement("button");
    element.type = "button";
    element.className = `mission-marker ${markerState} ${isDoctorWorld ? "mission-marker--doctor" : ""}`;
    element.style.setProperty("--world-color", worldColor);
    element.setAttribute("aria-label", `משימה ${number}`);

    const badge = document.createElement("span");
    badge.className = "mission-marker__number";
    badge.textContent = isCompleted ? "✓" : String(number);
    element.appendChild(badge);

    const portrait = document.createElement("span");
    portrait.className = "mission-marker__portrait";
    if (missionImageUrl) {
      const image = document.createElement("img");
      image.src = assetUrl(missionImageUrl);
      image.alt = "";
      image.className = "mission-marker__image";
      image.addEventListener("error", () => {
        portrait.textContent = displayEmoji;
        portrait.classList.add("mission-marker__emoji");
      });
      portrait.appendChild(image);
    } else {
      portrait.textContent = displayEmoji;
      portrait.classList.add("mission-marker__emoji");
    }
    element.appendChild(portrait);

    if (isCurrent) {
      const signal = document.createElement("span");
      signal.className = "mission-marker__signal";
      element.appendChild(signal);
    }
    return element;
  };

  const isArrived = distanceToNext !== null && distanceToNext < 30;

  // Trigger sound + vibration exactly once when arriving
  useEffect(() => {
    if (isArrived && !hasPlayedSound) {
      playSuccessSound();
      // Vibrate if the device supports it (mobile browsers, often blocked on iOS Safari)
      if (typeof navigator.vibrate === "function") {
        navigator.vibrate([300, 100, 300, 100, 600]);
      }
      setHasPlayedSound(true);
    } else if (!isArrived && hasPlayedSound) {
      // Reset if user walks away (unlikely but possible boundary edge case)
      setHasPlayedSound(false);
    }
  }, [isArrived, hasPlayedSound]);

  const handleOrientation = React.useCallback((e: DeviceOrientationEvent) => {
      // iOS exposes true compass heading via this non-standard property
      const iosHeading = (e as unknown as { webkitCompassHeading?: number })
        .webkitCompassHeading;
      if (typeof iosHeading === "number") {
        setDeviceHeading(iosHeading);
      } else if (e.alpha !== null) {
        // Android: alpha is rotation around z-axis; subtract from 360 for compass-like behavior
        setDeviceHeading((360 - e.alpha + 360) % 360);
      }
  }, []);

  useEffect(() => {
    if (!compassPermissionGranted) return;
    window.addEventListener("deviceorientation", handleOrientation);
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, [compassPermissionGranted, handleOrientation]);

  const enableCompass = async () => {
    const api = DeviceOrientationEvent as unknown as {
      requestPermission: () => Promise<string>;
    };
    try {
      const result = await api.requestPermission();
      if (result === "granted") {
        setCompassPermissionGranted(true);
        setNeedsCompassPermission(false);
      }
    } catch {
      setNeedsCompassPermission(true);
    }
  };

  const hasPosition = currentPosition !== null;

  useEffect(() => {
    if (!hasPosition || !currentPosition || !mapContainerRef.current || mapRef.current) return;

    const initialBearing = deviceHeading ?? bearingToNext ?? 0;
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: navigationStyle,
      center: [currentPosition.lng, currentPosition.lat],
      zoom: NAVIGATION_ZOOM,
      pitch: NAVIGATION_PITCH,
      bearing: initialBearing,
      attributionControl: false,
      maxPitch: 70,
    });
    mapRef.current = map;
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "top-left");

    const stopFollowing = (event: { originalEvent?: unknown }) => {
      if (event.originalEvent) setFollowGps(false);
    };
    map.on("dragstart", stopFollowing);
    map.on("zoomstart", stopFollowing);
    map.on("rotatestart", stopFollowing);

    const updateRouteOverlay = () => {
      const position = currentPositionRef.current;
      const mission = nextMissionRef.current;
      const route = routeOverlayRef.current;
      if (!position || !mission || !route) return;
      const start = map.project([position.lng, position.lat]);
      const end = map.project([mission.lng, mission.lat]);
      const distance = Math.hypot(end.x - start.x, end.y - start.y);
      const angle = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI);
      route.style.left = `${start.x}px`;
      route.style.top = `${start.y}px`;
      route.style.width = `${distance}px`;
      route.style.transform = `rotate(${angle}deg)`;
    };
    map.on("load", updateRouteOverlay);
    map.on("move", updateRouteOverlay);

    const playerElement = document.createElement("div");
    playerElement.className = "navigation-player";
    playerElement.innerHTML = '<span class="navigation-player__accuracy"></span><span class="navigation-player__arrow" aria-hidden="true"></span>';
    playerMarkerRef.current = new maplibregl.Marker({ element: playerElement, anchor: "center" })
      .setLngLat([currentPosition.lng, currentPosition.lat])
      .addTo(map);

    missionMarkersRef.current = missions.map((mission, index) => {
      const element = createMissionMarker(
        index + 1,
        index,
        index === currentMissionIndex,
        mission.emoji,
        mission.imageUrl,
      );
      element.addEventListener("click", () => setPreviewIndex(index));
      return new maplibregl.Marker({ element, anchor: "bottom" })
        .setLngLat([mission.lng, mission.lat])
        .addTo(map);
    });

    return () => {
      missionMarkersRef.current = [];
      playerMarkerRef.current = null;
      mapRef.current = null;
      map.remove();
    };
    // Rebuild markers only when the active mission changes; GPS movement is handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPosition, currentMissionIndex]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !currentPosition) return;

    playerMarkerRef.current?.setLngLat([currentPosition.lng, currentPosition.lat]);
    if (followGps) {
      map.easeTo({
        center: [currentPosition.lng, currentPosition.lat],
        zoom: NAVIGATION_ZOOM,
        pitch: NAVIGATION_PITCH,
        bearing: deviceHeading ?? bearingToNext ?? map.getBearing(),
        offset: [0, 55],
        duration: 900,
        essential: true,
      });
    }
  }, [currentPosition, nextMission, deviceHeading, bearingToNext, followGps]);

  if (!currentPosition) {
    return (
      <div
        className="flex items-center justify-center h-full w-full bg-slate-100 dark:bg-slate-800"
        dir="rtl"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl font-medium text-slate-700 dark:text-slate-300">
            מאתר מיקום נוכחי...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`absolute inset-0 flex flex-col z-0 game-map game-map--${worldId}`}
      dir="rtl"
      style={{ "--world-color": worldColor } as React.CSSProperties}
    >
      {/* Skip button — top-left, mirrors global "חזרה" at top-right */}
      {onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="fixed top-6 left-4 bg-white/90 backdrop-blur-md text-slate-700 px-4 py-2 rounded-full shadow-lg z-[100] flex items-center gap-1 hover:bg-white active:scale-95 transition-all text-sm font-bold border-2 border-slate-200/50 min-h-[44px]"
          aria-label="דלג למשימה הבאה"
        >
          דלג <span>⏭</span>
        </button>
      )}

      {/* GPS Error Banner — pt-20 clears the fixed "חזרה"/"דלג" pills (top-6,
          ~44px tall) which sit in the viewport-fixed layer above this
          normal-flow banner and would otherwise visually cut its text. */}
      {gpsError && !gpsErrorDismissed && (
        <div className="flex items-center justify-between gap-2 bg-orange-500 text-white px-4 pt-20 pb-3 text-base font-medium shrink-0">
          <span>{gpsError}</span>
          <button
            type="button"
            onClick={() => setGpsErrorDismissed(true)}
            className="text-white/80 hover:text-white text-2xl leading-none shrink-0 min-w-[32px] min-h-[32px]"
            aria-label="סגור"
          >
            ✕
          </button>
        </div>
      )}
      {/* Map Container */}
      <div className="flex-grow relative z-0">
        <div ref={mapContainerRef} className="navigation-map" aria-label="מפת ניווט למשימה" />

        <div ref={routeOverlayRef} className="navigation-route" aria-hidden="true">
          <span>›</span><span>›</span><span>›</span>
        </div>

        {isDoctorWorld && (
          <div className="doctor-map-atmosphere" aria-hidden="true" />
        )}

        <div className="navigation-objective" aria-live="polite">
          <span className="navigation-objective__icon">✦</span>
          <span>היעד הבא</span>
        </div>

        {needsCompassPermission && (
          <button type="button" onClick={enableCompass} className="navigation-compass-permission">
            הפעלת כיוון תנועה
          </button>
        )}

        {/* Recenter button — rendered as sibling to MapContainer so it's positioned against the map wrapper, not inside Leaflet's panes */}
        <button
          type="button"
          onClick={handleRecenter}
          disabled={!currentPosition}
          className={`navigation-recenter ${
            !currentPosition
              ? "opacity-40 cursor-not-allowed"
              : "hover:bg-slate-50 active:scale-95"
          }`}
          aria-label="חזור למיקומי"
        >
          ◎
        </button>
      </div>

      {/* Bottom Overlay Area (Absolute Overlay over map) */}
      {/* left-[80px] on mobile leaves room for the bottom-left button stack (zoom + recenter) */}
      <div className="absolute bottom-6 left-[80px] md:left-4 right-4 z-[400] pb-[env(safe-area-inset-bottom)] pointer-events-none flex flex-col gap-4">
        {/* Distance and Bearing Info Card */}
        {nextMission && !isArrived && (
          <div className="mission-hud pointer-events-auto relative">
            <div className="flex justify-between items-center">
              <div className="mission-hud__portrait shrink-0 ml-3">
                {nextMission.imageUrl ? (
                  <img src={assetUrl(nextMission.imageUrl)} alt="" />
                ) : (
                  <span>{nextMission.emoji || worldEmoji}</span>
                )}
              </div>
              <div className="flex flex-col flex-1 min-w-0 ml-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white mb-1 truncate">
                    {nextMission.title}
                  </h2>
                  {onSkip && (
                    <button
                      type="button"
                      onClick={() => setMenuOpen((o) => !o)}
                      className="text-slate-400 hover:text-slate-600 text-xl leading-none shrink-0 mb-1"
                      aria-label="אפשרויות"
                    >
                      ⋮
                    </button>
                  )}
                </div>
                {distanceToNext !== null && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-white/60">
                      היעד הבא
                    </span>
                    <span className="text-3xl font-black text-white tracking-tight">
                      {Math.round(distanceToNext)} מ׳
                    </span>
                  </div>
                )}
                {gpsError && (
                  <span className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium mt-1">
                    📡 מיקום משוער
                  </span>
                )}
                <button
                  type="button"
                  onClick={onArrived}
                  className="mission-hud__start"
                >
                  להגיע למשימה ולהתחיל
                </button>
              </div>

              {bearingToNext !== null && (
                <div className="mission-hud__compass">
                  <div
                    style={{
                      transform: `rotate(${(((bearingToNext - (deviceHeading ?? 0)) % 360) + 360) % 360}deg)`,
                    }}
                    className="w-full h-full flex items-center justify-center text-white text-3xl transition-transform duration-500 drop-shadow-md"
                  >
                    ↑
                  </div>
                </div>
              )}
            </div>

            {/* Skip dropdown menu */}
            {menuOpen && onSkip && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-10">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onSkip();
                  }}
                  className="w-full text-right px-4 py-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium"
                >
                  דלג על משימה זו ⏭
                </button>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-right px-4 py-3 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm"
                >
                  ביטול
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Arrival feedback: full-screen alternating red/yellow flash + central bouncing CTA */}
      {isArrived && nextMission && (
        <>
          <style>{`
            @keyframes arrived-flash {
              0%, 100% { background-color: rgba(34, 197, 94, 0); }
              25% { background-color: rgba(239, 68, 68, 0.45); }
              50% { background-color: rgba(34, 197, 94, 0); }
              75% { background-color: rgba(250, 204, 21, 0.55); }
            }
            .arrived-flash { animation: arrived-flash 0.9s infinite; }
          `}</style>
          <div
            className="fixed inset-0 z-[399] pointer-events-none arrived-flash"
            aria-hidden="true"
          />
          {/* CTA — fixed near vertical center so it can never be cut off; safe-area aware */}
          <button
            onClick={onArrived}
            className="fixed left-1/2 -translate-x-1/2 z-[600] bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-black py-6 px-10 rounded-full shadow-[0_0_50px_rgba(34,197,94,0.7)] text-3xl md:text-4xl border-[6px] border-white animate-bounce min-h-[88px] min-w-[220px] ring-4 ring-yellow-300/70"
            style={{
              bottom: "calc(env(safe-area-inset-bottom, 0px) + 7rem)",
            }}
          >
            🎯 הגעתי!
          </button>
        </>
      )}

      {/* Mission preview modal — opens when any mission marker is tapped */}
      {previewIndex !== null && missions[previewIndex] && (
        <div
          className="fixed inset-0 z-[700] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setPreviewIndex(null)}
          dir="rtl"
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewIndex(null)}
              className="absolute top-3 left-3 text-slate-400 hover:text-slate-700 text-2xl font-bold w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100"
              aria-label="סגור"
            >
              ✕
            </button>
            <div className="text-center pt-2">
              <div className="text-xs font-bold text-slate-400 mb-1 tracking-wide">
                משימה {previewIndex + 1} מתוך {missions.length}
                {previewIndex < currentMissionIndex && " • הושלמה ✓"}
                {previewIndex === currentMissionIndex && " • פעילה כעת"}
              </div>
              {missions[previewIndex].imageUrl ? (
                <img
                  src={assetUrl(missions[previewIndex].imageUrl as string)}
                  alt={missions[previewIndex].title}
                  className="w-48 h-48 md:w-56 md:h-56 object-contain mx-auto my-4 drop-shadow-xl"
                />
              ) : (
                <div className="text-9xl my-6">
                  {missions[previewIndex].emoji || "📍"}
                </div>
              )}
              <h2 className="text-2xl font-black text-slate-800 mb-2">
                {missions[previewIndex].title}
              </h2>
              {missions[previewIndex].description && (
                <p className="text-slate-600 text-sm">
                  {missions[previewIndex].description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
