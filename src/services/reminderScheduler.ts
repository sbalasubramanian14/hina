import * as Notifications from 'expo-notifications';
import { Task } from '../types';
import { getTaskSuggestion } from './ai/taskSuggestions';
import { differenceInMinutes, isFuture, format } from 'date-fns';

export interface ReminderScheduleOptions {
    taskId: string;
    taskTitle: string;
    taskDescription?: string;
    startTime: Date;
    reminderMinutes: number;
    taskSpace: string;
    userInterests?: string[];
    checklist?: { id: string; text: string; completed: boolean }[];
    location?: string;
}

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/**
 * Get a random emoji for task notifications
 */
function getRandomNotificationEmoji(): string {
    const emojis = ['📋', '✨', '🎯', '⭐', '💫', '🔔', '⏰', '🎉', '💪', '🚀', '✅', '📌', '🎊', '🌟'];
    return emojis[Math.floor(Math.random() * emojis.length)];
}

/**
 * Schedule a task reminder notification with AI suggestion
 */
export async function scheduleTaskReminder(
    options: ReminderScheduleOptions
): Promise<string | null> {
    console.log('⏰ Scheduling reminder for task:', options.taskTitle);
    console.log('📅 Task details:', {
        taskId: options.taskId,
        startTime: options.startTime.toISOString(),
        reminderMinutes: options.reminderMinutes,
        taskSpace: options.taskSpace,
    });

    try {
        // Check if notification permissions are granted
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
            console.warn('⚠️  Notification permissions not granted');
            return null;
        }

        // Calculate notification time
        const notificationTime = new Date(options.startTime);
        notificationTime.setMinutes(notificationTime.getMinutes() - options.reminderMinutes);

        console.log('🔔 Notification will be sent at:', notificationTime.toISOString());

        // Don't schedule if notification time is in the past
        if (!isFuture(notificationTime)) {
            console.log('⏭️  Notification time is in the past, skipping');
            return null;
        }

        // Get AI suggestion for the task
        let aiSuggestion = '';
        try {
            console.log('🤖 Requesting AI suggestion...');
            aiSuggestion = await getTaskSuggestion({
                taskTitle: options.taskTitle,
                taskDescription: options.taskDescription,
                startTime: options.startTime,
                taskSpace: options.taskSpace,
                userInterests: options.userInterests,
                checklist: options.checklist,
                location: options.location,
            });
            console.log('✅ AI suggestion:', aiSuggestion);
        } catch (error) {
            console.error('❌ Failed to get AI suggestion, using fallback');
            aiSuggestion = '⏰ Time to get ready!';
        }

        // Calculate minutes until start
        const minutesUntilStart = options.reminderMinutes;
        const timeInfo = minutesUntilStart === 0
            ? 'Starting now'
            : `Starts in ${minutesUntilStart} min`;

        const notificationContent = {
            title: `${getRandomNotificationEmoji()} ${options.taskTitle}`,
            body: `${aiSuggestion}\n${timeInfo}`,
        };

        console.log('📬 Notification content:', notificationContent);

        // Schedule the notification
        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                ...notificationContent,
                data: {
                    taskId: options.taskId,
                    type: 'task_reminder',
                },
                sound: 'default', // Use default notification sound
                priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: notificationTime,
            },
        });

        console.log(`✅ Scheduled reminder ${notificationId} for task ${options.taskId}`);
        return notificationId;
    } catch (error) {
        console.error('❌ Error scheduling task reminder:', error);
        return null;
    }
}

/**
 * Cancel a task reminder notification
 */
export async function cancelTaskReminder(taskId: string): Promise<void> {
    try {
        // Get all scheduled notifications
        const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

        // Find notifications for this task
        const taskNotifications = scheduledNotifications.filter(
            notification => notification.content.data?.taskId === taskId
        );

        // Cancel each notification
        for (const notification of taskNotifications) {
            await Notifications.cancelScheduledNotificationAsync(notification.identifier);
            console.log(`Cancelled reminder ${notification.identifier} for task ${taskId}`);
        }
    } catch (error) {
        console.error('Error cancelling task reminder:', error);
    }
}

/**
 * Reschedule all pending reminders
 * Called on app startup to ensure reminders are active
 */
export async function rescheduleAllReminders(
    tasks: Task[],
    taskSpaces: { id: string; name: string }[],
    userInterests?: string[]
): Promise<void> {
    try {
        console.log('Rescheduling all reminders...');

        // Cancel all existing notifications
        await Notifications.cancelAllScheduledNotificationsAsync();

        // Only schedule reminders for incomplete future tasks
        const now = new Date();
        const upcomingTasks = tasks.filter(task => {
            const startTime = new Date(task.startTime);
            return !task.completed && isFuture(startTime);
        });

        console.log(`Found ${upcomingTasks.length} upcoming tasks`);

        // Schedule reminder for each task
        for (const task of upcomingTasks) {
            const reminderMinutes = task.reminderMinutesBefore ?? 15; // Default 15 minutes
            const taskSpace = taskSpaces.find(ts => ts.id === task.taskSpaceId);

            await scheduleTaskReminder({
                taskId: task.id,
                taskTitle: task.title,
                taskDescription: task.description,
                startTime: new Date(task.startTime),
                reminderMinutes,
                taskSpace: taskSpace?.name || 'Task',
                userInterests,
                checklist: task.checklist,
                // Note: location is not available during app startup reschedule
            });
        }

        console.log('All reminders rescheduled successfully');
    } catch (error) {
        console.error('Error rescheduling reminders:', error);
    }
}

/**
 * Handle notification response (when user taps notification)
 */
export function setupNotificationResponseListener(
    onTaskOpen: (taskId: string) => void,
    onMarkComplete?: (taskId: string) => void
): void {
    Notifications.addNotificationResponseReceivedListener(response => {
        const data = response.notification.request.content.data;

        if (data?.type === 'task_reminder' && data?.taskId) {
            // User tapped the notification - open the task
            onTaskOpen(data.taskId);
        }
    });
}
