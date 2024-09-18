import { useContext, useState } from 'react';
import { Text, View, Button, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Matches from '../../screens/Matches';
import History from '../../screens/History';
import News from '../../screens/News';
import TopNavBar from '../TopNavbar';
import MatchContext from '../../context/context';
import MatchDetails from '../../screens/MatchDetails';
import { screenHeight } from '../../helpers/constants';
import { Icon, MD3Colors } from 'react-native-paper';

const BottomTab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MatchStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#eeeeee' },
      }}>
      <Stack.Screen
        name="Matches"
        component={Matches}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MatchDetails"
        component={MatchDetails}
        options={{
          headerTitleContainerStyle: { flex: 1 },
          headerStyle: { height: 0 },
          headerBackImage: () => (
            <View
              style={{
                position: 'absolute',
                top: -screenHeight * 0.06,
                left: 0,
              }}>
              <Icon source="arrow-left" size={30} color={MD3Colors.primary10} />
            </View>
          ),
        }}
      />
    </Stack.Navigator>
  );
};

function MyTabs() {
  return (
    <BottomTab.Navigator
      initialRouteName="MatchScreen"
      screenOptions={{
        tabBarActiveTintColor: '#e91e63',
      }}>
      <BottomTab.Screen
        name="MatchScreen"
        component={MatchStack}
        options={{
          headerShown: false,
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
      {/* <BottomTab.Screen
        name="History"
        component={History}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="history" color={color} size={size} />
          ),
        }}
      /> */}
      <BottomTab.Screen
        name="More"
        component={More}
        options={{
          tabBarLabel: 'More',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bell" color={color} size={size} />
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
    state: { date: matchDate },
    setMatchDate,
  };
  return (
    <MatchContext.Provider value={value}>
      <NavigationContainer>
        <MyTabs />
      </NavigationContainer>
    </MatchContext.Provider>
  );
}

function More() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>More!</Text>
    </View>
  );
}
