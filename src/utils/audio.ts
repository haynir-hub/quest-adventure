// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AudioContextClass =
  window.AudioContext || (window as any).webkitAudioContext;

let sharedCtx: AudioContext | null = null;

const getCtx = (): AudioContext | null => {
  if (!AudioContextClass) return null;
  if (!sharedCtx) sharedCtx = new AudioContextClass();
  return sharedCtx;
};

export const primeAudio = () => {
  const ctx = getCtx();
  if (ctx && ctx.state === "suspended") ctx.resume();
};

export const playSuccessSound = () => {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();

    const oscillator1 = ctx.createOscillator();
    const oscillator2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator1.type = "sine";
    oscillator2.type = "sine";

    oscillator1.frequency.setValueAtTime(523.25, ctx.currentTime);
    oscillator1.frequency.exponentialRampToValueAtTime(
      659.25,
      ctx.currentTime + 0.1,
    );
    oscillator2.frequency.setValueAtTime(783.99, ctx.currentTime);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

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
