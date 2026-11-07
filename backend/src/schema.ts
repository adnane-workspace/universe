import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  login: text('login').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  firstName: text('first_name').notNull(),
  name: text('name').notNull(),
  initials: text('initials').notNull(),
  role: text('role').notNull(),
  subtitle: text('subtitle').notNull(),
  studentId: text('student_id'),
  teacherId: text('teacher_id'),
});

export const authTokens = sqliteTable('auth_tokens', {
  token: text('token').primaryKey(),
  userId: text('user_id').notNull(),
  createdAt: text('created_at').notNull(),
});

export const groups = sqliteTable('groups', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
});

export const teachers = sqliteTable('teachers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
});

export const students = sqliteTable('students', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  initials: text('initials').notNull(),
  groupId: text('group_id').notNull(),
});

export const courseSessions = sqliteTable('course_sessions', {
  id: text('id').primaryKey(),
  course: text('course').notNull(),
  room: text('room').notNull(),
  date: text('date').notNull(),
  start: text('start_time').notNull(),
  end: text('end_time').notNull(),
  groupId: text('group_id').notNull(),
  teacherId: text('teacher_id').notNull(),
  called: integer('called', { mode: 'boolean' }).notNull(),
});

export const absences = sqliteTable('absences', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull(),
  studentId: text('student_id').notNull(),
  status: text('status').notNull(),
  reason: text('reason'),
  submittedAt: text('submitted_at'),
  reviewedAt: text('reviewed_at'),
  comment: text('comment'),
});
