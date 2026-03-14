declare module 'react-native-callkeep' {
  interface IOSOptions {
    appName: string;
    supportsVideo?: boolean;
    maximumCallGroups?: number;
    maximumCallsPerCallGroup?: number;
    imageName?: string;
    ringtoneSound?: string;
    includesCallsInRecents?: boolean;
  }

  interface AndroidOptions {
    alertTitle: string;
    alertDescription: string;
    cancelButton: string;
    okButton: string;
    additionalPermissions?: string[];
    selfManaged?: boolean;
    foregroundService?: {
      channelId: string;
      channelName: string;
      notificationTitle: string;
      notificationIcon?: string;
    };
  }

  interface SetupOptions {
    ios: IOSOptions;
    android: AndroidOptions;
  }

  type HandleType = 'generic' | 'number' | 'email';

  interface AnswerCallData {
    callUUID: string;
  }

  interface EndCallData {
    callUUID: string;
  }

  interface MuteCallData {
    callUUID: string;
    muted: boolean;
  }

  interface HoldCallData {
    callUUID: string;
    hold: boolean;
  }

  interface IncomingCallData {
    callUUID: string;
    handle: string;
    fromPushKit: string;
    payload: unknown;
  }

  interface EventMap {
    answerCall: AnswerCallData;
    endCall: EndCallData;
    didPerformSetMutedCallAction: MuteCallData;
    didToggleHoldCallAction: HoldCallData;
    didDisplayIncomingCall: IncomingCallData;
    didActivateAudioSession: void;
    didDeactivateAudioSession: void;
  }

  function setup(options: SetupOptions): Promise<boolean>;
  function setAvailable(active: boolean): void;

  function displayIncomingCall(
    uuid: string,
    handle: string,
    localizedCallerName?: string,
    handleType?: HandleType,
    hasVideo?: boolean,
  ): void;

  function startCall(
    uuid: string,
    handle: string,
    contactIdentifier?: string,
    handleType?: HandleType,
    hasVideo?: boolean,
  ): void;

  function reportConnectingOutgoingCallWithUUID(uuid: string): void;
  function reportConnectedOutgoingCallWithUUID(uuid: string): void;

  function endCall(uuid: string): void;
  function endAllCalls(): void;

  function setMutedCall(uuid: string, muted: boolean): void;
  function setOnHold(uuid: string, hold: boolean): void;
  function isCallActive(uuid: string): Promise<boolean>;

  function addEventListener<K extends keyof EventMap>(
    event: K,
    handler: (data: EventMap[K]) => void,
  ): void;
  function removeEventListener(event: keyof EventMap): void;

  const RNCallKeep: {
    setup: typeof setup;
    setAvailable: typeof setAvailable;
    displayIncomingCall: typeof displayIncomingCall;
    startCall: typeof startCall;
    reportConnectingOutgoingCallWithUUID: typeof reportConnectingOutgoingCallWithUUID;
    reportConnectedOutgoingCallWithUUID: typeof reportConnectedOutgoingCallWithUUID;
    endCall: typeof endCall;
    endAllCalls: typeof endAllCalls;
    setMutedCall: typeof setMutedCall;
    setOnHold: typeof setOnHold;
    isCallActive: typeof isCallActive;
    addEventListener: typeof addEventListener;
    removeEventListener: typeof removeEventListener;
  };

  export default RNCallKeep;
}
