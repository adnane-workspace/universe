import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { attendanceRequest, postAttendance } from '@/lib/api';
import type { AttendanceData, SessionDraft } from '@/lib/domain';
import { useSession } from '@/context/session';

const empty: AttendanceData = { groups: [], students: [], teachers: [], sessions: [], absences: [] };

type AttendanceValue = {
  data: AttendanceData;
  ready: boolean;
  error: string;
  reload: () => void;
  saveCall: (sessionId: string, absentStudentIds: string[]) => Promise<string>;
  correctCall: (sessionId: string, absentStudentIds: string[]) => Promise<string>;
  sendJustification: (absenceId: string, reason: string) => Promise<string>;
  decideJustification: (absenceId: string, decision: 'justifiee' | 'refusee', comment?: string) => Promise<string>;
  createSession: (draft: SessionDraft) => Promise<string>;
  cancelSession: (sessionId: string) => Promise<string>;
  createStudent: (name: string, groupName: string, login: string, password: string) => Promise<string>;
  createTeacher: (name: string, login: string, password: string) => Promise<string>;
};

const AttendanceContext = createContext<AttendanceValue | null>(null);

function messageFrom(error: unknown) {
  return error instanceof Error ? error.message : 'Enregistrement impossible.';
}

export function AttendanceProvider({ children }: { children: ReactNode }) {
  const { user, ready: sessionReady } = useSession();
  const [data, setData] = useState<AttendanceData>(empty);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((current) => current + 1), []);

  useEffect(() => {
    if (!sessionReady) return;
    if (!user) {
      setData(empty);
      setError('');
      setReady(true);
      return;
    }
    let active = true;
    setReady(false);
    setError('');
    attendanceRequest()
      .then((result) => {
        if (active) setData(result.data);
      })
      .catch((reason) => {
        if (active) setError(messageFrom(reason));
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [sessionReady, user, tick]);

  async function mutate(path: string, body: unknown) {
    try {
      const result = await postAttendance(path, body);
      setData(result.data);
      return '';
    } catch (reason) {
      return messageFrom(reason);
    }
  }

  const value = useMemo<AttendanceValue>(
    () => ({
      data,
      ready,
      error,
      reload,
      saveCall: (sessionId, absentStudentIds) => mutate('/attendance/calls', { sessionId, absentStudentIds }),
      correctCall: (sessionId, absentStudentIds) => mutate('/attendance/calls/corrections', { sessionId, absentStudentIds }),
      sendJustification: (absenceId, reason) => mutate('/attendance/justifications', { absenceId, reason }),
      decideJustification: (absenceId, decision, comment = '') => mutate('/attendance/reviews', { absenceId, decision, comment }),
      createSession: (draft) => mutate('/attendance/sessions', draft),
      cancelSession: (sessionId) => mutate('/attendance/sessions/cancel', { sessionId }),
      createStudent: (name, groupName, login, password) => mutate('/attendance/students', { name, groupName, login, password }),
      createTeacher: (name, login, password) => mutate('/attendance/teachers', { name, login, password }),
    }),
    [data, error, ready, reload],
  );

  return <AttendanceContext.Provider value={value}>{children}</AttendanceContext.Provider>;
}

export function useAttendance() {
  const value = useContext(AttendanceContext);
  if (!value) {
    throw new Error('useAttendance doit être utilisé dans AttendanceProvider');
  }
  return value;
}
