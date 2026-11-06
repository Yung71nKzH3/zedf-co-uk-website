// Native Web Audio API synthesizer for Leibnizian Astrolabe mechanical & harmonic chimes
// Zero external dependencies; works 100% offline in standalone single-file HTML builds.

const SOUND_STORAGE_KEY = "characteristica_sound_muted_v1";

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!audioCtx) {
    try {
      audioCtx = new AudioCtx();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isSoundMuted(): boolean {
  try {
    return localStorage.getItem(SOUND_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function setSoundMuted(muted: boolean): void {
  try {
    localStorage.setItem(SOUND_STORAGE_KEY, muted ? "true" : "false");
  } catch {
    // Ignore storage errors in restricted environments
  }
}

/**
 * Subtle mechanical brass astrolabe escapement tick when navigating hours or inspecting nodes
 */
export function playAstrolabeTick(): void {
  if (isSoundMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(528, now);
    osc.frequency.exponentialRampToValueAtTime(176, now + 0.045);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.045);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch {
    // Ignore audio context restrictions
  }
}

/**
 * Resonant Pythagorean harmonic brass chime when locking in a scenario stance (A, B, C, or D)
 */
export function playCoordinateLock(pole: "A" | "B" | "C" | "D" = "A"): void {
  if (isSoundMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const chordMap: Record<"A" | "B" | "C" | "D", [number, number]> = {
    A: [261.63, 392.0], // C4 + G4 (Perfect Fifth - Physicalist/Stoic grounding)
    B: [293.66, 440.0], // D4 + A4 (Ascendant Fifth - Teleological/Vitalist)
    C: [329.63, 493.88], // E4 + B4 (Luminant Fifth - Synthesis/Panpsychist)
    D: [349.23, 523.25] // F4 + C5 (Harmonic Fourth/Fifth - Oceanic)
  };

  const [f1, f2] = chordMap[pole] ?? chordMap.A;

  try {
    const now = ctx.currentTime;

    [f1, f2].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = idx === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, now);

      const startGain = idx === 0 ? 0.065 : 0.035;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(startGain, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.36);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.38);
    });
  } catch {
    // Ignore audio context restrictions
  }
}

/**
 * Celestial harmonic arpeggio when compiling the final 45-coordinate philosophical sentence
 */
export function playManifestoComplete(): void {
  if (isSoundMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const notes = [261.63, 329.63, 392.0, 523.25]; // C4, E4, G4, C5

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + i * 0.07;

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.06, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0005, startTime + 0.65);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.68);
    });
  } catch {
    // Ignore audio context restrictions
  }
}

