import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Ionicons} from '@expo/vector-icons';

interface NewsEmptyProps {
  onRefresh: () => void;
}

/**
 * Empty state component for news feed
 * Displays when no news articles are available
 */
const NewsEmpty: React.FC<NewsEmptyProps> = ({onRefresh}) => {
  return (
    <View style={styles.container}>
      <Ionicons name="newspaper-outline" size={48} color="#999" />
      <Text style={styles.title}>No news available right now</Text>
      <Text style={styles.message}>
        Check back later for the latest football news
      </Text>
      <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
        <Ionicons name="refresh" size={20} color="#007AFF" style={styles.icon} />
        <Text style={styles.refreshText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    minHeight: 200,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  icon: {
    marginRight: 8,
  },
  refreshText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NewsEmpty;

