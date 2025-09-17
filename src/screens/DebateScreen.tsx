import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import type { Match } from '../types/match';
import type { DebateResponse, DebateType } from '../types/debate';
import { fetchDebate } from '../services/api';

interface DebateScreenProps {
  match: Match;
}

const DebateScreen: React.FC<DebateScreenProps> = ({ match }) => {
  const [debateData, setDebateData] = useState<DebateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debateType, setDebateType] = useState<DebateType>('pre_match');

  useEffect(() => {
    const loadDebate = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Validate match object
        if (!match?.fixture?.id) {
          throw new Error('Invalid match object: missing fixture ID');
        }

        const data = await fetchDebate(match.fixture.id, debateType);

        setDebateData(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load debate data';
        setError(errorMessage);
        console.error('Error fetching debate:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDebate();
  }, [match, debateType]);

  const getStanceColor = (
    stance: 'agree' | 'disagree' | 'wildcard' | DebateType
  ) => {
    switch (stance) {
      case 'agree':
        return '#4CAF50';
      case 'disagree':
        return '#F44336';
      case 'wildcard':
        return '#FF9800';
      default:
        return '#666';
    }
  };

  const getStanceIcon = (stance: string) => {
    switch (stance) {
      case 'agree':
        return '👍';
      case 'disagree':
        return '👎';
      case 'wildcard':
        return '🎯';
      default:
        return '❓';
    }
  };

  const handleStancePress = (stance: string) => {
    // TODO: Implement voting functionality
    console.log('Voted for stance:', stance);
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading debate...</Text>
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

  if (!debateData) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.noDataText}>No debate data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Match Debate</Text>
        <Text style={styles.headerSubtitle}>
          {match.teams.home.name} vs {match.teams.away.name}
        </Text>

        {/* Debate Type Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              debateType === 'pre_match' && styles.toggleButtonActive,
            ]}
            onPress={() => setDebateType('pre_match')}
          >
            <Text
              style={[
                styles.toggleButtonText,
                debateType === 'pre_match' && styles.toggleButtonTextActive,
              ]}
            >
              Pre-Match
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              debateType === 'post_match' && styles.toggleButtonActive,
            ]}
            onPress={() => setDebateType('post_match')}
          >
            <Text
              style={[
                styles.toggleButtonText,
                debateType === 'post_match' && styles.toggleButtonTextActive,
              ]}
            >
              Post-Match
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {/* Debate Prompt */}
        <View style={styles.promptContainer}>
          <Text style={styles.promptHeadline}>{debateData.headline}</Text>
          <Text style={styles.promptDescription}>{debateData.description}</Text>
        </View>

        {/* Debate Cards */}
        {debateData && Array.isArray(debateData.cards)
          ? debateData.cards.map((card, index) => (
              <TouchableOpacity
                key={card.stance}
                style={styles.debateCard}
                onPress={() => handleStancePress(card.stance)}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.stanceIcon}>
                    {getStanceIcon(card.stance)}
                  </Text>
                  <View
                    style={[
                      styles.stanceBadge,
                      { backgroundColor: getStanceColor(card.stance) },
                    ]}
                  >
                    <Text style={styles.stanceText}>
                      {card.stance.charAt(0).toUpperCase() +
                        card.stance.slice(1)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardDescription}>{card.description}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.voteText}>Tap to vote</Text>
                </View>
              </TouchableOpacity>
            ))
          : !isLoading && (
              <Text style={styles.noDebateText}>
                No debate cards available.
              </Text>
            )}
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
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
  content: {
    padding: 16,
  },
  promptContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  promptHeadline: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    lineHeight: 24,
  },
  promptDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  debateCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stanceIcon: {
    fontSize: 24,
  },
  stanceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    alignItems: 'center',
  },
  voteText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  noDebateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default DebateScreen;
