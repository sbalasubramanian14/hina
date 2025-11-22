import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

interface ColorPickerProps {
    selectedColor: string;
    onColorSelect: (color: string) => void;
}

const SPACE_COLORS = [
    { name: 'Blue', value: '#2563EB' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Green', value: '#10B981' },
    { name: 'Yellow', value: '#F59E0B' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Teal', value: '#14B8A6' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Cyan', value: '#06B6D4' },
];

export default function ColorPicker({ selectedColor, onColorSelect }: ColorPickerProps) {
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
        grid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: SPACING.sm,
        },
        colorItem: {
            width: 48,
            height: 48,
            borderRadius: 24,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 3,
            borderColor: 'transparent',
        },
        colorItemSelected: {
            borderColor: colors.text.primary,
            borderWidth: 3,
        },
        colorCircle: {
            width: 40,
            height: 40,
            borderRadius: 20,
        },
    }), [colors]);

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Color</Text>
            <View style={styles.grid}>
                {SPACE_COLORS.map((color) => (
                    <TouchableOpacity
                        key={color.value}
                        style={[
                            styles.colorItem,
                            selectedColor === color.value && styles.colorItemSelected,
                        ]}
                        onPress={() => onColorSelect(color.value)}
                    >
                        <View style={[styles.colorCircle, { backgroundColor: color.value }]} />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}
