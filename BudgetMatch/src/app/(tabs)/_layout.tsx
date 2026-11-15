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
      <NativeTabs.Trigger name="expense-tracker">
        <NativeTabs.Trigger.Label>Expenses</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'creditcard', selected: 'creditcard.fill' }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="budget-builder">
        <NativeTabs.Trigger.Label>Budgets</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'chart.pie', selected: 'chart.pie.fill' }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="savings-planner">
        <NativeTabs.Trigger.Label>Savings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'dollarsign.circle', selected: 'dollarsign.circle.fill' }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label selectedStyle={{color: 'black'}}>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person', selected: 'person.fill' }}
          selectedColor="black"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}