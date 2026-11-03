import cors from 'cors';
import express, { type Request, type Response } from 'express';

import type { StatutReservation } from '../modeles/Reservation.ts';
import { AuthService } from '../services/AuthService.ts';
import { BaseDeDonnees } from '../services/BaseDeDonnees.ts';

export class Application {
  private readonly base: BaseDeDonnees;
  private readonly auth: AuthService;

  constructor(base: BaseDeDonnees, auth: AuthService) {
    this.base = base;
    this.auth = auth;
  }

  express() {
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.get('/health', (_req, res) => {
      res.json({ ok: true });
    });
    app.post('/auth/login', (req, res) => this.connecter(req, res));
    app.get('/auth/me', (req, res) => this.moi(req, res));
    app.post('/auth/logout', (req, res) => this.deconnecter(req, res));
    app.get('/attendance', (req, res) => this.registre(req, res));
    app.post('/attendance/calls', (req, res) => this.appel(req, res));
    app.post('/attendance/calls/corrections', (req, res) => this.correction(req, res));
    app.post('/attendance/justifications', (req, res) => this.justificatif(req, res));
    app.post('/attendance/reviews', (req, res) => this.decision(req, res));
    app.post('/attendance/sessions', (req, res) => this.seance(req, res));
    app.post('/attendance/sessions/cancel', (req, res) => this.annulation(req, res));
    app.post('/attendance/students', (req, res) => this.etudiant(req, res));
    app.post('/attendance/teachers', (req, res) => this.enseignant(req, res));
    app.get('/rooms', (req, res) => this.salles(req, res));
    app.post('/rooms', (req, res) => this.creerSalle(req, res));
    app.post('/rooms/update', (req, res) => this.modifierSalle(req, res));
    app.post('/rooms/delete', (req, res) => this.supprimerSalle(req, res));
    app.get('/reservations', (req, res) => this.reservations(req, res));
    app.post('/reservations', (req, res) => this.reserver(req, res));
    app.post('/reservations/update', (req, res) => this.modifierReservation(req, res));
    app.post('/reservations/cancel', (req, res) => this.annulerReservation(req, res));
    app.post('/reservations/decision', (req, res) => this.trancherReservation(req, res));
    return app;
  }

  private async connecter(req: Request, res: Response) {
    const login = typeof req.body?.login === 'string' ? req.body.login : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const resultat = await this.auth.connecter(login, password);
    if (!resultat.ok) {
      res.status(resultat.statut).json({ message: resultat.message });
      return;
    }
    res.json({ token: resultat.token, user: resultat.utilisateur });
  }

  private async moi(req: Request, res: Response) {
    const utilisateur = await this.auth.courant(this.jeton(req));
    if (!utilisateur) {
      res.status(401).json({ message: 'Connexion requise.' });
      return;
    }
    res.json({ user: utilisateur });
  }

  private async deconnecter(req: Request, res: Response) {
    await this.auth.deconnecter(this.jeton(req));
    res.json({ ok: true });
  }

  private async registre(req: Request, res: Response) {
    if (!(await this.auth.courant(this.jeton(req)))) {
      res.status(401).json({ message: 'Connexion requise.' });
      return;
    }
    res.json({ data: await this.base.lireRegistre() });
  }

  private async appel(req: Request, res: Response) {
    const utilisateur = await this.auth.courant(this.jeton(req));
    if (!utilisateur) return this.refus(res);
    const sessionId = typeof req.body?.sessionId === 'string' ? req.body.sessionId : '';
    const absents = Array.isArray(req.body?.absentStudentIds) ? req.body.absentStudentIds.filter((item: unknown) => typeof item === 'string') : [];
    const registre = await this.base.lireRegistre();
    const seance = registre.seanceParId(sessionId);
    if (!seance || !utilisateur.enseigne(seance)) {
      res.status(403).json({ message: 'Cette séance n’est pas dans votre service.' });
      return;
    }
    const presents = new Set(registre.etudiantsDuGroupe(seance.groupId).map((item) => item.id));
    const suivant = registre.enregistrerAppel(sessionId, absents.filter((id: string) => presents.has(id)));
    if (suivant === registre) {
      res.status(409).json({ message: 'Cette séance a déjà été appelée.' });
      return;
    }
    await this.base.ecrireRegistre(suivant);
    res.json({ data: suivant });
  }

  private async justificatif(req: Request, res: Response) {
    const utilisateur = await this.auth.courant(this.jeton(req));
    if (!utilisateur) return this.refus(res);
    const absenceId = typeof req.body?.absenceId === 'string' ? req.body.absenceId : '';
    const motif = typeof req.body?.reason === 'string' ? req.body.reason : '';
    const registre = await this.base.lireRegistre();
    const absence = registre.absences.find((item) => item.id === absenceId) ?? null;
    if (!absence || !utilisateur.concerne(absence)) {
      res.status(403).json({ message: 'Ce justificatif ne vous concerne pas.' });
      return;
    }
    const suivant = registre.deposerJustificatif(absenceId, motif);
    if (suivant === registre) {
      const peutDeposer = absence.status === 'a_justifier' || absence.status === 'refusee';
      res.status(peutDeposer ? 400 : 409).json({
        message: peutDeposer ? 'Décrivez le motif en au moins quelques mots.' : 'Ce justificatif ne peut plus être déposé.',
      });
      return;
    }
    await this.base.ecrireRegistre(suivant);
    res.json({ data: suivant });
  }

  private async decision(req: Request, res: Response) {
    const utilisateur = await this.auth.courant(this.jeton(req));
    if (!utilisateur) return this.refus(res);
    const absenceId = typeof req.body?.absenceId === 'string' ? req.body.absenceId : '';
    const choix = req.body?.decision === 'justifiee' || req.body?.decision === 'refusee' ? req.body.decision : null;
    const commentaire = typeof req.body?.comment === 'string' ? req.body.comment : '';
    if (!choix) {
      res.status(400).json({ message: 'Décision inconnue.' });
      return;
    }
    if (choix === 'refusee' && commentaire.trim().length < 8) {
      res.status(400).json({ message: 'Expliquez le refus en quelques mots.' });
      return;
    }
    const registre = await this.base.lireRegistre();
    const absence = registre.absences.find((item) => item.id === absenceId) ?? null;
    const seance = absence ? registre.seanceParId(absence.sessionId) : null;
    if (!absence || !seance || !utilisateur.enseigne(seance)) {
      res.status(403).json({ message: 'Ce dossier n’est pas à vous.' });
      return;
    }
    const suivant = registre.trancherJustificatif(absenceId, choix, commentaire);
    if (suivant === registre) {
      res.status(409).json({ message: 'Ce dossier n’est plus à trancher.' });
      return;
    }
    await this.base.ecrireRegistre(suivant);
    res.json({ data: suivant });
  }

  private async correction(req: Request, res: Response) {
    const utilisateur = await this.auth.courant(this.jeton(req));
    if (!utilisateur) return this.refus(res);
    const sessionId = typeof req.body?.sessionId === 'string' ? req.body.sessionId : '';
    const absents = Array.isArray(req.body?.absentStudentIds) ? req.body.absentStudentIds.filter((item: unknown) => typeof item === 'string') : [];
    const registre = await this.base.lireRegistre();
    const seance = registre.seanceParId(sessionId);
    if (!seance || !utilisateur.enseigne(seance)) {
      res.status(403).json({ message: 'Cette séance n’est pas dans votre service.' });
      return;
    }
    const presents = new Set(registre.etudiantsDuGroupe(seance.groupId).map((item) => item.id));
    const resultat = registre.corrigerAppel(sessionId, absents.filter((id: string) => presents.has(id)));
    if (resultat.erreur) {
      res.status(409).json({ message: resultat.erreur });
      return;
    }
    await this.base.ecrireRegistre(resultat.registre);
    res.json({ data: resultat.registre });
  }

  private async annulation(req: Request, res: Response) {
    const utilisateur = await this.auth.courant(this.jeton(req));
    if (!utilisateur) return this.refus(res);
    if (!utilisateur.admin) {
      res.status(403).json({ message: 'Seul l’administrateur peut annuler une séance.' });
      return;
    }
    const sessionId = typeof req.body?.sessionId === 'string' ? req.body.sessionId : '';
    const resultat = (await this.base.lireRegistre()).annulerSeance(sessionId);
    if (resultat.erreur) {
      res.status(400).json({ message: resultat.erreur });
      return;
    }
    await this.base.ecrireRegistre(resultat.registre);
    res.json({ data: resultat.registre });
  }

  private async seance(req: Request, res: Response) {
    const utilisateur = await this.auth.courant(this.jeton(req));
    if (!utilisateur) return this.refus(res);
    if (!utilisateur.admin) {
      res.status(403).json({ message: 'Seul l’administrateur peut planifier une séance.' });
      return;
    }
    const body = req.body ?? {};
    const texte = (valeur: unknown) => (typeof valeur === 'string' ? valeur : '');
    const registre = await this.base.lireRegistre();
    const resultat = registre.planifierSeance({
      course: texte(body.course),
      room: texte(body.room),
      date: texte(body.date),
      start: texte(body.start),
      end: texte(body.end),
      groupId: texte(body.groupId),
      teacherId: texte(body.teacherId),
    });
    if (resultat.erreur) {
      res.status(400).json({ message: resultat.erreur });
      return;
    }
    await this.base.ecrireRegistre(resultat.registre);
    res.json({ data: resultat.registre });
  }

  private async etudiant(req: Request, res: Response) {
    const utilisateur = await this.auth.courant(this.jeton(req));
    if (!utilisateur) return this.refus(res);
    if (!utilisateur.admin) {
      res.status(403).json({ message: 'Seul l’administrateur peut ajouter un étudiant.' });
      return;
    }
    const name = typeof req.body?.name === 'string' ? req.body.name : '';
    const groupName = typeof req.body?.groupName === 'string' ? req.body.groupName : '';
    const login = typeof req.body?.login === 'string' ? req.body.login : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const registre = await this.base.lireRegistre();
    const resultat = registre.ajouterEtudiant(name, groupName);
    if (resultat.erreur || !resultat.etudiant) {
      res.status(400).json({ message: resultat.erreur || 'Ajout impossible.' });
      return;
    }
    const probleme = await this.auth.problemeCompte(login, password);
    if (probleme) {
      res.status(400).json({ message: probleme });
      return;
    }
    await this.base.ecrireRegistre(resultat.registre);
    await this.auth.creerCompte({
      id: `account-${resultat.etudiant.id}`,
      login,
      password,
      name: resultat.etudiant.name,
      role: 'etudiant',
      subtitle: `Groupe ${resultat.etudiant.groupId}`,
      studentId: resultat.etudiant.id,
      teacherId: null,
    });
    res.json({ data: resultat.registre });
  }

  private async enseignant(req: Request, res: Response) {
    const utilisateur = await this.auth.courant(this.jeton(req));
    if (!utilisateur) return this.refus(res);
    if (!utilisateur.admin) {
      res.status(403).json({ message: 'Seul l’administrateur peut ajouter un enseignant.' });
      return;
    }
    const name = typeof req.body?.name === 'string' ? req.body.name : '';
    const login = typeof req.body?.login === 'string' ? req.body.login : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const registre = await this.base.lireRegistre();
    const resultat = registre.ajouterEnseignant(name);
    if (resultat.erreur || !resultat.enseignant) {
      res.status(400).json({ message: resultat.erreur || 'Ajout impossible.' });
      return;
    }
    const probleme = await this.auth.problemeCompte(login, password);
    if (probleme) {
      res.status(400).json({ message: probleme });
      return;
    }
    await this.base.ecrireRegistre(resultat.registre);
    await this.auth.creerCompte({
      id: `account-${resultat.enseignant.id}`,
      login,
      password,
      name: resultat.enseignant.name,
      role: 'enseignant',
      subtitle: 'Enseignant',
      studentId: null,
      teacherId: resultat.enseignant.id,
    });
    res.json({ data: resultat.registre });
  }

  private async salles(req: Request, res: Response) {
    const utilisateur = await this.personnel(req, res);
    if (!utilisateur) return;
    const capacite = Number(req.query.capacity ?? 0);
    const equipement = typeof req.query.equipment === 'string' ? req.query.equipment : '';
    const parc = await this.base.lireParc();
    res.json({ rooms: parc.filtrerSalles(Number.isFinite(capacite) ? capacite : 0, equipement) });
  }

  private async creerSalle(req: Request, res: Response) {
    const utilisateur = await this.personnel(req, res);
    if (!utilisateur) return;
    if (!utilisateur.admin) {
      res.status(403).json({ message: 'Seul l’administrateur peut ajouter une salle.' });
      return;
    }
    const parc = await this.base.lireParc();
    const resultat = parc.ajouterSalle(this.texte(req.body?.name), this.entier(req.body?.capacity), this.texte(req.body?.equipment));
    if (resultat.erreur) {
      res.status(400).json({ message: resultat.erreur });
      return;
    }
    await this.base.ecrireParc(resultat.parc);
    res.json({ rooms: resultat.parc.rooms });
  }

  private async modifierSalle(req: Request, res: Response) {
    const utilisateur = await this.personnel(req, res);
    if (!utilisateur) return;
    if (!utilisateur.admin) {
      res.status(403).json({ message: 'Seul l’administrateur peut modifier une salle.' });
      return;
    }
    const parc = await this.base.lireParc();
    const resultat = parc.modifierSalle(this.texte(req.body?.id), this.texte(req.body?.name), this.entier(req.body?.capacity), this.texte(req.body?.equipment));
    if (resultat.erreur) {
      res.status(400).json({ message: resultat.erreur });
      return;
    }
    await this.base.ecrireParc(resultat.parc);
    res.json({ rooms: resultat.parc.rooms });
  }

  private async supprimerSalle(req: Request, res: Response) {
    const utilisateur = await this.personnel(req, res);
    if (!utilisateur) return;
    if (!utilisateur.admin) {
      res.status(403).json({ message: 'Seul l’administrateur peut supprimer une salle.' });
      return;
    }
    const parc = await this.base.lireParc();
    const resultat = parc.supprimerSalle(this.texte(req.body?.id));
    if (resultat.erreur) {
      res.status(400).json({ message: resultat.erreur });
      return;
    }
    await this.base.ecrireParc(resultat.parc);
    res.json({ rooms: resultat.parc.rooms });
  }

  private async reservations(req: Request, res: Response) {
    const utilisateur = await this.personnel(req, res);
    if (!utilisateur) return;
    const roomId = typeof req.query.roomId === 'string' ? req.query.roomId : '';
    const subject = typeof req.query.subject === 'string' ? req.query.subject : '';
    const parc = await this.base.lireParc();
    res.json({ reservations: parc.filtrerReservations(roomId, subject), rooms: parc.rooms });
  }

  private async reserver(req: Request, res: Response) {
    const utilisateur = await this.personnel(req, res);
    if (!utilisateur) return;
    if (utilisateur.role !== 'enseignant' || !utilisateur.teacherId) {
      res.status(403).json({ message: 'Seul un enseignant peut réserver une salle.' });
      return;
    }
    const parc = await this.base.lireParc();
    const resultat = parc.reserver({
      roomId: this.texte(req.body?.roomId),
      teacherId: utilisateur.teacherId,
      subject: this.texte(req.body?.subject),
      date: this.texte(req.body?.date),
      start: this.texte(req.body?.start),
      end: this.texte(req.body?.end),
    });
    if (resultat.erreur) {
      res.status(400).json({ message: resultat.erreur });
      return;
    }
    await this.base.ecrireParc(resultat.parc);
    res.json({ reservations: resultat.parc.reservations });
  }

  private async modifierReservation(req: Request, res: Response) {
    const utilisateur = await this.personnel(req, res);
    if (!utilisateur) return;
    const parc = await this.base.lireParc();
    const resultat = parc.modifierReservation(this.texte(req.body?.id), utilisateur.teacherId ?? '', utilisateur.admin, {
      roomId: this.texte(req.body?.roomId),
      subject: this.texte(req.body?.subject),
      date: this.texte(req.body?.date),
      start: this.texte(req.body?.start),
      end: this.texte(req.body?.end),
    });
    if (resultat.erreur) {
      res.status(400).json({ message: resultat.erreur });
      return;
    }
    await this.base.ecrireParc(resultat.parc);
    res.json({ reservations: resultat.parc.reservations });
  }

  private async annulerReservation(req: Request, res: Response) {
    const utilisateur = await this.personnel(req, res);
    if (!utilisateur) return;
    const parc = await this.base.lireParc();
    const resultat = parc.annuler(this.texte(req.body?.id), utilisateur.teacherId ?? '', utilisateur.admin);
    if (resultat.erreur) {
      res.status(400).json({ message: resultat.erreur });
      return;
    }
    await this.base.ecrireParc(resultat.parc);
    res.json({ reservations: resultat.parc.reservations });
  }

  private async trancherReservation(req: Request, res: Response) {
    const utilisateur = await this.personnel(req, res);
    if (!utilisateur) return;
    if (!utilisateur.admin) {
      res.status(403).json({ message: 'Seul l’administrateur peut confirmer ou refuser une demande de salle.' });
      return;
    }
    const decision = this.texte(req.body?.decision) as StatutReservation;
    const parc = await this.base.lireParc();
    const resultat = parc.trancher(this.texte(req.body?.id), decision);
    if (resultat.erreur) {
      res.status(400).json({ message: resultat.erreur });
      return;
    }
    await this.base.ecrireParc(resultat.parc);
    res.json({ reservations: resultat.parc.reservations });
  }

  private async personnel(req: Request, res: Response) {
    const utilisateur = await this.auth.courant(this.jeton(req));
    if (!utilisateur) {
      this.refus(res);
      return null;
    }
    if (utilisateur.role === 'etudiant') {
      res.status(403).json({ message: 'Les salles sont réservées au personnel.' });
      return null;
    }
    return utilisateur;
  }

  private texte(valeur: unknown) {
    return typeof valeur === 'string' ? valeur : '';
  }

  private entier(valeur: unknown) {
    const nombre = typeof valeur === 'number' ? valeur : Number(valeur);
    return Number.isFinite(nombre) ? Math.trunc(nombre) : 0;
  }

  private refus(res: Response) {
    res.status(401).json({ message: 'Connexion requise.' });
  }

  private jeton(req: Request) {
    const header = req.header('authorization') ?? '';
    return header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  }
}
