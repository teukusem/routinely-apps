import { Ionicons } from '@expo/vector-icons';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { GlassSurface } from '../components/GlassSurface';
import { Panel } from '../components/shared/Panel';
import { SectionHeader } from '../components/shared/SectionHeader';
import { sharedStyles } from '../components/RoutinelyUI';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

type SettingsScreenProps = {
  onClose: () => void;
  onLogout: () => void;
  profileEmail?: string;
  profileInitials?: string;
  profileName?: string;
};

type SettingsRowConfig = {
  icon: keyof typeof Ionicons.glyphMap;
  id: string;
  label: string;
  meta?: string;
  tone?: string;
};

const profileRows: SettingsRowConfig[] = [
  { icon: 'person-outline', id: 'edit-profile', label: 'Edit profile', meta: 'Name, photo, timezone' },
  { icon: 'mail-outline', id: 'email', label: 'Email & account', meta: 'Sign-in and recovery' },
];

const preferenceRows: SettingsRowConfig[] = [
  { icon: 'notifications-outline', id: 'notifications', label: 'Notifications', meta: 'Reminders and quiet hours' },
  { icon: 'moon-outline', id: 'appearance', label: 'Appearance', meta: 'Theme and display' },
  { icon: 'lock-closed-outline', id: 'privacy', label: 'Privacy & security', meta: 'App lock and data' },
  { icon: 'cloud-outline', id: 'sync', label: 'Sync & backup', meta: 'Devices and export' },
];

const supportRows: SettingsRowConfig[] = [
  { icon: 'help-circle-outline', id: 'help', label: 'Help & support', meta: 'FAQ and contact' },
  { icon: 'information-circle-outline', id: 'about', label: 'About Routinely', meta: 'Version 1.0.0' },
];

export function SettingsScreen({
  onClose,
  onLogout,
  profileEmail = 'teuku@example.com',
  profileInitials = 'T',
  profileName = 'Teuku',
}: SettingsScreenProps) {
  function handleRowPress(label: string) {
    Alert.alert(label, 'This setting will be available in a future update.');
  }

  function confirmLogout() {
    Alert.alert('Log out', 'You will need to sign in again to access your routines.', [
      { style: 'cancel', text: 'Cancel' },
      { style: 'destructive', text: 'Log out', onPress: onLogout },
    ]);
  }

  return (
    <ScrollView
      contentContainerStyle={[sharedStyles.screenScroll, sharedStyles.centeredWide, styles.screenSections]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topBar}>
        <Pressable
          accessibilityLabel="Close settings"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onClose}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
        >
          <Ionicons color={colors.text} name="chevron-back" size={20} />
        </Pressable>
        <Text style={styles.topBarTitle}>Settings</Text>
        <View style={styles.topBarSpacer} />
      </View>

      <GlassSurface borderRadius={radius.xl}>
        <View style={styles.profileHero}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>{profileInitials}</Text>
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.profileName}>{profileName}</Text>
            <Text style={styles.profileEmail}>{profileEmail}</Text>
            <View style={styles.profileBadge}>
              <Text style={styles.profileBadgeText}>Free plan</Text>
            </View>
          </View>
        </View>
      </GlassSurface>

      <Panel>
        <View style={styles.panelStack}>
          <SectionHeader compact meta="Profile details" title="Account" />
          <View style={styles.rowList}>
            {profileRows.map((row) => (
              <SettingsRow key={row.id} onPress={() => handleRowPress(row.label)} row={row} />
            ))}
          </View>
        </View>
      </Panel>

      <Panel>
        <View style={styles.panelStack}>
          <SectionHeader compact meta="Reminders, privacy, sync" title="Configuration" />
          <View style={styles.rowList}>
            {preferenceRows.map((row) => (
              <SettingsRow key={row.id} onPress={() => handleRowPress(row.label)} row={row} />
            ))}
          </View>
        </View>
      </Panel>

      <Panel>
        <View style={styles.panelStack}>
          <SectionHeader compact meta="Help and app info" title="Support" />
          <View style={styles.rowList}>
            {supportRows.map((row) => (
              <SettingsRow key={row.id} onPress={() => handleRowPress(row.label)} row={row} />
            ))}
          </View>
        </View>
      </Panel>

      <Pressable
        accessibilityLabel="Log out"
        accessibilityRole="button"
        onPress={confirmLogout}
        style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
      >
        <Ionicons color={colors.danger} name="log-out-outline" size={18} />
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
    </ScrollView>
  );
}

function SettingsRow({ onPress, row }: { onPress: () => void; row: SettingsRowConfig }) {
  const tone = row.tone ?? colors.primary;

  return (
    <Pressable
      accessibilityLabel={row.label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.rowPressed]}
    >
      <GlassSurface borderRadius={radius.md} noPadding overflowHidden variant="nested">
        <View style={styles.settingsRow}>
          <View style={[styles.rowIcon, { backgroundColor: colors.primarySoft }]}>
            <Ionicons color={tone} name={row.icon} size={16} />
          </View>
          <View style={styles.rowCopy}>
            <Text style={styles.rowLabel}>{row.label}</Text>
            {row.meta ? <Text style={styles.rowMeta}>{row.meta}</Text> : null}
          </View>
          <Ionicons color={colors.textMuted} name="chevron-forward" size={16} />
        </View>
      </GlassSurface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screenSections: {
    gap: spacing.lg,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.glassBorder,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  backButtonPressed: {
    opacity: 0.86,
  },
  topBarTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  topBarSpacer: {
    width: 36,
  },
  profileHero: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  profileAvatar: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  profileAvatarText: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  profileCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  profileName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
  },
  profileEmail: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  profileBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.glassBorder,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
  profileBadgeText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 13,
    textTransform: 'uppercase',
  },
  panelStack: {
    gap: spacing.md,
  },
  rowList: {
    gap: spacing.sm,
  },
  rowPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  settingsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minWidth: 0,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm + 2,
  },
  rowIcon: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flexShrink: 0,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  rowCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  rowLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  rowMeta: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderColor: 'rgba(248, 113, 113, 0.35)',
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 48,
  },
  logoutButtonPressed: {
    opacity: 0.88,
  },
  logoutText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '800',
  },
});
