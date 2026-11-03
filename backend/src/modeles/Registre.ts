import { Absence } from './Absence.ts';
import { Calendrier } from './Calendrier.ts';
import { Enseignant } from './Enseignant.ts';
import { Etudiant } from './Etudiant.ts';
import { Groupe } from './Groupe.ts';
import { Seance } from './Seance.ts';

export type BrouillonSeance = {
  course: string;
  room: string;
  date: string;
  start: string;
  end: string;
  groupId: string;
  teacherId: string;
};

export class Registre {
  readonly groups: Groupe[];
  readonly students: Etudiant[];
  readonly teachers: Enseignant[];
  readonly sessions: Seance[];
  readonly absences: Absence[];

  constructor(groups: Groupe[], students: Etudiant[], teachers: Enseignant[], sessions: Seance[], absences: Absence[]) {
    this.groups = groups;
    this.students = students;
    this.teachers = teachers;
    this.sessions = sessions;
    this.absences = absences;
  }

  seanceParId(sessionId: string) {
    return this.sessions.find((item) => item.id === sessionId) ?? null;
  }

  etudiantsDuGroupe(groupId: string) {
    return this.students.filter((item) => item.estDans(groupId));
  }

  enregistrerAppel(sessionId: string, absents: string[]) {
    const cible = this.seanceParId(sessionId);
    if (!cible || cible.called) return this;
    const deja = new Set(this.absences.filter((item) => item.sessionId === sessionId).map((item) => item.studentId));
    const creees = absents
      .filter((studentId, index, list) => list.indexOf(studentId) === index && !deja.has(studentId))
      .map((studentId) => Absence.ouverte(`abs-${sessionId}-${studentId}`, sessionId, studentId));
    return this.copie({
      sessions: this.sessions.map((item) => (item.id === sessionId ? item.marquerAppelee() : item)),
      absences: [...creees, ...this.absences],
    });
  }

  corrigerAppel(sessionId: string, absents: string[]): { registre: Registre; erreur: string } {
    const cible = this.seanceParId(sessionId);
    if (!cible || !cible.called) return { registre: this, erreur: 'Cette séance n’a pas encore été appelée.' };
    const voulus = absents.filter((studentId, index, list) => list.indexOf(studentId) === index);
    const voulu = new Set(voulus);
    const duCours = this.absences.filter((item) => item.sessionId === sessionId);
    const bloque = duCours.find((item) => !voulu.has(item.studentId) && item.status !== 'a_justifier');
    if (bloque) return { registre: this, erreur: 'Un justificatif déjà déposé ne peut pas être retiré.' };
    const identiques = duCours.length === voulus.length && duCours.every((item) => voulu.has(item.studentId));
    if (identiques) return { registre: this, erreur: 'L’appel est déjà dans cet état.' };
    const conserves = this.absences.filter((item) => item.sessionId !== sessionId || voulu.has(item.studentId));
    const deja = new Set(conserves.filter((item) => item.sessionId === sessionId).map((item) => item.studentId));
    const creees = voulus.filter((studentId) => !deja.has(studentId)).map((studentId) => Absence.ouverte(`abs-${sessionId}-${studentId}`, sessionId, studentId));
    return { registre: this.copie({ absences: [...creees, ...conserves] }), erreur: '' };
  }

  deposerJustificatif(absenceId: string, motif: string, maintenant = new Date()) {
    return this.mapperAbsence(absenceId, (item) => item.deposer(motif, maintenant));
  }

  trancherJustificatif(absenceId: string, decision: 'justifiee' | 'refusee', commentaire = '', maintenant = new Date()) {
    return this.mapperAbsence(absenceId, (item) => item.trancher(decision, maintenant, commentaire));
  }

  annulerSeance(sessionId: string): { registre: Registre; erreur: string } {
    const seance = this.seanceParId(sessionId);
    if (!seance) return { registre: this, erreur: 'Séance introuvable.' };
    if (seance.called) return { registre: this, erreur: 'Une séance déjà appelée ne peut pas être annulée.' };
    if (this.absences.some((item) => item.sessionId === sessionId)) return { registre: this, erreur: 'Cette séance a déjà des absences.' };
    return { registre: this.copie({ sessions: this.sessions.filter((item) => item.id !== sessionId) }), erreur: '' };
  }

  planifierSeance(brouillon: BrouillonSeance): { registre: Registre; erreur: string } {
    const course = brouillon.course.trim();
    const room = brouillon.room.trim();
    if (!course) return { registre: this, erreur: 'Indiquez le cours.' };
    if (!room) return { registre: this, erreur: 'Indiquez la salle.' };
    if (!Calendrier.dateValide(brouillon.date)) return { registre: this, erreur: 'La date doit être au format AAAA-MM-JJ.' };
    if (!Calendrier.heureValide(brouillon.start) || !Calendrier.heureValide(brouillon.end) || brouillon.start >= brouillon.end) {
      return { registre: this, erreur: 'Indiquez une heure de début et une heure de fin valides, au format HH:MM.' };
    }
    if (!this.groups.some((item) => item.id === brouillon.groupId)) return { registre: this, erreur: 'Choisissez un groupe.' };
    if (!this.teachers.some((item) => item.id === brouillon.teacherId)) return { registre: this, erreur: 'Choisissez un enseignant.' };
    const conflit = this.sessions.some((item) => item.occupe(brouillon.groupId, brouillon.date, brouillon.start, brouillon.end));
    if (conflit) return { registre: this, erreur: 'Ce groupe a déjà une séance sur ce créneau.' };
    const creee = Seance.prevue(
      `session-${Date.now()}`,
      course,
      room,
      brouillon.date,
      brouillon.start,
      brouillon.end,
      brouillon.groupId,
      brouillon.teacherId,
    );
    return { registre: this.copie({ sessions: [...this.sessions, creee] }), erreur: '' };
  }

  ajouterEtudiant(name: string, groupName: string): { registre: Registre; erreur: string; etudiant: Etudiant | null } {
    const nom = name.trim();
    if (!nom) return { registre: this, erreur: 'Indiquez le nom de l’étudiant.', etudiant: null };
    const groupe = this.groups.find((item) => item.porteLeNom(groupName));
    if (!groupe) return { registre: this, erreur: 'Groupe inconnu. Utilisez GL1, GL2 ou GL3.', etudiant: null };
    const etudiant = Etudiant.creer(`stu-${Date.now()}`, nom, groupe.id);
    return { registre: this.copie({ students: [etudiant, ...this.students] }), erreur: '', etudiant };
  }

  ajouterEnseignant(name: string): { registre: Registre; erreur: string; enseignant: Enseignant | null } {
    const nom = name.trim();
    if (!nom) return { registre: this, erreur: 'Indiquez le nom de l’enseignant.', enseignant: null };
    const enseignant = Enseignant.creer(`teacher-${Date.now()}`, nom);
    return { registre: this.copie({ teachers: [enseignant, ...this.teachers] }), erreur: '', enseignant };
  }

  avecGroupe(groupe: Groupe) {
    if (this.groups.some((item) => item.id === groupe.id)) return this;
    return this.copie({ groups: [...this.groups, groupe] });
  }

  avecEtudiants(etudiants: Etudiant[]) {
    const ajouts = etudiants.filter((etudiant) => !this.students.some((item) => item.id === etudiant.id));
    if (ajouts.length === 0) return this;
    return this.copie({ students: [...this.students, ...ajouts] });
  }

  avecEnseignants(enseignants: Enseignant[]) {
    const ajouts = enseignants.filter((enseignant) => !this.teachers.some((item) => item.id === enseignant.id));
    if (ajouts.length === 0) return this;
    return this.copie({ teachers: [...this.teachers, ...ajouts] });
  }

  avecSeances(seances: Seance[]) {
    const ajouts = seances.filter((seance) => !this.sessions.some((item) => item.id === seance.id));
    if (ajouts.length === 0) return this;
    return this.copie({ sessions: [...this.sessions, ...ajouts] });
  }

  private mapperAbsence(absenceId: string, update: (item: Absence) => Absence | null) {
    let changed = false;
    const absences = this.absences.map((item) => {
      if (item.id !== absenceId) return item;
      const next = update(item);
      if (!next) return item;
      changed = true;
      return next;
    });
    return changed ? this.copie({ absences }) : this;
  }

  private copie(partiel: { groups?: Groupe[]; students?: Etudiant[]; teachers?: Enseignant[]; sessions?: Seance[]; absences?: Absence[] }) {
    return new Registre(
      partiel.groups ?? this.groups,
      partiel.students ?? this.students,
      partiel.teachers ?? this.teachers,
      partiel.sessions ?? this.sessions,
      partiel.absences ?? this.absences,
    );
  }
}
