import { useState, useEffect } from 'react';
import type { Adventure } from '../types';

const STORAGE_KEY = 'adventures';

export const useAdventureStorage = () => {
    const [adventures, setAdventures] = useState<Adventure[]>([]);

    useEffect(() => {
        const loadAdventures = () => {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                try {
                    setAdventures(JSON.parse(stored));
                } catch (e) {
                    console.error('Failed to parse adventures from localStorage', e);
                    setAdventures([]);
                }
            }
        };
        loadAdventures();
    }, []);

    const saveAdventure = (adventure: Adventure) => {
        setAdventures(prev => {
            const existingIndex = prev.findIndex(a => a.id === adventure.id);
            let updated: Adventure[];

            if (existingIndex >= 0) {
                updated = [...prev];
                updated[existingIndex] = adventure;
            } else {
                updated = [...prev, adventure];
            }

            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    const deleteAdventure = (id: string) => {
        setAdventures(prev => {
            const updated = prev.filter(a => a.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    const getAdventure = (id: string): Adventure | undefined => {
        return adventures.find(a => a.id === id);
    };

    const exportAdventureStr = (id: string) => {
        const adventure = getAdventure(id);
        if (!adventure) return null;

        const jsonString = JSON.stringify(adventure);
        // Encode using base64
        return btoa(encodeURIComponent(jsonString));
    };

    const importAdventureStr = (encodedStr: string) => {
        try {
            const jsonString = decodeURIComponent(atob(encodedStr));
            const adventure = JSON.parse(jsonString) as Adventure;
            if (adventure && adventure.id && adventure.name && adventure.worldId && adventure.missions) {
                // To avoid ID collisions if imported multiple times or on same device, generate new ID
                const importedAdventure = {
                    ...adventure,
                    id: Math.random().toString(36).substr(2, 9),
                    createdAt: Date.now()
                };
                saveAdventure(importedAdventure);
                return true;
            }
            return false;
        } catch (e) {
            console.error('Failed to import adventure', e);
            return false;
        }
    };

    return {
        adventures,
        saveAdventure,
        deleteAdventure,
        getAdventure,
        exportAdventure: exportAdventureStr,
        importAdventure: importAdventureStr
    };
};
