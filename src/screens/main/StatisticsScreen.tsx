import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch, AppThunk } from '../../store';
import { fetchHabits, fetchCompletions } from '../../store/actions/habitActions';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card } from '../../components/common';
import { Habit } from '../../types/habit';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { HABIT_TYPES } from '../../config/constants';
import { formatDate } from '../../utils/helpers';

const { width: screenWidth } = Dimensions.get('window');

// Map các loại thói quen sang text hiển thị
const habitTypeLabels: Record<string, string> = {
  water: 'Uống nước',
  sleep: 'Ngủ',
  exercise: 'Tập thể dục',
  mood: 'Tâm trạng',
};

// Màu cho các loại thói quen
const habitTypeColors: Record<string, string> = {
  water: '#2196F3',
  sleep: '#9C27B0',
  exercise: '#4CAF50',
  mood: '#FF9800',
};

const StatisticsScreen: React.FC = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  
  const { habits, completions, isLoading } = useSelector((state: RootState) => state.habits);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [selectedHabitType, setSelectedHabitType] = useState<string | null>(null);
  
  // Load dữ liệu khi component mount
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchHabits()),
        dispatch(fetchCompletions())
      ]);
    } catch (error) {
      console.error('Không thể tải dữ liệu:', error);
    }
  };
  
  // Tính tỷ lệ hoàn thành theo loại thói quen
  const getCompletionRateByType = () => {
    const habitsByType: Record<string, { total: number; completed: number }> = {};
    
    // Khởi tạo đếm cho từng loại habit
    Object.values(HABIT_TYPES).forEach(type => {
      habitsByType[type] = { total: 0, completed: 0 };
    });
    
    // Lọc habits theo loại đã chọn (nếu có)
    const filteredHabits = selectedHabitType 
      ? Object.values(habits).filter(habit => habit.type === selectedHabitType)
      : Object.values(habits);
    
    // Đếm số lượng và số thói quen đã hoàn thành
    filteredHabits.forEach(habit => {
      const type = habit.type;
      habitsByType[type].total += 1;
      
      const habitCompletions = completions[habit.id] || {};
      const completionDates = Object.keys(habitCompletions);
      
      if (completionDates.length > 0) {
        habitsByType[type].completed += 1;
      }
    });
    
    // Chuyển đổi sang định dạng cho biểu đồ
    return Object.entries(habitsByType)
      .filter(([_, data]) => data.total > 0)
      .map(([type, data]) => {
        const percentage = data.total > 0 ? (data.completed / data.total) * 100 : 0;
        return {
          name: habitTypeLabels[type] || type,
          population: percentage,
          color: habitTypeColors[type] || theme.colors.primary,
          legendFontColor: theme.colors.text.primary[theme.mode],
          legendFontSize: 12,
        };
      });
  };
  
  // Lấy dữ liệu cho biểu đồ theo thời gian
  const getTimelineData = () => {
    // Lấy n ngày gần nhất tùy thuộc vào timeRange
    const daysToShow = selectedTimeRange === 'week' ? 7 : selectedTimeRange === 'month' ? 30 : 365;
    
    // Tạo mảng các ngày
    const dates: string[] = [];
    const today = new Date();
    
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(formatDate(date));
    }
    
    // Lọc habits theo loại đã chọn (nếu có)
    const filteredHabits = selectedHabitType 
      ? Object.values(habits).filter(habit => habit.type === selectedHabitType)
      : Object.values(habits);
    
    // Đếm số thói quen hoàn thành cho mỗi ngày
    const completionsPerDay: number[] = dates.map(date => {
      let completedCount = 0;
      
      filteredHabits.forEach(habit => {
        const habitCompletions = completions[habit.id] || {};
        if (habitCompletions[date]) {
          completedCount++;
        }
      });
      
      return completedCount;
    });
    
    // Tùy chỉnh labels dựa trên timeRange
    let labels: string[] = [];
    if (selectedTimeRange === 'week') {
      labels = dates.map(date => {
        const d = new Date(date);
        return ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()];
      });
    } else if (selectedTimeRange === 'month') {
      // Chỉ hiển thị 6 điểm cho đồ thị tháng
      labels = dates.filter((_, i) => i % 5 === 0).map(date => {
        const d = new Date(date);
        return `${d.getDate()}/${d.getMonth() + 1}`;
      });
    } else {
      // Chỉ hiển thị 12 điểm cho đồ thị năm (theo tháng)
      const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
      const monthlyData: number[] = Array(12).fill(0);
      
      dates.forEach((date, index) => {
        const d = new Date(date);
        const month = d.getMonth();
        monthlyData[month] += completionsPerDay[index];
      });
      
      return {
        labels: monthNames,
        datasets: [
          {
            data: monthlyData,
            color: () => theme.colors.primary,
            strokeWidth: 2,
          },
        ],
      };
    }
    
    // Điều chỉnh dữ liệu cho đồ thị tháng nếu cần
    let datasets = [
      {
        data: completionsPerDay,
        color: () => theme.colors.primary,
        strokeWidth: 2,
      },
    ];
    
    if (selectedTimeRange === 'month') {
      const reducedData = completionsPerDay.filter((_, i) => i % 5 === 0);
      datasets = [
        {
          data: reducedData,
          color: () => theme.colors.primary,
          strokeWidth: 2,
        },
      ];
    }
    
    return { labels, datasets };
  };
  
  // Lấy dữ liệu cho biểu đồ phân phối theo loại
  const getHabitDistributionData = () => {
    const habitCountByType: Record<string, number> = {};
    
    // Đếm số thói quen theo loại
    Object.values(habits).forEach(habit => {
      const type = habit.type;
      habitCountByType[type] = (habitCountByType[type] || 0) + 1;
    });
    
    const labels = Object.keys(habitCountByType).map(type => habitTypeLabels[type] || type);
    const data = Object.values(habitCountByType);
    const colors = Object.keys(habitCountByType).map(type => habitTypeColors[type] || theme.colors.primary);
    
    return { labels, data, colors };
  };
  
  const pieChartData = getCompletionRateByType();
  const lineChartData = getTimelineData();
  const { labels: barLabels, data: barData, colors: barColors } = getHabitDistributionData();
  
  // Định nghĩa cấu hình chung cho các biểu đồ
  const chartConfig = {
    backgroundGradientFrom: theme.colors.surface[theme.mode],
    backgroundGradientTo: theme.colors.surface[theme.mode],
    decimalPlaces: 0,
    color: () => theme.colors.primary,
    labelColor: () => theme.colors.text.primary[theme.mode],
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: theme.colors.primary,
    },
  };
  
  // Hiển thị loading nếu dữ liệu đang tải
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background[theme.mode] }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text.primary[theme.mode] }]}>
            Đang tải dữ liệu thống kê...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Hiển thị thông báo nếu không có dữ liệu
  if (Object.keys(habits).length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background[theme.mode] }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary[theme.mode] }]}>
            Thống kê
          </Text>
        </View>
        <View style={styles.emptyContainer}>
          <Icon name="chart-bar" size={48} color={theme.colors.text.disabled[theme.mode]} />
          <Text style={[styles.emptyText, { color: theme.colors.text.secondary[theme.mode] }]}>
            Chưa có dữ liệu thống kê
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.colors.text.secondary[theme.mode] }]}>
            Tạo thói quen mới và theo dõi để xem các biểu đồ thống kê!
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background[theme.mode] }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary[theme.mode] }]}>
          Thống kê
        </Text>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Bộ lọc thời gian */}
        <View style={styles.filterContainer}>
          <Text style={[styles.filterLabel, { color: theme.colors.text.secondary[theme.mode] }]}>
            Khoảng thời gian:
          </Text>
          <View style={styles.timeFilterButtons}>
            {(['week', 'month', 'year'] as const).map(timeRange => (
              <TouchableOpacity
                key={timeRange}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor: selectedTimeRange === timeRange 
                      ? theme.colors.primary 
                      : theme.colors.surface[theme.mode],
                    borderColor: theme.colors.border[theme.mode],
                  }
                ]}
                onPress={() => setSelectedTimeRange(timeRange)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    {
                      color: selectedTimeRange === timeRange 
                        ? theme.colors.white 
                        : theme.colors.text.primary[theme.mode]
                    }
                  ]}
                >
                  {timeRange === 'week' ? 'Tuần' : timeRange === 'month' ? 'Tháng' : 'Năm'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Bộ lọc loại thói quen */}
        <View style={styles.filterContainer}>
          <Text style={[styles.filterLabel, { color: theme.colors.text.secondary[theme.mode] }]}>
            Loại thói quen:
          </Text>
          <View style={styles.habitTypeFilterButtons}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                {
                  backgroundColor: selectedHabitType === null 
                    ? theme.colors.primary 
                    : theme.colors.surface[theme.mode],
                  borderColor: theme.colors.border[theme.mode],
                }
              ]}
              onPress={() => setSelectedHabitType(null)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  {
                    color: selectedHabitType === null 
                      ? theme.colors.white 
                      : theme.colors.text.primary[theme.mode]
                  }
                ]}
              >
                Tất cả
              </Text>
            </TouchableOpacity>
            
            {Object.entries(HABIT_TYPES).map(([key, type]) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor: selectedHabitType === type 
                      ? habitTypeColors[type] 
                      : theme.colors.surface[theme.mode],
                    borderColor: theme.colors.border[theme.mode],
                  }
                ]}
                onPress={() => setSelectedHabitType(type)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    {
                      color: selectedHabitType === type 
                        ? theme.colors.white 
                        : theme.colors.text.primary[theme.mode]
                    }
                  ]}
                >
                  {habitTypeLabels[type]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Biểu đồ theo thời gian */}
        <Card style={styles.chartCard}>
          <Text style={[styles.chartTitle, { color: theme.colors.text.primary[theme.mode] }]}>
            Tiến độ theo thời gian
          </Text>
          <Text style={[styles.chartDescription, { color: theme.colors.text.secondary[theme.mode] }]}>
            Số lượng thói quen hoàn thành theo {selectedTimeRange === 'week' ? 'tuần' : selectedTimeRange === 'month' ? 'tháng' : 'năm'}
          </Text>
          
          <View style={styles.chartContainer}>
            <LineChart
              data={lineChartData}
              width={screenWidth - 64}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
        </Card>
        
        {/* Biểu đồ tỷ lệ hoàn thành theo loại */}
        <Card style={styles.chartCard}>
          <Text style={[styles.chartTitle, { color: theme.colors.text.primary[theme.mode] }]}>
            Tỷ lệ hoàn thành theo loại
          </Text>
          <Text style={[styles.chartDescription, { color: theme.colors.text.secondary[theme.mode] }]}>
            Phần trăm thói quen đã hoàn thành theo từng loại
          </Text>
          
          <View style={styles.chartContainer}>
            {pieChartData.length > 0 ? (
              <PieChart
                data={pieChartData}
                width={screenWidth - 64}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            ) : (
              <Text style={[styles.noDataText, { color: theme.colors.text.secondary[theme.mode] }]}>
                Không có dữ liệu để hiển thị
              </Text>
            )}
          </View>
        </Card>
        
        {/* Biểu đồ phân phối theo loại */}
        <Card style={styles.chartCard}>
          <Text style={[styles.chartTitle, { color: theme.colors.text.primary[theme.mode] }]}>
            Phân phối thói quen theo loại
          </Text>
          <Text style={[styles.chartDescription, { color: theme.colors.text.secondary[theme.mode] }]}>
            Số lượng thói quen của từng loại
          </Text>
          
          <View style={styles.chartContainer}>
            {barData.length > 0 ? (
              <BarChart
                data={{
                  labels: barLabels,
                  datasets: [{ data: barData, colors: barColors }],
                }}
                width={screenWidth - 64}
                height={220}
                chartConfig={chartConfig}
                style={styles.chart}
                fromZero
                showValuesOnTopOfBars
                yAxisLabel=""
                yAxisSuffix=""
              />
            ) : (
              <Text style={[styles.noDataText, { color: theme.colors.text.secondary[theme.mode] }]}>
                Không có dữ liệu để hiển thị
              </Text>
            )}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  timeFilterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  habitTypeFilterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chartCard: {
    padding: 16,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  chartDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataText: {
    fontSize: 16,
    fontStyle: 'italic',
    padding: 40,
  },
});

export default StatisticsScreen; 