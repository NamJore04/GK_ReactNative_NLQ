/**
 * Định nghĩa interfaces liên quan đến Habit cho NLQWellness
 */
import { HABIT_TYPES, FREQUENCIES } from '../config/constants';

// Type cho loại thói quen
export type HabitType = typeof HABIT_TYPES[keyof typeof HABIT_TYPES];

// Type cho tần suất thói quen
export type Frequency = typeof FREQUENCIES[keyof typeof FREQUENCIES];

// Interface cho thông tin nhắc nhở
export interface Reminder {
  id: string;
  time: string; // format: 'HH:mm'
  days: number[]; // 0: Sunday, 1: Monday, ..., 6: Saturday
  enabled: boolean;
}

// Interface cho dữ liệu hoàn thành thói quen
export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string; // format: 'YYYY-MM-DD'
  completedAt: string; // ISO date string
  value: number;
  notes?: string;
}

// Interface cho thói quen
export interface Habit {
  id: string;
  userId: string;
  name: string;
  type: HabitType;
  icon?: string;
  color?: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  frequency: Frequency;
  reminders: Reminder[];
  createdAt: string;
  updatedAt: string;
  completions?: Record<string, HabitCompletion>; // key is date 'YYYY-MM-DD'
  streak: number;
  bestStreak: number;
  active: boolean;
  notes?: string;
}

// Interface cho state quản lý habits
export interface HabitsState {
  habits: Record<string, Habit>; // key is habitId
  filteredHabits: string[]; // array of habitIds
  selectedHabit: string | null; // habitId
  completions: Record<string, Record<string, HabitCompletion>>; // key1 is habitId, key2 is date
  isLoading: boolean;
  error: string | null;
}

// Interface cho habit summary trên dashboard
export interface HabitSummary {
  id: string;
  name: string;
  type: HabitType;
  icon?: string;
  color?: string;
  progress: number; // 0-100
  isCompleted: boolean;
  streak: number;
}

// Interface cho thống kê habit
export interface HabitStatistics {
  habitId: string;
  completionRate: number; // 0-100, percentage
  dailyCompletion: Record<string, number>; // key is date 'YYYY-MM-DD', value is completion value
  weeklyCompletion: Record<string, number>; // key is 'YYYY-WW' (year-week), value is avg completion
  monthlyCompletion: Record<string, number>; // key is 'YYYY-MM' (year-month), value is avg completion
  streakHistory: {
    startDate: string;
    endDate: string;
    length: number;
  }[];
}

// Interface cho filters
export interface HabitFilters {
  type?: HabitType[];
  active?: boolean;
  sortBy?: 'name' | 'createdAt' | 'streak' | 'completionRate';
  sortDirection?: 'asc' | 'desc';
} 