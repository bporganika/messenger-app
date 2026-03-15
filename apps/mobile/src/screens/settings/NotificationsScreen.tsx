import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { spacing, radius } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text, Switch, Divider } from '../../components/ui';

export function NotificationsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [previews, setPreviews] = useState(true);
  const [muteAll, setMuteAll] = useState(false);

  const handleMuteAll = useCallback((v: boolean) => {
    haptics.buttonPress();
    setMuteAll(v);
    if (v) {
      setSound(false);
      setVibration(false);
    }
  }, []);

  const handleToggle = useCallback(
    (setter: (v: boolean) => void) => (v: boolean) => {
      haptics.buttonPress();
      setter(v);
      if (v) setMuteAll(false);
    },
    [],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      {/* Messages */}
      <Animated.View entering={FadeInUp.springify()}>
        <Text variant="caption" color={colors.textTertiary} style={styles.sectionLabel}>
          {t('notifications.messagesSection')}
        </Text>
        <View style={[styles.section, { backgroundColor: colors.surfaceDefault, borderColor: colors.borderDefault }]}>
          <ToggleRow
            icon={<Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.08" stroke={colors.textSecondary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /></Svg>}
            label={t('notifications.sound')}
            description={t('notifications.soundDesc')}
            value={sound}
            onToggle={handleToggle(setSound)}
            disabled={muteAll}
          />
          <Divider inset={52} />
          <ToggleRow
            icon={<Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Path d="M5.5 2v6M2.5 5h6M17.5 16v6M14.5 19h6M2 12l4-4 4 4M14 12l4-4 4 4" stroke={colors.textSecondary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /></Svg>}
            label={t('notifications.vibration')}
            description={t('notifications.vibrationDesc')}
            value={vibration}
            onToggle={handleToggle(setVibration)}
            disabled={muteAll}
          />
          <Divider inset={52} />
          <ToggleRow
            icon={<Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={colors.textSecondary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /><Path d="M12 9a3 3 0 100 6 3 3 0 000-6z" stroke={colors.textSecondary} strokeWidth={1.5} /></Svg>}
            label={t('notifications.previews')}
            description={t('notifications.previewsDesc')}
            value={previews}
            onToggle={handleToggle(setPreviews)}
          />
        </View>
      </Animated.View>

      {/* Mute */}
      <Animated.View entering={FadeInUp.springify().delay(100)}>
        <Text variant="caption" color={colors.textTertiary} style={styles.sectionLabel}>
          {t('notifications.quietSection')}
        </Text>
        <View style={[styles.section, { backgroundColor: colors.surfaceDefault, borderColor: colors.borderDefault }]}>
          <ToggleRow
            icon={<Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" stroke={colors.textSecondary} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /></Svg>}
            label={t('notifications.muteAll')}
            description={t('notifications.muteAllDesc')}
            value={muteAll}
            onToggle={handleMuteAll}
          />
        </View>
      </Animated.View>
    </View>
  );
}

function ToggleRow({
  icon,
  label,
  description,
  value,
  onToggle,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.row, disabled && styles.rowDisabled]}>
      <View style={styles.rowIcon}>{icon}</View>
      <View style={styles.rowText}>
        <Text variant="body" color={disabled ? colors.textTertiary : colors.textPrimary}>
          {label}
        </Text>
        <Text variant="caption" color={colors.textTertiary}>
          {description}
        </Text>
      </View>
      <Switch value={value} onValueChange={onToggle} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: spacing['8'] },
  sectionLabel: {
    marginHorizontal: spacing['24'],
    marginTop: spacing['16'],
    marginBottom: spacing['8'],
    letterSpacing: 0.8,
  },
  section: {
    marginHorizontal: spacing['16'],
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['16'],
    paddingVertical: spacing['12'],
  },
  rowDisabled: { opacity: 0.4 },
  rowIcon: {
    width: 28,
    alignItems: 'center',
    marginRight: spacing['12'],
  },
  rowText: { flex: 1, gap: spacing['2'] },
});
