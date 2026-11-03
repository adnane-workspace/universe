import { StyleSheet, Text, View } from 'react-native';

import { Icon, type SymbolName } from '@/components/Icon';
import { colors, radius, shadows, spacing, theme } from '@/constants/theme';

export function AppStatCard({
  label,
  value,
  hint,
  icon,
  tone = 'default',
  compact = false,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: SymbolName;
  tone?: 'default' | 'success' | 'warning';
  compact?: boolean;
}) {
  const accent = tone === 'success'
    ? { color: colors.success, backgroundColor: colors.successSoft }
    : tone === 'warning'
      ? { color: colors.warning, backgroundColor: colors.warningSoft }
      : { color: colors.primary, backgroundColor: colors.primaryLight };

  return (
    <View style={[styles.card, compact && styles.compact]}>
      {icon ? (
        <View style={[styles.icon, { backgroundColor: accent.backgroundColor }]}>
          <Icon name={icon} color={accent.color} size={18} />
        </View>
      ) : null}
      <Text style={[styles.value, compact && styles.valueCompact]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '46%',
    maxWidth: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 2,
    ...shadows.card,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  value: { color: colors.text, fontSize: 34, lineHeight: 40, fontWeight: '800', letterSpacing: -0.8, fontVariant: ['tabular-nums'] },
  label: { color: colors.textSecondary, fontSize: 13, lineHeight: 18, fontWeight: '600' },
  hint: { color: theme.faint, fontSize: 12, lineHeight: 16, fontWeight: '500' },
  compact: { minWidth: 0, padding: spacing.sm + 4 },
  valueCompact: { fontSize: 22, lineHeight: 28 },
});
