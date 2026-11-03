import { Etudiant } from '../modeles/Etudiant.ts';
import { Compte, Utilisateur, type Role } from '../modeles/Utilisateur.ts';
import { BaseDeDonnees } from './BaseDeDonnees.ts';

export class AuthService {
  private readonly base: BaseDeDonnees;

  constructor(base: BaseDeDonnees) {
    this.base = base;
  }

  async connecter(login: string, password: string) {
    const identifiant = login.trim();
    if (!identifiant || !password) {
      return { ok: false as const, statut: 400, message: 'Renseignez l’identifiant et le mot de passe.' };
    }
    const compte = await this.base.compteParIdentifiant(identifiant);
    if (!compte || !this.base.verifierMotDePasse(password, compte.passwordHash)) {
      return { ok: false as const, statut: 401, message: 'Identifiant ou mot de passe incorrect.' };
    }
    const token = await this.base.ouvrirSession(compte.id);
    return { ok: true as const, token, utilisateur: this.versUtilisateur(compte) };
  }

  async courant(token: string) {
    if (!token) return null;
    const compte = await this.base.utilisateurDuJeton(token);
    return compte ? this.versUtilisateur(compte) : null;
  }

  async deconnecter(token: string) {
    if (token) await this.base.fermerSession(token);
  }

  async problemeCompte(login: string, password: string) {
    const identifiant = login.trim();
    if (!identifiant) return 'Indiquez un identifiant de connexion.';
    if (password.trim().length < 6) return 'Le mot de passe doit contenir au moins 6 caractères.';
    if (await this.base.identifiantPris(identifiant)) return 'Cet identifiant est déjà utilisé.';
    return '';
  }

  async creerCompte(input: { id: string; login: string; password: string; name: string; role: Role; subtitle: string; studentId: string | null; teacherId: string | null }) {
    const parts = input.name.trim().split(/\s+/);
    await this.base.enregistrerCompte(
      new Compte(
        input.id,
        input.login,
        input.password,
        parts[0] ?? input.name,
        input.name.trim(),
        Etudiant.initiales(input.name),
        input.role,
        input.subtitle,
        input.studentId,
        input.teacherId,
      ),
    );
  }

  private versUtilisateur(compte: { id: string; login: string; firstName: string; name: string; initials: string; role: string; subtitle: string; studentId: string | null; teacherId: string | null }) {
    return new Utilisateur(
      compte.id,
      compte.login,
      compte.firstName,
      compte.name,
      compte.initials,
      compte.role as Role,
      compte.subtitle,
      compte.studentId,
      compte.teacherId,
    );
  }
}
