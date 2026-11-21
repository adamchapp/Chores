/** Share of the week's scheduled XP the household must earn to beat the boss. */
export const BOSS_HP_FACTOR = 0.8;

/**
 * Boss HP for a week, from the XP values of that week's scheduled chores.
 * Always at least 1 so a quiet week still has a boss to beat.
 */
export function bossMaxHp(scheduledChoreXp: readonly number[]): number {
  const total = scheduledChoreXp.reduce((sum, xp) => {
    if (!Number.isInteger(xp) || xp < 0) throw new RangeError(`invalid chore XP ${xp}`);
    return sum + xp;
  }, 0);
  return Math.max(1, Math.floor(total * BOSS_HP_FACTOR));
}

export interface BossState {
  maxHp: number;
  hp: number;
}

export interface DamageResult extends BossState {
  /** True only on the hit that takes the boss from alive to 0 HP. */
  defeatedNow: boolean;
}

/** Apply damage from an approved chore. HP never drops below 0. */
export function applyBossDamage(state: BossState, damage: number): DamageResult {
  if (!Number.isInteger(damage) || damage < 0) throw new RangeError(`invalid damage ${damage}`);
  const hp = Math.max(0, state.hp - damage);
  return { maxHp: state.maxHp, hp, defeatedNow: state.hp > 0 && hp === 0 };
}
