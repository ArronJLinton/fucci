import React from 'react';
import {
  Text,
  StyleSheet,
  View,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {Match} from '../types/match';
import type {NavigationProp} from '../types/navigation';

interface DateScreenProps {
  date: Date;
  isSelected?: boolean;
  matches: Match[];
  isLoading?: boolean;
}

const getMatchStatus = (
  status: Match['fixture']['status'],
  fixtureDate: string,
) => {
  if (status.elapsed > 0) {
    return `${status.elapsed}'`;
  }
  if (status.short === 'PST') {
    return 'Postponed';
  }
  if (status.short === 'FT') {
    return 'Full Time';
  }
  const date = new Date(fixtureDate);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getScoreDisplay = (goals: Match['goals']) => {
  if (goals.home === null || goals.away === null) {
    return 'vs';
  }
  return `${goals.home} - ${goals.away}`;
};

const MatchCard: React.FC<{match: Match}> = ({match}) => {
  const navigation = useNavigation<NavigationProp>();

  const handlePress = () => {
    navigation.navigate('MatchDetails', {match});
  };

  return (
    <TouchableOpacity style={styles.matchCard} onPress={handlePress}>
      <Text style={styles.competitionName}>{match.league.name}</Text>
      <View style={styles.matchInfo}>
        <View style={styles.teamContainer}>
          <Image
            source={{uri: match.teams.home.logo}}
            style={[
              styles.teamLogo,
              match.teams.home.winner && styles.winnerTeam,
            ]}
            resizeMode="contain"
          />
          <Text
            style={[
              styles.teamName,
              match.teams.home.winner && styles.winnerText,
            ]}>
            {match.teams.home.name}
          </Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{getScoreDisplay(match.goals)}</Text>
          <Text style={styles.matchStatus}>
            {getMatchStatus(match.fixture.status, match.fixture.date)}
          </Text>
        </View>
        <View style={styles.teamContainer}>
          <Image
            source={{uri: match.teams.away.logo}}
            style={[
              styles.teamLogo,
              match.teams.away.winner && styles.winnerTeam,
            ]}
            resizeMode="contain"
          />
          <Text
            style={[
              styles.teamName,
              match.teams.away.winner && styles.winnerText,
            ]}>
            {match.teams.away.name}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const DateScreen: React.FC<DateScreenProps> = ({
  date: _date,
  isSelected: _isSelected = false,
  matches = [],
  isLoading = false,
}) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976d2" />
          <Text style={styles.loadingText}>Loading matches...</Text>
        </View>
      );
    }

    if (matches.length === 0) {
      return (
        <View style={styles.noMatchesContainer}>
          <Text style={styles.noMatchesText}>
            {isLoading ? 'Loading matches...' : 'No matches found'}
          </Text>
          <Text style={styles.noMatchesSubText}>
            {isLoading
              ? 'Please wait while we fetch the matches'
              : 'Try adjusting your search or check another date'}
          </Text>
        </View>
      );
    }

    return matches.map(match => (
      <MatchCard key={match.fixture.id} match={match} />
    ));
  };

  return <ScrollView style={styles.container}>{renderContent()}</ScrollView>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  selectedCard: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
    borderWidth: 2,
    shadowColor: '#2196f3',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  relativeDay: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  selectedText: {
    color: '#1976d2',
  },
  matchCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  competitionName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  matchInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamContainer: {
    flex: 2,
    alignItems: 'center',
  },
  scoreContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamLogo: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  winnerTeam: {
    transform: [{scale: 1.1}],
  },
  teamName: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    color: '#333',
  },
  winnerText: {
    color: '#2196f3',
    fontWeight: '700',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1976d2',
    marginBottom: 4,
  },
  matchStatus: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  noMatchesContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  noMatchesText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  noMatchesSubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default React.memo(DateScreen, (prev, next) => {
  return (
    prev.date.getTime() === next.date.getTime() &&
    prev.isSelected === next.isSelected &&
    prev.matches === next.matches &&
    prev.isLoading === next.isLoading
  );
});
