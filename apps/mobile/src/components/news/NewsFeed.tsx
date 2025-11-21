import React from 'react';
import {View, ScrollView, RefreshControl, StyleSheet} from 'react-native';
import {useNews} from '../../hooks/useNews';
import NewsCard from './NewsCard';
import NewsCardSkeleton from './NewsCardSkeleton';
import NewsError from './NewsError';
import NewsEmpty from './NewsEmpty';
import type {NewsArticle} from '../../types/news';

interface NewsFeedProps {
  limit?: number;
}

/**
 * Main news feed container component
 * Handles loading, error, and empty states
 * Displays list of news articles
 */
const NewsFeed: React.FC<NewsFeedProps> = ({limit = 10}) => {
  const {articles, loading, error, refresh, refreshing} = useNews();

  const handleRefresh = () => {
    refresh();
  };

  // Loading state
  if (loading && articles.length === 0) {
    return (
      <View style={styles.container}>
        {Array.from({length: 3}).map((_, index) => (
          <NewsCardSkeleton key={index} />
        ))}
      </View>
    );
  }

  // Error state
  if (error && articles.length === 0) {
    return (
      <View style={styles.container}>
        <NewsError error={error} onRetry={handleRefresh} />
      </View>
    );
  }

  // Empty state
  if (articles.length === 0) {
    return (
      <View style={styles.container}>
        <NewsEmpty onRefresh={handleRefresh} />
      </View>
    );
  }

  // Display articles (limit to specified number)
  const displayedArticles = articles.slice(0, limit);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#007AFF"
        />
      }>
      {displayedArticles.map((article: NewsArticle) => (
        <NewsCard key={article.id} article={article} />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
});

export default NewsFeed;

