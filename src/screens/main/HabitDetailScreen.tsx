import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch, AppThunk } from '../../store';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/types';
import { completeHabit, deleteHabit } from '../../store/actions/habitActions';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card, Button } from '../../components/common';
import { Habit, HabitCompletion } from '../../types/habit';
import { formatDate } from '../../utils/helpers';

type HabitDetailScreenNavigationProp = StackNavigationProp<MainStackParamList, 'HabitDetail'>;
type HabitDetailScreenRouteProp = RouteProp<MainStackParamList, 'HabitDetail'>;

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

interface CompletionData extends HabitCompletion {
  completionDate: string;
}

const HabitDetailScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<HabitDetailScreenNavigationProp>();
  const route = useRoute<HabitDetailScreenRouteProp>();
  const dispatch = useDispatch<AppDispatch>();
  
  const { habitId } = route.params;
  const { habits, completions, isLoading } = useSelector((state: RootState) => state.habits);
  const habit = habits[habitId];
  
  const [todayDate] = useState(formatDate(new Date()));
  const habitCompletions = completions[habitId] || {};
  const isTodayCompleted = !!habitCompletions[todayDate];
  
  // Không tìm thấy habit
  if (!habit && !isLoading) {
    Alert.alert('Lỗi', 'Không tìm thấy thông tin thói quen', [
      { text: 'Quay lại', onPress: () => navigation.goBack() }
    ]);
    return null;
  }
  
  // Xử lý xóa habit
  const handleDelete = () => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa thói quen này? Dữ liệu đã xóa không thể khôi phục.',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive', 
          onPress: () => {
            try {
              dispatch(deleteHabit(habitId));
              navigation.goBack();
            } catch (error) {
              console.error('Không thể xóa thói quen:', error);
            }
          } 
        },
      ]
    );
  };
  
  // Xử lý chỉnh sửa habit
  const handleEdit = () => {
    navigation.navigate('HabitForm', { mode: 'edit', habitId });
  };
  
  // Xử lý hoàn thành habit
  const handleComplete = () => {
    if (!isTodayCompleted) {
      try {
        dispatch(completeHabit(habitId, habit.targetValue));
      } catch (error) {
        console.error('Không thể hoàn thành thói quen:', error);
      }
    }
  };
  
  // Nếu đang loading
  if (isLoading && !habit) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background[theme.mode] }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text.primary[theme.mode] }]}>
            Đang tải thông tin...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Tạo mảng lịch sử hoàn thành
  const completionHistory: CompletionData[] = Object.entries(habitCompletions)
    .map(([dateKey, completion]) => ({
      ...completion,
      completionDate: dateKey
    }))
    .sort((a, b) => new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime());
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background[theme.mode] }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color={theme.colors.text.primary[theme.mode]} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary[theme.mode] }]}>
            Chi tiết thói quen
          </Text>
          <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
            <Icon name="pencil" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        
        {/* Thông tin chính */}
        <Card style={styles.infoCard}>
          <View style={styles.habitHeader}>
            <View 
              style={[
                styles.iconContainer, 
                { backgroundColor: habit.color || theme.colors.primary }
              ]}
            >
              <Icon 
                name={habit.icon || 'checkbox-marked-circle-outline'} 
                size={32} 
                color={theme.colors.white} 
              />
            </View>
            <View style={styles.habitTitleContainer}>
              <Text style={[styles.habitName, { color: theme.colors.text.primary[theme.mode] }]}>
                {habit.name}
              </Text>
              <Text style={[styles.habitType, { color: theme.colors.text.secondary[theme.mode] }]}>
                {habitTypeLabels[habit.type] || habit.type}
              </Text>
            </View>
          </View>
          
          {/* Thông tin chi tiết */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.text.secondary[theme.mode] }]}>
                Mục tiêu:
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.text.primary[theme.mode] }]}>
                {habit.targetValue} {habit.unit}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.text.secondary[theme.mode] }]}>
                Tần suất:
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.text.primary[theme.mode] }]}>
                {frequencyLabels[habit.frequency] || habit.frequency}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.text.secondary[theme.mode] }]}>
                Streak hiện tại:
              </Text>
              <View style={styles.streakContainer}>
                <Icon name="fire" size={18} color={theme.colors.warning} />
                <Text style={[styles.streakValue, { color: theme.colors.warning }]}>
                  {habit.streak} ngày
                </Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.text.secondary[theme.mode] }]}>
                Streak cao nhất:
              </Text>
              <View style={styles.streakContainer}>
                <Icon name="trophy" size={18} color={theme.colors.secondary} />
                <Text style={[styles.streakValue, { color: theme.colors.secondary }]}>
                  {habit.bestStreak} ngày
                </Text>
              </View>
            </View>
            
            {habit.notes && (
              <View style={styles.notesContainer}>
                <Text style={[styles.notesLabel, { color: theme.colors.text.secondary[theme.mode] }]}>
                  Ghi chú:
                </Text>
                <Text style={[styles.notesValue, { color: theme.colors.text.primary[theme.mode] }]}>
                  {habit.notes}
                </Text>
              </View>
            )}
          </View>
        </Card>
        
        {/* Nút hoàn thành */}
        <Button
          title={isTodayCompleted ? "Đã hoàn thành hôm nay" : "Đánh dấu hoàn thành"}
          onPress={handleComplete}
          variant={isTodayCompleted ? "success" : "primary"}
          disabled={isTodayCompleted}
          style={styles.completeButton}
        />
        
        {/* Lịch sử hoàn thành */}
        <Card style={styles.historyCard}>
          <Text style={[styles.historyTitle, { color: theme.colors.text.primary[theme.mode] }]}>
            Lịch sử hoàn thành
          </Text>
          
          {completionHistory.length === 0 ? (
            <Text style={[styles.emptyHistory, { color: theme.colors.text.secondary[theme.mode] }]}>
              Chưa có dữ liệu hoàn thành
            </Text>
          ) : (
            completionHistory.map((completion) => (
              <View key={completion.id} style={styles.historyItem}>
                <View style={styles.historyDate}>
                  <Icon name="calendar" size={16} color={theme.colors.text.secondary[theme.mode]} />
                  <Text style={[styles.dateText, { color: theme.colors.text.primary[theme.mode] }]}>
                    {new Date(completion.completionDate).toLocaleDateString('vi-VN', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Text>
                </View>
                <View style={styles.historyValue}>
                  <Text style={[styles.valueText, { color: theme.colors.primary }]}>
                    {completion.value} {habit.unit}
                  </Text>
                </View>
              </View>
            ))
          )}
        </Card>
        
        {/* Nút xóa */}
        <Button
          title="Xóa thói quen"
          onPress={handleDelete}
          variant="outline"
          style={styles.deleteButton}
          textStyle={{ color: theme.colors.error }}
          iconLeft="delete-outline"
          iconColor={theme.colors.error}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  editButton: {
    padding: 4,
  },
  infoCard: {
    padding: 16,
    marginBottom: 16,
  },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  habitTitleContainer: {
    flex: 1,
  },
  habitName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  habitType: {
    fontSize: 16,
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  detailLabel: {
    fontSize: 16,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakValue: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 4,
  },
  notesContainer: {
    marginTop: 16,
  },
  notesLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  notesValue: {
    fontSize: 16,
    lineHeight: 22,
  },
  completeButton: {
    marginBottom: 16,
  },
  historyCard: {
    padding: 16,
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyHistory: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  historyDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    marginLeft: 8,
  },
  historyValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    marginTop: 24,
  },
});

export default HabitDetailScreen; 