import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Polyline,
  ZoomControl,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Mission } from "../types";
import { assetUrl } from "../utils/assets";
import { calculateDistance, calculateBearing } from "../utils/geo";
import { playSuccessSound } from "../utils/audio";
import { worldsData } from "../worlds/worldsData";
import MapSearchControl from "./MapSearchControl";

// Fix for default marker icon in react-leaflet
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

interface MapViewProps {
  missions: Mission[];
  currentMissionIndex: number;
  onArrived: () => void;
  onSkip?: () => void;
  currentPosition: { lat: number; lng: number } | null;
  worldId: string;
  gpsError?: string | null;
}

// Custom hook/component to update map center when user location changes
function ChangeView({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

function MapRefSync({
  mapRef,
}: {
  mapRef: React.MutableRefObject<L.Map | null>;
}) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
    return () => {
      mapRef.current = null;
    };
  }, [map, mapRef]);
  return null;
}

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
  const mapRef = React.useRef<L.Map | null>(null);

  const handleRecenter = () => {
    if (currentPosition && mapRef.current) {
      mapRef.current.flyTo([currentPosition.lat, currentPosition.lng], 17, {
        duration: 0.8,
      });
    }
  };

  const world = worldsData.find((w) => w.id === worldId);
  const worldEmoji = world?.emoji || "📍";
  const worldColor = world?.primaryColor || "#3B82F6";

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

  // Create custom marker icons for numbered missions
  const createNumberedIcon = (
    number: number,
    index: number,
    isCurrent: boolean,
    missionEmoji?: string,
    missionImageUrl?: string,
  ) => {
    const isCompleted = index < currentMissionIndex;
    // Current mission is full color and big, future missions are grayscale, completed green check

    const displayEmoji = missionEmoji || worldEmoji;

    let bgColor = "#9CA3AF"; // Gray for future
    let emojiScale = "scale-100";
    let grayscaleClass = "grayscale opacity-70";

    if (isCurrent) {
      bgColor = worldColor;
      emojiScale = "scale-125";
      grayscaleClass = ""; // Full color
    } else if (isCompleted) {
      bgColor = "#10B981"; // Green for completed
      grayscaleClass = "opacity-80"; // Still slightly dimmed but green
    }

    const iconContent = missionImageUrl
      ? `<img src="${assetUrl(missionImageUrl)}" class="w-8 h-8 object-contain drop-shadow-md" alt="mission" onerror="this.outerHTML='<span class=\\'text-2xl\\'>${displayEmoji}</span>'" />`
      : `<span class="text-2xl">${displayEmoji}</span>`;

    return L.divIcon({
      className: "custom-div-icon",
      html: `
                <div class="flex flex-col items-center justify-center -mt-8 ${grayscaleClass} transition-all z-[${isCurrent ? 100 : 50}]">
                    <div class="bg-white text-slate-800 font-bold text-sm px-2 py-0.5 rounded-full shadow-md border-b-2 border-slate-300 mb-1">
                        ${isCompleted ? "✓" : number}
                    </div>
                    <div class="w-12 h-12 rounded-full shadow-lg border-[3px] border-white flex items-center justify-center transform ${emojiScale} transition-transform drop-shadow-md" style="background-color: ${bgColor}">
                        ${iconContent}
                    </div>
                </div>
            `,
      iconSize: [48, 64],
      iconAnchor: [24, 60],
    });
  };

  const userIcon = L.divIcon({
    className: "user-location-icon",
    html: `<div class="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-md animate-pulse"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  const isArrived = distanceToNext !== null && distanceToNext < 30;

  // Trigger sound exactly once when arriving
  useEffect(() => {
    if (isArrived && !hasPlayedSound) {
      playSuccessSound();
      setHasPlayedSound(true);
    } else if (!isArrived && hasPlayedSound) {
      // Reset if user walks away (unlikely but possible boundary edge case)
      setHasPlayedSound(false);
    }
  }, [isArrived, hasPlayedSound]);

  useEffect(() => {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const api = DeviceOrientationEvent as any;
    if (typeof api.requestPermission === "function") {
      api.requestPermission().then((result: string) => {
        if (result === "granted")
          window.addEventListener("deviceorientation", handler);
      });
    } else {
      window.addEventListener("deviceorientation", handler);
    }
    return () => window.removeEventListener("deviceorientation", handler);
  }, []);

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
    <div className="absolute inset-0 flex flex-col z-0" dir="rtl">
      {/* GPS Error Banner */}
      {gpsError && !gpsErrorDismissed && (
        <div className="flex items-center justify-between gap-2 bg-orange-500 text-white px-4 py-2 text-sm font-medium z-[500] shrink-0">
          <span>{gpsError}</span>
          <button
            type="button"
            onClick={() => setGpsErrorDismissed(true)}
            className="text-white/80 hover:text-white text-lg leading-none shrink-0"
            aria-label="סגור"
          >
            ✕
          </button>
        </div>
      )}
      {/* Map Container */}
      <div className="flex-grow relative z-0">
        <MapContainer
          center={
            currentPosition
              ? [currentPosition.lat, currentPosition.lng]
              : undefined
          }
          zoom={16}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Draw path to the next mission */}
          {nextMission && currentPosition && (
            <Polyline
              positions={[
                [currentPosition.lat, currentPosition.lng],
                [nextMission.lat, nextMission.lng],
              ]}
              pathOptions={{
                color: worldColor || "#3B82F6",
                weight: 5,
                dashArray: "10, 15",
                opacity: 0.8,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          )}

          <ChangeView
            center={
              currentPosition
                ? [currentPosition.lat, currentPosition.lng]
                : null
            }
          />
          <ZoomControl position="bottomleft" />
          <MapRefSync mapRef={mapRef} />
          <MapSearchControl />

          {/* User Location Marker */}
          <Marker
            position={[currentPosition.lat, currentPosition.lng]}
            icon={userIcon}
          >
            <Popup>אתם כאן!</Popup>
          </Marker>

          {/* Mission Markers */}
          {missions.map((mission, index) => (
            <Marker
              key={mission.id}
              position={[mission.lat, mission.lng]}
              icon={createNumberedIcon(
                index + 1,
                index,
                index === currentMissionIndex,
                mission.emoji,
                mission.imageUrl,
              )}
            >
              <Popup>
                <div className="text-center" dir="rtl">
                  <strong>
                    משימה {index + 1}: {mission.title}
                  </strong>
                  {index < currentMissionIndex && (
                    <p className="text-green-600 mt-1">הושלם ✓</p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Recenter button — rendered as sibling to MapContainer so it's positioned against the map wrapper, not inside Leaflet's panes */}
        <button
          type="button"
          onClick={handleRecenter}
          disabled={!currentPosition}
          className={`absolute bottom-[120px] left-2 z-[450] w-11 h-11 rounded-full bg-white text-xl shadow-lg border border-slate-200 flex items-center justify-center transition-all ${
            !currentPosition
              ? "opacity-40 cursor-not-allowed"
              : "hover:bg-slate-50 active:scale-95"
          }`}
          aria-label="חזור למיקומי"
        >
          📍
        </button>
      </div>

      {/* Bottom Overlay Area (Absolute Overlay over map) */}
      {/* left-[80px] on mobile leaves room for the bottom-left button stack (zoom + recenter) */}
      <div className="absolute bottom-6 left-[80px] md:left-4 right-4 z-[400] pb-[env(safe-area-inset-bottom)] pointer-events-none flex flex-col gap-4">
        {/* Distance and Bearing Info Card */}
        {nextMission && !isArrived && (
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-slate-200 dark:border-slate-700 pointer-events-auto relative">
            <div className="flex justify-between items-center">
              <div className="flex flex-col flex-1 min-w-0 ml-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-1 truncate">
                    משימה {currentMissionIndex + 1}: {nextMission.title}
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
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      מרחק:
                    </span>
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {Math.round(distanceToNext)} מ׳
                    </span>
                  </div>
                )}
                {gpsError && (
                  <span className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium mt-1">
                    📡 מיקום משוער
                  </span>
                )}
              </div>

              {bearingToNext !== null && (
                <div className="flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-full w-14 h-14 border-2 border-slate-200 dark:border-slate-600 shadow-inner pointer-events-none shrink-0">
                  <div
                    style={{
                      transform: `rotate(${(((bearingToNext - (deviceHeading ?? 0)) % 360) + 360) % 360}deg)`,
                    }}
                    className="w-full h-full flex items-center justify-center text-blue-500 dark:text-blue-400 text-2xl transition-transform duration-500 drop-shadow-md"
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

        {/* Arrived Action Button */}
        {isArrived && nextMission && (
          <div className="animate-bounce pointer-events-auto">
            <button
              onClick={onArrived}
              className="w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold py-4 px-8 rounded-full shadow-2xl text-2xl border-4 border-white transition-all min-h-[64px]"
            >
              הגעתי!
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
