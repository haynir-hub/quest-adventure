import React, { useMemo } from "react";
import { assetUrl } from "../utils/assets";
import type { HaiGagId } from "../utils/haiGags";

/**
 * "מה קרה לחי הפעם" — גימיק סיום משימה לעולם Doctor Nowhere.
 * שש תקריות שונות, אנימציית CSS טהורה (בלי ספריות, בלי קנבס).
 * מי שהגדיר במערכת ההפעלה "הפחת תנועה" מקבל תמונת סטילס עם הכיתוב בלבד.
 *
 * הערה על האנימציה: הנפילה מונפשת דרך המאפיין top ולא דרך translateY,
 * כי אחוזים ב-translate מחושבים לפי גובה האלמנט עצמו (גודל האמוג'י),
 * ואילו אחוזים ב-top מחושבים לפי גובה הבמה. רק ככה כל פריט חוצה
 * את המסגרת מלמעלה עד למטה בלי קשר לגודל שלו.
 */

interface GagConfig {
  caption: string;
  /** צבע רקע הבמה */
  stage: string;
  /** תנועת הראש של חי בזמן התקרית */
  faceAnimation: string;
  /**
   * מצב המנוחה של הפנים — מה שנראה כשהאנימציות מכובות
   * ("הפחת תנועה"). האנימציה תמיד גוברת עליו כשהיא רצה.
   */
  faceRestTransform: string;
}

const FACE_REST = "translateX(-50%)";

const GAGS: Record<HaiGagId, GagConfig> = {
  tomatoes: {
    caption: "עגבניות נופלות על חי! 🍅",
    stage: "linear-gradient(180deg, #4C1D24 0%, #7F1D1D 100%)",
    faceAnimation: "hai-shake 0.45s ease-in-out infinite",
    faceRestTransform: FACE_REST,
  },
  falafel: {
    caption: "יורד על חי גשם של פלאפל! 🧆",
    stage: "linear-gradient(180deg, #3B2C12 0%, #78561B 100%)",
    faceAnimation: "hai-shake 0.6s ease-in-out infinite",
    faceRestTransform: FACE_REST,
  },
  diapers: {
    caption: "טיטולים עם קקי נופלים על חי! 💩",
    stage: "linear-gradient(180deg, #33291B 0%, #6B4F2A 100%)",
    faceAnimation: "hai-shake 0.5s ease-in-out infinite",
    faceRestTransform: FACE_REST,
  },
  frogs: {
    caption: "חי מכוסה בצפרדעים! 🐸",
    stage: "linear-gradient(180deg, #14361F 0%, #276B3A 100%)",
    faceAnimation: "hai-wobble 1.1s ease-in-out infinite",
    faceRestTransform: FACE_REST,
  },
  bees: {
    caption: "חי חטף מכת דבורים! 🐝",
    stage: "linear-gradient(180deg, #3D3308 0%, #8A6D0C 100%)",
    faceAnimation: "hai-jitter 0.14s linear infinite",
    faceRestTransform: FACE_REST,
  },
  elephant: {
    caption: "פיל התיישב על חי! 🐘",
    stage: "linear-gradient(180deg, #2B2B33 0%, #55555F 100%)",
    faceAnimation: "hai-squash 3.2s ease-in-out infinite",
    // בסטילס הפיל כבר יושב, אז חי כבר נמעך
    faceRestTransform: `${FACE_REST} scale(1.22, 0.68)`,
  },
};

const RAIN_EMOJI: Partial<Record<HaiGagId, string>> = {
  tomatoes: "🍅",
  falafel: "🧆",
  diapers: "💩",
};

/** גשם של אמוג'י: מיקום, השהיה ומהירות מוגרלים פעם אחת לכל גאג. */
const useRainDrops = (gagId: HaiGagId, count: number) =>
  useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: `${5 + Math.random() * 86}%`,
        // מצב המנוחה: פזורים על פני הבמה, כך שגם בלי אנימציה
        // התמונה נראית כמו גשם באמצע הנפילה
        restTop: `${4 + Math.random() * 78}%`,
        delay: `${-Math.random() * 2}s`,
        duration: `${1.3 + Math.random() * 1.1}s`,
        size: `${24 + Math.random() * 16}px`,
        spinDeg: `${(Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 360)}deg`,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gagId, count],
  );

const FROGS = [
  { left: "36%", bottom: "56%", delay: "0s", size: "34px" },
  { left: "60%", bottom: "48%", delay: "0.25s", size: "28px" },
  { left: "47%", bottom: "68%", delay: "0.5s", size: "31px" },
  { left: "26%", bottom: "28%", delay: "0.15s", size: "26px" },
  { left: "68%", bottom: "24%", delay: "0.4s", size: "24px" },
];

// restAngle פורש את הנחיל למעגל גם כשהאנימציה כבויה
const BEES = [
  { radius: "46px", duration: "1.6s", delay: "0s", size: "24px", restAngle: 0 },
  {
    radius: "64px",
    duration: "2.1s",
    delay: "-0.4s",
    size: "21px",
    restAngle: 60,
  },
  {
    radius: "82px",
    duration: "2.6s",
    delay: "-0.9s",
    size: "26px",
    restAngle: 120,
  },
  {
    radius: "56px",
    duration: "1.9s",
    delay: "-1.3s",
    size: "22px",
    restAngle: 180,
  },
  {
    radius: "92px",
    duration: "3s",
    delay: "-1.8s",
    size: "19px",
    restAngle: 240,
  },
  {
    radius: "72px",
    duration: "2.3s",
    delay: "-2.2s",
    size: "23px",
    restAngle: 300,
  },
];

interface HaiGagAnimationProps {
  gagId: HaiGagId;
}

export const HaiGagAnimation: React.FC<HaiGagAnimationProps> = ({ gagId }) => {
  const gag = GAGS[gagId];
  const drops = useRainDrops(gagId, 16);
  const face = assetUrl("/images/hai/hai-face.png");
  const rainEmoji = RAIN_EMOJI[gagId];

  return (
    <div className="w-full flex flex-col items-center gap-3" dir="rtl">
      <style>{`
        @keyframes hai-fall {
          0%   { top: -18%; }
          100% { top: 104%; }
        }
        @keyframes hai-spin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(var(--hai-spin, 360deg)); }
        }
        @keyframes hai-shake {
          0%, 100% { transform: translateX(-50%) rotate(0deg); }
          25%      { transform: translateX(calc(-50% - 5px)) rotate(-3deg); }
          75%      { transform: translateX(calc(-50% + 5px)) rotate(3deg); }
        }
        @keyframes hai-wobble {
          0%, 100% { transform: translateX(-50%) rotate(-4deg); }
          50%      { transform: translateX(-50%) rotate(4deg); }
        }
        @keyframes hai-jitter {
          0%, 100% { transform: translate(-50%, 0); }
          25%      { transform: translate(calc(-50% - 2px), 1px); }
          50%      { transform: translate(calc(-50% + 2px), -1px); }
          75%      { transform: translate(calc(-50% - 1px), -2px); }
        }
        @keyframes hai-squash {
          0%, 30%  { transform: translateX(-50%) scale(1, 1); }
          45%, 88% { transform: translateX(-50%) scale(1.22, 0.68); }
          100%     { transform: translateX(-50%) scale(1, 1); }
        }
        @keyframes hai-hop {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-14px); }
        }
        @keyframes hai-orbit {
          0%   { transform: translate(-50%, -50%) rotate(0deg) translateX(var(--hai-radius, 60px)) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg) translateX(var(--hai-radius, 60px)) rotate(-360deg); }
        }
        @keyframes hai-elephant-sit {
          0%, 22%  { top: -46%; }
          38%, 88% { top: 26%; }
          100%     { top: -46%; }
        }
        /*
         * כיבוד "הפחת תנועה": התקרית קופאת לתמונת סטילס.
         * אין כאן תיקוני מיקום — כל אלמנט כבר יושב במצב המנוחה הנכון
         * שלו ב-inline style, והאנימציה היא זו שגוברת עליו כשהיא רצה.
         */
        @media (prefers-reduced-motion: reduce) {
          .hai-gag-stage,
          .hai-gag-stage * {
            animation: none !important;
          }
        }
      `}</style>

      <div
        className="hai-gag-stage relative w-full max-w-[280px] aspect-square rounded-3xl overflow-hidden border-4 border-white/70 shadow-2xl"
        style={{ background: gag.stage }}
        role="img"
        aria-label={gag.caption}
      >
        {/* חי */}
        <img
          src={face}
          alt=""
          aria-hidden="true"
          className="hai-face absolute left-1/2 bottom-[8%] w-[54%] rounded-full shadow-xl ring-4 ring-white/80"
          style={{
            transform: gag.faceRestTransform,
            transformOrigin: "center bottom",
            animation: gag.faceAnimation,
          }}
        />

        {/* עגבניות / פלאפל / טיטולים — גשם מלמעלה */}
        {rainEmoji &&
          drops.map((d) => (
            <span
              key={d.id}
              aria-hidden="true"
              className="absolute select-none leading-none"
              style={{
                left: d.left,
                top: d.restTop,
                fontSize: d.size,
                animation: `hai-fall ${d.duration} linear ${d.delay} infinite`,
              }}
            >
              <span
                className="block"
                style={{
                  ["--hai-spin" as string]: d.spinDeg,
                  animation: `hai-spin ${d.duration} linear ${d.delay} infinite`,
                }}
              >
                {gagId === "diapers" ? (
                  // טיטול: ריבוע לבן מעוגל עם הפתעה בפנים
                  <span className="inline-flex items-center justify-center w-[1.35em] h-[1em] bg-white rounded-b-[45%] rounded-t-[20%] shadow-md text-[0.6em]">
                    {rainEmoji}
                  </span>
                ) : (
                  rainEmoji
                )}
              </span>
            </span>
          ))}

        {/* צפרדעים — יושבות עליו ומקפצות */}
        {gagId === "frogs" &&
          FROGS.map((f, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="absolute select-none leading-none"
              style={{
                left: f.left,
                bottom: f.bottom,
                fontSize: f.size,
                animation: `hai-hop 0.8s ease-in-out ${f.delay} infinite`,
              }}
            >
              🐸
            </span>
          ))}

        {/* דבורים — נחיל שמקיף את הראש */}
        {gagId === "bees" && (
          <div className="absolute left-1/2 top-[46%] w-0 h-0">
            {BEES.map((b, i) => (
              <span
                key={i}
                aria-hidden="true"
                className="absolute left-0 top-0 select-none leading-none"
                style={{
                  fontSize: b.size,
                  ["--hai-radius" as string]: b.radius,
                  // מצב מנוחה: הנחיל פרוש כטבעת סביב הראש
                  transform: `translate(-50%, -50%) rotate(${b.restAngle}deg) translateX(${b.radius}) rotate(${-b.restAngle}deg)`,
                  animation: `hai-orbit ${b.duration} linear ${b.delay} infinite`,
                }}
              >
                🐝
              </span>
            ))}
          </div>
        )}

        {/* פיל — צונח מלמעלה, מתיישב על הראש, וחי נמעך תחתיו */}
        {gagId === "elephant" && (
          <span
            aria-hidden="true"
            className="hai-elephant absolute left-1/2 select-none leading-none text-[92px]"
            style={{
              // מצב מנוחה: הפיל כבר יושב עליו
              top: "26%",
              transform: "translateX(-50%)",
              animation: "hai-elephant-sit 3.2s ease-in-out infinite",
            }}
          >
            🐘
          </span>
        )}
      </div>

      <p className="text-2xl md:text-3xl font-black text-gray-800 leading-snug">
        {gag.caption}
      </p>
    </div>
  );
};
