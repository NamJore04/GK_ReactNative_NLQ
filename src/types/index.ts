/**
 * Export tất cả các types và interfaces
 */

export * from './user';
export * from './habit';

// Thêm các interfaces chung

// Interface cho response từ API
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

// Interface cho app state
export interface AppState {
  isInitialized: boolean;
  isOnline: boolean;
  lastSynced: string | null;
  appVersion: string;
}

// Interface cho navigation
export interface NavigationState {
  currentRoute: string;
  previousRoute: string | null;
  params: Record<string, any>;
} 