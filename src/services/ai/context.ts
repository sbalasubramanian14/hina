import * as Location from 'expo-location';
import { AIContextData, Task } from '../../types';
import { getTasks, getUserProfile } from '../storage';
import { format } from 'date-fns';

export const gatherContext = async (): Promise<AIContextData> => {
    const now = new Date();
    const profile = await getUserProfile();
    const allTasks = await getTasks();

    // Filter today's tasks
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const todayTasks = allTasks.filter(task => {
        const taskStart = new Date(task.startTime);
        return taskStart >= todayStart && taskStart <= todayEnd;
    });

    // Get unique task spaces
    const activeTaskSpaces = [...new Set(todayTasks.map(t => t.taskSpaceId))];

    // Flatten user interests
    const userInterests = profile?.interests.flatMap(i => i.items) || [];

    // Get location if permitted
    let location;
    if (profile?.locationPermission) {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const loc = await Location.getCurrentPositionAsync({});
                location = {
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                };
            }
        } catch (error) {
            console.log('Location error:', error);
        }
    }

    return {
        currentTime: now.toISOString(),
        currentDate: format(now, 'yyyy-MM-dd'),
        dayOfWeek: format(now, 'EEEE'),
        location,
        todayTasks,
        activeTaskSpaces,
        userInterests,
    };
};

export const getRelevantTasks = (tasks: Task[], timeframe: 'current' | 'upcoming' | 'today'): Task[] => {
    const now = new Date();

    switch (timeframe) {
        case 'current':
            return tasks.filter(task => {
                const start = new Date(task.startTime);
                const end = new Date(task.endTime);
                return start <= now && end >= now;
            });

        case 'upcoming':
            return tasks.filter(task => {
                const start = new Date(task.startTime);
                const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
                return start > now && start <= oneHourFromNow;
            });

        case 'today':
            const todayStart = new Date(now);
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date(now);
            todayEnd.setHours(23, 59, 59, 999);

            return tasks.filter(task => {
                const start = new Date(task.startTime);
                return start >= todayStart && start <= todayEnd;
            });

        default:
            return tasks;
    }
};
