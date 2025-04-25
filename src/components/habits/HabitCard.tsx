import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  ViewStyle
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Habit } from '../../types/habit';
import { Card } from '../common';

interface HabitCardProps {
  habit: Habit;
  completed: boolean;
  progress: number;
  onPress: () => void;
  onCompletePress: () => void;
}

const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  completed,
  progress,
  onPress,
  onCompletePress
}) => {
  const { theme } = useTheme();
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  if (!habit) {
    return null;
  }

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress / 100,
      duration: 500,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false
    }).start();
  }, [progress]);

  const width = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  const cardStyle: ViewStyle = {
    marginBottom: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: habit.color || theme.colors.primary,
    backgroundColor: theme.colors.surface[theme.mode],
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    overflow: 'hidden'
  };

  return (
    <Card style={cardStyle} onPress={onPress}>
      <View style={styles.contentContainer}>
        <View 
          style={[
            styles.iconContainer, 
            { 
              backgroundColor: habit.color || theme.colors.primary,
              opacity: completed ? 0.7 : 1 
            }
          ]}
        >
          <Icon 
            name={habit.icon || 'star-outline'} 
            size={24} 
            color={theme.colors.white} 
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text 
            style={[
              styles.habitName, 
              { 
                color: theme.colors.text.primary[theme.mode],
                textDecorationLine: completed ? 'line-through' : 'none',
                opacity: completed ? 0.7 : 1
              }
            ]}
          >
            {habit.name}
          </Text>
          
          {habit.streak > 0 && (
            <View style={styles.streakContainer}>
              <Icon 
                name="fire" 
                size={14} 
                color={theme.colors.accent} 
                style={styles.streakIcon}
              />
              <Text 
                style={[
                  styles.streakText, 
                  { color: theme.colors.accent }
                ]}
              >
                {habit.streak}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.rightContainer}>
          <TouchableOpacity
            style={[
              styles.completeButton,
              { 
                backgroundColor: completed 
                  ? theme.colors.success 
                  : theme.colors.background[theme.mode]
              }
            ]}
            onPress={onCompletePress}
          >
            <Icon 
              name={completed ? "check" : "circle-outline"} 
              size={22} 
              color={completed ? theme.colors.white : theme.colors.text.primary[theme.mode]} 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      {progress > 0 && (
        <View style={styles.progressContainer}>
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
                  backgroundColor: completed 
                    ? theme.colors.success 
                    : (habit.color || theme.colors.primary),
                  width
                }
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.text.secondary[theme.mode] }]}>
            {progress}%
          </Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakIcon: {
    marginRight: 4,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '500',
  },
  rightContainer: {
    marginLeft: 8,
  },
  completeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  progressContainer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    width: 34,
    textAlign: 'right',
  },
});

export default HabitCard; 