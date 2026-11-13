import { useState } from "react";
import { Text, View, StyleSheet, TextInput, Pressable, ActivityIndicator, Image } from "react-native";
import { router } from 'expo-router';
import { useFonts, IBMPlexSans_400Regular, IBMPlexSans_700Bold } from '@expo-google-fonts/ibm-plex-sans';
import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

export default function Index() {


  const [fontsLoaded] = useFonts({
    IBMPlexSans_400Regular,
    IBMPlexSans_700Bold,
  });

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" />;
  }

  const logout = () => {
      router.replace("/");
  }

  return (
    <View style={styles.page}>
      <Text style={styles.pageTitle}>Profile</Text>
      {/* <Image source={require('../../../assets/images/profile-icon3.png')} style={styles.image} resizeMode="contain" /> */}
      <View style={styles.form}>
              <Text style={styles.formLabel}>Username</Text>
              <TextInput style={styles.formField} editable={false} value={"TestUser"}/>
              <Text style={styles.formLabel}>First Name</Text>
              <TextInput style={styles.formField} editable={false} value={"Test"}/>
              <Text style={styles.formLabel}>Last Name</Text>
              <TextInput style={styles.formField} editable={false} value={"User"}/>
              <Text style={styles.formLabel}>Email</Text>
              <TextInput style={styles.formField} editable={false} value={"budgetmatchtestuser@gmail.com"}/>
              <Pressable style={styles.formButton} onPress={logout}>
                <Text style={[styles.formLabel, styles.formButtonText]}>Log Out</Text>
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
    fontFamily: 'IBMPlexSans_700Bold',
    marginBottom: 30
  },
  image: {
    width: "30%",
    height: "30%",
    marginBottom: 0
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
  errorText: {
    textAlign: "center",
    color: "red",
    fontSize: 16,
    fontWeight: "bold",
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