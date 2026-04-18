import { useState, useEffect } from "react";
import { buildShareUrl } from "./utils/share";
import { v4 as uuidv4 } from "uuid";
import WorldSelector from "./components/WorldSelector";
import AdventureCreator from "./components/AdventureCreator";
import { MapView } from "./components/MapView";
import MissionScreen from "./components/MissionScreen";
import { RewardScreen } from "./components/RewardScreen";
import { ARCameraView } from "./components/ARCameraView";
import { useNavigation } from "./hooks/useNavigation";
import type { GameState, Adventure, Mission } from "./types";
import { worldsData } from "./worlds/worldsData";
import { worldThemes } from "./worlds/worldThemes";
import { useRegisterSW } from "virtual:pwa-register/react";
import { OnboardingScreen } from "./components/OnboardingScreen";

const AppState = {
  ONBOARDING: "ONBOARDING",
  HOME: "HOME",
  WORLD_MENU: "WORLD_MENU",
  GAME_LIBRARY: "GAME_LIBRARY",
  CREATOR: "CREATOR",
  NAVIGATION: "NAVIGATION",
  AR_CAMERA: "AR_CAMERA",
  MISSION: "MISSION",
  REWARD: "REWARD",
  FINISH: "FINISH",
} as const;

type AppState = (typeof AppState)[keyof typeof AppState];

function App() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: any) {
      console.log("SW Registered: ", r);
    },
    onRegisterError(error: any) {
      console.log("SW registration error", error);
    },
  });

  const [appState, setAppState] = useState<AppState>(AppState.HOME);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentAdventure, setCurrentAdventure] = useState<Adventure | null>(
    null,
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [selectedWorldId, setSelectedWorldId] = useState<string | null>(null);
  const [adventuresCountOnOpen, setAdventuresCountOnOpen] = useState(0);

  // PWA Install State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // Setup PWA listener
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const { currentPosition, startNavigation, gpsError } = useNavigation();

  const safeLsGet = (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  };
  const safeLsSet = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("localStorage write failed", key, e);
    }
  };

  // Load state on mount — per-key try/catch so one corrupt entry doesn't block others
  useEffect(() => {
    // Deep-link import: ?adventure=BASE64
    const params = new URLSearchParams(window.location.search);
    const encodedAdv = params.get("adventure");
    if (encodedAdv) {
      try {
        const imported = JSON.parse(
          decodeURIComponent(escape(atob(encodedAdv))),
        ) as Adventure;
        imported.id = uuidv4(); // give it a fresh id to avoid collisions
        setCurrentAdventure(imported);
        setGameState({
          currentMissionIndex: 0,
          completedMissions: [],
          collectedItems: [],
          score: 0,
        });
        safeLsSet("quest_onboarded", "1");
        window.history.replaceState({}, "", window.location.pathname);
        setAppState(AppState.NAVIGATION);
        setIsLoaded(true);
        return;
      } catch (e) {
        console.error("Failed to import deep-link adventure", e);
      }
    }
    // Show onboarding on first ever launch
    if (!safeLsGet("quest_onboarded")) {
      setAppState(AppState.ONBOARDING);
      setIsLoaded(true);
      return;
    }
    let corrupted = false;
    const savedState = safeLsGet("quest_appState");
    try {
      const savedGame = safeLsGet("quest_gameState");
      const savedAdv = safeLsGet("quest_currentAdventure");
      if (savedState && savedGame && savedAdv) {
        setAppState(savedState as AppState);
        setGameState(JSON.parse(savedGame));
        setCurrentAdventure(JSON.parse(savedAdv));
      }
    } catch (e) {
      console.error("Corrupt localStorage — clearing", e);
      corrupted = true;
      ["quest_appState", "quest_gameState", "quest_currentAdventure"].forEach(
        (k) => {
          try {
            localStorage.removeItem(k);
          } catch {}
        },
      );
      setStorageError(true);
    }
    if (!corrupted) setIsLoaded(true);
    else setIsLoaded(true);
  }, []);

  // Save state on change
  useEffect(() => {
    if (!isLoaded) return;
    safeLsSet("quest_appState", appState);
    if (gameState) safeLsSet("quest_gameState", JSON.stringify(gameState));
    if (currentAdventure)
      safeLsSet("quest_currentAdventure", JSON.stringify(currentAdventure));
  }, [appState, gameState, currentAdventure, isLoaded]);

  const handleWorldSelect = (worldId: string) => {
    setSelectedWorldId(worldId);
    setAppState(AppState.WORLD_MENU);
  };

  const handlePlayGame = () => {
    if (!selectedWorldId) return;
    setAppState(AppState.GAME_LIBRARY);
  };

  const handleStartAdventure = (selectedAdv?: Adventure) => {
    const startPos = currentPosition || { lat: 32.0853, lng: 34.7818 }; // Default to Tel Aviv if no GPS yet

    // If no custom adventure, generate default one
    if (!selectedAdv) {
      const world = worldsData.find((w) => w.id === selectedWorldId)!;
      const missions: Mission[] = world.missions.map((m, index) => ({
        id: m.id,
        lat: startPos.lat + (index + 1) * 0.0003, // Small offset for generated markers
        lng: startPos.lng + (index + 1) * 0.0003,
        title: m.title,
        description: m.description,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        missionType: m.missionType as any,
        amount: m.amount,
        emoji: m.emoji,
        imageUrl: m.imageUrl,
      }));

      selectedAdv = {
        id: uuidv4(),
        name: `ההרפתקה של ${world.name}`,
        worldId: world.id,
        createdAt: Date.now(),
        missions,
      };
    }

    setCurrentAdventure(selectedAdv);
    setGameState({
      adventureId: selectedAdv.id,
      currentMissionIndex: 0,
      completedMissions: [],
    });
    setAppState(AppState.NAVIGATION);
  };

  const handleArrived = () => {
    setAppState(AppState.AR_CAMERA);
  };

  const handleSkipMission = () => {
    if (!gameState || !currentAdventure) return;
    const isLast =
      gameState.currentMissionIndex >= currentAdventure.missions.length - 1;
    if (isLast) {
      setAppState(AppState.FINISH);
    } else {
      setGameState((prev) => {
        if (!prev) return prev;
        return { ...prev, currentMissionIndex: prev.currentMissionIndex + 1 };
      });
    }
  };

  const handleCatch = () => {
    setAppState(AppState.MISSION);
  };

  const handleDeleteAdventure = (e: React.MouseEvent, adventureId: string) => {
    e.stopPropagation();
    if (window.confirm("האם אתם בטוחים שברצונכם למחוק הרפתקה זו?")) {
      try {
        const customAdventuresStr = localStorage.getItem("adventures");
        if (customAdventuresStr) {
          const customAdventures = JSON.parse(
            customAdventuresStr,
          ) as Adventure[];
          const updatedAdventures = customAdventures.filter(
            (a) => a.id !== adventureId,
          );
          localStorage.setItem("adventures", JSON.stringify(updatedAdventures));
          // Force a re-render of the GAME_LIBRARY by temporarily setting state
          setAppState(AppState.HOME);
          setTimeout(() => setAppState(AppState.GAME_LIBRARY), 0);
        }
      } catch (err) {
        console.error("Failed to delete adventure", err);
      }
    }
  };

  const handleShareAdventure = (e: React.MouseEvent, adventure: Adventure) => {
    e.stopPropagation();
    const jsonString = JSON.stringify(adventure);
    const encodedStr = btoa(encodeURIComponent(jsonString));

    // Copy to clipboard
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(encodedStr)
        .then(() => {
          alert(
            'קוד ההרפתקה הועתק בהצלחה!\n\nשלחו את הקוד לטלפון שלכם (למשל בוואטסאפ) והדביקו אותו בכפתור "ייבוא משחק מהמחשב".',
          );
        })
        .catch(() => {
          window.prompt("העתק את הקוד הבא:", encodedStr);
        });
    } else {
      window.prompt("העתק את הקוד הבא:", encodedStr);
    }
  };

  const handleMissionComplete = () => {
    setAppState(AppState.REWARD);
  };

  const handleRewardContinue = () => {
    if (!gameState || !currentAdventure) return;

    const isLast =
      gameState.currentMissionIndex >= currentAdventure.missions.length - 1;

    if (isLast) {
      setAppState(AppState.FINISH);
    } else {
      setGameState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          currentMissionIndex: prev.currentMissionIndex + 1,
          completedMissions: [
            ...prev.completedMissions,
            currentAdventure.missions[prev.currentMissionIndex].id,
          ],
        };
      });
      setAppState(AppState.NAVIGATION);
    }
  };

  const resetGame = () => {
    setAppState(AppState.HOME);
    setGameState(null);
    setCurrentAdventure(null);
    localStorage.removeItem("quest_appState");
    localStorage.removeItem("quest_gameState");
    localStorage.removeItem("quest_currentAdventure");
  };

  useEffect(() => {
    if (appState === AppState.NAVIGATION && currentAdventure && gameState) {
      const mission = currentAdventure.missions[gameState.currentMissionIndex];
      if (mission) startNavigation(mission);
    }
  }, [appState, currentAdventure, gameState, startNavigation]);

  // Back button logic based on AppState
  const handleBack = () => {
    switch (appState) {
      case AppState.WORLD_MENU:
        setAppState(AppState.HOME);
        setSelectedWorldId(null);
        break;
      case AppState.GAME_LIBRARY:
        setAppState(AppState.WORLD_MENU);
        break;
      case AppState.NAVIGATION:
        setAppState(AppState.GAME_LIBRARY);
        break;
      case AppState.MISSION:
        setAppState(AppState.NAVIGATION);
        break;
      case AppState.REWARD:
        setAppState(AppState.NAVIGATION);
        break;
      case AppState.FINISH:
        resetGame();
        break;
      case AppState.CREATOR:
        if (selectedWorldId) {
          setAppState(AppState.WORLD_MENU);
        } else {
          setAppState(AppState.HOME);
        }
        break;
      default:
        setAppState(AppState.HOME);
    }
  };

  const handleCreatorClose = () => {
    try {
      const customAdventuresStr = localStorage.getItem("adventures");
      if (customAdventuresStr) {
        const customAdventures = JSON.parse(customAdventuresStr) as Adventure[];
        if (customAdventures.length > adventuresCountOnOpen) {
          const newAdv = customAdventures[customAdventures.length - 1];
          setCurrentAdventure(newAdv);
          setGameState({
            adventureId: newAdv.id,
            currentMissionIndex: 0,
            completedMissions: [],
          });
          setAppState(AppState.NAVIGATION);
          return;
        }
      }
    } catch (e) {
      console.error("Failed to parse custom adventures", e);
    }
    handleBack();
  };

  if (!isLoaded) return <div className="min-h-screen bg-slate-50"></div>;

  const handleOnboardingDone = () => {
    safeLsSet("quest_onboarded", "1");
    setAppState(AppState.HOME);
  };

  const renderScreen = () => {
    switch (appState) {
      case AppState.ONBOARDING:
        return <OnboardingScreen onDone={handleOnboardingDone} />;
      case AppState.HOME:
        return (
          <div className="flex items-center justify-center p-4 min-h-screen">
            <WorldSelector onSelect={handleWorldSelect} />
          </div>
        );
      case AppState.WORLD_MENU: {
        const worldName =
          worldsData.find((w) => w.id === selectedWorldId)?.name || "עולם";
        return (
          <div
            className="flex flex-col items-center justify-center p-4 min-h-screen animate-in fade-in zoom-in duration-300"
            dir="rtl"
          >
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-12 max-w-md text-center drop-shadow-sm leading-tight">
              מה תרצו לעשות
              <br />ב<span className="text-blue-600">{worldName}</span>?
            </h2>
            <div className="flex flex-col gap-6 w-full max-w-sm">
              <button
                onClick={handlePlayGame}
                className="bg-blue-600 text-white text-3xl font-black py-8 px-8 rounded-3xl shadow-xl hover:bg-blue-700 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center border-b-[6px] border-blue-800"
              >
                <span className="ml-4 text-4xl">🎮</span>
                שחק
              </button>
              <button
                onClick={() => {
                  const adventuresStr = localStorage.getItem("adventures");
                  const currentCount = adventuresStr
                    ? JSON.parse(adventuresStr).length
                    : 0;
                  setAdventuresCountOnOpen(currentCount);
                  setAppState(AppState.CREATOR);
                }}
                className="bg-emerald-500 text-white text-2xl font-black py-6 px-8 rounded-3xl shadow-xl hover:bg-emerald-600 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center border-b-[6px] border-emerald-700 mt-4"
              >
                <span className="ml-3 text-3xl">➕</span>
                צור הרפתקה
              </button>
              <button
                onClick={() => {
                  const code = window.prompt(
                    "הדביקו כאן את הקוד שהעתקתם מהמחשב (Share Code):",
                  );
                  if (code) {
                    try {
                      const jsonString = decodeURIComponent(atob(code.trim()));
                      const adventure = JSON.parse(jsonString) as Adventure;
                      if (
                        adventure &&
                        adventure.id &&
                        adventure.name &&
                        adventure.worldId &&
                        adventure.missions
                      ) {
                        const importedAdventure = {
                          ...adventure,
                          id: Math.random().toString(36).substr(2, 9),
                          createdAt: Date.now(),
                        };
                        const existing = localStorage.getItem("adventures");
                        const adventures = existing ? JSON.parse(existing) : [];
                        adventures.push(importedAdventure);
                        localStorage.setItem(
                          "adventures",
                          JSON.stringify(adventures),
                        );
                        alert("ההרפתקה יובאה בהצלחה!");
                        setSelectedWorldId(adventure.worldId);
                        setAppState(AppState.GAME_LIBRARY);
                      } else {
                        alert("קוד לא חוקי.");
                      }
                    } catch (err) {
                      alert("שגיאה בייבוא - האם העתקתם נכון את כל הקוד?");
                    }
                  }
                }}
                className="bg-purple-500 text-white text-2xl font-black py-4 px-8 rounded-3xl shadow-xl hover:bg-purple-600 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center border-b-[6px] border-purple-700 mt-2"
              >
                <span className="ml-3 text-3xl">📥</span>
                ייבוא משחק מהמחשב
              </button>
            </div>
          </div>
        );
      }
      case AppState.GAME_LIBRARY: {
        const worldName =
          worldsData.find((w) => w.id === selectedWorldId)?.name || "עולם";
        const worldEmoji =
          worldsData.find((w) => w.id === selectedWorldId)?.emoji || "🌍";
        const primaryColor =
          worldsData.find((w) => w.id === selectedWorldId)?.primaryColor ||
          "#3B82F6";
        let worldAdventures: Adventure[] = [];
        try {
          const customAdventuresStr = localStorage.getItem("adventures");
          if (customAdventuresStr) {
            const customAdventures = JSON.parse(
              customAdventuresStr,
            ) as Adventure[];
            worldAdventures = customAdventures.filter(
              (a) =>
                a.worldId === selectedWorldId &&
                a.missions &&
                a.missions.length > 0,
            );
          }
        } catch (e) {
          console.error("Failed to parse custom adventures", e);
        }

        return (
          <div
            className="flex flex-col items-center p-6 min-h-screen animate-in fade-in zoom-in duration-300"
            dir="rtl"
          >
            <div className="w-full max-w-lg mb-8 text-center pt-12">
              <div
                className="text-6xl mb-4"
                style={{ filter: "drop-shadow(0px 10px 10px rgba(0,0,0,0.1))" }}
              >
                {worldEmoji}
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-800 leading-tight">
                ספריית המשחקים של {worldName}
              </h2>
              <p className="text-slate-500 mt-2 font-medium">
                בחרו הרפתקה כדי להתחיל לשחק!
              </p>
            </div>

            <div className="w-full max-w-lg space-y-4">
              {/* Default Adventure */}
              <button
                onClick={() => handleStartAdventure()}
                className="w-full bg-white rounded-3xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-between border-2 border-slate-100 group text-right"
              >
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-1">
                    הרפתקה רגילה מיוצרת מראש
                  </h3>
                  <p className="text-slate-500 font-medium text-sm">
                    הרפתקה קלאסית עם 5 משימות סביבכם
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white transform group-hover:scale-110 transition-transform shadow-inner"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span className="text-xl">▶</span>
                </div>
              </button>

              {/* Custom Adventures */}
              {worldAdventures.length > 0 && (
                <div className="mt-8 pt-8 border-t-2 border-slate-200">
                  <h3 className="text-xl font-bold text-slate-400 mb-4 px-2">
                    ההרפתקאות שיצרתם:
                  </h3>
                  <div className="space-y-4">
                    {worldAdventures
                      .slice()
                      .reverse()
                      .map((adv) => (
                        <div key={adv.id} className="relative group">
                          <button
                            onClick={() => handleStartAdventure(adv)}
                            className="w-full bg-slate-800 text-white rounded-3xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-between text-right"
                          >
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="bg-white/20 text-xs px-2 py-1 rounded-md font-bold">
                                  נוצר על ידכם
                                </span>
                                <h3 className="text-2xl font-bold text-white leading-tight">
                                  {adv.name}
                                </h3>
                              </div>
                              <p className="text-slate-300 font-medium text-sm mt-1">
                                {adv.missions.length} משימות בסיפור
                              </p>
                            </div>
                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-slate-800 bg-white transform group-hover:scale-110 transition-transform shadow-inner">
                              <span className="text-xl">▶</span>
                            </div>
                          </button>
                          <button
                            onClick={(e) => handleDeleteAdventure(e, adv.id)}
                            className="absolute top-0 left-0 m-4 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 hover:scale-110"
                            aria-label="מחק הרפתקה"
                          >
                            <span className="text-xl">🗑️</span>
                          </button>
                          <button
                            onClick={(e) => handleShareAdventure(e, adv)}
                            className="absolute top-0 left-16 m-4 w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 hover:scale-110"
                            aria-label="שתף הרפתקה"
                          >
                            <span className="text-xl">🔗</span>
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Create New Shortcut */}
              <button
                onClick={() => {
                  const adventuresStr = localStorage.getItem("adventures");
                  const currentCount = adventuresStr
                    ? JSON.parse(adventuresStr).length
                    : 0;
                  setAdventuresCountOnOpen(currentCount);
                  setAppState(AppState.CREATOR);
                }}
                className="w-full mt-8 bg-transparent border-4 border-dashed border-slate-300 text-slate-500 rounded-3xl p-6 hover:bg-slate-100 hover:border-slate-400 hover:text-slate-700 transition-all font-bold text-xl flex flex-col items-center justify-center gap-2"
              >
                <span className="text-3xl">+</span>
                צרו הרפתקה חדשה לגמרי!
              </button>
            </div>
          </div>
        );
      }
      case AppState.CREATOR:
        return <AdventureCreator onClose={handleCreatorClose} />;
      case AppState.NAVIGATION:
        return currentAdventure && gameState ? (
          <MapView
            missions={currentAdventure.missions}
            currentMissionIndex={gameState.currentMissionIndex}
            onArrived={handleArrived}
            onSkip={handleSkipMission}
            currentPosition={currentPosition}
            worldId={currentAdventure.worldId}
            gpsError={gpsError}
          />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-screen">
            טוען נתוני הרפתקה...
          </div>
        );
      case AppState.AR_CAMERA: {
        const mission =
          currentAdventure?.missions[gameState?.currentMissionIndex || 0];
        return mission && currentAdventure ? (
          <ARCameraView
            mission={mission}
            worldId={currentAdventure.worldId}
            onCatch={handleCatch}
          />
        ) : null;
      }
      case AppState.MISSION: {
        const mission =
          currentAdventure?.missions[gameState?.currentMissionIndex || 0];
        const themeKey =
          currentAdventure?.worldId === "treasure"
            ? "treasures"
            : currentAdventure?.worldId || "mario";
        const theme = worldThemes[themeKey] || Object.values(worldThemes)[0];

        return mission && currentAdventure ? (
          <MissionScreen
            mission={mission}
            worldId={currentAdventure.worldId}
            theme={theme}
            onComplete={handleMissionComplete}
          />
        ) : null;
      }
      case AppState.REWARD:
        return currentAdventure && gameState ? (
          <RewardScreen
            worldId={currentAdventure.worldId}
            missionIndex={gameState.currentMissionIndex}
            totalMissions={currentAdventure.missions.length}
            onContinue={handleRewardContinue}
            isLastMission={
              gameState.currentMissionIndex >=
              currentAdventure.missions.length - 1
            }
          />
        ) : null;
      case AppState.FINISH: {
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
        return (
          <div
            className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-green-500 text-white animate-in zoom-in duration-500"
            dir="rtl"
          >
            <div className="text-9xl mb-8 drop-shadow-2xl">🏆</div>
            <h1 className="text-5xl md:text-6xl font-black mb-6">כל הכבוד!</h1>
            <p className="text-2xl md:text-3xl mb-12 font-bold bg-black/10 px-6 py-3 rounded-2xl">
              השלמתם את ההרפתקה בהצלחה!
            </p>
            <div className="flex flex-col gap-4 w-full max-w-sm">
              <button
                type="button"
                onClick={handleShare}
                className="bg-white/20 border-2 border-white text-white font-black text-xl px-12 py-5 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                שתף הרפתקה 🔗
              </button>
              <button
                type="button"
                onClick={resetGame}
                className="bg-white text-green-600 font-black text-2xl px-12 py-6 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                הרפתקה חדשה
              </button>
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  if (storageError) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-slate-50"
        dir="rtl"
      >
        <div className="text-6xl mb-6">⚠️</div>
        <h2 className="text-2xl font-bold mb-3 text-slate-800">
          נתוני המשחק פגומים
        </h2>
        <p className="text-slate-600 mb-8">
          נמצא קובץ שמירה פגום ונמחק. לחץ להתחיל מחדש.
        </p>
        <button
          type="button"
          onClick={() => {
            setStorageError(false);
            setAppState(AppState.HOME);
          }}
          className="bg-blue-500 text-white font-bold py-4 px-8 rounded-full shadow-lg text-xl w-full max-w-xs"
        >
          התחל מחדש
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative pb-20">
      {renderScreen()}

      {/* PWA Update Prompt */}
      {needRefresh && (
        <div
          className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl z-[100] flex flex-col items-center justify-center gap-3 w-max max-w-[90vw] animate-in slide-in-from-bottom-10"
          dir="rtl"
        >
          <span className="font-bold">גרסה חדשה של המשחק זמינה! 🎉</span>
          <button
            onClick={() => updateServiceWorker(true)}
            className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold w-full hover:bg-emerald-600 transition-colors"
          >
            רענן עכשיו
          </button>
        </div>
      )}

      {/* PWA Install Button — persistent floating, hidden only on onboarding */}
      {isInstallable && appState !== AppState.ONBOARDING && (
        <button
          type="button"
          onClick={handleInstallClick}
          className="fixed bottom-28 left-4 bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg z-[100] flex items-center gap-2 hover:bg-blue-700 active:scale-95 transition-all text-base font-bold border-2 border-white min-h-[48px]"
          dir="rtl"
        >
          <span className="text-xl" role="img" aria-label="mobile">
            📱
          </span>
          הוסף למסך הבית
        </button>
      )}

      {/* Global Back Button (RTL top right) */}
      {appState !== AppState.HOME &&
        appState !== AppState.FINISH &&
        appState !== AppState.CREATOR && (
          <button
            onClick={handleBack}
            className="fixed top-6 right-6 bg-white/90 backdrop-blur-md text-slate-800 px-4 py-2 rounded-full shadow-lg z-[100] flex items-center justify-center hover:bg-white active:scale-95 transition-all text-lg font-bold border-2 border-slate-200/50"
            aria-label="חזרה"
            dir="rtl"
          >
            <span className="mr-2">&rarr;</span> חזרה
          </button>
        )}

      {/* Floating Action Button for Trainer (Only on HOME page) */}
      {appState === AppState.HOME && (
        <button
          onClick={() => {
            const adventuresStr = localStorage.getItem("adventures");
            const currentCount = adventuresStr
              ? JSON.parse(adventuresStr).length
              : 0;
            setAdventuresCountOnOpen(currentCount);
            setAppState(AppState.CREATOR);
          }}
          className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all z-[100] flex items-center justify-center min-w-[64px] min-h-[64px] select-none touch-manipulation border-2 border-white focus:outline-none focus:ring-4 focus:ring-indigo-300"
          aria-label="פתח פאנל מאמן"
        >
          <span className="text-3xl" role="img" aria-label="tools">
            🛠️
          </span>
        </button>
      )}
    </div>
  );
}

export default App;
