import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../design-system';
import { spacing, radius } from '../../design-system/tokens';
import { haptics } from '../../design-system/haptics';
import { Text, Divider } from '../../components/ui';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
] as const;

export function LanguageScreen() {
  const { colors } = useTheme();
  const [selected, setSelected] = useState('en');

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <View
        style={[
          styles.section,
          { backgroundColor: colors.surfaceDefault, borderColor: colors.borderDefault },
        ]}>
        {LANGUAGES.map((lang, i) => (
          <React.Fragment key={lang.code}>
            {i > 0 && <Divider inset={16} />}
            <Pressable
              onPress={() => {
                haptics.buttonPress();
                setSelected(lang.code);
              }}
              style={styles.row}>
              <Text variant="body">{lang.flag}</Text>
              <Text variant="body" style={styles.label}>{lang.label}</Text>
              {selected === lang.code && (
                <View style={[styles.check, { backgroundColor: colors.accentPrimary }]}>
                  <Text variant="caption" color="#FFFFFF">✓</Text>
                </View>
              )}
            </Pressable>
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: spacing['16'] },
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
    gap: spacing['12'],
  },
  label: { flex: 1 },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
