import ReactNativeBiometrics from 'react-native-biometrics';
import { Platform } from 'react-native';

// On iOS: Keychain via react-native-biometrics (SecItemAdd/SecItemCopyMatching)
// On Android: AndroidX Security EncryptedSharedPreferences via the same library
//
// react-native-biometrics exposes SimpleKeystore for secure key-value storage
// backed by Keychain (iOS) / Android Keystore. For token storage we use
// the platform's native secure storage directly.

const SERVICE_NAME = 'com.pulse.messenger';

// iOS Keychain / Android EncryptedSharedPreferences helper
// Using direct NativeModules for secure storage. In production,
// consider @react-native-keychain or expo-secure-store for richer API.

interface SecureStorageItem {
  key: string;
  value: string;
}

const storage = new Map<string, string>();
let _nativeSecureStore: typeof import('react-native').AsyncStorage | null = null;

// Platform-appropriate secure storage
// iOS: Keychain via react-native-biometrics createKeys/sign
// Android: EncryptedSharedPreferences

function getNativeModule(): {
  setItem: (key: string, value: string) => Promise<void>;
  getItem: (key: string) => Promise<string | null>;
  removeItem: (key: string) => Promise<void>;
} {
  // Use react-native-biometrics for the biometric check,
  // but for actual token storage, use platform-native APIs
  // via the Keychain/EncryptedPrefs bridge.
  try {
    // react-native provides a way to store in Keychain via
    // the native module. We use a minimal wrapper.
    const { NativeModules } = require('react-native');

    if (Platform.OS === 'ios' && NativeModules.RNKeychainManager) {
      return {
        setItem: async (key: string, value: string) => {
          await NativeModules.RNKeychainManager.setGenericPasswordForOptions(
            { service: `${SERVICE_NAME}.${key}` },
            key,
            value,
          );
        },
        getItem: async (key: string) => {
          try {
            const result = await NativeModules.RNKeychainManager.getGenericPasswordForOptions(
              { service: `${SERVICE_NAME}.${key}` },
            );
            return result?.password ?? null;
          } catch {
            return null;
          }
        },
        removeItem: async (key: string) => {
          await NativeModules.RNKeychainManager.resetGenericPasswordForOptions(
            { service: `${SERVICE_NAME}.${key}` },
          );
        },
      };
    }

    if (Platform.OS === 'android' && NativeModules.RNSecureStorage) {
      return {
        setItem: async (key: string, value: string) => {
          await NativeModules.RNSecureStorage.set(key, value, {});
        },
        getItem: async (key: string) => {
          try {
            return await NativeModules.RNSecureStorage.get(key, {});
          } catch {
            return null;
          }
        },
        removeItem: async (key: string) => {
          try {
            await NativeModules.RNSecureStorage.remove(key);
          } catch {
            // ignore
          }
        },
      };
    }
  } catch {
    // fallback below
  }

  // Fallback: in-memory only (for dev/testing when native modules unavailable)
  console.warn('[SecureStorage] Native module not available, using in-memory fallback');
  return {
    setItem: async (key: string, value: string) => {
      storage.set(key, value);
    },
    getItem: async (key: string) => {
      return storage.get(key) ?? null;
    },
    removeItem: async (key: string) => {
      storage.delete(key);
    },
  };
}

const nativeStore = getNativeModule();

// ─── Public API ──────────────────────────────────────────

export const secureStorage = {
  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      nativeStore.setItem('access_token', accessToken),
      nativeStore.setItem('refresh_token', refreshToken),
    ]);
  },

  async getTokens(): Promise<{ accessToken: string | null; refreshToken: string | null }> {
    const [accessToken, refreshToken] = await Promise.all([
      nativeStore.getItem('access_token'),
      nativeStore.getItem('refresh_token'),
    ]);
    return { accessToken, refreshToken };
  },

  async clearTokens(): Promise<void> {
    await Promise.all([
      nativeStore.removeItem('access_token'),
      nativeStore.removeItem('refresh_token'),
    ]);
  },

  async setPin(pinHash: string): Promise<void> {
    await nativeStore.setItem('pin_hash', pinHash);
  },

  async getPin(): Promise<string | null> {
    return nativeStore.getItem('pin_hash');
  },

  async clearPin(): Promise<void> {
    await nativeStore.removeItem('pin_hash');
  },
};
