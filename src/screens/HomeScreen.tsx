import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
} from 'react-native';
import { SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import { Task, TaskSpace } from '../types';
import { getTasks, getTaskSpaces } from '../services/storage';
import { format, addDays, subDays } from 'date-fns';
import DailyView from '../components/DailyView';
import MonthlyView from '../components/MonthlyView';

type ViewMode = 'day' | 'month';

export default function HomeScreen({ navigation }: any) {
    const { colors } = useTheme();
    const [viewMode, setViewMode] = useState<ViewMode>('day');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [tasks, setTasks] = useState<Task[]>([]);
    const [taskSpaces, setTaskSpaces] = useState<TaskSpace[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [loadedTasks, loadedSpaces] = await Promise.all([
                getTasks(),
                getTaskSpaces(),
            ]);
            setTasks(loadedTasks);
            setTaskSpaces(loadedSpaces);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handlePreviousDay = () => {
        setSelectedDate(prev => subDays(prev, 1));
    };

    const handleNextDay = () => {
        setSelectedDate(prev => addDays(prev, 1));
    };

    const handleToday = () => {
        setSelectedDate(new Date());
    };

    const handleAddTask = () => {
        console.log('Add task clicked');
    };

    const handleTaskPress = (task: Task) => {
        console.log('Task pressed:', task.title);
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setViewMode('day');
    };

    // Use useMemo to recreate styles when colors change
    const styles = React.useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background.primary,
        },
        header: {
            padding: SPACING.lg,
            paddingTop: SPACING.xxl,
            backgroundColor: colors.background.primary,
        },
        headerDate: {
            fontSize: FONT_SIZES.xl,
            fontWeight: FONT_WEIGHTS.bold,
            color: colors.text.primary,
        },
        headerYear: {
            fontSize: FONT_SIZES.md,
            color: colors.text.secondary,
            marginTop: SPACING.xs,
        },
        viewSelector: {
            flexDirection: 'row',
            paddingHorizontal: SPACING.lg,
            marginBottom: SPACING.md,
        },
        viewButton: {
            flex: 1,
            paddingVertical: SPACING.sm,
            paddingHorizontal: SPACING.md,
            borderRadius: BORDER_RADIUS.lg,
            backgroundColor: colors.background.secondary,
            alignItems: 'center',
            marginRight: SPACING.sm,
        },
        viewButtonActive: {
            backgroundColor: colors.primary,
        },
        viewButtonText: {
            fontSize: FONT_SIZES.sm,
            fontWeight: FONT_WEIGHTS.semibold,
            color: colors.text.secondary,
        },
        viewButtonTextActive: {
            color: colors.text.inverse,
        },
        content: {
            flex: 1,
        },
        fab: {
            position: 'absolute',
            right: SPACING.lg,
            bottom: SPACING.xxl,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
        },
    }), [colors]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerDate}>
                        {format(selectedDate, 'EEEE, MMMM dd')}
                    </Text>
                    <Text style={styles.headerYear}>{format(selectedDate, 'yyyy')}</Text>
                </View>
            </View>

            <View style={styles.viewSelector}>
                <TouchableOpacity
                    style={[styles.viewButton, viewMode === 'day' && styles.viewButtonActive]}
                    onPress={() => setViewMode('day')}
                >
                    <Text style={[
                        styles.viewButtonText,
                        viewMode === 'day' && styles.viewButtonTextActive
                    ]}>
                        Day
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.viewButton, viewMode === 'month' && styles.viewButtonActive]}
                    onPress={() => setViewMode('month')}
                >
                    <Text style={[
                        styles.viewButtonText,
                        viewMode === 'month' && styles.viewButtonTextActive
                    ]}>
                        Month
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {viewMode === 'day' ? (
                    <DailyView
                        date={selectedDate}
                        tasks={tasks}
                        taskSpaces={taskSpaces}
                        onTaskPress={handleTaskPress}
                        onPreviousDay={handlePreviousDay}
                        onNextDay={handleNextDay}
                        onToday={handleToday}
                    />
                ) : (
                    <MonthlyView
                        date={selectedDate}
                        tasks={tasks}
                        taskSpaces={taskSpaces}
                        onDateSelect={handleDateSelect}
                        onMonthChange={setSelectedDate}
                    />
                )}
            </ScrollView>

            <TouchableOpacity style={styles.fab} onPress={handleAddTask}>
                <MaterialIcons name="add" size={32} color={colors.text.inverse} />
            </TouchableOpacity>
        </View>
    );
}
