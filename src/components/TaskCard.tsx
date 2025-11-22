import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { Task } from '../types';
import { format } from 'date-fns';

interface TaskCardProps {
    task: Task;
    spaceColor: string;
    spaceName: string;
    compact?: boolean;
    onPress?: () => void;
    onToggleComplete?: () => void;
    onToggleChecklistItem?: (itemId: string) => void;
    style?: any;
}

export default function TaskCard({
    task,
    spaceColor,
    spaceName,
    compact = false,
    onPress,
    onToggleComplete,
    onToggleChecklistItem,
    style,
}: TaskCardProps) {
    const { colors } = useTheme();

    const startTime = new Date(task.startTime);
    const endTime = new Date(task.endTime);
    const timeRange = `${format(startTime, 'HH:mm')} - ${format(endTime, 'HH:mm')}`;
    const hasChecklist = task.checklist && task.checklist.length > 0;

    const styles = React.useMemo(() => StyleSheet.create({
        container: {
            backgroundColor: colors.card,
            borderRadius: BORDER_RADIUS.md,
            padding: compact ? SPACING.sm : SPACING.md,
            marginBottom: SPACING.sm,
            borderLeftWidth: 4,
            borderLeftColor: spaceColor,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
        },
        contentRow: {
            flexDirection: 'row',
            flex: 1,
            gap: SPACING.md,
        },
        mainContent: {
            flex: 1,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: compact ? 0 : SPACING.xs,
        },
        timeRange: {
            fontSize: compact ? FONT_SIZES.xs : FONT_SIZES.sm,
            color: colors.text.secondary,
            fontWeight: FONT_WEIGHTS.medium,
        },
        title: {
            fontSize: compact ? FONT_SIZES.sm : FONT_SIZES.md,
            fontWeight: FONT_WEIGHTS.bold,
            color: colors.text.primary,
            marginBottom: compact ? 0 : SPACING.xxs,
        },
        titleCompleted: {
            textDecorationLine: 'line-through',
            opacity: 0.6,
        },
        spaceName: {
            fontSize: FONT_SIZES.xs,
            color: colors.text.tertiary,
            marginTop: SPACING.xxs,
        },
        actions: {
            flexDirection: 'row',
            gap: SPACING.xs,
        },
        actionButton: {
            padding: SPACING.xs,
        },
        checklistContainer: {
            flex: 0.8,
            borderLeftWidth: 1,
            borderLeftColor: colors.border,
            paddingLeft: SPACING.md,
            justifyContent: 'center',
        },
        checklistItem: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 4,
            gap: 4,
        },
        checklistItemText: {
            fontSize: FONT_SIZES.xs,
            color: colors.text.secondary,
            flex: 1,
        },
        completedChecklistItemText: {
            textDecorationLine: 'line-through',
            opacity: 0.6,
        },
    }), [colors, compact, spaceColor]);

    return (
        <TouchableOpacity
            style={[styles.container, style]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.contentRow}>
                <View style={styles.mainContent}>
                    <View style={styles.header}>
                        <Text style={styles.timeRange}>{timeRange}</Text>
                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={(e) => {
                                    e.stopPropagation();
                                    onToggleComplete?.();
                                }}
                            >
                                <MaterialIcons
                                    name={task.completed ? "check-circle" : "radio-button-unchecked"}
                                    size={20}
                                    color={task.completed ? colors.primary : colors.text.tertiary}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Text style={[styles.title, task.completed && styles.titleCompleted]}>
                        {task.title}
                    </Text>

                    {!compact && (
                        <Text style={styles.spaceName}>{spaceName}</Text>
                    )}
                </View>

                {hasChecklist && !compact && (
                    <View style={styles.checklistContainer}>
                        {task.checklist!.map(item => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.checklistItem}
                                onPress={(e) => {
                                    e.stopPropagation();
                                    onToggleChecklistItem?.(item.id);
                                }}
                            >
                                <MaterialIcons
                                    name={item.completed ? "check-box" : "check-box-outline-blank"}
                                    size={16}
                                    color={item.completed ? colors.text.tertiary : colors.text.secondary}
                                />
                                <Text
                                    style={[
                                        styles.checklistItemText,
                                        item.completed && styles.completedChecklistItemText
                                    ]}
                                    numberOfLines={1}
                                >
                                    {item.text}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}
