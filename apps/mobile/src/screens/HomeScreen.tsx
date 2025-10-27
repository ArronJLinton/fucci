import React, {useMemo, useState} from 'react';
import {
  useWindowDimensions,
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import type {NavigationState} from '@react-navigation/native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Ionicons} from '@expo/vector-icons';
import DateScreen from './DateScreen';
import SearchBar from '../components/SearchBar';
import {fetchMatches} from '../services/api';

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
};

const DateTabScreen: React.FC<DateTabScreenProps> = ({date, searchQuery}) => {
  const route = useRoute();
  const navigation = useNavigation();
  const currentRoute = (navigation.getState() as NavigationState).routes[
    (navigation.getState() as NavigationState).index
  ].name;
  const isSelected = route.name === currentRoute;
  const [matches, setMatches] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (isSelected) {
      setIsLoading(true);
      fetchMatches(date)
        .then(data => {
          if (data) {
            setMatches(data);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isSelected, date]);

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
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

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
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search teams or competitions..."
        isVisible={isSearchVisible}
        onClose={() => {
          setIsSearchVisible(false);
          setSearchQuery('');
        }}
      />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => setIsSearchVisible(true)}>
          <Ionicons name="search-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
      <TabNavigator
        initialRouteName={initialRoute}
        screenOptions={{
          tabBarScrollEnabled: true,
          tabBarItemStyle: {
            width: width / 3,
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
              {() => <DateTabScreen date={date} searchQuery={searchQuery} />}
            </TabScreen>
          );
        })}
      </TabNavigator>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomColor: '#e0e0e0',
    borderBottomWidth: 1,
  },
  searchButton: {
    padding: 8,
  },
});

export default HomeScreen;
