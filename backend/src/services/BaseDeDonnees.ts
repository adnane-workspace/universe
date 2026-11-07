import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient, type Client } from '@libsql/client';
import { eq } from 'drizzle-orm';
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';

import { Absence, type StatutAbsence } from '../modeles/Absence.ts';
import { Demonstration } from '../modeles/Demonstration.ts';
import { Enseignant } from '../modeles/Enseignant.ts';
import { Etudiant } from '../modeles/Etudiant.ts';
import { Groupe } from '../modeles/Groupe.ts';
import { Registre } from '../modeles/Registre.ts';
import { Seance } from '../modeles/Seance.ts';
import { Compte, type Role } from '../modeles/Utilisateur.ts';
import { MotDePasse } from './MotDePasse.ts';
import * as schema from '../schema.ts';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  login TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  name TEXT NOT NULL,
  initials TEXT NOT NULL,
  role TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  student_id TEXT,
  teacher_id TEXT
);
CREATE TABLE IF NOT EXISTS auth_tokens (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS teachers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  initials TEXT NOT NULL,
  group_id TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS course_sessions (
  id TEXT PRIMARY KEY,
  course TEXT NOT NULL,
  room TEXT NOT NULL,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  group_id TEXT NOT NULL,
  teacher_id TEXT NOT NULL,
  called INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS absences (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  status TEXT NOT NULL,
  reason TEXT,
  submitted_at TEXT,
  reviewed_at TEXT,
  comment TEXT,
  piece TEXT,
  piece_type TEXT
);
`;

type Database = LibSQLDatabase<typeof schema>;

export class BaseDeDonnees {
  private client: Client | null = null;
  private orm: Database | null = null;
  private readonly mots = new MotDePasse();

  async ouvrir() {
    const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
    const directory = path.join(root, 'data');
    mkdirSync(directory, { recursive: true });
    const file = path.join(directory, 'unipresence.db').replace(/\\/g, '/');
    this.client = createClient({ url: `file:${file}` });
    this.orm = drizzle(this.client, { schema });
    await this.client.executeMultiple(SCHEMA);
    await this.assurerColonneMotif();
    await this.assurerColonneCommentaire();
    await this.assurerColonnePiece();
    await this.semerSiVide();
    await this.completerMotifs();
    await this.assurerSeancesAVenir();
    await this.assurerGi4();
    await this.assurerNabil();
    await this.assurerPersonnes();
    await this.client.execute('DROP TABLE IF EXISTS reservations');
    await this.client.execute('DROP TABLE IF EXISTS rooms');
    return this;
  }

  connexion() {
    if (!this.orm) throw new Error('Base non ouverte');
    return this.orm;
  }

  async lireRegistre() {
    const db = this.connexion();
    const [groupes, enseignants, etudiants, seances, absences] = await Promise.all([
      db.select().from(schema.groups),
      db.select().from(schema.teachers),
      db.select().from(schema.students),
      db.select().from(schema.courseSessions),
      db.select().from(schema.absences),
    ]);
    return new Registre(
      groupes.map((item) => new Groupe(item.id, item.name)),
      etudiants.map((item) => new Etudiant(item.id, item.name, item.initials, item.groupId)),
      enseignants.map((item) => new Enseignant(item.id, item.name)),
      seances.map((item) => new Seance(item.id, item.course, item.room, item.date, item.start, item.end, item.groupId, item.teacherId, item.called)),
      absences.map((item) => new Absence(item.id, item.sessionId, item.studentId, item.status as StatutAbsence, item.reason, item.submittedAt, item.reviewedAt, item.comment, item.piece, item.pieceType)),
    );
  }

  async ecrireRegistre(registre: Registre) {
    const db = this.connexion();
    await db.transaction(async (tx) => {
      await tx.delete(schema.absences);
      await tx.delete(schema.courseSessions);
      await tx.delete(schema.students);
      await tx.delete(schema.teachers);
      await tx.delete(schema.groups);
      if (registre.groups.length > 0) {
        await tx.insert(schema.groups).values(registre.groups.map((item) => ({ id: item.id, name: item.name })));
      }
      if (registre.teachers.length > 0) {
        await tx.insert(schema.teachers).values(registre.teachers.map((item) => ({ id: item.id, name: item.name })));
      }
      if (registre.students.length > 0) {
        await tx.insert(schema.students).values(registre.students.map((item) => ({ id: item.id, name: item.name, initials: item.initials, groupId: item.groupId })));
      }
      if (registre.sessions.length > 0) {
        await tx.insert(schema.courseSessions).values(
          registre.sessions.map((item) => ({
            id: item.id,
            course: item.course,
            room: item.room,
            date: item.date,
            start: item.start,
            end: item.end,
            groupId: item.groupId,
            teacherId: item.teacherId,
            called: item.called,
          })),
        );
      }
      if (registre.absences.length > 0) {
        await tx.insert(schema.absences).values(
          registre.absences.map((item) => ({
            id: item.id,
            sessionId: item.sessionId,
            studentId: item.studentId,
            status: item.status,
            reason: item.reason,
            submittedAt: item.submittedAt,
            reviewedAt: item.reviewedAt,
            comment: item.comment,
            piece: item.piece,
            pieceType: item.pieceType,
          })),
        );
      }
    });
  }

  async enregistrerCompte(compte: Compte) {
    const parts = compte.name.trim().split(/\s+/);
    await this.connexion().insert(schema.users).values({
      id: compte.id,
      login: compte.login.trim(),
      passwordHash: this.mots.empreinte(compte.password),
      firstName: parts[0] ?? compte.name,
      name: compte.name.trim(),
      initials: compte.initials,
      role: compte.role,
      subtitle: compte.subtitle,
      studentId: compte.studentId,
      teacherId: compte.teacherId,
    });
  }

  async compteParIdentifiant(login: string) {
    const db = this.connexion();
    const [exact] = await db.select().from(schema.users).where(eq(schema.users.login, login)).limit(1);
    if (exact) return exact;
    const tous = await db.select().from(schema.users);
    return tous.find((item) => item.login.toLowerCase() === login.toLowerCase()) ?? null;
  }

  async identifiantPris(login: string) {
    const tous = await this.connexion().select().from(schema.users);
    return tous.some((item) => item.login.toLowerCase() === login.toLowerCase());
  }

  async ouvrirSession(userId: string) {
    const token = this.mots.jeton();
    await this.connexion().insert(schema.authTokens).values({ token, userId, createdAt: new Date().toISOString() });
    return token;
  }

  async fermerSession(token: string) {
    await this.connexion().delete(schema.authTokens).where(eq(schema.authTokens.token, token));
  }

  async utilisateurDuJeton(token: string) {
    const db = this.connexion();
    const [session] = await db.select().from(schema.authTokens).where(eq(schema.authTokens.token, token)).limit(1);
    if (!session) return null;
    const [compte] = await db.select().from(schema.users).where(eq(schema.users.id, session.userId)).limit(1);
    return compte ?? null;
  }

  verifierMotDePasse(clair: string, empreinte: string) {
    return this.mots.verifie(clair, empreinte);
  }

  private async assurerColonneMotif() {
    try {
      await this.client?.execute('ALTER TABLE absences ADD COLUMN reason TEXT');
    } catch {
      // La colonne existe déjà sur une base ouverte avant cette version.
    }
  }

  private async assurerColonneCommentaire() {
    try {
      await this.client?.execute('ALTER TABLE absences ADD COLUMN comment TEXT');
    } catch {
      // La colonne existe déjà sur une base ouverte avant cette version.
    }
  }

  private async assurerColonnePiece() {
    for (const colonne of ['piece TEXT', 'piece_type TEXT']) {
      try {
        await this.client?.execute(`ALTER TABLE absences ADD COLUMN ${colonne}`);
      } catch {
        // La colonne existe déjà sur une base ouverte avant cette version.
      }
    }
  }

  private async completerMotifs() {
    const notes: [string, string][] = [
      ['abs-yacouba-review', 'Certificat médical pour une consultation.'],
      ['abs-gl3-b', 'Retard de train, justificatif SNCF.'],
      ['abs-aminata-ok', 'Convocation administrative.'],
      ['abs-aminata-old', 'Absence pour raison familiale.'],
      ['abs-gl1', 'Rendez-vous médical.'],
    ];
    for (const [id, reason] of notes) {
      await this.client?.execute({
        sql: "UPDATE absences SET reason = ? WHERE id = ? AND (reason IS NULL OR reason = '')",
        args: [reason, id],
      });
    }
  }

  private async assurerPersonnes() {
    const db = this.connexion();
    await db.update(schema.students).set({ name: 'Adnane El Menouar', initials: 'AE' }).where(eq(schema.students.id, 'gi4-22'));
    await db.update(schema.users).set({ firstName: 'Lahlou', name: 'Lahlou Aziz', initials: 'LA' }).where(eq(schema.users.id, 'admin-diallo'));
    const compte = Demonstration.comptes().find((item) => item.id === 'student-menouar');
    if (!compte) return;
    const [existant] = await db.select().from(schema.users).where(eq(schema.users.id, compte.id)).limit(1);
    if (!existant) await this.enregistrerCompte(compte);
  }

  private async assurerGi4() {
    const registre = await this.lireRegistre();
    const suivant = registre
      .avecGroupe(new Groupe('GI4A', 'GI 4A'))
      .avecEtudiants(Demonstration.etudiantsGi4())
      .avecEnseignants(Demonstration.enseignantsGi4())
      .avecSeances(Demonstration.seancesGi4());
    if (suivant !== registre) await this.ecrireRegistre(suivant);
    const compte = Demonstration.comptes().find((item) => item.id === 'teacher-elakkad');
    if (!compte) return;
    const [existant] = await this.connexion().select().from(schema.users).where(eq(schema.users.login, compte.login)).limit(1);
    if (existant) return;
    await this.enregistrerCompte(compte);
  }

  private async assurerNabil() {
    const registre = await this.lireRegistre();
    const suivant = registre.avecSeances(Demonstration.seancesNabil()).avecAbsences(Demonstration.absencesNabil());
    if (suivant !== registre) await this.ecrireRegistre(suivant);
  }

  private async assurerSeancesAVenir() {
    const registre = await this.lireRegistre();
    const suivant = registre.avecSeances(Demonstration.seancesAVenir());
    if (suivant === registre) return;
    await this.ecrireRegistre(suivant);
  }

  private async semerSiVide() {
    const existants = await this.connexion().select().from(schema.users).limit(1);
    if (existants.length > 0) return;
    for (const compte of Demonstration.comptes()) await this.enregistrerCompte(compte);
    await this.ecrireRegistre(Demonstration.registre());
  }
}

export type { Role };
