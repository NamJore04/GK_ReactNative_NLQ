/**
 * Định nghĩa interfaces liên quan đến User cho NLQWellness
 */

// Interface cho thông tin người dùng cơ bản
export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

// Interface cho thông tin người dùng chi tiết
export interface UserProfile extends User {
  profile: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    phoneNumber?: string;
  };
  preferences: {
    notifications: NotificationPreference;
    ui: UIPreference;
    dataSync: {
      enabled: boolean;
      lastSynced?: string;
    };
  };
  stats: {
    totalHabits: number;
    activeHabits: number;
    totalCompletions: number;
    longestStreak: number;
    currentStreak: number;
  };
}

// Interface cho tùy chọn thông báo
export interface NotificationPreference {
  enabled: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // format: 'HH:mm'
    end: string; // format: 'HH:mm'
  };
  habitReminders: boolean;
  streakMilestones: boolean;
  weeklyReport: boolean;
}

// Interface cho tùy chọn giao diện
export interface UIPreference {
  theme: 'light' | 'dark' | 'system';
  language: string;
  weekStartDay: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0: Sunday, 1: Monday, ..., 6: Saturday
  measurementUnit: 'metric' | 'imperial';
}

// Interface cho thông tin xác thực
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Interface cho các action xác thực
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  displayName?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface UpdateProfilePayload {
  displayName?: string;
  photoURL?: string;
  profile?: UserProfile['profile'];
  preferences?: Partial<UserProfile['preferences']>;
} 