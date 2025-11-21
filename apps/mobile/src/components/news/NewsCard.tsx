import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NavigationProp} from '@react-navigation/native';
import {Ionicons} from '@expo/vector-icons';
import type {RootStackParamList} from '../../types/navigation';
import type {NewsArticle} from '../../types/news';

interface NewsCardProps {
  article: NewsArticle;
}

/**
 * News article card component
 * Displays article information and handles navigation to article view
 */
const NewsCard: React.FC<NewsCardProps> = ({article}) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handlePress = () => {
    navigation.navigate('NewsWebView', {url: article.sourceUrl});
  };

  const renderImage = () => {
    if (article.imageUrl) {
      return (
        <Image
          source={{uri: article.imageUrl}}
          style={styles.image}
          resizeMode="cover"
        />
      );
    }

    // Placeholder icon with article title overlay
    return (
      <View style={styles.imagePlaceholder}>
        <Ionicons name="football-outline" size={32} color="#999" />
        <Text style={styles.placeholderTitle} numberOfLines={2}>
          {article.title}
        </Text>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Read article: ${article.title}`}>
      {renderImage()}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {article.title}
        </Text>
        {article.snippet && (
          <Text style={styles.snippet} numberOfLines={2}>
            {article.snippet}
          </Text>
        )}
        <View style={styles.meta}>
          <Text style={styles.source}>{article.sourceName}</Text>
          <Text style={styles.separator}>•</Text>
          <Text style={styles.time}>{article.relativeTime}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    alignItems: 'center',
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
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  placeholderTitle: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  snippet: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  source: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  separator: {
    fontSize: 12,
    color: '#999',
    marginHorizontal: 6,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
});

export default NewsCard;
