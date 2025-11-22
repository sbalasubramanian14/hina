import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Platform,
    KeyboardAvoidingView,
} from 'react-native';
import { SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { Task, TaskSpace, RecurrenceRule } from '../types';
import { MaterialIcons } from '@expo/vector-icons';
import { format, addHours, isSameDay } from 'date-fns';
import RecurringTaskModal from './RecurringTaskModal';

interface AddTaskModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (task: Partial<Task>) => void;
    onDelete?: (taskId: string) => void;
    taskSpaces: TaskSpace[];
    initialDate?: Date;
    task?: Task | null;
}

export default function AddTaskModal({
    visible,
    onClose,
    onSave,
    onDelete,
    taskSpaces,
    initialDate = new Date(),
    task,
}: AddTaskModalProps) {
    const { colors } = useTheme();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedSpaceId, setSelectedSpaceId] = useState<string>('');
    const [startTime, setStartTime] = useState(initialDate);
    const [endTime, setEndTime] = useState(addHours(initialDate, 1));

    // Time picker state
    const [showTimePicker, setShowTimePicker] = useState<'start' | 'end' | null>(null);

    // Date picker state
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Checklist state
    const [checklist, setChecklist] = useState<{ id: string; text: string; completed: boolean }[]>([]);
    const [newChecklistItem, setNewChecklistItem] = useState('');

    // Multi-day state
    const [isMultiDay, setIsMultiDay] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    // Reminder state
    const [reminderMinutes, setReminderMinutes] = useState<number | null>(15); // Default 15 minutes
    const [showCustomReminderPicker, setShowCustomReminderPicker] = useState(false);
    const [customReminderHours, setCustomReminderHours] = useState(0);
    const [customReminderMinutes, setCustomReminderMinutes] = useState(15);

    // Recurring state
    const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule | undefined>(undefined);
    const [showRecurringModal, setShowRecurringModal] = useState(false);

    useEffect(() => {
        if (visible) {
            if (task) {
                // Edit mode
                setTitle(task.title);
                setDescription(task.description || '');
                setSelectedSpaceId(task.taskSpaceId);
                setStartTime(new Date(task.startTime));
                setEndTime(new Date(task.endTime));
                setChecklist(task.checklist || []);
                setReminderMinutes(task.reminderMinutesBefore ?? 15);
                setRecurrenceRule(task.recurrenceRule);

                const start = new Date(task.startTime);
                const end = new Date(task.endTime);
                setIsMultiDay(!isSameDay(start, end));
            } else {
                // Create mode
                setTitle('');
                setDescription('');
                setChecklist([]);
                setNewChecklistItem('');
                setIsMultiDay(false);
                setReminderMinutes(15);

                if (taskSpaces.length > 0) {
                    setSelectedSpaceId(taskSpaces[0].id);
                }

                // Default to next hour or initialDate
                const start = initialDate || new Date();
                setStartTime(start);
                setEndTime(addHours(start, 1));
            }
        }
    }, [visible, task, taskSpaces, initialDate]);

    const handleSave = () => {
        if (!title.trim()) return;

        onSave({
            ...task, // Keep existing fields if editing
            title: title.trim(),
            description: description.trim(),
            taskSpaceId: selectedSpaceId,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            checklist: checklist,
            reminderMinutesBefore: reminderMinutes,
            isRecurring: !!recurrenceRule,
            recurrenceRule: recurrenceRule,
        });
        onClose();
    };

    const handleDelete = () => {
        if (task && onDelete) {
            onDelete(task.id);
            onClose();
        }
    };

    const handleDateSelect = (date: Date, isEndDate: boolean = false) => {
        if (isEndDate) {
            const newEnd = new Date(endTime);
            newEnd.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
            setEndTime(newEnd);
            setShowEndDatePicker(false);
        } else {
            // Update start time
            const newStart = new Date(startTime);
            newStart.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
            setStartTime(newStart);

            // If not multi-day, update end date to match
            if (!isMultiDay) {
                const newEnd = new Date(endTime);
                newEnd.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                // Ensure end time is after start time
                if (newEnd < newStart) {
                    newEnd.setDate(newEnd.getDate() + 1);
                }
                setEndTime(newEnd);
            } else {
                // If multi-day, ensure end date is at least start date
                if (endTime < newStart) {
                    const newEnd = new Date(newStart);
                    newEnd.setHours(endTime.getHours(), endTime.getMinutes());
                    setEndTime(newEnd);
                }
            }
            setShowDatePicker(false);
        }
    };

    const handleQuickDuration = (minutes: number) => {
        const newEnd = new Date(startTime.getTime() + minutes * 60000);
        setEndTime(newEnd);
        // If duration pushes to next day, enable multi-day automatically?
        if (!isSameDay(startTime, newEnd)) {
            setIsMultiDay(true);
        }
    };

    const addChecklistItem = () => {
        if (!newChecklistItem.trim()) return;
        setChecklist([
            ...checklist,
            {
                id: Date.now().toString(),
                text: newChecklistItem.trim(),
                completed: false
            }
        ]);
        setNewChecklistItem('');
    };

    const removeChecklistItem = (id: string) => {
        setChecklist(checklist.filter(item => item.id !== id));
    };

    const DatePickerModal = ({ isEndDate = false }: { isEndDate?: boolean }) => {
        const visible = isEndDate ? showEndDatePicker : showDatePicker;
        const onClose = () => isEndDate ? setShowEndDatePicker(false) : setShowDatePicker(false);
        const targetDate = isEndDate ? endTime : startTime;

        if (!visible) return null;

        const today = new Date();
        const dates = Array.from({ length: 30 }, (_, i) => {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            return d;
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
                    <View style={styles.timePickerContainer}>
                        <Text style={styles.timePickerTitle}>
                            Select {isEndDate ? 'End' : 'Start'} Date
                        </Text>
                        <ScrollView style={{ maxHeight: 300, width: '100%' }}>
                            {dates.map(date => (
                                <TouchableOpacity
                                    key={date.toISOString()}
                                    style={[
                                        styles.dateOption,
                                        isSameDay(date, targetDate) && styles.selectedDateOption
                                    ]}
                                    onPress={() => handleDateSelect(date, isEndDate)}
                                >
                                    <Text style={[
                                        styles.dateOptionText,
                                        isSameDay(date, targetDate) && styles.selectedDateOptionText
                                    ]}>
                                        {format(date, 'EEEE, MMMM d')}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.doneButton}
                            onPress={onClose}
                        >
                            <Text style={styles.doneButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        );
    };

    const TimePickerModal = () => {
        if (!showTimePicker) return null;

        const targetDate = showTimePicker === 'start' ? startTime : endTime;
        const hours = Array.from({ length: 24 }, (_, i) => i);
        const minutes = [0, 15, 30, 45];
        const ITEM_HEIGHT = 45; // Fixed height for calculation

        const hourScrollRef = React.useRef<ScrollView>(null);
        const minuteScrollRef = React.useRef<ScrollView>(null);

        useEffect(() => {
            if (showTimePicker) {
                // Scroll to current selection after a short delay to allow rendering
                setTimeout(() => {
                    const hourIndex = targetDate.getHours();
                    const minuteIndex = minutes.indexOf(targetDate.getMinutes());

                    if (hourIndex !== -1 && hourScrollRef.current) {
                        hourScrollRef.current.scrollTo({ y: hourIndex * ITEM_HEIGHT, animated: true });
                    }
                    if (minuteIndex !== -1 && minuteScrollRef.current) {
                        minuteScrollRef.current.scrollTo({ y: minuteIndex * ITEM_HEIGHT, animated: true });
                    }
                }, 100);
            }
        }, [showTimePicker]);

        const setTime = (h: number, m: number) => {
            const newDate = new Date(targetDate);
            newDate.setHours(h);
            newDate.setMinutes(m);
            newDate.setSeconds(0); // Zero out seconds
            newDate.setMilliseconds(0); // Zero out milliseconds

            if (showTimePicker === 'start') {
                setStartTime(newDate);
                // Auto-adjust end time if it becomes before start time
                if (newDate >= endTime) {
                    const newEnd = addHours(newDate, 1);
                    newEnd.setSeconds(0);
                    newEnd.setMilliseconds(0);
                    setEndTime(newEnd);
                }
            } else {
                setEndTime(newDate);
            }
        };

        return (
            <Modal
                transparent
                visible={!!showTimePicker}
                animationType="fade"
                onRequestClose={() => setShowTimePicker(null)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowTimePicker(null)}
                >
                    <View style={styles.timePickerContainer}>
                        <Text style={styles.timePickerTitle}>
                            Select {showTimePicker === 'start' ? 'Start' : 'End'} Time
                        </Text>
                        <View style={styles.timeColumns}>
                            <ScrollView
                                ref={hourScrollRef}
                                style={styles.column}
                                showsVerticalScrollIndicator={false}
                            >
                                {hours.map(h => (
                                    <TouchableOpacity
                                        key={h}
                                        style={[
                                            styles.timeOption,
                                            { height: ITEM_HEIGHT, justifyContent: 'center' },
                                            targetDate.getHours() === h && styles.selectedTimeOption
                                        ]}
                                        onPress={() => setTime(h, targetDate.getMinutes())}
                                    >
                                        <Text style={[
                                            styles.timeText,
                                            targetDate.getHours() === h && styles.selectedTimeText
                                        ]}>
                                            {h.toString().padStart(2, '0')}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                            <View style={styles.separator}><Text style={{ fontSize: 24, color: colors.text.primary }}>:</Text></View>
                            <ScrollView
                                ref={minuteScrollRef}
                                style={styles.column}
                                showsVerticalScrollIndicator={false}
                            >
                                {minutes.map(m => (
                                    <TouchableOpacity
                                        key={m}
                                        style={[
                                            styles.timeOption,
                                            { height: ITEM_HEIGHT, justifyContent: 'center' },
                                            targetDate.getMinutes() === m && styles.selectedTimeOption
                                        ]}
                                        onPress={() => setTime(targetDate.getHours(), m)}
                                    >
                                        <Text style={[
                                            styles.timeText,
                                            targetDate.getMinutes() === m && styles.selectedTimeText
                                        ]}>
                                            {m.toString().padStart(2, '0')}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                        <TouchableOpacity
                            style={styles.doneButton}
                            onPress={() => setShowTimePicker(null)}
                        >
                            <Text style={styles.doneButtonText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        );
    };

    const styles = React.useMemo(() => StyleSheet.create({
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
        },
        pickerModalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalContent: {
            backgroundColor: colors.background.primary,
            borderTopLeftRadius: BORDER_RADIUS.xl,
            borderTopRightRadius: BORDER_RADIUS.xl,
            padding: SPACING.lg,
            maxHeight: '95%',
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
        inputGroup: {
            marginBottom: SPACING.lg,
        },
        label: {
            fontSize: FONT_SIZES.sm,
            color: colors.text.secondary,
            marginBottom: SPACING.xs,
            fontWeight: FONT_WEIGHTS.medium,
        },
        input: {
            backgroundColor: colors.background.secondary,
            borderRadius: BORDER_RADIUS.md,
            padding: SPACING.md,
            color: colors.text.primary,
            fontSize: FONT_SIZES.md,
        },
        textArea: {
            height: 80,
            textAlignVertical: 'top',
        },
        spacesContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: SPACING.sm,
        },
        spaceChip: {
            paddingHorizontal: SPACING.md,
            paddingVertical: SPACING.sm,
            borderRadius: BORDER_RADIUS.full,
            borderWidth: 1,
            borderColor: colors.border,
        },
        selectedSpaceChip: {
            borderColor: 'transparent',
        },
        spaceChipText: {
            fontSize: FONT_SIZES.sm,
            color: colors.text.secondary,
        },
        selectedSpaceChipText: {
            color: '#FFFFFF',
            fontWeight: FONT_WEIGHTS.bold,
        },
        timeRow: {
            flexDirection: 'row',
            gap: SPACING.md,
        },
        timeButton: {
            flex: 1,
            backgroundColor: colors.background.secondary,
            padding: SPACING.md,
            borderRadius: BORDER_RADIUS.md,
            alignItems: 'center',
        },
        timeButtonText: {
            fontSize: FONT_SIZES.md,
            color: colors.text.primary,
            fontWeight: FONT_WEIGHTS.bold,
        },
        saveButton: {
            backgroundColor: colors.primary,
            padding: SPACING.md,
            borderRadius: BORDER_RADIUS.lg,
            alignItems: 'center',
            marginTop: SPACING.md,
        },
        saveButtonText: {
            color: '#FFFFFF',
            fontSize: FONT_SIZES.md,
            fontWeight: FONT_WEIGHTS.bold,
        },
        disabledButton: {
            opacity: 0.5,
        },
        deleteButton: {
            padding: SPACING.md,
            borderRadius: BORDER_RADIUS.lg,
            alignItems: 'center',
            marginTop: SPACING.sm,
            backgroundColor: colors.background.secondary,
        },
        deleteButtonText: {
            color: colors.error,
            fontSize: FONT_SIZES.md,
            fontWeight: FONT_WEIGHTS.bold,
        },
        // Time Picker Styles
        timePickerContainer: {
            backgroundColor: colors.background.primary,
            margin: SPACING.xl,
            borderRadius: BORDER_RADIUS.lg,
            padding: SPACING.lg,
            alignItems: 'center',
        },
        timePickerTitle: {
            fontSize: FONT_SIZES.lg,
            fontWeight: FONT_WEIGHTS.bold,
            marginBottom: SPACING.md,
            color: colors.text.primary,
        },
        timeColumns: {
            flexDirection: 'row',
            height: 200,
            gap: SPACING.md,
        },
        column: {
            width: 60,
        },
        separator: {
            justifyContent: 'center',
        },
        timeOption: {
            paddingVertical: SPACING.sm,
            alignItems: 'center',
            borderRadius: BORDER_RADIUS.sm,
        },
        selectedTimeOption: {
            backgroundColor: colors.primary + '20',
        },
        timeText: {
            fontSize: FONT_SIZES.lg,
            color: colors.text.secondary,
        },
        selectedTimeText: {
            color: colors.primary,
            fontWeight: FONT_WEIGHTS.bold,
        },
        doneButton: {
            marginTop: SPACING.md,
            padding: SPACING.md,
            width: '100%',
            alignItems: 'center',
            backgroundColor: colors.background.secondary,
            borderRadius: BORDER_RADIUS.md,
        },
        doneButtonText: {
            color: colors.primary,
            fontWeight: FONT_WEIGHTS.bold,
        },
        // Date Picker Styles
        dateOption: {
            paddingVertical: SPACING.md,
            paddingHorizontal: SPACING.lg,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            width: '100%',
        },
        selectedDateOption: {
            backgroundColor: colors.primary + '10',
        },
        dateOptionText: {
            fontSize: FONT_SIZES.md,
            color: colors.text.primary,
        },
        selectedDateOptionText: {
            color: colors.primary,
            fontWeight: FONT_WEIGHTS.bold,
        },
        quickDurationContainer: {
            flexDirection: 'row',
            gap: SPACING.xs,
            marginTop: SPACING.sm,
        },
        durationChip: {
            paddingHorizontal: SPACING.sm,
            paddingVertical: SPACING.xs,
            borderRadius: BORDER_RADIUS.sm,
            backgroundColor: colors.background.secondary,
            borderWidth: 1,
            borderColor: colors.border,
        },
        durationChipText: {
            fontSize: FONT_SIZES.xs,
            color: colors.text.secondary,
        },
        // Checklist Styles
        checklistContainer: {
            gap: SPACING.sm,
        },
        checklistItem: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.background.secondary,
            padding: SPACING.sm,
            borderRadius: BORDER_RADIUS.md,
            gap: SPACING.sm,
        },
        checklistItemText: {
            flex: 1,
            fontSize: FONT_SIZES.md,
            color: colors.text.primary,
        },
        addChecklistContainer: {
            flexDirection: 'row',
            gap: SPACING.sm,
            marginTop: SPACING.sm,
        },
        addChecklistInput: {
            flex: 1,
            backgroundColor: colors.background.secondary,
            borderRadius: BORDER_RADIUS.md,
            padding: SPACING.sm,
            color: colors.text.primary,
        },
        addButton: {
            backgroundColor: colors.primary,
            padding: SPACING.sm,
            borderRadius: BORDER_RADIUS.md,
            justifyContent: 'center',
        },
        multiDayToggle: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: SPACING.xs,
        },
        toggleLabel: {
            fontSize: FONT_SIZES.sm,
            color: colors.text.secondary,
            fontWeight: FONT_WEIGHTS.medium,
        },
        toggleButton: {
            paddingHorizontal: SPACING.sm,
            paddingVertical: SPACING.xs,
            borderRadius: BORDER_RADIUS.sm,
            borderWidth: 1,
            borderColor: colors.border,
        },
        toggleButtonActive: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        toggleButtonText: {
            fontSize: FONT_SIZES.xs,
            color: colors.text.secondary,
        },
        toggleButtonTextActive: {
            color: '#FFFFFF',
        },
        // Reminder Styles
        reminderOptions: {
            flexDirection: 'column',
            gap: SPACING.sm,
        },
        reminderOption: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.background.secondary,
            padding: SPACING.md,
            borderRadius: BORDER_RADIUS.md,
            borderWidth: 1,
            borderColor: colors.border,
        },
        selectedReminderOption: {
            backgroundColor: colors.primary + '15',
            borderColor: colors.primary,
        },
        reminderOptionText: {
            fontSize: FONT_SIZES.md,
            color: colors.text.primary,
        },
        selectedReminderOptionText: {
            color: colors.primary,
            fontWeight: FONT_WEIGHTS.bold,
        },
        // Reminder Chip Styles
        reminderChip: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: SPACING.md,
            paddingVertical: SPACING.sm,
            backgroundColor: colors.background.secondary,
            borderRadius: BORDER_RADIUS.full,
            borderWidth: 1,
            borderColor: colors.border,
            gap: SPACING.xs,
        },
        reminderChipSelected: {
            backgroundColor: colors.primary + '15',
            borderColor: colors.primary,
        },
        reminderChipText: {
            fontSize: FONT_SIZES.sm,
            color: colors.text.secondary,
            fontWeight: FONT_WEIGHTS.medium,
        },
        reminderChipTextSelected: {
            color: colors.primary,
            fontWeight: FONT_WEIGHTS.bold,
        },
        // Recurring button styles
        recurringButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: SPACING.sm,
            padding: SPACING.md,
            backgroundColor: colors.background.secondary,
            borderRadius: BORDER_RADIUS.md,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: SPACING.md,
        },
        recurringButtonText: {
            fontSize: FONT_SIZES.md,
            color: colors.text.secondary,
        },
        recurringButtonTextActive: {
            color: colors.primary,
            fontWeight: FONT_WEIGHTS.semibold,
        },
    }), [colors]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalOverlay}
            >
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            {task ? 'Edit Task' : 'New Task'}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <MaterialIcons name="close" size={24} color={colors.text.secondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Title */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Title</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="What needs to be done?"
                                placeholderTextColor={colors.text.tertiary}
                                value={title}
                                onChangeText={setTitle}
                                autoFocus={!task} // Only autofocus on new tasks
                            />
                        </View>

                        {/* Task Space */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Space</Text>
                            <View style={styles.spacesContainer}>
                                {taskSpaces.map(space => (
                                    <TouchableOpacity
                                        key={space.id}
                                        style={[
                                            styles.spaceChip,
                                            selectedSpaceId === space.id && [
                                                styles.selectedSpaceChip,
                                                { backgroundColor: space.color }
                                            ]
                                        ]}
                                        onPress={() => setSelectedSpaceId(space.id)}
                                    >
                                        <Text style={[
                                            styles.spaceChipText,
                                            selectedSpaceId === space.id && styles.selectedSpaceChipText
                                        ]}>
                                            {space.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Date Selection */}
                        <View style={styles.inputGroup}>
                            <View style={styles.multiDayToggle}>
                                <Text style={styles.label}>Date</Text>
                                <TouchableOpacity
                                    style={[styles.toggleButton, isMultiDay && styles.toggleButtonActive]}
                                    onPress={() => setIsMultiDay(!isMultiDay)}
                                >
                                    <Text style={[styles.toggleButtonText, isMultiDay && styles.toggleButtonTextActive]}>
                                        Multi-day
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={styles.input}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Text style={{ color: colors.text.primary, fontSize: FONT_SIZES.md }}>
                                    {isMultiDay ? 'Starts: ' : ''}{format(startTime, 'EEEE, MMMM d, yyyy')}
                                </Text>
                            </TouchableOpacity>

                            {isMultiDay && (
                                <TouchableOpacity
                                    style={[styles.input, { marginTop: SPACING.sm }]}
                                    onPress={() => setShowEndDatePicker(true)}
                                >
                                    <Text style={{ color: colors.text.primary, fontSize: FONT_SIZES.md }}>
                                        Ends: {format(endTime, 'EEEE, MMMM d, yyyy')}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Time Selection */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Time</Text>
                            <View style={styles.timeRow}>
                                <TouchableOpacity
                                    style={styles.timeButton}
                                    onPress={() => setShowTimePicker('start')}
                                >
                                    <Text style={styles.label}>Start</Text>
                                    <Text style={styles.timeButtonText}>
                                        {format(startTime, 'HH:mm')}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.timeButton}
                                    onPress={() => setShowTimePicker('end')}
                                >
                                    <Text style={styles.label}>End</Text>
                                    <Text style={styles.timeButtonText}>
                                        {format(endTime, 'HH:mm')}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Quick Duration Chips */}
                            <View style={styles.quickDurationContainer}>
                                {[15, 30, 60, 120].map(mins => (
                                    <TouchableOpacity
                                        key={mins}
                                        style={styles.durationChip}
                                        onPress={() => handleQuickDuration(mins)}
                                    >
                                        <Text style={styles.durationChipText}>
                                            +{mins < 60 ? `${mins}m` : `${mins / 60}h`}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Description */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Description (Optional)</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Add details..."
                                placeholderTextColor={colors.text.tertiary}
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        {/* Checklist */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Checklist</Text>
                            <View style={styles.checklistContainer}>
                                {checklist.map(item => (
                                    <View key={item.id} style={styles.checklistItem}>
                                        <MaterialIcons name="check-box-outline-blank" size={20} color={colors.text.tertiary} />
                                        <Text style={styles.checklistItemText}>{item.text}</Text>
                                        <TouchableOpacity onPress={() => removeChecklistItem(item.id)}>
                                            <MaterialIcons name="close" size={20} color={colors.text.tertiary} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                            <View style={styles.addChecklistContainer}>
                                <TextInput
                                    style={styles.addChecklistInput}
                                    placeholder="Add item..."
                                    placeholderTextColor={colors.text.tertiary}
                                    value={newChecklistItem}
                                    onChangeText={setNewChecklistItem}
                                    onSubmitEditing={addChecklistItem}
                                />
                                <TouchableOpacity style={styles.addButton} onPress={addChecklistItem}>
                                    <MaterialIcons name="add" size={24} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Reminder */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Reminder</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
                                    {[
                                        { label: 'None', icon: 'notifications-off', value: null },
                                        { label: 'At start', icon: 'notifications', value: 0 },
                                        { label: '5m', icon: 'schedule', value: 5 },
                                        { label: '15m', icon: 'schedule', value: 15 },
                                        { label: '30m', icon: 'schedule', value: 30 },
                                        { label: '1h', icon: 'schedule', value: 60 },
                                        { label: 'Custom', icon: 'edit', value: -1 },
                                    ].map((option) => {
                                        const isCustom = option.value === -1;
                                        const isSelected = option.value === null
                                            ? reminderMinutes === null
                                            : isCustom
                                                ? (reminderMinutes !== null && reminderMinutes > 60 || (reminderMinutes !== null && reminderMinutes !== 0 && reminderMinutes !== 5 && reminderMinutes !== 15 && reminderMinutes !== 30 && reminderMinutes !== 60))
                                                : reminderMinutes === option.value;

                                        let displayLabel = option.label;
                                        if (isCustom && isSelected && reminderMinutes !== null) {
                                            if (reminderMinutes >= 60) {
                                                const hours = Math.floor(reminderMinutes / 60);
                                                const mins = reminderMinutes % 60;
                                                displayLabel = mins > 0 ? `${hours}h${mins}m` : `${hours}h`;
                                            } else {
                                                displayLabel = `${reminderMinutes}m`;
                                            }
                                        }

                                        return (
                                            <TouchableOpacity
                                                key={option.value ?? 'none'}
                                                style={[
                                                    styles.reminderChip,
                                                    isSelected && styles.reminderChipSelected
                                                ]}
                                                onPress={() => {
                                                    if (isCustom) {
                                                        setShowCustomReminderPicker(true);
                                                    } else {
                                                        setReminderMinutes(option.value);
                                                    }
                                                }}
                                            >
                                                <MaterialIcons
                                                    name={option.icon as any}
                                                    size={16}
                                                    color={isSelected ? colors.primary : colors.text.secondary}
                                                />
                                                <Text style={[
                                                    styles.reminderChipText,
                                                    isSelected && styles.reminderChipTextSelected
                                                ]}>
                                                    {displayLabel}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </ScrollView>
                        </View>

                        {/* Recurring Task Button */}
                        <TouchableOpacity
                            style={styles.recurringButton}
                            onPress={() => setShowRecurringModal(true)}
                        >
                            <MaterialIcons
                                name="repeat"
                                size={20}
                                color={recurrenceRule ? colors.primary : colors.text.secondary}
                            />
                            <Text style={[
                                styles.recurringButtonText,
                                recurrenceRule && styles.recurringButtonTextActive
                            ]}>
                                {recurrenceRule
                                    ? `Recurring ${recurrenceRule.frequency}`
                                    : 'Make recurring'}
                            </Text>
                        </TouchableOpacity>

                        {/* Save Button */}
                        <TouchableOpacity
                            style={[styles.saveButton, !title.trim() && styles.disabledButton]}
                            onPress={handleSave}
                            disabled={!title.trim()}
                        >
                            <Text style={styles.saveButtonText}>
                                {task ? 'Update Task' : 'Create Task'}
                            </Text>
                        </TouchableOpacity>

                        {/* Delete Button */}
                        {task && onDelete && (
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={handleDelete}
                            >
                                <Text style={styles.deleteButtonText}>Delete Task</Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>

            <TimePickerModal />
            <DatePickerModal />
            <DatePickerModal isEndDate />

            {/* Custom Reminder Picker Modal */}
            <Modal
                transparent
                visible={showCustomReminderPicker}
                animationType="fade"
                onRequestClose={() => setShowCustomReminderPicker(false)}
            >
                <TouchableOpacity
                    style={styles.pickerModalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowCustomReminderPicker(false)}
                >
                    <View style={styles.timePickerContainer}>
                        <Text style={styles.timePickerTitle}>Custom Reminder Time</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
                            <View style={{ alignItems: 'center' }}>
                                <Text style={styles.label}>Hours</Text>
                                <TextInput
                                    style={[styles.input, { width: 80, textAlign: 'center' }]}
                                    keyboardType="number-pad"
                                    value={customReminderHours.toString()}
                                    onChangeText={(text) => {
                                        const hours = parseInt(text) || 0;
                                        setCustomReminderHours(Math.max(0, Math.min(24, hours)));
                                    }}
                                    placeholder="0"
                                    placeholderTextColor={colors.text.tertiary}
                                />
                            </View>
                            <Text style={styles.timePickerTitle}>:</Text>
                            <View style={{ alignItems: 'center' }}>
                                <Text style={styles.label}>Minutes</Text>
                                <TextInput
                                    style={[styles.input, { width: 80, textAlign: 'center' }]}
                                    keyboardType="number-pad"
                                    value={customReminderMinutes.toString()}
                                    onChangeText={(text) => {
                                        const minutes = parseInt(text) || 0;
                                        setCustomReminderMinutes(Math.max(0, Math.min(59, minutes)));
                                    }}
                                    placeholder="0"
                                    placeholderTextColor={colors.text.tertiary}
                                />
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.lg }}>
                            <TouchableOpacity
                                style={[styles.saveButton, { flex: 1 }]}
                                onPress={() => {
                                    const totalMinutes = (customReminderHours * 60) + customReminderMinutes;
                                    setReminderMinutes(totalMinutes);
                                    setShowCustomReminderPicker(false);
                                }}
                            >
                                <Text style={styles.saveButtonText}>Set Reminder</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.deleteButton, { flex: 1 }]}
                                onPress={() => setShowCustomReminderPicker(false)}
                            >
                                <Text style={styles.deleteButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Recurring Task Modal */}
            <RecurringTaskModal
                visible={showRecurringModal}
                onClose={() => setShowRecurringModal(false)}
                onSave={setRecurrenceRule}
                currentRule={recurrenceRule}
            />
        </Modal>
    );
}
