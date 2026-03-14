import ReactNativeHapticFeedback, {
  HapticFeedbackTypes,
} from 'react-native-haptic-feedback';

const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

function trigger(type: HapticFeedbackTypes) {
  ReactNativeHapticFeedback.trigger(type, options);
}

/** Light tap — buttons, send message, avatar press */
export function impactLight() {
  trigger(HapticFeedbackTypes.impactLight);
}

/** Medium tap — toggles, pull-to-refresh threshold */
export function impactMedium() {
  trigger(HapticFeedbackTypes.impactMedium);
}

/** Heavy tap — long press trigger */
export function impactHeavy() {
  trigger(HapticFeedbackTypes.impactHeavy);
}

/** Tab switch (selection click) */
export function selection() {
  trigger(HapticFeedbackTypes.selection);
}

/** Success — call connected, action completed */
export function notificationSuccess() {
  trigger(HapticFeedbackTypes.notificationSuccess);
}

/** Warning — destructive action, delete */
export function notificationWarning() {
  trigger(HapticFeedbackTypes.notificationWarning);
}

/** Error — failed action */
export function notificationError() {
  trigger(HapticFeedbackTypes.notificationError);
}

// ─── Semantic Aliases ───────────────────────────────────
export const haptics = {
  buttonPress: impactLight,
  toggleSwitch: impactMedium,
  sendMessage: impactLight,
  longPress: impactHeavy,
  pullToRefresh: impactMedium,
  deleteAction: notificationWarning,
  error: notificationError,
  success: notificationSuccess,
  tabSwitch: selection,
} as const;
