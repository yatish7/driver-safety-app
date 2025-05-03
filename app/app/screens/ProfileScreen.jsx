import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button, Card, Avatar } from "react-native-paper";

const ProfileScreen = ({ navigation, setIsLoggedIn }) => {
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

    // Update isLoggedIn state & navigate to Signup screen
    setIsLoggedIn(false);
  };

  return (
    <View style={styles.container}>
      <Card style={styles.profileCard}>
        <Avatar.Image 
          size={100} 
          source={{ uri: "https://i.pravatar.cc/300" }} 
          style={styles.avatar} 
        />
        <Text style={styles.username}>{userData.username || "Guest User"}</Text>
        <Text style={styles.email}>{userData.email || "No Email Available"}</Text>

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
    padding: 25,
    borderRadius: 15,
    backgroundColor: "#ffffff",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  avatar: {
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#007bff",
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
    textAlign: "center",
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  logoutButton: {
    width: "85%",
    borderRadius: 10,
    backgroundColor: "#e74c3c",
    paddingVertical: 8,
  },
});

export default ProfileScreen;
