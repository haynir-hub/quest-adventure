import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Mission, Adventure } from '../types';
import WorldSelector from './WorldSelector';
import { worldThemes } from '../worlds/worldThemes';

type Step = 1 | 2 | 3;

interface AdventureCreatorProps {
    onClose: () => void;
}

// Fix for default marker icon in react-leaflet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks
const MapEvents = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

// Component to re-center map
const ChangeView = ({ center }: { center: [number, number] | null }) => {
    const map = useMap();
    React.useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
};

// Force Leaflet to recalculate container size on mount (fixes grey tiles after transition)
const InvalidateSizeComponent = () => {
    const map = useMap();
    React.useEffect(() => {
        // Fire repeatedly to account for the 500ms CSS slide-in animation
        const timeouts = [100, 400, 700, 1200].map(delay =>
            setTimeout(() => {
                map.invalidateSize();
                window.dispatchEvent(new Event('resize'));
            }, delay)
        );
        return () => timeouts.forEach(clearTimeout);
    }, [map]);
    return null;
};

const AdventureCreator: React.FC<AdventureCreatorProps> = ({ onClose }) => {
    const [step, setStep] = useState<Step>(1);

    // Step 1 State
    const [selectedWorldId, setSelectedWorldId] = useState<string | null>(null);

    // Step 2 & 3 State
    const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [missions, setMissions] = useState<Partial<Mission>[]>([]);
    const [selectedMissionIndex, setSelectedMissionIndex] = useState<number | null>(null);

    // Final Adventure State
    const [adventureName, setAdventureName] = useState('');

    useEffect(() => {
        // Get user's current location when component mounts
        let mounted = true;
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    if (mounted) {
                        setCurrentPosition({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        });
                    }
                },
                (error) => {
                    console.error("Error getting location: ", error);
                    // Default to Tel Aviv if location fails
                    if (mounted) {
                        setTimeout(() => {
                            if (mounted) setCurrentPosition({ lat: 32.0853, lng: 34.7818 });
                        }, 0);
                    }
                }
            );
        } else {
            // Default to Tel Aviv if geolocation not supported
            if (mounted) {
                setTimeout(() => {
                    if (mounted) setCurrentPosition({ lat: 32.0853, lng: 34.7818 });
                }, 0);
            }
        }
        return () => { mounted = false; };
    }, []);

    const createNumberedIcon = (number: number) => {
        return L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="flex items-center justify-center w-8 h-8 rounded-full shadow-lg text-white font-bold text-lg border-2 border-white bg-blue-500 hover:bg-blue-600 transition-colors cursor-pointer transform hover:scale-110">${number}</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
        });
    };

    const handleWorldSelect = (worldId: string) => {
        setSelectedWorldId(worldId);
        setStep(2);
    };

    const handleMapClick = (lat: number, lng: number) => {
        // Add a new point and move to step 3 to edit it
        const newMission: Partial<Mission> = {
            id: uuidv4(),
            lat,
            lng,
            missionType: '',
            amount: '',
            title: `משימה ${missions.length + 1}`,
            description: ''
        };
        setMissions([...missions, newMission]);
        setSelectedMissionIndex(missions.length);
        setStep(3);
    };

    const handleMarkerClick = (index: number) => {
        setSelectedMissionIndex(index);
        setStep(3);
    };

    const handleSaveMission = (updatedMission: Partial<Mission>) => {
        if (selectedMissionIndex !== null) {
            const newMissions = [...missions];
            newMissions[selectedMissionIndex] = updatedMission;
            setMissions(newMissions);
        }
        setStep(2);
        setSelectedMissionIndex(null);
    };

    const handleDeleteMission = () => {
        if (selectedMissionIndex !== null) {
            const newMissions = missions.filter((_, i) => i !== selectedMissionIndex);
            setMissions(newMissions);
        }
        setStep(2);
        setSelectedMissionIndex(null);
    };

    const handleSaveAdventure = () => {
        if (!selectedWorldId || !adventureName.trim() || missions.length === 0) {
            alert('נא למלא את שם ההרפתקה ולוודא שיש לפחות משימה אחת');
            return;
        }

        const newAdventure: Adventure = {
            id: uuidv4(),
            name: adventureName.trim(),
            worldId: selectedWorldId,
            createdAt: Date.now(),
            missions: missions as Mission[],
        };

        const existingAdventuresJson = localStorage.getItem('adventures');
        const existingAdventures: Adventure[] = existingAdventuresJson ? JSON.parse(existingAdventuresJson) : [];

        localStorage.setItem('adventures', JSON.stringify([...existingAdventures, newAdventure]));
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-50 overflow-y-auto" dir="rtl">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-40 px-4 py-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800">יצירת הרפתקה חדשה</h1>
                <button
                    onClick={onClose}
                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center font-bold text-slate-600"
                >
                    ✕
                </button>
            </header>

            {/* Stepper Indicator */}
            <div className="flex items-center justify-center gap-4 py-6 px-4 bg-white border-b border-slate-100 mb-6">
                <div className={`flex flex-col items-center flex-1 max-w-[100px] ${step >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${step >= 1 ? 'bg-blue-100 text-blue-600 border-2 border-blue-600' : 'bg-slate-100 border-2 border-slate-200'}`}>1</div>
                    <span className="text-sm font-medium text-center">עולם</span>
                </div>
                <div className={`h-1 w-12 rounded ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                <div className={`flex flex-col items-center flex-1 max-w-[100px] ${step >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${step >= 2 ? 'bg-blue-100 text-blue-600 border-2 border-blue-600' : 'bg-slate-100 border-2 border-slate-200'}`}>2</div>
                    <span className="text-sm font-medium text-center">מפה</span>
                </div>
                <div className={`h-1 w-12 rounded ${step >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                <div className={`flex flex-col items-center flex-1 max-w-[100px] ${step >= 3 ? 'text-blue-600' : 'text-slate-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${step >= 3 ? 'bg-blue-100 text-blue-600 border-2 border-blue-600' : 'bg-slate-100 border-2 border-slate-200'}`}>3</div>
                    <span className="text-sm font-medium text-center">משימות</span>
                </div>
            </div>

            <main className="container mx-auto px-4 pb-24">
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <WorldSelector onSelect={handleWorldSelect} />
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-[60vh]">
                        <div className="bg-blue-50 text-blue-800 p-4 rounded-xl mb-4 text-center font-medium shadow-sm border border-blue-100">
                            לחצו על המפה כדי להוסיף נקודת משימה חדשה. לחצו על נקודה קיימת כדי לערוך אותה.
                        </div>

                        <div className="flex-grow bg-slate-200 rounded-3xl overflow-hidden shadow-inner border-4 border-white relative map-container-wrapper">
                            {currentPosition ? (
                                <MapContainer
                                    center={[currentPosition.lat, currentPosition.lng]}
                                    zoom={15}
                                    style={{ height: '100%', width: '100%', zIndex: 0 }}
                                    zoomControl={false}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <InvalidateSizeComponent />
                                    <MapEvents onMapClick={handleMapClick} />

                                    {/* Map should initially center on user but not track movement to allow panning */}
                                    {missions.length === 0 && <ChangeView center={[currentPosition.lat, currentPosition.lng]} />}

                                    {missions.map((mission, index) => (
                                        <Marker
                                            key={mission.id}
                                            position={[mission.lat as number, mission.lng as number]}
                                            icon={createNumberedIcon(index + 1)}
                                            eventHandlers={{
                                                click: () => handleMarkerClick(index),
                                            }}
                                        />
                                    ))}
                                </MapContainer>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 font-medium">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3"></div>
                                    טוען מפה...
                                </div>
                            )}
                        </div>

                        {missions.length > 0 && (
                            <div className="mt-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                <h3 className="text-xl font-bold mb-4 text-slate-800">שמירת ההרפתקה</h3>
                                <input
                                    type="text"
                                    placeholder="שם ההרפתקה (למשל: אימון בוקר בפארק)"
                                    value={adventureName}
                                    onChange={(e) => setAdventureName(e.target.value)}
                                    className="w-full text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-4 text-lg mb-6 focus:outline-none focus:border-blue-500 transition-colors"
                                />
                                <button
                                    onClick={handleSaveAdventure}
                                    disabled={!adventureName.trim()}
                                    className={`w-full min-h-[56px] text-white font-bold text-xl rounded-2xl shadow-md transition-all ${adventureName.trim() ? 'bg-green-500 hover:bg-green-600 active:scale-95' : 'bg-slate-300 cursor-not-allowed'}`}
                                >
                                    שמור הרפתקה ({missions.length} משימות)
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {step === 3 && selectedMissionIndex !== null && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-lg mx-auto bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <h2 className="text-2xl font-bold mb-6 text-slate-800">
                            עריכת משימה {selectedMissionIndex + 1}
                        </h2>

                        {/* Form placeholder */}
                        <div className="space-y-6">
                            {selectedWorldId && worldThemes[selectedWorldId === 'treasure' ? 'treasures' : selectedWorldId] && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        {worldThemes[selectedWorldId === 'treasure' ? 'treasures' : selectedWorldId].entityLabel}
                                    </label>
                                    <select
                                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-4 text-lg text-slate-900 focus:outline-none focus:border-blue-500 transition-colors mb-2"
                                        onChange={(e) => {
                                            const entityName = e.target.value;
                                            if (entityName) {
                                                const newMissions = [...missions];
                                                const actionPrefix = selectedWorldId === 'pokemon' ? 'תפיסת' : selectedWorldId === 'mario' ? 'איסוף/הבסת' : 'מציאת';

                                                const selectedTheme = worldThemes[selectedWorldId === 'treasure' ? 'treasures' : selectedWorldId];
                                                const entity = selectedTheme.missionEntities.find(ent => ent.name === entityName);

                                                newMissions[selectedMissionIndex].title = `${actionPrefix} ${entityName}`;
                                                if (entity) {
                                                    newMissions[selectedMissionIndex].emoji = entity.emoji;
                                                    newMissions[selectedMissionIndex].imageUrl = entity.imageUrl;
                                                }

                                                setMissions(newMissions);
                                            }
                                        }}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>בחר מהרשימה...</option>
                                        {worldThemes[selectedWorldId === 'treasure' ? 'treasures' : selectedWorldId].missionEntities.map((entity, idx) => (
                                            <option key={idx} value={entity.name}>{entity.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">כותרת המשימה</label>
                                <input
                                    type="text"
                                    value={missions[selectedMissionIndex]?.title || ''}
                                    onChange={(e) => {
                                        const newMissions = [...missions];
                                        newMissions[selectedMissionIndex].title = e.target.value;
                                        setMissions(newMissions);
                                    }}
                                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-4 text-lg text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">תיאור (אופציונלי)</label>
                                <textarea
                                    value={missions[selectedMissionIndex]?.description || ''}
                                    onChange={(e) => {
                                        const newMissions = [...missions];
                                        newMissions[selectedMissionIndex].description = e.target.value;
                                        setMissions(newMissions);
                                    }}
                                    rows={3}
                                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-4 text-lg text-slate-900 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                                    placeholder="לדוגמה: תעשו את זה הכי מהר שאפשר!"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">סוג פעילות</label>
                                    <input
                                        type="text"
                                        value={missions[selectedMissionIndex]?.missionType || ''}
                                        onChange={(e) => {
                                            const newMissions = [...missions];
                                            newMissions[selectedMissionIndex].missionType = e.target.value;
                                            setMissions(newMissions);
                                        }}
                                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-4 text-lg text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
                                        placeholder="לדוגמה: תרגיל חופשי, קפיצות..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">כמות / זמן</label>
                                    <input
                                        type="text"
                                        value={missions[selectedMissionIndex]?.amount !== undefined ? missions[selectedMissionIndex]?.amount : ''}
                                        onChange={(e) => {
                                            const newMissions = [...missions];
                                            const val = e.target.value;
                                            const numVal = parseInt(val);
                                            // Handle as number if parseable exact, otherwise keep as string
                                            newMissions[selectedMissionIndex].amount = (!isNaN(numVal) && numVal.toString() === val) ? numVal : val;
                                            setMissions(newMissions);
                                        }}
                                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-4 text-lg text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
                                        placeholder="לדוגמה: 10, חצי שעה..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-4">
                            <button
                                onClick={() => handleSaveMission(missions[selectedMissionIndex])}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white min-h-[56px] font-bold text-lg rounded-xl transition-colors active:scale-95"
                            >
                                אישור וחזרה למפה
                            </button>
                            <button
                                onClick={handleDeleteMission}
                                className="bg-red-100 text-red-600 hover:bg-red-200 min-h-[56px] px-6 font-bold text-lg rounded-xl transition-colors active:scale-95"
                            >
                                מחק
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdventureCreator;
