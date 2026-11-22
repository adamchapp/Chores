export interface RotationResult<T> {
  assignee: T;
  nextCursor: number;
}

/**
 * Pick the assignee for the next occurrence of a rotating chore.
 * Deterministic: the same (assignees, cursor) always gives the same result,
 * so regenerating chore instances is idempotent.
 */
export function nextInRotation<T>(assignees: readonly T[], cursor: number): RotationResult<T> {
  if (assignees.length === 0) throw new RangeError("rotation needs at least one assignee");
  if (!Number.isInteger(cursor) || cursor < 0) {
    throw new RangeError(`cursor must be a non-negative integer, got ${cursor}`);
  }
  const index = cursor % assignees.length;
  return { assignee: assignees[index]!, nextCursor: (index + 1) % assignees.length };
}
