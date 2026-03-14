import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';
import { VoiceCallScreen } from '../screens/calls/VoiceCallScreen';
import { VideoCallScreen } from '../screens/calls/VideoCallScreen';
import { useAuthStore } from '../stores/authStore';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = !!accessToken;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="VoiceCall"
            component={VoiceCallScreen}
            options={{
              presentation: 'fullScreenModal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="VideoCall"
            component={VideoCallScreen}
            options={{
              presentation: 'fullScreenModal',
              animation: 'slide_from_bottom',
            }}
          />
        </>
      ) : (
        <Stack.Screen
          name="Auth"
          component={AuthStack}
          options={{ animationTypeForReplace: 'pop' }}
        />
      )}
    </Stack.Navigator>
  );
}
