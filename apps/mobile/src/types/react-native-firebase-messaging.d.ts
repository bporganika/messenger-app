declare module '@react-native-firebase/messaging' {
  interface RemoteMessage {
    messageId?: string;
    data?: Record<string, string>;
    notification?: {
      title?: string;
      body?: string;
      android?: {
        channelId?: string;
        imageUrl?: string;
        sound?: string;
      };
      ios?: {
        badge?: string;
        sound?: string;
        imageUrl?: string;
      };
    };
    from?: string;
    sentTime?: number;
    collapseKey?: string;
  }

  interface AuthorizationStatusMap {
    NOT_DETERMINED: -1;
    DENIED: 0;
    AUTHORIZED: 1;
    PROVISIONAL: 2;
  }

  type AuthorizationStatus = -1 | 0 | 1 | 2;

  interface Messaging {
    getToken(): Promise<string>;
    deleteToken(): Promise<void>;
    requestPermission(): Promise<AuthorizationStatus>;
    hasPermission(): Promise<AuthorizationStatus>;
    onMessage(listener: (message: RemoteMessage) => void): () => void;
    onNotificationOpenedApp(
      listener: (message: RemoteMessage) => void,
    ): () => void;
    getInitialNotification(): Promise<RemoteMessage | null>;
    setBackgroundMessageHandler(
      handler: (message: RemoteMessage) => Promise<void>,
    ): void;
    onTokenRefresh(listener: (token: string) => void): () => void;
    subscribeToTopic(topic: string): Promise<void>;
    unsubscribeFromTopic(topic: string): Promise<void>;
    isAutoInitEnabled: boolean;
    setAutoInitEnabled(enabled: boolean): Promise<void>;
    getAPNSToken(): Promise<string | null>;
  }

  interface MessagingStatic {
    (): Messaging;
    AuthorizationStatus: AuthorizationStatusMap;
  }

  const messaging: MessagingStatic;
  export default messaging;
  export type { RemoteMessage, Messaging, AuthorizationStatus };
}
