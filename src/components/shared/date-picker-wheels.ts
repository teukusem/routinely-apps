import {
  getDaysInMonth,
  getYear,
  isAfter,
  isBefore,
  parse,
  startOfDay,
  subYears,
} from 'date-fns';

import { isValidLocalDate, parseLocalDate } from '../../utils/local-date';

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const ISO_FORMAT = 'yyyy-MM-dd';

export function dayOptionsForMonth(year: number, monthIndex: number): string[] {
  const count = getDaysInMonth(new Date(year, monthIndex));
  return Array.from({ length: count }, (_, index) => `${index + 1}`.padStart(2, '0'));
}

export function yearOptions(minDate?: string, maxDate?: string): string[] {
  const currentYear = new Date().getFullYear();
  const min = minDate
    ? getYear(parse(minDate, ISO_FORMAT, new Date()))
    : getYear(subYears(new Date(), 200));
  const max = maxDate ? getYear(parse(maxDate, ISO_FORMAT, new Date())) : currentYear;

  return Array.from({ length: 200 }, (_, index) => currentYear - index).filter(
    (year) => year >= min && year <= max,
  ).map(String);
}

export type DateWheelSelection = {
  day: string;
  days: string[];
  month: (typeof MONTH_NAMES)[number];
  year: string;
  years: string[];
};

export function buildDateWheelSelection(
  iso?: string,
  minDate?: string,
  maxDate?: string,
): DateWheelSelection {
  const base = iso && isValidLocalDate(iso) ? parseLocalDate(iso) : new Date();
  const monthIndex = base.getMonth();
  const year = String(getYear(base));

  return {
    day: String(base.getDate()).padStart(2, '0'),
    days: dayOptionsForMonth(Number(year), monthIndex),
    month: MONTH_NAMES[monthIndex],
    year,
    years: yearOptions(minDate, maxDate),
  };
}

export function selectionToIso(selection: DateWheelSelection): string {
  const monthIndex = MONTH_NAMES.indexOf(selection.month);
  return `${selection.year}-${String(monthIndex + 1).padStart(2, '0')}-${selection.day}`;
}

export function isSelectionWithinRange(iso: string, minDate?: string, maxDate?: string): boolean {
  const selected = startOfDay(parse(iso, ISO_FORMAT, new Date()));
  const min = minDate ? startOfDay(parse(minDate, ISO_FORMAT, new Date())) : null;
  const max = maxDate ? startOfDay(parse(maxDate, ISO_FORMAT, new Date())) : null;

  if (min && isBefore(selected, min)) {
    return false;
  }

  if (max && isAfter(selected, max)) {
    return false;
  }

  return true;
}
