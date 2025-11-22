import { getGeminiSuggestion } from './gemini';
import { Task, TaskSpace } from '../../types';
import { format } from 'date-fns';

export interface TaskSuggestionRequest {
    taskTitle: string;
    taskDescription?: string;
    startTime: Date;
    taskSpace: string;
    userInterests?: string[];
}

interface SuggestionCache {
    [key: string]: {
        suggestion: string;
        timestamp: number;
    };
}

// Cache suggestions for 1 hour
const CACHE_DURATION = 60 * 60 * 1000;
const suggestionCache: SuggestionCache = {};

/**
 * Generate a cache key for a task suggestion
 */
function getCacheKey(request: TaskSuggestionRequest): string {
    const taskType = request.taskTitle.toLowerCase().split(' ')[0];
    const hour = request.startTime.getHours();
    return `${taskType}-${request.taskSpace}-${hour}`;
}

/**
 * Get cached suggestion if available and not expired
 */
function getCachedSuggestion(key: string): string | null {
    const cached = suggestionCache[key];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.suggestion;
    }
    return null;
}

/**
 * Cache a suggestion
 */
function cacheSuggestion(key: string, suggestion: string): void {
    suggestionCache[key] = {
        suggestion,
        timestamp: Date.now(),
    };
}

/**
 * Generate context-aware task suggestion using Gemini AI
 */
export async function getTaskSuggestion(
    request: TaskSuggestionRequest
): Promise<string> {
    console.log('🎯 Getting task suggestion for:', request.taskTitle);

    try {
        // Check cache first
        const cacheKey = getCacheKey(request);
        const cached = getCachedSuggestion(cacheKey);
        if (cached) {
            console.log('✅ Using cached suggestion for:', cacheKey);
            return cached;
        }

        // Build compact prompt for token optimization
        const timeOfDay = request.startTime.getHours();
        const dayOfWeek = format(request.startTime, 'EEEE');
        const timeContext = timeOfDay < 12 ? 'morning' : timeOfDay < 17 ? 'afternoon' : 'evening';

        const prompt = {
            task: request.taskTitle,
            desc: request.taskDescription || '',
            time: format(request.startTime, 'HH:mm'),
            day: dayOfWeek,
            period: timeContext,
            space: request.taskSpace,
            interests: request.userInterests?.slice(0, 3) || [],
        };

        console.log('📤 Request payload:', JSON.stringify(prompt, null, 2));

        const systemPrompt = 'You are a helpful task assistant. Provide brief, actionable suggestions (max 40 words). Be context-aware and encouraging.';
        const userPrompt = `${JSON.stringify(prompt)}\n\nProvide a helpful suggestion or tip:`;

        console.log('📝 System prompt:', systemPrompt);
        console.log('📝 User prompt:', userPrompt);

        const suggestion = await getGeminiSuggestion(systemPrompt, userPrompt);

        console.log('✅ AI suggestion received:', suggestion);

        // Cache the suggestion
        cacheSuggestion(cacheKey, suggestion);

        return suggestion;
    } catch (error) {
        console.error('❌ Error getting task suggestion:', error);
        console.log('🔄 Using fallback suggestion for:', request.taskTitle);
        // Fallback to simple reminder
        return getFallbackSuggestion(request);
    }
}

/**
 * Fallback suggestion when AI fails
 */
function getFallbackSuggestion(request: TaskSuggestionRequest): string {
    const timeOfDay = request.startTime.getHours();

    // Simple context-aware fallbacks
    if (request.taskTitle.toLowerCase().includes('gym') || request.taskTitle.toLowerCase().includes('workout')) {
        return timeOfDay < 12 ? '💪 Great way to start your day!' : '💪 Time to energize!';
    }

    if (request.taskTitle.toLowerCase().includes('meeting')) {
        return '📝 Review your notes and be prepared!';
    }

    if (request.taskTitle.toLowerCase().includes('book')) {
        return '🎫 Book early for best options!';
    }

    if (request.taskSpace.toLowerCase().includes('work') || request.taskSpace.toLowerCase().includes('office')) {
        return '💼 Stay focused and productive!';
    }

    if (request.taskSpace.toLowerCase().includes('personal')) {
        return '✨ Take your time and enjoy!';
    }

    return '⏰ Time to get started!';
}

/**
 * Generate proactive suggestion for early opportunity detection
 * (Future enhancement - not implemented yet)
 */
export async function generateProactiveSuggestion(
    task: Task,
    taskSpaces: TaskSpace[]
): Promise<{ shouldNotify: boolean; suggestion: string }> {
    // This is a placeholder for future implementation
    // Will analyze task timing and suggest early action when beneficial

    const shouldNotifyEarly = false; // Future: Implement logic to detect early opportunities

    return {
        shouldNotify: shouldNotifyEarly,
        suggestion: '',
    };
}

/**
 * Clear suggestion cache
 */
export function clearSuggestionCache(): void {
    Object.keys(suggestionCache).forEach(key => delete suggestionCache[key]);
}
