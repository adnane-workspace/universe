import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SectionTitle } from '@/components/AppHeader';
import { RoleHeader } from '@/components/RoleHeader';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppCard } from '@/components/ui/AppCard';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { Screen } from '@/components/ui/Screen';
import { colors, spacing } from '@/constants/theme';
import { useAttendance } from '@/context/attendance';
import { useSession } from '@/context/session';
import { formatWhen, reviewsForTeacher, statusLabel, studentById, type AbsenceStatus } from '@/lib/domain';

const tones: Record<AbsenceStatus, 'warning' | 'neutral' | 'success' | 'danger'> = {
  a_justifier: 'warning',
  envoye: 'warning',
  justifiee: 'success',
  refusee: 'danger',
};

export default function TeacherReviewsScreen() {
  const { user } = useSession();
  const { data } = useAttendance();
  const reviews = reviewsForTeacher(data, user?.teacherId ?? '');

  return (
    <Screen inTabs header={<RoleHeader eyebrow="Justificatifs" subtitle="Dossiers déposés par les étudiants" />}>
      <View style={styles.stack}>
        <SectionTitle>À trancher</SectionTitle>
        {reviews.length === 0 ? (
          <AppCard>
            <AppEmptyState title="Rien à trancher" message="Les justificatifs déposés par les étudiants apparaîtront ici." />
          </AppCard>
        ) : (
          <AppCard style={styles.list}>
            {reviews.map((item, index) => {
              const person = studentById(data, item.studentId);
              const session = data.sessions.find((entry) => entry.id === item.sessionId);
              return (
                <Link key={item.id} href={{ pathname: '/absence/[id]', params: { id: item.id } }} asChild>
                  <Pressable accessibilityRole="link" style={StyleSheet.flatten([styles.row, index > 0 ? styles.rowBorder : null])}>
                    <View style={styles.flex}>
                      <Text style={styles.name}>{person?.name}</Text>
                      <Text style={styles.detail}>{session ? `${session.course} · ${formatWhen(session.date, session.start, session.end)}` : 'Séance'}</Text>
                      <Text selectable style={styles.reason}>{item.reason || 'Aucun motif indiqué.'}</Text>
                      <Text style={styles.action}>Accepter ou refuser</Text>
                    </View>
                    <View style={styles.side}>
                      <AppBadge label={statusLabel(item.status)} tone={tones[item.status]} />
                      <Text accessibilityElementsHidden importantForAccessibility="no" style={styles.chevron}>›</Text>
                    </View>
                  </Pressable>
                </Link>
              );
            })}
          </AppCard>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.sm },
  list: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, paddingVertical: spacing.md },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  flex: { flex: 1 },
  name: { color: colors.text, fontSize: 15, fontWeight: '700' },
  detail: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  reason: { color: colors.text, fontSize: 13, lineHeight: 18, marginTop: 6 },
  action: { color: colors.primary, fontSize: 13, lineHeight: 18, fontWeight: '600', marginTop: 4 },
  side: { alignItems: 'flex-end', gap: spacing.xs },
  chevron: { color: colors.textSecondary, fontSize: 22, lineHeight: 22, fontWeight: '600' },
});
