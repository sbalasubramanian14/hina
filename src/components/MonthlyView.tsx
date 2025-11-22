import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { Task, TaskSpace } from '../types';
import { getMonthDays, getTasksForDay } from '../utils/dateHelpers';
import { format, isSameMonth, addMonths, subMonths } from 'date-fns';

interface MonthlyViewProps {
    date: Date;
    tasks: Task[];
    taskSpaces: TaskSpace[];
    onDateSelect: (date: Date) => void;
    onMonthChange: (date: Date) => void;
}

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

    const getTaskCountForDay = (day: Date): number => {
        return getTasksForDay(tasks, day).length;
    };

    const hasTasksOnDay = (day: Date): boolean => {
        return getTasksForDay(tasks, day).length > 0;
    };

    const styles = React.useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background.primary,
        },
        monthHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: SPACING.lg,
            paddingVertical: SPACING.md,
        },
        navButton: {
            padding: SPACING.sm,
        },
        navButtonText: {
            fontSize: FONT_SIZES.xl,
            color: colors.text.primary,
        },
        monthTitle: {
            fontSize: FONT_SIZES.lg,
            fontWeight: FONT_WEIGHTS.bold,
            color: colors.text.primary,
        },
        weekdayHeader: {
            flexDirection: 'row',
            paddingHorizontal: SPACING.lg,
            paddingBottom: SPACING.sm,
        },
        weekdayCell: {
            flex: 1,
            alignItems: 'center',
        },
        weekdayText: {
            fontSize: FONT_SIZES.xs,
            fontWeight: FONT_WEIGHTS.semibold,
            color: colors.text.secondary,
        },
        calendarGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            paddingHorizontal: SPACING.lg,
        },
        dayCell: {
            width: '14.28%',
            aspectRatio: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: SPACING.xs,
        },
        todayCell: {
            backgroundColor: colors.primary,
            borderRadius: BORDER_RADIUS.sm,
            borderWidth: 2,
            borderColor: colors.primary,
        },
        otherMonthCell: {
            opacity: 0.3,
        },
        dayNumber: {
            fontSize: FONT_SIZES.sm,
            color: colors.text.primary,
            fontWeight: FONT_WEIGHTS.medium,
        },
        todayText: {
            color: colors.text.inverse,
            fontWeight: FONT_WEIGHTS.bold,
        },
        otherMonthText: {
            color: colors.text.tertiary,
        },
        taskIndicator: {
            position: 'absolute',
            bottom: 2,
            backgroundColor: colors.primary,
            borderRadius: BORDER_RADIUS.sm,
            paddingHorizontal: SPACING.xs,
            minWidth: 16,
        },
        taskCount: {
            fontSize: 10,
            color: colors.text.inverse,
            textAlign: 'center',
        },
    }), [colors]);

    return (
        <View style={styles.container}>
            {/* Month Navigation */}
            <View style={styles.monthHeader}>
                <TouchableOpacity onPress={handlePreviousMonth} style={styles.navButton}>
                    <Text style={styles.navButtonText}>←</Text>
                </TouchableOpacity>

                <Text style={styles.monthTitle}>
                    {format(date, 'MMMM yyyy')}
                </Text>

                <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
                    <Text style={styles.navButtonText}>→</Text>
                </TouchableOpacity>
            </View>

            {/* Weekday Headers */}
            <View style={styles.weekdayHeader}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <View key={day} style={styles.weekdayCell}>
                        <Text style={styles.weekdayText}>{day}</Text>
                    </View>
                ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
                {/* Add empty cells for days before month starts */}
                {Array.from({ length: monthDays[0].getDay() }).map((_, index) => (
                    <View key={`empty-${index}`} style={styles.dayCell} />
                ))}

                {/* Month days */}
                {monthDays.map((day) => {
                    const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
                    const isCurrentMonth = isSameMonth(day, date);
                    const taskCount = getTaskCountForDay(day);
                    const hasTasks = hasTasksOnDay(day);

                    return (
                        <TouchableOpacity
                            key={day.toISOString()}
                            style={[
                                styles.dayCell,
                                isToday && styles.todayCell,
                                !isCurrentMonth && styles.otherMonthCell,
                            ]}
                            onPress={() => onDateSelect(day)}
                        >
                            <Text style={[
                                styles.dayNumber,
                                isToday && styles.todayText,
                                !isCurrentMonth && styles.otherMonthText,
                            ]}>
                                {format(day, 'd')}
                            </Text>

                            {hasTasks && (
                                <View style={styles.taskIndicator}>
                                    <Text style={styles.taskCount}>{taskCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}
