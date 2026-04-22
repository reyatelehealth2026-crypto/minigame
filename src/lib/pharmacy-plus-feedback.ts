/** Haptics + motion prefs for LIFF game — no-op where unsupported. */

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function safeVibrate(pattern: number | number[]): void {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  if (prefersReducedMotion()) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* ignore */
  }
}
