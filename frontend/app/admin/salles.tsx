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
import { ApiError } from '@/lib/api';
import { formatWhen } from '@/lib/domain';
import { cancelReservation, decideReservation, deleteRoom, reservationLabel, reservationsRequest, roomsRequest, saveRoom, type Reservation, type ReservationStatus, type Room } from '@/lib/rooms';

const tones: Record<ReservationStatus, 'warning' | 'success' | 'danger' | 'neutral'> = {
  en_attente: 'warning',
  validee: 'success',
  refusee: 'danger',
  annulee: 'neutral',
};

const emptyForm = { id: '', name: '', capacity: '', equipment: '' };

export default function AdminRoomsScreen() {
  const { data } = useAttendance();
  const [capacity, setCapacity] = useState('');
  const [equipment, setEquipment] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [catalog, setCatalog] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [problem, setProblem] = useState('');
  const [pending, setPending] = useState(false);

  const load = useCallback(async (nextCapacity = capacity, nextEquipment = equipment) => {
    try {
      const [found, booked] = await Promise.all([
        roomsRequest(nextCapacity, nextEquipment),
        reservationsRequest(),
      ]);
      setRooms(found.rooms);
      setCatalog(booked.rooms);
      setReservations(booked.reservations);
      setProblem('');
    } catch (error) {
      setProblem(error instanceof ApiError ? error.message : 'Les salles sont indisponibles.');
    }
  }, [capacity, equipment]);

  useFocusEffect(useCallback(() => {
    void load();
  }, [load]));

  async function submit() {
    if (pending) return;
    setPending(true);
    try {
      await saveRoom(form);
      setForm(emptyForm);
      setMessage(form.id ? 'Salle modifiée.' : 'Salle ajoutée.');
      setProblem('');
      await load();
    } catch (error) {
      setProblem(error instanceof ApiError ? error.message : 'Enregistrement impossible.');
    } finally {
      setPending(false);
    }
  }

  async function remove(id: string) {
    setPending(true);
    try {
      await deleteRoom(id);
      if (form.id === id) setForm(emptyForm);
      setMessage('Salle supprimée.');
      setProblem('');
      await load();
    } catch (error) {
      setProblem(error instanceof ApiError ? error.message : 'Suppression impossible.');
    } finally {
      setPending(false);
    }
  }

  async function cancel(id: string) {
    setPending(true);
    try {
      await cancelReservation(id);
      setMessage('Réservation annulée.');
      setProblem('');
      await load();
    } catch (error) {
      setProblem(error instanceof ApiError ? error.message : 'Annulation impossible.');
    } finally {
      setPending(false);
    }
  }

  async function decide(id: string, decision: 'validee' | 'refusee') {
    setPending(true);
    try {
      await decideReservation(id, decision);
      setMessage(decision === 'validee' ? 'Demande confirmée.' : 'Demande refusée.');
      setProblem('');
      await load();
    } catch (error) {
      setProblem(error instanceof ApiError ? error.message : 'Confirmation impossible.');
    } finally {
      setPending(false);
    }
  }

  const waiting = reservations.filter((item) => item.status === 'en_attente');
  const history = reservations.filter((item) => item.status !== 'en_attente');

  return (
    <Screen inTabs keyboard header={<RoleHeader eyebrow="Salles" subtitle="Confirmer les demandes" />}>
      {message ? <Text style={styles.saved}>{message}</Text> : null}
      {problem ? <Text style={styles.problem}>{problem}</Text> : null}

      <SectionTitle>{waiting.length === 0 ? 'Demandes à confirmer' : `Demandes à confirmer · ${waiting.length}`}</SectionTitle>
      {waiting.length === 0 ? (
        <AppCard><AppEmptyState title="Aucune demande" message="Les demandes des enseignants apparaîtront ici. La salle n’est accordée qu’après votre confirmation." /></AppCard>
      ) : (
        <View style={styles.stack}>
          {waiting.map((item) => {
            const room = catalog.find((entry) => entry.id === item.roomId);
            const teacher = data.teachers.find((entry) => entry.id === item.teacherId);
            return (
              <AppCard key={item.id} style={styles.stack}>
                <View style={styles.row}>
                  <View style={styles.flex}>
                    <Text style={styles.name}>{item.subject}</Text>
                    <Text style={styles.meta}>{room?.name ?? 'Salle'} · {formatWhen(item.date, item.start, item.end)}</Text>
                    <Text style={styles.meta}>{teacher?.name ?? 'Enseignant'}{room ? ` · ${room.capacity} places` : ''}</Text>
                  </View>
                  <AppBadge label="À confirmer" tone="warning" />
                </View>
                <View style={styles.decide}>
                  <AppButton disabled={pending} onPress={() => void decide(item.id, 'validee')} style={styles.half} title="Confirmer" />
                  <AppButton disabled={pending} onPress={() => void decide(item.id, 'refusee')} style={styles.half} title="Refuser" variant="secondary" />
                </View>
              </AppCard>
            );
          })}
        </View>
      )}

      <SectionTitle>Rechercher</SectionTitle>
      <AppCard style={styles.stack}>
        <AppInput keyboardType="number-pad" label="Capacité minimale" onChangeText={setCapacity} placeholder="30" value={capacity} />
        <AppInput label="Équipement" onChangeText={setEquipment} placeholder="Projecteur" value={equipment} />
        <AppButton onPress={() => void load()} title="Afficher les salles" />
      </AppCard>

      <View style={styles.block}>
        <SectionTitle>{form.id ? 'Modifier la salle' : 'Ajouter une salle'}</SectionTitle>
        <AppCard style={styles.stack}>
          <AppInput label="Nom" onChangeText={(name) => setForm((current) => ({ ...current, name }))} placeholder="Salle A35" value={form.name} />
          <AppInput keyboardType="number-pad" label="Capacité" onChangeText={(value) => setForm((current) => ({ ...current, capacity: value }))} placeholder="40" value={form.capacity} />
          <AppInput label="Équipement" onChangeText={(value) => setForm((current) => ({ ...current, equipment: value }))} placeholder="Projecteur, tableau" value={form.equipment} />
          <AppButton disabled={pending} onPress={() => void submit()} title={pending ? 'Enregistrement…' : form.id ? 'Enregistrer les modifications' : 'Ajouter la salle'} />
          {form.id ? <AppButton onPress={() => setForm(emptyForm)} title="Annuler la modification" variant="secondary" /> : null}
        </AppCard>
      </View>

      <View style={styles.block}>
        <SectionTitle>Salles</SectionTitle>
        {rooms.length === 0 ? (
          <AppCard><AppEmptyState title="Aucune salle" message="Aucune salle ne correspond à cette capacité ou à cet équipement." /></AppCard>
        ) : (
          <AppCard style={styles.list}>
            {rooms.map((room, index) => (
              <View key={room.id} style={[styles.room, index > 0 && styles.rowBorder]}>
                <View style={styles.places}>
                  <Text style={styles.placesValue}>{room.capacity}</Text>
                  <Text style={styles.placesLabel}>places</Text>
                </View>
                <View style={styles.flex}>
                  <Text style={styles.name}>{room.name}</Text>
                  <Text style={styles.meta}>{room.equipment || 'Sans équipement indiqué'}</Text>
                  <View style={styles.actions}>
                    <Action label="Modifier" onPress={() => setForm({ id: room.id, name: room.name, capacity: String(room.capacity), equipment: room.equipment })} />
                    <Action label="Supprimer" onPress={() => void remove(room.id)} tone="danger" />
                  </View>
                </View>
              </View>
            ))}
          </AppCard>
        )}
      </View>

      <View style={styles.block}>
        <SectionTitle>Historique</SectionTitle>
        {history.length === 0 ? (
          <AppCard><AppEmptyState title="Aucun historique" message="Les demandes confirmées, refusées ou annulées apparaîtront ici." /></AppCard>
        ) : (
          <AppCard style={styles.list}>
            {history.map((item, index) => {
              const room = catalog.find((entry) => entry.id === item.roomId);
              const teacher = data.teachers.find((entry) => entry.id === item.teacherId);
              return (
                <View key={item.id} style={[styles.room, index > 0 && styles.rowBorder]}>
                  <View style={styles.flex}>
                    <Text style={styles.name}>{item.subject}</Text>
                    <Text style={styles.meta}>{room?.name ?? 'Salle'} · {formatWhen(item.date, item.start, item.end)}</Text>
                    <Text style={styles.meta}>{teacher?.name ?? 'Enseignant'}</Text>
                    {item.status === 'validee' ? <Action label="Annuler" onPress={() => void cancel(item.id)} tone="danger" /> : null}
                  </View>
                  <AppBadge label={reservationLabel(item.status)} tone={tones[item.status]} />
                </View>
              );
            })}
          </AppCard>
        )}
      </View>

      <View style={styles.block}>
        <SectionTitle>Enseignants</SectionTitle>
        <AppCard>
          {data.teachers.length === 0 ? (
            <AppEmptyState title="Aucun enseignant" message="Créez un compte dans l’onglet Ajouter." />
          ) : (
            <View style={styles.people}>
              {data.teachers.map((teacher) => (
                <View key={teacher.id} style={styles.person}>
                  <Text style={styles.personName}>{teacher.name}</Text>
                </View>
              ))}
            </View>
          )}
        </AppCard>
        <Text style={styles.meta}>Le compte d’un enseignant se crée dans l’onglet Ajouter.</Text>
      </View>
    </Screen>
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

const styles = StyleSheet.create({
  stack: { gap: spacing.sm },
  block: { gap: spacing.sm },
  list: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  room: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, paddingVertical: spacing.md },
  decide: { flexDirection: 'row', gap: spacing.sm },
  half: { flex: 1 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  flex: { flex: 1 },
  places: { width: 64, height: 64, borderRadius: 12, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  placesValue: { color: colors.primary, fontSize: 18, fontWeight: '700' },
  placesLabel: { color: colors.primary, fontSize: 11, fontWeight: '600' },
  name: { color: colors.text, fontSize: 16, fontWeight: '700' },
  meta: { color: colors.textSecondary, fontSize: 13, lineHeight: 18, marginTop: 2 },
  action: { minHeight: 44, paddingHorizontal: spacing.md, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  actionDanger: { borderColor: colors.errorSoft, backgroundColor: colors.errorSoft },
  actionText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  actionTextDanger: { color: colors.error },
  people: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  person: { borderRadius: 12, backgroundColor: colors.background, paddingHorizontal: spacing.sm + 4, paddingVertical: spacing.sm },
  personName: { color: colors.text, fontSize: 13, fontWeight: '600' },
  saved: { color: colors.success, backgroundColor: colors.successSoft, borderRadius: 12, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 14, lineHeight: 20, fontWeight: '600', overflow: 'hidden' },
  problem: { color: colors.error, backgroundColor: colors.errorSoft, borderRadius: 12, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 14, lineHeight: 20, fontWeight: '600', overflow: 'hidden' },
});
