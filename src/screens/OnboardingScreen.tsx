import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../constants/colors';
import { PREDEFINED_INTERESTS } from '../utils/interests';
import { UserProfile } from '../types';
import { saveUserProfile } from '../services/storage';
import { requestNotificationPermissions } from '../services/notifications';
import * as Location from 'expo-location';

interface OnboardingScreenProps {
    onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
    const [step, setStep] = useState(0);
    const [name, setName] = useState('');
    const [selectedInterests, setSelectedInterests] = useState<Record<string, string[]>>({});
    const [apiKey, setApiKey] = useState('');

    const handleInterestToggle = (category: string, interest: string) => {
        setSelectedInterests(prev => {
            const categoryInterests = prev[category] || [];
            const isSelected = categoryInterests.includes(interest);

            return {
                ...prev,
                [category]: isSelected
                    ? categoryInterests.filter(i => i !== interest)
                    : [...categoryInterests, interest],
            };
        });
    };

    const handleComplete = async () => {
        if (!apiKey.trim()) {
            Alert.alert('API Key Required', 'Please enter your Gemini API key to continue.');
            return;
        }

        try {
            const notifPermission = await requestNotificationPermissions();
            let locationPermission = false;

            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                locationPermission = status === 'granted';
            } catch (error) {
                console.log('Location permission error:', error);
            }

            const interests = Object.entries(selectedInterests)
                .filter(([_, items]) => items.length > 0)
                .map(([category, items]) => ({ category, items }));

            const profile: UserProfile = {
                name: name.trim() || undefined,
                interests,
                geminiApiKey: apiKey.trim(),
                locationPermission,
                notificationsPermission: notifPermission,
                onboardingCompleted: true,
                createdAt: new Date().toISOString(),
            };

            await saveUserProfile(profile);
            onComplete();
        } catch (error) {
            console.error('Error completing onboarding:', error);
            Alert.alert(
                'Setup Error',
                'There was an error saving your profile. Please try again.'
            );
        }
    };

    const renderWelcome = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.title}>Welcome to HINA</Text>
            <Text style={styles.subtitle}>Helpful Interactive Neural Assistant</Text>

            <View style={styles.featureContainer}>
                <FeatureItem icon="📅" text="Smart task spaces & calendar" />
                <FeatureItem icon="🤖" text="AI-powered suggestions" />
                <FeatureItem icon="🔔" text="Context-aware reminders" />
                <FeatureItem icon="💡" text="Optimize your free time" />
            </View>

            <View style={styles.nameInputContainer}>
                <Text style={styles.label}>What's your name? (Optional)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your name"
                    placeholderTextColor={COLORS.text.tertiary}
                    value={name}
                    onChangeText={setName}
                />
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={() => setStep(1)}>
                <Text style={styles.primaryButtonText}>Get Started</Text>
            </TouchableOpacity>
        </View>
    );

    const renderInterests = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.title}>Select Your Interests</Text>
            <Text style={styles.subtitle}>
                Help us personalize your experience
            </Text>

            <ScrollView style={styles.interestsScroll}>
                {Object.entries(PREDEFINED_INTERESTS).map(([category, items]) => (
                    <View key={category} style={styles.interestCategory}>
                        <Text style={styles.categoryTitle}>{category}</Text>
                        <View style={styles.interestGrid}>
                            {items.map((interest) => {
                                const isSelected = selectedInterests[category]?.includes(interest);
                                return (
                                    <TouchableOpacity
                                        key={interest}
                                        style={[
                                            styles.interestChip,
                                            isSelected && styles.interestChipSelected,
                                        ]}
                                        onPress={() => handleInterestToggle(category, interest)}
                                    >
                                        <Text
                                            style={[
                                                styles.interestChipText,
                                                isSelected && styles.interestChipTextSelected,
                                            ]}
                                        >
                                            {interest}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep(0)}>
                    <Text style={styles.secondaryButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryButton} onPress={() => setStep(2)}>
                    <Text style={styles.primaryButtonText}>Continue</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderApiKey = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.title}>Gemini API Key</Text>
            <Text style={styles.subtitle}>
                Required for AI features. Get your free key at{'\n'}
                ai.google.dev
            </Text>

            <View style={styles.apiKeyContainer}>
                <Text style={styles.label}>Gemini API Key</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your API key"
                    placeholderTextColor={COLORS.text.tertiary}
                    value={apiKey}
                    onChangeText={setApiKey}
                    secureTextEntry
                    autoCapitalize="none"
                />
                <Text style={styles.helpText}>
                    Your API key is stored securely on your device
                </Text>
            </View>

            <View style={styles.permissionsInfo}>
                <Text style={styles.sectionTitle}>Permissions Needed:</Text>
                <PermissionItem text="Notifications - For task reminders" />
                <PermissionItem text="Location (Optional) - For context-aware suggestions" />
            </View>

            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep(1)}>
                    <Text style={styles.secondaryButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryButton} onPress={handleComplete}>
                    <Text style={styles.primaryButtonText}>Complete Setup</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {step === 0 && renderWelcome()}
                    {step === 1 && renderInterests()}
                    {step === 2 && renderApiKey()}
                </ScrollView>

                <View style={styles.pagination}>
                    {[0, 1, 2].map(i => (
                        <View
                            key={i}
                            style={[styles.paginationDot, step === i && styles.paginationDotActive]}
                        />
                    ))}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const FeatureItem = ({ icon, text }: { icon: string; text: string }) => (
    <View style={styles.featureItem}>
        <Text style={styles.featureIcon}>{icon}</Text>
        <Text style={styles.featureText}>{text}</Text>
    </View>
);

const PermissionItem = ({ text }: { text: string }) => (
    <View style={styles.permissionItem}>
        <Text style={styles.permissionBullet}>•</Text>
        <Text style={styles.permissionText}>{text}</Text>
    </View>
);

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background.primary,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    stepContainer: {
        flex: 1,
        padding: SPACING.lg,
        paddingTop: SPACING.xl,
        justifyContent: 'center',
        minHeight: 600,
    },
    title: {
        fontSize: FONT_SIZES.xxxl,
        fontWeight: FONT_WEIGHTS.bold,
        color: COLORS.text.primary,
        textAlign: 'center',
        marginBottom: SPACING.sm,
    },
    subtitle: {
        fontSize: FONT_SIZES.md,
        color: COLORS.text.secondary,
        textAlign: 'center',
        marginBottom: SPACING.xl,
    },
    featureContainer: {
        marginBottom: SPACING.xl,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
        paddingHorizontal: SPACING.md,
    },
    featureIcon: {
        fontSize: FONT_SIZES.xl,
        marginRight: SPACING.md,
    },
    featureText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.text.primary,
        flex: 1,
    },
    nameInputContainer: {
        marginBottom: SPACING.xl,
    },
    label: {
        fontSize: FONT_SIZES.sm,
        fontWeight: FONT_WEIGHTS.semibold,
        color: COLORS.text.primary,
        marginBottom: SPACING.sm,
    },
    input: {
        backgroundColor: COLORS.background.secondary,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        fontSize: FONT_SIZES.md,
        color: COLORS.text.primary,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: COLORS.text.inverse,
        fontSize: FONT_SIZES.md,
        fontWeight: FONT_WEIGHTS.semibold,
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: COLORS.background.secondary,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        alignItems: 'center',
        marginRight: SPACING.sm,
    },
    secondaryButtonText: {
        color: COLORS.text.primary,
        fontSize: FONT_SIZES.md,
        fontWeight: FONT_WEIGHTS.semibold,
    },
    buttonRow: {
        flexDirection: 'row',
        marginTop: SPACING.lg,
    },
    interestsScroll: {
        flex: 1,
        marginBottom: SPACING.lg,
    },
    interestCategory: {
        marginBottom: SPACING.lg,
    },
    categoryTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: FONT_WEIGHTS.semibold,
        color: COLORS.text.primary,
        marginBottom: SPACING.sm,
    },
    interestGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    interestChip: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.background.secondary,
        marginRight: SPACING.sm,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    interestChipSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    interestChipText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.text.primary,
    },
    interestChipTextSelected: {
        color: COLORS.text.inverse,
    },
    apiKeyContainer: {
        marginBottom: SPACING.xl,
    },
    helpText: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.text.tertiary,
        marginTop: SPACING.sm,
    },
    permissionsInfo: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: FONT_SIZES.md,
        fontWeight: FONT_WEIGHTS.semibold,
        color: COLORS.text.primary,
        marginBottom: SPACING.sm,
    },
    permissionItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: SPACING.sm,
    },
    permissionBullet: {
        fontSize: FONT_SIZES.md,
        color: COLORS.text.secondary,
        marginRight: SPACING.sm,
    },
    permissionText: {
        flex: 1,
        fontSize: FONT_SIZES.sm,
        color: COLORS.text.secondary,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: SPACING.lg,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.border,
        marginHorizontal: SPACING.xs,
    },
    paginationDotActive: {
        backgroundColor: COLORS.primary,
        width: 24,
    },
});
