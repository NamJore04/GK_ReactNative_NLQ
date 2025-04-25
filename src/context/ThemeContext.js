/**
 * Context quản lý theme cho ứng dụng NLQWellness
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import theme from '../theme';
import { STORAGE_KEYS } from '../config/constants';

// Tạo context
const ThemeContext = createContext();

// Hook tùy chỉnh để sử dụng theme
export const useTheme = () => useContext(ThemeContext);

// Provider component
export const ThemeProvider = ({ children }) => {
  // Lấy chế độ màu của hệ thống
  const systemColorScheme = useColorScheme();
  
  // State để theo dõi chế độ theme (light/dark)
  const [themeMode, setThemeMode] = useState(systemColorScheme || 'light');
  
  // State để theo dõi xem người dùng đã chọn theme tùy chỉnh hay chưa
  const [isSystemTheme, setIsSystemTheme] = useState(true);
  
  // Lấy theme đã lưu từ storage khi component mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedThemeData = await AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE);
        if (savedThemeData) {
          const { mode, useSystem } = JSON.parse(savedThemeData);
          if (useSystem) {
            setThemeMode(systemColorScheme || 'light');
            setIsSystemTheme(true);
          } else {
            setThemeMode(mode || 'light');
            setIsSystemTheme(false);
          }
        }
      } catch (error) {
        console.error('Không thể tải theme:', error);
      }
    };
    
    loadTheme();
  }, [systemColorScheme]);
  
  // Theo dõi thay đổi của chế độ màu hệ thống
  useEffect(() => {
    if (isSystemTheme) {
      setThemeMode(systemColorScheme || 'light');
    }
  }, [systemColorScheme, isSystemTheme]);
  
  // Hàm thay đổi theme
  const toggleTheme = async () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
    setIsSystemTheme(false);
    
    // Lưu lựa chọn theme vào storage
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.THEME_MODE, 
        JSON.stringify({ mode: newMode, useSystem: false })
      );
    } catch (error) {
      console.error('Không thể lưu theme:', error);
    }
  };
  
  // Hàm sử dụng theme hệ thống
  const useSystemTheme = async () => {
    setThemeMode(systemColorScheme || 'light');
    setIsSystemTheme(true);
    
    // Lưu lựa chọn theme vào storage
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.THEME_MODE, 
        JSON.stringify({ mode: systemColorScheme, useSystem: true })
      );
    } catch (error) {
      console.error('Không thể lưu theme:', error);
    }
  };
  
  // Hàm đặt theme cụ thể
  const setTheme = async (mode) => {
    setThemeMode(mode);
    setIsSystemTheme(false);
    
    // Lưu lựa chọn theme vào storage
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.THEME_MODE, 
        JSON.stringify({ mode, useSystem: false })
      );
    } catch (error) {
      console.error('Không thể lưu theme:', error);
    }
  };
  
  // Lấy giá trị theme hiện tại dựa trên mode
  const currentTheme = {
    ...theme,
    mode: themeMode,
    colors: {
      ...theme.colors,
      ...theme.mode[themeMode],
    },
  };
  
  // Context value
  const value = {
    theme: currentTheme,
    themeMode,
    isSystemTheme,
    toggleTheme,
    useSystemTheme,
    setTheme,
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 