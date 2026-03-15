import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';

export const navigationRef =
  createNavigationContainerRef<RootStackParamList>();

export function navigate(name: string, params?: object): void {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as never, params as never);
  }
}
