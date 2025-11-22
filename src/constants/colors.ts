// Color palette inspired by the reference images
// Using clean, solid colors without gradients

export const COLORS = {
    // Primary colors
    primary: '#6366F1', // Indigo
    secondary: '#8B5CF6', // Purple
    accent: '#EC4899', // Pink

    // Task Space colors
    taskSpace: {
        office: '#2563EB', // Blue
        personal: '#EF4444', // Red
        learning: '#F59E0B', // Amber
        fitness: '#10B981', // Green
        creative: '#8B5CF6', // Purple
        social: '#EC4899', // Pink
    },

    // Background colors
    background: {
        primary: '#FFFFFF',
        secondary: '#F9FAFB',
        dark: '#1F2937',
        darkSecondary: '#111827',
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

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const BORDER_RADIUS = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
};

export const FONT_SIZES = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    xxxl: 40,
};

export const FONT_WEIGHTS = {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
};
