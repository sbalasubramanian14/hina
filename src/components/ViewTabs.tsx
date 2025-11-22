import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

export type ViewMode = 'day' | 'week' | 'month';

interface ViewTabsProps {
    selectedView: ViewMode;
    onViewChange: (view: ViewMode) => void;
}

export default function ViewTabs({ selectedView, onViewChange }: ViewTabsProps) {
    const { colors } = useTheme();

    const tabs: { key: ViewMode; label: string }[] = [
        { key: 'day', label: 'Day' },
        { key: 'month', label: 'Month' },
    ];

    const styles = React.useMemo(() => StyleSheet.create({
        container: {
            flexDirection: 'row',
            backgroundColor: colors.background.secondary,
            borderRadius: BORDER_RADIUS.lg,
            padding: SPACING.xs,
            marginHorizontal: SPACING.lg,
            marginBottom: SPACING.md,
        },
        tab: {
            flex: 1,
            paddingVertical: SPACING.sm,
            paddingHorizontal: SPACING.md,
            borderRadius: BORDER_RADIUS.md,
            alignItems: 'center',
        },
        tabActive: {
            backgroundColor: colors.primary,
        },
        tabInactive: {
            backgroundColor: 'transparent',
        },
        tabText: {
            fontSize: FONT_SIZES.sm,
            fontWeight: FONT_WEIGHTS.semibold,
        },
        tabTextActive: {
            color: colors.text.inverse,
        },
        tabTextInactive: {
            color: colors.text.secondary,
        },
    }), [colors]);

    return (
        <View style={styles.container}>
            {tabs.map((tab) => {
                const isActive = selectedView === tab.key;
                return (
                    <TouchableOpacity
                        key={tab.key}
                        style={[
                            styles.tab,
                            isActive ? styles.tabActive : styles.tabInactive,
                        ]}
                        onPress={() => onViewChange(tab.key)}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                isActive ? styles.tabTextActive : styles.tabTextInactive,
                            ]}
                        >
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}
