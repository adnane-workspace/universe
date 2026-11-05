import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SectionTitle } from '@/components/AppHeader';
import { JustificationForm } from '@/components/JustificationForm';
import { RoleHeader } from '@/components/RoleHeader';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppCard } from '@/components/ui/AppCard';
import { Screen } from '@/components/ui/Screen';
import { colors, radius, spacing } from '@/constants/theme';
import { useAttendance } from '@/context/attendance';
import { useSession } from '@/context/session';
import { formatWeek, sessionsForGroupOn, studentAbsences, studentById, weekDays, weekdayLabel, type AbsenceStatus } from '@/lib/domain';

export default function StudentScheduleScreen() {
  const { user } = useSession();
  const { data } = useAttendance();
  const studentId = user?.studentId ?? '';
  const person = studentById(data, studentId);
  const absences = studentAbsences(data, studentId);
  const [offset, setOffset] = useState(0);
  const today = new Date();
  const days = weekDays(today, offset);

  return (
    <Screen inTabs header={<RoleHeader eyebrow="Emploi du temps" subtitle="Semaine du groupe" />}>
      <View style={styles.nav}>
        <Pressable accessibilityRole="button" accessibilityLabel="Semaine précédente" onPress={() => setOffset((current) => current - 1)} style={styles.step}>
          <Text style={styles.stepText}>‹</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Revenir à cette semaine" onPress={() => setOffset(0)} style={styles.week}>
          <Text style={styles.weekText}>{formatWeek(days)}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Semaine suivante" onPress={() => setOffset((current) => current + 1)} style={styles.step}>
          <Text style={styles.stepText}>›</Text>
        </Pressable>
      </View>
      {days.map((date) => {
        const lessons = sessionsForGroupOn(data, person?.groupId ?? '', date);
        const title = capitalize(weekdayLabel(date, today));
        return (
          <View key={date} style={styles.day}>
            <SectionTitle>{title}</SectionTitle>
            {lessons.length === 0 ? (
              <Text style={styles.empty}>Aucun cours</Text>
            ) : (
              <AppCard style={styles.listCard}>
                {lessons.map((lesson, index) => {
                  const missed = absences.find((item) => item.sessionId === lesson.id);
                  const state = lessonState(lesson.called, missed?.status);
                  const canJustify = missed?.status === 'a_justifier' || missed?.status === 'refusee';
                  return (
                    <View key={lesson.id} style={[styles.lessonBlock, index > 0 && styles.rowBorder]}>
                      <View style={styles.lesson}>
                        <Text style={styles.time}>{lesson.start}</Text>
                        <View style={styles.flex}>
                          <Text style={styles.lessonTitle}>{lesson.course}</Text>
                          <Text style={styles.meta}>{lesson.room}</Text>
                        </View>
                        <AppBadge label={state.label} tone={state.tone} />
                      </View>
                      {canJustify && missed ? <JustificationForm absenceId={missed.id} again={missed.status === 'refusee'} /> : null}
                    </View>
                  );
                })}
              </AppCard>
            )}
          </View>
        );
      })}
    </Screen>
  );
}

function lessonState(called: boolean, status?: AbsenceStatus) {
  if (!called) return { label: 'À venir', tone: 'neutral' as const };
  if (!status) return { label: 'Présent', tone: 'success' as const };
  if (status === 'justifiee') return { label: 'Justifiée', tone: 'success' as const };
  if (status === 'refusee') return { label: 'Refusée', tone: 'danger' as const };
  if (status === 'envoye') return { label: 'Envoyé', tone: 'neutral' as const };
  return { label: 'À justifier', tone: 'warning' as const };
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const styles = StyleSheet.create({
  nav: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  step: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { color: colors.primary, fontSize: 24, lineHeight: 28, fontWeight: '600' },
  week: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  weekText: { color: colors.text, fontSize: 15, lineHeight: 20, fontWeight: '700', textAlign: 'center' },
  day: { gap: spacing.sm },
  empty: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  listCard: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
  lessonBlock: { gap: spacing.sm, paddingVertical: spacing.md },
  lesson: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  time: { width: 52, color: colors.primary, fontSize: 14, fontWeight: '700' },
  flex: { flex: 1 },
  lessonTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  meta: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
});
