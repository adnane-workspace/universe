import { Calendrier } from './Calendrier.ts';

export type StatutAbsence = 'a_justifier' | 'envoye' | 'justifiee' | 'refusee';

export class Absence {
  readonly id: string;
  readonly sessionId: string;
  readonly studentId: string;
  readonly status: StatutAbsence;
  readonly reason: string | null;
  readonly submittedAt: string | null;
  readonly reviewedAt: string | null;

  readonly comment: string | null;

  constructor(
    id: string,
    sessionId: string,
    studentId: string,
    status: StatutAbsence,
    reason: string | null,
    submittedAt: string | null,
    reviewedAt: string | null,
    comment: string | null = null,
  ) {
    this.id = id;
    this.sessionId = sessionId;
    this.studentId = studentId;
    this.status = status;
    this.reason = reason;
    this.submittedAt = submittedAt;
    this.reviewedAt = reviewedAt;
    this.comment = comment;
  }

  static ouverte(id: string, sessionId: string, studentId: string) {
    return new Absence(id, sessionId, studentId, 'a_justifier', null, null, null);
  }

  static depuis(
    id: string,
    sessionId: string,
    studentId: string,
    status: StatutAbsence,
    revueLe: string | null = null,
    motif: string | null = null,
  ) {
    return new Absence(
      id,
      sessionId,
      studentId,
      status,
      status === 'a_justifier' ? null : motif,
      status === 'a_justifier' ? null : revueLe,
      status === 'justifiee' || status === 'refusee' ? revueLe : null,
    );
  }

  static readonly delaiJours = 7;

  static readonly motifs = new Map<string, number>([
    ['Médical', 15],
    ['Administratif', 12],
    ['Transport', 12],
    ['Familial', 12],
    ['Autre', 20],
  ]);

  static echeance(dateSeance: string) {
    const [annee, mois, jour] = dateSeance.split('-').map(Number);
    const date = new Date(annee, mois - 1, jour + Absence.delaiJours);
    const moisTexte = String(date.getMonth() + 1).padStart(2, '0');
    const jourTexte = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${moisTexte}-${jourTexte}`;
  }

  static dansLeDelai(dateSeance: string, maintenant: Date) {
    return Calendrier.decaler(maintenant, 0) <= Absence.echeance(dateSeance);
  }

  static motifValide(motif: string) {
    const texte = motif.trim();
    const separateur = texte.indexOf(' — ');
    if (separateur < 1) return false;
    const type = texte.slice(0, separateur);
    const detail = texte.slice(separateur + 3).trim();
    const minimum = Absence.motifs.get(type);
    return minimum !== undefined && detail.length >= minimum;
  }

  deposer(motif: string, maintenant: Date) {
    const texte = motif.trim();
    if (!Absence.motifValide(texte) || (this.status !== 'a_justifier' && this.status !== 'refusee')) return null;
    return new Absence(this.id, this.sessionId, this.studentId, 'envoye', texte, maintenant.toISOString(), null, null);
  }

  trancher(decision: 'justifiee' | 'refusee', maintenant: Date, commentaire = '') {
    if (this.status !== 'envoye') return null;
    const note = commentaire.trim();
    if (decision === 'refusee' && note.length < 8) return null;
    return new Absence(this.id, this.sessionId, this.studentId, decision, this.reason, this.submittedAt, maintenant.toISOString(), note || null);
  }

  concerne(studentId: string) {
    return this.studentId === studentId;
  }
}
