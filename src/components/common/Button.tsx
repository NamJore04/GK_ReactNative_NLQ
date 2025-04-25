import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  View,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Định nghĩa các props cho Button
export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'success';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  iconLeft?: string;
  iconColor?: string;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
  iconLeft,
  iconColor,
  ...rest
}) => {
  const { theme } = useTheme();
  
  // Xác định màu nền và màu chữ dựa trên variant
  const getColors = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.primary,
          textColor: theme.colors.white,
          borderColor: theme.colors.primary,
        };
      case 'secondary':
        return {
          backgroundColor: theme.colors.secondary,
          textColor: theme.colors.white,
          borderColor: theme.colors.secondary,
        };
      case 'success':
        return {
          backgroundColor: theme.colors.success,
          textColor: theme.colors.white,
          borderColor: theme.colors.success,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          textColor: theme.colors.primary,
          borderColor: theme.colors.primary,
        };
      default:
        return {
          backgroundColor: theme.colors.primary,
          textColor: theme.colors.white,
          borderColor: theme.colors.primary,
        };
    }
  };
  
  // Xác định kích thước nút dựa trên size
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: theme.spacing.xs,
          paddingHorizontal: theme.spacing.m,
          fontSize: theme.typography.fontSize.s,
          iconSize: 16,
        };
      case 'large':
        return {
          paddingVertical: theme.spacing.m,
          paddingHorizontal: theme.spacing.xl,
          fontSize: theme.typography.fontSize.l,
          iconSize: 24,
        };
      default: // medium
        return {
          paddingVertical: theme.spacing.s,
          paddingHorizontal: theme.spacing.l,
          fontSize: theme.typography.fontSize.m,
          iconSize: 20,
        };
    }
  };
  
  const colors = getColors();
  const sizeStyle = getSizeStyle();
  
  // Xác định opacity khi disabled
  const opacityStyle = disabled ? { opacity: 0.5 } : { opacity: 1 };
  
  // Style cho nút
  const buttonStyle: ViewStyle = {
    backgroundColor: colors.backgroundColor,
    borderWidth: variant === 'outline' ? 1 : 0,
    borderColor: colors.borderColor,
    borderRadius: theme.spacing.borderRadiusMedium,
    paddingVertical: sizeStyle.paddingVertical,
    paddingHorizontal: sizeStyle.paddingHorizontal,
    alignItems: 'center',
    justifyContent: 'center',
    width: fullWidth ? '100%' : 'auto',
    flexDirection: 'row',
    ...opacityStyle,
  };
  
  // Style cho text
  const buttonTextStyle: TextStyle = {
    color: colors.textColor,
    fontSize: sizeStyle.fontSize,
    fontWeight: '600',
    textAlign: 'center',
  };
  
  return (
    <TouchableOpacity
      style={[buttonStyle, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={colors.textColor} 
          style={{ marginRight: loading && title ? theme.spacing.s : 0 }} 
        />
      ) : iconLeft ? (
        <Icon 
          name={iconLeft} 
          size={sizeStyle.iconSize} 
          color={iconColor || colors.textColor} 
          style={{ marginRight: theme.spacing.xs }} 
        />
      ) : null}
      
      <Text style={[buttonTextStyle, textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default Button; 