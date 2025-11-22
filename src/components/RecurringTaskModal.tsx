import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { RecurrenceRule } from '../types';

interface RecurringTaskModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (rule: RecurrenceRule | undefined) => void;
    currentRule?: RecurrenceRule;
}

export default function RecurringTaskModal({
    visible,
    onClose,
    onSave,
    currentRule,
}: RecurringTaskModalProps) {
    const { colors } = useTheme();
    const [isRecurring, setIsRecurring] = useState(!!currentRule);
    const [frequency, setFrequency] = useState<'weekly' | 'monthly'>(
        currentRule?.frequency === 'weekly' || currentRule?.frequency === 'monthly'
            ? currentRule.frequency
            : 'weekly'
    );
    const [selectedDays, setSelectedDays] = useState<number[]>(currentRule?.daysOfWeek || []);
    const [selectedMonthDay, setSelectedMonthDay] = useState(1);

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const toggleDay = (day: number) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day));
        } else {
            setSelectedDays([...selectedDays, day].sort());
        }
    };

    const handleSave = () => {
        if (!isRecurring) {
            onSave(undefined);
        } else {
            const rule: RecurrenceRule = {
                frequency,
                interval: 1,
                ...(frequency === 'weekly' && { daysOfWeek: selectedDays }),
            };
            onSave(rule);
        }
        onClose();
    };

    const styles = StyleSheet.create({
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalContent: {
            backgroundColor: colors.background.primary,
            borderRadius: BORDER_RADIUS.xl,
            padding: SPACING.lg,
            width: '85%',
            maxHeight: '80%',
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: SPACING.lg,
        },
        title: {
            fontSize: FONT_SIZES.xl,
            fontWeight: FONT_WEIGHTS.bold,
            color: colors.text.primary,
        },
        section: {
            marginBottom: SPACING.lg,
        },
        label: {
            fontSize: FONT_SIZES.md,
            fontWeight: FONT_WEIGHTS.semibold,
            color: colors.text.primary,
            marginBottom: SPACING.sm,
        },
        toggleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: SPACING.md,
        },
        typeButtons: {
            flexDirection: 'row',
            gap: SPACING.sm,
        },
        typeButton: {
            flex: 1,
            paddingVertical: SPACING.md,
            paddingHorizontal: SPACING.lg,
            borderRadius: BORDER_RADIUS.md,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.background.secondary,
            alignItems: 'center',
        },
        typeButtonActive: {
            backgroundColor: colors.primary + '15',
            borderColor: colors.primary,
        },
        typeButtonText: {
            fontSize: FONT_SIZES.md,
            color: colors.text.secondary,
        },
        typeButtonTextActive: {
            color: colors.primary,
            fontWeight: FONT_WEIGHTS.bold,
        },
        daysGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: SPACING.sm,
        },
        dayChip: {
            width: 45,
            height: 45,
            borderRadius: BORDER_RADIUS.full,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.background.secondary,
            alignItems: 'center',
            justifyContent: 'center',
        },
        dayChipSelected: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        dayChipText: {
            fontSize: FONT_SIZES.sm,
            color: colors.text.secondary,
            fontWeight: FONT_WEIGHTS.medium,
        },
        dayChipTextSelected: {
            color: '#FFFFFF',
            fontWeight: FONT_WEIGHTS.bold,
        },
        monthDayGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: SPACING.xs,
        },
        monthDayChip: {
            width: 38,
            height: 38,
            borderRadius: BORDER_RADIUS.md,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.background.secondary,
            alignItems: 'center',
            justifyContent: 'center',
        },
        monthDayChipSelected: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        monthDayChipText: {
            fontSize: FONT_SIZES.sm,
            color: colors.text.secondary,
        },
        monthDayChipTextSelected: {
            color: '#FFFFFF',
            fontWeight: FONT_WEIGHTS.bold,
        },
        buttonRow: {
            flexDirection: 'row',
            gap: SPACING.sm,
            marginTop: SPACING.md,
        },
        button: {
            flex: 1,
            paddingVertical: SPACING.md,
            borderRadius: BORDER_RADIUS.md,
            alignItems: 'center',
        },
        saveButton: {
            backgroundColor: colors.primary,
        },
        cancelButton: {
            backgroundColor: colors.background.secondary,
            borderWidth: 1,
            borderColor: colors.border,
        },
        buttonText: {
            fontSize: FONT_SIZES.md,
            fontWeight: FONT_WEIGHTS.semibold,
            color: '#FFFFFF',
        },
        cancelButtonText: {
            color: colors.text.primary,
        },
    });

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Recurring Task</Text>
                        <TouchableOpacity onPress={onClose}>
                            <MaterialIcons name="close" size={24} color={colors.text.secondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Recurring Toggle */}
                        <View style={styles.toggleRow}>
                            <Text style={styles.label}>Make this task recurring</Text>
                            <TouchableOpacity onPress={() => setIsRecurring(!isRecurring)}>
                                <MaterialIcons
                                    name={isRecurring ? "toggle-on" : "toggle-off"}
                                    size={36}
                                    color={isRecurring ? colors.primary : colors.text.tertiary}
                                />
                            </TouchableOpacity>
                        </View>

                        {isRecurring && (
                            <>
                                {/* Frequency Type */}
                                <View style={styles.section}>
                                    <Text style={styles.label}>Repeat</Text>
                                    <View style={styles.typeButtons}>
                                        <TouchableOpacity
                                            style={[
                                                styles.typeButton,
                                                frequency === 'weekly' && styles.typeButtonActive
                                            ]}
                                            onPress={() => setFrequency('weekly')}
                                        >
                                            <Text style={[
                                                styles.typeButtonText,
                                                frequency === 'weekly' && styles.typeButtonTextActive
                                            ]}>
                                                Weekly
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[
                                                styles.typeButton,
                                                frequency === 'monthly' && styles.typeButtonActive
                                            ]}
                                            onPress={() => setFrequency('monthly')}
                                        >
                                            <Text style={[
                                                styles.typeButtonText,
                                                frequency === 'monthly' && styles.typeButtonTextActive
                                            ]}>
                                                Monthly
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Weekly Days Selection */}
                                {frequency === 'weekly' && (
                                    <View style={styles.section}>
                                        <Text style={styles.label}>On these days</Text>
                                        <View style={styles.daysGrid}>
                                            {dayNames.map((day, index) => (
                                                <TouchableOpacity
                                                    key={index}
                                                    style={[
                                                        styles.dayChip,
                                                        selectedDays.includes(index) && styles.dayChipSelected
                                                    ]}
                                                    onPress={() => toggleDay(index)}
                                                >
                                                    <Text style={[
                                                        styles.dayChipText,
                                                        selectedDays.includes(index) && styles.dayChipTextSelected
                                                    ]}>
                                                        {day}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                )}

                                {/* Monthly Day Selection */}
                                {frequency === 'monthly' && (
                                    <View style={styles.section}>
                                        <Text style={styles.label}>On day of month</Text>
                                        <ScrollView style={{ maxHeight: 250 }}>
                                            <View style={styles.monthDayGrid}>
                                                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                                    <TouchableOpacity
                                                        key={day}
                                                        style={[
                                                            styles.monthDayChip,
                                                            selectedMonthDay === day && styles.monthDayChipSelected
                                                        ]}
                                                        onPress={() => setSelectedMonthDay(day)}
                                                    >
                                                        <Text style={[
                                                            styles.monthDayChipText,
                                                            selectedMonthDay === day && styles.monthDayChipTextSelected
                                                        ]}>
                                                            {day}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </ScrollView>
                                    </View>
                                )}
                            </>
                        )}
                    </ScrollView>

                    {/* Action Buttons */}
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onClose}
                        >
                            <Text style={[styles.buttonText, styles.cancelButtonText]}>
                                Cancel
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.saveButton]}
                            onPress={handleSave}
                        >
                            <Text style={styles.buttonText}>
                                Save
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}
