/**
 * XP needed to go from level `level` to `level + 1`.
 * Curve from docs/PLAN.md §4: 50 * n^1.5, rounded.
 */
export function xpToNextLevel(level: number): number {
  assertLevel(level);
  return Math.round(50 * level ** 1.5);
}

/** Total XP needed to reach `level` from level 1. */
export function totalXpForLevel(level: number): number {
  assertLevel(level);
  let total = 0;
  for (let n = 1; n < level; n++) total += xpToNextLevel(n);
  return total;
}

export interface LevelProgress {
  level: number;
  /** XP earned since reaching the current level. */
  xpIntoLevel: number;
  /** XP needed to reach the next level. */
  xpForNext: number;
}

/** Work out the level reached for a lifetime XP total. Levels start at 1. */
export function levelForXp(totalXp: number): LevelProgress {
  if (!Number.isInteger(totalXp) || totalXp < 0) {
    throw new RangeError(`totalXp must be a non-negative integer, got ${totalXp}`);
  }
  let level = 1;
  let remaining = totalXp;
  while (remaining >= xpToNextLevel(level)) {
    remaining -= xpToNextLevel(level);
    level++;
  }
  return { level, xpIntoLevel: remaining, xpForNext: xpToNextLevel(level) };
}

function assertLevel(level: number): void {
  if (!Number.isInteger(level) || level < 1) {
    throw new RangeError(`level must be an integer >= 1, got ${level}`);
  }
}
