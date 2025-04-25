import React, { useState } from 'react';
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
import { ROUTES, VALIDATION } from '../../config/constants';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch, AppThunk } from '../../store';
import { login } from '../../store/actions/authActions';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  
  // State cho form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });
  
  // Validate form
  const validateForm = () => {
    let valid = true;
    const newErrors = { email: '', password: '' };
    
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
    
    setErrors(newErrors);
    return valid;
  };
  
  // Xử lý blur input
  const handleBlur = (field: 'email' | 'password') => {
    setTouched({ ...touched, [field]: true });
    validateForm();
  };
  
  // Xử lý login
  const handleLogin = async () => {
    if (!validateForm()) return;
    
    try {
      // Gọi action login từ Redux thay vì sử dụng firebaseAuth trực tiếp
      dispatch(login({ email, password }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi đăng nhập';
      Alert.alert('Đăng nhập thất bại', errorMessage);
    }
  };
  
  // Hiển thị thông báo lỗi từ Redux nếu có
  React.useEffect(() => {
    if (error) {
      Alert.alert('Đăng nhập thất bại', error);
    }
  }, [error]);
  
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
    logoContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    logoText: {
      fontSize: theme.typography.fontSize.largeHeader,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.primary,
      marginBottom: theme.spacing.s,
    },
    logoSubtext: {
      fontSize: theme.typography.fontSize.m,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text.secondary[theme.mode],
      textAlign: 'center',
    },
    formContainer: {
      marginBottom: theme.spacing.xl,
    },
    forgotPassword: {
      alignSelf: 'flex-end',
      marginBottom: theme.spacing.m,
    },
    forgotPasswordText: {
      color: theme.colors.primary,
      fontSize: theme.typography.fontSize.s,
      fontFamily: theme.typography.fontFamily.medium,
    },
    registerContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: theme.spacing.xl,
    },
    registerText: {
      fontSize: theme.typography.fontSize.m,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text.secondary[theme.mode],
    },
    registerLink: {
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
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>NLQWellness</Text>
            <Text style={styles.logoSubtext}>Theo dõi và cải thiện thói quen hàng ngày</Text>
          </View>
          
          {/* Form đăng nhập */}
          <Card style={styles.formContainer}>
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
            
            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
            </TouchableOpacity>
            
            <Button
              title="Đăng nhập"
              onPress={handleLogin}
              loading={loading}
              fullWidth
              variant="primary"
            />
          </Card>
          
          {/* Link đăng ký */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Chưa có tài khoản?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Đăng ký</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen; 