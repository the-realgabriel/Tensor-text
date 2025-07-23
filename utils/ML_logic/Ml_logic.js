import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import Tflite from 'react-native-tflite';
import TextRecognition from 'react-native-text-recognition';

const tflite = new Tflite();


export const loadModel = () => {
  return new Promise((resolve, reject) => {
    try {
      tflite.loadModel(
        {
          model: 'models/best_float16.tflite',
          numThreads: 2,
        },
        (err, res) => {
          if (err) {
            console.error('[ML_LOGIC] Error loading model:', err);
            reject(err);
          } else {
            console.log('[ML_LOGIC] Model loaded successfully:', res);
            resolve(res);
          }
        }
      );
    } catch (error) {
      console.error('[ML_LOGIC] Caught exception during model load:', error);
      reject(error);
    }
  });
};

/**
 * Run YOLO object detection on an image (currently unused)
 * @param {string} imagePath 
 */
export const detectObjectsWithTFLite = (imagePath) => {
  return new Promise((resolve, reject) => {
    try {
      if (!imagePath || typeof imagePath !== 'string') {
        throw new Error('Invalid image path for detection');
      }

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
            console.error('[ML_LOGIC] TFLite detection error:', err);
            reject(err);
          } else {
            console.log('[ML_LOGIC] TFLite detection results:', res);
            resolve(res);
          }
        }
      );
    } catch (error) {
      console.error('[ML_LOGIC] Exception in detectObjectsWithTFLite:', error);
      reject(error);
    }
  });
};

/**
 * Run MLKit OCR text recognition on an image
 * Auto-classifies into emails, links, phones, plain
 * @param {string} imagePath - URI of image (e.g., from RNCamera)
 * @returns {object} { links, emails, phones, plain }
 */
export const detectText = async (imagePath) => {
  try {
    if (!imagePath || typeof imagePath !== 'string') {
      throw new Error('[ML_LOGIC] Invalid image path for text recognition.');
    }

    let actualPath = imagePath;

    // iOS file path cleanup
    if (Platform.OS === 'ios' && actualPath.startsWith('file://')) {
      actualPath = actualPath.replace('file://', '');
    }

    const result = await TextRecognition.recognize(actualPath);

    if (!Array.isArray(result)) {
      throw new Error('[ML_LOGIC] Unexpected result format from TextRecognition');
    }

    console.log('[ML_LOGIC] Raw text recognition result:', result);

    const links = [];
    const emails = [];
    const phones = [];
    const plain = [];

    const urlRegex = /https?:\/\/[^\s]+|www\.[^\s]+/i;
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3,5}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5}/;

    result.forEach(line => {
      try {
        if (emailRegex.test(line)) {
          emails.push(line);
        } else if (urlRegex.test(line)) {
          links.push(line);
        } else if (phoneRegex.test(line)) {
          phones.push(line);
        } else {
          plain.push(line);
        }
      } catch (lineError) {
        console.warn('[ML_LOGIC] Failed to classify line:', line, lineError);
      }
    });

    return {
      links,
      emails,
      phones,
      plain
    };
  } catch (err) {
    console.error('[ML_LOGIC] Text recognition failed:', err);
    return {
      links: [],
      emails: [],
      phones: [],
      plain: [],
      error: err.message,
    };
  }
};
