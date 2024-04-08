import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <ImageBackground source={require('../../assets/background2.jpg')} style={styles.container}>
      <View style={styles.upperContainer}>
        <Text style={styles.textStyle}>Welcome to Changyu Qi's travel APP!</Text>
      </View>
      <View style={styles.lowerContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('AddPost')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Map')}
        >
          <Text style={styles.buttonText}>Map</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%', 
    height: '100%',
  },
  upperContainer: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  lowerContainer: {

    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  textStyle: {
    
    fontWeight: 'bold',
    fontSize: 30,
    textAlign: 'center',
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0)',
    padding: 10,
    marginBottom: 260, 
  },
  button: {
    width: '60%', 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 25, 
    alignItems: 'center',
    marginBottom: 20, 
  },
  buttonText: {
    color: '#000', 
    fontSize: 18, 
    fontWeight: 'bold', 
  },
});
