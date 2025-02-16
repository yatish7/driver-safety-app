import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button, ActivityIndicator } from 'react-native-paper';

const DetectionScreen = () => {
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(false);

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
    
    // Simulating AI processing - replace this with your model integration
    setTimeout(() => {
      alert("Processing complete! AI model detected results.");
      setLoading(false);
    }, 3000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Image or Video</Text>

      <TouchableOpacity style={styles.uploadBox} onPress={pickMedia}>
        {media ? (
          media.type === 'image' ? (
            <Image source={{ uri: media.uri }} style={styles.preview} />
          ) : (
            <Text style={styles.previewText}>Video selected: {media.uri.split('/').pop()}</Text>
          )
        ) : (
          <Text style={styles.uploadText}>Tap to select file</Text>
        )}
      </TouchableOpacity>

      {media && (
        <Button mode="contained" style={styles.button} onPress={processMedia} disabled={loading}>
          {loading ? <ActivityIndicator animating={true} color="#fff" /> : "Process"}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  uploadBox: { width: 300, height: 200, borderRadius: 10, borderWidth: 1, borderColor: '#ccc', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  uploadText: { fontSize: 16, color: '#888' },
  preview: { width: '100%', height: '100%', borderRadius: 10 },
  previewText: { textAlign: 'center', fontSize: 16, padding: 10 },
  button: { marginTop: 15, width: '80%' },
});

export default DetectionScreen;
