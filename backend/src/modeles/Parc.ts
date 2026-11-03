import { Calendrier } from './Calendrier.ts';
import { Reservation, type StatutReservation } from './Reservation.ts';
import { Salle } from './Salle.ts';

export type BrouillonReservation = {
  roomId: string;
  teacherId: string;
  subject: string;
  date: string;
  start: string;
  end: string;
};

export class Parc {
  readonly rooms: Salle[];
  readonly reservations: Reservation[];

  constructor(rooms: Salle[], reservations: Reservation[]) {
    this.rooms = rooms;
    this.reservations = reservations;
  }

  filtrerSalles(capaciteMin: number, equipement: string) {
    return this.rooms
      .filter((salle) => salle.correspond(capaciteMin, equipement))
      .sort((gauche, droite) => gauche.name.localeCompare(droite.name, 'fr'));
  }

  filtrerReservations(roomId: string, matiere: string) {
    const cherche = matiere.trim().toLowerCase();
    return this.reservations
      .filter((item) => (roomId ? item.roomId === roomId : true))
      .filter((item) => (cherche ? item.subject.toLowerCase().includes(cherche) : true))
      .sort((gauche, droite) => `${gauche.date}${gauche.start}`.localeCompare(`${droite.date}${droite.start}`));
  }

  ajouterSalle(name: string, capacity: number, equipment: string) {
    const nom = name.trim();
    if (!nom) return { parc: this, erreur: 'Indiquez le nom de la salle.' };
    if (!Number.isInteger(capacity) || capacity < 1) return { parc: this, erreur: 'La capacité doit être un entier supérieur à 0.' };
    if (this.rooms.some((salle) => salle.porteLeNom(nom))) return { parc: this, erreur: 'Une salle porte déjà ce nom.' };
    const salle = new Salle(`room-${Date.now()}`, nom, capacity, equipment.trim());
    return { parc: this.copie({ rooms: [...this.rooms, salle] }), erreur: '' };
  }

  modifierSalle(id: string, name: string, capacity: number, equipment: string) {
    const nom = name.trim();
    if (!this.rooms.some((salle) => salle.id === id)) return { parc: this, erreur: 'Salle introuvable.' };
    if (!nom) return { parc: this, erreur: 'Indiquez le nom de la salle.' };
    if (!Number.isInteger(capacity) || capacity < 1) return { parc: this, erreur: 'La capacité doit être un entier supérieur à 0.' };
    if (this.rooms.some((salle) => salle.id !== id && salle.porteLeNom(nom))) return { parc: this, erreur: 'Une salle porte déjà ce nom.' };
    return {
      parc: this.copie({
        rooms: this.rooms.map((salle) => (salle.id === id ? new Salle(id, nom, capacity, equipment.trim()) : salle)),
      }),
      erreur: '',
    };
  }

  supprimerSalle(id: string) {
    if (!this.rooms.some((salle) => salle.id === id)) return { parc: this, erreur: 'Salle introuvable.' };
    const active = this.reservations.some((item) => item.roomId === id && item.status !== 'refusee' && item.status !== 'annulee');
    if (active) return { parc: this, erreur: 'Cette salle a encore une réservation. Annulez-la avant de supprimer la salle.' };
    return {
      parc: this.copie({
        rooms: this.rooms.filter((salle) => salle.id !== id),
        reservations: this.reservations.filter((item) => item.roomId !== id),
      }),
      erreur: '',
    };
  }

  reserver(brouillon: BrouillonReservation) {
    const erreur = this.creneauValide(brouillon);
    if (erreur) return { parc: this, erreur, reservation: null };
    if (this.reservations.some((item) => item.occupe(brouillon.roomId, brouillon.date, brouillon.start, brouillon.end))) {
      return { parc: this, erreur: 'Cette salle est déjà occupée sur ce créneau.', reservation: null };
    }
    const creee = new Reservation(
      `res-${Date.now()}`,
      brouillon.roomId,
      brouillon.teacherId,
      brouillon.subject.trim(),
      brouillon.date,
      brouillon.start,
      brouillon.end,
      'en_attente',
    );
    return { parc: this.copie({ reservations: [...this.reservations, creee] }), erreur: '', reservation: creee };
  }

  modifierReservation(id: string, teacherId: string, admin: boolean, brouillon: Omit<BrouillonReservation, 'teacherId'>) {
    const actuelle = this.reservations.find((item) => item.id === id);
    if (!actuelle) return { parc: this, erreur: 'Réservation introuvable.' };
    if (actuelle.status !== 'en_attente') return { parc: this, erreur: 'Seule une réservation en attente peut être modifiée.' };
    if (!admin && actuelle.teacherId !== teacherId) return { parc: this, erreur: 'Vous ne pouvez modifier que vos réservations.' };
    const erreur = this.creneauValide({ ...brouillon, teacherId: actuelle.teacherId });
    if (erreur) return { parc: this, erreur };
    const conflit = this.reservations.some((item) => item.id !== id && item.occupe(brouillon.roomId, brouillon.date, brouillon.start, brouillon.end));
    if (conflit) return { parc: this, erreur: 'Cette salle est déjà occupée sur ce créneau.' };
    return {
      parc: this.copie({
        reservations: this.reservations.map((item) => (item.id === id ? actuelle.avec({
          roomId: brouillon.roomId,
          subject: brouillon.subject.trim(),
          date: brouillon.date,
          start: brouillon.start,
          end: brouillon.end,
        }) : item)),
      }),
      erreur: '',
    };
  }

  annuler(id: string, teacherId: string, admin: boolean) {
    const actuelle = this.reservations.find((item) => item.id === id);
    if (!actuelle) return { parc: this, erreur: 'Réservation introuvable.' };
    if (!admin && actuelle.teacherId !== teacherId) return { parc: this, erreur: 'Vous ne pouvez annuler que vos propres réservations.' };
    if (actuelle.status === 'annulee' || actuelle.status === 'refusee') return { parc: this, erreur: 'Cette réservation est déjà close.' };
    return { parc: this.remplacer(id, actuelle.avec({ status: 'annulee' })), erreur: '' };
  }

  trancher(id: string, decision: StatutReservation) {
    const actuelle = this.reservations.find((item) => item.id === id);
    if (!actuelle) return { parc: this, erreur: 'Réservation introuvable.' };
    if (decision !== 'validee' && decision !== 'refusee') return { parc: this, erreur: 'Décision inconnue.' };
    if (actuelle.status !== 'en_attente') return { parc: this, erreur: 'Seule une réservation en attente peut être validée ou refusée.' };
    return { parc: this.remplacer(id, actuelle.avec({ status: decision })), erreur: '' };
  }

  private creneauValide(brouillon: BrouillonReservation) {
    if (!brouillon.subject.trim()) return 'Indiquez la matière.';
    if (!this.rooms.some((salle) => salle.id === brouillon.roomId)) return 'Choisissez une salle.';
    if (!Calendrier.dateValide(brouillon.date)) return 'La date doit être au format AAAA-MM-JJ.';
    if (!Calendrier.heureValide(brouillon.start) || !Calendrier.heureValide(brouillon.end) || brouillon.start >= brouillon.end) {
      return 'Indiquez une heure de début et une heure de fin valides, au format HH:MM.';
    }
    return '';
  }

  private remplacer(id: string, suivante: Reservation) {
    return this.copie({ reservations: this.reservations.map((item) => (item.id === id ? suivante : item)) });
  }

  private copie(partiel: { rooms?: Salle[]; reservations?: Reservation[] }) {
    return new Parc(partiel.rooms ?? this.rooms, partiel.reservations ?? this.reservations);
  }
}
