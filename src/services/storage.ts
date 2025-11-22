import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, TaskSpace, UserProfile, AppSettings } from '../types';

const KEYS = {
    TASKS: '@tasks',
    TASK_SPACES: '@task_spaces',
    USER_PROFILE: '@user_profile',
    APP_SETTINGS: '@app_settings',
};

// Tasks
export const getTasks = async (): Promise<Task[]> => {
    try {
        console.log('💾 Getting tasks from storage...');
        const data = await AsyncStorage.getItem(KEYS.TASKS);
        console.log('💾 Tasks raw data:', data);
        const parsed = data ? JSON.parse(data) : [];
        console.log('💾 Tasks parsed:', parsed.length, 'tasks');
        return parsed;
    } catch (error) {
        console.error('💾 ERROR getting tasks:', error);
        return [];
    }
};

export const saveTasks = async (tasks: Task[]): Promise<void> => {
    try {
        await AsyncStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
    } catch (error) {
        console.error('Error saving tasks:', error);
    }
};

export const addTask = async (task: Task): Promise<void> => {
    const tasks = await getTasks();
    tasks.push(task);
    await saveTasks(tasks);
};

export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<void> => {
    const tasks = await getTasks();
    const index = tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
        tasks[index] = { ...tasks[index], ...updates };
        await saveTasks(tasks);
    }
};

export const deleteTask = async (taskId: string): Promise<void> => {
    const tasks = await getTasks();
    const filtered = tasks.filter(t => t.id !== taskId);
    await saveTasks(filtered);
};

// Task Spaces
export const getTaskSpaces = async (): Promise<TaskSpace[]> => {
    try {
        console.log('💾 Getting task spaces from storage...');
        const data = await AsyncStorage.getItem(KEYS.TASK_SPACES);
        console.log('💾 Task spaces raw data:', data);
        const parsed = data ? JSON.parse(data) : [];
        console.log('💾 Task spaces parsed:', parsed.length, 'spaces');
        return parsed;
    } catch (error) {
        console.error('💾 ERROR getting task spaces:', error);
        return [];
    }
};

export const saveTaskSpaces = async (taskSpaces: TaskSpace[]): Promise<void> => {
    try {
        await AsyncStorage.setItem(KEYS.TASK_SPACES, JSON.stringify(taskSpaces));
    } catch (error) {
        console.error('Error saving task spaces:', error);
    }
};

export const saveTaskSpace = async (taskSpace: TaskSpace): Promise<void> => {
    const taskSpaces = await getTaskSpaces();
    const index = taskSpaces.findIndex(ts => ts.id === taskSpace.id);

    if (index !== -1) {
        // Update existing
        taskSpaces[index] = taskSpace;
    } else {
        // Add new
        taskSpaces.push(taskSpace);
    }

    await saveTaskSpaces(taskSpaces);
};

export const addTaskSpace = async (taskSpace: TaskSpace): Promise<void> => {
    const taskSpaces = await getTaskSpaces();
    taskSpaces.push(taskSpace);
    await saveTaskSpaces(taskSpaces);
};

export const updateTaskSpace = async (id: string, updates: Partial<TaskSpace>): Promise<void> => {
    const taskSpaces = await getTaskSpaces();
    const index = taskSpaces.findIndex(ts => ts.id === id);
    if (index !== -1) {
        taskSpaces[index] = { ...taskSpaces[index], ...updates };
        await saveTaskSpaces(taskSpaces);
    }
};

export const deleteTaskSpace = async (id: string): Promise<void> => {
    const taskSpaces = await getTaskSpaces();
    const filtered = taskSpaces.filter(ts => ts.id !== id);
    await saveTaskSpaces(filtered);

    // Also delete all tasks in this space
    const tasks = await getTasks();
    const filteredTasks = tasks.filter(t => t.taskSpaceId !== id);
    await saveTasks(filteredTasks);
};

// User Profile
export const getUserProfile = async (): Promise<UserProfile | null> => {
    try {
        const data = await AsyncStorage.getItem(KEYS.USER_PROFILE);
        if (!data) return null;

        const parsed = JSON.parse(data);
        console.log('User profile loaded successfully:', parsed);
        return parsed;
    } catch (error) {
        console.error('Error getting user profile:', error);
        console.error('Clearing corrupted profile data...');
        // Clear corrupted profile to allow fresh start
        await AsyncStorage.removeItem(KEYS.USER_PROFILE);
        return null;
    }
};

export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
    try {
        await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (error) {
        console.error('Error saving user profile:', error);
    }
};

export const updateUserProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    const profile = await getUserProfile();
    if (profile) {
        await saveUserProfile({ ...profile, ...updates });
    }
};

// App Settings
export const getAppSettings = async (): Promise<AppSettings> => {
    try {
        const data = await AsyncStorage.getItem(KEYS.APP_SETTINGS);
        return data ? JSON.parse(data) : {
            theme: 'light',
            defaultView: 'day',
            aiSuggestionsEnabled: true,
            proactiveNotificationsEnabled: true,
        };
    } catch (error) {
        console.error('Error getting app settings:', error);
        return {
            theme: 'light',
            defaultView: 'day',
            aiSuggestionsEnabled: true,
            proactiveNotificationsEnabled: true,
        };
    }
};

export const saveAppSettings = async (settings: AppSettings): Promise<void> => {
    try {
        await AsyncStorage.setItem(KEYS.APP_SETTINGS, JSON.stringify(settings));
    } catch (error) {
        console.error('Error saving app settings:', error);
    }
};

// Clear all data (for debugging/reset)
export const clearAllData = async (): Promise<void> => {
    try {
        await AsyncStorage.multiRemove([
            KEYS.TASKS,
            KEYS.TASK_SPACES,
            KEYS.USER_PROFILE,
            KEYS.APP_SETTINGS,
        ]);
    } catch (error) {
        console.error('Error clearing data:', error);
    }
};
