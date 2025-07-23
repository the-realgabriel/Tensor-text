
import Camera from './utils/Cam&File/cam';
import { View, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View sytle={styles.container} >
      
      <Camera style={styles.camContainer}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // vertical centering
    alignItems: 'center',     // horizontal centering
    backgroundColor: 'black', // fixed color
  },

  camContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  }
});