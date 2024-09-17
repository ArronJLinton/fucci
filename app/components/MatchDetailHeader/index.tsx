import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Match } from '../../types/futbol';
import Lineup from '../Lineup';
import LeagueTable from '../LeagueTable';
import Facts from '../Facts';
import Story from '../Story';
import { TopTabParamList } from '../../types/navigation';
import { screenHeight, screenWidth } from '../../helpers/constants';

interface MatchDetailHeaderProps {
  data: Match;
}

const Tab = createMaterialTopTabNavigator<TopTabParamList>();

function MatchDetailHeader({ data }: MatchDetailHeaderProps) {
  const { fixture, teams, score } = data;
  const { home, away } = teams;
  const { fulltime } = score;
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <View style={styles.team}>
          <Image source={{ uri: home.logo }} style={styles.logo} />
          <Text>{home.name}</Text>
        </View>
        <Text style={styles.score}>
          {fulltime.home} - {fulltime.away}
        </Text>
        <View style={styles.team}>
          <Image source={{ uri: away.logo }} style={styles.logo} />
          <Text>{away.name}</Text>
        </View>
      </View>
      <TabBar data={data} />
    </ScrollView>
  );
}

const TabBar = (data: any) => (
  <Tab.Navigator
    initialRouteName="Lineup"
    screenOptions={{
      tabBarStyle: { backgroundColor: '#f8f9fa' },
    }}>
    <Tab.Screen name="Facts" component={Facts} />
    <Tab.Screen name="Lineup" component={Lineup} initialParams={data} />
    <Tab.Screen name="Table" component={LeagueTable} />
    <Tab.Screen name="Story" component={Story} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    // backgroundColor: 'transparent',
    justifyContent: 'center',
    // alignContent: 'center',
    // height: screenHeight,
    // width: screenWidth
  },
  content: {
    flexDirection: 'row',
    // justifyContent: 'center',
    // TODO: Dynamically adjust height when user scrolls up/down
  },
  team: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    margin: '10%',
  },
  logo: {
    width: 50,
    height: 50,
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});

export default MatchDetailHeader;
