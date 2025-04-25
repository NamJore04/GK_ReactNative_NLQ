/**
 * Habit Actions cho NLQWellness
 */
import { Dispatch } from 'redux';
import { HabitActionTypes } from './habitActionTypes';
import { RootState, AppThunk, AppDispatch } from '../index';
import { Action } from 'redux';
import { 
  Habit, 
  HabitCompletion, 
  HabitFilters,
  HabitStatistics
} from '../../types/habit';
import { firebaseDatabase } from '../../config/firebase';
import { generateId, formatDate, calculateStreak } from '../../utils/helpers';

// Fetch Habits
export const fetchHabits = (): AppThunk => async (dispatch, getState) => {
  try {
    dispatch({ type: HabitActionTypes.FETCH_HABITS_REQUEST });

    const { auth } = getState();
    
    if (!auth.user || !auth.user.id) {
      throw new Error('Người dùng chưa đăng nhập');
    }

    const userId = auth.user.id;
    const { data, error } = await firebaseDatabase.get(`habits/${userId}`);

    if (error) {
      throw new Error(error);
    }

    dispatch({
      type: HabitActionTypes.FETCH_HABITS_SUCCESS,
      payload: data || {}
    });
  } catch (error) {
    console.error('Fetch habits error:', error);
    dispatch({
      type: HabitActionTypes.FETCH_HABITS_FAILURE,
      payload: error instanceof Error ? error.message : 'Không thể tải danh sách thói quen'
    });
  }
};

// Create Habit
export const createHabit = (habit: Omit<Habit, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'streak' | 'bestStreak'>): AppThunk => 
  async (dispatch, getState) => {
    try {
      dispatch({ type: HabitActionTypes.CREATE_HABIT_REQUEST });

      const { auth } = getState();
      
      if (!auth.user || !auth.user.id) {
        throw new Error('Người dùng chưa đăng nhập');
      }

      const userId = auth.user.id;
      const now = new Date().toISOString();
      const id = generateId();

      const newHabit: Habit = {
        ...habit,
        id,
        userId,
        createdAt: now,
        updatedAt: now,
        streak: 0,
        bestStreak: 0,
        active: true
      };

      const { error } = await firebaseDatabase.set(`habits/${userId}/${id}`, newHabit);

      if (error) {
        throw new Error(error);
      }

      dispatch({
        type: HabitActionTypes.CREATE_HABIT_SUCCESS,
        payload: newHabit
      });

      return newHabit;
    } catch (error) {
      console.error('Create habit error:', error);
      dispatch({
        type: HabitActionTypes.CREATE_HABIT_FAILURE,
        payload: error instanceof Error ? error.message : 'Không thể tạo thói quen mới'
      });
      return null;
    }
  };

// Update Habit
export const updateHabit = (habitId: string, updates: Partial<Habit>): AppThunk => 
  async (dispatch, getState) => {
    try {
      dispatch({ type: HabitActionTypes.UPDATE_HABIT_REQUEST });

      const { auth, habits } = getState();
      
      if (!auth.user || !auth.user.id) {
        throw new Error('Người dùng chưa đăng nhập');
      }

      const userId = auth.user.id;
      const habitsData = habits.habits;
      
      if (!habitsData[habitId]) {
        throw new Error('Thói quen không tồn tại');
      }

      const updatedHabit = {
        ...habitsData[habitId],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      const { error } = await firebaseDatabase.update(`habits/${userId}/${habitId}`, updatedHabit);

      if (error) {
        throw new Error(error);
      }

      dispatch({
        type: HabitActionTypes.UPDATE_HABIT_SUCCESS,
        payload: updatedHabit
      });

      return updatedHabit;
    } catch (error) {
      console.error('Update habit error:', error);
      dispatch({
        type: HabitActionTypes.UPDATE_HABIT_FAILURE,
        payload: error instanceof Error ? error.message : 'Không thể cập nhật thói quen'
      });
      return null;
    }
  };

// Delete Habit
export const deleteHabit = (habitId: string): AppThunk => 
  async (dispatch, getState) => {
    try {
      dispatch({ type: HabitActionTypes.DELETE_HABIT_REQUEST });

      const { auth } = getState();
      
      if (!auth.user || !auth.user.id) {
        throw new Error('Người dùng chưa đăng nhập');
      }

      const userId = auth.user.id;
      
      const { error } = await firebaseDatabase.remove(`habits/${userId}/${habitId}`);

      if (error) {
        throw new Error(error);
      }

      dispatch({
        type: HabitActionTypes.DELETE_HABIT_SUCCESS,
        payload: habitId
      });

      return true;
    } catch (error) {
      console.error('Delete habit error:', error);
      dispatch({
        type: HabitActionTypes.DELETE_HABIT_FAILURE,
        payload: error instanceof Error ? error.message : 'Không thể xóa thói quen'
      });
      return false;
    }
  };

// Complete Habit
export const completeHabit = (
  habitId: string, 
  value: number, 
  date = formatDate(new Date()),
  notes?: string
): AppThunk => 
  async (dispatch, getState) => {
    try {
      dispatch({ type: HabitActionTypes.COMPLETE_HABIT_REQUEST });

      const { auth, habits } = getState();
      
      if (!auth.user || !auth.user.id) {
        throw new Error('Người dùng chưa đăng nhập');
      }

      const userId = auth.user.id;
      const habitsData = habits.habits;
      
      if (!habitsData[habitId]) {
        throw new Error('Thói quen không tồn tại');
      }

      const habit = habitsData[habitId];
      const now = new Date().toISOString();
      
      // Tạo completion record
      const completionId = generateId();
      const completion: HabitCompletion = {
        id: completionId,
        habitId,
        date,
        completedAt: now,
        value,
        notes
      };

      // Lưu completion vào database
      const completionPath = `completions/${userId}/${habitId}/${date}`;
      const { error: completionError } = await firebaseDatabase.set(completionPath, completion);

      if (completionError) {
        throw new Error(completionError);
      }

      // Cập nhật thông tin streak và giá trị hiện tại của habit
      const { data: completionsData } = await firebaseDatabase.get(`completions/${userId}/${habitId}`);
      const completions = completionsData || {};
      
      const streakInfo = calculateStreak(completions, habit.frequency);
      const updatedHabit = {
        ...habit,
        currentValue: value,
        streak: streakInfo.currentStreak,
        bestStreak: Math.max(streakInfo.currentStreak, habit.bestStreak),
        updatedAt: now
      };

      // Cập nhật habit trong database
      const { error: habitError } = await firebaseDatabase.update(`habits/${userId}/${habitId}`, updatedHabit);

      if (habitError) {
        throw new Error(habitError);
      }

      // Dispatch actions
      dispatch({
        type: HabitActionTypes.COMPLETE_HABIT_SUCCESS,
        payload: {
          habit: updatedHabit,
          completion
        }
      });

      return completion;
    } catch (error) {
      console.error('Complete habit error:', error);
      dispatch({
        type: HabitActionTypes.COMPLETE_HABIT_FAILURE,
        payload: error instanceof Error ? error.message : 'Không thể hoàn thành thói quen'
      });
      return null;
    }
  };

// Fetch Completions
export const fetchCompletions = (habitId?: string): AppThunk => 
  async (dispatch, getState) => {
    try {
      dispatch({ type: HabitActionTypes.FETCH_COMPLETIONS_REQUEST });

      const { auth } = getState();
      
      if (!auth.user || !auth.user.id) {
        throw new Error('Người dùng chưa đăng nhập');
      }

      const userId = auth.user.id;
      let path = `completions/${userId}`;
      
      if (habitId) {
        path += `/${habitId}`;
      }

      const { data, error } = await firebaseDatabase.get(path);

      if (error) {
        throw new Error(error);
      }

      dispatch({
        type: HabitActionTypes.FETCH_COMPLETIONS_SUCCESS,
        payload: {
          habitId,
          completions: data || {}
        }
      });

      return data;
    } catch (error) {
      console.error('Fetch completions error:', error);
      dispatch({
        type: HabitActionTypes.FETCH_COMPLETIONS_FAILURE,
        payload: error instanceof Error ? error.message : 'Không thể tải dữ liệu hoàn thành'
      });
      return null;
    }
  };

// UI Actions
export const selectHabit = (habitId: string | null) => ({
  type: HabitActionTypes.SELECT_HABIT,
  payload: habitId
});

export const filterHabits = (filters: HabitFilters) => ({
  type: HabitActionTypes.FILTER_HABITS,
  payload: filters
});

export const sortHabits = (
  sortBy: 'name' | 'createdAt' | 'streak' | 'completionRate',
  sortDirection: 'asc' | 'desc' = 'asc'
) => ({
  type: HabitActionTypes.SORT_HABITS,
  payload: { sortBy, sortDirection }
}); 