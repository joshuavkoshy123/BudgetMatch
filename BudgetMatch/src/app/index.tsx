import { useState } from "react";
import { Text, View, StyleSheet, TextInput, Pressable } from "react-native";
import { router } from 'expo-router';

export default function Index() {
  const [form, setForm] = useState({
    username: "",
    password: ""
  });

  const login = () => {
    if (form.username === "TestUser" && form.password === "Budget123") {
      router.replace("/(tabs)/expenses");
    }
  }

  return (
    <View style={styles.page}>
      <Text>Welcome to BudgetMatch!</Text>
      <View style={styles.form}>
        <Text>Username</Text>
        <TextInput id="username" style={styles.formField}
          onChangeText={value => setForm({...form, username: value})} />
        <Text>Password</Text>
        <TextInput id="password" style={styles.formField}
          onChangeText={value => setForm({...form, password: value})} />
        <Pressable style={styles.formButton} onPress={login}>
          <Text>Log In</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white"
  },
  form: {
    width: "80%"
  },
  formField: {
    borderWidth: 1
  },
  formButton: {
    width: "30%",
    alignSelf: "center",
    alignItems: "center",
    borderWidth: 1
  }
});