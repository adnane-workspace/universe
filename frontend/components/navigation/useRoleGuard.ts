import { router } from 'expo-router';
import { useEffect } from 'react';

import { useSession } from '@/context/session';
import type { Role } from '@/lib/auth';

export function useRoleGuard(expected: Role) {
  const { ready, role } = useSession();

  useEffect(() => {
    if (ready && role !== expected) {
      router.replace('/');
    }
  }, [expected, ready, role]);

  return ready && role === expected;
}
