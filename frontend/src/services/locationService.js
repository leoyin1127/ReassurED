import * as Location from 'expo-location';
import { Platform, Linking, Alert } from 'react-native';
import { doc, setDoc, collection } from 'firebase/firestore';
import { db } from '../config/firebase';

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
                timestamp: location.timestamp,
                accuracy: location.coords.accuracy,
            };
        } catch (error) {
            console.error('Error getting current location:', error);
            throw error;
        }
    },

    saveUserLocation: async (userId, locationData) => {
        try {
            const locationRef = doc(collection(db, 'users', userId, 'locations'));
            await setDoc(locationRef, {
                ...locationData,
                timestamp: new Date().toISOString(),
            });

            const userRef = doc(db, 'users', userId);
            await setDoc(userRef, {
                lastLocation: {
                    latitude: locationData.latitude,
                    longitude: locationData.longitude,
                    timestamp: new Date().toISOString(),
                }
            }, { merge: true });

            return true;
        } catch (error) {
            console.error('Error saving location to Firebase:', error);
            throw error;
        }
    }
}; 