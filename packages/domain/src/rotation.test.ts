import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { nextInRotation } from "./rotation";

describe("nextInRotation", () => {
  it("cycles through assignees in order", () => {
    const kids = ["ada", "ben", "cal"];
    let cursor = 0;
    const picked: string[] = [];
    for (let i = 0; i < 5; i++) {
      const r = nextInRotation(kids, cursor);
      picked.push(r.assignee);
      cursor = r.nextCursor;
    }
    expect(picked).toEqual(["ada", "ben", "cal", "ada", "ben"]);
  });

  it("copes with a cursor left over from a longer list", () => {
    expect(nextInRotation(["ada", "ben"], 5)).toEqual({ assignee: "ben", nextCursor: 0 });
  });

  it("rejects an empty rotation", () => {
    expect(() => nextInRotation([], 0)).toThrow(RangeError);
  });

  it("is fair: over k full cycles everyone gets exactly k turns", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 8 }), fc.integer({ min: 1, max: 10 }), (n, k) => {
        const kids = Array.from({ length: n }, (_, i) => i);
        const counts = new Array<number>(n).fill(0);
        let cursor = 0;
        for (let i = 0; i < n * k; i++) {
          const r = nextInRotation(kids, cursor);
          counts[r.assignee]!++;
          cursor = r.nextCursor;
        }
        expect(counts.every((c) => c === k)).toBe(true);
      }),
    );
  });
});
