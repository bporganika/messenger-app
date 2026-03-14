import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { PhoneAuthScreen } from '../screens/auth/PhoneAuthScreen';
import { EmailAuthScreen } from '../screens/auth/EmailAuthScreen';
import { OTPScreen } from '../screens/auth/OTPScreen';
import { ProfileSetupScreen } from '../screens/auth/ProfileSetupScreen';
import type { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="PhoneAuth" component={PhoneAuthScreen} />
      <Stack.Screen name="EmailAuth" component={EmailAuthScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
    </Stack.Navigator>
  );
}
