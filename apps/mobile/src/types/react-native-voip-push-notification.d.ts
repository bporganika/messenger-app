declare module 'react-native-voip-push-notification' {
  type VoIPPushEvent = 'register' | 'notification' | 'didLoadWithEvents';

  interface VoIPNotification {
    [key: string]: unknown;
  }

  interface LoadedEvent {
    name: string;
    data: unknown;
  }

  function registerVoipToken(): void;

  function addEventListener(
    event: 'register',
    handler: (token: string) => void,
  ): void;
  function addEventListener(
    event: 'notification',
    handler: (notification: VoIPNotification) => void,
  ): void;
  function addEventListener(
    event: 'didLoadWithEvents',
    handler: (events: LoadedEvent[]) => void,
  ): void;

  function removeEventListener(event: VoIPPushEvent): void;

  const VoipPushNotification: {
    registerVoipToken: typeof registerVoipToken;
    addEventListener: typeof addEventListener;
    removeEventListener: typeof removeEventListener;
  };

  export default VoipPushNotification;
}
