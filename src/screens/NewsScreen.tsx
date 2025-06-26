import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {Match} from '../types/match';
import type {NavigationProp} from '../types/navigation';

interface NewsItem {
  timestamp: string;
  title: string;
  snippet: string;
  images: {
    thumbnail: string;
    thumbnailProxied: string;
  };
  newsUrl: string;
  publisher: string;
}

interface NewsScreenProps {
  match: Match;
}

const NewsScreen: React.FC<NewsScreenProps> = ({match}) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList, 'News'>>();
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Validate match object
        if (!match?.teams?.home?.name || !match?.teams?.away?.name) {
          throw new Error('Invalid match object: missing team names');
        }

        // Create search query
        const homeTeam = match.teams.home.name;
        const awayTeam = match.teams.away.name;
        const searchQuery = `${homeTeam} vs ${awayTeam}`;

        // Encode the query for URL
        const encodedQuery = encodeURIComponent(searchQuery);

        const apiUrl = `https://fucci-api-staging.up.railway.app/v1/api/google/search?q=${encodedQuery}&lr=en-US`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch news data: ${response.status} ${response.statusText}`,
          );
        }

        const data = await response.json();

        // Check for no news data message
        if (data.message === 'No news data available') {
          setNewsData([]);
          return;
        }

        // Validate the data structure
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid response format');
        }

        // Extract news items from the response
        // Assuming the API returns an array of news items or has a specific structure
        let newsItems: NewsItem[] = [];

        if (Array.isArray(data)) {
          newsItems = data;
        } else if (data.items && Array.isArray(data.items)) {
          newsItems = data.items;
        } else if (
          data.organic_results &&
          Array.isArray(data.organic_results)
        ) {
          newsItems = data.organic_results;
        } else {
          // If the structure is different, try to extract what we can
          console.error('Unexpected data structure encountered:', data);
          // Log the error and gracefully handle the unexpected data structure
          setNewsData([]);
          return;
        }

        setNewsData(newsItems);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load news data';
        setError(errorMessage);
        console.error('Error fetching news:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [match]);

  const handleNewsItemPress = (url: string) => {
    navigation.navigate('NewsWebView', {url});
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading news...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!newsData || newsData.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.noDataText}>No news available for this match</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.newsContainer}>
        {newsData.map((item, index) => (
          <TouchableOpacity
            key={item.newsUrl}
            style={styles.newsItem}
            onPress={() => handleNewsItemPress(item.newsUrl)}>
            {(item.images.thumbnail || item.images.thumbnailProxied) && (
              <Image
                source={{
                  uri: item.images.thumbnail || item.images.thumbnailProxied,
                }}
                style={styles.newsImage}
                resizeMode="cover"
              />
            )}
            <View style={styles.newsContent}>
              <Text style={styles.newsTitle} numberOfLines={3}>
                {item.title}
              </Text>
              <Text style={styles.newsSnippet} numberOfLines={3}>
                {item.snippet}
              </Text>
              <Text style={styles.newsPublisher}>{item.publisher}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  newsContainer: {
    padding: 16,
  },
  newsItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  newsImage: {
    width: '100%',
    height: 200,
  },
  newsContent: {
    padding: 16,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 24,
  },
  newsSnippet: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  newsPublisher: {
    fontSize: 12,
    color: '#666',
  },
});

export default NewsScreen;
