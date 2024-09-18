import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { Icon, MD3Colors } from 'react-native-paper';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
});

export default function Story() {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => console.log('Pressed')}>
      <Icon source="camera" color={MD3Colors.error50} size={40} />

      </TouchableOpacity>
    </View>
  );
}
