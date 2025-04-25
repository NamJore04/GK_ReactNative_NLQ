/**
 * Types cho navigation trong NLQWellness
 */
import { NavigatorScreenParams } from '@react-navigation/native';
import { ROUTES } from '../config/constants';
import { Habit } from '../types/habit';

// Auth Stack Navigator
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  Dashboard: undefined;
  Habits: undefined;
  Statistics: undefined;
  Settings: undefined;
};

// Main Stack Navigator
export type MainStackParamList = {
  Dashboard: undefined;
  HabitForm: { mode: 'create' | 'edit'; habitId?: string | null };
  HabitDetail: { habitId: string };
  Statistics: undefined;
  Settings: undefined;
};

// Habits Stack Navigator
export type HabitsStackParamList = {
  HabitsList: undefined;
  HabitDetail: { habitId: string };
  CreateHabit: undefined;
  EditHabit: { habit: Habit };
};

// Root Navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  HabitsStack: NavigatorScreenParams<HabitsStackParamList>;
}; 