import { Task, RecurrenceRule } from '../types';
import {
    addDays,
    addWeeks,
    addMonths,
    format,
    isSameDay,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    parseISO,
} from 'date-fns';

export const formatTime = (date: Date): string => {
    return format(date, 'HH:mm');
};

export const formatDate = (date: Date): string => {
    return format(date, 'MMM dd, yyyy');
};

export const formatDateLong = (date: Date): string => {
    return format(date, 'EEEE, MMMM dd, yyyy');
};

export const generateRecurringTasks = (task: Task, startDate: Date, endDate: Date): Task[] => {
    if (!task.isRecurring || !task.recurrenceRule) {
        return [task];
    }

    const tasks: Task[] = [];
    const rule = task.recurrenceRule;
    let currentDate = new Date(task.startTime);
    let occurrenceCount = 0;

    while (currentDate <= endDate) {
        if (currentDate >= startDate) {
            // Check if this occurrence should be included
            if (rule.frequency === 'weekly' && rule.daysOfWeek) {
                const dayOfWeek = currentDate.getDay();
                if (!rule.daysOfWeek.includes(dayOfWeek)) {
                    currentDate = addDays(currentDate, 1);
                    continue;
                }
            }

            // Create task instance for this occurrence
            const taskDuration = new Date(task.endTime).getTime() - new Date(task.startTime).getTime();
            const instanceStart = new Date(currentDate);
            const instanceEnd = new Date(currentDate.getTime() + taskDuration);

            tasks.push({
                ...task,
                id: `${task.id}_${format(currentDate, 'yyyy-MM-dd')}`,
                startTime: instanceStart.toISOString(),
                endTime: instanceEnd.toISOString(),
            });

            occurrenceCount++;

            // Check end conditions
            if (rule.endAfterOccurrences && occurrenceCount >= rule.endAfterOccurrences) {
                break;
            }
        }

        // Move to next occurrence
        switch (rule.frequency) {
            case 'daily':
                currentDate = addDays(currentDate, rule.interval);
                break;
            case 'weekly':
                currentDate = addWeeks(currentDate, rule.interval);
                break;
            case 'monthly':
                currentDate = addMonths(currentDate, rule.interval);
                break;
            default:
                currentDate = addDays(currentDate, rule.interval);
        }

        // Check end date condition
        if (rule.endDate && currentDate > new Date(rule.endDate)) {
            break;
        }
    }

    return tasks;
};

export const getTasksForDay = (tasks: Task[], date: Date): Task[] => {
    return tasks.filter(task => isSameDay(new Date(task.startTime), date));
};

export const getTasksForWeek = (tasks: Task[], date: Date): Task[] => {
    const weekStart = startOfWeek(date);
    const weekEnd = endOfWeek(date);

    return tasks.filter(task => {
        const taskDate = new Date(task.startTime);
        return taskDate >= weekStart && taskDate <= weekEnd;
    });
};

export const getTasksForMonth = (tasks: Task[], date: Date): Task[] => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    return tasks.filter(task => {
        const taskDate = new Date(task.startTime);
        return taskDate >= monthStart && taskDate <= monthEnd;
    });
};

export const getMonthDays = (date: Date) => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    return eachDayOfInterval({ start: monthStart, end: monthEnd });
};

export const areTasksOverlapping = (task1: Task, task2: Task): boolean => {
    const start1 = new Date(task1.startTime);
    const end1 = new Date(task1.endTime);
    const start2 = new Date(task2.startTime);
    const end2 = new Date(task2.endTime);

    return (start1 < end2 && end1 > start2);
};

export const getTaskDuration = (task: Task): number => {
    const start = new Date(task.startTime);
    const end = new Date(task.endTime);
    return (end.getTime() - start.getTime()) / (1000 * 60); // Duration in minutes
};
