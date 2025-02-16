import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button, Card, Avatar } from "react-native-paper";
import SignupScreen from "./SignupScreen";

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState({ username: "", email: "" });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const storedUser = await AsyncStorage.getItem("user");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("token");

    // Navigate to Signup screen
    navigation.replace("SignupScreen");
  };

  return (
    <View style={styles.container}>
      <Card style={styles.profileCard}>
        <Avatar.Image size={100} source={{ uri: "https://i.pravatar.cc/300" }} style={styles.avatar} />
        <Text style={styles.username}>{userData.username || "Guest User"}</Text>
        <Text style={styles.email}>{userData.email}</Text>
        <Button mode="contained" onPress={handleLogout} style={styles.logoutButton}>
          Logout
        </Button>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  profileCard: {
    width: "90%",
    alignItems: "center",
    padding: 20,
    borderRadius: 15,
    backgroundColor: "#fff",
    elevation: 5,
  },
  avatar: {
    marginBottom: 15,
  },
  username: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  logoutButton: {
    width: "80%",
    borderRadius: 10,
    backgroundColor: "#e74c3c",
  },
});

export default ProfileScreen;
