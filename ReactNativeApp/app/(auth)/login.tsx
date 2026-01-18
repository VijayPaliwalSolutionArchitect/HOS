import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { toast } from 'burnt';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { theme } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { isValidEmail } from '@/lib/utils';

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { login, isLoading, error } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      await login(email, password);
      toast({
        title: 'Welcome back!',
        preset: 'done',
      });
      router.replace('/(tabs)');
    } catch (err: any) {
      toast({
        title: 'Login failed',
        message: err.response?.data?.detail || 'Please check your credentials',
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
              Welcome Back
            </Text>
            <Text variant="bodyLg" color="secondary" style={styles.subtitle}>
              Sign in to continue your learning journey
            </Text>
          </View>

          <View style={styles.form}>
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
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              leftIcon="lock-closed"
              error={errors.password}
              containerStyle={styles.passwordInput}
            />

            <Button
              title="Sign In"
              onPress={handleLogin}
              isLoading={isLoading}
              fullWidth
              size="lg"
              style={styles.loginButton}
            />

            <View style={styles.registerContainer}>
              <Text variant="body" color="secondary">
                Don't have an account?{' '}
              </Text>
              <Button
                title="Sign Up"
                variant="ghost"
                onPress={() => router.push('/(auth)/register')}
                style={styles.registerButton}
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
    marginTop: theme.spacing['4xl'],
    marginBottom: theme.spacing['3xl'],
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
  passwordInput: {
    marginTop: theme.spacing.lg,
  },
  loginButton: {
    marginTop: theme.spacing['2xl'],
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  registerButton: {
    padding: 0,
  },
});
