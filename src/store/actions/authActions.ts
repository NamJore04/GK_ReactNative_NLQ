/**
 * Auth Actions cho NLQWellness
 */
import { Dispatch } from 'redux';
import { AuthActionTypes } from './authActionTypes';
import { LoginPayload, RegisterPayload, ForgotPasswordPayload, UpdateProfilePayload } from '../../types';
import { firebaseAuth, firebaseDatabase } from '../../config/firebase';
import { User, UserProfile } from '../../types/user';
import { RootState, AppThunk } from '../index';
import { Action } from 'redux';

// Login
export const login = (payload: LoginPayload): AppThunk => async (dispatch) => {
  dispatch({ type: AuthActionTypes.LOGIN_REQUEST });
  
  try {
    const { user, error } = await firebaseAuth.loginWithEmail(payload.email, payload.password);
    
    if (error) {
      throw new Error(error);
    }
    
    if (!user) {
      throw new Error('Không thể đăng nhập. Vui lòng thử lại.');
    }
    
    // Lấy thông tin user profile từ database
    const { data: userProfile, error: dbError } = await firebaseDatabase.get(`users/${user.uid}`);
    
    if (dbError) {
      throw new Error(dbError);
    }
    
    let profile: UserProfile;
    
    if (userProfile) {
      // Nếu có dữ liệu profile, sử dụng nó
      profile = userProfile as UserProfile;
    } else {
      // Nếu chưa có dữ liệu profile, tạo mới từ thông tin cơ bản
      profile = {
        id: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        createdAt: user.metadata.creationTime || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: user.metadata.lastSignInTime || new Date().toISOString(),
        profile: {},
        preferences: {
          notifications: {
            enabled: true,
            quietHours: {
              enabled: false,
              start: '22:00',
              end: '07:00',
            },
            habitReminders: true,
            streakMilestones: true,
            weeklyReport: true,
          },
          ui: {
            theme: 'system',
            language: 'vi',
            weekStartDay: 1, // Thứ Hai
            measurementUnit: 'metric',
          },
          dataSync: {
            enabled: true,
            lastSynced: new Date().toISOString(),
          },
        },
        stats: {
          totalHabits: 0,
          activeHabits: 0,
          totalCompletions: 0,
          longestStreak: 0,
          currentStreak: 0,
        },
      };
      
      // Lưu profile mới vào database
      const { error: setError } = await firebaseDatabase.set(`users/${user.uid}`, profile);
      if (setError) {
        console.error('Không thể lưu profile:', setError);
      }
    }
    
    dispatch({
      type: AuthActionTypes.LOGIN_SUCCESS,
      payload: profile,
    });
  } catch (error) {
    console.error('Login error:', error);
    dispatch({
      type: AuthActionTypes.LOGIN_FAILURE,
      payload: error instanceof Error ? error.message : 'Đăng nhập thất bại. Vui lòng thử lại.',
    });
  }
};

// Register
export const register = (payload: RegisterPayload): AppThunk => async (dispatch) => {
  dispatch({ type: AuthActionTypes.REGISTER_REQUEST });
  
  try {
    const { user, error } = await firebaseAuth.registerWithEmail(payload.email, payload.password);
    
    if (error) {
      throw new Error(error);
    }
    
    if (!user) {
      throw new Error('Không thể đăng ký. Vui lòng thử lại.');
    }
    
    // Cập nhật displayName nếu có
    if (payload.displayName) {
      const { error: profileError } = await firebaseAuth.updateProfile({
        displayName: payload.displayName
      });
      
      if (profileError) {
        console.error('Không thể cập nhật tên hiển thị:', profileError);
      }
    }
    
    // Tạo đối tượng user profile
    const profile: UserProfile = {
      id: user.uid,
      email: user.email || '',
      displayName: payload.displayName || user.displayName || '',
      photoURL: user.photoURL || '',
      createdAt: user.metadata.creationTime || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: user.metadata.lastSignInTime || new Date().toISOString(),
      profile: {},
      preferences: {
        notifications: {
          enabled: true,
          quietHours: {
            enabled: false,
            start: '22:00',
            end: '07:00',
          },
          habitReminders: true,
          streakMilestones: true,
          weeklyReport: true,
        },
        ui: {
          theme: 'system',
          language: 'vi',
          weekStartDay: 1, // Thứ Hai
          measurementUnit: 'metric',
        },
        dataSync: {
          enabled: true,
          lastSynced: new Date().toISOString(),
        },
      },
      stats: {
        totalHabits: 0,
        activeHabits: 0,
        totalCompletions: 0,
        longestStreak: 0,
        currentStreak: 0,
      },
    };
    
    // Lưu profile vào database
    const { error: setError } = await firebaseDatabase.set(`users/${user.uid}`, profile);
    
    if (setError) {
      throw new Error(setError);
    }
    
    dispatch({
      type: AuthActionTypes.REGISTER_SUCCESS,
      payload: profile,
    });
  } catch (error) {
    console.error('Register error:', error);
    dispatch({
      type: AuthActionTypes.REGISTER_FAILURE,
      payload: error instanceof Error ? error.message : 'Đăng ký thất bại. Vui lòng thử lại.',
    });
  }
};

// Logout
export const logout = (): AppThunk => async (dispatch) => {
  try {
    const { error } = await firebaseAuth.logout();
    
    if (error) {
      console.error('Logout error:', error);
    }
    
    dispatch({ type: AuthActionTypes.LOGOUT });
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// Forgot Password
export const forgotPassword = (payload: ForgotPasswordPayload): AppThunk => async (dispatch) => {
  dispatch({ type: AuthActionTypes.FORGOT_PASSWORD_REQUEST });
  
  try {
    const { error } = await firebaseAuth.resetPassword(payload.email);
    
    if (error) {
      throw new Error(error);
    }
    
    dispatch({ type: AuthActionTypes.FORGOT_PASSWORD_SUCCESS });
  } catch (error) {
    console.error('Forgot password error:', error);
    dispatch({
      type: AuthActionTypes.FORGOT_PASSWORD_FAILURE,
      payload: error instanceof Error ? error.message : 'Gửi email đặt lại mật khẩu thất bại. Vui lòng thử lại.',
    });
  }
};

// Update Profile
export const updateProfile = (userProfile: Partial<UserProfile>): AppThunk => async (dispatch, getState) => {
  dispatch({ type: AuthActionTypes.UPDATE_PROFILE_REQUEST });
  
  try {
    const { auth } = getState();
    
    if (!auth.user || !auth.user.id) {
      throw new Error('Không có thông tin người dùng');
    }
    
    const { data: currentProfile, error: getError } = await firebaseDatabase.get(`users/${auth.user.id}`);
    
    if (getError) {
      throw new Error(getError);
    }
    
    if (!currentProfile) {
      throw new Error('Không tìm thấy hồ sơ người dùng');
    }
    
    const updatedProfile = {
      ...currentProfile,
      ...userProfile,
      updatedAt: new Date().toISOString(),
    };
    
    // Cập nhật profileURL và displayName trong Firebase Auth nếu có
    if (userProfile.displayName || userProfile.photoURL) {
      const updateData: { displayName?: string; photoURL?: string } = {};
      
      if (userProfile.displayName) {
        updateData.displayName = userProfile.displayName;
      }
      
      if (userProfile.photoURL) {
        updateData.photoURL = userProfile.photoURL;
      }
      
      const { error: authError } = await firebaseAuth.updateProfile(updateData);
      
      if (authError) {
        console.error('Không thể cập nhật thông tin xác thực:', authError);
      }
    }
    
    // Lưu profile cập nhật vào database
    const { error: updateError } = await firebaseDatabase.update(`users/${auth.user.id}`, updatedProfile);
    
    if (updateError) {
      throw new Error(updateError);
    }
    
    dispatch({
      type: AuthActionTypes.UPDATE_PROFILE_SUCCESS,
      payload: updatedProfile,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    dispatch({
      type: AuthActionTypes.UPDATE_PROFILE_FAILURE,
      payload: error instanceof Error ? error.message : 'Cập nhật hồ sơ thất bại. Vui lòng thử lại.',
    });
  }
}; 