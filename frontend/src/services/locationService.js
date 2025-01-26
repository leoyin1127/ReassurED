import * as Location from 'expo-location';
import { Platform, Linking, Alert } from 'react-native';

export const locationService = {
    checkLocationServices: async () => {
        try {
            const enabled = await Location.hasServicesEnabledAsync();
            if (!enabled) {
                Alert.alert(
                    'Location Services Disabled',
                    'Please enable Location Services in your device settings to use this feature.',
                    [
                        {
                            text: 'Open Settings',
                            onPress: () => Platform.OS === 'ios'
                                ? Linking.openURL('app-settings:')
                                : Linking.openSettings()
                        },
                        { text: 'Cancel', style: 'cancel' }
                    ]
                );
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error checking location services:', error);
            return false;
        }
    },

    requestPermissions: async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            return status === 'granted';
        } catch (error) {
            console.error('Error requesting location permissions:', error);
            return false;
        }
    },

    getCurrentLocation: async () => {
        try {
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
                mayShowUserSettingsDialog: true
            });

            return {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };
        } catch (error) {
            console.error('Error getting current location:', error);
            throw error;
        }
    }
}; 