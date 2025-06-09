import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import type {Match} from '../types/match';

interface PlayerCardProps {
  player: {
    id: number;
    name: string;
    number: number;
    pos: string;
    grid: string;
    photo: string;
  };
  position: {x: number; y: number};
  isAwayTeam: boolean;
}

interface LineupScreenProps {
  match: Match;
}

interface Player {
  id: number;
  name: string;
  number: number;
  pos: string;
  grid: string;
  photo: string;
}

interface LineupData {
  home: {
    starters: Player[];
    substitutes: Player[];
  };
  away: {
    starters: Player[];
    substitutes: Player[];
  };
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  position,
  isAwayTeam,
}) => {
  return (
    <View
      style={[
        styles.playerCard,
        {
          left: `${position.x}%`,
          top: `${position.y}%`,
        },
      ]}>
      <View
        style={[
          styles.playerPhotoContainer,
          isAwayTeam && styles.awayPlayerPhoto,
        ]}>
        <Image
          source={{
            uri:
              player.photo ||
              'https://media.api-sports.io/football/players/default.png',
          }}
          style={styles.playerPhoto}
          resizeMode="cover"
        />
      </View>
      <Text style={[styles.playerName, isAwayTeam && styles.awayPlayerName]}>
        {player.name}
      </Text>
      <Text
        style={[
          styles.playerPosition,
          isAwayTeam && styles.awayPlayerPosition,
        ]}>
        {player.pos}
      </Text>
    </View>
  );
};

const LineupScreen: React.FC<LineupScreenProps> = ({match}) => {
  const {width} = useWindowDimensions();
  const [lineupData, setLineupData] = useState<LineupData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLineup = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Validate match object
        if (!match?.fixture?.id) {
          throw new Error('Invalid match object: missing fixture ID');
        }

        const apiUrl = `https://fucci-api-staging.up.railway.app/v1/api/futbol/lineup?match_id=${match.fixture.id}`;
        console.log('Fetching lineup from URL:', apiUrl);

        const response = await fetch(apiUrl);
        console.log('Response status:', response.status);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch lineup data: ${response.status} ${response.statusText}`,
          );
        }

        const data = await response.json();
        console.log('Raw API response:', JSON.stringify(data, null, 2));

        // Validate the data structure
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid response format');
        }

        if (!data.home || !data.away) {
          throw new Error(
            'Invalid lineup data format: missing home or away team data',
          );
        }

        if (!data.home.starters || !data.away.starters) {
          throw new Error('Invalid lineup data format: missing starters');
        }

        if (
          !Array.isArray(data.home.starters) ||
          !Array.isArray(data.away.starters)
        ) {
          throw new Error(
            'Invalid lineup data format: starters is not an array',
          );
        }

        setLineupData(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load lineup data';
        setError(errorMessage);
        console.error('Error fetching lineup:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLineup();
  }, [match]);

  useEffect(() => {
    if (lineupData) {
      // Log raw player data
      console.log(
        'Raw home players:',
        JSON.stringify(lineupData.home.starters, null, 2),
      );
      console.log(
        'Raw away players:',
        JSON.stringify(lineupData.away.starters, null, 2),
      );

      // Log all grid positions to see what format they're in
      console.log(
        'Home players grid positions:',
        lineupData.home.starters.map(p => ({
          name: p.name,
          grid: p.grid,
          pos: p.pos,
        })),
      );
      console.log(
        'Away players grid positions:',
        lineupData.away.starters.map(p => ({
          name: p.name,
          grid: p.grid,
          pos: p.pos,
        })),
      );

      // Log all goalkeepers (by position)
      const homeGoalkeeper = lineupData.home.starters.find(p => p.pos === 'G');
      const awayGoalkeeper = lineupData.away.starters.find(p => p.pos === 'G');

      console.log('Found home goalkeeper by position:', homeGoalkeeper);
      console.log('Found away goalkeeper by position:', awayGoalkeeper);
    }
  }, [lineupData]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading lineup...</Text>
      </View>
    );
  }

  if (error || !lineupData || !lineupData.home || !lineupData.away) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          {error || 'No lineup data available'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.teamsHeader}>
        <View style={styles.teamHeader}>
          <Image
            source={{uri: match.teams.home.logo}}
            style={styles.teamLogo}
            resizeMode="contain"
          />
          <Text style={styles.teamName}>{match.teams.home.name}</Text>
        </View>
        <View style={styles.teamHeader}>
          <Image
            source={{uri: match.teams.away.logo}}
            style={styles.teamLogo}
            resizeMode="contain"
          />
          <Text style={styles.teamName}>{match.teams.away.name}</Text>
        </View>
      </View>

      <View style={[styles.field, {width: width, height: width * 2.0}]}>
        {/* Field markings */}
        <View style={styles.halfwayLine} />
        <View style={styles.centerCircle} />
        <View style={styles.homeBox} />
        <View style={styles.awayBox} />

        {/* Center line marker for visual debugging */}
        <View style={styles.centerLine} />

        {/* Home team goalkeeper */}
        {lineupData.home.starters
          .filter(player => player.pos === 'G')
          .map(player => (
            <PlayerCard
              key={`home-${player.id}`}
              player={player}
              position={{x: 50, y: 2}}
              isAwayTeam={false}
            />
          ))}

        {/* Home team defenders */}
        {lineupData.home.starters
          .filter(player => player.pos === 'D')
          .map((player, index, array) => {
            const totalPlayers = array.length;
            const safeMargin = 15;
            const usableWidth = 100 - 2 * safeMargin;
            const x =
              totalPlayers === 1
                ? 50
                : safeMargin + (usableWidth / (totalPlayers - 1)) * index;
            return (
              <PlayerCard
                key={`home-${player.id}`}
                player={player}
                position={{x, y: 12}}
                isAwayTeam={false}
              />
            );
          })}

        {/* Home team midfielders */}
        {lineupData.home.starters
          .filter(player => player.pos === 'M')
          .map((player, index, array) => {
            const totalPlayers = array.length;
            const safeMargin = 15;
            const usableWidth = 100 - 2 * safeMargin;
            const x =
              totalPlayers === 1
                ? 50
                : safeMargin + (usableWidth / (totalPlayers - 1)) * index;
            return (
              <PlayerCard
                key={`home-${player.id}`}
                player={player}
                position={{x, y: 25}}
                isAwayTeam={false}
              />
            );
          })}

        {/* Home team forwards */}
        {lineupData.home.starters
          .filter(player => player.pos === 'F')
          .map((player, index, array) => {
            const totalPlayers = array.length;
            const safeMargin = 15;
            const usableWidth = 100 - 2 * safeMargin;
            const x =
              totalPlayers === 1
                ? 50
                : safeMargin + (usableWidth / (totalPlayers - 1)) * index;
            return (
              <PlayerCard
                key={`home-${player.id}`}
                player={player}
                position={{x, y: 37}}
                isAwayTeam={false}
              />
            );
          })}

        {/* Away team goalkeeper */}
        {lineupData.away.starters
          .filter(player => player.pos === 'G')
          .map(player => (
            <PlayerCard
              key={`away-${player.id}`}
              player={player}
              position={{x: 50, y: 90}}
              isAwayTeam={true}
            />
          ))}

        {/* Away team defenders */}
        {lineupData.away.starters
          .filter(player => player.pos === 'D')
          .map((player, index, array) => {
            const totalPlayers = array.length;
            const safeMargin = 15;
            const usableWidth = 100 - 2 * safeMargin;
            const x =
              totalPlayers === 1
                ? 50
                : safeMargin + (usableWidth / (totalPlayers - 1)) * index;
            return (
              <PlayerCard
                key={`away-${player.id}`}
                player={player}
                position={{x, y: 80}}
                isAwayTeam={true}
              />
            );
          })}

        {/* Away team midfielders */}
        {lineupData.away.starters
          .filter(player => player.pos === 'M')
          .map((player, index, array) => {
            const totalPlayers = array.length;
            const safeMargin = 15;
            const usableWidth = 100 - 2 * safeMargin;
            const x =
              totalPlayers === 1
                ? 50
                : safeMargin + (usableWidth / (totalPlayers - 1)) * index;
            return (
              <PlayerCard
                key={`away-${player.id}`}
                player={player}
                position={{x, y: 68}}
                isAwayTeam={true}
              />
            );
          })}

        {/* Away team forwards */}
        {lineupData.away.starters
          .filter(player => player.pos === 'F')
          .map((player, index, array) => {
            const totalPlayers = array.length;
            const safeMargin = 15;
            const usableWidth = 100 - 2 * safeMargin;
            const x =
              totalPlayers === 1
                ? 50
                : safeMargin + (usableWidth / (totalPlayers - 1)) * index;
            return (
              <PlayerCard
                key={`away-${player.id}`}
                player={player}
                position={{x, y: 56}}
                isAwayTeam={true}
              />
            );
          })}
      </View>

      {/* Substitutes sections */}
      <View style={styles.substitutesContainer}>
        <View style={styles.substitutesSection}>
          <Text style={styles.substitutesTitle}>
            {match.teams.home.name} Substitutes
          </Text>
          <View style={styles.substitutesGrid}>
            {lineupData.home.substitutes.map(player => (
              <View key={`home-sub-${player.id}`} style={styles.substituteCard}>
                <Image
                  source={{
                    uri:
                      player.photo ||
                      'https://media.api-sports.io/football/players/default.png',
                  }}
                  style={styles.substitutePhoto}
                  resizeMode="cover"
                />
                <Text style={styles.substituteName}>{player.name}</Text>
                <Text style={styles.substitutePosition}>{player.pos}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.substitutesSection}>
          <Text style={styles.substitutesTitle}>
            {match.teams.away.name} Substitutes
          </Text>
          <View style={styles.substitutesGrid}>
            {lineupData.away.substitutes.map(player => (
              <View key={`away-sub-${player.id}`} style={styles.substituteCard}>
                <Image
                  source={{
                    uri:
                      player.photo ||
                      'https://media.api-sports.io/football/players/default.png',
                  }}
                  style={styles.substitutePhoto}
                  resizeMode="cover"
                />
                <Text style={styles.substituteName}>{player.name}</Text>
                <Text style={styles.substitutePosition}>{player.pos}</Text>
              </View>
            ))}
          </View>
        </View>
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
  },
  teamsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  teamLogo: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  field: {
    backgroundColor: '#4CAF50',
    position: 'relative',
    overflow: 'hidden',
  },
  halfwayLine: {
    position: 'absolute',
    top: '50%',
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  centerCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    transform: [{translateX: -30}, {translateY: -30}],
  },
  homeBox: {
    position: 'absolute',
    top: 0,
    left: '25%',
    width: '50%',
    height: '10%',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  awayBox: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    width: '50%',
    height: '10%',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  centerLine: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  playerCard: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    left: '50%',
    marginLeft: -50,
  },
  playerPhotoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  awayPlayerPhoto: {
    backgroundColor: '#ffeb3b',
  },
  playerPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  playerName: {
    fontSize: 12,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    textAlign: 'center',
  },
  awayPlayerName: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  playerPosition: {
    fontSize: 10,
    color: '#fff',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    marginTop: 2,
  },
  awayPlayerPosition: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  substitutesContainer: {
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  substitutesSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  substitutesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  substitutesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  substituteCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 8,
    width: '31%',
    alignItems: 'center',
  },
  substitutePhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
  },
  substituteName: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  substitutePosition: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
});

export default LineupScreen;
