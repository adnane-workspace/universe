import { Tabs } from 'expo-router';

import { TabIcon } from '@/components/navigation/TabIcon';
import { useRoleGuard } from '@/components/navigation/useRoleGuard';
import { useWebTabOptions } from '@/components/navigation/webTabOptions';
import { useAttendance } from '@/context/attendance';
import { useSession } from '@/context/session';
import { canJustify, studentAbsences } from '@/lib/domain';

export default function StudentTabs() {
  const allowed = useRoleGuard('etudiant');
  const screenOptions = useWebTabOptions();
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
    <Tabs safeAreaInsets={{ bottom: 0 }} screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name={focused ? { ios: 'house.fill', android: 'home' } : { ios: 'house', android: 'home' }} />,
        }}
      />
      <Tabs.Screen
        name="cours"
        options={{
          title: 'Cours',
          tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name={{ ios: 'calendar', android: 'calendar_today' }} />,
        }}
      />
      <Tabs.Screen
        name="absences"
        options={{
          title: 'Absences',
          tabBarBadge: pending > 0 ? pending : undefined,
          tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name={{ ios: 'list.bullet', android: 'list' }} />,
        }}
      />
    </Tabs>
  );
}
