// Quick Storage Reset Utility
// Run this in the app to clear all corrupted data

import AsyncStorage from '@react-native-async-storage/async-storage';

export const debugStorage = async () => {
    try {
        console.log('=== STORAGE DEBUG ===');

        // Get all keys
        const allKeys = await AsyncStorage.getAllKeys();
        console.log('All storage keys:', allKeys);

        // Log each value
        for (const key of allKeys) {
            const value = await AsyncStorage.getItem(key);
            console.log(`${key}:`, value);
        }

        console.log('=== END DEBUG ===');
    } catch (error) {
        console.error('Debug error:', error);
    }
};

export const clearAllStorageNow = async () => {
    try {
        console.log('🧹 Clearing ALL AsyncStorage...');
        await AsyncStorage.clear();
        console.log('✅ Storage cleared successfully!');
        console.log('Please reload the app now.');
    } catch (error) {
        console.error('❌ Error clearing storage:', error);
    }
};

// Add this to App.tsx temporarily to clear storage:
// import { clearAllStorageNow } from './src/utils/debugStorage';
// useEffect(() => { clearAllStorageNow(); }, []);
