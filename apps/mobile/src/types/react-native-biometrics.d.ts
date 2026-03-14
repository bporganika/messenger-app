declare module 'react-native-biometrics' {
  type BiometryType = 'TouchID' | 'FaceID' | 'Biometrics';

  interface IsSensorAvailableResult {
    available: boolean;
    biometryType?: BiometryType;
    error?: string;
  }

  interface SimplePromptResult {
    success: boolean;
    error?: string;
  }

  interface SimplePromptOptions {
    promptMessage: string;
    cancelButtonText?: string;
    fallbackPromptMessage?: string;
  }

  interface ReactNativeBiometricsOptions {
    allowDeviceCredentials?: boolean;
  }

  class ReactNativeBiometrics {
    constructor(options?: ReactNativeBiometricsOptions);
    isSensorAvailable(): Promise<IsSensorAvailableResult>;
    simplePrompt(options: SimplePromptOptions): Promise<SimplePromptResult>;
  }

  export default ReactNativeBiometrics;
  export type { BiometryType, IsSensorAvailableResult, SimplePromptResult };
}
