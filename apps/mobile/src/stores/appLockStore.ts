import { create } from 'zustand';

interface AppLockState {
  pin: string | null;
  pinEnabled: boolean;
  biometricEnabled: boolean;
  isLocked: boolean;

  setPin: (pin: string) => void;
  removePin: () => void;
  setBiometric: (enabled: boolean) => void;
  lock: () => void;
  unlock: () => void;
}

export const useAppLockStore = create<AppLockState>((set, get) => ({
  pin: null,
  pinEnabled: false,
  biometricEnabled: false,
  isLocked: false,

  setPin: (pin) => set({ pin, pinEnabled: true }),
  removePin: () => set({ pin: null, pinEnabled: false }),

  setBiometric: (enabled) => set({ biometricEnabled: enabled }),

  lock: () => {
    const { pinEnabled, biometricEnabled } = get();
    if (pinEnabled || biometricEnabled) {
      set({ isLocked: true });
    }
  },

  unlock: () => set({ isLocked: false }),
}));
