import React, { useState, useEffect, useRef } from 'react';
import type { Mission } from '../types';
import { worldsData } from '../worlds/worldsData';
import type { WorldTheme } from '../worlds/worldThemes';

interface MissionScreenProps {
    mission: Mission;
    worldId: string;
    theme: WorldTheme;
    onComplete: () => void;
}

const MissionScreen: React.FC<MissionScreenProps> = ({ mission, worldId, theme, onComplete }) => {
    const world = worldsData.find(w => w.id === worldId) || worldsData[0];

    const isTextAmount = typeof mission.amount === 'string';
    const numericAmount = isTextAmount ? 0 : (mission.amount as number);

    const isTimerMission = !isTextAmount && (mission.missionType === 'PLANK' || mission.missionType === 'RUN');

    // For timer: amount is in seconds. For counter: amount is repetitions.
    const [progress, setProgress] = useState(isTimerMission ? numericAmount : 0);
    const [isRunning, setIsRunning] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Timer logic
    useEffect(() => {
        if (isTimerMission && isRunning && progress > 0) {
            timerRef.current = setInterval(() => {
                setProgress((prev) => {
                    if (prev <= 1) {
                        setIsRunning(false);
                        setIsFinished(true);
                        clearInterval(timerRef.current!);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (progress === 0 && isTimerMission) {
            setIsFinished(true);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning, progress, isTimerMission]);

    // Counter logic
    const handleCounterClick = () => {
        if (!isTimerMission && !isTextAmount && progress < numericAmount) {
            const newProgress = progress + 1;
            setProgress(newProgress);
            if (newProgress >= numericAmount) {
                setIsFinished(true);
            }
        }
    };

    const handleFinishClick = () => {
        setIsAnimating(true);
        setTimeout(() => {
            onComplete();
        }, 800); // Wait for animation to finish
    };

    return (
        <div
            className="flex flex-col items-center justify-between min-h-[100dvh] p-4 text-center select-none overflow-x-hidden"
            style={{
                backgroundColor: world.secondaryColor,
                color: '#ffffff' // Ensure text is readable
            }}
            dir="rtl"
        >
            {/* Header */}
            <div className="w-full mt-4 md:mt-8 flex flex-col items-center">
                <div
                    className="text-5xl md:text-6xl mb-2 md:mb-4 p-3 md:p-4 inline-block rounded-full bg-white shadow-xl"
                    style={{ borderColor: world.primaryColor, borderWidth: '4px' }}
                >
                    {world.emoji}
                </div>
                <h1 className="text-3xl md:text-4xl font-black mb-2 drop-shadow-md text-white">
                    {mission.title}
                </h1>
                <p className="text-lg md:text-xl font-bold bg-white/20 p-3 md:p-4 rounded-3xl mx-2 md:mx-4 shadow-inner">
                    {theme.missionWrapper ? theme.missionWrapper(mission.description, mission.amount) : mission.description}
                </p>
            </div>

            {/* Interaction Area */}
            <div className="flex-grow flex flex-col items-center justify-center w-full my-4">
                {isTextAmount ? (
                    <div className="flex flex-col items-center w-full px-4">
                        <div
                            className="w-full max-w-[260px] md:max-w-sm aspect-square rounded-[3rem] shadow-2xl flex flex-col items-center justify-center border-8 text-white transition-all duration-150"
                            style={{
                                backgroundColor: world.primaryColor,
                                borderColor: 'rgba(255,255,255,0.3)'
                            }}
                        >
                            <span className="text-4xl md:text-5xl font-black mb-2 px-4 text-center pb-2 pt-2">
                                {mission.amount}
                            </span>
                        </div>
                    </div>
                ) : isTimerMission ? (
                    <div className="flex flex-col items-center">
                        <div
                            className="w-40 h-40 md:w-48 md:h-48 rounded-full flex items-center justify-center shadow-2xl border-[6px] md:border-8 mb-6 transition-transform duration-300 text-gray-900"
                            style={{
                                backgroundColor: isRunning ? world.primaryColor : '#ffffff',
                                borderColor: world.primaryColor,
                                transform: isRunning ? 'scale(1.05)' : 'scale(1)'
                            }}
                        >
                            <span className="text-6xl md:text-7xl font-black tabular-nums tracking-tighter">
                                {progress}
                            </span>
                        </div>
                        {!isFinished && (
                            <button
                                onClick={() => setIsRunning(!isRunning)}
                                className="text-3xl md:text-4xl font-bold px-10 py-4 md:px-12 md:py-6 rounded-full shadow-xl active:scale-95 transition-transform"
                                style={{
                                    backgroundColor: isRunning ? '#EF4444' : '#10B981', // Red for stop, Green for start
                                    color: 'white'
                                }}
                            >
                                {isRunning ? 'עצור' : 'התחל!'}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center w-full px-4">
                        <button
                            onClick={handleCounterClick}
                            disabled={isFinished}
                            className={`w-full max-w-[260px] md:max-w-sm aspect-square rounded-[3rem] shadow-2xl flex flex-col items-center justify-center border-8 text-gray-900 active:scale-90 transition-all duration-150 ${isFinished ? 'opacity-50' : ''}`}
                            style={{
                                backgroundColor: world.primaryColor,
                                borderColor: 'rgba(255,255,255,0.3)'
                            }}
                        >
                            <span className="text-7xl md:text-8xl font-black mb-1 md:mb-2">+</span>
                            <span className="text-4xl font-bold">
                                {progress} / {numericAmount}
                            </span>
                        </button>
                    </div>
                )}
            </div>

            {/* Footer / Finish Button */}
            <div className={`w-full h-24 md:h-32 mb-2 md:mb-4 pb-[env(safe-area-inset-bottom)] flex items-center justify-center transition-all duration-500 ${(isFinished || isTextAmount) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20 pointer-events-none'}`}>
                <button
                    onClick={handleFinishClick}
                    className={`text-4xl md:text-5xl font-black px-10 py-5 md:px-12 md:py-6 rounded-full shadow-[0_8px_0_0_rgba(0,0,0,0.2)] md:shadow-[0_10px_0_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[8px] md:active:translate-y-[10px] transition-all
                        ${isAnimating ? 'animate-bounce-custom scale-110' : ''}
                    `}
                    style={{
                        backgroundColor: '#10B981', // Success Green
                        color: 'white',
                    }}
                >
                    סיימתי!
                </button>
            </div>

            {/* Simple inline styles for custom animations if tailwind bounce isn't enough */}
            <style>{`
                @keyframes bounce-custom {
                    0%, 100% { transform: translateY(-25%) scale(1.1); animation-timing-function: cubic-bezier(0.8,0,1,1); }
                    50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); }
                }
                .animate-bounce-custom {
                    animation: bounce-custom 0.8s infinite;
                }
            `}</style>
        </div>
    );
};

export default MissionScreen;
