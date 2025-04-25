/**
 * Firebase configuration cho NLQWellness
 */
import { initializeApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import { Platform } from 'react-native';

// Lưu ý: Thông tin cấu hình đã được cài đặt trong google-services.json (Android) và GoogleService-Info.plist (iOS)
// Các hằng số này có thể được sử dụng để debug hoặc xây dựng các services

// Khởi tạo Firebase - sẽ tự động đọc cấu hình từ các file native
const firebaseApp = initializeApp();

// Utility functions for Firebase Authentication
export const firebaseAuth = {
  // Đăng ký người dùng mới
  registerWithEmail: async (email, password) => {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      return { user: userCredential.user, error: null };
    } catch (error) {
      return { user: null, error: error.message };
    }
  },
  
  // Đăng nhập người dùng
  loginWithEmail: async (email, password) => {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      return { user: userCredential.user, error: null };
    } catch (error) {
      return { user: null, error: error.message };
    }
  },
  
  // Đăng xuất người dùng
  logout: async () => {
    try {
      await auth().signOut();
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  },
  
  // Khôi phục mật khẩu
  resetPassword: async (email) => {
    try {
      await auth().sendPasswordResetEmail(email);
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  },
  
  // Lấy thông tin người dùng hiện tại
  getCurrentUser: () => {
    return auth().currentUser;
  },
  
  // Lắng nghe thay đổi trạng thái xác thực
  onAuthStateChanged: (callback) => {
    return auth().onAuthStateChanged(callback);
  },
  
  // Cập nhật thông tin người dùng
  updateProfile: async (profile) => {
    try {
      const user = auth().currentUser;
      if (user) {
        await user.updateProfile(profile);
        return { error: null };
      }
      return { error: 'Không có người dùng đăng nhập' };
    } catch (error) {
      return { error: error.message };
    }
  },
};

// Utility functions for Firebase Realtime Database
export const firebaseDatabase = {
  // Lấy dữ liệu từ path
  get: async (path) => {
    try {
      const snapshot = await database().ref(path).once('value');
      return { data: snapshot.val(), error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },
  
  // Lưu dữ liệu vào path
  set: async (path, data) => {
    try {
      await database().ref(path).set(data);
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  },
  
  // Cập nhật dữ liệu tại path
  update: async (path, data) => {
    try {
      await database().ref(path).update(data);
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  },
  
  // Xoá dữ liệu tại path
  remove: async (path) => {
    try {
      await database().ref(path).remove();
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  },
  
  // Lắng nghe sự thay đổi dữ liệu
  onValue: (path, callback) => {
    return database().ref(path).on('value', (snapshot) => {
      callback(snapshot.val());
    });
  },
  
  // Huỷ lắng nghe sự thay đổi dữ liệu
  offValue: (path) => {
    database().ref(path).off('value');
  },
  
  // Tạo key mới cho dữ liệu
  pushKey: (path) => {
    return database().ref(path).push().key;
  },
};

export default firebaseApp; 