import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast } from 'burnt';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { theme } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { isValidEmail } from '@/lib/utils';

export default function RegisterScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { register, isLoading } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = () => {
    const newErrors: any = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    try {
      await register({
        email,
        password,
        full_name: fullName,
        role: 'student',
      });
      toast({
        title: 'Account created!',
        message: 'Welcome to HOS',
        preset: 'done',
      });
      router.replace('/(tabs)');
    } catch (err: any) {
      toast({
        title: 'Registration failed',
        message: err.response?.data?.detail || 'Please try again',
        preset: 'error',
      });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text variant="h1" weight="bold" style={styles.title}>
              Create Account
            </Text>
            <Text variant="bodyLg" color="secondary" style={styles.subtitle}>
              Start your learning journey today
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              leftIcon="person"
              error={errors.fullName}
            />

            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              leftIcon="mail"
              error={errors.email}
              containerStyle={styles.input}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              leftIcon="lock-closed"
              error={errors.password}
              containerStyle={styles.input}
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              leftIcon="lock-closed"
              error={errors.confirmPassword}
              containerStyle={styles.input}
            />

            <Button
              title="Sign Up"
              onPress={handleRegister}
              isLoading={isLoading}
              fullWidth
              size="lg"
              style={styles.registerButton}
            />

            <View style={styles.loginContainer}>
              <Text variant="body" color="secondary">
                Already have an account?{' '}
              </Text>
              <Button
                title="Sign In"
                variant="ghost"
                onPress={() => router.back()}
                style={styles.loginButton}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.xl,
  },
  header: {
    marginTop: theme.spacing['3xl'],
    marginBottom: theme.spacing['2xl'],
  },
  title: {
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    marginBottom: theme.spacing.md,
  },
  form: {
    flex: 1,
  },
  input: {
    marginTop: theme.spacing.lg,
  },
  registerButton: {
    marginTop: theme.spacing['2xl'],
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  loginButton: {
    padding: 0,
  },
});
