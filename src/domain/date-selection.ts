import { addDays } from '../utils/local-date';
import type { LocalDate } from '../types/routinely';

export function isDateVisibleInStrip(selectedDate: LocalDate, currentLocalDate: LocalDate): boolean {
  const yesterday = addDays(currentLocalDate, -1);
  const tomorrow = addDays(currentLocalDate, 1);
  return (
    selectedDate === yesterday ||
    selectedDate === currentLocalDate ||
    selectedDate === tomorrow
  );
}

type ReconcileSelectedDateArgs = {
  previousCurrentDate: LocalDate;
  nextCurrentDate: LocalDate;
  selectedDate: LocalDate;
};

export function reconcileSelectedDateAfterRollover({
  previousCurrentDate,
  nextCurrentDate,
  selectedDate,
}: ReconcileSelectedDateArgs): LocalDate {
  if (previousCurrentDate === nextCurrentDate) {
    return selectedDate;
  }

  if (selectedDate === previousCurrentDate) {
    return nextCurrentDate;
  }

  if (isDateVisibleInStrip(selectedDate, nextCurrentDate)) {
    return selectedDate;
  }

  return nextCurrentDate;
}
