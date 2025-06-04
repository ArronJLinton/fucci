import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import {useRoute, RouteProp} from '@react-navigation/native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import type {Match} from '../types/match';
import type {RootStackParamList} from '../types/navigation';
import StoryScreen from './StoryScreen';

type MatchDetailsRouteProp = RouteProp<RootStackParamList, 'MatchDetails'>;
const Tab = createMaterialTopTabNavigator();

// Tab Screen Components
const LineupScreen = () => (
  <View style={styles.tabContent}>
    <Text style={styles.comingSoon}>Team Lineups Coming Soon</Text>
  </View>
);

const TableScreen = () => (
  <View style={styles.tabContent}>
    <Text style={styles.comingSoon}>League Table Coming Soon</Text>
  </View>
);

const NewsScreen = () => (
  <View style={styles.tabContent}>
    <Text style={styles.comingSoon}>Match News Coming Soon</Text>
  </View>
);

const getScoreDisplay = (goals: Match['goals']) => {
  if (goals.home === null || goals.away === null) {
    return 'vs';
  }
  return `${goals.home} - ${goals.away}`;
};

const getMatchStatus = (status: Match['fixture']['status']) => {
  if (status.elapsed > 0) {
    return `${status.elapsed}'`;
  }
  if (status.short === 'PST') {
    return 'Postponed';
  }
  if (status.short === 'FT') {
    return 'Full Time';
  }
  const date = new Date(status.long);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const MatchDetailsScreen = () => {
  const route = useRoute<MatchDetailsRouteProp>();
  const {width} = useWindowDimensions();
  const match = route.params.match;

  const MatchHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.matchInfoContainer}>
        <View style={styles.teamContainer}>
          <Image
            source={{uri: match.teams.home.logo}}
            style={styles.teamLogo}
            resizeMode="contain"
          />
          <Text style={styles.teamName}>{match.teams.home.name}</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>
            {match.goals.home} - {match.goals.away}
          </Text>
        </View>
        <View style={styles.teamContainer}>
          <Image
            source={{uri: match.teams.away.logo}}
            style={styles.teamLogo}
            resizeMode="contain"
          />
          <Text style={styles.teamName}>{match.teams.away.name}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <MatchHeader />
      <Tab.Navigator
        screenOptions={{
          tabBarScrollEnabled: true,
          tabBarItemStyle: {
            width: width / 4,
          },
          tabBarStyle: {
            backgroundColor: '#fff',
          },
          tabBarIndicatorStyle: {
            backgroundColor: '#007AFF',
            height: 3,
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
          tabBarPressColor: '#E3F2FD',
          tabBarPressOpacity: 0.8,
        }}>
        <Tab.Screen
          name="Story"
          component={StoryScreen}
          options={{
            tabBarLabel: 'Story',
          }}
        />
        <Tab.Screen
          name="Lineup"
          component={LineupScreen}
          options={{
            tabBarLabel: 'Lineup',
          }}
        />
        <Tab.Screen
          name="Table"
          component={TableScreen}
          options={{
            tabBarLabel: 'Table',
          }}
        />
        <Tab.Screen
          name="News"
          component={NewsScreen}
          options={{
            tabBarLabel: 'News',
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  matchInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamContainer: {
    flex: 1,
    alignItems: 'center',
  },
  teamLogo: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  scoreContainer: {
    paddingHorizontal: 16,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  comingSoon: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default MatchDetailsScreen;
