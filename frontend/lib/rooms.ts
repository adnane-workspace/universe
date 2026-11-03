import { api } from '@/lib/api';

export type Room = { id: string; name: string; capacity: number; equipment: string };
export type ReservationStatus = 'en_attente' | 'validee' | 'refusee' | 'annulee';
export type Reservation = {
  id: string;
  roomId: string;
  teacherId: string;
  subject: string;
  date: string;
  start: string;
  end: string;
  status: ReservationStatus;
};

export type ReservationDraft = {
  roomId: string;
  subject: string;
  date: string;
  start: string;
  end: string;
};

export function roomsRequest(capacity = '', equipment = '') {
  const params = new URLSearchParams();
  if (capacity.trim()) params.set('capacity', capacity.trim());
  if (equipment.trim()) params.set('equipment', equipment.trim());
  const query = params.toString();
  return api<{ rooms: Room[] }>(`/rooms${query ? `?${query}` : ''}`);
}

export function saveRoom(room: { id?: string; name: string; capacity: string; equipment: string }) {
  return api<{ rooms: Room[] }>(room.id ? '/rooms/update' : '/rooms', {
    method: 'POST',
    body: { id: room.id, name: room.name, capacity: Number(room.capacity), equipment: room.equipment },
  });
}

export function deleteRoom(id: string) {
  return api<{ rooms: Room[] }>('/rooms/delete', { method: 'POST', body: { id } });
}

export function reservationsRequest(roomId = '', subject = '') {
  const params = new URLSearchParams();
  if (roomId) params.set('roomId', roomId);
  if (subject.trim()) params.set('subject', subject.trim());
  const query = params.toString();
  return api<{ reservations: Reservation[]; rooms: Room[] }>(`/reservations${query ? `?${query}` : ''}`);
}

export function createReservation(draft: ReservationDraft) {
  return api<{ reservations: Reservation[] }>('/reservations', { method: 'POST', body: draft });
}

export function updateReservation(id: string, draft: ReservationDraft) {
  return api<{ reservations: Reservation[] }>('/reservations/update', { method: 'POST', body: { id, ...draft } });
}

export function cancelReservation(id: string) {
  return api<{ reservations: Reservation[] }>('/reservations/cancel', { method: 'POST', body: { id } });
}

export function decideReservation(id: string, decision: 'validee' | 'refusee') {
  return api<{ reservations: Reservation[] }>('/reservations/decision', { method: 'POST', body: { id, decision } });
}

export function reservationLabel(status: ReservationStatus) {
  if (status === 'en_attente') return 'À confirmer';
  if (status === 'validee') return 'Validée';
  if (status === 'refusee') return 'Refusée';
  return 'Annulée';
}
