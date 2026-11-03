export type StatutReservation = 'en_attente' | 'validee' | 'refusee' | 'annulee';

export class Reservation {
  readonly id: string;
  readonly roomId: string;
  readonly teacherId: string;
  readonly subject: string;
  readonly date: string;
  readonly start: string;
  readonly end: string;
  readonly status: StatutReservation;

  constructor(
    id: string,
    roomId: string,
    teacherId: string,
    subject: string,
    date: string,
    start: string,
    end: string,
    status: StatutReservation,
  ) {
    this.id = id;
    this.roomId = roomId;
    this.teacherId = teacherId;
    this.subject = subject;
    this.date = date;
    this.start = start;
    this.end = end;
    this.status = status;
  }

  occupe(roomId: string, date: string, start: string, end: string) {
    if (this.roomId !== roomId || this.date !== date) return false;
    if (this.status === 'refusee' || this.status === 'annulee') return false;
    return this.start < end && start < this.end;
  }

  avec(partiel: { roomId?: string; subject?: string; date?: string; start?: string; end?: string; status?: StatutReservation }) {
    return new Reservation(
      this.id,
      partiel.roomId ?? this.roomId,
      this.teacherId,
      partiel.subject ?? this.subject,
      partiel.date ?? this.date,
      partiel.start ?? this.start,
      partiel.end ?? this.end,
      partiel.status ?? this.status,
    );
  }
}
