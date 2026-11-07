import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { useRoleGuard } from '@/components/navigation/useRoleGuard';
import { colors } from '@/constants/theme';
import { useAttendance } from '@/context/attendance';
import { useSession } from '@/context/session';
import { canJustify, studentAbsences } from '@/lib/domain';

export default function StudentTabs() {
  const allowed = useRoleGuard('etudiant');
  const { user } = useSession();
  const { data } = useAttendance();
  const pending = studentAbsences(data, user?.studentId ?? '').filter((item) => {
    const session = data.sessions.find((entry) => entry.id === item.sessionId);
    return session ? canJustify(item.status, session.date) : false;
  }).length;

  if (!allowed) {
    return null;
  }

  return (
    <NativeTabs tintColor={colors.primary}>
      <NativeTabs.Trigger name="index" disableTransparentOnScrollEdge>
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
        <NativeTabs.Trigger.Label>Accueil</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="cours" disableTransparentOnScrollEdge>
        <NativeTabs.Trigger.Icon sf={{ default: 'calendar', selected: 'calendar' }} md="calendar_today" />
        <NativeTabs.Trigger.Label>Cours</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="absences" disableTransparentOnScrollEdge>
        <NativeTabs.Trigger.Icon sf="list.bullet" md="list" />
        <NativeTabs.Trigger.Label>Absences</NativeTabs.Trigger.Label>
        {pending > 0 ? <NativeTabs.Trigger.Badge>{String(pending)}</NativeTabs.Trigger.Badge> : null}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
