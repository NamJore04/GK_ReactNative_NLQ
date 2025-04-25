import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  FlatList
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch, AppThunk } from '../../store';
import { fetchHabits, completeHabit, fetchCompletions } from '../../store/actions/habitActions';
import HabitCard from '../../components/habits/HabitCard';
import { formatDate } from '../../utils/helpers';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Habit, HabitSummary } from '../../types/habit';
import { Card } from '../../components/common';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/types';

type DashboardScreenNavigationProp = StackNavigationProp<MainStackParamList, 'Dashboard'>;

const DashboardScreen: React.FC = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  
  const { user } = useSelector((state: RootState) => state.auth);
  const { habits, completions, isLoading } = useSelector((state: RootState) => state.habits);
  
  const [refreshing, setRefreshing] = useState(false);
  const [todayDate] = useState(formatDate(new Date()));
  
  // Tạo các HabitSummary từ habits và completions
  const habitSummaries: HabitSummary[] = Object.values(habits).map(habit => {
    const habitCompletions = completions[habit.id] || {};
    const isCompleted = !!habitCompletions[todayDate];
    
    // Tính progress dựa trên giá trị hiện tại và target
    const progress = habit.targetValue > 0 
      ? Math.min(100, Math.round((habit.currentValue / habit.targetValue) * 100)) 
      : (isCompleted ? 100 : 0);
    
    return {
      id: habit.id,
      name: habit.name,
      type: habit.type,
      icon: habit.icon,
      color: habit.color,
      progress,
      isCompleted,
      streak: habit.streak,
    };
  });
  
  // Phân loại habits theo trạng thái hoàn thành
  const completedHabits = habitSummaries.filter(habit => habit.isCompleted);
  const incompleteHabits = habitSummaries.filter(habit => !habit.isCompleted);
  
  // Lấy dữ liệu khi component mount
  useEffect(() => {
    loadData();
  }, []);
  
  // Hàm để tải dữ liệu
  const loadData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(fetchHabits()),
        dispatch(fetchCompletions())
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Xử lý refresh
  const handleRefresh = () => {
    loadData();
  };
  
  // Xử lý hoàn thành một habit
  const handleCompleteHabit = (habitId: string) => {
    const habit = habits[habitId];
    if (habit) {
      try {
        dispatch(completeHabit(habitId, habit.targetValue));
      } catch (error) {
        console.error('Không thể hoàn thành thói quen:', error);
      }
    }
  };
  
  // Chuyển đến màn hình chi tiết habit
  const handleHabitPress = (habitId: string) => {
    navigation.navigate('HabitDetail', { habitId });
  };
  
  // Chuyển đến màn hình tạo habit mới
  const handleAddHabit = () => {
    navigation.navigate('HabitForm', { mode: 'create' });
  };
  
  // Render progress header
  const renderProgressHeader = () => {
    const totalHabits = habitSummaries.length;
    const completedCount = completedHabits.length;
    const progressPercentage = totalHabits > 0 
      ? Math.round((completedCount / totalHabits) * 100) 
      : 0;
    
    return (
      <Card style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={[styles.greeting, { color: theme.colors.text.primary[theme.mode] }]}>
            Xin chào, {user?.displayName || 'Bạn'}
          </Text>
          <Text style={[styles.date, { color: theme.colors.text.secondary[theme.mode] }]}>
            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressInfo}>
            <Text style={[styles.progressText, { color: theme.colors.text.primary[theme.mode] }]}>
              Tiến độ hôm nay
            </Text>
            <Text style={[styles.progressPercentage, { color: theme.colors.primary }]}>
              {progressPercentage}%
            </Text>
            <Text style={[styles.progressDetails, { color: theme.colors.text.secondary[theme.mode] }]}>
              {completedCount}/{totalHabits} thói quen
            </Text>
          </View>
          
          <View 
            style={[
              styles.progressBar,
              { backgroundColor: theme.colors.background[theme.mode] }
            ]}
          >
            <View 
              style={[
                styles.progressFill,
                { 
                  backgroundColor: theme.colors.primary,
                  width: `${progressPercentage}%`
                }
              ]}
            />
          </View>
        </View>
      </Card>
    );
  };
  
  // Render section header
  const renderSectionHeader = (title: string, count: number) => {
    return (
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary[theme.mode] }]}>
          {title}
        </Text>
        <Text style={[styles.sectionCount, { color: theme.colors.text.secondary[theme.mode] }]}>
          {count}
        </Text>
      </View>
    );
  };
  
  // Render empty state
  const renderEmptyState = () => {
    if (habitSummaries.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="book-outline" size={48} color={theme.colors.text.disabled[theme.mode]} />
          <Text style={[styles.emptyText, { color: theme.colors.text.secondary[theme.mode] }]}>
            Bạn chưa có thói quen nào.
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.colors.text.secondary[theme.mode] }]}>
            Hãy thêm thói quen mới để bắt đầu theo dõi!
          </Text>
        </View>
      );
    }
    return null;
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background[theme.mode] }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {renderProgressHeader()}
        
        {renderEmptyState()}
        
        {incompleteHabits.length > 0 && (
          <>
            {renderSectionHeader('Cần hoàn thành', incompleteHabits.length)}
            {incompleteHabits.map(summary => (
              <HabitCard
                key={summary.id}
                habit={habits[summary.id]}
                completed={summary.isCompleted}
                progress={summary.progress}
                onPress={() => handleHabitPress(summary.id)}
                onCompletePress={() => handleCompleteHabit(summary.id)}
              />
            ))}
          </>
        )}
        
        {completedHabits.length > 0 && (
          <>
            {renderSectionHeader('Đã hoàn thành', completedHabits.length)}
            {completedHabits.map(summary => (
              <HabitCard
                key={summary.id}
                habit={habits[summary.id]}
                completed={summary.isCompleted}
                progress={summary.progress}
                onPress={() => handleHabitPress(summary.id)}
                onCompletePress={() => handleCompleteHabit(summary.id)}
              />
            ))}
          </>
        )}
      </ScrollView>
      
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
        onPress={handleAddHabit}
      >
        <Icon name="plus" size={24} color={theme.colors.white} />
      </TouchableOpacity>
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
    paddingBottom: 80,
  },
  progressCard: {
    marginBottom: 24,
    padding: 16,
  },
  progressHeader: {
    marginBottom: 16,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressDetails: {
    fontSize: 14,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionCount: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginVertical: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default DashboardScreen; 