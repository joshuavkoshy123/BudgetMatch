import { useState } from "react";
import { Text, View, StyleSheet, TextInput, Pressable, ActivityIndicator } from "react-native";
import { router } from 'expo-router';
import { useFonts, IBMPlexSans_400Regular, IBMPlexSans_700Bold } from '@expo-google-fonts/ibm-plex-sans';

export default function Index() {
  const [form, setForm] = useState({
    username: "",
    password: ""
  });

  const [fontsLoaded] = useFonts({
    IBMPlexSans_400Regular,
    IBMPlexSans_700Bold,
  });

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" />;
  }

  const login = () => {
    if (form.username === "TestUser" && form.password === "Budget123") {
      router.replace("/(tabs)/savings");
    }
  }

  return (
    <View style={styles.page}>
      <Text style={styles.pageTitle}>Welcome to BudgetMatch!</Text>
      <View style={styles.form}>
        <Text style={styles.formLabel}>Username</Text>
        <TextInput id="username" style={styles.formField}
          onChangeText={value => setForm({...form, username: value})} />
        <Text style={styles.formLabel}>Password</Text>
        <TextInput id="password" style={styles.formField}
          onChangeText={value => setForm({...form, password: value})} />
        <Pressable style={styles.formButton} onPress={login}>
          <Text style={[styles.formLabel, styles.formButtonText]}>Log In</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  pageTitle: {
    width: "80%",
    padding: 20,
    textAlign: "center",
    fontSize: 30,
    fontWeight: 'bold',
    fontFamily: 'IBMPlexSans_700Bold'
  },
  form: {
    width: "80%",
    gap: 16
  },
  formLabel: {
    fontSize: 16
  },
  formField: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
  },
  formButton: {
    width: "30%",
    alignSelf: "center",
    alignItems: "center",
    marginTop: 10,
    color: 'white',
    backgroundColor: 'red',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  formButtonText: {
    color: "white"
  }
});