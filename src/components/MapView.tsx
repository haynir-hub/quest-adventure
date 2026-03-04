import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Mission } from '../types';
import { assetUrl } from '../utils/assets';
import { calculateDistance, calculateBearing } from '../utils/geo';
import { playSuccessSound } from '../utils/audio';
import { worldsData } from '../worlds/worldsData';

// Fix for default marker icon in react-leaflet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
    missions: Mission[];
    currentMissionIndex: number;
    onArrived: () => void;
    currentPosition: { lat: number, lng: number } | null;
    worldId: string;
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

export const MapView: React.FC<MapViewProps> = ({ missions, currentMissionIndex, onArrived, currentPosition, worldId }) => {
    const nextMission = missions[currentMissionIndex];
    const [hasPlayedSound, setHasPlayedSound] = React.useState(false);

    const world = worldsData.find(w => w.id === worldId);
    const worldEmoji = world?.emoji || '📍';
    const worldColor = world?.primaryColor || '#3B82F6';

    const distanceToNext = currentPosition && nextMission
        ? calculateDistance(currentPosition.lat, currentPosition.lng, nextMission.lat, nextMission.lng)
        : null;

    const bearingToNext = currentPosition && nextMission
        ? calculateBearing(currentPosition.lat, currentPosition.lng, nextMission.lat, nextMission.lng)
        : null;



    // Create custom marker icons for numbered missions
    const createNumberedIcon = (number: number, index: number, isCurrent: boolean, missionEmoji?: string, missionImageUrl?: string) => {
        const isCompleted = index < currentMissionIndex;
        // Current mission is full color and big, future missions are grayscale, completed green check

        const displayEmoji = missionEmoji || worldEmoji;

        let bgColor = '#9CA3AF'; // Gray for future
        let emojiScale = 'scale-100';
        let grayscaleClass = 'grayscale opacity-70';

        if (isCurrent) {
            bgColor = worldColor;
            emojiScale = 'scale-125';
            grayscaleClass = ''; // Full color
        } else if (isCompleted) {
            bgColor = '#10B981'; // Green for completed
            grayscaleClass = 'opacity-80'; // Still slightly dimmed but green
        }

        const iconContent = missionImageUrl
            ? `<img src="${assetUrl(missionImageUrl)}" class="w-8 h-8 object-contain drop-shadow-md" alt="mission" onerror="this.outerHTML='<span class=\\'text-2xl\\'>${displayEmoji}</span>'" />`
            : `<span class="text-2xl">${displayEmoji}</span>`;

        return L.divIcon({
            className: 'custom-div-icon',
            html: `
                <div class="flex flex-col items-center justify-center -mt-8 ${grayscaleClass} transition-all z-[${isCurrent ? 100 : 50}]">
                    <div class="bg-white text-slate-800 font-bold text-sm px-2 py-0.5 rounded-full shadow-md border-b-2 border-slate-300 mb-1">
                        ${isCompleted ? '✓' : number}
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
        className: 'user-location-icon',
        html: `<div class="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-md animate-pulse"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
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

    if (!currentPosition) {
        return (
            <div className="flex items-center justify-center h-full w-full bg-slate-100 dark:bg-slate-800" dir="rtl">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-xl font-medium text-slate-700 dark:text-slate-300">מאתר מיקום נוכחי...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 flex flex-col z-0" dir="rtl">

            {/* Map Container */}
            <div className="flex-grow relative z-0">
                <MapContainer
                    center={currentPosition ? [currentPosition.lat, currentPosition.lng] : undefined}
                    zoom={16}
                    style={{ height: '100%', width: '100%' }}
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
                                [nextMission.lat, nextMission.lng]
                            ]}
                            pathOptions={{
                                color: worldColor || '#3B82F6',
                                weight: 5,
                                dashArray: '10, 15',
                                opacity: 0.8,
                                lineCap: 'round',
                                lineJoin: 'round',
                            }}
                        />
                    )}

                    <ChangeView center={currentPosition ? [currentPosition.lat, currentPosition.lng] : null} />

                    {/* User Location Marker */}
                    <Marker position={[currentPosition.lat, currentPosition.lng]} icon={userIcon}>
                        <Popup>אתם כאן!</Popup>
                    </Marker>

                    {/* Mission Markers */}
                    {missions.map((mission, index) => (
                        <Marker
                            key={mission.id}
                            position={[mission.lat, mission.lng]}
                            icon={createNumberedIcon(index + 1, index, index === currentMissionIndex, mission.emoji, mission.imageUrl)}
                        >
                            <Popup>
                                <div className="text-center" dir="rtl">
                                    <strong>משימה {index + 1}: {mission.title}</strong>
                                    {index < currentMissionIndex && <p className="text-green-600 mt-1">הושלם ✓</p>}
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            {/* Bottom Overlay Area (Absolute Overlay over map) */}
            <div className="absolute bottom-6 left-4 right-4 z-[400] pb-[env(safe-area-inset-bottom)] pointer-events-none flex flex-col gap-4">

                {/* Distance and Bearing Info Card */}
                {nextMission && !isArrived && (
                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-slate-200 dark:border-slate-700 pointer-events-auto">
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-1">משימה {currentMissionIndex + 1}: {nextMission.title}</h2>
                                {distanceToNext !== null && (
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">מרחק:</span>
                                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{Math.round(distanceToNext)} מ׳</span>
                                    </div>
                                )}
                            </div>

                            {bearingToNext !== null && (
                                <div className="flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-full w-14 h-14 border-2 border-slate-200 dark:border-slate-600 shadow-inner pointer-events-none">
                                    <div
                                        style={{ transform: `rotate(${bearingToNext}deg)` }}
                                        className="w-full h-full flex items-center justify-center text-blue-500 dark:text-blue-400 text-2xl transition-transform duration-500 drop-shadow-md"
                                    >
                                        ↑
                                    </div>
                                </div>
                            )}
                        </div>
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
