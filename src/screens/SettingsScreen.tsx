import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import { GlassSurface } from '../components/GlassSurface';
import { Icon, IconBadge } from '../components/shared/Icon';
import { settingsRowPresets } from '../components/shared/iconPresets';
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
  id: keyof typeof settingsRowPresets;
  label: string;
  meta?: string;
};

const profileRows: SettingsRowConfig[] = [
  { id: 'edit-profile', label: 'Edit profile', meta: 'Name, photo, timezone' },
  { id: 'email', label: 'Email & account', meta: 'Sign-in and recovery' },
];

const preferenceRows: SettingsRowConfig[] = [
  { id: 'notifications', label: 'Notifications', meta: 'Reminders and quiet hours' },
  { id: 'appearance', label: 'Appearance', meta: 'Theme and display' },
  { id: 'privacy', label: 'Privacy & security', meta: 'App lock and data' },
  { id: 'sync', label: 'Sync & backup', meta: 'Devices and export' },
];

const supportRows: SettingsRowConfig[] = [
  { id: 'help', label: 'Help & support', meta: 'FAQ and contact' },
  { id: 'about', label: 'About Routinely', meta: 'Version 1.0.0' },
];

export function SettingsScreen({
  onClose,
  onLogout,
  profileEmail = 'teuku@example.com',
  profileInitials = 'T',
  profileName = 'Teuku',
}: SettingsScreenProps) {
  const [activeSection, setActiveSection] = useState<'main' | 'edit-profile' | 'email' | 'reset-password'>('main');
  const [editName, setEditName] = useState(profileName);
  const [editEmail, setEditEmail] = useState(profileEmail);

  function handleRowPress(id: string, label: string) {
    if (id === 'edit-profile') {
      setActiveSection('edit-profile');
    } else if (id === 'email') {
      setActiveSection('email');
    } else {
      Alert.alert(label, 'This setting will be available in a future update.');
    }
  }

  function confirmLogout() {
    Alert.alert('Log out', 'You will need to sign in again to access your routines.', [
      { style: 'cancel', text: 'Cancel' },
      { style: 'destructive', text: 'Log out', onPress: onLogout },
    ]);
  }

  if (activeSection === 'edit-profile') {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['rgba(0,0,0,0.95)', 'rgba(0,0,0,0.6)', 'transparent']} style={styles.topBarContainer} pointerEvents="box-none">
          <View style={[styles.topBar, sharedStyles.centeredWide]}>
            <Pressable
            accessibilityLabel="Back to settings"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => setActiveSection('main')}
            style={({ pressed }) => [pressed && styles.backButtonPressed]}
          >
            <BlurView intensity={60} tint="default" style={styles.backButton}>
              <Icon accent="lavender" name="arrow-back-circle-outline" size={20} />
            </BlurView>
          </Pressable>
            <Text style={styles.topBarTitle}>Edit Profile</Text>
            <View style={styles.topBarSpacer} />
          </View>
        </LinearGradient>
        <ScrollView
          contentContainerStyle={[sharedStyles.screenScroll, sharedStyles.centeredWide, styles.screenSections, { paddingTop: 120 }]}
          showsVerticalScrollIndicator={false}
        >

        <Panel>
          <View style={styles.panelStack}>
            <SectionHeader compact meta="Your public profile information" title="Profile Details" />
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput 
                style={styles.textInput} 
                value={editName} 
                onChangeText={setEditName} 
                placeholder="Your Name" 
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Timezone</Text>
              <TextInput 
                value="Asia/Jakarta" 
                editable={false}
                style={[styles.textInput, styles.textInputDisabled]} 
              />
            </View>
          </View>
        </Panel>
        
        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
          onPress={() => {
            Alert.alert('Success', 'Profile updated successfully.');
            setActiveSection('main');
          }}
        >
          <Text style={styles.primaryButtonText}>Save Changes</Text>
        </Pressable>
        </ScrollView>
      </View>
    );
  }

  if (activeSection === 'email') {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['rgba(0,0,0,0.95)', 'rgba(0,0,0,0.6)', 'transparent']} style={styles.topBarContainer} pointerEvents="box-none">
          <View style={[styles.topBar, sharedStyles.centeredWide]}>
            <Pressable
            accessibilityLabel="Back to settings"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => setActiveSection('main')}
            style={({ pressed }) => [pressed && styles.backButtonPressed]}
          >
            <BlurView intensity={60} tint="default" style={styles.backButton}>
              <Icon accent="lavender" name="arrow-back-circle-outline" size={20} />
            </BlurView>
          </Pressable>
            <Text style={styles.topBarTitle}>Email & Account</Text>
            <View style={styles.topBarSpacer} />
          </View>
        </LinearGradient>
        <ScrollView
          contentContainerStyle={[sharedStyles.screenScroll, sharedStyles.centeredWide, styles.screenSections, { paddingTop: 120 }]}
          showsVerticalScrollIndicator={false}
        >

        <Panel>
          <View style={styles.panelStack}>
            <SectionHeader compact meta="Manage your sign-in details" title="Account Credentials" />
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput 
                style={styles.textInput} 
                value={editEmail} 
                onChangeText={setEditEmail} 
                placeholder="your@email.com" 
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput 
                style={styles.textInput} 
                value="********" 
                editable={false}
                secureTextEntry
              />
            </View>
          </View>
        </Panel>

        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
          onPress={() => {
            Alert.alert('Success', 'Email updated successfully.');
            setActiveSection('main');
          }}
        >
          <Text style={styles.primaryButtonText}>Update Email</Text>
        </Pressable>
        
        <Pressable
          style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
          onPress={() => {
            setActiveSection('reset-password');
          }}
        >
          <Text style={styles.logoutText}>Reset Password</Text>
        </Pressable>

        <View style={{ marginTop: spacing.xl }}>
           <Pressable
             style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed, { borderColor: colors.danger, borderWidth: 1, backgroundColor: 'transparent' }]}
             onPress={() => {
                Alert.alert('Delete Account', 'Are you sure? This cannot be undone.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: onLogout }
                ]);
             }}
           >
             <Text style={styles.logoutText}>Delete Account</Text>
           </Pressable>
        </View>
        </ScrollView>
      </View>
    );
  }

  if (activeSection === 'reset-password') {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['rgba(0,0,0,0.95)', 'rgba(0,0,0,0.6)', 'transparent']} style={styles.topBarContainer} pointerEvents="box-none">
          <View style={[styles.topBar, sharedStyles.centeredWide]}>
            <Pressable
            accessibilityLabel="Back to Email & Account"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => setActiveSection('email')}
            style={({ pressed }) => [pressed && styles.backButtonPressed]}
          >
            <BlurView intensity={60} tint="default" style={styles.backButton}>
              <Icon accent="lavender" name="arrow-back-circle-outline" size={20} />
            </BlurView>
          </Pressable>
            <Text style={styles.topBarTitle}>Reset Password</Text>
            <View style={styles.topBarSpacer} />
          </View>
        </LinearGradient>
        <ScrollView
          contentContainerStyle={[sharedStyles.screenScroll, sharedStyles.centeredWide, styles.screenSections, { paddingTop: 120 }]}
          showsVerticalScrollIndicator={false}
        >

        <Panel>
          <View style={styles.panelStack}>
            <SectionHeader compact meta="Choose a strong new password" title="Update Password" />
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <TextInput 
                style={styles.textInput} 
                placeholder="Enter current password" 
                placeholderTextColor={colors.textMuted}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password</Text>
              <TextInput 
                style={styles.textInput} 
                placeholder="Enter new password" 
                placeholderTextColor={colors.textMuted}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <TextInput 
                style={styles.textInput} 
                placeholder="Confirm new password" 
                placeholderTextColor={colors.textMuted}
                secureTextEntry
              />
            </View>
          </View>
        </Panel>

        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
          onPress={() => {
            Alert.alert('Success', 'Your password has been successfully reset.');
            setActiveSection('email');
          }}
        >
          <Text style={styles.primaryButtonText}>Change Password</Text>
        </Pressable>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['rgba(0,0,0,0.95)', 'rgba(0,0,0,0.6)', 'transparent']} style={styles.topBarContainer} pointerEvents="box-none">
        <View style={[styles.topBar, sharedStyles.centeredWide]}>
          <Pressable
            accessibilityLabel="Close settings"
            accessibilityRole="button"
            hitSlop={8}
            onPress={onClose}
            style={({ pressed }) => [pressed && styles.backButtonPressed]}
          >
            <BlurView intensity={60} tint="default" style={styles.backButton}>
              <Icon accent="lavender" name="arrow-back-circle-outline" size={20} />
            </BlurView>
          </Pressable>
          <Text style={styles.topBarTitle}>Settings</Text>
          <View style={styles.topBarSpacer} />
        </View>
      </LinearGradient>
      <ScrollView
        contentContainerStyle={[sharedStyles.screenScroll, sharedStyles.centeredWide, styles.screenSections, { paddingTop: 120 }]}
        showsVerticalScrollIndicator={false}
      >

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
              <SettingsRow key={row.id} onPress={() => handleRowPress(row.id, row.label)} row={row} />
            ))}
          </View>
        </View>
      </Panel>

      <Panel>
        <View style={styles.panelStack}>
          <SectionHeader compact meta="Reminders, privacy, sync" title="Configuration" />
          <View style={styles.rowList}>
            {preferenceRows.map((row) => (
              <SettingsRow key={row.id} onPress={() => handleRowPress(row.id, row.label)} row={row} />
            ))}
          </View>
        </View>
      </Panel>

      <Panel>
        <View style={styles.panelStack}>
          <SectionHeader compact meta="Help and app info" title="Support" />
          <View style={styles.rowList}>
            {supportRows.map((row) => (
              <SettingsRow key={row.id} onPress={() => handleRowPress(row.id, row.label)} row={row} />
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
        <Icon accent="coral" name="exit-outline" size="lg" />
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
      </ScrollView>
    </View>
  );
}

function SettingsRow({ onPress, row }: { onPress: () => void; row: SettingsRowConfig }) {
  const preset = settingsRowPresets[row.id];

  return (
    <Pressable
      accessibilityLabel={row.label}
      accessibilityHint={row.meta}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.rowPressed]}
    >
      <GlassSurface borderRadius={radius.md} noPadding overflowHidden variant="nested">
        <View style={styles.settingsRow}>
          <IconBadge accent={preset.accent} badgeSize={32} name={preset.icon} size="md" />
          <View style={styles.rowCopy}>
            <Text style={styles.rowLabel}>{row.label}</Text>
            {row.meta ? <Text style={styles.rowMeta}>{row.meta}</Text> : null}
          </View>
          <Icon accent={preset.accent} name="chevron-forward" />
        </View>
      </GlassSurface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
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
    borderColor: colors.glassBorder,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
    overflow: 'hidden',
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
    width: 44,
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
    fontSize: 11,
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
  },
  settingsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minWidth: 0,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm + 2,
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
    borderColor: colors.danger,
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
  inputGroup: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  inputLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  textInput: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.glassBorder,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  textInputDisabled: {
    opacity: 0.6,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    justifyContent: 'center',
    minHeight: 48,
    marginTop: spacing.md,
  },
  primaryButtonPressed: {
    opacity: 0.88,
  },
  primaryButtonText: {
    color: colors.onAccent,
    fontSize: 15,
    fontWeight: '800',
  },
});
