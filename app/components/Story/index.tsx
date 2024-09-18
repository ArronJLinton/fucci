import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { Icon, MD3Colors } from 'react-native-paper';
import { Camera } from 'react-native-vision-camera'
import {
  runAtTargetFps,
  useCameraDevice,
  useCameraFormat,
  useFrameProcessor,
  useLocationPermission,
  useMicrophonePermission,
} from 'react-native-vision-camera';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
});

export default function Story() {
  const device = useCameraDevice('back')

  // const { hasPermission, requestPermission } = useCameraPermission();
  // const { hasPermission, requestPermission } = useMicrophonePermission();



  // if (!hasPermission) return <Text>This device does not have permission</Text>;
  // if (device == null) return <Text>Device not found</Text>;
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => console.log('Pressed')}>
      <Icon source="camera" color={MD3Colors.error50} size={40} />

      </TouchableOpacity>
    </View>
  );
}
