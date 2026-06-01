import { addDays, formatDayNumber, formatWeekdayShort } from '../utils/local-date';
import type {
  AppTab,
  DatePillOption,
  LocalDate,
  MoodDetailFixture,
  MoodDetailView,
  TimePeriod,
} from '../types/routinely';

export const appTabs: AppTab[] = ['Dashboard', 'Habits', 'Mood', 'Notes', 'Analytics'];

export const timePeriods: TimePeriod[] = ['Morning', 'Afternoon', 'Evening', 'Anytime'];

export function getMoodDetailView(
  localDate: LocalDate,
  fixtures: MoodDetailFixture[],
  moodScore?: number,
): MoodDetailView {
  const fixture = fixtures.find((item) => item.localDate === localDate);

  if (!fixture) {
    const hasMoodScore = typeof moodScore === 'number' && moodScore > 0;

    return {
      summary: hasMoodScore
        ? `Mood score ${moodScore}/5 logged. No extra details added yet.`
        : 'No mood details logged for this date yet.',
      energyLabel: '—',
      stressLabel: '—',
      note: hasMoodScore
        ? 'Add an optional note when you want more context for this day.'
        : 'Add a mood score to capture how this day felt.',
      hasFixture: false,
    };
  }

  return {
    summary: fixture.summary,
    energyLabel: `${fixture.energyScore}/10`,
    stressLabel: `${fixture.stressScore}/10`,
    note: fixture.note,
    hasFixture: true,
  };
}

export function buildDatePills(currentLocalDate: LocalDate): DatePillOption[] {
  const options: DatePillOption[] = [];
  for (let offset = -1; offset <= 1; offset += 1) {
    const isoDate = addDays(currentLocalDate, offset);
    const label = isoDate === currentLocalDate ? 'Today' : formatWeekdayShort(isoDate);
    const value = formatDayNumber(isoDate);
    options.push({ isoDate, label, value });
  }
  return options;
}
