import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Modal,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ScrollView,
} from 'react-native';
import { SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import IconPicker from './IconPicker';
import ColorPicker from './ColorPicker';
import { TaskSpace } from '../types';
import { saveTaskSpace } from '../services/storage';

interface CreateSpaceModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editingSpace?: TaskSpace;
}

export default function CreateSpaceModal({ visible, onClose, onSuccess, editingSpace }: CreateSpaceModalProps) {
    const { colors } = useTheme();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('💼');
    const [selectedColor, setSelectedColor] = useState('#6366F1');

    // Update form when editingSpace changes
    React.useEffect(() => {
        if (editingSpace) {
            setName(editingSpace.name);
            setDescription(editingSpace.description || '');
            setSelectedIcon(editingSpace.icon);
            setSelectedColor(editingSpace.color);
        } else {
            // Reset form for new space
            setName('');
            setDescription('');
            setSelectedIcon('💼');
            setSelectedColor('#6366F1');
        }
    }, [editingSpace, visible]);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Name Required', 'Please enter a name for your task space.');
            return;
        }

        const newSpace: TaskSpace = {
            id: editingSpace?.id || Date.now().toString(),
            name: name.trim(),
            description: description.trim(),
            icon: selectedIcon,
            color: selectedColor,
            createdAt: editingSpace?.createdAt || new Date().toISOString(),
        };

        try {
            await saveTaskSpace(newSpace);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving task space:', error);
            Alert.alert('Error', 'Failed to save task space. Please try again.');
        }
    };

    const styles = React.useMemo(() => StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
        },
        container: {
            backgroundColor: colors.background.primary,
            borderTopLeftRadius: BORDER_RADIUS.xl,
            borderTopRightRadius: BORDER_RADIUS.xl,
            paddingTop: SPACING.lg,
            paddingHorizontal: SPACING.lg,
            paddingBottom: Platform.OS === 'ios' ? SPACING.xl : SPACING.lg,
            maxHeight: '90%',
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: SPACING.lg,
        },
        title: {
            fontSize: FONT_SIZES.xxl,
            fontWeight: FONT_WEIGHTS.bold,
            color: colors.text.primary,
        },
        closeButton: {
            padding: SPACING.sm,
        },
        closeText: {
            fontSize: FONT_SIZES.xl,
            color: colors.text.secondary,
        },
        scrollContent: {
            maxHeight: '70%',
        },
        inputContainer: {
            marginBottom: SPACING.lg,
        },
        label: {
            fontSize: FONT_SIZES.sm,
            fontWeight: FONT_WEIGHTS.semibold,
            color: colors.text.primary,
            marginBottom: SPACING.sm,
        },
        input: {
            backgroundColor: colors.background.secondary,
            borderRadius: BORDER_RADIUS.md,
            padding: SPACING.md,
            fontSize: FONT_SIZES.md,
            color: colors.text.primary,
            borderWidth: 1,
            borderColor: colors.border,
        },
        textArea: {
            height: 80,
            textAlignVertical: 'top',
        },
        buttonRow: {
            flexDirection: 'row',
            marginTop: SPACING.lg,
            gap: SPACING.md,
        },
        button: {
            flex: 1,
            padding: SPACING.md,
            borderRadius: BORDER_RADIUS.md,
            alignItems: 'center',
        },
        cancelButton: {
            backgroundColor: colors.background.secondary,
        },
        saveButton: {
            backgroundColor: colors.primary,
        },
        buttonText: {
            fontSize: FONT_SIZES.md,
            fontWeight: FONT_WEIGHTS.semibold,
        },
        cancelButtonText: {
            color: colors.text.primary,
        },
        saveButtonText: {
            color: colors.text.inverse,
        },
    }), [colors]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ width: '100%' }}
                >
                    <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.container}>
                            <View style={styles.header}>
                                <Text style={styles.title}>
                                    {editingSpace ? 'Edit Space' : 'Create New Space'}
                                </Text>
                                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                                    <Text style={styles.closeText}>✕</Text>
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                style={styles.scrollContent}
                                showsVerticalScrollIndicator={false}
                            >
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Name</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g., Work, Personal, Learning"
                                        placeholderTextColor={colors.text.tertiary}
                                        value={name}
                                        onChangeText={setName}
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Description (Optional)</Text>
                                    <TextInput
                                        style={[styles.input, styles.textArea]}
                                        placeholder="Brief description of this space"
                                        placeholderTextColor={colors.text.tertiary}
                                        value={description}
                                        onChangeText={setDescription}
                                        multiline
                                        numberOfLines={3}
                                    />
                                </View>

                                <IconPicker
                                    selectedIcon={selectedIcon}
                                    onIconSelect={setSelectedIcon}
                                />

                                <ColorPicker
                                    selectedColor={selectedColor}
                                    onColorSelect={setSelectedColor}
                                />
                            </ScrollView>

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
                                    <Text style={[styles.buttonText, styles.saveButtonText]}>
                                        {editingSpace ? 'Save Changes' : 'Create Space'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </TouchableOpacity>
        </Modal>
    );
}
