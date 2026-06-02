import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
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
import { useProfile, useUpdateProfile, useUpdateEmail, useUpdatePassword, useRequestDeletion } from '../data/hooks/use-profile';
import type { ApiErrorShape } from '../data/api/api-client';

type SettingsScreenProps = {
  onClose: () => void;
  onLogout: () => void;
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name?: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) {
    return (err as ApiErrorShape).message;
  }
  return 'Something went wrong. Please try again.';
}

// ─── Error Banner ─────────────────────────────────────────────────────────────
function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function SettingsScreen({ onClose, onLogout }: SettingsScreenProps) {
  const [activeSection, setActiveSection] = useState<'main' | 'edit-profile' | 'email' | 'reset-password'>('main');
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ─── Profile data from API ──────────────────────────────────────────────
  const profileQuery = useProfile();
  const profile = profileQuery.data;
  const profileName = profile?.name ?? '';
  const profileEmail = profile?.email ?? '';
  const profileInitials = getInitials(profile?.name);
  const profileTimezone = profile?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

  // ─── Edit Profile state ─────────────────────────────────────────────────
  const [editName, setEditName] = useState('');
  const [editNameInitialized, setEditNameInitialized] = useState(false);

  // ─── Email & Account state ──────────────────────────────────────────────
  const [editEmail, setEditEmail] = useState('');
  const [editEmailInitialized, setEditEmailInitialized] = useState(false);
  const [emailPassword, setEmailPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');

  // ─── Reset Password state ──────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ─── Mutations ──────────────────────────────────────────────────────────
  const updateProfileMutation = useUpdateProfile();
  const updateEmailMutation = useUpdateEmail();
  const updatePasswordMutation = useUpdatePassword();
  const requestDeletionMutation = useRequestDeletion();

  // ─── Section Navigation ─────────────────────────────────────────────────
  function navigateTo(section: typeof activeSection) {
    setLocalError(null);
    setSuccessMessage(null);

    if (section === 'edit-profile') {
      setEditName(profileName);
      setEditNameInitialized(true);
    } else if (section === 'email') {
      setEditEmail(profileEmail);
      setEditEmailInitialized(true);
      setEmailPassword('');
      setDeletePassword('');
    } else if (section === 'reset-password') {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }

    setActiveSection(section);
  }

  function handleRowPress(id: string, label: string) {
    if (id === 'edit-profile') {
      navigateTo('edit-profile');
    } else if (id === 'email') {
      navigateTo('email');
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

  // ─── Edit Profile Handlers ──────────────────────────────────────────────
  async function handleSaveProfile() {
    setLocalError(null);
    const trimmedName = editName.trim();
    if (!trimmedName) {
      setLocalError('Name cannot be empty.');
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({ name: trimmedName });
      setSuccessMessage('Profile updated successfully.');
      setTimeout(() => navigateTo('main'), 1200);
    } catch (err) {
      setLocalError(getErrorMessage(err));
    }
  }

  // ─── Update Email Handlers ──────────────────────────────────────────────
  async function handleUpdateEmail() {
    setLocalError(null);
    const trimmedEmail = editEmail.trim();

    if (!trimmedEmail) {
      setLocalError('Email address cannot be empty.');
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setLocalError('Please enter a valid email address.');
      return;
    }
    if (!emailPassword) {
      setLocalError('Please enter your current password to confirm.');
      return;
    }
    if (trimmedEmail === profileEmail) {
      setLocalError('New email is the same as your current email.');
      return;
    }

    try {
      await updateEmailMutation.mutateAsync({
        email: trimmedEmail,
        currentPassword: emailPassword,
      });
      setSuccessMessage('Email updated successfully.');
      setEmailPassword('');
      setTimeout(() => navigateTo('main'), 1200);
    } catch (err) {
      setLocalError(getErrorMessage(err));
    }
  }

  // ─── Change Password Handlers ──────────────────────────────────────────
  async function handleChangePassword() {
    setLocalError(null);

    if (!currentPassword) {
      setLocalError('Please enter your current password.');
      return;
    }
    if (!newPassword) {
      setLocalError('Please enter a new password.');
      return;
    }
    if (newPassword.length < 8) {
      setLocalError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError('New passwords do not match.');
      return;
    }
    if (currentPassword === newPassword) {
      setLocalError('New password must be different from your current password.');
      return;
    }

    try {
      await updatePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
      });
      Alert.alert(
        'Password Changed',
        'Your password has been updated. You may need to sign in again on other devices.',
        [{ text: 'OK', onPress: () => navigateTo('email') }],
      );
    } catch (err) {
      setLocalError(getErrorMessage(err));
    }
  }

  // ─── Delete Account Handlers ───────────────────────────────────────────
  function handleDeleteAccount() {
    if (!deletePassword) {
      setLocalError('Please enter your password to confirm account deletion.');
      return;
    }

    Alert.alert(
      'Delete Account',
      'This will schedule your account for deletion. Your data will be permanently removed after a grace period. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete My Account',
          style: 'destructive',
          onPress: async () => {
            setLocalError(null);
            try {
              await requestDeletionMutation.mutateAsync(deletePassword);
              Alert.alert(
                'Account Deletion Requested',
                'Your account has been scheduled for deletion.',
                [{ text: 'OK', onPress: onLogout }],
              );
            } catch (err) {
              setLocalError(getErrorMessage(err));
            }
          },
        },
      ],
    );
  }

  // ─── Computed ───────────────────────────────────────────────────────────
  const isSavingProfile = updateProfileMutation.isPending;
  const isSavingEmail = updateEmailMutation.isPending;
  const isSavingPassword = updatePasswordMutation.isPending;
  const isDeletingAccount = requestDeletionMutation.isPending;
  const isAnyMutating = isSavingProfile || isSavingEmail || isSavingPassword || isDeletingAccount;

  // ─── Edit Profile Section ──────────────────────────────────────────────
  if (activeSection === 'edit-profile') {
    const canSaveProfile = editName.trim().length > 0 && editName.trim() !== profileName && !isSavingProfile;

    return (
      <View style={styles.container}>
        <LinearGradient colors={['rgba(0,0,0,0.95)', 'rgba(0,0,0,0.6)', 'transparent']} style={styles.topBarContainer} pointerEvents="box-none">
          <View style={[styles.topBar, sharedStyles.centeredWide]}>
            <Pressable
            accessibilityLabel="Back to settings"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => navigateTo('main')}
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

        <ErrorBanner message={localError} />
        {successMessage ? (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        ) : null}

        <Panel>
          <View style={styles.panelStack}>
            <SectionHeader compact meta="Your public profile information" title="Profile Details" />
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput 
                style={styles.textInput} 
                value={editNameInitialized ? editName : profileName} 
                onChangeText={(text) => {
                  setEditName(text);
                  setEditNameInitialized(true);
                  setLocalError(null);
                  setSuccessMessage(null);
                }} 
                placeholder="Your Name" 
                placeholderTextColor={colors.textMuted}
                editable={!isSavingProfile}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Timezone</Text>
              <TextInput 
                value={profileTimezone} 
                editable={false}
                style={[styles.textInput, styles.textInputDisabled]} 
              />
            </View>
          </View>
        </Panel>
        
        <Pressable
          accessibilityLabel="Save profile changes"
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSaveProfile }}
          disabled={!canSaveProfile}
          style={({ pressed }) => [
            styles.primaryButton,
            !canSaveProfile && styles.primaryButtonDisabled,
            pressed && canSaveProfile && styles.primaryButtonPressed,
          ]}
          onPress={handleSaveProfile}
        >
          {isSavingProfile ? (
            <ActivityIndicator color={colors.onAccent} size="small" />
          ) : (
            <Text style={styles.primaryButtonText}>Save Changes</Text>
          )}
        </Pressable>
        </ScrollView>
      </View>
    );
  }

  // ─── Email & Account Section ───────────────────────────────────────────
  if (activeSection === 'email') {
    const emailChanged = editEmail.trim() !== profileEmail;
    const canUpdateEmail = emailChanged && editEmail.trim().length > 0 && emailPassword.length > 0 && !isSavingEmail;

    return (
      <View style={styles.container}>
        <LinearGradient colors={['rgba(0,0,0,0.95)', 'rgba(0,0,0,0.6)', 'transparent']} style={styles.topBarContainer} pointerEvents="box-none">
          <View style={[styles.topBar, sharedStyles.centeredWide]}>
            <Pressable
            accessibilityLabel="Back to settings"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => navigateTo('main')}
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

        <ErrorBanner message={localError} />
        {successMessage ? (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        ) : null}

        <Panel>
          <View style={styles.panelStack}>
            <SectionHeader compact meta="Manage your sign-in details" title="Account Credentials" />
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput 
                style={styles.textInput} 
                value={editEmailInitialized ? editEmail : profileEmail} 
                onChangeText={(text) => {
                  setEditEmail(text);
                  setEditEmailInitialized(true);
                  setLocalError(null);
                  setSuccessMessage(null);
                }} 
                placeholder="your@email.com" 
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isSavingEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <TextInput 
                style={styles.textInput} 
                value={emailPassword} 
                onChangeText={(text) => {
                  setEmailPassword(text);
                  setLocalError(null);
                }}
                placeholder="Required to update email" 
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                editable={!isSavingEmail}
              />
            </View>
          </View>
        </Panel>

        <Pressable
          accessibilityLabel="Update email address"
          accessibilityRole="button"
          accessibilityState={{ disabled: !canUpdateEmail }}
          disabled={!canUpdateEmail}
          style={({ pressed }) => [
            styles.primaryButton,
            !canUpdateEmail && styles.primaryButtonDisabled,
            pressed && canUpdateEmail && styles.primaryButtonPressed,
          ]}
          onPress={handleUpdateEmail}
        >
          {isSavingEmail ? (
            <ActivityIndicator color={colors.onAccent} size="small" />
          ) : (
            <Text style={styles.primaryButtonText}>Update Email</Text>
          )}
        </Pressable>
        
        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}
          onPress={() => navigateTo('reset-password')}
          disabled={isAnyMutating}
        >
          <Icon accent="lavender" name="key-outline" size="md" />
          <Text style={styles.secondaryButtonText}>Reset Password</Text>
        </Pressable>

        <View style={{ marginTop: spacing.xl }}>
          <Panel>
            <View style={styles.panelStack}>
              <SectionHeader compact meta="Enter your password to confirm" title="Danger Zone" />
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput 
                  style={styles.textInput} 
                  value={deletePassword} 
                  onChangeText={(text) => {
                    setDeletePassword(text);
                    setLocalError(null);
                  }}
                  placeholder="Required to delete account" 
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                  editable={!isDeletingAccount}
                />
              </View>
            </View>
          </Panel>
          <Pressable
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.logoutButtonPressed,
              { borderColor: colors.danger, borderWidth: 1, backgroundColor: 'transparent', marginTop: spacing.sm },
            ]}
            onPress={handleDeleteAccount}
            disabled={isDeletingAccount}
          >
            {isDeletingAccount ? (
              <ActivityIndicator color={colors.danger} size="small" />
            ) : (
              <Text style={styles.logoutText}>Delete Account</Text>
            )}
          </Pressable>
        </View>
        </ScrollView>
      </View>
    );
  }

  // ─── Reset Password Section ────────────────────────────────────────────
  if (activeSection === 'reset-password') {
    const canChangePassword =
      currentPassword.length > 0 &&
      newPassword.length >= 8 &&
      confirmPassword.length > 0 &&
      newPassword === confirmPassword &&
      !isSavingPassword;

    return (
      <View style={styles.container}>
        <LinearGradient colors={['rgba(0,0,0,0.95)', 'rgba(0,0,0,0.6)', 'transparent']} style={styles.topBarContainer} pointerEvents="box-none">
          <View style={[styles.topBar, sharedStyles.centeredWide]}>
            <Pressable
            accessibilityLabel="Back to Email & Account"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => navigateTo('email')}
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

        <ErrorBanner message={localError} />

        <Panel>
          <View style={styles.panelStack}>
            <SectionHeader compact meta="Choose a strong new password" title="Update Password" />
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <TextInput 
                style={styles.textInput} 
                value={currentPassword}
                onChangeText={(text) => {
                  setCurrentPassword(text);
                  setLocalError(null);
                }}
                placeholder="Enter current password" 
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                editable={!isSavingPassword}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password</Text>
              <TextInput 
                style={styles.textInput} 
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  setLocalError(null);
                }}
                placeholder="At least 8 characters" 
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                editable={!isSavingPassword}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <TextInput 
                style={styles.textInput} 
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setLocalError(null);
                }}
                placeholder="Confirm new password" 
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                editable={!isSavingPassword}
              />
              {confirmPassword.length > 0 && newPassword !== confirmPassword ? (
                <Text style={styles.fieldHintError}>Passwords do not match</Text>
              ) : null}
            </View>
          </View>
        </Panel>

        <Pressable
          accessibilityLabel="Change password"
          accessibilityRole="button"
          accessibilityState={{ disabled: !canChangePassword }}
          disabled={!canChangePassword}
          style={({ pressed }) => [
            styles.primaryButton,
            !canChangePassword && styles.primaryButtonDisabled,
            pressed && canChangePassword && styles.primaryButtonPressed,
          ]}
          onPress={handleChangePassword}
        >
          {isSavingPassword ? (
            <ActivityIndicator color={colors.onAccent} size="small" />
          ) : (
            <Text style={styles.primaryButtonText}>Change Password</Text>
          )}
        </Pressable>
        </ScrollView>
      </View>
    );
  }

  // ─── Main Settings Screen ──────────────────────────────────────────────
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
            {profileQuery.isLoading ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Text style={styles.profileAvatarText}>{profileInitials}</Text>
            )}
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.profileName}>{profileName || 'Loading...'}</Text>
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

// ─── Settings Row ───────────────────────────────────────────────────────────
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

// ─── Styles ─────────────────────────────────────────────────────────────────
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
  primaryButtonDisabled: {
    opacity: 0.4,
  },
  primaryButtonText: {
    color: colors.onAccent,
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.glassBorder,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 48,
  },
  secondaryButtonPressed: {
    opacity: 0.88,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
    borderColor: 'rgba(255, 59, 48, 0.3)',
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  successContainer: {
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
    borderColor: 'rgba(52, 199, 89, 0.3)',
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  successText: {
    color: '#34C759',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  fieldHintError: {
    color: '#FF6B6B',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
    marginTop: 2,
  },
});
