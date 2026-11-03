import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';

const tones = {
  neutral: { backgroundColor: colors.primaryLight, color: colors.primary },
  success: { backgroundColor: colors.successSoft, color: colors.success },
  warning: { backgroundColor: colors.warningSoft, color: colors.warningText },
  danger: { backgroundColor: colors.errorSoft, color: colors.error },
} as const;

export function AppBadge({ label, tone = 'neutral' }: { label: string; tone?: keyof typeof tones }) {
  const palette = tones[tone];
  return (
    <View style={[styles.badge, { backgroundColor: palette.backgroundColor }]}>
      <Text style={[styles.label, { color: palette.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
  },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '700', letterSpacing: 0.1 },
});
