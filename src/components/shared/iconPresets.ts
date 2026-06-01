import type { AppTab } from '../../types/routinely';
import type { IconAccentName } from '../../theme/iconColors';
import type { IconName } from './Icon';

export type TabIconConfig = {
  accent: IconAccentName;
  active: IconName;
  inactive: IconName;
};

export const tabIcons: Record<AppTab, TabIconConfig> = {
  Dashboard: { active: 'home', inactive: 'home-outline', accent: 'sky' },
  Habits: { active: 'infinite', inactive: 'infinite-outline', accent: 'mint' },
  Mood: { active: 'heart-circle', inactive: 'heart-circle-outline', accent: 'rose' },
  Notes: { active: 'newspaper', inactive: 'newspaper-outline', accent: 'lavender' },
  Analytics: { active: 'analytics', inactive: 'analytics-outline', accent: 'amber' },
};

export type HabitCategory = 'General' | 'Health' | 'Learning' | 'Mindfulness' | 'Productivity';

export const categoryIconPresets: Record<HabitCategory, { accent: IconAccentName; name: IconName }> = {
  General: { name: 'sparkles-outline', accent: 'violet' },
  Health: { name: 'fitness-outline', accent: 'coral' },
  Learning: { name: 'school-outline', accent: 'sky' },
  Mindfulness: { name: 'water-outline', accent: 'teal' },
  Productivity: { name: 'rocket-outline', accent: 'amber' },
};

export type TimePeriod = 'Anytime' | 'Afternoon' | 'Evening' | 'Morning';

export const timePeriodIconPresets: Record<TimePeriod, { accent: IconAccentName; name: IconName }> = {
  Anytime: { name: 'planet-outline', accent: 'violet' },
  Morning: { name: 'sunny-outline', accent: 'amber' },
  Afternoon: { name: 'partly-sunny-outline', accent: 'coral' },
  Evening: { name: 'moon-outline', accent: 'lavender' },
};

export function getCategoryIconPreset(category: string) {
  if (category in categoryIconPresets) {
    return categoryIconPresets[category as HabitCategory];
  }

  return categoryIconPresets.General;
}

export type SettingsRowIconPreset = {
  accent: IconAccentName;
  icon: IconName;
};

export const settingsRowPresets: Record<string, SettingsRowIconPreset> = {
  'edit-profile': { icon: 'person-circle-outline', accent: 'sky' },
  email: { icon: 'at-circle-outline', accent: 'coral' },
  notifications: { icon: 'notifications-circle-outline', accent: 'amber' },
  appearance: { icon: 'color-palette-outline', accent: 'lavender' },
  privacy: { icon: 'shield-checkmark-outline', accent: 'teal' },
  sync: { icon: 'cloud-upload-outline', accent: 'mint' },
  help: { icon: 'chatbubble-ellipses-outline', accent: 'sky' },
  about: { icon: 'information-circle-outline', accent: 'violet' },
};
