// ML_logic.js
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import Tflite from 'react-native-tflite';
import TextRecognition from 'react-native-text-recognition';

const tflite = new Tflite();

/**
 * Load the TFLite model
 */
export const loadModel = () => {
  return new Promise((resolve, reject) => {
    tflite.loadModel(
      {
        model: 'models/best_float16.tflite',
        numThreads: 1,
      },
      (err, res) => {
        if (err) {
          console.error('Error loading model:', err);
          reject(err);
        } else {
          console.log('Model loaded successfully:', res);
          resolve(res);
        }
      }
    );
  });
};

/**
 * Run YOLO object detection on an image
 * @param {string} imagePath - URI of image (e.g., from RNCamera)
 */
export const detectObjectsWithTFLite = (imagePath) => {
  return new Promise((resolve, reject) => {
    if (!imagePath.startsWith('file://')) {
      imagePath = `file://${imagePath}`;
    }

    tflite.detectObjectOnImage(
      {
        path: imagePath,
        model: 'YOLO',
        imageMean: 0.0,
        imageStd: 255.0,
        threshold: 0.4,
        numResultsPerClass: 5,
      },
      (err, res) => {
        if (err) {
          console.error('TFLite detection error:', err);
          reject(err);
        } else {
          console.log('TFLite detection results:', res);
          resolve(res);
        }
      }
    );
  });
};

/**
 * Run MLKit OCR text recognition on an image
 * @param {string} imagePath - URI of image (e.g., from RNCamera)
 */
export const detectText = async (imagePath) => {
  try {
    let actualPath = imagePath;

    if (Platform.OS === 'ios' && actualPath.startsWith('file://')) {
      actualPath = actualPath.replace('file://', '');
    }

    const result = await TextRecognition.recognize(actualPath);

    console.log('Text recognition result:', result);
    return result;
  } catch (err) {
    console.error('Text recognition failed:', err);
    throw err;
  }
};
