import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../design-system';
import { springs } from '../../design-system/animations';
import { spacing, radius } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text, Divider } from '../../components/ui';

interface Language {
  code: string;
  label: string;
  native: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'tr', label: 'Turkish', native: 'Türkçe', flag: '🇹🇷' },
  { code: 'de', label: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', label: 'French', native: 'Français', flag: '🇫🇷' },
];

export function LanguageScreen() {
  const { colors } = useTheme();
  const [selected, setSelected] = useState('en');

  const handleSelect = useCallback((code: string) => {
    haptics.buttonPress();
    setSelected(code);
    // TODO: PATCH /api/v1/users/me { language: code } + change i18n locale
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <Animated.View entering={FadeInUp.springify()}>
        <Text variant="caption" color={colors.textTertiary} style={styles.sectionLabel}>
          APP LANGUAGE
        </Text>
        <View style={[styles.section, { backgroundColor: colors.surfaceDefault, borderColor: colors.borderDefault }]}>
          {LANGUAGES.map((lang, i) => (
            <React.Fragment key={lang.code}>
              {i > 0 && <Divider inset={52} />}
              <LanguageRow
                lang={lang}
                isSelected={selected === lang.code}
                onPress={() => handleSelect(lang.code)}
              />
            </React.Fragment>
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.springify().delay(100)}>
        <Text variant="caption" color={colors.textTertiary} style={styles.hint}>
          The app will restart to apply the new language
        </Text>
      </Animated.View>
    </View>
  );
}

function LanguageRow({
  lang,
  isSelected,
  onPress,
}: {
  lang: Language;
  isSelected: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => { scale.value = withSpring(0.98, springs.snappy); }}
      onPressOut={() => { scale.value = withSpring(1, springs.snappy); }}
      onPress={onPress}>
      <Animated.View style={[styles.row, animStyle]}>
        <Text variant="bodyLg" style={styles.flag}>{lang.flag}</Text>
        <View style={styles.rowText}>
          <Text variant="body" color={isSelected ? colors.accentPrimary : colors.textPrimary}>
            {lang.native}
          </Text>
          <Text variant="caption" color={colors.textTertiary}>
            {lang.label}
          </Text>
        </View>
        {isSelected && (
          <View style={[styles.checkCircle, { backgroundColor: colors.accentPrimary }]}>
            <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
              <Path d="M20 6L9 17l-5-5" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
        )}
      </Animated.View>
    </Pressable>
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
  flag: { width: 28, textAlign: 'center', marginRight: spacing['12'] },
  rowText: { flex: 1, gap: spacing['2'] },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    marginHorizontal: spacing['24'],
    marginTop: spacing['16'],
  },
});
