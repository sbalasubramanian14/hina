import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import { SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../constants/colors';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getTaskSpaces, getTasks, deleteTaskSpace } from '../services/storage';
import type { TaskSpace, Task } from '../types';
import CreateSpaceModal from '../components/CreateSpaceModal';

export default function TaskSpacesScreen() {
    const { colors } = useTheme();
    const [taskSpaces, setTaskSpaces] = useState<TaskSpace[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingSpace, setEditingSpace] = useState<TaskSpace | undefined>(undefined);

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
        setEditingSpace(undefined);
        setModalVisible(true);
    };

    const handleSpacePress = (space: TaskSpace) => {
        console.log('Space pressed:', space.name);
        // TODO: Navigate to space details screen
    };

    const handleEditSpace = (space: TaskSpace) => {
        setEditingSpace(space);
        setModalVisible(true);
    };

    const handleDeleteSpace = (space: TaskSpace) => {
        const taskCount = getTaskCount(space.id);
        const message = taskCount > 0
            ? `This space has ${taskCount} task(s). Are you sure you want to delete it?`
            : 'Are you sure you want to delete this space?';

        Alert.alert(
            'Delete Space',
            message,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteTaskSpace(space.id);
                            loadData();
                        } catch (error) {
                            console.error('Error deleting space:', error);
                            Alert.alert('Error', 'Failed to delete space. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    const handleSpaceSettings = (space: TaskSpace) => {
        Alert.alert(
            space.name,
            'Choose an action',
            [
                {
                    text: 'Edit',
                    onPress: () => handleEditSpace(space),
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => handleDeleteSpace(space),
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ]
        );
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
            borderRadius: BORDER_RADIUS.lg,
            padding: SPACING.lg,
            marginBottom: SPACING.md,
            borderLeftWidth: 4,
            alignItems: 'center',
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
        },
        spaceIconContainer: {
            marginRight: SPACING.md,
        },
        spaceIcon: {
            width: 56,
            height: 56,
            borderRadius: 28,
            justifyContent: 'center',
            alignItems: 'center',
        },
        spaceIconText: {
            fontSize: 28,
        },
        spaceContent: {
            flex: 1,
        },
        spaceName: {
            fontSize: FONT_SIZES.lg,
            fontWeight: FONT_WEIGHTS.bold,
            color: colors.text.primary,
            marginBottom: SPACING.xs,
        },
        taskCount: {
            fontSize: FONT_SIZES.sm,
            color: colors.text.secondary,
            marginBottom: SPACING.xs,
        },
        spaceDescription: {
            fontSize: FONT_SIZES.xs,
            color: colors.text.tertiary,
            marginTop: SPACING.xs,
        },
        settingsButton: {
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: BORDER_RADIUS.md,
            backgroundColor: colors.background.secondary,
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
            <ScrollView
                style={styles.content}
                contentContainerStyle={{ paddingBottom: 80 }}
                showsVerticalScrollIndicator={false}
            >
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
                                style={[styles.spaceCard, { borderLeftColor: space.color }]}
                                onPress={() => handleSpacePress(space)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.spaceIconContainer}>
                                    <View style={[styles.spaceIcon, { backgroundColor: space.color + '20' }]}>
                                        <Text style={styles.spaceIconText}>{space.icon}</Text>
                                    </View>
                                </View>

                                <View style={styles.spaceContent}>
                                    <Text style={styles.spaceName}>{space.name}</Text>
                                    <Text style={styles.taskCount}>
                                        {taskCount} Active {taskCount === 1 ? 'Task' : 'Tasks'}
                                    </Text>
                                    {space.description && (
                                        <Text style={styles.spaceDescription} numberOfLines={1}>
                                            {space.description}
                                        </Text>
                                    )}
                                </View>

                                <TouchableOpacity
                                    style={styles.settingsButton}
                                    onPress={() => handleSpaceSettings(space)}
                                >
                                    <MaterialIcons name="settings" size={20} color={colors.text.secondary} />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>

            {/* FAB for adding new task space */}
            <TouchableOpacity style={styles.fab} onPress={handleAddSpace}>
                <MaterialIcons name="add" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Create/Edit Modal */}
            <CreateSpaceModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSuccess={() => loadData()}
                editingSpace={editingSpace}
            />
        </View>
    );
}
