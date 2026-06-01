import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Screen } from '../components/Screen';
import { Icon } from '../components/shared/Icon';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

type RegisterScreenProps = {
  error: string | null;
  isLoading: boolean;
  onNavigateToLogin: () => void;
  onRegister: (email: string, password: string, name?: string) => Promise<void>;
};

const MIN_PASSWORD_LENGTH = 8;

export function RegisterScreen({
  error,
  isLoading,
  onNavigateToLogin,
  onRegister,
}: RegisterScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const displayError = error ?? localError;
  const passwordLongEnough = password.length >= MIN_PASSWORD_LENGTH;
  const canSubmit = email.trim().length > 0 && passwordLongEnough && !isLoading;

  async function handleSubmit() {
    setLocalError(null);

    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    if (!trimmedEmail) {
      setLocalError('Please enter your email address.');
      return;
    }
    if (!passwordLongEnough) {
      setLocalError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    await onRegister(trimmedEmail, password, trimmedName || undefined);
  }

  return (
    <Screen padded={false} safeAreaEdges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Create Account</Text>
            <Text style={styles.headerSubtitle}>
              Start building better habits today
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Error message */}
            {displayError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{displayError}</Text>
              </View>
            ) : null}

            {/* Name (optional) */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Name</Text>
                <Text style={styles.optionalBadge}>Optional</Text>
              </View>
              <TextInput
                autoCapitalize="words"
                autoComplete="name"
                autoCorrect={false}
                editable={!isLoading}
                onChangeText={(text) => {
                  setName(text);
                  setLocalError(null);
                }}
                placeholder="Your name"
                placeholderTextColor={colors.textMuted}
                returnKeyType="next"
                style={styles.textInput}
                value={name}
              />
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                editable={!isLoading}
                keyboardType="email-address"
                onChangeText={(text) => {
                  setEmail(text);
                  setLocalError(null);
                }}
                placeholder="you@example.com"
                placeholderTextColor={colors.textMuted}
                returnKeyType="next"
                style={styles.textInput}
                value={email}
              />
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  autoCapitalize="none"
                  autoComplete="new-password"
                  autoCorrect={false}
                  editable={!isLoading}
                  onChangeText={(text) => {
                    setPassword(text);
                    setLocalError(null);
                  }}
                  onSubmitEditing={canSubmit ? handleSubmit : undefined}
                  placeholder="Min. 8 characters"
                  placeholderTextColor={colors.textMuted}
                  returnKeyType="done"
                  secureTextEntry={!showPassword}
                  style={[styles.textInput, styles.passwordInput]}
                  value={password}
                />
                <Pressable
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() => setShowPassword((prev) => !prev)}
                  style={styles.toggleButton}
                >
                  <Text style={styles.toggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
                </Pressable>
              </View>

              {/* Password strength indicator */}
              {password.length > 0 ? (
                <View style={styles.strengthRow}>
                  <View style={styles.strengthTrack}>
                    <View
                      style={[
                        styles.strengthFill,
                        {
                          backgroundColor: passwordLongEnough ? '#4ADE80' : '#FBBF24',
                          width: passwordLongEnough ? '100%' : `${Math.min((password.length / MIN_PASSWORD_LENGTH) * 100, 95)}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.strengthLabel,
                      { color: passwordLongEnough ? '#4ADE80' : '#FBBF24' },
                    ]}
                  >
                    {passwordLongEnough ? 'Looks good' : `${MIN_PASSWORD_LENGTH - password.length} more`}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Create Account button */}
            <Pressable
              accessibilityLabel="Create account"
              accessibilityRole="button"
              accessibilityState={{ disabled: !canSubmit }}
              disabled={!canSubmit}
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.primaryButton,
                !canSubmit && styles.primaryButtonDisabled,
                pressed && canSubmit && styles.primaryButtonPressed,
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.onAccent} size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Create Account</Text>
              )}
            </Pressable>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google OAuth (Disabled) */}
            <Pressable
              accessibilityLabel="Continue with Google"
              accessibilityRole="button"
              accessibilityState={{ disabled: true }}
              disabled={true}
              style={[styles.oauthButton, styles.oauthButtonDisabled]}
            >
              <Icon name="logo-google" size="lg" color={colors.text} />
              <Text style={styles.oauthButtonText}>Continue with Google</Text>
            </Pressable>
          </View>

          {/* Footer link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Pressable
              accessibilityLabel="Navigate to sign in"
              accessibilityRole="link"
              hitSlop={8}
              onPress={onNavigateToLogin}
              style={({ pressed }) => [pressed && styles.footerLinkPressed]}
            >
              <Text style={styles.footerLink}>Sign In</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing['2xl'],
  },

  /* Header */
  headerContainer: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing['2xl'],
  },
  headerTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  headerSubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },

  /* Form */
  formContainer: {
    gap: spacing.md,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  labelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  inputLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  optionalBadge: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
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
  passwordWrapper: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 64,
  },
  toggleButton: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  toggleText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },

  /* Password strength */
  strengthRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: 2,
    paddingHorizontal: 4,
  },
  strengthTrack: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    flex: 1,
    height: 4,
    overflow: 'hidden',
  },
  strengthFill: {
    borderRadius: radius.pill,
    height: '100%',
  },
  strengthLabel: {
    fontSize: 11,
    fontWeight: '700',
  },

  /* Error */
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

  /* Primary button */
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    justifyContent: 'center',
    marginTop: spacing.sm,
    minHeight: 52,
  },
  primaryButtonPressed: {
    opacity: 0.88,
  },
  primaryButtonDisabled: {
    opacity: 0.4,
  },
  primaryButtonText: {
    color: colors.onAccent,
    fontSize: 16,
    fontWeight: '800',
  },

  /* Footer */
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    marginTop: spacing['2xl'],
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  footerLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  footerLinkPressed: {
    opacity: 0.7,
  },

  /* Divider */
  dividerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: spacing.xs,
  },
  dividerLine: {
    backgroundColor: colors.glassBorder,
    flex: 1,
    height: 1,
  },
  dividerText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: spacing.md,
  },

  /* OAuth Button */
  oauthButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.glassBorder,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 52,
  },
  oauthButtonDisabled: {
    opacity: 0.5,
  },
  oauthButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
});
