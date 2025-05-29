import React, {useMemo, useCallback} from 'react';
import {useWindowDimensions} from 'react-native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import type {NavigationState} from '@react-navigation/native';
import DateScreen from './DateScreen';

type RootTabParamList = {
  [key: string]: undefined;
};

const Tab = createMaterialTopTabNavigator<RootTabParamList>();

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

const HomeScreen = () => {
  const {width} = useWindowDimensions();

  const dates = useMemo(() => {
    const today = new Date();
    const dateArray = [];

    // Log the actual today's date for debugging
    console.log('Today:', today.toISOString());

    for (let i = -3; i <= 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      date.setHours(0, 0, 0, 0);
      dateArray.push(date);
      // Log each generated date for debugging
      console.log(`Date ${i}:`, date.toISOString());
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

  const renderDateScreen = useCallback(({route, navigation}: any) => {
    const currentRoute = (navigation.getState() as NavigationState).routes[
      (navigation.getState() as NavigationState).index
    ].name;
    const isSelected = route.name === currentRoute;
    const dateString = route.name.split('-')[1];
    const date = new Date(dateString);

    console.log('HomeScreen rendering DateScreen:', {
      routeName: route.name,
      currentRoute,
      isSelected,
      dateString,
      date: date.toISOString(),
    });

    return <DateScreen key={route.name} date={date} isSelected={isSelected} />;
  }, []);

  return (
    <Tab.Navigator
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
        console.log('TAB DATE:', dateString, screenKey);
        return (
          <Tab.Screen
            key={screenKey}
            name={screenKey}
            component={renderDateScreen}
            options={{
              title: getTabLabel(date),
              tabBarLabel: getTabLabel(date),
              tabBarAccessibilityLabel: `Switch to ${getTabLabel(date)}`,
            }}
          />
        );
      })}
    </Tab.Navigator>
  );
};

export default HomeScreen;
