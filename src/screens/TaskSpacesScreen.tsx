import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../constants/colors';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getTaskSpaces, getTasks } from '../services/storage';
import type { TaskSpace, Task } from '../types';

export default function TaskSpacesScreen() {
    const { colors } = useTheme();
    const [taskSpaces, setTaskSpaces] = useState<TaskSpace[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [spaces, allTasks] = await Promise.all([
            getTaskSpaces(),
            getTasks(),
        ]);
        setTaskSpaces(spaces);
        setTasks(allTasks);
    };

    const getTaskCount = (spaceId: string): number => {
        return tasks.filter(task => task.taskSpaceId === spaceId).length;
    };

    const handleAddSpace = () => {
        console.log('Add task space clicked');
    };

    const handleSpacePress = (space: TaskSpace) => {
        console.log('Space pressed:', space.name);
    };

    const styles = React.useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background.primary,
        },
        content: {
            flex: 1,
            paddingHorizontal: SPACING.lg,
            paddingTop: SPACING.lg,
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
        spaceCard: {
            flexDirection: 'row',
            backgroundColor: colors.card,
            borderRadius: BORDER_RADIUS.md,
            padding: SPACING.md,
            marginBottom: SPACING.md,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
        },
        spaceIconContainer: {
            marginRight: SPACING.md,
        },
        spaceIcon: {
            width: 48,
            height: 48,
            borderRadius: BORDER_RADIUS.md,
            justifyContent: 'center',
            alignItems: 'center',
        },
        spaceIconText: {
            fontSize: 24,
        },
        spaceContent: {
            flex: 1,
        },
        spaceName: {
            fontSize: FONT_SIZES.md,
            fontWeight: FONT_WEIGHTS.semibold,
            color: colors.text.primary,
            marginBottom: SPACING.xs,
        },
        spaceDescription: {
            fontSize: FONT_SIZES.sm,
            color: colors.text.secondary,
            marginBottom: SPACING.xs,
        },
        taskCount: {
            fontSize: FONT_SIZES.xs,
            color: colors.text.tertiary,
        },
        chevron: {
            fontSize: FONT_SIZES.xxl,
            color: colors.text.tertiary,
            marginLeft: SPACING.sm,
        },
        fab: {
            position: 'absolute',
            right: SPACING.lg,
            bottom: SPACING.lg,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
        },
    }), [colors]);

    return (
        <View style={styles.container}>
            {/* Task Spaces List */}
            <ScrollView style={styles.content}>
                {taskSpaces.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateEmoji}>📁</Text>
                        <Text style={styles.emptyStateText}>No task spaces yet</Text>
                        <Text style={styles.emptyStateSubtext}>
                            Create spaces to organize your tasks
                        </Text>
                    </View>
                ) : (
                    taskSpaces.map((space) => {
                        const taskCount = getTaskCount(space.id);
                        return (
                            <TouchableOpacity
                                key={space.id}
                                style={styles.spaceCard}
                                onPress={() => handleSpacePress(space)}
                            >
                                <View style={styles.spaceIconContainer}>
                                    <View style={[styles.spaceIcon, { backgroundColor: space.color }]}>
                                        <Text style={styles.spaceIconText}>{space.icon}</Text>
                                    </View>
                                </View>

                                <View style={styles.spaceContent}>
                                    <Text style={styles.spaceName}>{space.name}</Text>
                                    {space.description && (
                                        <Text style={styles.spaceDescription} numberOfLines={2}>
                                            {space.description}
                                        </Text>
                                    )}
                                    <Text style={styles.taskCount}>
                                        {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
                                    </Text>
                                </View>

                                <Text style={styles.chevron}>›</Text>
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>

            {/* FAB for adding new task space */}
            <TouchableOpacity style={styles.fab} onPress={handleAddSpace}>
                <MaterialIcons name="add" size={28} color="#FFFFFF" />
            </TouchableOpacity>
        </View>
    );
}
