import { Tabs } from 'expo-router';
import { Text } from 'react-native';

const blue = '#3467EB';

function TabGlyph({ label, color }: { label: string; color: string }) {
  return <Text style={{ color, fontSize: 17, fontWeight: '800' }}>{label}</Text>;
}

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: blue,
      tabBarInactiveTintColor: '#9AA5B5',
      tabBarLabelStyle: { fontSize: 10, fontWeight: '700', marginBottom: 4 },
      tabBarStyle: { height: 64, paddingTop: 7, borderTopColor: '#E9EDF4', backgroundColor: '#FFFFFF' },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Enseignant', tabBarIcon: ({ color }) => <TabGlyph label="▦" color={String(color)} /> }} />
      <Tabs.Screen name="two" options={{ title: 'Étudiant', tabBarIcon: ({ color }) => <TabGlyph label="♙" color={String(color)} /> }} />
      <Tabs.Screen name="admin" options={{ title: 'Administration', tabBarIcon: ({ color }) => <TabGlyph label="⌂" color={String(color)} /> }} />
    </Tabs>
  );
}

