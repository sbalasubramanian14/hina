import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import CustomDrawerNavigator from './src/navigation/CustomDrawerNavigator';
import OnboardingScreen from './src/screens/OnboardingScreen';
import SplashScreen from './src/screens/SplashScreen';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { getUserProfile } from './src/services/storage';

function AppContent() {
    const [isLoading, setIsLoading] = useState(true);
    const [showSplash, setShowSplash] = useState(true);
    const [isOnboarded, setIsOnboarded] = useState(false);
    const { colors, isDark } = useTheme();

    useEffect(() => {
        checkOnboardingStatus();
    }, []);

    const checkOnboardingStatus = async () => {
        try {
            console.log('📱 Checking onboarding status...');
            const profile = await getUserProfile();
            console.log('📱 Profile loaded:', profile);
            setIsOnboarded(profile?.onboardingCompleted === true);
        } catch (error) {
            console.error('📱 Error checking onboarding status:', error);
            setIsOnboarded(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSplashFinish = () => {
        setShowSplash(false);
    };

    const handleOnboardingComplete = () => {
        console.log('📱 Onboarding completed! Setting isOnboarded to true...');
        setIsOnboarded(true);
        console.log('📱 isOnboarded state updated. App should navigate to main app now.');
    };

    const resetOnboarding = () => {
        console.log('📱 Resetting onboarding...');
        setIsOnboarded(false);
    };

    if (isLoading) {
        console.log('⏳ App is loading...');
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background.primary }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (showSplash) {
        console.log('🎬 Showing splash screen...');
        return <SplashScreen onFinish={handleSplashFinish} />;
    }

    console.log('🚀 App rendering main content. isOnboarded:', isOnboarded);

    return (
        <SafeAreaProvider>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            {isOnboarded ? (
                <>
                    {console.log('✅ Rendering CustomDrawerNavigator (main app)')}
                    <CustomDrawerNavigator onResetOnboarding={resetOnboarding} />
                </>
            ) : (
                <>
                    {console.log('📝 Rendering OnboardingScreen')}
                    <OnboardingScreen onComplete={handleOnboardingComplete} />
                </>
            )}
        </SafeAreaProvider>
    );
}

export default function App() {
    return (
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
