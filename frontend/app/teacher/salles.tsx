import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SectionTitle } from '@/components/AppHeader';
import { RoleHeader } from '@/components/RoleHeader';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppInput } from '@/components/ui/AppInput';
import { Screen } from '@/components/ui/Screen';
import { colors, spacing } from '@/constants/theme';
import { useAttendance } from '@/context/attendance';
import { useSession } from '@/context/session';
import { ApiError } from '@/lib/api';
import { formatWhen } from '@/lib/domain';
import {
  cancelReservation,
  createReservation,
  reservationLabel,
  reservationsRequest,
  updateReservation,
  type Reservation,
  type ReservationStatus,
  type Room,
} from '@/lib/rooms';

const tones: Record<ReservationStatus, 'warning' | 'success' | 'danger' | 'neutral'> = {
  en_attente: 'warning',
  validee: 'success',
  refusee: 'danger',
  annulee: 'neutral',
};

export default function TeacherRoomsScreen() {
  const { user } = useSession();
  const { data } = useAttendance();
  const teacherId = user?.teacherId ?? '';
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [roomId, setRoomId] = useState('');
  const [filterRoomId, setFilterRoomId] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [editingId, setEditingId] = useState('');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState(demain);
  const [start, setStart] = useState('14:30');
  const [end, setEnd] = useState('16:00');
  const [message, setMessage] = useState('');
  const [problem, setProblem] = useState('');
  const [pending, setPending] = useState(false);

  const load = useCallback(async (nextRoom = filterRoomId, nextSubject = subjectFilter) => {
    try {
      const result = await reservationsRequest(nextRoom, nextSubject);
      setRooms(result.rooms);
      setReservations(result.reservations);
      setProblem('');
    } catch (error) {
      setProblem(error instanceof ApiError ? error.message : 'Les réservations sont indisponibles.');
    }
  }, [filterRoomId, subjectFilter]);

  useFocusEffect(useCallback(() => {
    void load();
  }, [load]));

  function edit(item: Reservation) {
    setEditingId(item.id);
    setRoomId(item.roomId);
    setSubject(item.subject);
    setDate(item.date);
    setStart(item.start);
    setEnd(item.end);
    setMessage('');
    setProblem('');
  }

  function stopEditing() {
    setEditingId('');
    setRoomId('');
    setSubject('');
    setDate(demain());
    setStart('14:30');
    setEnd('16:00');
    setProblem('');
  }

  async function submit() {
    if (pending || !roomId) {
      setProblem('Choisissez une salle.');
      return;
    }
    setPending(true);
    const draft = { roomId, subject, date, start, end };
    try {
      if (editingId) await updateReservation(editingId, draft);
      else await createReservation(draft);
      setEditingId('');
      setSubject('');
      setMessage(editingId ? 'Demande modifiée.' : 'Demande envoyée. L’administration doit la confirmer.');
      setProblem('');
      await load();
    } catch (error) {
      setProblem(error instanceof ApiError ? error.message : 'Enregistrement impossible.');
    } finally {
      setPending(false);
    }
  }

  async function act(action: () => Promise<unknown>, success: string) {
    setPending(true);
    try {
      await action();
      setMessage(success);
      setProblem('');
      await load();
    } catch (error) {
      setProblem(error instanceof ApiError ? error.message : 'Action impossible.');
    } finally {
      setPending(false);
    }
  }

  const selected = rooms.find((room) => room.id === roomId) ?? null;
  const mine = reservations
    .filter((item) => item.teacherId === teacherId)
    .sort((left, right) => Number(right.status === 'en_attente') - Number(left.status === 'en_attente'));

  return (
    <Screen
      inTabs
      keyboard
      header={<RoleHeader eyebrow="Salles" subtitle="L’administration confirme la salle" />}
    >
      {message ? <Text style={styles.saved}>{message}</Text> : null}
      {problem ? <Text style={styles.problem}>{problem}</Text> : null}

      <SectionTitle>{editingId ? 'Modifier la demande' : 'Nouvelle demande'}</SectionTitle>
      <AppCard style={styles.stack}>
        <Text style={styles.label}>Choisir la salle</Text>
        <View style={styles.choices}>
          {rooms.map((room) => {
            const on = roomId === room.id;
            return (
              <Pressable key={room.id} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => setRoomId(room.id)} style={[styles.choice, on && styles.choiceOn]}>
                <Text style={[styles.choiceText, on && styles.choiceTextOn]}>{room.name}</Text>
                <Text style={[styles.choiceMeta, on && styles.choiceTextOn]}>{room.capacity} places</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.summary}>
          {selected ? `${selected.name} · ${selected.capacity} places · ${selected.equipment || 'Équipement non précisé'}` : 'Aucune salle choisie.'}
        </Text>
        <AppInput label="Matière" onChangeText={setSubject} placeholder="Génie logiciel" value={subject} />
        <AppInput autoCapitalize="none" label="Date" onChangeText={setDate} placeholder="2026-11-09" value={date} />
        <View style={styles.times}>
          <View style={styles.flex}><AppInput autoCapitalize="none" label="Début" onChangeText={setStart} placeholder="14:30" value={start} /></View>
          <View style={styles.flex}><AppInput autoCapitalize="none" label="Fin" onChangeText={setEnd} placeholder="16:00" value={end} /></View>
        </View>
        <AppButton disabled={pending} loading={pending} onPress={() => void submit()} title={editingId ? 'Enregistrer la modification' : 'Envoyer la demande'} />
        {editingId ? <AppButton onPress={stopEditing} title="Annuler la modification" variant="secondary" /> : null}
      </AppCard>

      <View style={styles.block}>
        <SectionTitle>Mes demandes</SectionTitle>
        {mine.length === 0 ? (
          <AppCard><AppEmptyState title="Aucune demande" message="Envoyez une demande. Elle reste à confirmer tant que l’administration n’a pas répondu." /></AppCard>
        ) : (
          <AppCard style={styles.list}>
            {mine.map((item, index) => (
              <ReservationRow
                key={item.id}
                item={item}
                mine
                roomName={rooms.find((entry) => entry.id === item.roomId)?.name ?? 'Salle'}
                teacherName="Vous"
                separated={index > 0}
                onCancel={() => void act(() => cancelReservation(item.id), 'Demande annulée.')}
                onEdit={() => edit(item)}
              />
            ))}
          </AppCard>
        )}
      </View>

      <View style={styles.block}>
        <SectionTitle>Toutes les réservations</SectionTitle>
        <AppCard style={styles.stack}>
          <AppInput label="Matière" onChangeText={setSubjectFilter} onSubmitEditing={() => void load(filterRoomId, subjectFilter)} placeholder="Projet tutoré" value={subjectFilter} />
          <View style={styles.choices}>
            <Pressable accessibilityRole="button" onPress={() => { setFilterRoomId(''); void load('', subjectFilter); }} style={[styles.filter, filterRoomId === '' && styles.filterOn]}>
              <Text style={[styles.filterText, filterRoomId === '' && styles.filterTextOn]}>Toutes</Text>
            </Pressable>
            {rooms.map((room) => (
              <Pressable key={`filtre-${room.id}`} accessibilityRole="button" onPress={() => { setFilterRoomId(room.id); void load(room.id, subjectFilter); }} style={[styles.filter, filterRoomId === room.id && styles.filterOn]}>
                <Text style={[styles.filterText, filterRoomId === room.id && styles.filterTextOn]}>{room.name.replace('Salle ', '')}</Text>
              </Pressable>
            ))}
          </View>
        </AppCard>
        {reservations.length === 0 ? (
          <AppCard><AppEmptyState title="Aucune réservation" message="Aucune réservation ne correspond à cette salle ou à cette matière." /></AppCard>
        ) : (
          <AppCard style={styles.list}>
            {reservations.map((item, index) => (
              <ReservationRow
                key={item.id}
                item={item}
                mine={item.teacherId === teacherId}
                roomName={rooms.find((entry) => entry.id === item.roomId)?.name ?? 'Salle'}
                teacherName={data.teachers.find((entry) => entry.id === item.teacherId)?.name ?? 'Enseignant'}
                separated={index > 0}
                onCancel={() => void act(() => cancelReservation(item.id), 'Demande annulée.')}
                onEdit={() => edit(item)}
              />
            ))}
          </AppCard>
        )}
      </View>
    </Screen>
  );
}

function ReservationRow({
  item,
  mine,
  roomName,
  teacherName,
  separated,
  onEdit,
  onCancel,
}: {
  item: Reservation;
  mine: boolean;
  roomName: string;
  teacherName: string;
  separated: boolean;
  onEdit: () => void;
  onCancel: () => void;
}) {
  const canEdit = mine && item.status === 'en_attente';
  const canCancel = mine && (item.status === 'en_attente' || item.status === 'validee');
  return (
    <View style={[styles.item, separated && styles.rowBorder]}>
      <View style={styles.row}>
        <View style={styles.flex}>
          <Text style={styles.name}>{item.subject}</Text>
          <Text style={styles.meta}>{roomName} · {formatWhen(item.date, item.start, item.end)}</Text>
          <Text style={styles.meta}>{teacherName}</Text>
        </View>
        <AppBadge label={reservationLabel(item.status)} tone={tones[item.status]} />
      </View>
      {canEdit || canCancel ? (
        <View style={styles.actions}>
          {canEdit ? <Action label="Modifier" onPress={onEdit} /> : null}
          {canCancel ? <Action label="Annuler" onPress={onCancel} tone="danger" /> : null}
        </View>
      ) : null}
    </View>
  );
}

function Action({ label, onPress, tone = 'primary' }: { label: string; onPress: () => void; tone?: 'primary' | 'danger' }) {
  const danger = tone === 'danger';
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.action, danger && styles.actionDanger]}>
      <Text style={[styles.actionText, danger && styles.actionTextDanger]}>{label}</Text>
    </Pressable>
  );
}

function demain() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const mois = String(date.getMonth() + 1).padStart(2, '0');
  const jour = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${mois}-${jour}`;
}

const styles = StyleSheet.create({
  stack: { gap: spacing.sm },
  block: { gap: spacing.sm },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  choice: { minWidth: 108, minHeight: 58, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, alignItems: 'flex-start', justifyContent: 'center' },
  choiceOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  choiceText: { color: colors.text, fontSize: 14, fontWeight: '700' },
  choiceMeta: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  choiceTextOn: { color: colors.onPrimary },
  label: { color: colors.text, fontSize: 14, fontWeight: '600' },
  summary: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
  times: { flexDirection: 'row', gap: spacing.sm },
  filter: { minHeight: 36, paddingHorizontal: spacing.sm + 4, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  filterOn: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  filterText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  filterTextOn: { color: colors.primary },
  action: { minHeight: 44, paddingHorizontal: spacing.md, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  actionDanger: { borderColor: colors.errorSoft, backgroundColor: colors.errorSoft },
  actionText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  actionTextDanger: { color: colors.error },
  list: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
  item: { gap: spacing.sm, paddingVertical: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  flex: { flex: 1 },
  name: { color: colors.text, fontSize: 15, fontWeight: '700' },
  meta: { color: colors.textSecondary, fontSize: 13, lineHeight: 18, marginTop: 2 },
  saved: { color: colors.success, backgroundColor: colors.successSoft, borderRadius: 12, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 14, lineHeight: 20, fontWeight: '600', overflow: 'hidden' },
  problem: { color: colors.error, backgroundColor: colors.errorSoft, borderRadius: 12, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 14, lineHeight: 20, fontWeight: '600', overflow: 'hidden' },
});
