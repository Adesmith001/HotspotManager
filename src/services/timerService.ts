export const computeTimerEnd = (startMs: number, durationSec: number): number =>
  startMs + durationSec * 1000;

export const isTimerExpired = (endsAt: number, nowMs: number = Date.now()): boolean =>
  nowMs >= endsAt;

export const getRemainingSeconds = (
  endsAt: number,
  nowMs: number = Date.now(),
): number => Math.max(Math.floor((endsAt - nowMs) / 1000), 0);
