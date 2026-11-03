import { Tabs } from 'expo-router';

import { TabIcon } from '@/components/navigation/TabIcon';
import { useRoleGuard } from '@/components/navigation/useRoleGuard';
import { useWebTabOptions } from '@/components/navigation/webTabOptions';

export default function AdminTabs() {
  const allowed = useRoleGuard('admin');
  const screenOptions = useWebTabOptions();

  if (!allowed) {
    return null;
  }

  return (
    <Tabs safeAreaInsets={{ bottom: 0 }} screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name={focused ? { ios: 'square.grid.2x2.fill', android: 'dashboard' } : { ios: 'square.grid.2x2', android: 'dashboard' }} />,
        }}
      />
      <Tabs.Screen
        name="groupes"
        options={{
          title: 'Groupes',
          tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name={focused ? { ios: 'person.2.fill', android: 'groups' } : { ios: 'person.2', android: 'group' }} />,
        }}
      />
      <Tabs.Screen
        name="taux"
        options={{
          title: 'Taux',
          tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name={focused ? { ios: 'chart.bar.fill', android: 'monitoring' } : { ios: 'chart.bar', android: 'monitoring' }} />,
        }}
      />
      <Tabs.Screen
        name="seances"
        options={{
          title: 'Séances',
          tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name={{ ios: 'calendar.badge.plus', android: 'edit_calendar' }} />,
        }}
      />
      <Tabs.Screen
        name="salles"
        options={{
          title: 'Salles',
          tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name={{ ios: 'door.left.hand.closed', android: 'meeting_room' }} />,
        }}
      />
      <Tabs.Screen
        name="ajouter"
        options={{
          title: 'Ajouter',
          tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name={{ ios: 'person.badge.plus', android: 'person_add' }} />,
        }}
      />
    </Tabs>
  );
}
