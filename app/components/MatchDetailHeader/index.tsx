import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Animated,
} from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Match } from '../../types/futbol';
import Lineup from '../Lineup';
import LeagueTable from '../LeagueTable';
import Facts from '../Facts';
import Story from '../Story';
import { TopTabParamList } from '../../types/navigation';
import { screenHeight, screenWidth } from '../../helpers/constants';

const HEADER_MAX_HEIGHT = 150; // Max height of the header
const HEADER_MIN_HEIGHT = 50; // Min height of the header after collapsing
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

interface MatchDetailHeaderProps {
  data: Match;
}

const Tab = createMaterialTopTabNavigator<TopTabParamList>();

const MatchDetailHeader = ({ data }: MatchDetailHeaderProps) => {
  const scrollY = useRef(new Animated.Value(0)).current; // Track the scroll position
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const { fixture, teams, score } = data;
  const { home, away } = teams;
  const { fulltime } = score;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <Animated.View style={styles.content}>
          <Animated.View style={styles.team}>
            <Animated.Image source={{ uri: home.logo }} style={styles.logo} />
            <Animated.Text>{home.name}</Animated.Text>
          </Animated.View>
          <Animated.Text style={styles.score}>
            {fulltime.home} - {fulltime.away}
          </Animated.Text>
          <Animated.View style={styles.team}>
            <Animated.Image source={{ uri: away.logo }} style={styles.logo} />
            <Animated.Text>{away.name}</Animated.Text>
          </Animated.View>
        </Animated.View>
      </Animated.View>
      <Tab.Navigator
        initialRouteName="Lineup"
        screenOptions={
          {
            // tabBarStyle: { backgroundColor: 'yellow' },
          }
        }>
        <Tab.Screen name="Facts" component={Facts} />
        <Tab.Screen name="Lineup">
          {() => <Lineup ref={scrollY} data={data} />}
        </Tab.Screen>
        <Tab.Screen name="Table" component={LeagueTable} />
        <Tab.Screen name="Story" component={Story} />
      </Tab.Navigator>
    </View>
  );
};

// const TabBar = (data: any) => (

// );

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: 'transparent',
    // justifyContent: 'center',
    // alignContent: 'center',
    // height: screenHeight,
    // width: screenWidth
  },
  header: {
    // flex: 1,
    // position: 'absolute',
    // top: 0,
    // left: 0,
    // right: 0,
    // backgroundColor: 'lightblue',
    justifyContent: 'center',
    alignItems: 'center',
    // zIndex: 1,
    elevation: 2, // For Android shadow effect
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
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
    justifyContent: 'center',
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
