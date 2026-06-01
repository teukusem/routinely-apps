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

type LoginScreenProps = {
  error: string | null;
  isLoading: boolean;
  onLogin: (email: string, password: string) => Promise<void>;
  onNavigateToRegister: () => void;
};

export function LoginScreen({ error, isLoading, onLogin, onNavigateToRegister }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const displayError = error ?? localError;
  const canSubmit = email.trim().length > 0 && password.length > 0 && !isLoading;

  async function handleSubmit() {
    setLocalError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setLocalError('Please enter your email address.');
      return;
    }
    if (!password) {
      setLocalError('Please enter your password.');
      return;
    }

    await onLogin(trimmedEmail, password);
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
          {/* Brand header */}
          <View style={styles.brandContainer}>
            <View style={styles.logoMark}>
              <Text style={styles.logoIcon}>◆</Text>
            </View>
            <Text style={styles.brandName}>Routinely</Text>
            <Text style={styles.brandTagline}>Build better habits, every day</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Error message */}
            {displayError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{displayError}</Text>
              </View>
            ) : null}

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
                  autoComplete="password"
                  autoCorrect={false}
                  editable={!isLoading}
                  onChangeText={(text) => {
                    setPassword(text);
                    setLocalError(null);
                  }}
                  onSubmitEditing={canSubmit ? handleSubmit : undefined}
                  placeholder="Enter your password"
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
            </View>

            {/* Sign In button */}
            <Pressable
              accessibilityLabel="Sign in"
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
                <Text style={styles.primaryButtonText}>Sign In</Text>
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
            <Text style={styles.footerText}>Don't have an account?</Text>
            <Pressable
              accessibilityLabel="Navigate to sign up"
              accessibilityRole="link"
              hitSlop={8}
              onPress={onNavigateToRegister}
              style={({ pressed }) => [pressed && styles.footerLinkPressed]}
            >
              <Text style={styles.footerLink}>Sign Up</Text>
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

  /* Brand */
  brandContainer: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing['2xl'],
  },
  logoMark: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderColor: colors.glassBorder,
    borderRadius: radius.lg,
    borderWidth: 1,
    height: 64,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: 64,
  },
  logoIcon: {
    color: colors.primary,
    fontSize: 28,
    lineHeight: 34,
  },
  brandName: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  brandTagline: {
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
