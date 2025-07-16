import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import { loadModel, detectText } from '../ML_logic/Ml_logic';

const { width, height } = Dimensions.get('window');

export default function Camera() {
  const cameraRef = useRef(null);
  const [recognizedText, setRecognizedText] = useState([]);
  const [imageUri, setImageUri] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [modelReady, setModelReady] = useState(false);

  // Load ML model safely with slight delay
  useEffect(() => {
    const timer = setTimeout(() => {
      loadModel()
        .then(() => {
          console.log('[CameraScreen] Model loaded successfully');
          setModelReady(true);
        })
        .catch(e => {
          console.error('[CameraScreen] Failed to load model:', e);
        });
    }, 300); // slight delay to ensure bridge is ready

    return () => clearTimeout(timer);
  }, []);



  const captureAndDetect = async () => {
    if (!cameraReady) {
      console.warn('[CameraScreen] Camera not ready yet.');
      return;
    }

    if (!modelReady) {
      console.warn('[CameraScreen] Model not loaded yet.');
      return;
    }

    if (!cameraRef.current) {
      console.warn('[CameraScreen] Camera reference not available.');
      return;
    }

    try {
      const options = { quality: 0.8, base64: false, doNotSave: true };
      const data = await cameraRef.current.takePictureAsync(options);
      
      if (!data || !data.uri) {
        throw new Error('No image URI returned');
      }

      setImageUri(data.uri);

      const results = await detectText(data.uri);
      setRecognizedText(results || []);
    } catch (error) {
      console.error('[CameraScreen] Failed to take picture or detect text:', error);
    }
  };

  const retakePicture = () => {
    setImageUri(null);
    setRecognizedText([]);
  };

  const usePicture = () => {
    console.log('[CameraScreen] Image used:', imageUri);
    console.log('[CameraScreen] Detected text:', recognizedText);
  };

  return (
    <View style={styles.container}>
      {!imageUri ? (
        <>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.topBarButton}
              onPress={() => {
                console.log('[CameraScreen] Back button pressed');
                // Handle back navigation here
              }}
            >
              <Text style={{ color: 'white' }}>Back</Text>
            </TouchableOpacity>
          </View>

          <RNCamera
            ref={cameraRef}
            style={styles.camera}
            captureAudio={false}
            flashMode={flashMode}
            onCameraReady={() => {
              console.log('[CameraScreen] Camera is ready');
              setCameraReady(true);
            }}
          />

          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.shutterButtonOuter} onPress={captureAndDetect}>
              <View style={styles.shutterButtonInner} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.bottomBarRightButton} onPress={captureAndDetect}>
              <Text style={styles.scanButtonText}>Scan</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />

          {/* Display text results */}
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
            <TouchableOpacity style={styles.previewButton} onPress={retakePicture}>
              <Text style={styles.previewButtonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.previewButton} onPress={usePicture}>
              <Text style={styles.previewButtonText}>Use Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // iOS uses full black for camera
  },

  // -- CAMERA PREVIEW --
  camera: {
    flex: 1,
  },

  // -- TOP BAR --
  topBar: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 100,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Soft black overlay
    zIndex: 10,
  },
  topBarButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  // -- BOTTOM CONTROLS (SHUTTER + SCAN) --
  bottomBar: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  shutterButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  shutterButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  bottomBarRightButton: {
    backgroundColor: '#007AFF', // iOS blue
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  scanButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },

  // -- IMAGE PREVIEW --
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  // -- TEXT OVERLAY RESULTS --
  textOverlay: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 8,
    padding: 12,
  },
  textLine: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },

  // -- PREVIEW ACTION BAR --
  previewBottomBar: {
    position: 'absolute',
    bottom: 0,
    height: 90,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  previewButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
  },
  previewButtonText: {
    color: '#0A84FF',
    fontWeight: 'bold',
    fontSize: 17,
  },
});
