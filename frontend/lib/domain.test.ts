import assert from 'node:assert/strict';
import test from 'node:test';

import { authenticate } from './auth.ts';
import {
  addSession,
  canJustify,
  createSeed,
  openAbsenceCount,
  presenceRate,
  recordCall,
  reviewJustification,
  submitJustification,
  lessonMark,
  weekDays,
} from './domain.ts';

const now = new Date(2026, 10, 1, 9, 0, 0);

test('une séance passée non appelée n’est pas à venir', () => {
  assert.equal(lessonMark(false, undefined, '2026-10-31', now).label, 'Non appelée');
  assert.equal(lessonMark(false, undefined, '2026-11-01', now).label, 'Aujourd’hui');
  assert.equal(lessonMark(false, undefined, '2026-11-02', now).label, 'À venir');
});

test('un mauvais mot de passe est refusé', () => {
  assert.equal(authenticate('p.durand@univ-lumiere.fr', 'mauvais'), null);
  assert.equal(authenticate('a.elmenouar', 'Etudiant2026')?.role, 'etudiant');
});

test('un appel ne compte une absence qu’une seule fois', () => {
  const seed = createSeed(now);
  const once = recordCall(seed, 'gl2-today-mobile', ['stu-aminata', 'stu-aminata']);
  const twice = recordCall(once, 'gl2-today-mobile', ['stu-paul']);
  const recorded = once.absences.filter((item) => item.sessionId === 'gl2-today-mobile');
  assert.equal(recorded.length, 1);
  assert.equal(recorded[0]?.studentId, 'stu-aminata');
  assert.equal(twice.absences.filter((item) => item.sessionId === 'gl2-today-mobile').length, 1);
});

test('un justificatif accepté sort de la liste à traiter', () => {
  const seed = createSeed(now);
  const ignored = submitJustification(seed, 'abs-aminata-open', 'court', now);
  const sent = submitJustification(seed, 'abs-aminata-open', 'Médical — Rendez-vous médical le matin.', now);
  const queued = openAbsenceCount(sent, 'teacher-durand');
  const accepted = reviewJustification(sent, 'abs-yacouba-review', 'justifiee', now);
  assert.equal(ignored, seed);
  assert.ok(openAbsenceCount(accepted, 'teacher-durand') < queued);
  assert.equal(accepted.absences.find((item) => item.id === 'abs-yacouba-review')?.status, 'justifiee');
  assert.equal(accepted.absences.find((item) => item.id === 'abs-aminata-open')?.status, 'envoye');
  assert.equal(accepted.absences.find((item) => item.id === 'abs-aminata-open')?.reason, 'Médical — Rendez-vous médical le matin.');
});

test('une séance refuse un créneau déjà pris et accepte un horaire libre', () => {
  const seed = createSeed(now);
  const taken = seed.sessions.find((item) => item.id === 'gl2-today-mobile');
  assert.ok(taken);
  const clash = addSession(seed, {
    course: 'Autre',
    room: 'Salle Z',
    date: taken.date,
    start: taken.start,
    end: taken.end,
    groupId: taken.groupId,
    teacherId: taken.teacherId,
  });
  const created = addSession(seed, {
    course: 'Projet',
    room: 'Salle Z',
    date: taken.date,
    start: '18:00',
    end: '20:00',
    groupId: taken.groupId,
    teacherId: taken.teacherId,
  });
  assert.ok(clash.error);
  assert.equal(created.error, '');
  assert.equal(created.data.sessions.length, seed.sessions.length + 1);
});

test('la semaine commence le lundi', () => {
  const days = weekDays(now, 0);
  const [year, month, day] = days[0].split('-').map(Number);
  assert.equal(days.length, 7);
  assert.equal(new Date(year, month - 1, day).getDay(), 1);
});

test('la présence baisse quand une séance appelée a une absence', () => {
  const seed = createSeed(now);
  const before = presenceRate(seed, 'stu-aminata');
  const called = recordCall(seed, 'gl2-today-mobile', ['stu-aminata']);
  assert.ok(presenceRate(called, 'stu-aminata') < before);
});

test('une absence justifiée ne baisse plus l’assiduité', () => {
  const seed = createSeed(now);
  const called = recordCall(seed, 'gl2-today-mobile', ['stu-aminata']);
  const present = recordCall(seed, 'gl2-today-mobile', []);
  const absence = called.absences.find((item) => item.sessionId === 'gl2-today-mobile');
  assert.ok(absence);
  const sent = submitJustification(called, absence.id, 'Administratif — Convocation administrative reçue.', now);
  const accepted = reviewJustification(sent, absence.id, 'justifiee', now);
  assert.ok(presenceRate(called, 'stu-aminata') < presenceRate(accepted, 'stu-aminata'));
  assert.equal(presenceRate(accepted, 'stu-aminata'), presenceRate(present, 'stu-aminata'));
});

test('un justificatif hors délai de 7 jours est refusé', () => {
  const seed = createSeed(now);
  const recent = seed.sessions.find((item) => item.id === 'gl2-past-1');
  const old = seed.sessions.find((item) => item.id === 'gl2-past-6');
  assert.ok(recent && old);
  assert.equal(canJustify('a_justifier', recent.date, now), true);
  assert.equal(canJustify('a_justifier', old.date, now), false);
  const untouched = submitJustification(
    {
      ...seed,
      absences: seed.absences.map((item) => (item.id === 'abs-aminata-old' ? { ...item, status: 'a_justifier', reason: null, submittedAt: null, reviewedAt: null } : item)),
    },
    'abs-aminata-old',
    'Familial — Motif déposé trop tard pour cette séance.',
    now,
  );
  assert.equal(untouched.absences.find((item) => item.id === 'abs-aminata-old')?.status, 'a_justifier');
});
