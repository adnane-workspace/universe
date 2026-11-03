import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { colors, spacing } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Page introuvable' }} />
      <View style={styles.container}>
        <AppEmptyState title="Cette page n’existe pas." message="Le lien ouvert ne correspond à aucun écran d’UniPresence." />
        <Link href="/" style={styles.link}>
          Retour à l’accueil
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: spacing.md,
  },
  link: { color: colors.primary, fontSize: 16, fontWeight: '700' },
});
