import { useState, useEffect, useRef } from "react";
import type { Mission, GameState } from "../types";
import { DEFAULT_LOCATION, GPS_ARRIVAL_THRESHOLD_METERS } from "../constants";

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
  const [gpsError, setGpsError] = useState<string | null>(null);

  const [spoofLocation, setSpoofLocation] = useState<Position | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number => {
    const R = 6371e3;
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

  const calculateBearing = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number => {
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const λ1 = (lon1 * Math.PI) / 180;
    const λ2 = (lon2 * Math.PI) / 180;

    const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
    const x =
      Math.cos(φ1) * Math.sin(φ2) -
      Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
    const θ = Math.atan2(y, x);
    return ((θ * 180) / Math.PI + 360) % 360;
  };

  const startNavigation = (mission: Mission) => {
    setActiveMission(mission);

    const storedGameState = localStorage.getItem("gameState");
    let gameState: GameState;

    if (storedGameState) {
      gameState = JSON.parse(storedGameState);
      gameState.currentMissionIndex = gameState.completedMissions.length;
    } else {
      gameState = {
        adventureId: "current_adventure",
        currentMissionIndex: 0,
        completedMissions: [],
      };
    }

    localStorage.setItem("gameState", JSON.stringify(gameState));
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by your browser");
      setGpsError("הדפדפן שלך אינו תומך בשירות מיקום.");
      setCurrentPosition(DEFAULT_LOCATION);
      return;
    }

    const handlePosition = (position: GeolocationPosition | Position) => {
      const now = Date.now();
      if (now - lastUpdateRef.current < 3000 && !spoofLocation) {
        return;
      }
      lastUpdateRef.current = now;

      const latitude =
        "coords" in position ? position.coords.latitude : position.lat;
      const longitude =
        "coords" in position ? position.coords.longitude : position.lng;
      setCurrentPosition({ lat: latitude, lng: longitude });
      setGpsError(null);

      if (activeMission) {
        const distance = calculateDistance(
          latitude,
          longitude,
          activeMission.lat,
          activeMission.lng,
        );
        const bearing = calculateBearing(
          latitude,
          longitude,
          activeMission.lat,
          activeMission.lng,
        );

        setDistanceToTarget(Math.round(distance));
        setBearingToTarget(Math.round(bearing));
        setIsArrived(distance < GPS_ARRIVAL_THRESHOLD_METERS);
      }
    };

    if (spoofLocation) {
      handlePosition(spoofLocation);
      return;
    }

    const handleError = (error: GeolocationPositionError) => {
      console.warn("Error getting location:", error.message);
      setGpsError(
        "לא הצלחנו לאתר את המיקום שלך. אנא אפשר גישה למיקום בהגדרות הדפדפן.",
      );
      setCurrentPosition((prev) => (prev ? prev : DEFAULT_LOCATION));
    };

    const fallbackTimer = setTimeout(() => {
      setCurrentPosition((prev) => {
        if (!prev) {
          console.warn("Geolocation hanging. Using fallback location.");
          setGpsError(
            "לא הצלחנו לאתר את המיקום שלך. אנא אפשר גישה למיקום בהגדרות הדפדפן.",
          );
          return DEFAULT_LOCATION;
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
      },
    );

    return () => {
      clearTimeout(fallbackTimer);
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [activeMission, spoofLocation]);

  return {
    currentPosition,
    distanceToTarget,
    bearingToTarget,
    isArrived,
    gpsError,
    startNavigation,
    setSpoofLocation,
  };
};
