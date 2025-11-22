import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { Task, TaskSpace } from '../types';
import { getTasksForDay } from '../utils/dateHelpers';
import { format } from 'date-fns';

interface DailyViewProps {
    date: Date;
    tasks: Task[];
    taskSpaces: TaskSpace[];
    onTaskPress: (task: Task) => void;
    onPreviousDay: () => void;
    onNextDay: () => void;
    onToday: () => void;
}

export default function DailyView({
    date,
    tasks,
    taskSpaces,
    onTaskPress,
    onPreviousDay,
    onNextDay,
    onToday,
}: DailyViewProps) {
    const { colors } = useTheme();
    const dayTasks = getTasksForDay(tasks, date);
    const sortedTasks = [...dayTasks].sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    const getTaskSpaceColor = (taskSpaceId: string): string => {
        const space = taskSpaces.find(ts => ts.id === taskSpaceId);
        return space?.color || colors.primary;
    };

    const getTaskSpaceName = (taskSpaceId: string): string => {
        const space = taskSpaces.find(ts => ts.id === taskSpaceId);
        return space?.name || 'Unknown';
    };

    const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

    const styles = React.useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            padding: SPACING.lg,
        },
        navigation: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: SPACING.lg,
        },
        navButton: {
            width: 40,
            height: 40,
            borderRadius: BORDER_RADIUS.md,
            backgroundColor: colors.background.secondary,
            justifyContent: 'center',
            alignItems: 'center',
            marginHorizontal: SPACING.xs,
        },
        navButtonText: {
            fontSize: FONT_SIZES.xl,
            color: colors.text.primary,
        },
        todayButton: {
            paddingHorizontal: SPACING.md,
            paddingVertical: SPACING.sm,
            borderRadius: BORDER_RADIUS.md,
            backgroundColor: colors.primary,
        },
        todayButtonText: {
            color: colors.text.inverse,
            fontWeight: FONT_WEIGHTS.semibold,
            fontSize: FONT_SIZES.sm,
        },
        tasksList: {
            flex: 1,
        },
        emptyState: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: SPACING.xxl * 2,
        },
        emptyStateEmoji: {
            fontSize: 64,
            marginBottom: SPACING.md,
        },
        emptyStateText: {
            fontSize: FONT_SIZES.lg,
            fontWeight: FONT_WEIGHTS.semibold,
            color: colors.text.primary,
            marginBottom: SPACING.xs,
        },
        emptyStateSubtext: {
            fontSize: FONT_SIZES.sm,
            color: colors.text.secondary,
        },
        taskCard: {
            flexDirection: 'row',
            backgroundColor: colors.card,
            borderRadius: BORDER_RADIUS.md,
            marginBottom: SPACING.md,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: colors.border,
        },
        taskColorBar: {
            width: 4,
        },
        taskContent: {
            flex: 1,
            padding: SPACING.md,
        },
        taskHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: SPACING.xs,
        },
        taskTime: {
            fontSize: FONT_SIZES.sm,
            color: colors.text.secondary,
            fontWeight: FONT_WEIGHTS.medium,
        },
        recurringBadge: {
            fontSize: FONT_SIZES.sm,
        },
        taskTitle: {
            fontSize: FONT_SIZES.md,
            fontWeight: FONT_WEIGHTS.semibold,
            color: colors.text.primary,
            marginBottom: SPACING.sm,
        },
        taskDescription: {
            fontSize: FONT_SIZES.sm,
            color: colors.text.secondary,
            marginTop: SPACING.xs,
        },
        taskFooter: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        taskSpaceBadge: {
            paddingHorizontal: SPACING.sm,
            paddingVertical: 4,
            borderRadius: BORDER_RADIUS.sm,
        },
        taskSpaceText: {
            fontSize: FONT_SIZES.xs,
            color: colors.text.inverse,
            fontWeight: FONT_WEIGHTS.semibold,
        },
        aiCard: {
            backgroundColor: colors.background.secondary,
            borderRadius: BORDER_RADIUS.md,
            padding: SPACING.md,
            marginTop: SPACING.md,
            borderWidth: 1,
            borderColor: colors.border,
        },
        aiCardHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: SPACING.xs,
        },
        aiCardIcon: {
            fontSize: FONT_SIZES.lg,
            marginRight: SPACING.sm,
        },
        aiCardTitle: {
            fontSize: FONT_SIZES.md,
            fontWeight: FONT_WEIGHTS.semibold,
            color: colors.text.primary,
        },
        aiCardText: {
            fontSize: FONT_SIZES.sm,
            color: colors.text.secondary,
        },
    }), [colors]);

    return (
        <View style={styles.container}>
            {/* Date Navigation */}
            <View style={styles.navigation}>
                <TouchableOpacity onPress={onPreviousDay} style={styles.navButton}>
                    <Text style={styles.navButtonText}>←</Text>
                </TouchableOpacity>

                {!isToday && (
                    <TouchableOpacity onPress={onToday} style={styles.todayButton}>
                        <Text style={styles.todayButtonText}>Today</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity onPress={onNextDay} style={styles.navButton}>
                    <Text style={styles.navButtonText}>→</Text>
                </TouchableOpacity>
            </View>

            {/* Tasks List */}
            <ScrollView style={styles.tasksList}>
                {sortedTasks.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateEmoji}>📅</Text>
                        <Text style={styles.emptyStateText}>No tasks scheduled</Text>
                        <Text style={styles.emptyStateSubtext}>Tap + to add a task</Text>
                    </View>
                ) : (
                    sortedTasks.map((task) => {
                        const taskColor = getTaskSpaceColor(task.taskSpaceId);
                        const taskSpaceName = getTaskSpaceName(task.taskSpaceId);
                        const startTime = format(new Date(task.startTime), 'HH:mm');
                        const endTime = format(new Date(task.endTime), 'HH:mm');

                        return (
                            <TouchableOpacity
                                key={task.id}
                                style={styles.taskCard}
                                onPress={() => onTaskPress(task)}
                            >
                                <View style={[styles.taskColorBar, { backgroundColor: taskColor }]} />

                                <View style={styles.taskContent}>
                                    <View style={styles.taskHeader}>
                                        <Text style={styles.taskTime}>
                                            {startTime} - {endTime}
                                        </Text>
                                        {task.isRecurring && (
                                            <Text style={styles.recurringBadge}>🔄</Text>
                                        )}
                                    </View>

                                    <Text style={styles.taskTitle}>{task.title}</Text>

                                    <View style={styles.taskFooter}>
                                        <View style={[styles.taskSpaceBadge, { backgroundColor: taskColor }]}>
                                            <Text style={styles.taskSpaceText}>{taskSpaceName}</Text>
                                        </View>
                                    </View>

                                    {task.description && (
                                        <Text style={styles.taskDescription} numberOfLines={2}>
                                            {task.description}
                                        </Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    })
                )}

                {/* AI Suggestions Card */}
                {sortedTasks.length > 0 && (
                    <View style={styles.aiCard}>
                        <View style={styles.aiCardHeader}>
                            <Text style={styles.aiCardIcon}>🤖</Text>
                            <Text style={styles.aiCardTitle}>AI Assistant</Text>
                        </View>
                        <Text style={styles.aiCardText}>
                            Tap to get AI suggestions for your day
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
