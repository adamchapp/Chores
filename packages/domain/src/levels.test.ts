import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { levelForXp, totalXpForLevel, xpToNextLevel } from "./levels";

describe("levels", () => {
  it("starts at level 1 with no XP", () => {
    expect(levelForXp(0)).toEqual({ level: 1, xpIntoLevel: 0, xpForNext: 50 });
  });

  it("follows the 50 * n^1.5 curve", () => {
    expect([1, 2, 3, 4].map(xpToNextLevel)).toEqual([50, 141, 260, 400]);
  });

  it("levels up exactly at the threshold", () => {
    expect(levelForXp(49).level).toBe(1);
    expect(levelForXp(50)).toEqual({ level: 2, xpIntoLevel: 0, xpForNext: 141 });
  });

  it("rejects invalid input", () => {
    expect(() => levelForXp(-1)).toThrow(RangeError);
    expect(() => levelForXp(1.5)).toThrow(RangeError);
    expect(() => xpToNextLevel(0)).toThrow(RangeError);
  });

  it("round-trips: total XP for a level maps back to that level", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 200 }), (level) => {
        expect(levelForXp(totalXpForLevel(level))).toEqual({
          level,
          xpIntoLevel: 0,
          xpForNext: xpToNextLevel(level),
        });
      }),
    );
  });

  it("never goes down as XP increases", () => {
    fc.assert(
      fc.property(fc.nat(500_000), fc.nat(10_000), (xp, extra) => {
        expect(levelForXp(xp + extra).level).toBeGreaterThanOrEqual(levelForXp(xp).level);
      }),
    );
  });
});
