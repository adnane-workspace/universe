import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { ApiError, loginRequest, logoutRequest, sessionRequest } from '@/lib/api';
import type { AuthUser, Role } from '@/lib/auth';
import { clearSessionId, readSessionId, writeSessionId } from '@/lib/session-store';

export type { AuthUser, Role };

type SignInResult = { user: AuthUser } | { user: null; message: string };

type SessionValue = {
  user: AuthUser | null;
  role: Role | null;
  ready: boolean;
  signIn: (login: string, password: string) => Promise<SignInResult>;
  signOut: () => void;
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    readSessionId()
      .then(async (token) => {
        if (!token) return null;
        try {
          return (await sessionRequest(token)).user;
        } catch {
          await clearSessionId();
          return null;
        }
      })
      .then((account) => {
        if (active) setUser(account);
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      user,
      role: user?.role ?? null,
      ready,
      signIn: async (login, password) => {
        try {
          const result = await loginRequest(login, password);
          setUser(result.user);
          await writeSessionId(result.token);
          return { user: result.user };
        } catch (error) {
          const message = error instanceof ApiError ? error.message : 'Connexion impossible.';
          return { user: null, message };
        }
      },
      signOut: () => {
        void readSessionId().then((token) => {
          if (token) void logoutRequest(token).catch(() => undefined);
          void clearSessionId();
        });
        setUser(null);
      },
    }),
    [ready, user],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error('useSession doit être utilisé dans SessionProvider');
  }
  return value;
}
