import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
/* eslint-disable import/no-duplicates -- Reanimated : effet de bord d’init + hooks */
import 'react-native-reanimated';
import { useReducedMotion } from 'react-native-reanimated';
/* eslint-enable import/no-duplicates */

import { useColorScheme } from '@/components/useColorScheme';
import { AppButton } from '@/components/ui/AppButton';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppLoadingState } from '@/components/ui/AppLoadingState';
import { colors, layout, spacing } from '@/constants/theme';
import { useAttendance, AttendanceProvider } from '@/context/attendance';
import { SessionProvider, useSession } from '@/context/session';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  anchor: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const apply = () => {
      const height = `${window.innerHeight}px`;
      document.documentElement.style.height = height;
      document.body.style.height = height;
      const root = document.getElementById('root');
      if (root) root.style.height = height;
    };
    apply();
    window.addEventListener('resize', apply);
    window.visualViewport?.addEventListener('resize', apply);
    return () => {
      window.removeEventListener('resize', apply);
      window.visualViewport?.removeEventListener('resize', apply);
    };
  }, []);

  return (
    <SessionProvider>
      <AttendanceProvider>
        <RootLayoutNav />
      </AttendanceProvider>
    </SessionProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { ready, user, signOut } = useSession();
  const attendance = useAttendance();
  const reduced = useReducedMotion() === true;

  if (!ready || (user && !attendance.ready && !attendance.error)) {
    return <AppLoadingState message={user ? 'Connexion au serveur' : 'Ouverture de votre espace'} />;
  }

  if (user && attendance.error) {
    return (
      <View style={styles.offline}>
        <View style={styles.offlineColumn}>
          <AppEmptyState title="Serveur indisponible" message={attendance.error} />
          <AppButton onPress={attendance.reload} title="Réessayer" />
          <AppButton onPress={signOut} title="Se déconnecter" variant="secondary" />
        </View>
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ animation: reduced ? 'fade' : 'default' }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="teacher" options={{ headerShown: false }} />
        <Stack.Screen name="student" options={{ headerShown: false }} />
        <Stack.Screen name="admin" options={{ headerShown: false }} />
        <Stack.Screen name="absence/[id]" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  offline: { flex: 1, justifyContent: 'center', backgroundColor: colors.background, overflow: 'hidden' },
  offlineColumn: { width: '100%', maxWidth: layout.content, alignSelf: 'center', gap: spacing.sm, padding: spacing.lg },
});
