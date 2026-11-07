import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { useRoleGuard } from '@/components/navigation/useRoleGuard';
import { colors } from '@/constants/theme';
import { useAttendance } from '@/context/attendance';
import { useSession } from '@/context/session';
import { reviewsForTeacher } from '@/lib/domain';

export default function TeacherTabs() {
  const allowed = useRoleGuard('enseignant');
  const { user } = useSession();
  const { data } = useAttendance();
  const waiting = reviewsForTeacher(data, user?.teacherId ?? '').length;

  if (!allowed) {
    return null;
  }

  return (
    <NativeTabs tintColor={colors.primary}>
      <NativeTabs.Trigger name="index" disableTransparentOnScrollEdge>
        <NativeTabs.Trigger.Icon sf={{ default: 'calendar', selected: 'calendar' }} md="calendar_today" />
        <NativeTabs.Trigger.Label>Appel</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="groupe" disableTransparentOnScrollEdge>
        <NativeTabs.Trigger.Icon sf={{ default: 'person.2', selected: 'person.2.fill' }} md="groups" />
        <NativeTabs.Trigger.Label>Groupe</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="justificatifs" disableTransparentOnScrollEdge>
        <NativeTabs.Trigger.Icon sf={{ default: 'doc.text', selected: 'doc.text.fill' }} md="description" />
        <NativeTabs.Trigger.Label>Justificatifs</NativeTabs.Trigger.Label>
        {waiting > 0 ? <NativeTabs.Trigger.Badge>{String(waiting)}</NativeTabs.Trigger.Badge> : null}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
