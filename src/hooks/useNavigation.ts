import { useState, useEffect, useRef } from 'react';
import type { Mission, GameState } from '../types';

interface Position {
    lat: number;
    lng: number;
}

export const useNavigation = () => {
    const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
    const [activeMission, setActiveMission] = useState<Mission | null>(null);
    const [distanceToTarget, setDistanceToTarget] = useState<number>(0);
    const [bearingToTarget, setBearingToTarget] = useState<number>(0);
    const [isArrived, setIsArrived] = useState<boolean>(false);

    // Developer location spoofing
    const [spoofLocation, setSpoofLocation] = useState<Position | null>(null);

    const watchIdRef = useRef<number | null>(null);
    const lastUpdateRef = useRef<number>(0);

    // Haversine formula for distance in meters
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371e3; // Earth radius in meters
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;

        const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    };

    // Calculate bearing in degrees (0-360)
    const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const λ1 = (lon1 * Math.PI) / 180;
        const λ2 = (lon2 * Math.PI) / 180;

        const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
        const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
        const θ = Math.atan2(y, x);
        const bearing = ((θ * 180) / Math.PI + 360) % 360; // in degrees

        return bearing;
    };

    const startNavigation = (mission: Mission) => {
        setActiveMission(mission);

        // Update GameState in localStorage
        const storedGameState = localStorage.getItem('gameState');
        let gameState: GameState;

        if (storedGameState) {
            gameState = JSON.parse(storedGameState);
            // Assuming this starts a new mission, keep adventureId and completedMissions
            gameState.currentMissionIndex = gameState.completedMissions.length;
        } else {
            // Default GameState if none exists (fallback)
            gameState = {
                adventureId: 'current_adventure',
                currentMissionIndex: 0,
                completedMissions: [],
            };
        }

        localStorage.setItem('gameState', JSON.stringify(gameState));
    };

    useEffect(() => {
        if (!navigator.geolocation) {
            console.error('Geolocation is not supported by your browser');
            return;
        }

        const handlePosition = (position: GeolocationPosition | Position) => {
            const now = Date.now();
            // Throttle updates to every 3 seconds (3000ms)
            if (now - lastUpdateRef.current < 3000 && !spoofLocation) {
                return;
            }
            lastUpdateRef.current = now;

            const latitude = 'coords' in position ? position.coords.latitude : position.lat;
            const longitude = 'coords' in position ? position.coords.longitude : position.lng;
            setCurrentPosition({ lat: latitude, lng: longitude });

            if (activeMission) {
                const distance = calculateDistance(latitude, longitude, activeMission.lat, activeMission.lng);
                const bearing = calculateBearing(latitude, longitude, activeMission.lat, activeMission.lng);

                setDistanceToTarget(Math.round(distance));
                setBearingToTarget(Math.round(bearing));
                setIsArrived(distance < 30);
            }
        };

        if (spoofLocation) {
            handlePosition(spoofLocation);
            return;
        }

        const FALLBACK_LOCATION: Position = { lat: 32.0853, lng: 34.7818 }; // Tel Aviv

        const handleError = (error: GeolocationPositionError) => {
            console.warn('Error getting location:', error.message, '- Using fallback location.');
            setCurrentPosition(prev => prev ? prev : FALLBACK_LOCATION);
        };

        // Fallback timer: if browser blocks prompt or hangs without throwing
        const fallbackTimer = setTimeout(() => {
            setCurrentPosition(prev => {
                if (!prev) {
                    console.warn('Geolocation hanging. Using fallback location.');
                    return FALLBACK_LOCATION;
                }
                return prev;
            });
        }, 5000);

        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                clearTimeout(fallbackTimer);
                handlePosition(pos);
            },
            (err) => {
                clearTimeout(fallbackTimer);
                handleError(err);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            }
        );

        return () => {
            clearTimeout(fallbackTimer);
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, [activeMission, spoofLocation]); // Re-bind watch if activeMission or spoofLocation changes

    return {
        currentPosition,
        distanceToTarget,
        bearingToTarget,
        isArrived,
        startNavigation,
        setSpoofLocation, // App.tsx can mock current user location
    };
};
