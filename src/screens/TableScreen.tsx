import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import {Match} from '../types/match';
import {fetchStandings} from '../services/api';

interface Standing {
  rank: number;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  points: number;
  goalsDiff?: number;
  group?: string;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  goalDifference?: number;
}

interface TableScreenProps {
  match: Match;
}

export const TableScreen: React.FC<TableScreenProps> = ({match}) => {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!match || !match.league || !match.league.id) {
      console.warn('Skipping fetch: invalid match or league id', match);
      return;
    }
    const loadStandings = async () => {
      try {
        setLoading(true);
        const {id, season} = match.league;
        const data = await fetchStandings(id, season);
        setStandings(data);
        setError(null);
      } catch (err) {
        setError('Failed to load standings');
        console.log('Error loading standings:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStandings();
  }, [match]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
  return (
    <ScrollView style={styles.container}>
      <View style={styles.tableContainer}>
        {Array.isArray(standings) &&
          standings.map((group, groupIdx) => (
            <View key={groupIdx} style={{marginBottom: 24}}>
              {/* Group Header */}
              {group && group[0] && group[0].group && (
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: 16,
                    marginBottom: 8,
                    marginTop: 8,
                  }}>
                  {group[0].group}
                </Text>
              )}
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, styles.rankCell]}>#</Text>
                <Text style={[styles.headerCell, styles.teamCell]}>Team</Text>
                <Text style={styles.headerCell}>P</Text>
                <Text style={styles.headerCell}>W</Text>
                <Text style={styles.headerCell}>D</Text>
                <Text style={styles.headerCell}>L</Text>
                <Text style={styles.headerCell}>GF-GA</Text>
                <Text style={styles.headerCell}>GD</Text>
                <Text style={styles.headerCell}>Pts</Text>
              </View>
              {group.map(standing => {
                let rowStyle = [styles.tableRow];
                if (standing.team.name === match.teams.home.name) {
                  rowStyle.push({
                    backgroundColor:
                      '#007AFF' as import('react-native').ViewStyle,
                  }); // Blue for home
                } else if (standing.team.name === match.teams.away.name) {
                  rowStyle.push({
                    backgroundColor:
                      '#FFDF00' as import('react-native').ViewStyle,
                  }); // Yellow for away
                }
                return (
                  <View
                    key={`${standing.rank}-${standing.team.id}`}
                    style={rowStyle}>
                    <Text style={[styles.cell, styles.rankCell]}>
                      {standing.rank}
                    </Text>
                    <View
                      style={[
                        styles.cell,
                        styles.teamCell,
                        {flexDirection: 'row', alignItems: 'center'},
                      ]}>
                      <Image
                        source={{uri: standing.team.logo}}
                        style={{width: 20, height: 20, marginRight: 6}}
                      />
                      <Text
                        numberOfLines={2}
                        allowFontScaling={false}
                        style={{flex: 1}}>
                        {standing.team.name}
                      </Text>
                    </View>
                    <Text style={styles.cell}>{standing.all.played}</Text>
                    <Text style={styles.cell}>{standing.all.win}</Text>
                    <Text style={styles.cell}>{standing.all.draw}</Text>
                    <Text style={styles.cell}>{standing.all.lose}</Text>
                    <Text
                      style={
                        styles.cell
                      }>{`${standing.all.goals.for}-${standing.all.goals.against}`}</Text>
                    <Text style={styles.cell}>
                      {standing.goalsDiff ?? standing.goalDifference}
                    </Text>
                    <Text style={styles.cell}>{standing.points}</Text>
                  </View>
                );
              })}
            </View>
          ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableContainer: {
    padding: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerCell: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 12,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  highlightedRow: {
    backgroundColor: '#e3f2fd',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
  },
  rankCell: {
    flex: 0.5,
  },
  teamCell: {
    flex: 5,
    textAlign: 'left',
    paddingLeft: 8,
    flexWrap: 'wrap',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});
