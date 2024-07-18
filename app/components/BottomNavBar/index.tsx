import { useContext, useState } from 'react';
import { Text, View, Button, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Matches from '../../screens/Matches'
import History from '../../screens/History'
import News from '../../screens/News'
import TopNavBar from '../TopNavbar'
import { MatchContext } from '../../context/context';

const BottomTab = createBottomTabNavigator();

function MyTabs() {

  return (
    <BottomTab.Navigator
      initialRouteName="Matches"
      screenOptions={{
        tabBarActiveTintColor: '#e91e63',
      }}
    >
      <BottomTab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bell" color={color} size={size} />
          ),
        }}
      />
      <BottomTab.Screen
        name="Matches"
        component={Matches}
        options={{
          header: (props) => (
            <TopNavBar />
          ),
          tabBarLabel: 'Matches',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bell" color={color} size={size} />
          ),
        }}
      />

      <BottomTab.Screen
        name="News"
        component={News}
        options={{
          tabBarLabel: 'News',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bell" color={color} size={size} />
          ),
        }}
      />
      <BottomTab.Screen
        name="History"
        component={History}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="history" color={color} size={size} />
          ),
        }}
      />
    </BottomTab.Navigator>
  );
}

export default function BottomNavBar() {
  const date = new Date();
  const formattedDate = date.toISOString().split('T')[0];
  const [matchDate, setMatchDate] = useState<string>(formattedDate);
  const value = {
    state: { date: matchDate},
    setMatchDate
  }
  return (
    <MatchContext.Provider value={value}>
      <NavigationContainer>
        <MyTabs />
      </NavigationContainer>
    </MatchContext.Provider>

  );
}

function Home() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Home!</Text>
    </View>
  );
}