import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
} from 'react-native';
import { SPACING } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import { Task, TaskSpace } from '../types';
import { getTasks, getTaskSpaces, addTask, saveTasks, deleteTask } from '../services/storage';
import { addDays, subDays, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';
import DailyView from '../components/DailyView';
import MonthlyView from '../components/MonthlyView';
import WeeklyView from '../components/WeeklyView';
import ViewTabs, { ViewMode } from '../components/ViewTabs';
import DateNavigation from '../components/DateNavigation';
import AddTaskModal from '../components/AddTaskModal';

export default function HomeScreen({ navigation }: any) {
    const { colors } = useTheme();
    const [viewMode, setViewMode] = useState<ViewMode>('day');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [tasks, setTasks] = useState<Task[]>([]);
    const [taskSpaces, setTaskSpaces] = useState<TaskSpace[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [isAddTaskVisible, setIsAddTaskVisible] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

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

    const handlePrevious = () => {
        switch (viewMode) {
            case 'day':
                setSelectedDate(prev => subDays(prev, 1));
                break;
            case 'week':
                setSelectedDate(prev => subWeeks(prev, 1));
                break;
            case 'month':
                setSelectedDate(prev => subMonths(prev, 1));
                break;
        }
    };

    const handleNext = () => {
        switch (viewMode) {
            case 'day':
                setSelectedDate(prev => addDays(prev, 1));
                break;
            case 'week':
                setSelectedDate(prev => addWeeks(prev, 1));
                break;
            case 'month':
                setSelectedDate(prev => addMonths(prev, 1));
                break;
        }
    };

    const handleToday = () => {
        setSelectedDate(new Date());
    };

    const handleAddTask = () => {
        setEditingTask(null);
        setIsAddTaskVisible(true);
    };

    const handleSaveTask = async (taskData: Partial<Task>) => {
        try {
            if (editingTask) {
                // Update existing task
                const updatedTask: Task = {
                    ...editingTask,
                    ...taskData,
                    updatedAt: new Date().toISOString(),
                } as Task;

                // Update local state immediately
                const updatedTasks = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
                setTasks(updatedTasks);

                // Persist changes
                await saveTasks(updatedTasks);
            } else {
                // Create new task
                const newTask: Task = {
                    id: Date.now().toString(),
                    title: taskData.title!,
                    description: taskData.description || '',
                    startTime: taskData.startTime!,
                    endTime: taskData.endTime!,
                    taskSpaceId: taskData.taskSpaceId!,
                    completed: false,
                    isRecurring: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };

                // Update local state immediately
                setTasks(prev => [...prev, newTask]);

                // Persist changes
                await addTask(newTask);
            }

            setIsAddTaskVisible(false);
        } catch (error) {
            console.error('Error saving task:', error);
            await loadData(); // Revert on error
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        try {
            // Update local state immediately
            setTasks(prev => prev.filter(t => t.id !== taskId));

            // Persist changes
            await deleteTask(taskId);
            setIsAddTaskVisible(false);
        } catch (error) {
            console.error('Error deleting task:', error);
            await loadData(); // Revert on error
        }
    };

    const handleToggleComplete = async (task: Task) => {
        try {
            const updatedTask = { ...task, completed: !task.completed, updatedAt: new Date().toISOString() };

            // Optimistic update
            const updatedTasks = tasks.map(t => t.id === task.id ? updatedTask : t);
            setTasks(updatedTasks);

            // Persist changes
            await saveTasks(updatedTasks);
        } catch (error) {
            console.error('Error toggling task:', error);
            await loadData(); // Revert on error
        }
    };

    const handleToggleChecklistItem = async (taskId: string, itemId: string) => {
        try {
            const task = tasks.find(t => t.id === taskId);
            if (!task || !task.checklist) return;

            const updatedChecklist = task.checklist.map(item =>
                item.id === itemId ? { ...item, completed: !item.completed } : item
            );

            const updatedTask = {
                ...task,
                checklist: updatedChecklist,
                updatedAt: new Date().toISOString()
            };

            // Optimistic update
            const updatedTasks = tasks.map(t => t.id === taskId ? updatedTask : t);
            setTasks(updatedTasks);

            // Persist changes
            await saveTasks(updatedTasks);
        } catch (error) {
            console.error('Error toggling checklist item:', error);
            await loadData(); // Revert on error
        }
    };

    const handleTaskPress = (task: Task) => {
        setEditingTask(task);
        setIsAddTaskVisible(true);
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setViewMode('day');
    };

    const styles = React.useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background.primary,
        },
        content: {
            flex: 1,
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
            <View style={styles.content}>
                {/* View Tabs */}
                <ViewTabs selectedView={viewMode} onViewChange={setViewMode} />

                {/* Date Navigation */}
                <DateNavigation
                    date={selectedDate}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                    onToday={handleToday}
                />

                {/* Views */}
                {viewMode === 'day' && (
                    <DailyView
                        date={selectedDate}
                        tasks={tasks}
                        taskSpaces={taskSpaces}
                        onTaskPress={handleTaskPress}
                        onToggleComplete={handleToggleComplete}
                        onToggleChecklistItem={handleToggleChecklistItem}
                        onPreviousDay={handlePrevious}
                        onNextDay={handleNext}
                        onToday={handleToday}
                    />
                )}

                {viewMode === 'week' && (
                    <WeeklyView
                        date={selectedDate}
                        tasks={tasks}
                        taskSpaces={taskSpaces}
                        onTaskPress={handleTaskPress}
                        onToggleComplete={handleToggleComplete}
                        onDateSelect={handleDateSelect}
                    />
                )}

                {viewMode === 'month' && (
                    <MonthlyView
                        date={selectedDate}
                        tasks={tasks}
                        taskSpaces={taskSpaces}
                        onDateSelect={handleDateSelect}
                        onMonthChange={setSelectedDate}
                    />
                )}
            </View>

            {/* FAB for adding tasks */}
            <TouchableOpacity style={styles.fab} onPress={handleAddTask}>
                <MaterialIcons name="add" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Add Task Modal */}
            <AddTaskModal
                visible={isAddTaskVisible}
                onClose={() => setIsAddTaskVisible(false)}
                onSave={handleSaveTask}
                onDelete={handleDeleteTask}
                taskSpaces={taskSpaces}
                initialDate={selectedDate}
                task={editingTask}
            />
        </View>
    );
}
