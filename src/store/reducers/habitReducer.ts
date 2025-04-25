/**
 * Habit reducer cho NLQWellness
 */
import { HabitActionTypes } from '../actions/habitActionTypes';
import { HabitsState, Habit, HabitCompletion } from '../../types/habit';

// State mặc định
const initialState: HabitsState = {
  habits: {},
  filteredHabits: [],
  selectedHabit: null,
  completions: {},
  isLoading: false,
  error: null,
};

// Định nghĩa kiểu dữ liệu cho Action
export type HabitAction = {
  type: string;
  payload?: any;
};

// Reducer
const habitReducer = (state = initialState, action: HabitAction): HabitsState => {
  switch (action.type) {
    // Fetch Habits
    case HabitActionTypes.FETCH_HABITS_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case HabitActionTypes.FETCH_HABITS_SUCCESS:
      return {
        ...state,
        habits: action.payload,
        filteredHabits: Object.keys(action.payload),
        isLoading: false,
        error: null,
      };
    case HabitActionTypes.FETCH_HABITS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
      
    // Create Habit
    case HabitActionTypes.CREATE_HABIT_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case HabitActionTypes.CREATE_HABIT_SUCCESS:
      const newHabit = action.payload as Habit;
      return {
        ...state,
        habits: {
          ...state.habits,
          [newHabit.id]: newHabit,
        },
        filteredHabits: [...state.filteredHabits, newHabit.id],
        isLoading: false,
        error: null,
      };
    case HabitActionTypes.CREATE_HABIT_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
      
    // Update Habit
    case HabitActionTypes.UPDATE_HABIT_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case HabitActionTypes.UPDATE_HABIT_SUCCESS:
      const updatedHabit = action.payload as Habit;
      return {
        ...state,
        habits: {
          ...state.habits,
          [updatedHabit.id]: updatedHabit,
        },
        isLoading: false,
        error: null,
      };
    case HabitActionTypes.UPDATE_HABIT_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
      
    // Delete Habit
    case HabitActionTypes.DELETE_HABIT_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case HabitActionTypes.DELETE_HABIT_SUCCESS:
      const deleteHabitId = action.payload;
      // Tạo bản sao của state.habits và xóa habit cần xóa
      const { [deleteHabitId]: deletedHabit, ...remainingHabits } = state.habits;
      // Cập nhật filteredHabits để loại bỏ habitId
      const updatedFilteredHabits = state.filteredHabits.filter(id => id !== deleteHabitId);
      
      return {
        ...state,
        habits: remainingHabits,
        filteredHabits: updatedFilteredHabits,
        selectedHabit: state.selectedHabit === deleteHabitId ? null : state.selectedHabit,
        isLoading: false,
        error: null,
      };
    case HabitActionTypes.DELETE_HABIT_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
      
    // Complete Habit
    case HabitActionTypes.COMPLETE_HABIT_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case HabitActionTypes.COMPLETE_HABIT_SUCCESS:
      const { habit, completion } = action.payload;
      const { habitId: completeHabitId, date } = completion;
      
      // Cập nhật completion cho habit
      let habitCompletions = state.completions[completeHabitId] || {};
      habitCompletions = {
        ...habitCompletions,
        [date]: completion,
      };
      
      return {
        ...state,
        habits: {
          ...state.habits,
          [completeHabitId]: habit,
        },
        completions: {
          ...state.completions,
          [completeHabitId]: habitCompletions,
        },
        isLoading: false,
        error: null,
      };
    case HabitActionTypes.COMPLETE_HABIT_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
      
    // Fetch Completions
    case HabitActionTypes.FETCH_COMPLETIONS_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case HabitActionTypes.FETCH_COMPLETIONS_SUCCESS:
      const { habitId: completionHabitId, completions } = action.payload;
      
      if (completionHabitId) {
        // Cập nhật completions cho một habit cụ thể
        return {
          ...state,
          completions: {
            ...state.completions,
            [completionHabitId]: completions,
          },
          isLoading: false,
          error: null,
        };
      } else {
        // Cập nhật tất cả completions
        return {
          ...state,
          completions: completions,
          isLoading: false,
          error: null,
        };
      }
    case HabitActionTypes.FETCH_COMPLETIONS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
      
    // UI Actions
    case HabitActionTypes.SELECT_HABIT:
      return {
        ...state,
        selectedHabit: action.payload,
      };
    case HabitActionTypes.FILTER_HABITS:
      const filters = action.payload;
      let filteredIds = Object.keys(state.habits);
      
      // Lọc theo type nếu có
      if (filters.type && filters.type.length > 0) {
        filteredIds = filteredIds.filter(id => {
          const habit = state.habits[id];
          return filters.type.includes(habit.type);
        });
      }
      
      // Lọc theo active nếu có
      if (filters.active !== undefined) {
        filteredIds = filteredIds.filter(id => {
          const habit = state.habits[id];
          return habit.active === filters.active;
        });
      }
      
      return {
        ...state,
        filteredHabits: filteredIds,
      };
    case HabitActionTypes.SORT_HABITS:
      const { sortBy, sortDirection } = action.payload;
      const sortedIds = [...state.filteredHabits];
      
      sortedIds.sort((a, b) => {
        const habitA = state.habits[a];
        const habitB = state.habits[b];
        
        let compareValue = 0;
        
        // Sắp xếp theo thuộc tính cụ thể
        switch (sortBy) {
          case 'name':
            compareValue = habitA.name.localeCompare(habitB.name);
            break;
          case 'createdAt':
            compareValue = new Date(habitA.createdAt).getTime() - new Date(habitB.createdAt).getTime();
            break;
          case 'streak':
            compareValue = habitA.streak - habitB.streak;
            break;
          default:
            compareValue = 0;
        }
        
        // Reverse order nếu là desc
        return sortDirection === 'desc' ? -compareValue : compareValue;
      });
      
      return {
        ...state,
        filteredHabits: sortedIds,
      };
      
    default:
      return state;
  }
};

export default habitReducer; 