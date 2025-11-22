import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { format } from 'date-fns';

interface DateNavigationProps {
    date: Date;
    onPrevious: () => void;
    onNext: () => void;
    onToday: () => void;
}

export default function DateNavigation({ date, onPrevious, onNext, onToday }: DateNavigationProps) {
    const { colors } = useTheme();
    const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

    const styles = React.useMemo(() => StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: SPACING.lg,
            paddingVertical: SPACING.md,
        },
        dateDisplay: {
            flex: 1,
            alignItems: 'center',
        },
        dateText: {
            fontSize: FONT_SIZES.lg,
            fontWeight: FONT_WEIGHTS.bold,
            color: colors.text.primary,
        },
        navButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.background.secondary,
            justifyContent: 'center',
            alignItems: 'center',
        },
        todayButton: {
            paddingHorizontal: SPACING.md,
            paddingVertical: SPACING.sm,
            borderRadius: BORDER_RADIUS.md,
            backgroundColor: isToday ? colors.primary : colors.background.secondary,
        },
        todayText: {
            fontSize: FONT_SIZES.sm,
            fontWeight: FONT_WEIGHTS.semibold,
            color: isToday ? colors.text.inverse : colors.text.primary,
        },
    }), [colors, isToday]);

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.navButton} onPress={onPrevious}>
                <MaterialIcons name="chevron-left" size={24} color={colors.text.primary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.dateDisplay} onPress={onToday}>
                <Text style={styles.dateText}>{format(date, 'MMMM d, yyyy')}</Text>
                {!isToday && (
                    <Text style={{ color: colors.primary, fontSize: FONT_SIZES.xs, marginTop: 2 }}>
                        Tap to go to Today
                    </Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.navButton} onPress={onNext}>
                <MaterialIcons name="chevron-right" size={24} color={colors.text.primary} />
            </TouchableOpacity>
        </View>
    );
}
