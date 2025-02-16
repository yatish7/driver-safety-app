import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button } from "react-native-paper";

const LoginScreen = ({ navigation, setIsLoggedIn }) => {
  const [userData, setUserData] = useState({ email: "", password: "" });

  const handleLogin = async () => {
    try {
      const response = await fetch("http://192.168.31.190:9000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem("user", JSON.stringify({ email: userData.email }));
        setIsLoggedIn(true); // Update login state
      } else {
        Alert.alert("Error", data.error || "Invalid credentials.");
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
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
      <Button mode="contained" style={styles.button} onPress={handleLogin}>
        Login
      </Button>
      <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.toggleText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  button: {
 width: "100%",
 paddingVertical: 10, 
 borderRadius: 10
  },
  toggleText: {
  marginTop: 15,
  textAlign: "center",
  fontSize: 16, 
  fontWeight: "bold" 
  },
});

export default LoginScreen;
