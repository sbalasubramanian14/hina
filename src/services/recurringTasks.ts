import { Task, RecurrenceRule } from '../types';
import { addDays, addWeeks, addMonths, isBefore, isAfter, startOfDay, setHours, setMinutes, setSeconds, getDay, getDate } from 'date-fns';

/**
 * Generate recurring task instances based on recurrence rule
 * @param templateTask The original task with recurrence rule
 * @param daysAhead How many days ahead to generate instances (default 30)
 * @returns Array of task instances
 */
export function generateRecurringInstances(
    templateTask: Task,
    daysAhead: number = 30
): Task[] {
    if (!templateTask.recurrenceRule || !templateTask.isRecurring) {
        return [];
    }

    const instances: Task[] = [];
    const rule = templateTask.recurrenceRule;
    const startDate = new Date(templateTask.startTime);
    const endDate = addDays(new Date(), daysAhead);

    // Get task duration
    const taskStart = new Date(templateTask.startTime);
    const taskEnd = new Date(templateTask.endTime);
    const duration = taskEnd.getTime() - taskStart.getTime();

    let currentDate = startOfDay(startDate);
    const today = startOfDay(new Date());

    // Skip past dates - start from today
    if (isBefore(currentDate, today)) {
        currentDate = today;
    }

    let instanceCount = 0;
    const maxInstances = 100; // Safety limit

    while (isBefore(currentDate, endDate) && instanceCount < maxInstances) {
        let shouldCreateInstance = false;

        if (rule.frequency === 'weekly' && rule.daysOfWeek) {
            const dayOfWeek = getDay(currentDate);
            shouldCreateInstance = rule.daysOfWeek.includes(dayOfWeek);
        } else if (rule.frequency === 'monthly') {
            const dayOfMonth = getDate(currentDate);
            const templateDayOfMonth = getDate(startDate);
            shouldCreateInstance = dayOfMonth === templateDayOfMonth;
        }

        if (shouldCreateInstance) {
            // Create instance with same time as template
            const instanceStart = new Date(currentDate);
            instanceStart.setHours(taskStart.getHours());
            instanceStart.setMinutes(taskStart.getMinutes());
            instanceStart.setSeconds(0);

            const instanceEnd = new Date(instanceStart.getTime() + duration);

            const instance: Task = {
                ...templateTask,
                id: `${templateTask.id}-${instanceStart.toISOString()}`,
                startTime: instanceStart.toISOString(),
                endTime: instanceEnd.toISOString(),
                completed: false,
                metadata: {
                    ...templateTask.metadata,
                    recurringTemplateId: templateTask.id,
                    instanceDate: instanceStart.toISOString(),
                },
            };

            instances.push(instance);
            instanceCount++;
        }

        // Move to next day
        currentDate = addDays(currentDate, 1);
    }

    return instances;
}

/**
 * Check if a date matches the recurrence pattern
 */
export function dateMatchesRecurrence(date: Date, task: Task): boolean {
    if (!task.recurrenceRule || !task.isRecurring) {
        return true; // Non-recurring tasks always match
    }

    const rule = task.recurrenceRule;

    if (rule.frequency === 'weekly' && rule.daysOfWeek) {
        const dayOfWeek = getDay(date);
        return rule.daysOfWeek.includes(dayOfWeek);
    } else if (rule.frequency === 'monthly') {
        const dayOfMonth = getDate(date);
        const templateDayOfMonth = getDate(new Date(task.startTime));
        return dayOfMonth === templateDayOfMonth;
    }

    return false;
}

/**
 * Filter out recurring instances and return only template tasks
 */
export function getTemplateTasks(tasks: Task[]): Task[] {
    return tasks.filter(task => !task.metadata?.recurringTemplateId);
}

/**
 * Filter tasks to exclude recurring templates that don't match today
 */
export function getVisibleTasks(tasks: Task[]): Task[] {
    const today = new Date();
    return tasks.filter(task => {
        // If it's a recurring template (not an instance), only show if today matches the pattern
        if (task.isRecurring && task.recurrenceRule && !task.metadata?.recurringTemplateId) {
            return dateMatchesRecurrence(today, task);
        }
        return true; // Show all other tasks
    });
}

/**
 * Get all instances for a recurring template
 */
export function getInstancesForTemplate(tasks: Task[], templateId: string): Task[] {
    return tasks.filter(task => task.metadata?.recurringTemplateId === templateId);
}

/**
 * Update all instances of a recurring task when template is edited
 */
export function updateRecurringInstances(
    templateTask: Task,
    existingTasks: Task[]
): Task[] {
    // Remove old instances
    const nonInstances = existingTasks.filter(
        task => task.metadata?.recurringTemplateId !== templateTask.id
    );

    // Generate new instances
    const newInstances = generateRecurringInstances(templateTask);

    return [...nonInstances, ...newInstances];
}
