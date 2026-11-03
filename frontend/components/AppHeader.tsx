import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SignOutButton } from '@/components/SignOutButton';
import { AppAvatar } from '@/components/ui/AppAvatar';
import { colors, radius, spacing, type } from '@/constants/theme';

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
    <View style={styles.wrap}>
      <View style={styles.top}>
        <View style={styles.pill}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
        </View>
        <SignOutButton />
      </View>
      <View style={styles.identity}>
        <AppAvatar initials={initials} size={44} />
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
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
  wrap: { gap: spacing.md },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pill: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  copy: { flex: 1, gap: 2 },
  eyebrow: { color: colors.primary, fontSize: 12, lineHeight: 16, fontWeight: '600', letterSpacing: 0.4 },
  title: type.title,
  subtitle: type.secondary,
  section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  sectionTitle: type.section,
});
