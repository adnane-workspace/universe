import { Tabs } from 'expo-router';

import { TabIcon } from '@/components/navigation/TabIcon';
import { useRoleGuard } from '@/components/navigation/useRoleGuard';
import { useWebTabOptions } from '@/components/navigation/webTabOptions';
import { useAttendance } from '@/context/attendance';
import { useSession } from '@/context/session';
import { reviewsForTeacher } from '@/lib/domain';

export default function TeacherTabs() {
  const allowed = useRoleGuard('enseignant');
  const screenOptions = useWebTabOptions();
  const { user } = useSession();
  const { data } = useAttendance();
  const waiting = reviewsForTeacher(data, user?.teacherId ?? '').length;

  if (!allowed) {
    return null;
  }

  return (
    <Tabs safeAreaInsets={{ bottom: 0 }} screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Appel',
          tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name={focused ? { ios: 'calendar', android: 'calendar_today' } : { ios: 'calendar', android: 'calendar_today' }} />,
        }}
      />
      <Tabs.Screen
        name="groupe"
        options={{
          title: 'Groupe',
          tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name={focused ? { ios: 'person.2.fill', android: 'groups' } : { ios: 'person.2', android: 'group' }} />,
        }}
      />
      <Tabs.Screen
        name="justificatifs"
        options={{
          title: 'Justificatifs',
          tabBarBadge: waiting > 0 ? waiting : undefined,
          tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name={focused ? { ios: 'doc.text.fill', android: 'description' } : { ios: 'doc.text', android: 'description' }} />,
        }}
      />
    </Tabs>
  );
}
