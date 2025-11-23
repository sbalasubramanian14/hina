import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface SplashScreenProps {
    onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
    // Individual letter animations
    const letterH = useRef(new Animated.Value(0)).current;
    const letterI = useRef(new Animated.Value(0)).current;
    const letterN = useRef(new Animated.Value(0)).current;
    const letterA = useRef(new Animated.Value(0)).current;

    // Other animations
    const fullFormOpacity = useRef(new Animated.Value(0)).current;
    const fullFormScale = useRef(new Animated.Value(0.8)).current;
    const taglineOpacity = useRef(new Animated.Value(0)).current;
    const circleScale = useRef(new Animated.Value(0)).current;
    const circleOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Background circle animation
        Animated.parallel([
            Animated.timing(circleScale, {
                toValue: 1,
                duration: 1500,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
            Animated.timing(circleOpacity, {
                toValue: 0.15,
                duration: 1200,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
        ]).start();

        // Staggered letter animations
        Animated.sequence([
            Animated.delay(200),
            Animated.parallel([
                // Letter H
                Animated.spring(letterH, {
                    toValue: 1,
                    friction: 5,
                    tension: 80,
                    useNativeDriver: true,
                }),
                // Letter I (delayed)
                Animated.sequence([
                    Animated.delay(100),
                    Animated.spring(letterI, {
                        toValue: 1,
                        friction: 5,
                        tension: 80,
                        useNativeDriver: true,
                    }),
                ]),
                // Letter N (delayed)
                Animated.sequence([
                    Animated.delay(200),
                    Animated.spring(letterN, {
                        toValue: 1,
                        friction: 5,
                        tension: 80,
                        useNativeDriver: true,
                    }),
                ]),
                // Letter A (delayed)
                Animated.sequence([
                    Animated.delay(300),
                    Animated.spring(letterA, {
                        toValue: 1,
                        friction: 5,
                        tension: 80,
                        useNativeDriver: true,
                    }),
                ]),
            ]),

            // Pause
            Animated.delay(600),

            // Full form appears with scale
            Animated.parallel([
                Animated.timing(fullFormOpacity, {
                    toValue: 1,
                    duration: 500,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.spring(fullFormScale, {
                    toValue: 1,
                    friction: 7,
                    tension: 60,
                    useNativeDriver: true,
                }),
            ]),

            // Tagline fades in
            Animated.timing(taglineOpacity, {
                toValue: 1,
                duration: 400,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),

            // Hold
            Animated.delay(1000),

            // Fade out everything
            Animated.parallel([
                Animated.timing(letterH, {
                    toValue: 0,
                    duration: 400,
                    easing: Easing.in(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(letterI, {
                    toValue: 0,
                    duration: 400,
                    easing: Easing.in(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(letterN, {
                    toValue: 0,
                    duration: 400,
                    easing: Easing.in(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(letterA, {
                    toValue: 0,
                    duration: 400,
                    easing: Easing.in(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(fullFormOpacity, {
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
                Animated.timing(circleOpacity, {
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

    const getLetterStyle = (animValue: Animated.Value) => ({
        opacity: animValue,
        transform: [
            {
                translateY: animValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                }),
            },
            {
                scale: animValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1],
                }),
            },
        ],
    });

    return (
        <LinearGradient
            colors={['#5B21B6', '#6366F1', '#3B82F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            {/* Expanding circles background */}
            <Animated.View
                style={[
                    styles.circle,
                    styles.circle1,
                    {
                        opacity: circleOpacity,
                        transform: [{ scale: circleScale }],
                    },
                ]}
            />
            <Animated.View
                style={[
                    styles.circle,
                    styles.circle2,
                    {
                        opacity: circleOpacity.interpolate({
                            inputRange: [0, 0.15],
                            outputRange: [0, 0.1],
                        }),
                        transform: [{ scale: circleScale }],
                    },
                ]}
            />

            {/* Letter by letter HINA */}
            <View style={styles.logoContainer}>
                <Animated.Text style={[styles.letter, getLetterStyle(letterH)]}>
                    H
                </Animated.Text>
                <Animated.Text style={[styles.letter, getLetterStyle(letterI)]}>
                    I
                </Animated.Text>
                <Animated.Text style={[styles.letter, getLetterStyle(letterN)]}>
                    N
                </Animated.Text>
                <Animated.Text style={[styles.letter, getLetterStyle(letterA)]}>
                    A
                </Animated.Text>
            </View>

            {/* Full form */}
            <Animated.View
                style={[
                    styles.fullFormContainer,
                    {
                        opacity: fullFormOpacity,
                        transform: [{ scale: fullFormScale }],
                    },
                ]}
            >
                <Text style={styles.fullFormText}>Helpful Interactive</Text>
                <Text style={styles.fullFormText}>Neural Assistant</Text>
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
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    letter: {
        fontSize: 88,
        fontWeight: '900',
        color: '#FFFFFF',
        marginHorizontal: 2,
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 3 },
        textShadowRadius: 8,
    },
    fullFormContainer: {
        position: 'absolute',
        top: '60%',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    fullFormText: {
        fontSize: 17,
        color: '#FFFFFF',
        fontWeight: '300',
        letterSpacing: 2,
        textAlign: 'center',
        marginVertical: 2,
        opacity: 0.9,
    },
    tagline: {
        position: 'absolute',
        bottom: 80,
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '400',
        letterSpacing: 0.5,
        opacity: 0.85,
        textAlign: 'center',
    },
    circle: {
        position: 'absolute',
        width: 400,
        height: 400,
        borderRadius: 200,
        backgroundColor: '#FFFFFF',
    },
    circle1: {
        top: '10%',
        left: '-20%',
    },
    circle2: {
        bottom: '5%',
        right: '-25%',
        width: 500,
        height: 500,
        borderRadius: 250,
    },
});
