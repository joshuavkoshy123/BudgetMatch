import { Text, View, StyleSheet } from "react-native";

export default function Savings() {
  return (
    <View style={styles.page}>
      <Text>Savings Planner</Text>
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