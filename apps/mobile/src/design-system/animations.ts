import { WithSpringConfig, WithTimingConfig, Easing } from 'react-native-reanimated';

// ─── Spring Presets ─────────────────────────────────────
export const springs = {
  /** General-purpose transitions */
  default: {
    damping: 15,
    stiffness: 150,
    mass: 0.5,
  },
  /** Page transitions, gentle motion */
  gentle: {
    damping: 20,
    stiffness: 120,
    mass: 0.8,
  },
  /** Button presses, quick interactions */
  snappy: {
    damping: 12,
    stiffness: 250,
    mass: 0.3,
  },
  /** Celebrations, playful motion */
  elastic: {
    damping: 8,
    stiffness: 180,
    mass: 0.5,
  },
  /** Popups, toasts, modals */
  bouncy: {
    damping: 10,
    stiffness: 200,
    mass: 0.4,
  },
} as const satisfies Record<string, WithSpringConfig>;

export type SpringPreset = keyof typeof springs;

// ─── Timing Presets (opacity, color transitions only) ───
export const timing = {
  fast: {
    duration: 150,
    easing: Easing.out(Easing.quad),
  },
  normal: {
    duration: 250,
    easing: Easing.out(Easing.quad),
  },
  slow: {
    duration: 400,
    easing: Easing.out(Easing.quad),
  },
} as const satisfies Record<string, WithTimingConfig>;

export type TimingPreset = keyof typeof timing;

// ─── Skeleton Shimmer ───────────────────────────────────
export const shimmer = {
  duration: 1500,
} as const;

// ─── Call Ring Pulse ────────────────────────────────────
export const callRingPulse = {
  /** Scale from 1 → 1.6 */
  scaleTo: 1.6,
  /** Opacity from 0.3 → 0 */
  opacityFrom: 0.3,
  /** Full cycle duration */
  duration: 2500,
  /** Stagger between each concentric ring */
  stagger: 400,
  /** Number of concentric rings */
  ringCount: 3,
} as const;
