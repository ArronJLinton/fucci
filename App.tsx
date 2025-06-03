/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {StatusBar} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';

// Screens
import HomeScreen from './src/screens/HomeScreen';

const Tab = createBottomTabNavigator();

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />
          <Tab.Navigator
            screenOptions={{
              tabBarActiveTintColor: '#007AFF',
              tabBarInactiveTintColor: '#666',
              tabBarStyle: {
                backgroundColor: '#fff',
                borderTopColor: '#e0e0e0',
                borderTopWidth: 1,
                elevation: 0,
                shadowOpacity: 0,
                height: 60,
                paddingBottom: 8,
              },
              headerStyle: {
                backgroundColor: '#fff',
                elevation: 0,
                shadowOpacity: 0,
                borderBottomWidth: 1,
                borderBottomColor: '#e0e0e0',
              },
              headerTintColor: '#000',
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}>
            <Tab.Screen
              name="Home"
              component={HomeScreen}
              options={{
                headerShown: false,
                title: 'Matches',
                tabBarIcon: ({color, size}) => (
                  <Icon name="football-outline" size={size} color={color} />
                ),
              }}
            />
          </Tab.Navigator>
        </SafeAreaView>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
