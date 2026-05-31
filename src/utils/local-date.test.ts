import { buildDatePills } from '../data/routinely';
import { addDays, isValidLocalDate, parseLocalDate, toLocalDate } from './local-date';

describe('local-date', () => {
  it('formats local dates correctly', () => {
    expect(toLocalDate(new Date(2026, 4, 31))).toBe('2026-05-31');
  });

  it('rejects malformed dates', () => {
    expect(isValidLocalDate('2026-5-31')).toBe(false);
    expect(isValidLocalDate('2026-05-31')).toBe(true);
    expect(() => parseLocalDate('not-a-date')).toThrow('Invalid local date');
    expect(() => parseLocalDate('2026-02-30')).toThrow('Invalid local date');
  });

  it('handles May 31 to June 1 and year rollover', () => {
    expect(addDays('2026-05-31', 1)).toBe('2026-06-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });
});

describe('date pills anchor', () => {
  it('keeps Today on the real current date after selecting yesterday', () => {
    const currentLocalDate = '2026-05-31';
    const pills = buildDatePills(currentLocalDate);

    expect(pills).toHaveLength(3);
    expect(pills[1]).toEqual({
      isoDate: '2026-05-31',
      label: 'Today',
      value: '31',
    });
    expect(pills[0].label).toBe('Sat');
    expect(pills[2].label).toBe('Mon');
  });
});
