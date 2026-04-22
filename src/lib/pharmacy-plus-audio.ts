/**
 * Hybrid SFX: Web Audio for taps / shake / fallback win,
 * optional short mp3/ogg in /public/sounds/ (see SFX_FILES).
 */

const MUTE_KEY = "pp-sfx-muted";

const muteListeners = new Set<() => void>();
let didInitMuteFromStorage = false;

const SFX_FILES = {
  win: "/sounds/pharmacy-plus-win.mp3",
  reveal: "/sounds/pharmacy-plus-reveal.mp3",
} as const;

let audioContext: AudioContext | null = null;
let muted = false;

function readMuted(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  return sessionStorage.getItem(MUTE_KEY) === "1";
}

export function getSfxMuted(): boolean {
  return muted;
}

/** For `useSyncExternalStore` — reads storage so SSR snapshot can stay `false`. */
export function getSfxMutedSnapshot(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  return sessionStorage.getItem(MUTE_KEY) === "1";
}

export function subscribeSfxMute(onStoreChange: () => void): () => void {
  if (typeof sessionStorage !== "undefined" && !didInitMuteFromStorage) {
    didInitMuteFromStorage = true;
    muted = readMuted();
  }
  muteListeners.add(onStoreChange);
  return () => {
    muteListeners.delete(onStoreChange);
  };
}

function emitSfxMuteChange(): void {
  muteListeners.forEach((fn) => fn());
}

export function setSfxMuted(value: boolean): void {
  muted = value;
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(MUTE_KEY, value ? "1" : "0");
  }
  emitSfxMuteChange();
}

async function getContext(): Promise<AudioContext | null> {
  if (typeof window === "undefined" || muted) return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!audioContext) audioContext = new Ctor();
  if (audioContext.state === "suspended") {
    try {
      await audioContext.resume();
    } catch {
      return null;
    }
  }
  return audioContext;
}

/** Call from first user gesture (shake / landing tap / start). */
export async function unlockSfxFromUserGesture(): Promise<void> {
  await getContext();
}

async function playFile(url: string, volume = 0.5): Promise<boolean> {
  if (muted || typeof Audio === "undefined") return false;
  try {
    const el = new Audio(url);
    el.volume = volume;
    await el.play();
    return true;
  } catch {
    return false;
  }
}

function scheduleTone(
  ctx: AudioContext,
  freq: number,
  start: number,
  duration: number,
  gainValue: number,
  type: OscillatorType = "sine",
): void {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gainValue, start + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(g).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export async function playTap(): Promise<void> {
  const ctx = await getContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  scheduleTone(ctx, 520, t, 0.06, 0.12, "sine");
}

export async function playSoftConfirm(): Promise<void> {
  const ctx = await getContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  scheduleTone(ctx, 330, t, 0.08, 0.1, "triangle");
  scheduleTone(ctx, 440, t + 0.07, 0.1, 0.11, "triangle");
}

export async function playShakeRumble(durationMs: number): Promise<void> {
  const ctx = await getContext();
  if (!ctx) return;
  const dur = durationMs / 1000;
  const t0 = ctx.currentTime;

  const bufferSize = ctx.sampleRate * 0.5;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.35;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(420, t0);
  filter.frequency.exponentialRampToValueAtTime(180, t0 + dur);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(0.09, t0 + 0.04);
  gain.gain.setValueAtTime(0.09, t0 + dur * 0.85);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

  noise.connect(filter).connect(gain).connect(ctx.destination);
  noise.start(t0);
  noise.stop(t0 + dur);

  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(62, t0);
  const og = ctx.createGain();
  og.gain.setValueAtTime(0.0001, t0);
  og.gain.exponentialRampToValueAtTime(0.045, t0 + 0.05);
  og.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(og).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur);
}

async function playWinSynth(): Promise<void> {
  const ctx = await getContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((f, i) => {
    scheduleTone(ctx, f, t + i * 0.09, 0.22, 0.11, "sine");
  });
}

export async function playReveal(): Promise<void> {
  if (muted) return;
  const ok = await playFile(SFX_FILES.reveal, 0.42);
  if (ok) return;
  const ctx = await getContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  scheduleTone(ctx, 880, t, 0.05, 0.08);
  scheduleTone(ctx, 660, t + 0.06, 0.12, 0.09);
}

export async function playWin(): Promise<void> {
  if (muted) return;
  const ok = await playFile(SFX_FILES.win, 0.48);
  if (!ok) await playWinSynth();
}
