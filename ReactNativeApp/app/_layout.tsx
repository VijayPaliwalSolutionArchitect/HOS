import { useEffect } from 'react';
import { Slot, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import * as SystemUI from 'expo-system-ui';

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function RootLayout() {
  const loadUser = useAuthStore((state) => state.loadUser);
  const loadTheme = useThemeStore((state) => state.loadTheme);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    async function prepare() {
      try {
        // Load theme and user data
        await Promise.all([loadTheme(), loadUser()]);
      } catch (e) {
        console.warn('Error loading app data:', e);
      } finally {
        // Hide splash screen
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  // Configure edge-to-edge display (Android 16)
  useEffect(() => {
    SystemUI.setBackgroundColorAsync('transparent');
  }, []);

  if (isLoading) {
    return null; // Show splash screen
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <StatusBar style="auto" />
            <Slot />
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
