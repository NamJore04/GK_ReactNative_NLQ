/**
 * Main Navigation Tab cho NLQWellness
 */
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MainStackParamList } from './types';
import DashboardScreen from '../screens/main/DashboardScreen';
import HabitFormScreen from '../screens/main/HabitFormScreen';
import HabitDetailScreen from '../screens/main/HabitDetailScreen';
import { useTheme } from '../context/ThemeContext';

const Stack = createStackNavigator<MainStackParamList>();

const MainNavigator: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: theme.colors.background[theme.mode] },
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="HabitForm" component={HabitFormScreen} />
      <Stack.Screen name="HabitDetail" component={HabitDetailScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator; 