/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
<<<<<<< HEAD
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
=======
import {NavigationContainer} from '@react-navigation/native';
const NavigationContainerComponent = NavigationContainer as any;
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {StatusBar} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
const IconComponent = Icon as any;
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
const SafeAreaViewComponent = SafeAreaView as any;
>>>>>>> f0663344 (migrating to expo ...)

// Screens
import HomeScreen from './src/screens/HomeScreen';
import MatchDetailsScreen from './src/screens/MatchDetailsScreen';
import CameraPreviewScreen from './src/screens/CameraPreviewScreen';
import NewsWebViewScreen from './src/screens/NewsWebViewScreen';

// Types
import type { RootStackParamList } from './src/types/navigation';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

// Type assertions to fix React version compatibility
const TabNavigator = Tab.Navigator as any;
const TabScreen = Tab.Screen as any;
const StackNavigator = Stack.Navigator as any;
const StackScreen = Stack.Screen as any;
const StackGroup = Stack.Group as any;

const HomeStack = () => {
  return (
    <StackNavigator>
      <StackScreen
        name="HomeTab"
        component={HomeScreen}
        options={{
          headerShown: false,
          title: '',
        }}
      />
      <StackScreen
        name="MatchDetails"
        component={MatchDetailsScreen}
        options={{
          title: '',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerShadowVisible: false,
          headerTintColor: '#007AFF',
        }}
      />
    </StackNavigator>
  );
};

const MainStack = () => {
  return (
<<<<<<< HEAD
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
=======
    <SafeAreaViewComponent style={{flex: 1, backgroundColor: '#fff'}}>
>>>>>>> f0663344 (migrating to expo ...)
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <TabNavigator
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
<<<<<<< HEAD
        }}
      >
        <Tab.Screen
=======
        }}>
        <TabScreen
>>>>>>> f0663344 (migrating to expo ...)
          name="Home"
          component={HomeStack}
          options={{
            headerShown: false,
<<<<<<< HEAD
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="football-outline" size={size} color={color} />
=======
            tabBarIcon: ({color, size}) => (
              <IconComponent
                name="football-outline"
                size={size}
                color={color}
              />
>>>>>>> f0663344 (migrating to expo ...)
            ),
            tabBarLabel: () => null,
            title: '',
          }}
        />
      </TabNavigator>
    </SafeAreaViewComponent>
  );
};

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
<<<<<<< HEAD
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={MainStack} />
          <Stack.Group screenOptions={{ presentation: 'fullScreenModal' }}>
            <Stack.Screen
=======
      <NavigationContainerComponent>
        <StackNavigator screenOptions={{headerShown: false}}>
          <StackScreen name="Main" component={MainStack} />
          <StackGroup screenOptions={{presentation: 'fullScreenModal'}}>
            <StackScreen
>>>>>>> f0663344 (migrating to expo ...)
              name="CameraPreview"
              component={CameraPreviewScreen}
              options={{
                animation: 'slide_from_bottom',
              }}
            />
            <StackScreen
              name="NewsWebView"
              component={NewsWebViewScreen}
              options={{
                headerShown: false,
                animation: 'slide_from_bottom',
              }}
            />
          </StackGroup>
        </StackNavigator>
      </NavigationContainerComponent>
    </SafeAreaProvider>
  );
}

export default App;
