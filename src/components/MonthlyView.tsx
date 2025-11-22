import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ScrollView,
} from 'react-native';
import { SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { Task, TaskSpace } from '../types';
import { getMonthDays, getTasksForDay } from '../utils/dateHelpers';
import { format, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { MaterialIcons } from '@expo/vector-icons';

interface MonthlyViewProps {
    date: Date;
    tasks: Task[];
    taskSpaces: TaskSpace[];
    onDateSelect: (date: Date) => void;
    onMonthChange: (date: Date) => void;
}

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function MonthlyView({
    date,
    tasks,
    taskSpaces,
    onDateSelect,
    onMonthChange,
}: MonthlyViewProps) {
    const { colors } = useTheme();
    const monthDays = getMonthDays(date);
    const today = new Date();

    const handlePreviousMonth = () => {
        onMonthChange(subMonths(date, 1));
    };

    const handleNextMonth = () => {
        onMonthChange(addMonths(date, 1));
    };

    const getTaskDots = (day: Date) => {
        const dayTasks = getTasksForDay(tasks, day);
        // Take up to 3 tasks to show as dots
        return dayTasks.slice(0, 3).map(task => {
            const space = taskSpaces.find(ts => ts.id === task.taskSpaceId);
            return space?.color || colors.primary;
        });
    };

    const styles = React.useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            padding: SPACING.md,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: SPACING.lg,
        },
        monthTitle: {
            fontSize: FONT_SIZES.lg,
            fontWeight: FONT_WEIGHTS.bold,
            color: colors.text.primary,
        },
        navButton: {
            padding: SPACING.sm,
        },
        grid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
        },
        weekDay: {
            width: '14.28%',
            alignItems: 'center',
            marginBottom: SPACING.md,
        },
        weekDayText: {
            fontSize: FONT_SIZES.sm,
            color: colors.text.tertiary,
            fontWeight: FONT_WEIGHTS.medium,
        },
        dayCell: {
            width: '14.28%',
            aspectRatio: 1,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: SPACING.xs,
            borderRadius: BORDER_RADIUS.full,
        },
        currentMonthDay: {
            // Background can be added if selected
        },
        otherMonthDay: {
            opacity: 0.3,
        },
        todayCell: {
            backgroundColor: colors.primary + '15', // 15% opacity
            borderWidth: 1,
            borderColor: colors.primary,
        },
        selectedCell: {
            backgroundColor: colors.primary,
        },
        dayText: {
            fontSize: FONT_SIZES.md,
            color: colors.text.primary,
            marginBottom: 4,
        },
        todayText: {
            color: colors.primary,
            fontWeight: FONT_WEIGHTS.bold,
        },
        selectedDayText: {
            color: colors.text.inverse,
            fontWeight: FONT_WEIGHTS.bold,
        },
        dotsContainer: {
            flexDirection: 'row',
            gap: 3,
            height: 6,
        },
        dot: {
            width: 6,
            height: 6,
            borderRadius: 3,
        },
    }), [colors]);

    return (
        <ScrollView style={styles.container}>
            {/* Week Days Header */}
            <View style={styles.grid}>
                {WEEK_DAYS.map(day => (
                    <View key={day} style={styles.weekDay}>
                        <Text style={styles.weekDayText}>{day}</Text>
                    </View>
                ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.grid}>
                {monthDays.map((day, index) => {
                    const isCurrentMonth = isSameMonth(day, date);
                    const isToday = isSameDay(day, today);
                    const taskDots = getTaskDots(day);

                    return (
                        <TouchableOpacity
                            key={day.toISOString()}
                            style={[
                                styles.dayCell,
                                !isCurrentMonth && styles.otherMonthDay,
                                isToday && styles.todayCell,
                            ]}
                            onPress={() => onDateSelect(day)}
                        >
                            <Text style={[
                                styles.dayText,
                                isToday && styles.todayText
                            ]}>
                                {format(day, 'd')}
                            </Text>

                            {/* Task Dots */}
                            <View style={styles.dotsContainer}>
                                {taskDots.map((color, i) => (
                                    <View
                                        key={i}
                                        style={[styles.dot, { backgroundColor: color }]}
                                    />
                                ))}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </ScrollView>
    );
}
