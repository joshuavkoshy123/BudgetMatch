import { NativeTabs } from 'expo-router/native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs
      tintColor="white"
      backgroundColor="#2468C1"
      indicatorColor="rgba(255, 211, 61, 0.2)"
      rippleColor="rgba(255, 211, 61, 0.3)"
      labelStyle={{
        fontSize: 10,
      }}
    >
      <NativeTabs.Trigger name="savings-planner">
        <NativeTabs.Trigger.Label>Savings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'info.circle', selected: 'info.circle.fill' }}
          md="info"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="budget-builder">
        <NativeTabs.Trigger.Label>Budgets</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'info.circle', selected: 'info.circle.fill' }}
          md="info"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="expense-tracker">
        <NativeTabs.Trigger.Label>Expenses</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'info.circle', selected: 'info.circle.fill' }}
          md="info"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person', selected: 'person.fill' }}
          md="info"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}