/**
 * Hệ thống typography của ứng dụng NLQWellness
 */
import { Platform } from 'react-native';

const fontFamily = {
  regular: Platform.OS === 'ios' ? 'System' : 'Roboto',
  medium: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium',
  bold: Platform.OS === 'ios' ? 'System' : 'Roboto-Bold',
  light: Platform.OS === 'ios' ? 'System' : 'Roboto-Light',
};

const fontSize = {
  xs: 10,
  s: 12,
  m: 14,
  l: 16,
  xl: 18,
  xxl: 20,
  title: 24,
  header: 28,
  largeHeader: 32,
};

const fontWeight = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

const lineHeight = {
  xs: 16,
  s: 18,
  m: 22,
  l: 24,
  xl: 28,
  xxl: 32,
  title: 36,
  header: 42,
  largeHeader: 48,
};

// Định nghĩa các kiểu chữ thông dụng dựa trên các thành phần trên
const typography = {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  
  // Kiểu chữ cho các thành phần UI cụ thể
  headline1: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.largeHeader,
    lineHeight: lineHeight.largeHeader,
    fontWeight: fontWeight.bold,
  },
  headline2: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.header,
    lineHeight: lineHeight.header,
    fontWeight: fontWeight.bold,
  },
  headline3: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.title,
    lineHeight: lineHeight.title,
    fontWeight: fontWeight.bold,
  },
  title1: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xxl,
    lineHeight: lineHeight.xxl,
    fontWeight: fontWeight.semibold,
  },
  title2: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
    fontWeight: fontWeight.semibold,
  },
  subtitle: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.l,
    lineHeight: lineHeight.l,
    fontWeight: fontWeight.medium,
  },
  body1: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.m,
    lineHeight: lineHeight.m,
    fontWeight: fontWeight.regular,
  },
  body2: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.s,
    lineHeight: lineHeight.s,
    fontWeight: fontWeight.regular,
  },
  caption: {
    fontFamily: fontFamily.light,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    fontWeight: fontWeight.light,
  },
  button: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.m,
    fontWeight: fontWeight.medium,
  },
};

export default typography; 