import React, {useMemo, useState} from 'react';
import {
  useWindowDimensions,
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  ScrollView,
  Image,
} from 'react-native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import type {NavigationState} from '@react-navigation/native';
import {useNavigation, useRoute} from '@react-navigation/native';
// Search icon temporarily removed
// import {Ionicons} from '@expo/vector-icons';
import DateScreen from './DateScreen';
import {fetchMatches} from '../services/api';
import {LEAGUES, DEFAULT_LEAGUE, type League} from '../constants/leagues';

type RootTabParamList = {
  [key: string]: undefined;
};

const Tab = createMaterialTopTabNavigator<RootTabParamList>();
const TabNavigator = Tab.Navigator as any;
const TabScreen = Tab.Screen as any;

const getTabLabel = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);

  if (compareDate.getTime() === today.getTime()) {
    return 'Today';
  }

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (compareDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (compareDate.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  }

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return `${days[date.getDay()]} ${date.getDate()}`;
};

type DateTabScreenProps = {
  date: Date;
  searchQuery: string;
  selectedLeague?: League | null;
};

const DateTabScreen: React.FC<DateTabScreenProps> = ({
  date,
  searchQuery,
  selectedLeague,
}) => {
  const route = useRoute();
  const navigation = useNavigation();
  const currentRoute = (navigation.getState() as NavigationState).routes[
    (navigation.getState() as NavigationState).index
  ].name;
  const isSelected = route.name === currentRoute;
  const [matches, setMatches] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const hasLoadedRef = React.useRef(false);
  const isLoadingRef = React.useRef(false);

  // Create a cache key based on date and league
  const cacheKey = React.useMemo(
    () => `${date.toISOString()}-${selectedLeague?.id || 'all'}`,
    [date, selectedLeague?.id],
  );
  const loadedCacheKeysRef = React.useRef<Set<string>>(new Set());

  // Combined effect to handle both reset and fetch
  React.useEffect(() => {
    // If cache key changed, reset state and clear from loaded set
    if (!loadedCacheKeysRef.current.has(cacheKey)) {
      hasLoadedRef.current = false;
      setMatches([]);
    }

    // Fetch matches if tab is selected, league is selected, and this cache key hasn't been loaded
    if (
      isSelected &&
      selectedLeague &&
      !loadedCacheKeysRef.current.has(cacheKey) &&
      !isLoadingRef.current
    ) {
      isLoadingRef.current = true;
      setIsLoading(true);

      const currentCacheKey = cacheKey;
      const currentLeague = selectedLeague;

      // Small delay to allow for smooth tab transitions
      const timeoutId = setTimeout(() => {
        // Verify cache key still matches and we still need to fetch
        if (
          currentCacheKey === cacheKey &&
          isSelected &&
          !loadedCacheKeysRef.current.has(currentCacheKey)
        ) {
          fetchMatches(date, currentLeague.id)
            .then(data => {
              // Verify cache key still matches before setting results
              if (currentCacheKey === cacheKey && data) {
                setMatches(data);
                loadedCacheKeysRef.current.add(currentCacheKey);
                hasLoadedRef.current = true;
              }
            })
            .catch(error => {
              console.error('Error loading matches:', error);
              // Don't mark as loaded on error so we can retry
            })
            .finally(() => {
              if (currentCacheKey === cacheKey) {
                isLoadingRef.current = false;
                setIsLoading(false);
              }
            });
        } else {
          // Cache key changed or already loaded, reset flags
          isLoadingRef.current = false;
          setIsLoading(false);
        }
      }, 100);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [isSelected, date, selectedLeague, cacheKey]);

  const filteredMatches = React.useMemo(() => {
    if (!searchQuery) return matches;

    const query = searchQuery.toLowerCase();
    return matches.filter(
      match =>
        match.teams.home.name.toLowerCase().includes(query) ||
        match.teams.away.name.toLowerCase().includes(query) ||
        match.league.name.toLowerCase().includes(query),
    );
  }, [matches, searchQuery]);

  return (
    <DateScreen
      date={date}
      isSelected={isSelected}
      matches={filteredMatches}
      isLoading={isLoading}
    />
  );
};

const HomeScreen = () => {
  const {width} = useWindowDimensions();
  // Search temporarily removed
  // const [searchQuery, setSearchQuery] = useState('');
  // const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(
    DEFAULT_LEAGUE,
  );

  const dates = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateArray = [];

    for (let i = -3; i <= 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dateArray.push(date);
    }

    return dateArray;
  }, []);

  const todayIndex = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dates.findIndex(date => date.getTime() === today.getTime());
  }, [dates]);

  const initialRoute = useMemo(() => {
    const initialDate = dates[todayIndex !== -1 ? todayIndex : 0];
    return `date-${initialDate.toISOString()}`;
  }, [dates, todayIndex]);

  return (
    <View style={{flex: 1}}>
      {/* Search temporarily removed */}
      {/* <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search teams or competitions..."
        isVisible={isSearchVisible}
        onClose={() => {
          setIsSearchVisible(false);
          setSearchQuery('');
        }}
      /> */}
      {/* Date Tabs on Top */}
      <TabNavigator
        initialRouteName={initialRoute}
        screenOptions={{
          tabBarScrollEnabled: true,
          tabBarItemStyle: {
            width: width / 3,
          },
          tabBarStyle: {
            backgroundColor: '#fff',
            borderBottomWidth: 1,
            borderBottomColor: '#e0e0e0',
          },
          tabBarIndicatorStyle: {
            backgroundColor: '#007AFF',
            height: 3,
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
          tabBarPressColor: '#E3F2FD',
          tabBarPressOpacity: 0.8,
          lazy: true,
        }}>
        {dates.map(date => {
          const dateString = date.toISOString();
          const screenKey = `date-${dateString}`;

          return (
            <TabScreen
              key={screenKey}
              name={screenKey}
              options={{
                title: getTabLabel(date),
                tabBarLabel: getTabLabel(date),
                tabBarAccessibilityLabel: `Switch to ${getTabLabel(date)}`,
              }}>
              {() => (
                <View style={{flex: 1}}>
                  {/* League Tabs Below Date Tabs */}
                  <View style={styles.leagueTabsHeader}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.leagueTabsContainer}
                      style={styles.leagueTabsScroll}>
                      {LEAGUES.map(league => {
                        const isSelected = selectedLeague?.id === league.id;
                        return (
                          <TouchableOpacity
                            key={league.id}
                            style={[
                              styles.leagueTab,
                              isSelected && styles.leagueTabSelected,
                            ]}
                            onPress={() => setSelectedLeague(league)}>
                            {league.logo && (
                              <Image
                                source={{uri: league.logo}}
                                style={styles.leagueLogo}
                                resizeMode="contain"
                              />
                            )}
                            <Text
                              style={[
                                styles.leagueTabText,
                                isSelected && styles.leagueTabTextSelected,
                              ]}>
                              {league.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                  <View style={{flex: 1}}>
                    <DateTabScreen
                      date={date}
                      searchQuery="" // Search temporarily removed
                      selectedLeague={selectedLeague}
                    />
                  </View>
                </View>
              )}
            </TabScreen>
          );
        })}
      </TabNavigator>
    </View>
  );
};

const styles = StyleSheet.create({
  leagueTabsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomColor: '#e0e0e0',
    borderBottomWidth: 1,
    minHeight: 100,
  },
  leagueTabsScroll: {
    flex: 1,
  },
  leagueTabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  leagueTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  leagueTabSelected: {
    backgroundColor: '#FFD700', // Yellow background for selected
    borderColor: '#FFD700',
  },
  leagueLogo: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  leagueTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  leagueTabTextSelected: {
    color: '#000',
    fontWeight: '700',
  },
  // Search button temporarily removed
  // searchButton: {
  //   padding: 8,
  // },
});

export default HomeScreen;
