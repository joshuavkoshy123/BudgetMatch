import { Text, View, StyleSheet, ScrollView } from 'react-native';

export default function SavingsPage() {
  return (
    <View style={{ flex: 1 }}>
      <View>
        <Text>Savings Planner</Text>
      </View>

      <ScrollView>
        <View style={styles.container}>
          <View style={{ height: 200, backgroundColor: 'red' }} />
          <View style={{ height: 200, backgroundColor: 'yellow' }} />
          <View style={{ height: 200, backgroundColor: 'green' }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
});