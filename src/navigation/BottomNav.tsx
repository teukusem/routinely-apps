import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassSurface } from '../components/GlassSurface';
import { appTabs } from '../data/routinely';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import type { AppTab } from '../types/routinely';

const tabIcons: Record<AppTab, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Dashboard: { active: 'grid', inactive: 'grid-outline' },
  Habits: { active: 'repeat', inactive: 'repeat-outline' },
  Mood: { active: 'happy', inactive: 'happy-outline' },
  Notes: { active: 'document-text', inactive: 'document-text-outline' },
  Analytics: { active: 'stats-chart', inactive: 'bar-chart-outline' },
};

const tabLabels: Record<AppTab, string> = {
  Dashboard: 'Home',
  Habits: 'Habits',
  Mood: 'Mood',
  Notes: 'Notes',
  Analytics: 'Stats',
};

type BottomNavProps = {
  activeTab: AppTab;
  onChangeTab: (tab: AppTab) => void;
};

export function BottomNav({ activeTab, onChangeTab }: BottomNavProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bottomNavWrap, { paddingBottom: insets.bottom + spacing.xs }]}>
      <GlassSurface
        borderRadius={radius.pill}
        contentStyle={styles.bottomNavRow}
        noPadding
        style={styles.bottomNavShell}
        variant="nav"
      >
        {appTabs.map((tab) => {
          const active = activeTab === tab;
          const icons = tabIcons[tab];

          return (
            <Pressable
              accessibilityLabel={`Open ${tab}`}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              key={tab}
              onPress={() => onChangeTab(tab)}
              style={({ pressed }) => [styles.tabButton, pressed && styles.tabButtonPressed]}
            >
              <View style={[styles.tabIconWrap, active && styles.tabIconWrapActive]}>
                <Ionicons
                  color={active ? colors.onAccent : colors.textMuted}
                  name={active ? icons.active : icons.inactive}
                  size={active ? 17 : 18}
                />
              </View>
              <Text numberOfLines={1} style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {tabLabels[tab]}
              </Text>
            </Pressable>
          );
        })}
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNavWrap: {
    backgroundColor: 'transparent',
    bottom: 0,
    left: 0,
    paddingHorizontal: spacing.sm,
    position: 'absolute',
    right: 0,
    zIndex: 10,
  },
  bottomNavShell: {
    alignSelf: 'center',
    maxWidth: 500,
    width: '100%',
  },
  bottomNavRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs + 2,
  },
  tabButton: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: 2,
  },
  tabButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.96 }],
  },
  tabIconWrap: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  tabIconWrapActive: {
    backgroundColor: colors.primary,
  },
  tabLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 11,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: colors.text,
    fontWeight: '800',
  },
});
