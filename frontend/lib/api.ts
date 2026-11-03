import Constants from 'expo-constants';
import { Platform } from 'react-native';

import type { AuthUser } from '@/lib/auth';
import type { AttendanceData } from '@/lib/domain';
import { readSessionId } from '@/lib/session-store';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function apiBase() {
  const configured = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
  if (configured) return configured;
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (Platform.OS !== 'web' && host) return `http://${host}:3001`;
  return 'http://localhost:3001';
}

export async function api<T>(path: string, options: { method?: string; body?: unknown; token?: string | null } = {}): Promise<T> {
  const token = options.token === undefined ? await readSessionId() : options.token;
  let response: Response;
  try {
    response = await fetch(`${apiBase()}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError('Le serveur est injoignable. Lancez-le avec pnpm server.', 0);
  }
  const payload = (await response.json().catch(() => ({}))) as { message?: unknown };
  if (!response.ok) {
    throw new ApiError(typeof payload.message === 'string' ? payload.message : 'La requête a échoué.', response.status);
  }
  return payload as T;
}

export function loginRequest(login: string, password: string) {
  return api<{ token: string; user: AuthUser }>('/auth/login', { method: 'POST', body: { login, password }, token: null });
}

export function sessionRequest(token: string) {
  return api<{ user: AuthUser }>('/auth/me', { token });
}

export function logoutRequest(token: string) {
  return api<{ ok: boolean }>('/auth/logout', { method: 'POST', token });
}

export function attendanceRequest() {
  return api<{ data: AttendanceData }>('/attendance');
}

export function postAttendance(path: string, body: unknown) {
  return api<{ data: AttendanceData }>(path, { method: 'POST', body });
}
