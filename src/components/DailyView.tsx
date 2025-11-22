import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { Task, TaskSpace } from '../types';
import { getTasksForDay } from '../utils/dateHelpers';
import { format, differenceInMinutes, startOfDay, endOfDay, isSameDay } from 'date-fns';
import TaskCard from './TaskCard';

interface DailyViewProps {
    date: Date;
    tasks: Task[];
    taskSpaces: TaskSpace[];
    onTaskPress: (task: Task) => void;
    onToggleComplete?: (task: Task) => void;
    onToggleChecklistItem?: (taskId: string, itemId: string) => void;
    onPreviousDay: () => void;
    onNextDay: () => void;
    onToday: () => void;
}

const HOUR_HEIGHT = 60;
const TIME_COLUMN_WIDTH = 50;

export default function DailyView({
    date,
    tasks,
    taskSpaces,
    onTaskPress,
    onToggleComplete,
    onToggleChecklistItem,
    onPreviousDay,
    onNextDay,
    onToday,
}: DailyViewProps) {
    const { colors } = useTheme();
    const dayTasks = getTasksForDay(tasks, date);

    // Generate hours 0-23
    const hours = Array.from({ length: 24 }, (_, i) => i);

    const getTaskSpaceColor = (taskSpaceId: string): string => {
        const space = taskSpaces.find(ts => ts.id === taskSpaceId);
        return space?.color || colors.primary;
    };

    const getTaskSpaceName = (taskSpaceId: string): string => {
        const space = taskSpaces.find(ts => ts.id === taskSpaceId);
        return space?.name || 'General';
    };

    const scrollViewRef = React.useRef<ScrollView>(null);
    const [currentTime, setCurrentTime] = React.useState(new Date());

    React.useEffect(() => {
        // Update current time every minute
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        // Initial scroll to current time if viewing today
        if (isSameDay(date, new Date())) {
            const minutes = new Date().getHours() * 60 + new Date().getMinutes();
            const offset = (minutes / 60) * HOUR_HEIGHT - 100; // Scroll to 100px above current time
            setTimeout(() => {
                scrollViewRef.current?.scrollTo({ y: Math.max(0, offset), animated: true });
            }, 100);
        }

        return () => clearInterval(timer);
    }, [date]);

    const getTaskPosition = (task: Task) => {
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);

        const taskStart = new Date(task.startTime);
        const taskEnd = new Date(task.endTime);

        // Clamp start and end times to the current day
        const effectiveStart = taskStart < dayStart ? dayStart : taskStart;
        const effectiveEnd = taskEnd > dayEnd ? dayEnd : taskEnd;

        const startMinutes = differenceInMinutes(effectiveStart, dayStart);
        const durationMinutes = differenceInMinutes(effectiveEnd, effectiveStart);

        const top = (startMinutes / 60) * HOUR_HEIGHT;
        const height = (durationMinutes / 60) * HOUR_HEIGHT;

        return { top, height };
    };

    const CurrentTimeLine = () => {
        if (!isSameDay(date, currentTime)) return null;

        const minutes = currentTime.getHours() * 60 + currentTime.getMinutes();
        const top = (minutes / 60) * HOUR_HEIGHT;

        return (
            <View style={[styles.currentTimeLine, { top }]}>
                <View style={styles.currentTimeDot} />
            </View>
        );
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
        },
        timeLabel: {
            height: HOUR_HEIGHT,
            textAlign: 'center',
            color: colors.text.tertiary,
            fontSize: FONT_SIZES.xs,
            transform: [{ translateY: -8 }], // Center vertically with the line
        },
        tasksColumn: {
            flex: 1,
            position: 'relative',
            height: 24 * HOUR_HEIGHT,
        },
        gridLine: {
            height: HOUR_HEIGHT,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            opacity: 0.3,
        },
        taskWrapper: {
            position: 'absolute',
            left: SPACING.xs,
            right: SPACING.xs,
            zIndex: 1,
        },
        currentTimeLine: {
            position: 'absolute',
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: colors.error, // Red line
            zIndex: 10,
        },
        currentTimeDot: {
            position: 'absolute',
            left: -4,
            top: -4,
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: colors.error,
        },
        emptyState: {
            padding: SPACING.xl,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: SPACING.xxl,
        },
        emptyStateText: {
            color: colors.text.secondary,
            fontSize: FONT_SIZES.md,
            textAlign: 'center',
        },
    }), [colors]);

    return (
        <ScrollView
            ref={scrollViewRef}
            style={{ flex: 1 }}
        >
            <View style={styles.container}>
                {/* Time Column */}
                <View style={styles.timeColumn}>
                    {hours.map((hour) => (
                        <Text key={hour} style={styles.timeLabel}>
                            {`${hour.toString().padStart(2, '0')}:00`}
                        </Text>
                    ))}
                </View>

                {/* Tasks Column */}
                <View style={styles.tasksColumn}>
                    {/* Grid Lines */}
                    {hours.map((hour) => (
                        <View key={`grid-${hour}`} style={styles.gridLine} />
                    ))}

                    {/* Current Time Line */}
                    <CurrentTimeLine />

                    {/* Tasks */}
                    {dayTasks.map((task) => {
                        const { top, height } = getTaskPosition(task);
                        return (
                            <View
                                key={task.id}
                                style={[
                                    styles.taskWrapper,
                                    { top, height: Math.max(height, 20) } // Minimum height reduced
                                ]}
                            >
                                <TaskCard
                                    task={task}
                                    spaceColor={getTaskSpaceColor(task.taskSpaceId)}
                                    spaceName={getTaskSpaceName(task.taskSpaceId)}
                                    onPress={() => onTaskPress(task)}
                                    onToggleComplete={() => onToggleComplete?.(task)}
                                    onToggleChecklistItem={(itemId) => onToggleChecklistItem?.(task.id, itemId)}
                                    compact={height < 60} // Use compact mode for short tasks
                                    style={{ flex: 1 }}
                                />
                            </View>
                        );
                    })}

                    {dayTasks.length === 0 && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>No tasks scheduled for today</Text>
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
    );
}
