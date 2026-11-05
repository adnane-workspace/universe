import assert from 'node:assert/strict';
import test from 'node:test';

import { authenticate } from './auth.ts';
import {
  addSession,
  createSeed,
  openAbsenceCount,
  presenceRate,
  recordCall,
  reviewJustification,
  submitJustification,
  weekDays,
} from './domain.ts';

const now = new Date(2026, 10, 1, 9, 0, 0);

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
  const before = openAbsenceCount(seed, 'teacher-durand');
  const ignored = submitJustification(seed, 'abs-aminata-open', 'court', now);
  const sent = submitJustification(seed, 'abs-aminata-open', 'Rendez-vous médical le matin.', now);
  const accepted = reviewJustification(sent, 'abs-yacouba-review', 'justifiee', now);
  assert.equal(ignored, seed);
  assert.ok(openAbsenceCount(accepted, 'teacher-durand') < before);
  assert.equal(accepted.absences.find((item) => item.id === 'abs-yacouba-review')?.status, 'justifiee');
  assert.equal(accepted.absences.find((item) => item.id === 'abs-aminata-open')?.status, 'envoye');
  assert.equal(accepted.absences.find((item) => item.id === 'abs-aminata-open')?.reason, 'Rendez-vous médical le matin.');
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
