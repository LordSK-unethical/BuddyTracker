import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/src/context/AuthContext';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { NotificationToast } from '@/components/NotificationToast';

function RealtimeSyncLayer() {
  useRealtimeSync();
  return null;
}

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <RealtimeSyncLayer />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
        <NotificationToast />
      </AuthProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
