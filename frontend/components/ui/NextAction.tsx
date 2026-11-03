import { StyleSheet, Text } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { colors, spacing } from '@/constants/theme';

export function NextAction({ title, message, action, onPress }: { title: string; message: string; action: string; onPress: () => void }) {
  return (
    <AppCard style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <AppButton onPress={onPress} style={styles.button} title={action} />
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  title: { color: colors.text, fontSize: 17, lineHeight: 22, fontWeight: '800' },
  message: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  button: { alignSelf: 'stretch' },
});
