/**
 * Các hằng số cho ứng dụng NLQWellness
 */

// App Info
export const APP_NAME = 'NLQWellness';
export const APP_VERSION = '1.0.0';

// Firebase Collections
export const COLLECTIONS = {
  USERS: 'users',
  HABITS: 'habits',
  HABIT_COMPLETIONS: 'habitCompletions',
  USER_PREFERENCES: 'userPreferences',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@NLQWellness:authToken',
  USER_DATA: '@NLQWellness:userData',
  USER_PREFERENCES: '@NLQWellness:userPreferences',
  HABITS: '@NLQWellness:habits',
  HABIT_COMPLETIONS: '@NLQWellness:habitCompletions',
  THEME_MODE: '@NLQWellness:themeMode',
};

// Navigation Routes
export const ROUTES = {
  AUTH: {
    LOGIN: 'Login',
    REGISTER: 'Register',
    FORGOT_PASSWORD: 'ForgotPassword',
  },
  MAIN: {
    DASHBOARD: 'Dashboard',
    HABITS: 'Habits',
    STATISTICS: 'Statistics',
    SETTINGS: 'Settings',
  },
  HABITS: {
    LIST: 'HabitsList',
    DETAIL: 'HabitDetail',
    CREATE: 'CreateHabit',
    EDIT: 'EditHabit',
  },
};

// HabitTypes
export const HABIT_TYPES = {
  WATER: 'water',
  SLEEP: 'sleep',
  EXERCISE: 'exercise',
  MOOD: 'mood',
};

// Habit Frequencies
export const FREQUENCIES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
};

// Default Units
export const DEFAULT_UNITS = {
  WATER: 'ml',
  SLEEP: 'giờ',
  EXERCISE: 'phút',
  MOOD: '',
};

// Default Values
export const DEFAULT_VALUES = {
  WATER: 2000,
  SLEEP: 8,
  EXERCISE: 30,
  MOOD: 5,
};

// API Config
export const API_TIMEOUT = 15000; // 15 seconds

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  SERVER: 'YYYY-MM-DD',
  TIME: 'HH:mm',
  DATETIME: 'DD/MM/YYYY HH:mm',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  HABIT_REMINDER: 'habitReminder',
  STREAK_MILESTONE: 'streakMilestone',
  SYSTEM: 'system',
};

// Validation Constraints
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_HABIT_NAME_LENGTH: 50,
  MAX_HABIT_NOTE_LENGTH: 500,
};

// Animation Durations (in ms)
export const ANIMATION = {
  SHORT: 200,
  MEDIUM: 400,
  LONG: 800,
}; 