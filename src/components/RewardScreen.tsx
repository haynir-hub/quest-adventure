import React, { useEffect, useRef, useState } from "react";
import { worldsData } from "../worlds/worldsData";
import { HaiGagAnimation } from "./HaiGagAnimation";
import { nextHaiGag, type HaiGagId } from "../utils/haiGags";
import { CharacterVideo } from "./CharacterVideo";
import { characterVideoFor } from "../utils/characterVideos";

interface RewardScreenProps {
  worldId: string;
  missionIndex: number; // 0-indexed
  totalMissions: number;
  onContinue: () => void;
  isLastMission: boolean;
  characterImageUrl?: string;
  characterName?: string;
}

const SHAPES = ["square", "circle", "triangle"];
const NUM_CONFETTI = 50;

// Helper to determine text color based on background luminance
const getContrastColor = (hex: string) => {
  // Remove hash if present
  const h = hex.replace("#", "");
  // Parse r, g, b values
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);

  // Calculate luminance
  // Standard formula for perceived brightness
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return dark gray for bright backgrounds, white for dark backgrounds
  return luminance > 0.5 ? "#1A1A1A" : "#ffffff";
};

// Helper to generate distinct confetti items
const generateConfetti = (colors: string[]) => {
  return Array.from({ length: NUM_CONFETTI }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 2}s`,
    animationDuration: `${2 + Math.random() * 3}s`,
    color: colors[Math.floor(Math.random() * colors.length)],
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
  }));
};

// Achievement text maps
const marioAchievements = [
  "מצאת פטריית קסם! 🍄",
  "השגת כוכב זוהר! ⭐",
  "אספת 10 מטבעות זהב! 🪙",
  "עברת צינור סודי! 🟢",
  "ניצחת את באוזר! 👑",
];

const pokemonAchievements = [
  "תפסת פיקאצ'ו! ⚡",
  "מצאת פוקדור נדיר! 🔴",
  "ניצחת במכון הראשון! 🏅",
  "הפוקימון שלך התפתח! ✨",
  "הפכת למאסטר פוקימון! 🏆",
];

const treasureAchievements = [
  "מצאת מטבע זהב נוצץ! 🪙",
  "חשפת מפת אוצר עתיקה! 🗺️",
  "גילית יהלום כחול נדיר! 💎",
  "פתחת תיבת אוצר סודית! 🧰",
  "מצאת את כתר המלך! 👑",
];

const fnafAchievements = [
  "שרדתם את הלילה הראשון! 🌙",
  "חמקתם מהאנימטרוניק! 🏃",
  "הלחצנות עובדות — עוד לילה! 🔦",
  "הלילה הרביעי — כמעט שם! 🎭",
  "שרדתם את כל חמשת הלילות! 🏆",
];

const monsterAchievements = [
  "האור חזר לשכונה — חי הפיל את חיבוט! ⚡",
  "המים זורמים שוב — חיבוט נשטף! 💧",
  "הקליטה חזרה — חיבוט עף מהאנטנה! 📡",
  "הרמזורים ירוקים — חי הפיל אותו על הכביש! 🚦",
  "הסל יושר — חי ניצח אותו במגרש! 🏀",
  "השער נפתח — חיבוט נשאר בחוץ! 🏫",
  "מכונת השיבוט כובתה — חיבוט הובס סופית! 🔥",
];

const achievementsByWorld: Record<string, string[]> = {
  mario: marioAchievements,
  pokemon: pokemonAchievements,
  treasure: treasureAchievements,
  fnaf: fnafAchievements,
  monster: monsterAchievements,
};

const getAchievementText = (worldId: string, index: number) => {
  const list = achievementsByWorld[worldId];
  if (!list || list.length === 0) return "השגת פריט מיוחד! ✨";
  // המודולו הוא מול אורך הרשימה עצמה. קודם הוא היה קבוע 5, ולכן עולם עם
  // שבע משימות היה חוזר לטקסט של משימה 1 בסיבוב השני.
  return list[index % list.length];
};

export const RewardScreen: React.FC<RewardScreenProps> = ({
  worldId,
  missionIndex,
  totalMissions,
  onContinue,
  isLastMission,
  characterImageUrl,
  characterName = "הדמות",
}) => {
  const world = worldsData.find((w) => w.id === worldId) || worldsData[0];
  const [confetti, setConfetti] = useState<any[]>([]);

  // בעולם Doctor Nowhere: בסוף כל משימה קורה לחי משהו אחר.
  // הבחירה נעשית פעם אחת בטעינת המסך — ה-ref מונע קידום כפול של המונה
  // ב-StrictMode, ששם את ה-effect פעמיים בפיתוח.
  const showHaiGag = worldId === "doctor";
  const characterVideo = characterVideoFor(characterImageUrl);
  const [videoUnavailable, setVideoUnavailable] = useState(false);
  const [haiGag, setHaiGag] = useState<HaiGagId | null>(null);
  const haiGagPicked = useRef(false);

  useEffect(() => {
    if (!showHaiGag || haiGagPicked.current) return;
    haiGagPicked.current = true;
    setHaiGag(nextHaiGag());
  }, [showHaiGag]);

  useEffect(() => {
    // Generate confetti matching the world colors
    const colors = [
      world.primaryColor,
      world.secondaryColor,
      "#ffffff",
      "#FFD700",
    ];
    setConfetti(generateConfetti(colors));
  }, [world]);

  const achievementText = getAchievementText(worldId, missionIndex);
  const buttonTextColor = getContrastColor(world.secondaryColor);

  return (
    <div
      dir="rtl"
      className="fixed inset-0 flex flex-col items-center justify-center p-4 md:p-6 text-center overflow-hidden z-[5000] transition-colors duration-500 ease-in-out"
      style={{ backgroundColor: world.primaryColor }}
    >
      {/* Confetti Animation Layer */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        {confetti.map((c) => (
          <div
            key={c.id}
            className={`absolute top-[-10%] opacity-80 ${c.shape === "circle" ? "rounded-full" : "rounded-sm"}`}
            style={{
              left: c.left,
              width: c.shape === "triangle" ? "0" : "12px",
              height: c.shape === "triangle" ? "0" : "24px",
              backgroundColor: c.shape === "triangle" ? "transparent" : c.color,
              borderLeft:
                c.shape === "triangle" ? "8px solid transparent" : "none",
              borderRight:
                c.shape === "triangle" ? "8px solid transparent" : "none",
              borderBottom:
                c.shape === "triangle" ? `16px solid ${c.color}` : "none",
              animation: `fall ${c.animationDuration} linear ${c.animationDelay} infinite`,
            }}
          />
        ))}
      </div>

      {/* Inject Keyframes styling for the Confetti */}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
        @keyframes bounce-custom {
          0%, 100% { transform: translateY(-5%); }
          50% { transform: translateY(5%); }
        }
      `}</style>

      {/* Content Container */}
      <div
        className="relative z-10 w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto p-5 md:p-8 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl flex flex-col items-center gap-4 md:gap-6 border-4 mx-4"
        style={{ borderColor: world.secondaryColor }}
      >
        {characterVideo && !videoUnavailable ? (
          <CharacterVideo
            src={characterVideo}
            characterName={characterName}
            onUnavailable={() => setVideoUnavailable(true)}
          />
        ) : showHaiGag && haiGag ? (
          <HaiGagAnimation gagId={haiGag} />
        ) : (
          <div
            className="text-7xl md:text-9xl filter drop-shadow-xl animate-[bounce-custom_3s_ease-in-out_infinite]"
            style={{ filter: `drop-shadow(0 0 20px ${world.secondaryColor})` }}
          >
            {world.emoji}
          </div>
        )}

        {isLastMission ? (
          <>
            <h1 className="text-3xl md:text-5xl font-black text-gray-800 leading-tight">
              כל הכבוד!
              <br />
              <span style={{ color: world.primaryColor }}>
                סיימת את ההרפתקה!
              </span>
            </h1>
            <p className="text-xl font-bold text-gray-600 mt-2">
              אתם אלופים אמיתיים!
            </p>
          </>
        ) : (
          <>
            {/* כשהגאג של חי מוצג, הכיתוב שלו הוא הכותרת — בלי כותרת כפולה */}
            {!(showHaiGag && haiGag) && (
              <h1 className="text-3xl font-black text-gray-800">
                {achievementText}
              </h1>
            )}
            <div className="w-full bg-gray-200 rounded-full h-6 mt-4 overflow-hidden border-2 border-gray-300 relative shadow-inner">
              <div
                className="h-full transition-all duration-1000 ease-out flex items-center justify-end pr-2 text-xs font-bold text-white shadow-md relative"
                style={{
                  width: `${((missionIndex + 1) / totalMissions) * 100}%`,
                  background: `linear-gradient(90deg, ${world.primaryColor}, ${world.secondaryColor})`,
                }}
              >
                {missionIndex + 1}/{totalMissions}
                {/* Shine effect overlay */}
                <div className="absolute top-0 bottom-0 left-0 right-0 bg-white opacity-20 transform -skew-x-12 animate-[pulse_2s_infinite]"></div>
              </div>
            </div>
            <p className="text-xl font-bold text-gray-600 mt-2">
              משימה {missionIndex + 1} מתוך {totalMissions} הושלמה!
            </p>
          </>
        )}

        <button
          onClick={onContinue}
          className="mt-4 md:mt-6 w-full py-3 px-4 md:py-4 md:px-6 rounded-2xl text-xl md:text-2xl font-black shadow-xl transform transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 md:gap-3 relative overflow-hidden"
          style={{
            backgroundColor: world.secondaryColor,
            color: buttonTextColor,
            borderBottom: `6px solid ${world.primaryColor}`,
          }}
        >
          {/* Shine effect on button */}
          <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 hover:animate-shine" />

          <span>{isLastMission ? "חזור למסך הראשי" : "המשך להרפתקה!"}</span>
          <span aria-hidden="true" className="text-3xl mb-1">
            ↑
          </span>
        </button>
      </div>
    </div>
  );
};
