/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import Camera from './utils/Cam&File/cam';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.centeredText}>Tensor Text</Text>
      <Camera style={styles.camContainer}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // vertical centering
    alignItems: 'center',     // horizontal centering
    backgroundColor: 'white', // fixed color
  },
  centeredText: {
    textAlign: 'center',
    fontSize: 18,
    color: 'black',
    marginTop: 40,
  },
  resultText: {
    marginTop: 20,
    fontSize: 16,
    color: 'blue',
  },
  centeredButton: {
    justifyContent: 'center', // fixed typo
    alignItems: 'center',
    borderColor: 'blue',
    color: 'white', // fixed color
  },
  centeredText2: {
    paddingTop: 20,
    textAlign: 'center',
    fontSize: 18,
    color: 'white',
  },
  camContainer: {
    flex: 1,
    width: '50%',
    height: '50%',
  }
});