import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassSurface } from '../components/GlassSurface';
import { effectiveBottomInset } from '../theme/safe-area';
import { Icon } from '../components/shared/Icon';
import { tabIcons } from '../components/shared/iconPresets';
import { appTabs } from '../data/routinely';
import { iconAccentPair } from '../theme/iconColors';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import type { AppTab } from '../types/routinely';

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

  const bottomPadding = effectiveBottomInset(insets) + spacing.xs;

  return (
    <View style={[styles.bottomNavWrap, { paddingBottom: bottomPadding }]}>
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
          const accentColor = iconAccentPair(icons.accent).icon;

          return (
            <Pressable
              accessibilityLabel={`Open ${tabLabels[tab]}`}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              key={tab}
              onPress={() => onChangeTab(tab)}
              style={({ pressed }) => [styles.tabButton, pressed && styles.tabButtonPressed]}
            >
              <View style={[styles.tabIconWrap, active && { backgroundColor: iconAccentPair(icons.accent).soft }]}>
                <Icon
                  color={active ? accentColor : colors.textMuted}
                  name={active ? icons.active : icons.inactive}
                  size={active ? 17 : 18}
                />
              </View>
              <Text
                numberOfLines={1}
                style={[styles.tabLabel, active && { color: accentColor, fontWeight: '800' }]}
              >
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
  },
  tabIconWrap: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 30,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 30,
  },
  tabLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 11,
    textAlign: 'center',
  },
});
