import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { useRoleGuard } from '@/components/navigation/useRoleGuard';
import { colors } from '@/constants/theme';

export default function AdminTabs() {
  const allowed = useRoleGuard('admin');

  if (!allowed) {
    return null;
  }

  return (
    <NativeTabs tintColor={colors.primary}>
      <NativeTabs.Trigger name="index" disableTransparentOnScrollEdge>
        <NativeTabs.Trigger.Icon sf={{ default: 'square.grid.2x2', selected: 'square.grid.2x2.fill' }} md="dashboard" />
        <NativeTabs.Trigger.Label>Accueil</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="groupes" disableTransparentOnScrollEdge>
        <NativeTabs.Trigger.Icon sf={{ default: 'person.2', selected: 'person.2.fill' }} md="groups" />
        <NativeTabs.Trigger.Label>Groupes</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="taux" disableTransparentOnScrollEdge>
        <NativeTabs.Trigger.Icon sf={{ default: 'chart.bar', selected: 'chart.bar.fill' }} md="monitoring" />
        <NativeTabs.Trigger.Label>Taux</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="seances" disableTransparentOnScrollEdge>
        <NativeTabs.Trigger.Icon sf="calendar.badge.plus" md="edit_calendar" />
        <NativeTabs.Trigger.Label>Séances</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="salles" disableTransparentOnScrollEdge>
        <NativeTabs.Trigger.Icon sf={{ default: 'door.left.hand.closed', selected: 'door.left.hand.open' }} md="meeting_room" />
        <NativeTabs.Trigger.Label>Salles</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="ajouter" disableTransparentOnScrollEdge>
        <NativeTabs.Trigger.Icon sf="person.badge.plus" md="person_add" />
        <NativeTabs.Trigger.Label>Ajouter</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
