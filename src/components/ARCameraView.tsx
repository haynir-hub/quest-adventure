import React, { useEffect, useRef, useState } from 'react';
import type { Mission } from '../types';
import { worldsData } from '../worlds/worldsData';
import { worldThemes } from '../worlds/worldThemes';
import { assetUrl } from '../utils/assets';

interface ARCameraViewProps {
    mission: Mission;
    worldId: string;
    onCatch: () => void;
}

export const ARCameraView: React.FC<ARCameraViewProps> = ({ mission, worldId, onCatch }) => {
    const [isThrowing, setIsThrowing] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Get the world's catch item
    const theme = worldThemes[worldId === 'treasure' ? 'treasures' : worldId];
    const catchItemImage = theme?.catchItemImage;
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Emoji positioning state for animation
    const [emojiPos, setEmojiPos] = useState({ x: 50, y: 50 });

    const world = worldsData.find(w => w.id === worldId);
    const displayEmoji = mission.emoji || world?.emoji || '✨';

    useEffect(() => {
        let stream: MediaStream | null = null;

        const startCamera = async () => {
            try {
                // Request back camera
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setHasPermission(true);
            } catch (err) {
                console.error("Error accessing camera:", err);
                // Fallback gracefully if camera is denied or unavailable (e.g. desktop without cam)
                setHasPermission(false);
                setError('לא הצלחנו לגשת למצלמה. אפשר להמשיך למשימה רגיל!');
            }
        };

        startCamera();

        // Cleanup function to stop tracks when component unmounts
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Random floating animation for the emoji
    useEffect(() => {
        if (!hasPermission) return;

        const moveEmoji = () => {
            // Move within a safe zone to avoid edges (15% to 85% of screen)
            const newX = 15 + Math.random() * 70;
            const newY = 15 + Math.random() * 70;
            setEmojiPos({ x: newX, y: newY });
        };

        const intervalId = setInterval(moveEmoji, 1500 + Math.random() * 1000); // 1.5 - 2.5s jitter
        return () => clearInterval(intervalId);
    }, [hasPermission]);

    const handleThrow = () => {
        if (isThrowing) return;
        setIsThrowing(true);

        // Wait for the CSS transition to finish before calling onCatch
        setTimeout(() => {
            onCatch();
        }, 600);
    };

    // Handle the case where the camera is denied or broken
    if (hasPermission === false) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center animate-in fade-in" dir="rtl">
                <div className="text-6xl mb-6">📷❌</div>
                <h2 className="text-3xl font-bold mb-4">{error}</h2>
                <button
                    onClick={onCatch}
                    className="bg-blue-500 text-white font-bold py-4 px-8 rounded-full shadow-lg text-2xl w-full"
                >
                    המשך למשימה
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center overflow-hidden" dir="rtl">
            {/* Camera feed */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Title / Instructions Overlay */}
            <div className="absolute top-12 left-0 right-0 z-10 text-center pointer-events-none px-4">
                <div className="inline-block bg-black/60 backdrop-blur-md rounded-2xl p-4 text-white shadow-xl border border-white/20 animate-pulse">
                    <h2 className="text-2xl font-black mb-1">מצאתם את המשימה!</h2>
                    <p className="font-bold text-lg text-green-300">תפסו את ה{displayEmoji} כדי להתחיל</p>
                </div>
            </div>

            {/* Floating Interactive Emoji (The "AR" element) */}
            {hasPermission && (
                <button
                    onClick={catchItemImage ? handleThrow : onCatch}
                    className="absolute z-20 transition-all ease-in-out duration-1000 flex items-center justify-center hover:scale-110 active:scale-90"
                    style={{
                        left: `${emojiPos.x}%`,
                        top: `${emojiPos.y}%`,
                        transform: 'translate(-50%, -50%)',
                    }}
                    aria-label="Catch the item!"
                >
                    <div className="relative">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-white/50 rounded-full blur-xl animate-ping" />

                        {/* The actual emoji or image */}
                        {mission.imageUrl ? (
                            <img
                                src={assetUrl(mission.imageUrl!)}
                                alt="Mission Target"
                                className="relative w-32 h-32 object-contain filter drop-shadow-2xl"
                                onError={(e) => {
                                    // Fallback to emoji if image fails to load
                                    e.currentTarget.style.display = 'none';
                                    if (e.currentTarget.nextElementSibling) {
                                        (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
                                    }
                                }}
                            />
                        ) : null}

                        <div
                            className="relative text-[100px] leading-none drop-shadow-2xl filter"
                            style={{
                                filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.5))',
                                display: mission.imageUrl ? 'none' : 'block'
                            }}
                        >
                            {displayEmoji}
                        </div>
                    </div>
                </button>
            )}

            {/* The Throwable Item (e.g. Pokeball) */}
            {hasPermission && catchItemImage && (
                <div className="absolute inset-x-0 bottom-8 flex justify-center z-30 pointer-events-none">
                    <img
                        src={assetUrl(catchItemImage!)}
                        alt="Throw Item"
                        onClick={handleThrow}
                        className={`pointer-events-auto transition-all duration-[600ms] ease-in cursor-pointer drop-shadow-2xl 
                            ${isThrowing
                                ? '-translate-y-[80vh] scale-[0.3] opacity-0 rotate-[720deg]'
                                : 'w-32 h-32 object-contain hover:scale-110 active:scale-90'
                            }`}
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                </div>
            )}

            {/* Skip Button (Fallback if they can't catch it) */}
            <button
                onClick={onCatch}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 bg-white/20 hover:bg-white/40 backdrop-blur border border-white/50 text-white font-bold py-3 px-6 rounded-full shadow-lg text-lg transition-all"
            >
                דלג על זיהוי
            </button>
        </div>
    );
};
