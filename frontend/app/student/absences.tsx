import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SectionTitle } from '@/components/AppHeader';
import { JustificationForm } from '@/components/JustificationForm';
import { RoleHeader } from '@/components/RoleHeader';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppCard } from '@/components/ui/AppCard';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { CourseMark } from '@/components/ui/CourseMark';
import { Screen } from '@/components/ui/Screen';
import { colors, spacing } from '@/constants/theme';
import { useAttendance } from '@/context/attendance';
import { useSession } from '@/context/session';
import { absenceLabel, absenceText, canJustify, dateParts, formatWhen, studentAbsences, type Absence, type AbsenceStatus, type AttendanceData } from '@/lib/domain';

const tones: Record<AbsenceStatus, 'warning' | 'neutral' | 'success' | 'danger'> = {
  a_justifier: 'warning',
  envoye: 'neutral',
  justifiee: 'success',
  refusee: 'danger',
};

export default function StudentAbsencesScreen() {
  const { user } = useSession();
  const { data } = useAttendance();
  const absences = studentAbsences(data, user?.studentId ?? '');

  return (
    <Screen inTabs header={<RoleHeader eyebrow="Mes absences" subtitle="Détail et justificatifs" />}>
      <View style={styles.stack}>
        <SectionTitle>Historique</SectionTitle>
        {absences.length === 0 ? (
          <AppCard>
            <AppEmptyState title="Aucune absence" message="Votre présence est complète sur les séances déjà appelées." />
          </AppCard>
        ) : (
          groupByCourse(absences, data).map(([course, items]) => (
            <AppCard key={course} style={styles.stack}>
              <View style={styles.cardHeader}>
                <CourseMark course={course} />
                <Text style={styles.cardTitle}>{course}</Text>
                <AppBadge label={absenceCount(items.length)} tone={items.every((item) => item.status === 'justifiee') ? 'success' : 'danger'} />
              </View>
              {items.map((item) => {
                const session = data.sessions.find((entry) => entry.id === item.sessionId);
                const parts = dateParts(session?.date ?? '2026-01-01');
                return (
                  <View key={item.id} style={styles.session}>
                    <Link href={{ pathname: '/absence/[id]', params: { id: item.id } }} asChild>
                      <Pressable accessibilityHint="Ouvre la fiche de l’absence" style={styles.cardHeader}>
                        <View style={[styles.date, item.status === 'justifiee' && styles.dateOk]}>
                          <Text style={[styles.month, item.status === 'justifiee' && styles.monthOk]}>{parts.month}</Text>
                          <Text style={styles.day}>{parts.day}</Text>
                        </View>
                        <View style={styles.flex}>
                          <Text style={styles.sessionTitle}>{session ? formatWhen(session.date, session.start, session.end) : 'Séance'}</Text>
                          <Text style={styles.meta}>{session?.room ?? ''}</Text>
                        </View>
                        <AppBadge label={session ? absenceLabel(item.status, session.date) : 'Absence'} tone={item.status === 'a_justifier' && session && !canJustify(item.status, session.date) ? 'danger' : tones[item.status]} />
                      </Pressable>
                    </Link>
                    <Text style={styles.description}>{session ? absenceText(item.status, session.date) : ''}</Text>
                    {item.reason ? <Text selectable style={styles.reason}>{item.reason}</Text> : null}
                    {item.status === 'refusee' && item.comment ? <Text selectable style={styles.reason}>Retour de l’enseignant : {item.comment}</Text> : null}
                    {session && canJustify(item.status, session.date) ? <JustificationForm absenceId={item.id} again={item.status === 'refusee'} /> : null}
                  </View>
                );
              })}
            </AppCard>
          ))
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  date: { width: 48, height: 52, borderRadius: 14, backgroundColor: colors.warningSoft, alignItems: 'center', justifyContent: 'center' },
  dateOk: { backgroundColor: colors.successSoft },
  month: { color: colors.warningText, fontSize: 11, fontWeight: '700' },
  monthOk: { color: colors.success },
  day: { color: colors.text, fontSize: 18, fontWeight: '700' },
  flex: { flex: 1 },
  cardTitle: { flex: 1, color: colors.text, fontSize: 16, fontWeight: '700' },
  session: { gap: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  sessionTitle: { color: colors.text, fontSize: 14, fontWeight: '700' },
  meta: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  description: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  reason: { color: colors.text, fontSize: 14, lineHeight: 20 },
});

function groupByCourse(absences: Absence[], data: AttendanceData) {
  const groups = new Map<string, Absence[]>();
  for (const item of absences) {
    const course = data.sessions.find((entry) => entry.id === item.sessionId)?.course ?? 'Absence';
    const current = groups.get(course) ?? [];
    current.push(item);
    groups.set(course, current);
  }
  return [...groups.entries()];
}

function absenceCount(count: number) {
  return count > 1 ? `${count} absences` : `${count} absence`;
}
