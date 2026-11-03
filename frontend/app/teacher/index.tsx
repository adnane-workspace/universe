import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RoleHeader } from '@/components/RoleHeader';
import { SectionTitle } from '@/components/AppHeader';
import { AppAvatar } from '@/components/ui/AppAvatar';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppSearchBar } from '@/components/ui/AppSearchBar';
import { AppStatCard } from '@/components/ui/AppStatCard';
import { Screen } from '@/components/ui/Screen';
import { colors, spacing } from '@/constants/theme';
import { useAttendance } from '@/context/attendance';
import { useSession } from '@/context/session';
import { absenceCountForStudent, formatWhen, openAbsenceCount, recentAbsenceCount, sessionsToCall, sessionsToCorrect, studentsInGroup, todayIso } from '@/lib/domain';

export default function TeacherCallScreen() {
  const { user } = useSession();
  const { data, saveCall, correctCall } = useAttendance();
  const teacherId = user?.teacherId ?? '';
  const upcoming = sessionsToCall(data, teacherId);
  const called = sessionsToCorrect(data, teacherId);
  const today = todayIso();
  const todaySessions = upcoming.filter((item) => item.date === today);
  const laterSessions = upcoming.filter((item) => item.date !== today);
  const [sessionId, setSessionId] = useState('');
  const course = [...upcoming, ...called].find((item) => item.id === sessionId) ?? null;
  const roster = studentsInGroup(data, course?.groupId ?? '');
  const [absent, setAbsent] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState('');
  const [problem, setProblem] = useState('');
  const [pending, setPending] = useState(false);
  const [query, setQuery] = useState('');
  const marked = Object.entries(absent).filter(([, value]) => value).map(([id]) => id);
  const needle = query.trim().toLowerCase();
  const visibleRoster = needle ? roster.filter((item) => item.name.toLowerCase().includes(needle)) : roster;
  const open = openAbsenceCount(data, teacherId);

  function choose(id: string) {
    if (id === sessionId) {
      setSessionId('');
      setAbsent({});
      return;
    }
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
  }

  async function confirm() {
    if (!course || pending || roster.length === 0) return;
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
              ? 'Touchez un nom pour corriger. Une absence déjà justifiée reste en place.'
              : 'Touchez les absents. Les autres seront marqués présents.'}
          </Text>
          {roster.length > 8 ? <AppSearchBar onChangeText={setQuery} placeholder="Chercher un étudiant" value={query} /> : null}
          {visibleRoster.length === 0 ? <Text style={styles.hint}>Aucun étudiant ne correspond à cette recherche.</Text> : null}
          {visibleRoster.map((item) => {
            const isAbsent = Boolean(absent[item.id]);
            const total = absenceCountForStudent(data, item.id);
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityState={{ selected: isAbsent }}
                onPress={() => setAbsent((current) => ({ ...current, [item.id]: !current[item.id] }))}
                style={({ pressed }) => [styles.row, styles.rowBorder, pressed && styles.rowPressed]}
              >
                <AppAvatar initials={item.initials} size={42} />
                <View style={styles.flex}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.detail}>{isAbsent ? 'Absent à cette séance' : 'Présent'}</Text>
                </View>
                <AppBadge label={isAbsent ? 'Absent' : total === 0 ? 'À jour' : `${total} abs.`} tone={isAbsent ? 'danger' : total === 0 ? 'success' : 'warning'} />
              </Pressable>
            );
          })}
        </>
      )}
    </View>
  ) : null;

  return (
    <Screen
      inTabs
      keyboard
      header={<RoleHeader eyebrow="Appel" />}
      footer={course && roster.length > 0 ? <AppButton disabled={pending} loading={pending} onPress={() => void confirm()} title={confirmTitle} /> : null}
    >
      <View style={styles.stats}>
        <AppStatCard compact label="À appeler" value={String(upcoming.length)} />
        <Pressable accessibilityRole="button" accessibilityLabel="Ouvrir les dossiers à traiter" onPress={() => router.push('/teacher/justificatifs')} style={styles.statLink}>
          <AppStatCard compact label="À traiter" value={String(open)} tone={open ? 'warning' : 'success'} />
        </Pressable>
        <AppStatCard compact label="Ce mois" value={String(recentAbsenceCount(data, teacherId))} />
      </View>
      {saved ? <Text style={styles.saved}>{saved}</Text> : null}
      {problem ? <Text style={styles.problem}>{problem}</Text> : null}
      {upcoming.length + called.length > 0 && !course ? <Text style={styles.hint}>Choisissez une séance, puis confirmez l’appel.</Text> : null}

      {upcoming.length + called.length === 0 ? (
        <AppCard>
          <AppEmptyState title="Aucune séance cette semaine" message="Les cours des sept prochains jours, et les appels des quatorze derniers, apparaîtront ici." />
        </AppCard>
      ) : (
        <>
          <SessionList
            title="Aujourd’hui"
            items={todaySessions}
            selectedId={course?.id ?? ''}
            onChoose={choose}
            extra={course && todaySessions.some((item) => item.id === course.id) ? panel : null}
          />
          <SessionList
            title={todaySessions.length === 0 ? 'À appeler' : 'À venir'}
            items={laterSessions}
            selectedId={course?.id ?? ''}
            onChoose={choose}
            extra={course && laterSessions.some((item) => item.id === course.id) ? panel : null}
          />
          <SessionList
            title="Déjà appelées"
            items={called}
            selectedId={course?.id ?? ''}
            onChoose={choose}
            extra={course && called.some((item) => item.id === course.id) ? panel : null}
          />
        </>
      )}
    </Screen>
  );
}

function SessionList({
  title,
  items,
  selectedId,
  onChoose,
  extra,
}: {
  title: string;
  items: { id: string; course: string; room: string; date: string; start: string; end: string; called?: boolean }[];
  selectedId: string;
  onChoose: (id: string) => void;
  extra?: ReactNode;
}) {
  if (items.length === 0) return null;
  const today = todayIso();
  return (
    <View style={styles.stack}>
      <SectionTitle>{title}</SectionTitle>
      <AppCard style={styles.listCard}>
        {items.map((item, index) => {
          const selected = item.id === selectedId;
          const when = item.date === today ? item.room : `${formatWhen(item.date, item.start, item.end).split(' · ')[0]} · ${item.room}`;
          return (
            <View key={item.id}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => onChoose(item.id)}
                style={[styles.session, index > 0 && styles.rowBorder, selected && styles.sessionOn]}
              >
                <Text style={styles.sessionTime}>{item.start}</Text>
                <View style={styles.flex}>
                  <Text style={styles.sessionTitle}>{item.course}</Text>
                  <Text style={styles.sessionMeta}>{when}</Text>
                </View>
                {item.called ? <AppBadge label="Appelée" tone="neutral" /> : null}
              </Pressable>
              {selected ? extra : null}
            </View>
          );
        })}
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: spacing.sm },
  statLink: { flex: 1 },
  saved: { color: colors.success, backgroundColor: colors.successSoft, borderRadius: 12, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 14, lineHeight: 20, fontWeight: '600', overflow: 'hidden' },
  problem: { color: colors.error, backgroundColor: colors.errorSoft, borderRadius: 12, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 14, lineHeight: 20, fontWeight: '600', overflow: 'hidden' },
  stack: { gap: spacing.sm },
  panel: { gap: spacing.sm, paddingBottom: spacing.sm },
  flex: { flex: 1 },
  hint: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
  session: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md, paddingHorizontal: spacing.xs },
  sessionOn: { backgroundColor: colors.primaryLight, marginHorizontal: -spacing.md, paddingHorizontal: spacing.md },
  sessionTime: { width: 48, color: colors.primary, fontSize: 14, fontWeight: '800' },
  sessionTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  sessionMeta: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  listCard: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  rowPressed: { backgroundColor: colors.primaryLight },
  name: { color: colors.text, fontSize: 15, fontWeight: '700' },
  detail: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
});
