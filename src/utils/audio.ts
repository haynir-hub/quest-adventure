/**
 * Utility for generating in-game sound effects using the Web Audio API
 */

export const playSuccessSound = () => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;

        const ctx = new AudioContextClass();

        // Need user interaction to unlock audio in some browsers, 
        // but often works during active app usage
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        const oscillator1 = ctx.createOscillator();
        const oscillator2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        // Pleasant "achievement" chime (C5 to E5 to G5 arpeggio fast)
        oscillator1.type = 'sine';
        oscillator2.type = 'sine';

        // Note 1: C5
        oscillator1.frequency.setValueAtTime(523.25, ctx.currentTime);
        // Note 2: E5
        oscillator1.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.1);

        // Harmony note
        oscillator2.frequency.setValueAtTime(783.99, ctx.currentTime); // G5

        // Envelope shaping
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05); // Attack
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6); // Decay

        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator1.start(ctx.currentTime);
        oscillator2.start(ctx.currentTime);

        oscillator1.stop(ctx.currentTime + 0.6);
        oscillator2.stop(ctx.currentTime + 0.6);

    } catch (e) {
        console.error("Failed to play sound", e);
    }
};
