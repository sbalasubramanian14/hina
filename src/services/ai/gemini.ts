import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider, AIContextData, compactTask, estimateTokens } from './types';
import { getUserProfile } from '../storage';

class GeminiProvider implements AIProvider {
    private genAI: GoogleGenerativeAI | null = null;
    private model: any = null;
    private cache: Map<string, { response: string; timestamp: number }> = new Map();
    private CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

    async initialize(): Promise<void> {
        const profile = await getUserProfile();
        if (!profile?.geminiApiKey) {
            throw new Error('Gemini API key not found');
        }

        this.genAI = new GoogleGenerativeAI(profile.geminiApiKey);
        // Using Gemini 2.0 Flash (stable) for better quota limits
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    }

    private buildCompactContext(context: AIContextData): string {
        // Build ultra-compact JSON context
        const compactTasks = context.todayTasks.map(compactTask);

        return JSON.stringify({
            t: context.currentTime.split('T')[1].slice(0, 5), // Time HH:MM
            d: context.dayOfWeek.slice(0, 3), // Mon, Tue, etc.
            ts: compactTasks,
            i: context.userInterests.join(','),
            sp: context.activeTaskSpaces.join(','),
        });
    }

    async generateSuggestion(context: AIContextData, promptType: string): Promise<string> {
        if (!this.model) {
            await this.initialize();
        }

        // Check cache
        const cacheKey = `${promptType}_${context.currentDate}_${context.currentTime.slice(11, 16)}`;
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
            return cached.response;
        }

        const compactContext = this.buildCompactContext(context);
        const prompt = this.buildPrompt(promptType, compactContext, context);

        try {
            const result = await this.model.generateContent(prompt);
            const response = result.response.text();

            // Cache the response
            this.cache.set(cacheKey, { response, timestamp: Date.now() });

            // Clean old cache entries
            this.cleanCache();

            return response;
        } catch (error) {
            console.error('Gemini API error:', error);
            throw error;
        }
    }

    private buildPrompt(promptType: string, compactContext: string, context: AIContextData): string {
        // Ultra-concise prompts to minimize tokens
        const basePrompt = `Context (JSON): ${compactContext}\n\n`;

        switch (promptType) {
            case 'task_start':
                return `${basePrompt}Task starting now. Give 1 motivational tip (20 words max).`;

            case 'proactive':
                return `${basePrompt}Check if any task needs early action (tickets, bookings). Reply "none" or suggestion (30 words max).`;

            case 'free_time':
                const currentTask = context.todayTasks.find(t => {
                    const now = new Date();
                    return new Date(t.startTime) <= now && new Date(t.endTime) >= now;
                });
                const freeMinutes = currentTask ? Math.floor(
                    (new Date(currentTask.endTime).getTime() - Date.now()) / 60000
                ) : 0;
                return `${basePrompt}${freeMinutes}min break. Suggest learning content from interests (25 words max, include link if possible).`;

            case 'weekend':
                return `${basePrompt}It's weekend. Suggest 1 activity based on interests (30 words max).`;

            case 'fun_fact':
                return `${basePrompt}Share 1 interesting fact related to user interests (25 words max).`;

            default:
                return `${basePrompt}Provide helpful suggestion.`;
        }
    }

    estimateTokens(text: string): number {
        return estimateTokens(text);
    }

    private cleanCache(): void {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > this.CACHE_DURATION) {
                this.cache.delete(key);
            }
        }
    }

    clearCache(): void {
        this.cache.clear();
    }
}

/**
 * Helper function to get a simple suggestion from Gemini
 */
export async function getGeminiSuggestion(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
        const profile = await getUserProfile();
        if (!profile?.geminiApiKey) {
            throw new Error('Gemini API key not found');
        }

        const apiKey = profile.geminiApiKey;
        const maskedKey = `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`;
        console.log('🔑 Using API key:', maskedKey);
        console.log('📡 Gemini API model: gemini-2.0-flash');

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
        console.log('📨 Sending request to Gemini API...');
        console.log('📏 Prompt length:', fullPrompt.length, 'characters');

        const result = await model.generateContent(fullPrompt);
        const response = result.response.text().trim();

        console.log('📥 Gemini API response received');
        console.log('📊 Response length:', response.length, 'characters');
        console.log('💬 Response text:', response);

        return response;
    } catch (error: any) {
        console.error('❌ Error getting Gemini suggestion:', error);
        console.error('📋 Error details:', {
            message: error.message,
            status: error.status,
            statusText: error.statusText,
        });
        throw error;
    }
}

export const geminiProvider = new GeminiProvider();
