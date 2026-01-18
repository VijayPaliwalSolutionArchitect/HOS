import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { toast } from 'burnt';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { theme } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { getInitials } from '@/lib/utils';

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            toast({
              title: 'Logged out successfully',
              preset: 'done',
            });
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const MenuItem = ({
    icon,
    label,
    value,
    onPress,
    showArrow = true,
    showSwitch = false,
    switchValue,
    onSwitchChange,
  }: any) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={showSwitch}
      activeOpacity={0.7}
      style={[styles.menuItem, { backgroundColor: colors.card }]}
    >
      <View style={styles.menuLeft}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
        <View style={styles.menuText}>
          <Text variant="body" weight="medium">
            {label}
          </Text>
          {value && (
            <Text variant="bodySm" color="secondary">
              {value}
            </Text>
          )}
        </View>
      </View>
      {showSwitch && (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#FFFFFF"
        />
      )}
      {showArrow && !showSwitch && (
        <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <Card variant="elevated" padding="lg" style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text variant="h2" weight="bold" style={styles.avatarText}>
                {getInitials(user?.full_name || 'User')}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text variant="h3" weight="bold">
                {user?.full_name}
              </Text>
              <Text variant="body" color="secondary" style={styles.email}>
                {user?.email}
              </Text>
              <View style={[styles.roleBadge, { backgroundColor: colors.secondary + '15' }]}>
                <Text
                  variant="caption"
                  weight="semibold"
                  style={{ color: colors.secondary }}
                >
                  {user?.role?.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Card variant="elevated" padding="md" style={styles.statCard}>
            <Text variant="h3" weight="bold">
              {user?.xp || 0}
            </Text>
            <Text variant="caption" color="secondary">
              Total XP
            </Text>
          </Card>
          <Card variant="elevated" padding="md" style={styles.statCard}>
            <Text variant="h3" weight="bold">
              {user?.level || 1}
            </Text>
            <Text variant="caption" color="secondary">
              Level
            </Text>
          </Card>
          <Card variant="elevated" padding="md" style={styles.statCard}>
            <Text variant="h3" weight="bold">
              {user?.streak || 0}
            </Text>
            <Text variant="caption" color="secondary">
              Day Streak
            </Text>
          </Card>
        </View>

        {/* Menu Sections */}
        <View style={styles.section}>
          <Text variant="h4" weight="semibold" style={styles.sectionTitle}>
            Account
          </Text>
          <MenuItem
            icon="person-outline"
            label="Edit Profile"
            onPress={() => console.log('Edit profile')}
          />
          <MenuItem
            icon="lock-closed-outline"
            label="Change Password"
            onPress={() => console.log('Change password')}
          />
          <MenuItem
            icon="notifications-outline"
            label="Notifications"
            onPress={() => console.log('Notifications')}
          />
        </View>

        <View style={styles.section}>
          <Text variant="h4" weight="semibold" style={styles.sectionTitle}>
            Preferences
          </Text>
          <MenuItem
            icon="moon-outline"
            label="Dark Mode"
            showSwitch
            switchValue={isDark}
            onSwitchChange={toggleTheme}
            showArrow={false}
          />
          <MenuItem
            icon="language-outline"
            label="Language"
            value="English"
            onPress={() => console.log('Language')}
          />
        </View>

        <View style={styles.section}>
          <Text variant="h4" weight="semibold" style={styles.sectionTitle}>
            About
          </Text>
          <MenuItem
            icon="help-circle-outline"
            label="Help & Support"
            onPress={() => console.log('Help')}
          />
          <MenuItem
            icon="document-text-outline"
            label="Terms & Conditions"
            onPress={() => console.log('Terms')}
          />
          <MenuItem
            icon="shield-checkmark-outline"
            label="Privacy Policy"
            onPress={() => console.log('Privacy')}
          />
        </View>

        {/* Logout Button */}
        <Button
          title="Logout"
          variant="outline"
          leftIcon={<Ionicons name="log-out-outline" size={20} color={colors.error} />}
          onPress={handleLogout}
          style={[styles.logoutButton, { borderColor: colors.error }]}
        />

        <Text variant="caption" color="tertiary" align="center" style={styles.version}>
          Version 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  profileCard: {
    marginBottom: theme.spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  email: {
    marginTop: 4,
    marginBottom: theme.spacing.sm,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.md,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.xs,
    ...theme.shadows.sm,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  menuText: {
    flex: 1,
  },
  logoutButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  version: {
    marginBottom: theme.spacing.lg,
  },
});
