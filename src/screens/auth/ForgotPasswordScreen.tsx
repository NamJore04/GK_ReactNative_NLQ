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
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch, AppThunk } from '../../store';
import { forgotPassword } from '../../store/actions/authActions';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  
  // State cho form
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [touched, setTouched] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  // Validate form
  const validateForm = () => {
    let valid = true;
    
    // Validate email
    if (!email) {
      setFormError('Email không được để trống');
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setFormError('Email không hợp lệ');
      valid = false;
    } else {
      setFormError('');
    }
    
    return valid;
  };
  
  // Xử lý blur input
  const handleBlur = () => {
    setTouched(true);
    validateForm();
  };
  
  // Xử lý reset password
  const handleResetPassword = async () => {
    if (!validateForm()) return;
    
    try {
      // Gọi action forgotPassword từ Redux
      dispatch(forgotPassword({ email }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi gửi yêu cầu đặt lại mật khẩu';
      Alert.alert('Yêu cầu đặt lại mật khẩu thất bại', errorMessage);
    }
  };
  
  // Theo dõi trạng thái và lỗi
  useEffect(() => {
    if (error) {
      Alert.alert('Yêu cầu đặt lại mật khẩu thất bại', error);
    }
    
    // Giả định đã gửi email thành công khi loading từ true chuyển sang false và không có lỗi
    if (!loading && !error && touched && !emailSent) {
      setEmailSent(true);
    }
  }, [loading, error, touched]);
  
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
      fontSize: theme.typography.fontSize.title,
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
    successContainer: {
      marginBottom: theme.spacing.xl,
      padding: theme.spacing.l,
      borderRadius: theme.spacing.borderRadiusMedium,
      backgroundColor: theme.colors.success + '20', // 20% opacity
      borderWidth: 1,
      borderColor: theme.colors.success,
    },
    successText: {
      fontSize: theme.typography.fontSize.m,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.success,
      textAlign: 'center',
      marginBottom: theme.spacing.m,
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
            <Text style={styles.headerText}>Quên mật khẩu</Text>
            <Text style={styles.headerSubtext}>
              Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn để đặt lại mật khẩu
            </Text>
          </View>
          
          {emailSent ? (
            // Hiển thị thông báo đã gửi email
            <Card style={styles.successContainer}>
              <Text style={styles.successText}>
                Email hướng dẫn đặt lại mật khẩu đã được gửi đến {email}. 
                Vui lòng kiểm tra hộp thư đến của bạn và làm theo các hướng dẫn.
              </Text>
              <Button
                title="Quay lại đăng nhập"
                onPress={() => navigation.navigate('Login')}
                variant="outline"
                fullWidth
              />
            </Card>
          ) : (
            // Form quên mật khẩu
            <Card style={styles.formContainer}>
              <Input
                label="Email"
                placeholder="Nhập email của bạn"
                value={email}
                onChangeText={setEmail}
                onBlur={handleBlur}
                error={formError}
                touched={touched}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                leftIcon="email-outline"
              />
              
              <Button
                title="Gửi yêu cầu đặt lại mật khẩu"
                onPress={handleResetPassword}
                loading={loading}
                fullWidth
                variant="primary"
              />
            </Card>
          )}
          
          {/* Link đăng nhập */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Đã nhớ mật khẩu?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen; 