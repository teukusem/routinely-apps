import type { AnalyticsBar } from '../../types/routinely';

export function mapBarsToFillPercentages(bars: AnalyticsBar[]): string[] {
  return bars.map((bar) => `${bar.value * 100}%`);
}
