import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

interface IconPickerProps {
    selectedIcon: string;
    onIconSelect: (icon: string) => void;
}

const SPACE_ICONS = [
    '💼', '🏠', '📚', '🎯', '💪', '🎨', '🎮', '✈️',
    '🏃', '🍕', '💻', '📱', '🎵', '📷', '🎬', '🏀',
    '⚽', '🎸', '📖', '✍️', '🔬', '🧪', '🎓', '💡',
    '🚀', '🌟', '⭐', '🔥', '💰', '💎', '🎁', '🏆',
];

export default function IconPicker({ selectedIcon, onIconSelect }: IconPickerProps) {
    const { colors } = useTheme();

    const styles = React.useMemo(() => StyleSheet.create({
        container: {
            marginBottom: SPACING.lg,
        },
        label: {
            fontSize: FONT_SIZES.sm,
            fontWeight: FONT_WEIGHTS.semibold,
            color: colors.text.primary,
            marginBottom: SPACING.sm,
        },
        scrollView: {
            maxHeight: 150,
        },
        grid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: SPACING.sm,
        },
        iconItem: {
            width: 48,
            height: 48,
            borderRadius: BORDER_RADIUS.md,
            backgroundColor: colors.background.secondary,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: 'transparent',
        },
        iconItemSelected: {
            borderColor: colors.primary,
            backgroundColor: colors.primary + '20',
        },
        iconText: {
            fontSize: 24,
        },
    }), [colors]);

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Icon</Text>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.grid}>
                    {SPACE_ICONS.map((icon) => (
                        <TouchableOpacity
                            key={icon}
                            style={[
                                styles.iconItem,
                                selectedIcon === icon && styles.iconItemSelected,
                            ]}
                            onPress={() => onIconSelect(icon)}
                        >
                            <Text style={styles.iconText}>{icon}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
