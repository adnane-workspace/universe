export type Role = 'enseignant' | 'etudiant' | 'admin';

export class Utilisateur {
  readonly id: string;
  readonly login: string;
  readonly firstName: string;
  readonly name: string;
  readonly initials: string;
  readonly role: Role;
  readonly subtitle: string;
  readonly studentId: string | null;
  readonly teacherId: string | null;

  constructor(
    id: string,
    login: string,
    firstName: string,
    name: string,
    initials: string,
    role: Role,
    subtitle: string,
    studentId: string | null,
    teacherId: string | null,
  ) {
    this.id = id;
    this.login = login;
    this.firstName = firstName;
    this.name = name;
    this.initials = initials;
    this.role = role;
    this.subtitle = subtitle;
    this.studentId = studentId;
    this.teacherId = teacherId;
  }

  enseigne(seance: { teacherId: string }) {
    return this.role === 'enseignant' && seance.teacherId === this.teacherId;
  }

  concerne(absence: { studentId: string }) {
    return this.role === 'etudiant' && absence.studentId === this.studentId;
  }

  get admin() {
    return this.role === 'admin';
  }
}

export class Compte extends Utilisateur {
  readonly password: string;

  constructor(
    id: string,
    login: string,
    password: string,
    firstName: string,
    name: string,
    initials: string,
    role: Role,
    subtitle: string,
    studentId: string | null,
    teacherId: string | null,
  ) {
    super(id, login, firstName, name, initials, role, subtitle, studentId, teacherId);
    this.password = password;
  }

  sansMotDePasse() {
    return new Utilisateur(
      this.id,
      this.login,
      this.firstName,
      this.name,
      this.initials,
      this.role,
      this.subtitle,
      this.studentId,
      this.teacherId,
    );
  }
}
