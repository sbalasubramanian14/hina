import { Task, AIContextData } from '../../types';

export interface AIProvider {
    generateSuggestion(context: AIContextData, promptType: string): Promise<string>;
    estimateTokens(text: string): number;
}

export interface AIRequest {
    context: AIContextData;
    promptType: 'task_start' | 'proactive' | 'free_time' | 'weekend' | 'fun_fact';
    maxTokens?: number;
}

export interface AIResponse {
    suggestion: string;
    tokensUsed?: number;
    cached?: boolean;
}

// Compact task representation for minimal tokens
export interface CompactTask {
    t: string; // title
    s: string; // start time (HH:MM)
    e: string; // end time (HH:MM)
    sp: string; // task space
}

// Convert full task to compact format
export const compactTask = (task: Task): CompactTask => {
    const start = new Date(task.startTime);
    const end = new Date(task.endTime);

    return {
        t: task.title,
        s: `${start.getHours()}:${start.getMinutes().toString().padStart(2, '0')}`,
        e: `${end.getHours()}:${end.getMinutes().toString().padStart(2, '0')}`,
        sp: task.taskSpaceId,
    };
};

// Token counting utility (rough estimate)
export const estimateTokens = (text: string): number => {
    // Rough estimate: ~4 characters per token
    return Math.ceil(text.length / 4);
};
