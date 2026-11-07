import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RoleHeader } from '@/components/RoleHeader';
import { SectionTitle } from '@/components/AppHeader';
import { Icon } from '@/components/Icon';
import { AppAvatar } from '@/components/ui/AppAvatar';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppSearchBar } from '@/components/ui/AppSearchBar';
import { CourseMark } from '@/components/ui/CourseMark';
import { Screen } from '@/components/ui/Screen';
import { colors, radius, shadows, spacing } from '@/constants/theme';
import { useAttendance } from '@/context/attendance';
import { useSession } from '@/context/session';
import { absenceCountForStudent, formatWeek, formatWhen, openAbsenceCount, sessionsToCall, sessionsToCorrect, studentsInGroup, todayIso, weekDays, weekdayLabel } from '@/lib/domain';

export default function TeacherCallScreen() {
  const { user } = useSession();
  const { data, saveCall, correctCall } = useAttendance();
  const teacherId = user?.teacherId ?? '';
  const upcoming = sessionsToCall(data, teacherId);
  const called = sessionsToCorrect(data, teacherId);
  const today = todayIso();
  const todaySessions = upcoming.filter((item) => item.date === today);
  const laterSessions = upcoming.filter((item) => item.date !== today);
  const [step, setStep] = useState<'schedule' | 'pick' | 'mark'>('schedule');
  const [weekOffset, setWeekOffset] = useState(0);
  const [sessionId, setSessionId] = useState('');
  const course = [...upcoming, ...called].find((item) => item.id === sessionId) ?? null;
  const roster = studentsInGroup(data, course?.groupId ?? '');
  const [absent, setAbsent] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState('');
  const [problem, setProblem] = useState('');
  const [pending, setPending] = useState(false);
  const [query, setQuery] = useState('');
  const [askAllPresent, setAskAllPresent] = useState(false);
  const locked = new Set(
    data.absences
      .filter((item) => item.sessionId === sessionId && item.status !== 'a_justifier')
      .map((item) => item.studentId),
  );
  const absentStudents = roster.filter((item) => locked.has(item.id) || absent[item.id]);
  const marked = absentStudents.map((item) => item.id);
  const needle = query.trim().toLowerCase();
  const visibleRoster = needle ? roster.filter((item) => item.name.toLowerCase().includes(needle)) : roster;
  const open = openAbsenceCount(data, teacherId);
  const groupName = data.groups.find((item) => item.id === course?.groupId)?.name ?? '';
  const presentCount = roster.length - marked.length;

  function choose(id: string) {
    const selected = [...upcoming, ...called].find((item) => item.id === id);
    const markedAlready: Record<string, boolean> = {};
    if (selected?.called) {
      for (const item of data.absences) {
        if (item.sessionId === id) markedAlready[item.studentId] = true;
      }
    }
    setSessionId(id);
    setAbsent(markedAlready);
    setQuery('');
    setSaved('');
    setProblem('');
    setAskAllPresent(false);
    setStep('mark');
  }

  async function confirm() {
    if (!course || pending || roster.length === 0) return;
    if (marked.length === 0 && !askAllPresent) {
      setAskAllPresent(true);
      setProblem('');
      return;
    }
    const count = marked.length;
    setPending(true);
    const error = course.called ? await correctCall(course.id, marked) : await saveCall(course.id, marked);
    setPending(false);
    if (error) {
      setProblem(error);
      return;
    }
    setSessionId('');
    setAbsent({});
    setProblem('');
    setAskAllPresent(false);
    setStep('schedule');
    setSaved(course.called
      ? 'Correction confirmée.'
      : count === 0
        ? 'Séance confirmée. Tout le groupe est présent.'
        : count === 1
          ? 'Absence confirmée.'
          : `${count} absences confirmées.`);
  }

  const confirmTitle = course?.called
    ? marked.length === 0
      ? 'Confirmer : aucun absent'
      : `Confirmer la correction · ${marked.length}`
    : marked.length === 0
      ? 'Confirmer : aucun absent'
      : marked.length === 1
        ? 'Confirmer l’absence'
        : `Confirmer les ${marked.length} absences`;

  const panel = course ? (
    <View style={styles.panel}>
      {roster.length === 0 ? (
        <Text style={styles.hint}>Ce groupe n’a pas encore d’étudiants. L’appel attend la liste.</Text>
      ) : (
        <>
          <Text style={styles.hint}>
            {course.called
              ? 'Touchez un nom pour corriger l’absence. Un dossier déjà déposé reste en place.'
              : 'Touchez chaque absent, puis confirmez. Les autres seront présents.'}
          </Text>
          {roster.length > 8 ? <AppSearchBar onChangeText={setQuery} placeholder="Chercher un étudiant" value={query} /> : null}
          {visibleRoster.length === 0 ? <Text style={styles.hint}>Aucun étudiant ne correspond à cette recherche.</Text> : null}
          {visibleRoster.map((item) => {
            const held = locked.has(item.id);
            const isAbsent = held || Boolean(absent[item.id]);
            const total = absenceCountForStudent(data, item.id);
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityState={{ disabled: held, selected: isAbsent }}
                disabled={held}
                onPress={() => {
                  setAskAllPresent(false);
                  setAbsent((current) => ({ ...current, [item.id]: !current[item.id] }));
                }}
                style={({ pressed }) => [styles.row, styles.rowBorder, held && styles.rowLocked, pressed && !held && styles.rowPressed]}
              >
                <AppAvatar initials={item.initials} size={42} />
                <View style={styles.flex}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.detail}>{held ? 'Dossier déposé' : isAbsent ? 'Absent à cette séance' : 'Présent'}</Text>
                </View>
                <AppBadge label={isAbsent ? 'Absent' : total === 0 ? 'À jour' : `${total} abs.`} tone={isAbsent ? 'danger' : total === 0 ? 'success' : 'warning'} />
              </Pressable>
            );
          })}
        </>
      )}
    </View>
  ) : null;

  const days = weekDays(new Date(), weekOffset);
  const heading = step === 'mark' && course
    ? { eyebrow: 'Absences', subtitle: `${course.course} · ${formatWhen(course.date, course.start, course.end)}` }
    : step === 'pick'
      ? { eyebrow: 'Choisir la séance', subtitle: 'Puis marquez les absents' }
      : { eyebrow: 'Emploi du temps', subtitle: 'Vos séances de la semaine' };

  return (
    <Screen
      inTabs
      keyboard={step === 'mark'}
      floating={step === 'schedule' ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Enregistrer une absence" onPress={() => { setSaved(''); setProblem(''); setStep('pick'); }} style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}>
          <Icon color={colors.onPrimary} name={{ ios: 'plus', android: 'add' }} size={20} />
          <Text style={styles.fabText}>Enregistrer</Text>
        </Pressable>
      ) : null}
      header={<RoleHeader eyebrow={heading.eyebrow} subtitle={heading.subtitle} />}
      footer={
        step === 'mark' && course && roster.length > 0 ? (
          <View style={styles.footerStack}>
            <Text style={styles.recapTitle}>{recapTitle(marked.length, presentCount)}</Text>
            <Text numberOfLines={2} style={styles.recapNames}>{marked.length === 0 ? 'Aucun nom coché. Les autres sont présents.' : absentStudents.map((item) => item.name).join(', ')}</Text>
            {askAllPresent ? (
              <>
                <Text style={styles.ask}>Tout le groupe est présent ?</Text>
                <AppButton disabled={pending} loading={pending} onPress={() => void confirm()} title="Confirmer la présence" />
                <AppButton disabled={pending} onPress={() => setAskAllPresent(false)} title="Annuler" variant="ghost" />
              </>
            ) : (
              <AppButton disabled={pending} loading={pending} onPress={() => void confirm()} title={confirmTitle} />
            )}
          </View>
        ) : null
      }
    >
      {saved ? <Text style={styles.saved}>{saved}</Text> : null}
      {problem ? <Text style={styles.problem}>{problem}</Text> : null}

      {step === 'schedule' ? (
        <TeacherWeek
          days={days}
          groups={data.groups}
          onNext={() => setWeekOffset((current) => current + 1)}
          onPrevious={() => setWeekOffset((current) => current - 1)}
          onToday={() => setWeekOffset(0)}
          sessions={data.sessions.filter((item) => item.teacherId === teacherId)}
        />
      ) : null}

      {step === 'pick' ? (
        upcoming.length + called.length === 0 ? (
          <AppCard>
            <AppEmptyState title="Aucune séance" message="Les cours des sept prochains jours, et les appels des quatorze derniers, apparaîtront ici." />
            <Pressable accessibilityRole="button" onPress={() => setStep('schedule')}>
              <Text style={styles.link}>Retour à l’emploi du temps</Text>
            </Pressable>
          </AppCard>
        ) : (
          <>
            <Pressable accessibilityRole="button" onPress={() => setStep('schedule')}>
              <Text style={styles.link}>Retour à l’emploi du temps</Text>
            </Pressable>
            <SessionList groups={data.groups} title="Aujourd’hui" items={todaySessions} onChoose={choose} />
            <SessionList groups={data.groups} title={todaySessions.length === 0 ? 'À appeler' : 'À venir'} items={laterSessions} onChoose={choose} />
            <SessionList groups={data.groups} title="Déjà appelées" items={called} onChoose={choose} />
            <Pressable accessibilityRole="button" onPress={() => router.push('/teacher/justificatifs')}>
              <Text style={styles.link}>{open === 0 ? 'Aucun dossier en examen' : `${open} dossier${open > 1 ? 's' : ''} en examen`}</Text>
            </Pressable>
          </>
        )
      ) : null}

      {step === 'mark' && course ? (
        <View style={styles.stack}>
          <Pressable accessibilityRole="button" onPress={() => { setSessionId(''); setAbsent({}); setProblem(''); setAskAllPresent(false); setStep('pick'); }}>
            <Text style={styles.link}>Changer de séance</Text>
          </Pressable>
          <AppCard style={styles.panel}>
            <Text style={styles.sessionMeta}>{groupName} · {course.room} · {roster.length} étudiants</Text>
            {panel}
          </AppCard>
        </View>
      ) : null}
    </Screen>
  );
}

function TeacherWeek({
  days,
  sessions,
  groups,
  onPrevious,
  onNext,
  onToday,
}: {
  days: string[];
  sessions: { id: string; course: string; room: string; groupId: string; date: string; start: string; end: string; called: boolean }[];
  groups: { id: string; name: string }[];
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}) {
  const today = todayIso();
  return (
    <>
      <View style={styles.nav}>
        <Pressable accessibilityRole="button" accessibilityLabel="Semaine précédente" onPress={onPrevious} style={styles.step}>
          <Text style={styles.stepText}>‹</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Revenir à cette semaine" onPress={onToday} style={styles.week}>
          <Text style={styles.weekText}>{formatWeek(days)}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Semaine suivante" onPress={onNext} style={styles.step}>
          <Text style={styles.stepText}>›</Text>
        </Pressable>
      </View>
      {days.map((date) => {
        const lessons = sessions.filter((item) => item.date === date).sort((left, right) => left.start.localeCompare(right.start));
        return (
          <View key={date} style={styles.stack}>
            <SectionTitle>{capitalize(weekdayLabel(date, new Date()))}</SectionTitle>
            {lessons.length === 0 ? <Text style={styles.hint}>Aucun cours</Text> : lessons.map((lesson) => {
              const group = groups.find((item) => item.id === lesson.groupId)?.name ?? lesson.groupId;
              return (
                <AppCard key={lesson.id} style={styles.lesson}>
                  <Text style={styles.sessionTime}>{lesson.start}</Text>
                  <CourseMark course={lesson.course} />
                  <View style={styles.flex}>
                    <Text style={styles.lessonTitle}>{lesson.course}</Text>
                    <Text style={styles.sessionMeta}>{group} · {lesson.room}</Text>
                  </View>
                  <AppBadge label={lesson.called ? 'Appelée' : date > today ? 'À venir' : date === today ? 'Aujourd’hui' : 'Non appelée'} tone={lesson.called ? 'neutral' : date < today ? 'warning' : 'success'} />
                </AppCard>
              );
            })}
          </View>
        );
      })}
    </>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function recapTitle(absentCount: number, presentCount: number) {
  const absents = absentCount === 0 ? 'Aucun absent' : absentCount === 1 ? '1 absent' : `${absentCount} absents`;
  const presents = presentCount === 1 ? '1 présent' : `${presentCount} présents`;
  return `${absents} · ${presents}`;
}

function SessionList({
  title,
  items,
  groups,
  onChoose,
}: {
  title: string;
  items: { id: string; course: string; room: string; groupId: string; date: string; start: string; end: string; called?: boolean }[];
  groups: { id: string; name: string }[];
  onChoose: (id: string) => void;
}) {
  if (items.length === 0) return null;
  const today = todayIso();
  return (
    <View style={styles.stack}>
      <SectionTitle>{title}</SectionTitle>
      <AppCard style={styles.listCard}>
        {items.map((item, index) => {
          const place = `${groups.find((group) => group.id === item.groupId)?.name ?? item.groupId} · ${item.room}`;
          const when = item.date === today ? place : `${formatWhen(item.date, item.start, item.end).split(' · ')[0]} · ${place}`;
          return (
            <Pressable
              accessibilityRole="button"
              key={item.id}
              onPress={() => onChoose(item.id)}
              style={[styles.session, index > 0 && styles.rowBorder]}
            >
              <Text style={styles.sessionTime}>{item.start}</Text>
              <View style={styles.flex}>
                <Text style={styles.sessionTitle}>{item.course}</Text>
                <Text style={styles.sessionMeta}>{when}</Text>
              </View>
              {item.called ? <AppBadge label="Appelée" tone="neutral" /> : null}
            </Pressable>
          );
        })}
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  saved: { color: colors.success, backgroundColor: colors.successSoft, borderRadius: 12, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 14, lineHeight: 20, fontWeight: '600', overflow: 'hidden' },
  problem: { color: colors.error, backgroundColor: colors.errorSoft, borderRadius: 12, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 14, lineHeight: 20, fontWeight: '600', overflow: 'hidden' },
  stack: { gap: spacing.sm },
  panel: { gap: spacing.sm, paddingBottom: spacing.sm },
  flex: { flex: 1 },
  hint: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
  session: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md, paddingHorizontal: spacing.xs },
  sessionTime: { width: 48, color: colors.primary, fontSize: 14, fontWeight: '800' },
  sessionTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  sessionMeta: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  listCard: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  rowPressed: { backgroundColor: colors.primaryLight },
  rowLocked: { opacity: 0.72 },
  footerStack: { gap: spacing.sm },
  recapTitle: { color: colors.text, fontSize: 14, fontWeight: '700' },
  recapNames: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
  ask: { color: colors.text, fontSize: 15, fontWeight: '700' },
  name: { color: colors.text, fontSize: 15, fontWeight: '700' },
  detail: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  link: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  nav: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  step: { width: 44, height: 44, borderRadius: radius.md, borderCurve: 'continuous', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  stepText: { color: colors.primary, fontSize: 24, lineHeight: 28, fontWeight: '600' },
  week: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  weekText: { color: colors.text, fontSize: 15, lineHeight: 20, fontWeight: '700', textAlign: 'center' },
  lesson: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  lessonTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  fab: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.primary, borderRadius: radius.full, paddingVertical: 14, paddingHorizontal: spacing.md, ...shadows.raised },
  fabPressed: { backgroundColor: colors.primaryDark },
  fabText: { color: colors.onPrimary, fontSize: 15, fontWeight: '700' },
});
