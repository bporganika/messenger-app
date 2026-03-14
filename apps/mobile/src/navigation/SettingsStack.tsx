import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../design-system';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { EditProfileScreen } from '../screens/settings/EditProfileScreen';
import { NotificationsScreen } from '../screens/settings/NotificationsScreen';
import { PrivacyScreen } from '../screens/settings/PrivacyScreen';
import { LanguageScreen } from '../screens/settings/LanguageScreen';
import { AppearanceScreen } from '../screens/settings/AppearanceScreen';
import { StorageScreen } from '../screens/settings/StorageScreen';
import { AppLockScreen } from '../screens/settings/AppLockScreen';
import { DeleteAccountScreen } from '../screens/settings/DeleteAccountScreen';
import type { SettingsStackParamList } from './types';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export function SettingsStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        animation: 'slide_from_right',
        headerStyle: { backgroundColor: colors.bgPrimary },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
      }}>
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: 'Edit Profile' }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
      <Stack.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={{ title: 'Privacy' }}
      />
      <Stack.Screen
        name="Language"
        component={LanguageScreen}
        options={{ title: 'Language' }}
      />
      <Stack.Screen
        name="Appearance"
        component={AppearanceScreen}
        options={{ title: 'Appearance' }}
      />
      <Stack.Screen
        name="Storage"
        component={StorageScreen}
        options={{ title: 'Storage & Data' }}
      />
      <Stack.Screen
        name="AppLock"
        component={AppLockScreen}
        options={{ title: 'App Lock' }}
      />
      <Stack.Screen
        name="DeleteAccount"
        component={DeleteAccountScreen}
        options={{ title: 'Delete Account' }}
      />
    </Stack.Navigator>
  );
}
