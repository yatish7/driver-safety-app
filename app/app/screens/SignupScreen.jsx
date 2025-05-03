import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button } from "react-native-paper";

const SignupScreen = ({ navigation, setIsLoggedIn }) => {
  const [userData, setUserData] = useState({ username: "", email: "", password: "" });

  const handleSignup = async () => {
    try {
      const response = await fetch("http://192.168.31.198:9000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Sign-up successful! Please log in.");
        navigation.navigate("Login"); // Navigate to Login screen
      } else {
        Alert.alert("Error", data.error || "Signup failed.");
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={userData.username}
        onChangeText={(text) => setUserData({ ...userData, username: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={userData.email}
        onChangeText={(text) => setUserData({ ...userData, email: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={userData.password}
        onChangeText={(text) => setUserData({ ...userData, password: text })}
      />
      <Button mode="contained" style={styles.button} onPress={handleSignup}>
        Sign Up
      </Button>
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.toggleText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  input: { width: "100%", padding: 12, borderWidth: 1, borderRadius: 10, marginBottom: 15 },
  button: { width: "100%", paddingVertical: 10, borderRadius: 10 },
  toggleText: { marginTop: 15, textAlign: "center", fontSize: 16, fontWeight: "bold" },
});

export default SignupScreen;
