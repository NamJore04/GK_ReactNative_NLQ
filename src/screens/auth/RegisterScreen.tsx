import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Button, Input, Card } from '../../components/common';
import { VALIDATION } from '../../config/constants';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch, AppThunk } from '../../store';
import { register } from '../../store/actions/authActions';

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // State cho form
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({ 
    displayName: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [touched, setTouched] = useState({ 
    displayName: false, 
    email: false, 
    password: false, 
    confirmPassword: false 
  });
  
  // Validate form
  const validateForm = () => {
    let valid = true;
    const newErrors = { 
      displayName: '', 
      email: '', 
      password: '', 
      confirmPassword: '' 
    };
    
    // Validate displayName
    if (!displayName.trim()) {
      newErrors.displayName = 'Tên hiển thị không được để trống';
      valid = false;
    }
    
    // Validate email
    if (!email) {
      newErrors.email = 'Email không được để trống';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
      valid = false;
    }
    
    // Validate password
    if (!password) {
      newErrors.password = 'Mật khẩu không được để trống';
      valid = false;
    } else if (password.length < VALIDATION.MIN_PASSWORD_LENGTH) {
      newErrors.password = `Mật khẩu phải có ít nhất ${VALIDATION.MIN_PASSWORD_LENGTH} ký tự`;
      valid = false;
    }
    
    // Validate confirmPassword
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };
  
  // Xử lý blur input
  const handleBlur = (field: 'displayName' | 'email' | 'password' | 'confirmPassword') => {
    setTouched({ ...touched, [field]: true });
    validateForm();
  };
  
  // Xử lý register
  const handleRegister = async () => {
    if (!validateForm()) return;
    
    try {
      // Gọi action register từ Redux
      dispatch(register({ 
        email, 
        password, 
        displayName 
      }));  
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi đăng ký';
      Alert.alert('Đăng ký thất bại', errorMessage);
    }
  };
  
  // Theo dõi trạng thái xác thực và lỗi
  useEffect(() => {
    if (error) {
      Alert.alert('Đăng ký thất bại', error);
    }
    
    if (isAuthenticated) {
      Alert.alert(
        'Đăng ký thành công',
        'Tài khoản của bạn đã được tạo thành công',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    }
  }, [error, isAuthenticated, navigation]);
  
  // Styles
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background[theme.mode],
    },
    contentContainer: {
      flex: 1,
      padding: theme.spacing.m,
      justifyContent: 'center',
    },
    headerContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    headerText: {
      fontSize: theme.typography.fontSize.header,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.primary,
      marginBottom: theme.spacing.s,
    },
    headerSubtext: {
      fontSize: theme.typography.fontSize.m,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text.secondary[theme.mode],
      textAlign: 'center',
    },
    formContainer: {
      marginBottom: theme.spacing.xl,
    },
    loginContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: theme.spacing.xl,
    },
    loginText: {
      fontSize: theme.typography.fontSize.m,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text.secondary[theme.mode],
    },
    loginLink: {
      fontSize: theme.typography.fontSize.m,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.primary,
      marginLeft: theme.spacing.xs,
    },
  });
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>Tạo tài khoản</Text>
            <Text style={styles.headerSubtext}>Đăng ký để theo dõi và cải thiện thói quen hàng ngày</Text>
          </View>
          
          {/* Form đăng ký */}
          <Card style={styles.formContainer}>
            <Input
              label="Tên hiển thị"
              placeholder="Nhập tên hiển thị của bạn"
              value={displayName}
              onChangeText={setDisplayName}
              onBlur={() => handleBlur('displayName')}
              error={errors.displayName}
              touched={touched.displayName}
              leftIcon="account-outline"
            />
            
            <Input
              label="Email"
              placeholder="Nhập email của bạn"
              value={email}
              onChangeText={setEmail}
              onBlur={() => handleBlur('email')}
              error={errors.email}
              touched={touched.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon="email-outline"
            />
            
            <Input
              label="Mật khẩu"
              placeholder="Nhập mật khẩu của bạn"
              value={password}
              onChangeText={setPassword}
              onBlur={() => handleBlur('password')}
              error={errors.password}
              touched={touched.password}
              leftIcon="lock-outline"
              isPassword
            />
            
            <Input
              label="Xác nhận mật khẩu"
              placeholder="Nhập lại mật khẩu của bạn"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              onBlur={() => handleBlur('confirmPassword')}
              error={errors.confirmPassword}
              touched={touched.confirmPassword}
              leftIcon="lock-check-outline"
              isPassword
            />
            
            <Button
              title="Đăng ký"
              onPress={handleRegister}
              loading={loading}
              fullWidth
              variant="primary"
            />
          </Card>
          
          {/* Link đăng nhập */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Đã có tài khoản?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen; 