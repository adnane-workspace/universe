import { AppHeader } from '@/components/AppHeader';
import { useSession } from '@/context/session';

export function RoleHeader({ eyebrow, subtitle }: { eyebrow: string; subtitle?: string }) {
  const { user } = useSession();
  const greeting = eyebrow === 'Bonjour';

  return (
    <AppHeader
      eyebrow=""
      initials={user?.initials ?? ''}
      subtitle={subtitle ?? user?.subtitle ?? ''}
      title={greeting ? `Bonjour, ${user?.firstName ?? ''}` : eyebrow}
    />
  );
}
