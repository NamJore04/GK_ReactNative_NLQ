/**
 * Root Navigation Setup cho NLQWellness
 */
import React from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { RootStackParamList } from './types';
import { useTheme } from '../context/ThemeContext';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { theme } = useTheme();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // Tạo theme tùy chỉnh cho NavigationContainer
  const customTheme = {
    ...(theme.mode === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme.mode === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      primary: theme.colors.primary,
      background: theme.colors.background[theme.mode],
      card: theme.colors.surface[theme.mode],
      text: theme.colors.text.primary[theme.mode],
      border: theme.colors.border[theme.mode],
      notification: theme.colors.error,
    },
  };
  
  return (
    <NavigationContainer theme={customTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 