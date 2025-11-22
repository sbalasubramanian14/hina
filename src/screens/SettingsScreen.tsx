import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    StyleSheet,
} from 'react-native';
import { SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../constants/colors';
import { getUserProfile, saveUserProfile, clearAllData } from '../services/storage';
import { useTheme } from '../context/ThemeContext';
import type { UserProfile } from '../types';

interface SettingsScreenProps {
    navigation?: any;
}

export default function SettingsScreen({ navigation }: SettingsScreenProps = {}) {
    const { theme, setTheme, colors } = useTheme();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState('');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        const userProfile = await getUserProfile();
        setProfile(userProfile);
        setNewName(userProfile?.name || '');
    };

    const handleSaveName = async () => {
        if (profile) {
            const updated = { ...profile, name: newName.trim() || undefined };
            await saveUserProfile(updated);
            setProfile(updated);
            setIsEditingName(false);
        }
    };

    const handleClearData = () => {
        Alert.alert(
            'Clear All Data',
            'This will delete all tasks, spaces, and settings. Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        await clearAllData();
                        Alert.alert('Success', 'All data has been cleared');
                    },
                },
            ]
        );
    };

    const handleReOnboard = () => {
        Alert.alert(
            'Edit Profile',
            'Update your name, interests, and API key.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Continue',
                    onPress: async () => {
                        try {
                            // Reset onboarding completion flag
                            if (profile) {
                                const updated = { ...profile, onboardingCompleted: false };
                                await saveUserProfile(updated);
                                // Navigate to onboarding directly
                                if (navigation) {
                                    navigation.navigate('onboarding');
                                }
                            }
                        } catch (error) {
                            console.error('Error resetting onboarding:', error);
                            Alert.alert('Error', 'Failed to reset onboarding. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    const styles = React.useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background.primary,
        },
        section: {
            paddingHorizontal: SPACING.lg,
            marginBottom: SPACING.lg,
            marginTop: SPACING.lg,
        },
        sectionTitle: {
            fontSize: FONT_SIZES.md,
            fontWeight: FONT_WEIGHTS.semibold,
            color: colors.text.secondary,
            marginBottom: SPACING.sm,
        },
        card: {
            backgroundColor: colors.card,
            borderRadius: BORDER_RADIUS.md,
            padding: SPACING.md,
            borderWidth: 1,
            borderColor: colors.border,
        },
        row: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: SPACING.sm,
        },
        label: {
            fontSize: FONT_SIZES.md,
            color: colors.text.primary,
        },
        value: {
            fontSize: FONT_SIZES.md,
            color: colors.text.secondary,
        },
        editRow: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
        },
        input: {
            flex: 1,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: BORDER_RADIUS.sm,
            padding: SPACING.sm,
            marginRight: SPACING.sm,
            fontSize: FONT_SIZES.md,
            color: colors.text.primary,
        },
        button: {
            paddingHorizontal: SPACING.md,
            paddingVertical: SPACING.sm,
            borderRadius: BORDER_RADIUS.sm,
            backgroundColor: colors.primary,
        },
        buttonText: {
            color: colors.text.inverse,
            fontSize: FONT_SIZES.sm,
            fontWeight: FONT_WEIGHTS.semibold,
        },
        secondaryButton: {
            backgroundColor: colors.background.secondary,
            paddingHorizontal: SPACING.md,
            paddingVertical: SPACING.sm,
            borderRadius: BORDER_RADIUS.md,
            alignItems: 'center',
            marginTop: SPACING.sm,
        },
        secondaryButtonText: {
            color: colors.text.primary,
            fontSize: FONT_SIZES.sm,
            fontWeight: FONT_WEIGHTS.semibold,
        },
        themeSelector: {
            flexDirection: 'row',
            marginTop: SPACING.sm,
        },
        themeOption: {
            flex: 1,
            paddingVertical: SPACING.md,
            paddingHorizontal: SPACING.sm,
            borderRadius: BORDER_RADIUS.md,
            backgroundColor: colors.background.secondary,
            alignItems: 'center',
            borderWidth: 2,
            borderColor: 'transparent',
            marginRight: SPACING.sm,
        },
        themeOptionActive: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        themeOptionText: {
            fontSize: FONT_SIZES.sm,
            color: colors.text.primary,
        },
        badge: {
            paddingHorizontal: SPACING.sm,
            paddingVertical: 4,
            borderRadius: BORDER_RADIUS.sm,
            backgroundColor: colors.background.secondary,
        },
        badgeActive: {
            backgroundColor: colors.success,
        },
        dangerButton: {
            backgroundColor: colors.error,
            padding: SPACING.md,
            borderRadius: BORDER_RADIUS.md,
            alignItems: 'center',
        },
        dangerButtonText: {
            color: colors.text.inverse,
            fontSize: FONT_SIZES.md,
            fontWeight: FONT_WEIGHTS.semibold,
        },
        footer: {
            padding: SPACING.lg,
            alignItems: 'center',
            marginTop: SPACING.xl,
        },
        footerText: {
            fontSize: FONT_SIZES.sm,
            color: colors.text.tertiary,
            fontWeight: FONT_WEIGHTS.medium,
        },
        footerSubtext: {
            fontSize: FONT_SIZES.xs,
            color: colors.text.tertiary,
            marginTop: SPACING.xs,
        },
    }), [colors]);

    return (
        <ScrollView style={styles.container}>
            {/* User Profile Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Profile</Text>

                <View style={styles.card}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Name</Text>
                        {isEditingName ? (
                            <View style={styles.editRow}>
                                <TextInput
                                    style={styles.input}
                                    value={newName}
                                    onChangeText={setNewName}
                                    placeholder="Your name"
                                    placeholderTextColor={colors.text.tertiary}
                                />
                                <TouchableOpacity style={styles.button} onPress={handleSaveName}>
                                    <Text style={styles.buttonText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity onPress={() => setIsEditingName(true)}>
                                <Text style={styles.value}>{profile?.name || 'Not set'}</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Interests</Text>
                        <Text style={styles.value}>
                            {profile?.interests?.length || 0} selected
                        </Text>
                    </View>

                    <TouchableOpacity style={styles.secondaryButton} onPress={handleReOnboard}>
                        <Text style={styles.secondaryButtonText}>✏️ Edit Profile</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Theme Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Appearance</Text>

                <View style={styles.card}>
                    <Text style={styles.label}>Theme</Text>
                    <View style={styles.themeSelector}>
                        <TouchableOpacity
                            style={[styles.themeOption, theme === 'light' && styles.themeOptionActive]}
                            onPress={() => setTheme('light')}
                        >
                            <Text style={styles.themeOptionText}>☀️ Light</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.themeOption, theme === 'dark' && styles.themeOptionActive]}
                            onPress={() => setTheme('dark')}
                        >
                            <Text style={styles.themeOptionText}>🌙 Dark</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.themeOption, theme === 'auto' && styles.themeOptionActive]}
                            onPress={() => setTheme('auto')}
                        >
                            <Text style={styles.themeOptionText}>⚙️ Auto</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Permissions Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Permissions</Text>

                <View style={styles.card}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Notifications</Text>
                        <Text style={[styles.badge, profile?.notificationsPermission && styles.badgeActive]}>
                            {profile?.notificationsPermission ? 'Enabled' : 'Disabled'}
                        </Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Location</Text>
                        <Text style={[styles.badge, profile?.locationPermission && styles.badgeActive]}>
                            {profile?.locationPermission ? 'Enabled' : 'Disabled'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Data Management Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Data</Text>

                <TouchableOpacity style={styles.dangerButton} onPress={handleClearData}>
                    <Text style={styles.dangerButtonText}>Clear All Data</Text>
                </TouchableOpacity>
            </View>

            {/* App Info */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>HINA v1.0.0</Text>
                <Text style={styles.footerSubtext}>Helpful Interactive Neural Assistant</Text>
            </View>
        </ScrollView>
    );
}
