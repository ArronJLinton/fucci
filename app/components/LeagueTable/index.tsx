import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { screenHeight } from '../../helpers/constants';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: screenHeight,
    backgroundColor: 'pink',
  },
});

export default function LeagueTable() {
  return (
    <View style={styles.container}>
      <Text>LeagueTable</Text>
    </View>
  );
}
