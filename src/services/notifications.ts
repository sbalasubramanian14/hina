import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Task } from '../types';
import { getUserProfile, updateUserProfile } from './storage';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export const requestNotificationPermissions = async (): Promise<boolean> => {
    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Notification permissions not granted');
            return false;
        }

        // Update user profile
        await updateUserProfile({ notificationsPermission: true });

        // On Android, configure notification channel
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#6366F1',
            });
        }

        return true;
    } catch (error) {
        console.error('Error requesting notification permissions:', error);
        return false;
    }
};

export const scheduleTaskReminder = async (task: Task): Promise<string | null> => {
    try {
        const taskStart = new Date(task.startTime);
        const reminderTime = new Date(
            taskStart.getTime() - (task.reminderMinutesBefore || 10) * 60 * 1000
        );

        // Only schedule if in the future
        if (reminderTime <= new Date()) {
            return null;
        }

        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: `📅 ${task.title}`,
                body: `Starting in ${task.reminderMinutesBefore || 10} minutes`,
                data: { taskId: task.id, type: 'task_reminder' },
                sound: true,
            },
            trigger: {
                date: reminderTime,
            },
        });

        return notificationId;
    } catch (error) {
        console.error('Error scheduling task reminder:', error);
        return null;
    }
};

export const scheduleAISuggestion = async (
    title: string,
    body: string,
    triggerTime: Date,
    data?: any
): Promise<string | null> => {
    try {
        if (triggerTime <= new Date()) {
            return null;
        }

        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: `🤖 ${title}`,
                body,
                data: { ...data, type: 'ai_suggestion' },
                sound: true,
            },
            trigger: {
                date: triggerTime,
            },
        });

        return notificationId;
    } catch (error) {
        console.error('Error scheduling AI suggestion:', error);
        return null;
    }
};

export const showImmediateNotification = async (
    title: string,
    body: string,
    data?: any
): Promise<void> => {
    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data,
                sound: true,
            },
            trigger: null, // Immediate
        });
    } catch (error) {
        console.error('Error showing immediate notification:', error);
    }
};

export const cancelNotification = async (notificationId: string): Promise<void> => {
    try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
        console.error('Error canceling notification:', error);
    }
};

export const cancelAllNotifications = async (): Promise<void> => {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
        console.error('Error canceling all notifications:', error);
    }
};

export const getAllScheduledNotifications = async () => {
    try {
        return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
        console.error('Error getting scheduled notifications:', error);
        return [];
    }
};
