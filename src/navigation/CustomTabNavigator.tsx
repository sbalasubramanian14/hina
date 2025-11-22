import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../constants/colors';

import HomeScreen from '../screens/HomeScreen';
import TaskSpacesScreen from '../screens/TaskSpacesScreen';
import SettingsScreen from '../screens/SettingsScreen';

type TabName = 'home' | 'spaces' | 'settings';

interface Tab {
    name: TabName;
    label: string;
    icon: string;
    component: React.ComponentType<any>;
}

const tabs: Tab[] = [
    { name: 'home', label: 'Tasks', icon: '📅', component: HomeScreen },
    { name: 'spaces', label: 'Spaces', icon: '📁', component: TaskSpacesScreen },
    { name: 'settings', label: 'Settings', icon: '⚙️', component: SettingsScreen },
];

export default function CustomTabNavigator() {
    const [activeTab, setActiveTab] = useState<TabName>('home');

    const ActiveComponent = tabs.find(tab => tab.name === activeTab)?.component || HomeScreen;

    // Create a simple navigation object for screens that need it
    const navigation = {
        navigate: (screenName: string, params?: any) => {
            console.log(`Navigation to ${screenName} not implemented yet`);
        },
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Screen Content */}
            <View style={styles.content}>
                <ActiveComponent navigation={navigation} />
            </View>

            {/* Bottom Tab Bar */}
            <View style={styles.tabBar}>
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.name;
                    return (
                        <TouchableOpacity
                            key={tab.name}
                            style={styles.tabItem}
                            onPress={() => setActiveTab(tab.name)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.tabIcon}>{tab.icon}</Text>
                            <Text style={[
                                styles.tabLabel,
                                isActive && styles.tabLabelActive
                            ]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background.primary,
    },
    content: {
        flex: 1,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: COLORS.background.primary,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingBottom: 8,
        paddingTop: 8,
        height: 60,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    tabLabel: {
        fontSize: FONT_SIZES.xs,
        fontWeight: FONT_WEIGHTS.semibold,
        color: COLORS.text.tertiary,
    },
    tabLabelActive: {
        color: COLORS.primary,
    },
});
