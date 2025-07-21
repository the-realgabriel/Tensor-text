import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
  AppState,
} from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { loadModel, detectText } from '../ML_logic/Ml_logic';

const { width, height } = Dimensions.get('window');

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState(false);
  const [appReady, setAppReady] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [photoUri, setPhotoUri] = useState(null);
  const [recognizedText, setRecognizedText] = useState([]);
  const cameraRef = useRef(null);
  const devices = useCameraDevices();
  const device = devices.back;

  // 🌟 Wait for app bridge to be ready
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        setAppReady(true);
      }
    });

    if (AppState.currentState === 'active') setAppReady(true);

    return () => sub.remove();
  }, []);

  // 🚀 Ask for camera permissions
  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'authorized');
    })();
  }, []);

  // 🤖 Load ML model after app is active
  useEffect(() => {
    if (appReady) {
      loadModel()
        .then(() => {
          console.log('[CameraScreen] Model loaded');
          setModelReady(true);
        })
        .catch(e => console.error('[CameraScreen] Model load failed:', e));
    }
  }, [appReady]);

  const takePictureAndDetect = async () => {
    if (!cameraRef.current || !modelReady) {
      console.warn('[CameraScreen] Model or camera not ready');
      return;
    }

    try {
      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
      });
      const path = 'file://' + photo.path;
      setPhotoUri(path);

      const results = await detectText(path);
      setRecognizedText(results || []);
    } catch (err) {
      console.error('[CameraScreen] Error capturing or detecting:', err);
    }
  };

  const retake = () => {
    setPhotoUri(null);
    setRecognizedText([]);
  };

  const usePhoto = () => {
    console.log('[CameraScreen] Using image:', photoUri);
    console.log('[CameraScreen] Detected text:', recognizedText);
  };

  if (!device || !hasPermission || !appReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="crimson" />
        <Text style={styles.loadingText}>Setting up camera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!photoUri ? (
        <>
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={true}
            photo={true}
            ref={cameraRef}
          />

          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.topBarButton}
              onPress={() => console.log('[CameraScreen] Back button')}
            >
              <Text style={{ color: 'white' }}>Back</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.shutterButtonOuter} onPress={takePictureAndDetect}>
              <View style={styles.shutterButtonInner} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomBarRightButton} onPress={takePictureAndDetect}>
              <Text style={styles.scanButtonText}>Scan</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photoUri }} style={styles.previewImage} />
          <View style={styles.textOverlay}>
            {recognizedText.length === 0 ? (
              <Text style={styles.textLine}>No text found.</Text>
            ) : (
              recognizedText.map((line, index) => (
                <Text key={index} style={styles.textLine}>{line}</Text>
              ))
            )}
          </View>

          <View style={styles.previewBottomBar}>
            <TouchableOpacity style={styles.previewButton} onPress={retake}>
              <Text style={styles.previewButtonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.previewButton} onPress={usePhoto}>
              <Text style={styles.previewButtonText}>Use Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  topBar: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  topBarButton: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 5,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  shutterButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterButtonInner: {
    width: 60,
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 30,
  },
  bottomBarRightButton: {
    backgroundColor: 'crimson',
    padding: 10,
    borderRadius: 8,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewImage: {
    width,
    height,
    resizeMode: 'cover',
  },
  textOverlay: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 10,
  },
  textLine: {
    color: 'white',
    fontSize: 14,
  },
  previewBottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#000',
  },
  previewButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
  },
  previewButtonText: {
    color: '#000',
  },
});
