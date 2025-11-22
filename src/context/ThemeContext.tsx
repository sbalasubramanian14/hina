import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
    theme: Theme;
    isDark: boolean;
    setTheme: (theme: Theme) => void;
    colors: typeof lightColors;
}

const lightColors = {
    // Primary colors
    primary: '#6366F1',
    secondary: '#8B5CF6',
    accent: '#EC4899',

    // Task Space colors
    taskSpace: {
        office: '#2563EB',
        personal: '#EF4444',
        learning: '#F59E0B',
        fitness: '#10B981',
        creative: '#8B5CF6',
        social: '#EC4899',
    },

    // Background colors
    background: {
        primary: '#FFFFFF',
        secondary: '#F9FAFB',
        tertiary: '#F3F4F6',
    },

    // Text colors
    text: {
        primary: '#111827',
        secondary: '#6B7280',
        tertiary: '#9CA3AF',
        inverse: '#FFFFFF',
    },

    // UI Element colors
    border: '#E5E7EB',
    card: '#FFFFFF',
    shadow: 'rgba(0, 0, 0, 0.1)',

    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.5)',
};

const darkColors = {
    // Primary colors
    primary: '#818CF8',
    secondary: '#A78BFA',
    accent: '#F472B6',

    // Task Space colors
    taskSpace: {
        office: '#3B82F6',
        personal: '#F87171',
        learning: '#FBBF24',
        fitness: '#34D399',
        creative: '#A78BFA',
        social: '#F472B6',
    },

    // Background colors
    background: {
        primary: '#111827',
        secondary: '#1F2937',
        tertiary: '#374151',
    },

    // Text colors
    text: {
        primary: '#F9FAFB',
        secondary: '#D1D5DB',
        tertiary: '#9CA3AF',
        inverse: '#111827',
    },

    // UI Element colors
    border: '#374151',
    card: '#1F2937',
    shadow: 'rgba(0, 0, 0, 0.3)',

    // Status colors
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.7)',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const systemTheme = useColorScheme();
    const [theme, setThemeState] = useState<Theme>('auto');

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const saved = await AsyncStorage.getItem('@theme');
            if (saved) {
                setThemeState(saved as Theme);
            }
        } catch (error) {
            console.error('Error loading theme:', error);
        }
    };

    const setTheme = async (newTheme: Theme) => {
        try {
            await AsyncStorage.setItem('@theme', newTheme);
            setThemeState(newTheme);
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    const isDark = theme === 'auto'
        ? systemTheme === 'dark'
        : theme === 'dark';

    const colors = isDark ? darkColors : lightColors;

    return (
        <ThemeContext.Provider value={{ theme, isDark, setTheme, colors }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

// Export color constants for backward compatibility
export const COLORS = lightColors;
export const DARK_COLORS = darkColors;
