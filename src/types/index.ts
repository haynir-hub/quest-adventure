export interface World {
    id: string;
    name: string;
    description: string;
    colors: string[]; // e.g., ['#FF5733', '#C70039'] or tailwind classes
    primaryColor: string;
    secondaryColor: string;
    emoji: string;
}

export type MissionType = string;

export interface Mission {
    id: string;
    lat: number;
    lng: number;
    title: string;
    description: string;
    missionType: MissionType;
    amount: number | string; // Represents reps, seconds, or free text
    emoji?: string;
    imageUrl?: string;
}

export interface Adventure {
    id: string;
    name: string;
    worldId: string;
    createdAt: number; // Timestamp
    missions: Mission[];
}

export interface GameState {
    adventureId: string;
    currentMissionIndex: number;
    completedMissions: string[]; // Array of Mission IDs
}
