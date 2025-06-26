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
import type {RootStackParamList} from '../types/navigation';
import StoryScreen from './StoryScreen';
import LineupScreen from './LineupScreen';
import NewsScreen from './NewsScreen';
import DebateScreen from './DebateScreen';
import {TableScreen} from './TableScreen';

type MatchDetailsRouteProp = RouteProp<RootStackParamList, 'MatchDetails'>;
const Tab = createMaterialTopTabNavigator();

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
            width: width / 5,
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
          options={{
            tabBarLabel: 'Lineup',
          }}>
          {() => <LineupScreen match={match} />}
        </Tab.Screen>
        <Tab.Screen
          name="Table"
          options={{
            tabBarLabel: 'Table',
          }}>
          {() => <TableScreen match={match} />}
        </Tab.Screen>
        <Tab.Screen
          name="News"
          options={{
            tabBarLabel: 'News',
          }}>
          {() => <NewsScreen match={match} />}
        </Tab.Screen>
        <Tab.Screen
          name="Debate"
          options={{
            tabBarLabel: 'Debate',
          }}>
          {() => <DebateScreen match={match} />}
        </Tab.Screen>
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
    marginBottom: 16,
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
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  headerButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MatchDetailsScreen;
