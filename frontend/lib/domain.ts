export type AbsenceStatus = 'a_justifier' | 'envoye' | 'justifiee' | 'refusee';

export type Group = { id: string; name: string };
export type Student = { id: string; name: string; initials: string; groupId: string };
export type Teacher = { id: string; name: string };
export type CourseSession = {
  id: string;
  course: string;
  room: string;
  date: string;
  start: string;
  end: string;
  groupId: string;
  teacherId: string;
  called: boolean;
};
export type Absence = {
  id: string;
  sessionId: string;
  studentId: string;
  status: AbsenceStatus;
  reason: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  comment: string | null;
};

export type SessionDraft = {
  course: string;
  room: string;
  date: string;
  start: string;
  end: string;
  groupId: string;
  teacherId: string;
};

export type AttendanceData = {
  groups: Group[];
  students: Student[];
  teachers: Teacher[];
  sessions: CourseSession[];
  absences: Absence[];
};

const OPEN_STATUSES: AbsenceStatus[] = ['a_justifier', 'envoye'];

export function createSeed(now = new Date()): AttendanceData {
  const groups: Group[] = [
    { id: 'GL1', name: 'GL1' },
    { id: 'GL2', name: 'GL2' },
    { id: 'GL3', name: 'GL3' },
    { id: 'GI4A', name: 'GI 4A' },
  ];
  const teachers: Teacher[] = [
    { id: 'teacher-durand', name: 'Pierre Durand' },
    { id: 'teacher-bernard', name: 'Claire Bernard' },
    { id: 'teacher-rossi', name: 'Marco Rossi' },
    ...gi4Teachers(),
  ];
  const students: Student[] = [
    student('stu-aminata', 'Aminata Mensah', 'GL2'),
    student('stu-yacouba', 'Yacouba Koné', 'GL2'),
    student('stu-fatou', 'Fatou Ndiaye', 'GL2'),
    student('stu-paul', 'Paul Bernard', 'GL2'),
    student('stu-sara', 'Sara Diop', 'GL2'),
    student('stu-lea', 'Léa Martin', 'GL2'),
    student('stu-gl1-a', 'Nadia Benali', 'GL1'),
    student('stu-gl1-b', 'Hugo Petit', 'GL1'),
    student('stu-gl1-c', 'Inès Morel', 'GL1'),
    student('stu-gl1-d', 'Adam Traoré', 'GL1'),
    student('stu-gl3-a', 'Chloé Roux', 'GL3'),
    student('stu-gl3-b', 'Malik Sow', 'GL3'),
    student('stu-gl3-c', 'Emma Bernard', 'GL3'),
    student('stu-gl3-d', 'Yanis Cohen', 'GL3'),
  ];

  const courses = ['Bases de données', 'Développement mobile', 'Génie logiciel'];
  const rooms = ['Salle A-112', 'Salle B-204', 'Salle C-018'];
  const sessions: CourseSession[] = [];
  const absences: Absence[] = [];

  for (let index = 1; index <= 8; index += 1) {
    const id = `gl2-past-${index}`;
    sessions.push({
      id,
      course: courses[index % 3],
      room: rooms[index % 3],
      date: shift(now, index * 3),
      start: '10:30',
      end: '12:30',
      groupId: 'GL2',
      teacherId: 'teacher-durand',
      called: true,
    });
  }
  absences.push(absence('abs-aminata-open', 'gl2-past-1', 'stu-aminata', 'a_justifier'));
  absences.push(absence('abs-aminata-ok', 'gl2-past-3', 'stu-aminata', 'justifiee', shift(now, 8), 'Convocation administrative.'));
  absences.push(absence('abs-aminata-old', 'gl2-past-6', 'stu-aminata', 'justifiee', shift(now, 16), 'Absence pour raison familiale.'));
  absences.push(absence('abs-yacouba-review', 'gl2-past-2', 'stu-yacouba', 'envoye', shift(now, 5), 'Certificat médical pour une consultation.'));

  sessions.push(
    {
      id: 'gl2-today-db',
      course: 'Bases de données',
      room: 'Salle A-112',
      date: shift(now, 0),
      start: '08:00',
      end: '10:00',
      groupId: 'GL2',
      teacherId: 'teacher-durand',
      called: true,
    },
    {
      id: 'gl2-today-mobile',
      course: 'Développement mobile',
      room: 'Salle B-204',
      date: shift(now, 0),
      start: '10:30',
      end: '12:30',
      groupId: 'GL2',
      teacherId: 'teacher-durand',
      called: false,
    },
    {
      id: 'gl2-today-gl',
      course: 'Génie logiciel',
      room: 'Salle C-018',
      date: shift(now, 0),
      start: '14:00',
      end: '16:00',
      groupId: 'GL2',
      teacherId: 'teacher-durand',
      called: false,
    },
    {
      id: 'gl1-past-1',
      course: 'Algorithmique',
      room: 'Salle D-010',
      date: shift(now, 4),
      start: '08:00',
      end: '10:00',
      groupId: 'GL1',
      teacherId: 'teacher-bernard',
      called: true,
    },
    {
      id: 'gl3-past-1',
      course: 'Réseaux',
      room: 'Salle E-220',
      date: shift(now, 2),
      start: '14:00',
      end: '16:00',
      groupId: 'GL3',
      teacherId: 'teacher-rossi',
      called: true,
    },
  );
  absences.push(absence('abs-gl1', 'gl1-past-1', 'stu-gl1-a', 'justifiee', shift(now, 3), 'Rendez-vous médical.'));
  absences.push(absence('abs-gl3-a', 'gl3-past-1', 'stu-gl3-a', 'a_justifier'));
  absences.push(absence('abs-gl3-b', 'gl3-past-1', 'stu-gl3-b', 'envoye', shift(now, 1), 'Retard de train, justificatif SNCF.'));
  sessions.push(...upcomingSessions(now), ...gi4Sessions(now));

  return { groups, students, teachers, sessions, absences };
}

export function recordCall(data: AttendanceData, sessionId: string, absentStudentIds: string[]): AttendanceData {
  const target = data.sessions.find((item) => item.id === sessionId);
  if (!target || target.called) return data;
  const existing = new Set(data.absences.filter((item) => item.sessionId === sessionId).map((item) => item.studentId));
  const created = absentStudentIds
    .filter((studentId, index, list) => list.indexOf(studentId) === index && !existing.has(studentId))
    .map((studentId) => absence(`abs-${sessionId}-${studentId}`, sessionId, studentId, 'a_justifier'));
  return {
    ...data,
    sessions: data.sessions.map((item) => (item.id === sessionId ? { ...item, called: true } : item)),
    absences: [...created, ...data.absences],
  };
}

export function submitJustification(data: AttendanceData, absenceId: string, reason: string, now = new Date()): AttendanceData {
  const motif = reason.trim();
  if (motif.length < 8) return data;
  return mapAbsence(data, absenceId, (item) =>
    item.status === 'a_justifier' || item.status === 'refusee'
      ? { ...item, status: 'envoye', reason: motif, submittedAt: now.toISOString(), reviewedAt: null, comment: null }
      : item,
  );
}

export function addSession(data: AttendanceData, draft: SessionDraft): { data: AttendanceData; error: string } {
  const course = draft.course.trim();
  const room = draft.room.trim();
  if (!course) return { data, error: 'Indiquez le cours.' };
  if (!room) return { data, error: 'Indiquez la salle.' };
  if (!isIsoDate(draft.date)) return { data, error: 'La date doit être au format AAAA-MM-JJ.' };
  if (!isTime(draft.start) || !isTime(draft.end) || draft.start >= draft.end) {
    return { data, error: 'Indiquez une heure de début et une heure de fin valides, au format HH:MM.' };
  }
  if (!data.groups.some((item) => item.id === draft.groupId)) return { data, error: 'Choisissez un groupe.' };
  if (!data.teachers.some((item) => item.id === draft.teacherId)) return { data, error: 'Choisissez un enseignant.' };
  const clash = data.sessions.some(
    (item) => item.groupId === draft.groupId && item.date === draft.date && item.start < draft.end && draft.start < item.end,
  );
  if (clash) return { data, error: 'Ce groupe a déjà une séance sur ce créneau.' };
  const created: CourseSession = {
    id: `session-${Date.now()}`,
    course,
    room,
    date: draft.date,
    start: draft.start,
    end: draft.end,
    groupId: draft.groupId,
    teacherId: draft.teacherId,
    called: false,
  };
  return { data: { ...data, sessions: [...data.sessions, created] }, error: '' };
}

export function gi4Teachers(): Teacher[] {
  return [
    { id: 'teacher-elakkad', name: 'Nabil El Akkad' },
    { id: 'teacher-majdoub', name: 'Soufiane Majdoub' },
    { id: 'teacher-ibnkouar', name: 'Safae Ibn Kouar' },
    { id: 'teacher-elouardi', name: 'Abdelfattah El Ouardi' },
    { id: 'teacher-lakhrissi', name: 'Youness Lakhrissi' },
    { id: 'teacher-hajji', name: 'Tarik Hajji' },
    { id: 'teacher-aounzou', name: 'Youssef Aounzou' },
  ];
}

const gi4Slots: { day: number; start: string; end: string; course: string; room: string; teacherId: string }[] = [
  { day: 1, start: '08:30', end: '10:00', course: 'Analyse des données', room: 'Salle A35', teacherId: 'teacher-majdoub' },
  { day: 1, start: '10:30', end: '12:00', course: 'Analyse des données', room: 'Salle A35', teacherId: 'teacher-majdoub' },
  { day: 1, start: '14:30', end: '16:00', course: 'Génie logiciel et design patterns', room: 'Salle A35', teacherId: 'teacher-elakkad' },
  { day: 1, start: '16:30', end: '18:00', course: 'Génie logiciel et design patterns', room: 'Salle A35', teacherId: 'teacher-elakkad' },
  { day: 3, start: '08:30', end: '10:00', course: 'Français', room: 'Salle A21', teacherId: 'teacher-ibnkouar' },
  { day: 3, start: '10:30', end: '12:00', course: 'Anglais', room: 'Salle A22', teacherId: 'teacher-elouardi' },
  { day: 4, start: '08:30', end: '10:00', course: 'Programmation orientée objet C#/.NET', room: 'Salle A35', teacherId: 'teacher-lakhrissi' },
  { day: 4, start: '10:30', end: '12:00', course: 'Programmation orientée objet C#/.NET', room: 'Salle A35', teacherId: 'teacher-lakhrissi' },
  { day: 4, start: '14:30', end: '16:00', course: 'Intelligence artificielle 2', room: 'Salle A35', teacherId: 'teacher-hajji' },
  { day: 4, start: '16:30', end: '18:00', course: 'Intelligence artificielle 2', room: 'Salle A35', teacherId: 'teacher-hajji' },
  { day: 5, start: '08:30', end: '10:00', course: 'Projet tutoré et DEVOPS', room: 'Salle A35', teacherId: 'teacher-aounzou' },
  { day: 5, start: '10:30', end: '12:00', course: 'Projet tutoré et DEVOPS', room: 'Salle A35', teacherId: 'teacher-aounzou' },
  { day: 5, start: '14:30', end: '16:00', course: 'Programmation distribuée JEE', room: 'Salle A35', teacherId: 'teacher-hajji' },
  { day: 5, start: '16:30', end: '18:00', course: 'Programmation distribuée JEE', room: 'Salle A35', teacherId: 'teacher-hajji' },
];

export function gi4Sessions(now = new Date(), weeks = 4): CourseSession[] {
  const today = shift(now, 0);
  const sessions: CourseSession[] = [];
  for (let offset = 0; offset < weeks; offset += 1) {
    for (const date of weekDays(now, offset)) {
      if (date < today) continue;
      const [year, month, day] = date.split('-').map(Number);
      const weekday = new Date(year, month - 1, day).getDay();
      for (const slot of gi4Slots) {
        if (slot.day !== weekday) continue;
        sessions.push({
          id: `gi4-${date}-${slot.start.replace(':', '')}`,
          course: slot.course,
          room: slot.room,
          date,
          start: slot.start,
          end: slot.end,
          groupId: 'GI4A',
          teacherId: slot.teacherId,
          called: false,
        });
      }
    }
  }
  return sessions;
}

export function upcomingSessions(now = new Date()): CourseSession[] {
  return [
    sessionDraft('gl2-week-1', 'Génie logiciel', 'Salle C-018', shift(now, -1), '08:00', '10:00', 'GL2', 'teacher-durand'),
    sessionDraft('gl2-week-2', 'Bases de données', 'Salle A-112', shift(now, -2), '10:30', '12:30', 'GL2', 'teacher-durand'),
    sessionDraft('gl1-week-1', 'Algorithmique', 'Salle D-010', shift(now, -1), '14:00', '16:00', 'GL1', 'teacher-bernard'),
    sessionDraft('gl3-week-1', 'Réseaux', 'Salle E-220', shift(now, -3), '08:00', '10:00', 'GL3', 'teacher-rossi'),
  ];
}

export function weekDays(now = new Date(), offset = 0) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekday = start.getDay();
  start.setDate(start.getDate() + (weekday === 0 ? -6 : 1 - weekday) + offset * 7);
  return Array.from({ length: 7 }, (_, index) => shift(new Date(start.getFullYear(), start.getMonth(), start.getDate() + index), 0));
}

export function formatWeek(days: string[]) {
  const first = days[0];
  const last = days[6];
  if (!first || !last) return '';
  const start = datePartsLong(first);
  const end = datePartsLong(last);
  if (start.month === end.month && start.year === end.year) return `${start.day} – ${end.day} ${end.month} ${end.year}`;
  if (start.year === end.year) return `${start.day} ${start.month} – ${end.day} ${end.month} ${end.year}`;
  return `${start.day} ${start.month} ${start.year} – ${end.day} ${end.month} ${end.year}`;
}

export function weekdayLabel(date: string, now = new Date()) {
  if (date === shift(now, 0)) return 'Aujourd’hui';
  const [year, month, day] = date.split('-').map(Number);
  const names = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  const value = new Date(year, (month ?? 1) - 1, day);
  return `${names[value.getDay()]} ${day} ${months[(month ?? 1) - 1]}`;
}

export function reviewJustification(
  data: AttendanceData,
  absenceId: string,
  decision: 'justifiee' | 'refusee',
  now = new Date(),
  comment = '',
): AttendanceData {
  const note = comment.trim();
  if (decision === 'refusee' && note.length < 8) return data;
  return mapAbsence(data, absenceId, (item) =>
    item.status === 'envoye' ? { ...item, status: decision, reviewedAt: now.toISOString(), comment: note || null } : item,
  );
}

export function addStudent(data: AttendanceData, name: string, groupName: string): { data: AttendanceData; error: string; student: Student | null } {
  const trimmed = name.trim();
  if (!trimmed) {
    return { data, error: 'Indiquez le nom de l’étudiant.', student: null };
  }
  const group = data.groups.find((item) => item.name.toLowerCase() === groupName.trim().toLowerCase());
  if (!group) {
    return { data, error: 'Groupe inconnu. Utilisez GL1, GL2 ou GL3.', student: null };
  }
  const created = student(`stu-${Date.now()}`, trimmed, group.id);
  return { data: { ...data, students: [created, ...data.students] }, error: '', student: created };
}

export function recentAbsenceCount(data: AttendanceData, teacherId: string, now = new Date()) {
  const limit = shift(now, 30);
  return data.absences.filter((item) => {
    const session = sessionById(data, item.sessionId);
    return session?.teacherId === teacherId && session.date >= limit;
  }).length;
}

export function openAbsenceCount(data: AttendanceData, teacherId: string) {
  return data.absences.filter((item) => {
    const session = sessionById(data, item.sessionId);
    return session?.teacherId === teacherId && OPEN_STATUSES.includes(item.status);
  }).length;
}

export function reviewsForTeacher(data: AttendanceData, teacherId: string) {
  return data.absences.filter((item) => {
    const session = sessionById(data, item.sessionId);
    return session?.teacherId === teacherId && item.status === 'envoye';
  });
}

export function nextUncalledSession(data: AttendanceData, teacherId: string) {
  return sessionsToCall(data, teacherId)[0] ?? null;
}

export function sessionsToCall(data: AttendanceData, teacherId: string, now = new Date()) {
  const today = shift(now, 0);
  const horizon = shift(now, -7);
  return data.sessions
    .filter((item) => item.teacherId === teacherId && !item.called && item.date >= today && item.date <= horizon)
    .sort((left, right) => `${left.date}${left.start}`.localeCompare(`${right.date}${right.start}`));
}

export function sessionsToCorrect(data: AttendanceData, teacherId: string, now = new Date()) {
  const oldest = shift(now, 14);
  const today = shift(now, 0);
  return data.sessions
    .filter((item) => item.teacherId === teacherId && item.called && item.date >= oldest && item.date <= today)
    .sort((left, right) => `${right.date}${right.start}`.localeCompare(`${left.date}${left.start}`))
    .slice(0, 6);
}

export function groupsForTeacher(data: AttendanceData, teacherId: string) {
  const ids = new Set(data.sessions.filter((item) => item.teacherId === teacherId).map((item) => item.groupId));
  return data.groups.filter((group) => ids.has(group.id));
}

export function studentsInGroup(data: AttendanceData, groupId: string) {
  return data.students.filter((item) => item.groupId === groupId);
}

export function absenceCountForStudent(data: AttendanceData, studentId: string) {
  return data.absences.filter((item) => item.studentId === studentId).length;
}

export function studentAbsences(data: AttendanceData, studentId: string) {
  return data.absences
    .filter((item) => item.studentId === studentId)
    .sort((left, right) => (sessionById(data, right.sessionId)?.date ?? '').localeCompare(sessionById(data, left.sessionId)?.date ?? ''));
}

export function sessionsForGroupOn(data: AttendanceData, groupId: string, date: string) {
  return data.sessions
    .filter((item) => item.groupId === groupId && item.date === date)
    .sort((left, right) => left.start.localeCompare(right.start));
}

export function presenceRate(data: AttendanceData, studentId: string) {
  const person = data.students.find((item) => item.id === studentId);
  if (!person) return 100;
  const held = data.sessions.filter((item) => item.groupId === person.groupId && item.called);
  if (held.length === 0) return 100;
  const missed = data.absences.filter((item) => item.studentId === studentId && held.some((session) => session.id === item.sessionId)).length;
  return Math.round(((held.length - missed) / held.length) * 100);
}

export function groupSummaries(data: AttendanceData) {
  return data.groups.map((group) => {
    const people = studentsInGroup(data, group.id);
    const held = data.sessions.filter((item) => item.groupId === group.id && item.called);
    const missed = data.absences.filter((item) => held.some((session) => session.id === item.sessionId)).length;
    const possible = people.length * held.length;
    const rate = possible === 0 ? 0 : (missed / possible) * 100;
    return { id: group.id, name: group.name, students: people.length, rate, label: formatRate(rate) };
  });
}

export function overallRate(data: AttendanceData) {
  const summaries = groupSummaries(data);
  const people = data.students.length;
  const missed = data.absences.length;
  const possible = data.groups.reduce((total, group) => {
    const count = studentsInGroup(data, group.id).length;
    const held = data.sessions.filter((item) => item.groupId === group.id && item.called).length;
    return total + count * held;
  }, 0);
  return { people, groups: data.groups.length, teachers: data.teachers.length, missed, possible, summaries, rate: possible === 0 ? 0 : (missed / possible) * 100 };
}

export function receivedJustifications(data: AttendanceData) {
  return data.absences.filter((item) => item.status === 'envoye').length;
}

export function sessionById(data: AttendanceData, sessionId: string) {
  return data.sessions.find((item) => item.id === sessionId) ?? null;
}

export function studentById(data: AttendanceData, studentId: string) {
  return data.students.find((item) => item.id === studentId) ?? null;
}

export function absenceById(data: AttendanceData, absenceId: string) {
  return data.absences.find((item) => item.id === absenceId) ?? null;
}

export function canViewAbsence(
  data: AttendanceData,
  absence: Absence,
  viewer: { role: 'enseignant' | 'etudiant' | 'admin'; studentId: string | null; teacherId: string | null },
) {
  if (viewer.role === 'admin') return true;
  if (viewer.role === 'etudiant') return absence.studentId === viewer.studentId;
  return sessionById(data, absence.sessionId)?.teacherId === viewer.teacherId;
}

export function statusLabel(status: AbsenceStatus) {
  if (status === 'a_justifier') return 'À justifier';
  if (status === 'envoye') return 'Envoyé';
  if (status === 'justifiee') return 'Justifiée';
  return 'Refusée';
}

export function statusText(status: AbsenceStatus) {
  if (status === 'a_justifier') return 'Cette séance n’a pas encore de justificatif.';
  if (status === 'envoye') return 'Le justificatif est en cours de validation par l’enseignant.';
  if (status === 'justifiee') return 'Le justificatif a été accepté.';
  return 'Le justificatif a été refusé. Vous pouvez en déposer un nouveau.';
}

export function formatRate(value: number) {
  return `${value.toFixed(1).replace('.', ',')} %`;
}

export function todayIso(now = new Date()) {
  return shift(now, 0);
}

export function formatWhen(date: string, start: string, end: string, now = new Date()) {
  const label = date === shift(now, 0) ? 'Aujourd’hui' : longDate(date);
  return `${label} · ${start}–${end}`;
}

export function dateParts(date: string) {
  const [, month, day] = date.split('-');
  const months = ['JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUIN', 'JUIL', 'AOÛT', 'SEPT', 'OCT', 'NOV', 'DÉC'];
  return { month: months[Number(month) - 1] ?? month, day };
}

export function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || 'ET';
}

function student(id: string, name: string, groupId: string): Student {
  return { id, name, initials: initialsFromName(name), groupId };
}

function absence(
  id: string,
  sessionId: string,
  studentId: string,
  status: AbsenceStatus,
  reviewedAt: string | null = null,
  reason: string | null = null,
): Absence {
  return {
    id,
    sessionId,
    studentId,
    status,
    reason: status === 'a_justifier' ? null : reason,
    submittedAt: status === 'a_justifier' ? null : reviewedAt,
    reviewedAt: status === 'justifiee' || status === 'refusee' ? reviewedAt : null,
    comment: null,
  };
}

function sessionDraft(
  id: string,
  course: string,
  room: string,
  date: string,
  start: string,
  end: string,
  groupId: string,
  teacherId: string,
): CourseSession {
  return { id, course, room, date, start, end, groupId, teacherId, called: false };
}

function isIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function isTime(value: string) {
  if (!/^\d{2}:\d{2}$/.test(value)) return false;
  const [hour, minute] = value.split(':').map(Number);
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}

function datePartsLong(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  return { day, month: months[(month ?? 1) - 1] ?? '', year };
}

function mapAbsence(data: AttendanceData, absenceId: string, update: (item: Absence) => Absence): AttendanceData {
  let changed = false;
  const absences = data.absences.map((item) => {
    if (item.id !== absenceId) return item;
    const next = update(item);
    if (next !== item) changed = true;
    return next;
  });
  return changed ? { ...data, absences } : data;
}

function shift(now: Date, days: number) {
  const copy = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  copy.setDate(copy.getDate() - days);
  const month = String(copy.getMonth() + 1).padStart(2, '0');
  const day = String(copy.getDate()).padStart(2, '0');
  return `${copy.getFullYear()}-${month}-${day}`;
}

function longDate(date: string) {
  const [year, month, day] = date.split('-');
  const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  return `${Number(day)} ${months[Number(month) - 1] ?? month} ${year}`;
}
