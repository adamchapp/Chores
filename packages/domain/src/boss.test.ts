import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { applyBossDamage, bossMaxHp } from "./boss";

describe("bossMaxHp", () => {
  it("is 80% of scheduled XP, rounded down", () => {
    expect(bossMaxHp([10, 20, 25])).toBe(44);
  });

  it("is at least 1 for an empty week", () => {
    expect(bossMaxHp([])).toBe(1);
  });

  it("rejects negative or fractional XP", () => {
    expect(() => bossMaxHp([-5])).toThrow(RangeError);
    expect(() => bossMaxHp([1.5])).toThrow(RangeError);
  });
});

describe("applyBossDamage", () => {
  it("reports defeat only on the finishing blow", () => {
    const hit1 = applyBossDamage({ maxHp: 30, hp: 30 }, 20);
    expect(hit1).toEqual({ maxHp: 30, hp: 10, defeatedNow: false });
    const hit2 = applyBossDamage(hit1, 15);
    expect(hit2).toEqual({ maxHp: 30, hp: 0, defeatedNow: true });
    expect(applyBossDamage(hit2, 5).defeatedNow).toBe(false);
  });

  it("never drops HP below zero or raises it", () => {
    fc.assert(
      fc.property(fc.nat(1000), fc.nat(1000), (hp, damage) => {
        const result = applyBossDamage({ maxHp: 1000, hp }, damage);
        expect(result.hp).toBeGreaterThanOrEqual(0);
        expect(result.hp).toBeLessThanOrEqual(hp);
      }),
    );
  });
});
