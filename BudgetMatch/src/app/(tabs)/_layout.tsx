import { NativeTabs } from 'expo-router/native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs
        tintColor="white"
        backgroundColor="#2468C1"
        indicatorColor="rgba(255, 211, 61, 0.2)"
        rippleColor="rgba(255, 211, 61, 0.3)"
    >
        <NativeTabs.Trigger name="savings">
            <NativeTabs.Trigger.Label>Savings Planner</NativeTabs.Trigger.Label>
            <NativeTabs.Trigger.Icon
            sf={{ default: 'info.circle', selected: 'info.circle.fill' }}
            md="info"
            />
        </NativeTabs.Trigger>
    </NativeTabs>
  );
}