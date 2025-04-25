import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/types';
import { RootState, AppDispatch, AppThunk } from '../../store';
import { createHabit, updateHabit } from '../../store/actions/habitActions';
import { Habit } from '../../types/habit';
import { HABIT_TYPES, FREQUENCIES, DEFAULT_UNITS, VALIDATION } from '../../config/constants';
import { Button, Input, Card } from '../../components/common';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Định nghĩa types cho navigation và route
type HabitFormScreenNavigationProp = StackNavigationProp<MainStackParamList, 'HabitForm'>;
type HabitFormScreenRouteProp = RouteProp<MainStackParamList, 'HabitForm'>;

// Map các loại thói quen sang text hiển thị
const habitTypeLabels: Record<string, string> = {
  water: 'Uống nước',
  sleep: 'Ngủ',
  exercise: 'Tập thể dục',
  mood: 'Tâm trạng',
};

// Map các loại tần suất sang text hiển thị
const frequencyLabels: Record<string, string> = {
  daily: 'Hàng ngày',
  weekly: 'Hàng tuần',
  monthly: 'Hàng tháng',
};

// Mảng màu sắc cho việc chọn màu
const colorOptions = [
  '#4CAF50', // Green
  '#2196F3', // Blue
  '#F44336', // Red
  '#FF9800', // Orange
  '#9C27B0', // Purple
  '#795548', // Brown
  '#607D8B', // Blue Grey
  '#00BCD4', // Cyan
];

// Mảng icon cho việc chọn icon
const iconOptions = [
  'water', 
  'bed-empty', 
  'run', 
  'emoticon-happy-outline',
  'food-apple',
  'book-open-page-variant',
  'bike',
  'meditation',
  'heart-pulse',
  'music',
  'football',
  'pill',
];

const HabitFormScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<HabitFormScreenNavigationProp>();
  const route = useRoute<HabitFormScreenRouteProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { habits, isLoading } = useSelector((state: RootState) => state.habits);

  // Lấy thông tin từ route params
  const { mode, habitId } = route.params || { mode: 'create', habitId: null };
  const isEditMode = mode === 'edit' && habitId !== null;

  // Lấy thông tin habit nếu ở chế độ edit
  const existingHabit = isEditMode && habitId ? habits[habitId] : null;

  // State cho form
  const [name, setName] = useState('');
  const [type, setType] = useState<string>(Object.keys(HABIT_TYPES)[0]);
  const [targetValue, setTargetValue] = useState('0');
  const [unit, setUnit] = useState('');
  const [icon, setIcon] = useState(iconOptions[0]);
  const [color, setColor] = useState(colorOptions[0]);
  const [frequency, setFrequency] = useState<string>(Object.keys(FREQUENCIES)[0]);
  const [notes, setNotes] = useState('');
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showFrequencySelector, setShowFrequencySelector] = useState(false);
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [showColorSelector, setShowColorSelector] = useState(false);

  // State cho validation
  const [errors, setErrors] = useState({
    name: '',
    targetValue: '',
    unit: '',
  });
  const [touched, setTouched] = useState({
    name: false,
    targetValue: false,
    unit: false,
  });

  // Cập nhật form nếu đang ở chế độ edit
  useEffect(() => {
    if (existingHabit) {
      setName(existingHabit.name);
      setType(existingHabit.type);
      setTargetValue(existingHabit.targetValue.toString());
      setUnit(existingHabit.unit);
      setIcon(existingHabit.icon || iconOptions[0]);
      setColor(existingHabit.color || colorOptions[0]);
      setFrequency(existingHabit.frequency);
      setNotes(existingHabit.notes || '');
    } else {
      // Đặt giá trị mặc định cho unit dựa trên loại habit
      setUnit(DEFAULT_UNITS[type as keyof typeof DEFAULT_UNITS] || '');
    }
  }, [existingHabit]);

  // Cập nhật unit khi type thay đổi (cho chế độ tạo mới)
  useEffect(() => {
    if (!isEditMode) {
      setUnit(DEFAULT_UNITS[type as keyof typeof DEFAULT_UNITS] || '');
    }
  }, [type, isEditMode]);

  // Validate form
  const validateForm = useCallback(() => {
    let valid = true;
    const newErrors = { name: '', targetValue: '', unit: '' };

    // Validate name
    if (!name.trim()) {
      newErrors.name = 'Tên thói quen không được để trống';
      valid = false;
    } else if (name.length > VALIDATION.MAX_HABIT_NAME_LENGTH) {
      newErrors.name = `Tên thói quen không được vượt quá ${VALIDATION.MAX_HABIT_NAME_LENGTH} ký tự`;
      valid = false;
    }

    // Validate targetValue
    const target = parseFloat(targetValue);
    if (isNaN(target) || target <= 0) {
      newErrors.targetValue = 'Giá trị mục tiêu phải là số dương';
      valid = false;
    }

    // Validate unit
    if (!unit.trim() && type !== 'mood') {
      newErrors.unit = 'Đơn vị không được để trống';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  }, [name, targetValue, unit, type]);

  // Handle blur
  const handleBlur = useCallback((field: 'name' | 'targetValue' | 'unit') => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  // Handle save
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;
    
    try {
      const habitData = {
        type,
        name,
        targetValue: parseFloat(targetValue),
        currentValue: 0,
        unit,
        frequency,
        reminders: [],
        icon: icon || 'checkbox-marked-circle-outline',
        color: color || theme.colors.primary,
        notes,
        active: true,
      };

      if (isEditMode && habitId) {
        // Cập nhật habit hiện có
        dispatch(updateHabit(habitId, habitData));
      } else {
        // Tạo habit mới
        dispatch(createHabit(habitData));
      }

      // Quay lại màn hình trước đó
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Lỗi',
        `Không thể ${isEditMode ? 'cập nhật' : 'tạo'} thói quen. Vui lòng thử lại.`
      );
    }
  }, [dispatch, name, type, targetValue, unit, icon, color, frequency, notes, isEditMode, habitId, validateForm, navigation]);

  // Screen title
  const screenTitle = useMemo(() => isEditMode ? 'Chỉnh sửa thói quen' : 'Tạo thói quen mới', [isEditMode]);

  // Render type selector
  const renderTypeSelector = () => (
    <Card style={styles.selectorContainer}>
      <Text style={[styles.selectorTitle, { color: theme.colors.text.primary[theme.mode] }]}>
        Chọn loại thói quen
      </Text>
      {Object.entries(HABIT_TYPES).map(([key, value]) => (
        <TouchableOpacity
          key={key}
          style={[
            styles.selectorItem,
            { backgroundColor: type === value ? theme.colors.primary + '20' : 'transparent' }
          ]}
          onPress={() => {
            setType(value);
            setShowTypeSelector(false);
          }}
        >
          <Icon
            name={key === 'water' ? 'water' : key === 'sleep' ? 'bed-empty' : key === 'exercise' ? 'run' : 'emoticon-happy-outline'}
            size={24}
            color={theme.colors.primary}
          />
          <Text style={[styles.selectorItemText, { color: theme.colors.text.primary[theme.mode] }]}>
            {habitTypeLabels[value]}
          </Text>
        </TouchableOpacity>
      ))}
    </Card>
  );

  // Render frequency selector
  const renderFrequencySelector = () => (
    <Card style={styles.selectorContainer}>
      <Text style={[styles.selectorTitle, { color: theme.colors.text.primary[theme.mode] }]}>
        Chọn tần suất
      </Text>
      {Object.entries(FREQUENCIES).map(([key, value]) => (
        <TouchableOpacity
          key={key}
          style={[
            styles.selectorItem,
            { backgroundColor: frequency === value ? theme.colors.primary + '20' : 'transparent' }
          ]}
          onPress={() => {
            setFrequency(value);
            setShowFrequencySelector(false);
          }}
        >
          <Icon
            name={key === 'daily' ? 'calendar-today' : key === 'weekly' ? 'calendar-week' : 'calendar-month'}
            size={24}
            color={theme.colors.primary}
          />
          <Text style={[styles.selectorItemText, { color: theme.colors.text.primary[theme.mode] }]}>
            {frequencyLabels[value]}
          </Text>
        </TouchableOpacity>
      ))}
    </Card>
  );

  // Render icon selector
  const renderIconSelector = () => (
    <Card style={styles.selectorContainer}>
      <Text style={[styles.selectorTitle, { color: theme.colors.text.primary[theme.mode] }]}>
        Chọn biểu tượng
      </Text>
      <View style={styles.iconGrid}>
        {iconOptions.map((iconName) => (
          <TouchableOpacity
            key={iconName}
            style={[
              styles.iconItem,
              { 
                backgroundColor: icon === iconName ? theme.colors.primary + '20' : 'transparent',
                borderColor: icon === iconName ? theme.colors.primary : 'transparent',
              }
            ]}
            onPress={() => {
              setIcon(iconName);
              setShowIconSelector(false);
            }}
          >
            <Icon name={iconName} size={30} color={theme.colors.primary} />
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );

  // Render color selector
  const renderColorSelector = () => (
    <Card style={styles.selectorContainer}>
      <Text style={[styles.selectorTitle, { color: theme.colors.text.primary[theme.mode] }]}>
        Chọn màu sắc
      </Text>
      <View style={styles.colorGrid}>
        {colorOptions.map((colorValue) => (
          <TouchableOpacity
            key={colorValue}
            style={[
              styles.colorItem,
              { 
                backgroundColor: colorValue,
                borderWidth: color === colorValue ? 3 : 0,
                borderColor: theme.colors.white,
              }
            ]}
            onPress={() => {
              setColor(colorValue);
              setShowColorSelector(false);
            }}
          />
        ))}
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background[theme.mode] }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.screenTitle, { color: theme.colors.text.primary[theme.mode] }]}>
            {screenTitle}
          </Text>

          <Card style={styles.formContainer}>
            {/* Tên thói quen */}
            <Input
              label="Tên thói quen"
              value={name}
              onChangeText={setName}
              placeholder="Nhập tên thói quen"
              onBlur={() => handleBlur('name')}
              error={errors.name}
              touched={touched.name}
              leftIcon="format-title"
            />

            {/* Loại thói quen */}
            <TouchableOpacity
              style={[styles.selector, { borderColor: theme.colors.border[theme.mode] }]}
              onPress={() => setShowTypeSelector(true)}
            >
              <View style={styles.selectorLeft}>
                <Text style={[styles.selectorLabel, { color: theme.colors.text.secondary[theme.mode] }]}>
                  Loại thói quen
                </Text>
                <Text style={[styles.selectorValue, { color: theme.colors.text.primary[theme.mode] }]}>
                  {habitTypeLabels[type]}
                </Text>
              </View>
              <Icon name="chevron-down" size={24} color={theme.colors.text.secondary[theme.mode]} />
            </TouchableOpacity>

            {/* Giá trị mục tiêu */}
            <View style={styles.row}>
              <View style={{ flex: 2, marginRight: 8 }}>
                <Input
                  label="Giá trị mục tiêu"
                  value={targetValue}
                  onChangeText={setTargetValue}
                  placeholder="Nhập giá trị"
                  onBlur={() => handleBlur('targetValue')}
                  error={errors.targetValue}
                  touched={touched.targetValue}
                  keyboardType="numeric"
                  leftIcon="target"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Đơn vị"
                  value={unit}
                  onChangeText={setUnit}
                  placeholder="Đơn vị"
                  onBlur={() => handleBlur('unit')}
                  error={errors.unit}
                  touched={touched.unit}
                  leftIcon="ruler"
                  editable={type !== 'mood'} // Disable cho mood
                />
              </View>
            </View>

            {/* Tần suất */}
            <TouchableOpacity
              style={[styles.selector, { borderColor: theme.colors.border[theme.mode] }]}
              onPress={() => setShowFrequencySelector(true)}
            >
              <View style={styles.selectorLeft}>
                <Text style={[styles.selectorLabel, { color: theme.colors.text.secondary[theme.mode] }]}>
                  Tần suất
                </Text>
                <Text style={[styles.selectorValue, { color: theme.colors.text.primary[theme.mode] }]}>
                  {frequencyLabels[frequency]}
                </Text>
              </View>
              <Icon name="chevron-down" size={24} color={theme.colors.text.secondary[theme.mode]} />
            </TouchableOpacity>

            {/* Icon và Màu sắc */}
            <View style={styles.row}>
              <TouchableOpacity
                style={[
                  styles.iconPreview,
                  { 
                    borderColor: theme.colors.border[theme.mode],
                    backgroundColor: theme.colors.surface[theme.mode],
                  }
                ]}
                onPress={() => setShowIconSelector(true)}
              >
                <Icon name={icon} size={30} color={color} />
                <Text style={[styles.iconPreviewLabel, { color: theme.colors.text.secondary[theme.mode] }]}>
                  Chọn icon
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.colorPreview,
                  { 
                    borderColor: theme.colors.border[theme.mode],
                    backgroundColor: theme.colors.surface[theme.mode],
                  }
                ]}
                onPress={() => setShowColorSelector(true)}
              >
                <View style={[styles.colorCircle, { backgroundColor: color }]} />
                <Text style={[styles.colorPreviewLabel, { color: theme.colors.text.secondary[theme.mode] }]}>
                  Chọn màu
                </Text>
              </TouchableOpacity>
            </View>

            {/* Ghi chú */}
            <Input
              label="Ghi chú (không bắt buộc)"
              value={notes}
              onChangeText={setNotes}
              placeholder="Nhập ghi chú cho thói quen này"
              multiline
              numberOfLines={3}
              leftIcon="note-text-outline"
            />
          </Card>

          {/* Lưu và Hủy */}
          <View style={styles.buttonContainer}>
            <Button
              title="Hủy"
              onPress={() => navigation.goBack()}
              variant="outline"
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title={isEditMode ? 'Cập nhật' : 'Tạo mới'}
              onPress={handleSubmit}
              loading={isLoading}
              variant="primary"
              style={{ flex: 1 }}
            />
          </View>
        </ScrollView>

        {/* Selectors */}
        {showTypeSelector && renderTypeSelector()}
        {showFrequencySelector && renderFrequencySelector()}
        {showIconSelector && renderIconSelector()}
        {showColorSelector && renderColorSelector()}

        {/* Overlay để tắt selector */}
        {(showTypeSelector || showFrequencySelector || showIconSelector || showColorSelector) && (
          <TouchableOpacity
            style={styles.overlay}
            onPress={() => {
              setShowTypeSelector(false);
              setShowFrequencySelector(false);
              setShowIconSelector(false);
              setShowColorSelector(false);
            }}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  formContainer: {
    padding: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  selectorLeft: {
    flex: 1,
  },
  selectorLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  selectorValue: {
    fontSize: 16,
  },
  iconPreview: {
    flex: 1,
    marginRight: 8,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  iconPreviewLabel: {
    fontSize: 12,
    marginTop: 8,
  },
  colorPreview: {
    flex: 1,
    marginLeft: 8,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  colorCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  colorPreviewLabel: {
    fontSize: 12,
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1,
  },
  selectorContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    padding: 16,
    maxHeight: '70%',
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  selectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectorItemText: {
    marginLeft: 12,
    fontSize: 16,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  iconItem: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginBottom: 8,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorItem: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
});

export default HabitFormScreen; 