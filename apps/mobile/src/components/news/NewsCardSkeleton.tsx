import React from 'react';
import {View, StyleSheet, Platform} from 'react-native';

/**
 * Loading skeleton component for news article cards
 * Displays placeholder content while news is loading
 */
const NewsCardSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.imagePlaceholder} />
      <View style={styles.content}>
        <View style={styles.titleLine} />
        <View style={styles.titleLineShort} />
        <View style={styles.snippetLine} />
        <View style={styles.snippetLine} />
        <View style={styles.metaLine} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    marginRight: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  titleLine: {
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
    width: '90%',
  },
  titleLineShort: {
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 12,
    width: '60%',
  },
  snippetLine: {
    height: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 6,
    width: '100%',
  },
  metaLine: {
    height: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginTop: 8,
    width: '40%',
  },
});

export default NewsCardSkeleton;

