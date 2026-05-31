import { reconcileSelectedDateAfterRollover } from './date-selection';

describe('reconcileSelectedDateAfterRollover', () => {
  it('moves selection when it followed the previous current date', () => {
    expect(
      reconcileSelectedDateAfterRollover({
        previousCurrentDate: '2026-05-30',
        nextCurrentDate: '2026-05-31',
        selectedDate: '2026-05-30',
      }),
    ).toBe('2026-05-31');
  });

  it('preserves an intentionally selected visible date', () => {
    expect(
      reconcileSelectedDateAfterRollover({
        previousCurrentDate: '2026-05-30',
        nextCurrentDate: '2026-05-31',
        selectedDate: '2026-06-01',
      }),
    ).toBe('2026-06-01');
  });

  it('falls back to the new current date when selection becomes invisible', () => {
    expect(
      reconcileSelectedDateAfterRollover({
        previousCurrentDate: '2026-05-28',
        nextCurrentDate: '2026-05-31',
        selectedDate: '2026-05-28',
      }),
    ).toBe('2026-05-31');
  });

  it('leaves selection unchanged when current date does not roll over', () => {
    expect(
      reconcileSelectedDateAfterRollover({
        previousCurrentDate: '2026-05-31',
        nextCurrentDate: '2026-05-31',
        selectedDate: '2026-05-30',
      }),
    ).toBe('2026-05-30');
  });
});
