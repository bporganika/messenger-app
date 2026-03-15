import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

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
        options={{ title: t('settings.editProfile') }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: t('settings.notifications') }}
      />
      <Stack.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={{ title: t('settings.privacy') }}
      />
      <Stack.Screen
        name="Language"
        component={LanguageScreen}
        options={{ title: t('settings.language') }}
      />
      <Stack.Screen
        name="Appearance"
        component={AppearanceScreen}
        options={{ title: t('settings.appearance') }}
      />
      <Stack.Screen
        name="Storage"
        component={StorageScreen}
        options={{ title: t('settings.storageData') }}
      />
      <Stack.Screen
        name="AppLock"
        component={AppLockScreen}
        options={{ title: t('settings.appLock') }}
      />
      <Stack.Screen
        name="DeleteAccount"
        component={DeleteAccountScreen}
        options={{ title: t('settings.deleteAccount') }}
      />
    </Stack.Navigator>
  );
}
