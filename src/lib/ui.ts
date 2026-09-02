/** Helpers de presentación compartidos entre pantalla y teléfono. */

export const OPTION_LETTERS = ["A", "B", "C", "D"] as const;

export const OPTION_CLASS = ["opt-a", "opt-b", "opt-c", "opt-d"] as const;

export function seatColor(seat: number): string {
  const palette = ["#2E63BD", "#33A457", "#F2A83B", "#E4632D", "#17B0A7", "#7C6CE0", "#8FD8A6", "#1D4FA2", "#268C46", "#e4632d"];
  return palette[(seat - 1) % palette.length];
}

export function initials(name: string): string {
  return name.trim().slice(0, 2).toUpperCase() || "??";
}

export function medal(rank: number): string {
  return rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}°`;
}
