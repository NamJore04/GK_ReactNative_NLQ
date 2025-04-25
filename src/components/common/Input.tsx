import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Định nghĩa các props cho Input
interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  touched?: boolean;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle;
  errorStyle?: TextStyle;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  isPassword?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  touched,
  containerStyle,
  labelStyle,
  inputStyle,
  errorStyle,
  leftIcon,
  rightIcon,
  onRightIconPress,
  isPassword,
  ...rest
}) => {
  const { theme } = useTheme();
  const [secureTextEntry, setSecureTextEntry] = useState(isPassword);
  
  // Xác định màu viền dựa trên trạng thái (lỗi, focus, bình thường)
  const getBorderColor = () => {
    if (touched && error) {
      return theme.colors.error;
    }
    return theme.colors.border[theme.mode];
  };
  
  const styles = StyleSheet.create({
    container: {
      marginBottom: theme.spacing.m,
    },
    labelContainer: {
      marginBottom: theme.spacing.xs,
    },
    label: {
      fontSize: theme.typography.fontSize.s,
      color: theme.colors.text.secondary[theme.mode],
      fontFamily: theme.typography.fontFamily.medium,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: getBorderColor(),
      borderRadius: theme.spacing.borderRadiusMedium,
      backgroundColor: theme.colors.background[theme.mode],
      paddingHorizontal: theme.spacing.m,
    },
    input: {
      flex: 1,
      paddingVertical: theme.spacing.s,
      color: theme.colors.text.primary[theme.mode],
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.m,
    },
    icon: {
      marginRight: theme.spacing.s,
      color: error && touched ? theme.colors.error : theme.colors.text.secondary[theme.mode],
    },
    rightIcon: {
      marginLeft: theme.spacing.s,
      color: theme.colors.text.secondary[theme.mode],
    },
    errorContainer: {
      marginTop: theme.spacing.xs,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: theme.typography.fontSize.s,
      fontFamily: theme.typography.fontFamily.regular,
    },
  });
  
  // Xử lý toggle hiển thị mật khẩu
  const handlePasswordVisibility = () => {
    setSecureTextEntry(!secureTextEntry);
  };
  
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, labelStyle]}>{label}</Text>
        </View>
      )}
      <View 
        style={[
          styles.inputContainer, 
          inputStyle,
          touched && error ? { borderColor: theme.colors.error } : null
        ]}
      >
        {leftIcon && (
          <Icon name={leftIcon} size={20} style={styles.icon} />
        )}
        
        <TextInput
          style={styles.input}
          placeholderTextColor={theme.colors.text.disabled[theme.mode]}
          secureTextEntry={secureTextEntry}
          {...rest}
        />
        
        {isPassword && (
          <TouchableOpacity onPress={handlePasswordVisibility}>
            <Icon
              name={secureTextEntry ? 'eye-off' : 'eye'}
              size={20}
              style={styles.rightIcon}
            />
          </TouchableOpacity>
        )}
        
        {!isPassword && rightIcon && (
          <TouchableOpacity onPress={onRightIconPress}>
            <Icon name={rightIcon} size={20} style={styles.rightIcon} />
          </TouchableOpacity>
        )}
      </View>
      
      {touched && error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, errorStyle]}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
};

export default Input; 