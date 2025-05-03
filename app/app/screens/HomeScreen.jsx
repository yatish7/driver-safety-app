import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Card } from "react-native-paper";

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Abnormal Driver Detection</Text>
          <Text style={styles.subtitle}>Monitoring driver behavior for safety</Text>
        </Card.Content>
      </Card>

      <Image 
        source={{ uri: "https://cdn-icons-png.flaticon.com/512/3202/3202926.png" }} 
        style={styles.image} 
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  card: {
    width: "90%",
    padding: 20,
    borderRadius: 12,
    elevation: 5,
    backgroundColor: "#ffffff",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginTop: 10,
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
});
