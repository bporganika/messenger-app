import './i18n';
import React, { useEffect, useRef } from 'react';
import { AppState, StatusBar } from 'react-native';
import type { AppStateStatus } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './design-system';
import { RootNavigator } from './navigation/RootNavigator';
import { LockScreen } from './screens/lock/LockScreen';
import { ErrorBoundary } from './components/ui';
import { useAppLockStore } from './stores/appLockStore';
import { useAuthStore } from './stores/authStore';
import { navigationRef } from './services/navigationRef';
import { connectSocket, disconnectSocket } from './services/socket';
import * as CallKeepService from './services/callkeep';
import * as PushService from './services/push';

function AppLockGuard() {
  const isLocked = useAppLockStore((s) => s.isLocked);
  const pinEnabled = useAppLockStore((s) => s.pinEnabled);
  const biometricEnabled = useAppLockStore((s) => s.biometricEnabled);
  const lock = useAppLockStore((s) => s.lock);

  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const appLockEnabled = pinEnabled || biometricEnabled;

  // Lock on first mount if enabled
  useEffect(() => {
    if (appLockEnabled) {
      lock();
    }
  }, [appLockEnabled, lock]);

  // Lock when returning from background
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        next === 'active' &&
        appLockEnabled
      ) {
        lock();
      }
      appStateRef.current = next;
    });
    return () => sub.remove();
  }, [appLockEnabled, lock]);

  if (!isLocked || !appLockEnabled) return null;

  return <LockScreen />;
}

function AppContent() {
  const { isDark } = useTheme();
  const restoreSession = useAuthStore((s) => s.restoreSession);

  useEffect(() => {
    restoreSession().then(() => {
      const { accessToken } = useAuthStore.getState();
      if (accessToken) {
        connectSocket();
      }
    });
    CallKeepService.setup();
    PushService.setup();

    return () => {
      disconnectSocket();
    };
  }, [restoreSession]);

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor="transparent"
      />
      <RootNavigator />
      <AppLockGuard />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
