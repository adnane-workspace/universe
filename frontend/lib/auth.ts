export type Role = 'enseignant' | 'etudiant' | 'admin';

export type AuthUser = {
  id: string;
  login: string;
  firstName: string;
  name: string;
  initials: string;
  role: Role;
  subtitle: string;
  studentId: string | null;
  teacherId: string | null;
};

type Account = AuthUser & { password: string };

const accounts: Account[] = [
  {
    id: 'teacher-durand',
    login: 'p.durand@univ-lumiere.fr',
    password: 'Lumiere2026',
    firstName: 'Pierre',
    name: 'Pierre Durand',
    initials: 'PD',
    role: 'enseignant',
    subtitle: 'Groupe GL2 · Développement mobile',
    studentId: null,
    teacherId: 'teacher-durand',
  },
  {
    id: 'student-menouar',
    login: 'a.elmenouar',
    password: 'Etudiant2026',
    firstName: 'Adnane',
    name: 'Adnane El Menouar',
    initials: 'AE',
    role: 'etudiant',
    subtitle: 'Groupe GI 4A · Génie logiciel',
    studentId: 'gi4-22',
    teacherId: null,
  },
  {
    id: 'teacher-elakkad',
    login: 'n.elakkad@univ-lumiere.fr',
    password: 'Elakkad2026',
    firstName: 'Nabil',
    name: 'Nabil El Akkad',
    initials: 'NA',
    role: 'enseignant',
    subtitle: 'GI 4A · Génie logiciel et design patterns',
    studentId: null,
    teacherId: 'teacher-elakkad',
  },
  {
    id: 'admin-diallo',
    login: 'adm.direction',
    password: 'Admin2026',
    firstName: 'Lahlou',
    name: 'Lahlou Aziz',
    initials: 'LA',
    role: 'admin',
    subtitle: 'Direction des études',
    studentId: null,
    teacherId: null,
  },
];

const roleLabel: Record<Role, string> = {
  enseignant: 'Enseignant',
  etudiant: 'Étudiant',
  admin: 'Admin',
};

export const developmentLogins = accounts.map((account) => ({
  role: roleLabel[account.role],
  login: account.login,
  password: account.password,
}));

export const homeForRole: Record<Role, '/teacher' | '/student' | '/admin'> = {
  enseignant: '/teacher',
  etudiant: '/student',
  admin: '/admin',
};

export function accountsForSeed() {
  return accounts.map((account) => ({ ...account }));
}

export function accountById(id: string): AuthUser | null {
  const account = accounts.find((item) => item.id === id);
  return account ? toUser(account) : null;
}

export function authenticate(login: string, password: string): AuthUser | null {
  const typedLogin = login.trim().toLowerCase();
  const typedPassword = password;
  const account = accounts.find((item) => item.login.toLowerCase() === typedLogin);
  if (!account || !sameSecret(account.password, typedPassword)) {
    return null;
  }
  return toUser(account);
}

function toUser(account: Account): AuthUser {
  return {
    id: account.id,
    login: account.login,
    firstName: account.firstName,
    name: account.name,
    initials: account.initials,
    role: account.role,
    subtitle: account.subtitle,
    studentId: account.studentId,
    teacherId: account.teacherId,
  };
}

function sameSecret(expected: string, given: string) {
  const left = expected;
  const right = given;
  const length = Math.max(left.length, right.length);
  let diff = left.length === right.length ? 0 : 1;
  for (let index = 0; index < length; index += 1) {
    diff |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }
  return diff === 0;
}
