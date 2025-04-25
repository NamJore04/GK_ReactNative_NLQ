import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

// Định nghĩa các props cho Card
interface CardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevation?: number;
  onPress?: () => void;
  radius?: number;
  noPadding?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  elevation = 2,
  onPress,
  radius,
  noPadding = false,
  ...rest
}) => {
  const { theme } = useTheme();
  
  // Style cho card
  const cardStyle: ViewStyle = {
    backgroundColor: theme.colors.background[theme.mode],
    borderRadius: radius || theme.spacing.borderRadiusMedium,
    padding: noPadding ? 0 : theme.spacing.m,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: elevation },
    shadowOpacity: 0.1,
    shadowRadius: elevation,
    elevation: elevation, // Cho Android
    borderWidth: 1,
    borderColor: theme.colors.border[theme.mode],
  };
  
  // Nếu có onPress thì bọc trong TouchableOpacity, ngược lại sử dụng View
  if (onPress) {
    return (
      <TouchableOpacity
        style={[cardStyle, style]}
        onPress={onPress}
        activeOpacity={0.9}
        {...rest}
      >
        {children}
      </TouchableOpacity>
    );
  }
  
  return <View style={[cardStyle, style]}>{children}</View>;
};

export default Card; 