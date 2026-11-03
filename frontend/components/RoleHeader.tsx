import { AppHeader } from '@/components/AppHeader';
import { useSession } from '@/context/session';

export function RoleHeader({ eyebrow, subtitle }: { eyebrow: string; subtitle?: string }) {
  const { user } = useSession();

  return (
    <AppHeader
      eyebrow={eyebrow}
      initials={user?.initials ?? ''}
      subtitle={subtitle ?? user?.subtitle ?? ''}
      title={`Bonjour, ${user?.firstName ?? ''}`}
    />
  );
}
