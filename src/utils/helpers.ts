/**
 * Các hàm tiện ích cho ứng dụng
 */
import { nanoid } from 'nanoid';
import { HabitCompletion, Frequency } from '../types/habit';

/**
 * Tạo ID duy nhất
 */
export const generateId = (): string => {
  return nanoid(16);
};

/**
 * Format date object thành chuỗi YYYY-MM-DD
 */
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Chuyển đổi chuỗi YYYY-MM-DD thành đối tượng Date
 */
export const parseDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Tính streak dựa trên completions và frequency
 */
export const calculateStreak = (
  completions: Record<string, HabitCompletion>,
  frequency: Frequency
): { currentStreak: number; longestStreak: number } => {
  if (!completions || Object.keys(completions).length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Lấy danh sách dates từ completions
  const dates = Object.keys(completions).map(date => parseDate(date));
  dates.sort((a, b) => b.getTime() - a.getTime()); // Sắp xếp giảm dần (mới nhất trước)

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let currentStreak = 0;
  let longestStreak = 0;
  let currentDate = new Date(today);

  if (frequency === 'daily') {
    // Xử lý daily streak
    for (let i = 0; i < dates.length; i++) {
      const dateStr = formatDate(dates[i]);
      const expectedDateStr = formatDate(currentDate);
      
      if (dateStr === expectedDateStr) {
        currentStreak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
  } else if (frequency === 'weekly') {
    // Xử lý weekly streak
    const startOfWeek = getStartOfWeek(today);
    let currentWeek = formatDate(startOfWeek);
    
    // Chuyển đổi dates thành tuần
    const weekCompletions: Record<string, boolean> = {};
    dates.forEach(date => {
      const week = formatDate(getStartOfWeek(date));
      weekCompletions[week] = true;
    });
    
    while (weekCompletions[currentWeek]) {
      currentStreak++;
      const prevWeek = new Date(parseDate(currentWeek));
      prevWeek.setDate(prevWeek.getDate() - 7);
      currentWeek = formatDate(prevWeek);
    }
  }
  
  // Tính longest streak từ lịch sử
  if (dates.length > 0) {
    let streak = 1;
    for (let i = 1; i < dates.length; i++) {
      const prevDate = dates[i - 1];
      const currDate = dates[i];
      
      const diffTime = prevDate.getTime() - currDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      
      if (frequency === 'daily' && diffDays === 1) {
        streak++;
      } else if (frequency === 'weekly' && diffDays <= 7) {
        const prevWeek = getStartOfWeek(prevDate);
        const currWeek = getStartOfWeek(currDate);
        if (prevWeek.getTime() !== currWeek.getTime()) {
          streak++;
        }
      } else {
        longestStreak = Math.max(longestStreak, streak);
        streak = 1;
      }
    }
    
    longestStreak = Math.max(longestStreak, streak);
  }

  return {
    currentStreak,
    longestStreak
  };
};

/**
 * Lấy ngày đầu tuần (Thứ Hai) từ date
 */
export const getStartOfWeek = (date: Date): Date => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Điều chỉnh khi ngày là Chủ Nhật
  const monday = new Date(date);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

/**
 * Kiểm tra xem habit đã hoàn thành cho ngày cụ thể hay chưa
 */
export const isHabitCompletedForDate = (
  completions: Record<string, HabitCompletion>,
  date: Date
): boolean => {
  const dateStr = formatDate(date);
  return !!completions && !!completions[dateStr];
};

/**
 * Tính tỷ lệ hoàn thành habit theo ngày
 */
export const calculateCompletionRate = (
  completions: Record<string, HabitCompletion>,
  startDate: Date,
  endDate: Date,
  frequency: Frequency
): number => {
  if (!completions || Object.keys(completions).length === 0) {
    return 0;
  }

  let totalDays = 0;
  let completedDays = 0;
  const current = new Date(startDate);

  // Lặp qua từng ngày trong khoảng
  while (current <= endDate) {
    if (frequency === 'daily' || 
       (frequency === 'weekly' && current.getDay() === 1)) {
      totalDays++;
      
      if (isHabitCompletedForDate(completions, current)) {
        completedDays++;
      }
    }
    
    current.setDate(current.getDate() + 1);
  }

  return totalDays > 0 ? (completedDays / totalDays) * 100 : 0;
}; 