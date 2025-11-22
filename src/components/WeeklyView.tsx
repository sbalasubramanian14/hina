import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    TouchableOpacity,
} from 'react-native';
import { SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { Task, TaskSpace } from '../types';
import { getTasksForDay } from '../utils/dateHelpers';
import { format, addDays, startOfWeek, differenceInMinutes, startOfDay, isSameDay } from 'date-fns';
import TaskCard from './TaskCard';

interface WeeklyViewProps {
    date: Date;
    tasks: Task[];
    taskSpaces: TaskSpace[];
    onTaskPress: (task: Task) => void;
    onToggleComplete?: (task: Task) => void;
    onDateSelect: (date: Date) => void;
}

const HOUR_HEIGHT = 60;
const TIME_COLUMN_WIDTH = 50;
const HEADER_HEIGHT = 50;

export default function WeeklyView({
    date,
    tasks,
    taskSpaces,
    onTaskPress,
    onToggleComplete,
    onDateSelect,
}: WeeklyViewProps) {
    const { colors } = useTheme();
    const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Start on Monday
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const hours = Array.from({ length: 24 }, (_, i) => i);

    const getTaskSpaceColor = (taskSpaceId: string): string => {
        const space = taskSpaces.find(ts => ts.id === taskSpaceId);
        return space?.color || colors.primary;
    };

    const getTaskPosition = (task: Task) => {
        const startDate = new Date(task.startTime);
        const endDate = new Date(task.endTime);
        const startOfDayDate = startOfDay(startDate);

        const startMinutes = differenceInMinutes(startDate, startOfDayDate);
        const durationMinutes = differenceInMinutes(endDate, startDate);

        const top = (startMinutes / 60) * HOUR_HEIGHT;
        const height = (durationMinutes / 60) * HOUR_HEIGHT;

        return { top, height };
    };

    const styles = React.useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            flexDirection: 'row',
        },
        timeColumn: {
            width: TIME_COLUMN_WIDTH,
            backgroundColor: colors.background.primary,
            borderRightWidth: 1,
            borderRightColor: colors.border,
            paddingTop: HEADER_HEIGHT,
        },
        timeLabel: {
            height: HOUR_HEIGHT,
            textAlign: 'center',
            color: colors.text.tertiary,
            fontSize: FONT_SIZES.xs,
            transform: [{ translateY: -8 }],
        },
        daysContainer: {
            flex: 1,
            flexDirection: 'row',
        },
        dayColumn: {
            flex: 1,
            borderRightWidth: 1,
            borderRightColor: colors.border,
        },
        dayHeader: {
            height: HEADER_HEIGHT,
            justifyContent: 'center',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            backgroundColor: colors.background.secondary,
        },
        dayName: {
            fontSize: FONT_SIZES.xs,
            color: colors.text.secondary,
            marginBottom: 2,
        },
        dayNumber: {
            fontSize: FONT_SIZES.md,
            fontWeight: FONT_WEIGHTS.bold,
            color: colors.text.primary,
        },
        todayHeader: {
            backgroundColor: colors.primary + '10', // 10% opacity
        },
        todayNumber: {
            color: colors.primary,
        },
        gridLine: {
            height: HOUR_HEIGHT,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            opacity: 0.2,
        },
        taskWrapper: {
            position: 'absolute',
            left: 1,
            right: 1,
            zIndex: 1,
            padding: 1,
        },
        compactTask: {
            flex: 1,
            backgroundColor: colors.card,
            borderRadius: 4,
            borderLeftWidth: 3,
            padding: 2,
            overflow: 'hidden',
        },
        compactTitle: {
            fontSize: 10,
            fontWeight: 'bold',
            color: colors.text.primary,
        },
    }), [colors]);

    return (
        <ScrollView style={{ flex: 1 }}>
            <View style={styles.container}>
                {/* Time Column */}
                <View style={styles.timeColumn}>
                    {hours.map((hour) => (
                        <Text key={hour} style={styles.timeLabel}>
                            {`${hour}:00`}
                        </Text>
                    ))}
                </View>

                {/* Days Columns */}
                <View style={styles.daysContainer}>
                    {weekDays.map((day) => {
                        const isToday = isSameDay(day, new Date());
                        const dayTasks = getTasksForDay(tasks, day);

                        return (
                            <View key={day.toISOString()} style={styles.dayColumn}>
                                {/* Header */}
                                <TouchableOpacity
                                    style={[styles.dayHeader, isToday && styles.todayHeader]}
                                    onPress={() => onDateSelect(day)}
                                >
                                    <Text style={styles.dayName}>{format(day, 'EEE')}</Text>
                                    <Text style={[styles.dayNumber, isToday && styles.todayNumber]}>
                                        {format(day, 'd')}
                                    </Text>
                                </TouchableOpacity>

                                {/* Grid & Tasks */}
                                <View style={{ position: 'relative', height: 24 * HOUR_HEIGHT }}>
                                    {hours.map((hour) => (
                                        <View key={`grid-${hour}`} style={styles.gridLine} />
                                    ))}

                                    {dayTasks.map((task) => {
                                        const { top, height } = getTaskPosition(task);
                                        const color = getTaskSpaceColor(task.taskSpaceId);

                                        return (
                                            <TouchableOpacity
                                                key={task.id}
                                                style={[
                                                    styles.taskWrapper,
                                                    { top, height: Math.max(height, 20) }
                                                ]}
                                                onPress={() => onTaskPress(task)}
                                                onLongPress={() => onToggleComplete?.(task)}
                                            >
                                                <View style={[styles.compactTask, { borderLeftColor: color }]}>
                                                    <Text style={styles.compactTitle} numberOfLines={1}>
                                                        {task.title}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        );
                    })}
                </View>
            </View>
        </ScrollView>
    );
}
