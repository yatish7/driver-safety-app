import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Vibration,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import * as Permissions from "expo-permissions";
import { Button, Card, ActivityIndicator, Avatar, Divider, Chip } from "react-native-paper";

const YOLO_API_URL = "https://lucky-poems-poke.loca.lt/predict";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const DetectionScreen = () => {
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync();

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log("📩 Notification Received:", notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("📲 Notification Response:", response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const registerForPushNotificationsAsync = async () => {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }
    } else {
      alert("Must use physical device for Push Notifications");
    }
  };

  const schedulePushNotification = async (message) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⚠️ Abnormal Behavior Detected",
        body: message,
        sound: "default",
      },
      trigger: null,
    });
  };

  const pickMedia = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setMedia(result.assets[0]);
    }
  };

  const processMedia = async () => {
    if (!media) return;
    setLoading(true);
    setError(null);
    setReport(null);

    let formData = new FormData();
    formData.append("file", {
      uri: media.uri,
      name: media.type === "image" ? "image.jpg" : "video.mp4",
      type: media.type === "image" ? "image/jpeg" : "video/mp4",
    });

    try {
      const response = await fetch(YOLO_API_URL, {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = await response.json();
      if (data.error) {
        setError(data.error);
        return;
      }

      setReport(data);

      const behaviors = data?.Abnormality?.detected_behaviors ?? [];

      if (Array.isArray(behaviors) && behaviors.length > 0) {
        const behaviorMsg = behaviors.join(", ");

        // ⚠️ Alert
        Alert.alert("Abnormal Behavior Detected", behaviorMsg);

        // 📳 Vibration
        Vibration.vibrate(1000); // vibrate for 1 sec

        // 🔔 Notification
        await schedulePushNotification(behaviorMsg);
      }
    } catch (error) {
      console.error("❌ Error processing media:", error);
      setError("Error processing media. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Title
            title="Upload Image or Video"
            titleStyle={styles.title}
            left={(props) => <Avatar.Icon {...props} icon="upload" />}
          />
          <Card.Content>
            <TouchableOpacity style={styles.uploadBox} onPress={pickMedia}>
              {media ? (
                <View style={{ alignItems: "center" }}>
                  <Image source={{ uri: media.uri }} style={styles.previewImage} />
                  <Text style={styles.fileName}>{media.uri.split("/").pop()}</Text>
                </View>
              ) : (
                <Text style={styles.uploadText}>Tap here to select a file</Text>
              )}
            </TouchableOpacity>
          </Card.Content>
          <Card.Actions>
            <Button
              mode="contained"
              onPress={processMedia}
              disabled={!media || loading}
              style={styles.uploadButton}
            >
              {loading ? <ActivityIndicator color="#fff" /> : "Process"}
            </Button>
          </Card.Actions>
        </Card>

        {report && (
          <Card style={styles.resultsCard}>
            <Card.Title title="Driver Safety Report" titleStyle={styles.resultsHeader} />
            <Card.Content>
              <View style={styles.resultSection}>
                <Text style={styles.sectionTitle}>Abnormal Behaviors</Text>
                {report.Abnormality && Array.isArray(report.Abnormality.detected_behaviors) && report.Abnormality.detected_behaviors.length > 0 ? (
                  <FlatList
                    data={report.Abnormality.detected_behaviors}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                      <Chip style={styles.behaviorChip} icon="alert-circle">{item}</Chip>
                    )}
                    scrollEnabled={false}
                  />
                ) : (
                  <Text style={styles.resultText}>No abnormal behaviors detected.</Text>
                )}
              </View>

              <Divider style={styles.divider} />

              <View style={styles.resultSection}>
                <Text style={styles.sectionTitle}>Detected Emotion</Text>
                <Chip style={[styles.chip, { backgroundColor: "#ffe4b5" }]}>
                  {report.EmotionalState?.emotion ?? "N/A"}
                </Chip>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.resultSection}>
                <Text style={styles.sectionTitle}>Drowsiness Score</Text>
                <Chip style={styles.chip}>{report.Drowsiness?.score ?? "N/A"} / 5</Chip>
              </View>
            </Card.Content>
          </Card>
        )}

        {error && (
          <Card style={styles.errorCard}>
            <Card.Content>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </Card.Content>
          </Card>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, padding: 20, backgroundColor: "#f2f5f8" },
  container: { flex: 1, alignItems: "center" },
  card: { width: "100%", borderRadius: 20, marginBottom: 20, elevation: 4 },
  resultsCard: { width: "100%", borderRadius: 20, padding: 10, marginTop: 10, backgroundColor: "#fff" },
  errorCard: { width: "100%", borderRadius: 15, backgroundColor: "#ffe5e5", padding: 15, marginTop: 10 },
  title: { fontSize: 20, fontWeight: "bold", color: "#333" },
  resultsHeader: { fontSize: 18, fontWeight: "bold", color: "#444" },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 5, color: "#555" },
  chip: { padding: 6, fontWeight: "bold", marginVertical: 4, backgroundColor: "#e0f7fa" },
  behaviorChip: { padding: 6, marginVertical: 4, backgroundColor: "#ffd1d1" },
  resultText: { fontSize: 15, color: "#333", paddingVertical: 2 },
  fileName: { fontSize: 14, color: "#777", marginTop: 5 },
  errorText: { fontSize: 16, fontWeight: "600", color: "#d9534f" },
  uploadBox: {
    height: 180,
    borderWidth: 2,
    borderColor: "#aaa",
    borderStyle: "dashed",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    backgroundColor: "#f4f4f4",
  },
  previewImage: { width: 100, height: 100, borderRadius: 10 },
  uploadButton: { backgroundColor: "#28a745", borderRadius: 10, width: "100%", marginTop: 10 },
  resultSection: { marginBottom: 10 },
  divider: { height: 1, backgroundColor: "#ddd", marginVertical: 10 },
});

export default DetectionScreen;
