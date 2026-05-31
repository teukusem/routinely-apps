import type { LocalDate } from '../types/routinely';

const LOCAL_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isValidLocalDate(localDate: string): localDate is LocalDate {
  if (!LOCAL_DATE_PATTERN.test(localDate)) {
    return false;
  }

  const [yearPart, monthPart, dayPart] = localDate.split('-');
  const year = Number(yearPart);
  const month = Number(monthPart);
  const day = Number(dayPart);
  const parsed = new Date(year, month - 1, day);

  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
  );
}

export function toLocalDate(date: Date): LocalDate {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(localDate: LocalDate): Date {
  if (!isValidLocalDate(localDate)) {
    throw new Error(`Invalid local date: ${localDate}`);
  }

  const [yearPart, monthPart, dayPart] = localDate.split('-');
  const year = Number(yearPart);
  const month = Number(monthPart);
  const day = Number(dayPart);

  return new Date(year, month - 1, day);
}

export function addDays(localDate: LocalDate, days: number): LocalDate {
  const date = parseLocalDate(localDate);
  date.setDate(date.getDate() + days);
  return toLocalDate(date);
}

export function formatLocalDateLabel(localDate: LocalDate) {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  }).format(parseLocalDate(localDate));
}

export function formatWeekdayShort(localDate: LocalDate) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
  }).format(parseLocalDate(localDate));
}

export function formatDayNumber(localDate: LocalDate) {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
  }).format(parseLocalDate(localDate));
}
