import React from "react";

interface OnboardingScreenProps {
  onDone: () => void;
}

const steps = [
  {
    emoji: "🗺️",
    title: "בחר הרפתקה",
    body: "בחר עולם והרפתקה מוכנה, או צור הרפתקה משלך לחברים ולמשפחה.",
  },
  {
    emoji: "📍",
    title: "נווט למיקום",
    body: "המפה תוביל אותך לנקודת המשימה הבאה. עקוב אחר החץ והמרחק.",
  },
  {
    emoji: "🎯",
    title: "השלם משימות",
    body: "הגעת? השלם את המשימה ואסוף את הפרס — ואז המשך למשימה הבאה!",
  },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onDone,
}) => {
  const [step, setStep] = React.useState(0);
  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div
      className="flex flex-col items-center justify-between min-h-[100dvh] p-8 text-center bg-gradient-to-b from-blue-500 to-indigo-700 text-white"
      dir="rtl"
    >
      {/* Progress dots */}
      <div className="flex gap-2 pt-4">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${i === step ? "bg-white scale-125" : "bg-white/40"}`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex flex-col items-center gap-6 flex-1 justify-center">
        <div className="text-8xl drop-shadow-lg">{current.emoji}</div>
        <h2 className="text-3xl font-black">{current.title}</h2>
        <p className="text-lg text-white/90 max-w-xs leading-relaxed">
          {current.body}
        </p>
      </div>

      {/* Action button */}
      <button
        type="button"
        onClick={() => (isLast ? onDone() : setStep((s) => s + 1))}
        className="w-full max-w-xs bg-white text-indigo-700 font-black text-xl py-4 rounded-full shadow-lg active:scale-95 transition-transform mb-6"
      >
        {isLast ? "בואו נתחיל! 🚀" : "הבא"}
      </button>
    </div>
  );
};
