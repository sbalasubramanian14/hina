import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

interface SplashScreenProps {
    onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
    const fullTextOpacity = useRef(new Animated.Value(0)).current;
    const shortNameOpacity = useRef(new Animated.Value(0)).current;
    const fullTextScale = useRef(new Animated.Value(1)).current;
    const taglineOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Improved animation sequence
        Animated.sequence([
            // 1. Fade in full text
            Animated.timing(fullTextOpacity, {
                toValue: 1,
                duration: 600,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            // 2. Hold full text
            Animated.delay(1200),
            // 3. Transform full text to HINA smoothly
            Animated.parallel([
                // Fade out full text
                Animated.timing(fullTextOpacity, {
                    toValue: 0,
                    duration: 400,
                    easing: Easing.in(Easing.cubic),
                    useNativeDriver: true,
                }),
                // Scale down full text
                Animated.timing(fullTextScale, {
                    toValue: 0.3,
                    duration: 400,
                    easing: Easing.in(Easing.cubic),
                    useNativeDriver: true,
                }),
                // Fade in HINA
                Animated.timing(shortNameOpacity, {
                    toValue: 1,
                    duration: 500,
                    delay: 200,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),
            // 4. Fade in tagline
            Animated.timing(taglineOpacity, {
                toValue: 1,
                duration: 400,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            // 5. Hold before fade out
            Animated.delay(800),
            // 6. Fade everything out
            Animated.parallel([
                Animated.timing(shortNameOpacity, {
                    toValue: 0,
                    duration: 400,
                    easing: Easing.in(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(taglineOpacity, {
                    toValue: 0,
                    duration: 400,
                    easing: Easing.in(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),
        ]).start(() => {
            onFinish();
        });
    }, []);

    return (
        <View style={styles.container}>
            {/* Full text */}
            <Animated.View
                style={[
                    styles.fullTextContainer,
                    {
                        opacity: fullTextOpacity,
                        transform: [{ scale: fullTextScale }],
                    },
                ]}
            >
                <Text style={styles.fullText}>Helpful Interactive</Text>
                <Text style={styles.fullText}>Neural Assistant</Text>
            </Animated.View>

            {/* Short name HINA */}
            <Animated.View
                style={[
                    styles.shortNameContainer,
                    {
                        opacity: shortNameOpacity,
                    },
                ]}
            >
                <Text style={styles.shortName}>HINA</Text>
            </Animated.View>

            {/* Tagline */}
            <Animated.Text
                style={[
                    styles.tagline,
                    {
                        opacity: taglineOpacity,
                    },
                ]}
            >
                Your AI-Powered Task Companion
            </Animated.Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullTextContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    fullText: {
        fontSize: 20,
        color: '#FFFFFF',
        fontWeight: '600',
        textAlign: 'center',
        opacity: 0.95,
        marginVertical: 4,
    },
    shortNameContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    shortName: {
        fontSize: 80,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 8,
    },
    tagline: {
        position: 'absolute',
        bottom: 120,
        fontSize: 14,
        color: '#FFFFFF',
        opacity: 0.9,
        textAlign: 'center',
    },
});
