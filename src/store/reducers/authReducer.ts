/**
 * Auth reducer cho NLQWellness
 */
import { AuthActionTypes } from '../actions/authActionTypes';
import { User } from '../../types/user';

// Interface cho Auth state
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// State mặc định
const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

// Định nghĩa kiểu dữ liệu cho Action
export type AuthAction = {
  type: string;
  payload?: any;
};

// Reducer
const authReducer = (state = initialState, action: AuthAction): AuthState => {
  switch (action.type) {
    // Login
    case AuthActionTypes.LOGIN_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case AuthActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload,
        error: null,
      };
    case AuthActionTypes.LOGIN_FAILURE:
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        error: action.payload,
      };
    
    // Register
    case AuthActionTypes.REGISTER_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case AuthActionTypes.REGISTER_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload,
        error: null,
      };
    case AuthActionTypes.REGISTER_FAILURE:
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        error: action.payload,
      };
    
    // Logout
    case AuthActionTypes.LOGOUT:
      return {
        ...initialState,
      };
    
    // Update profile
    case AuthActionTypes.UPDATE_PROFILE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case AuthActionTypes.UPDATE_PROFILE_SUCCESS:
      return {
        ...state,
        loading: false,
        user: {
          ...state.user,
          ...action.payload,
        },
        error: null,
      };
    case AuthActionTypes.UPDATE_PROFILE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    
    // Forgot Password
    case AuthActionTypes.FORGOT_PASSWORD_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case AuthActionTypes.FORGOT_PASSWORD_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
      };
    case AuthActionTypes.FORGOT_PASSWORD_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    
    default:
      return state;
  }
};

export default authReducer; 