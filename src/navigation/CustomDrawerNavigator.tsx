import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

import HomeScreen from '../screens/HomeScreen';
import TaskSpacesScreen from '../screens/TaskSpacesScreen';
import SettingsScreen from '../screens/SettingsScreen';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

type ScreenName = 'home' | 'spaces' | 'settings';

interface DrawerItem {
    name: ScreenName;
    label: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    component: React.ComponentType<any>;
}

const drawerItems: DrawerItem[] = [
    { name: 'home', label: 'Home', icon: 'home', component: HomeScreen },
    { name: 'spaces', label: 'Task Spaces', icon: 'folder', component: TaskSpacesScreen },
    { name: 'settings', label: 'Settings', icon: 'settings', component: SettingsScreen },
];

export default function CustomDrawerNavigator() {
    const { colors } = useTheme();
    const [activeScreen, setActiveScreen] = useState<ScreenName>('home');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const drawerPosition = React.useRef(new Animated.Value(-DRAWER_WIDTH)).current;

    const toggleDrawer = () => {
        const toValue = drawerOpen ? -DRAWER_WIDTH : 0;

        Animated.spring(drawerPosition, {
            toValue,
            useNativeDriver: true,
            friction: 8,
            tension: 65,
        }).start();

        setDrawerOpen(!drawerOpen);
    };

    const closeDrawer = () => {
        Animated.spring(drawerPosition, {
            toValue: -DRAWER_WIDTH,
            useNativeDriver: true,
            friction: 8,
            tension: 65,
        }).start();

        setDrawerOpen(false);
    };

    const navigateTo = (screenName: ScreenName) => {
        setActiveScreen(screenName);
        closeDrawer();
    };

    const ActiveComponent = drawerItems.find(item => item.name === activeScreen)?.component || HomeScreen;

    const navigation = {
        navigate: (screenName: string, params?: any) => {
            console.log(`Navigation to ${screenName} not implemented yet`);
        },
    };

    // Move styles inside component to access colors
    const styles = React.useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background.primary,
        },
        mainContent: {
            flex: 1,
        },
        header: {
            paddingHorizontal: SPACING.lg,
            paddingVertical: SPACING.md,
            backgroundColor: colors.background.primary,
        },
        menuButton: {
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
        },
        menuIcon: {
            fontSize: 28,
            color: colors.text.primary,
        },
        overlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        drawer: {
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: DRAWER_WIDTH,
            backgroundColor: colors.background.secondary,
            borderRightWidth: 1,
            borderRightColor: colors.border,
        },
        drawerContent: {
            flex: 1,
        },
        drawerHeader: {
            padding: SPACING.xl,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        drawerTitle: {
            fontSize: FONT_SIZES.xxxl,
            fontWeight: FONT_WEIGHTS.bold,
            color: colors.primary,
            marginBottom: SPACING.xs,
        },
        drawerSubtitle: {
            fontSize: FONT_SIZES.sm,
            color: colors.text.secondary,
        },
        drawerItems: {
            flex: 1,
            paddingTop: SPACING.lg,
        },
        drawerItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: SPACING.md,
            paddingHorizontal: SPACING.xl,
        },
        drawerItemActive: {
            backgroundColor: colors.primary + '20',
            borderRightWidth: 4,
            borderRightColor: colors.primary,
        },
        drawerItemIcon: {
            marginRight: SPACING.md,
        },
        drawerItemLabel: {
            fontSize: FONT_SIZES.md,
            color: colors.text.primary,
            fontWeight: FONT_WEIGHTS.medium,
        },
        drawerItemLabelActive: {
            color: colors.primary,
            fontWeight: FONT_WEIGHTS.bold,
        },
        drawerFooter: {
            padding: SPACING.lg,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            alignItems: 'center',
        },
        versionText: {
            fontSize: FONT_SIZES.xs,
            color: colors.text.tertiary,
        },
    }), [colors]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Main Content */}
            <View style={styles.mainContent}>
                {/* Header with menu button */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.menuButton} onPress={toggleDrawer}>
                        <MaterialIcons name="menu" size={28} color={colors.text.primary} />
                    </TouchableOpacity>
                </View>

                {/* Screen Content */}
                <ActiveComponent navigation={navigation} />
            </View>

            {/* Drawer Overlay */}
            {drawerOpen && (
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={closeDrawer}
                />
            )}

            {/* Drawer */}
            <Animated.View
                style={[
                    styles.drawer,
                    {
                        transform: [{ translateX: drawerPosition }],
                    },
                ]}
            >
                <SafeAreaView style={styles.drawerContent} edges={['top', 'left']}>
                    {/* Drawer Header */}
                    <View style={styles.drawerHeader}>
                        <Text style={styles.drawerTitle}>HINA</Text>
                        <Text style={styles.drawerSubtitle}>AI Task Assistant</Text>
                    </View>

                    {/* Drawer Items */}
                    <View style={styles.drawerItems}>
                        {drawerItems.map((item) => {
                            const isActive = activeScreen === item.name;
                            return (
                                <TouchableOpacity
                                    key={item.name}
                                    style={[
                                        styles.drawerItem,
                                        isActive && styles.drawerItemActive
                                    ]}
                                    onPress={() => navigateTo(item.name)}
                                >
                                    <MaterialIcons
                                        name={item.icon}
                                        size={24}
                                        color={isActive ? colors.primary : colors.text.primary}
                                        style={styles.drawerItemIcon}
                                    />
                                    <Text style={[
                                        styles.drawerItemLabel,
                                        isActive && styles.drawerItemLabelActive
                                    ]}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* App Version */}
                    <View style={styles.drawerFooter}>
                        <Text style={styles.versionText}>v1.0.0</Text>
                    </View>
                </SafeAreaView>
            </Animated.View>
        </SafeAreaView>
    );
}
