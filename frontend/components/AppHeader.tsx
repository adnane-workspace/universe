import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SignOutButton } from '@/components/SignOutButton';
import { AppAvatar } from '@/components/ui/AppAvatar';
import { colors, spacing, type } from '@/constants/theme';

export function AppHeader({
  eyebrow,
  title,
  subtitle,
  initials,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  initials: string;
}) {
  return (
    <View style={styles.identity}>
      <View style={styles.copy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <AppAvatar initials={initials} size={48} />
      <SignOutButton />
    </View>
  );
}

export function SectionTitle({ children, action }: { children: string; action?: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  copy: { flex: 1, gap: 2 },
  eyebrow: { color: colors.primary, fontSize: 13, lineHeight: 18, fontWeight: '700' },
  title: type.title,
  subtitle: type.secondary,
  section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  sectionTitle: type.section,
});
