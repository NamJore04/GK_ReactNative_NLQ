/**
 * Redux store configuration cho NLQWellness
 */
import { 
  createStore, 
  applyMiddleware, 
  combineReducers, 
  compose,
  AnyAction
} from 'redux';
import { thunk } from 'redux-thunk';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../config/constants';
import authReducer, { AuthState } from './reducers/authReducer';
import habitReducer from './reducers/habitReducer';
import { HabitsState } from '../types/habit';

// Cấu hình persist store
const persistConfig = {
  key: STORAGE_KEYS.AUTH_TOKEN,
  storage: AsyncStorage,
  whitelist: ['auth'], // Chỉ lưu state auth
};

// Định nghĩa state type của ứng dụng
export interface RootState {
  auth: AuthState;
  habits: HabitsState;
  // Thêm các state khác tại đây
}

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  habits: habitReducer,
  // Thêm các reducers khác tại đây
});

// Tạo persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Tạo enhancer với middleware
const enhancer = compose(
  applyMiddleware(thunk)
);

// Tạo store
export const store = createStore(persistedReducer, enhancer);
export const persistor = persistStore(store);

// Types
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>;

export type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>; 