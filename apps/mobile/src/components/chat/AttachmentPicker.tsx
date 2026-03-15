import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { spacing } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { useTranslation } from 'react-i18next';
import { Text, BottomSheet } from '../ui';

// ─── AttachOption ─────────────────────────────────────
interface AttachOptionProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}

function AttachOption({ icon, label, onPress }: AttachOptionProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => {
        haptics.buttonPress();
        onPress();
      }}
      style={[styles.attachOption, { borderBottomColor: colors.separator }]}>
      {icon}
      <Text variant="bodyLg" style={styles.attachLabel}>
        {label}
      </Text>
    </Pressable>
  );
}

// ─── AttachmentPicker ─────────────────────────────────
export interface AttachmentPickerProps {
  visible: boolean;
  onClose: () => void;
  onCamera: () => void;
  onGallery: () => void;
  onDocument: () => void;
}

export function AttachmentPicker({
  visible,
  onClose,
  onCamera,
  onGallery,
  onDocument,
}: AttachmentPickerProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <BottomSheet visible={visible} onClose={onClose} snapPoint={0.3}>
      <Text variant="title" style={styles.attachTitle}>
        {t('chat.attach')}
      </Text>

      <AttachOption
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
        label={t('chat.camera')}
        onPress={onCamera}
      />

      <AttachOption
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
        label={t('chat.gallery')}
        onPress={onGallery}
      />

      <AttachOption
        icon={
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
              stroke={colors.accentPrimary}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M14 2v6h6"
              stroke={colors.accentPrimary}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        }
        label={t('chat.document')}
        onPress={onDocument}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  attachTitle: {
    marginBottom: spacing['12'],
  },
  attachOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing['12'],
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing['12'],
  },
  attachLabel: {
    flex: 1,
  },
});
