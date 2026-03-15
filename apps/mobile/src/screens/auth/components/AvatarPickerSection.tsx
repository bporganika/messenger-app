import React, { useCallback } from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useTheme } from '../../../design-system';
import { springs } from '../../../design-system/animations';
import { spacing, avatarSize } from '../../../design-system/tokens';
import { haptics } from '../../../design-system/haptics';
import { Text, BottomSheet } from '../../../components/ui';
import { useTranslation } from 'react-i18next';

const AVATAR_DISPLAY = avatarSize['2xl']; // 120
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ─── Avatar Circle ──────────────────────────────────────
function AvatarCircle({
  uri,
  onPress,
}: {
  uri: string | null;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, springs.snappy);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springs.snappy);
  }, [scale]);

  return (
    <AnimatedPressable
      onPress={() => {
        haptics.buttonPress();
        onPress();
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.avatarWrap, animStyle]}>
      {uri ? (
        <Image source={{ uri }} style={styles.avatarImage} />
      ) : (
        <View
          style={[
            styles.avatarPlaceholder,
            { borderColor: colors.borderDefault },
          ]}>
          <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
            <Path
              d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
              stroke={colors.textTertiary}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle
              cx={12}
              cy={13}
              r={4}
              stroke={colors.textTertiary}
              strokeWidth={1.5}
            />
          </Svg>
          <Text
            variant="caption"
            color={colors.textTertiary}
            style={styles.avatarLabel}>
            {t('profileSetup.addPhoto')}
          </Text>
        </View>
      )}

      {uri && (
        <View
          style={[
            styles.editBadge,
            { backgroundColor: colors.accentPrimary },
          ]}>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path
              d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
              stroke="#FFFFFF"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle cx={12} cy={13} r={4} stroke="#FFFFFF" strokeWidth={2} />
          </Svg>
        </View>
      )}
    </AnimatedPressable>
  );
}

// ─── Picker BottomSheet Option ──────────────────────────
function PickerOption({
  icon,
  label,
  color,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  color?: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => {
        haptics.buttonPress();
        onPress();
      }}
      style={[styles.pickerOption, { borderBottomColor: colors.separator }]}>
      {icon}
      <Text
        variant="bodyLg"
        color={color ?? colors.textPrimary}
        style={styles.pickerLabel}>
        {label}
      </Text>
    </Pressable>
  );
}

// ─── Exported Props ─────────────────────────────────────
export interface AvatarPickerSectionProps {
  avatarUri: string | null;
  onAvatarChange: (uri: string | null) => void;
}

// ─── Main Component ─────────────────────────────────────
export function AvatarPickerSection({
  avatarUri,
  onAvatarChange,
}: AvatarPickerSectionProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [pickerVisible, setPickerVisible] = React.useState(false);

  const handlePickFromCamera = useCallback(async () => {
    setPickerVisible(false);
    const result = await launchCamera({
      mediaType: 'photo',
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.8,
    });
    if (result.assets?.[0]?.uri) {
      onAvatarChange(result.assets[0].uri);
    }
  }, [onAvatarChange]);

  const handlePickFromGallery = useCallback(async () => {
    setPickerVisible(false);
    const result = await launchImageLibrary({
      mediaType: 'photo',
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.8,
      selectionLimit: 1,
    });
    if (result.assets?.[0]?.uri) {
      onAvatarChange(result.assets[0].uri);
    }
  }, [onAvatarChange]);

  const handleRemoveAvatar = useCallback(() => {
    setPickerVisible(false);
    onAvatarChange(null);
  }, [onAvatarChange]);

  return (
    <>
      <AvatarCircle
        uri={avatarUri}
        onPress={() => setPickerVisible(true)}
      />

      <BottomSheet
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        snapPoint={avatarUri ? 0.35 : 0.28}>
        <Text variant="title" style={styles.sheetTitle}>
          {t('profileSetup.profilePhoto')}
        </Text>

        <PickerOption
          icon={
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path
                d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
                stroke={colors.accentPrimary}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Circle
                cx={12}
                cy={13}
                r={4}
                stroke={colors.accentPrimary}
                strokeWidth={1.5}
              />
            </Svg>
          }
          label={t('profileSetup.takePhoto')}
          onPress={handlePickFromCamera}
        />

        <PickerOption
          icon={
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path
                d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z"
                stroke={colors.accentPrimary}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
                fill={colors.accentPrimary}
              />
              <Path
                d="M21 15l-5-5L5 21"
                stroke={colors.accentPrimary}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          }
          label={t('profileSetup.chooseGallery')}
          onPress={handlePickFromGallery}
        />

        {avatarUri && (
          <PickerOption
            icon={
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"
                  stroke={colors.accentError}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            }
            label={t('profileSetup.removePhoto')}
            color={colors.accentError}
            onPress={handleRemoveAvatar}
          />
        )}
      </BottomSheet>
    </>
  );
}

// ─── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  avatarWrap: {
    width: AVATAR_DISPLAY,
    height: AVATAR_DISPLAY,
  },
  avatarImage: {
    width: AVATAR_DISPLAY,
    height: AVATAR_DISPLAY,
    borderRadius: AVATAR_DISPLAY / 2,
  },
  avatarPlaceholder: {
    width: AVATAR_DISPLAY,
    height: AVATAR_DISPLAY,
    borderRadius: AVATAR_DISPLAY / 2,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: {
    marginTop: spacing['4'],
  },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing['16'],
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing['12'],
  },
  pickerLabel: {
    flex: 1,
  },
  sheetTitle: {
    marginBottom: spacing['16'],
  },
});
