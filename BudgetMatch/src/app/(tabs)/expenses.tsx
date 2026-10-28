import { Text, View, StyleSheet } from "react-native";

export default function Expenses() {
  return (
    <View style={styles.page}>
      <Text>Expense Tracker</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white"
  }
});