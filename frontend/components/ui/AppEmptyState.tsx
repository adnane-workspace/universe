import { StyleSheet, Text, View } from 'react-native';

import { spacing, type } from '@/constants/theme';

export function AppEmptyState({ title, message }: { title: string; message: string }) {
  return (
    <View style={styles.box}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', paddingVertical: spacing.lg, paddingHorizontal: spacing.md, gap: spacing.sm },
  title: { ...type.label, textAlign: 'center' },
  message: { ...type.secondary, textAlign: 'center' },
});
