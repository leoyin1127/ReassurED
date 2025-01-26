import { useState, useEffect } from 'react';
import { useAuth0 } from 'react-native-auth0';
import { userService } from '../services/userService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export const useAuth = () => {
    const { user, isLoading, error, authorize, clearSession } = useAuth0();
    const [userProfile, setUserProfile] = useState(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);

    useEffect(() => {
        const loadUserProfile = async () => {
            if (user?.sub) {
                try {
                    const profile = await userService.getUserProfile(user.sub);

                    if (!profile) {
                        // Create initial profile for new users
                        const initialProfile = {
                            auth0Id: user.sub,
                            email: user.email,
                            name: user.name,
                            picture: user.picture,
                            createdAt: new Date().toISOString(),
                        };
                        await userService.saveUserProfile(user.sub, initialProfile);
                        setUserProfile(initialProfile);
                    } else {
                        setUserProfile(profile);
                    }
                } catch (error) {
                    console.error('Error loading user profile:', error);
                } finally {
                    setIsLoadingProfile(false);
                }
            }
        };

        loadUserProfile();
    }, [user]);

    const login = async () => {
        try {
            await authorize();
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    const logout = async (options = {}) => {
        try {
            await clearSession({
                returnTo: options.returnTo || 'com.reassured.app.auth0://dev-uzfzx46mssm2lnwi.ca.auth0.com/ios/com.reassured.app/logout',
                federated: true
            });
            try {
                await AsyncStorage.clear();
            } catch (storageError) {
                console.warn('Error clearing AsyncStorage:', storageError);
            }
            setUserProfile(null);
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    const updateProfile = async (updates) => {
        if (user?.sub) {
            try {
                await userService.updateUserProfile(user.sub, updates);
                setUserProfile(prev => ({ ...prev, ...updates }));
            } catch (error) {
                console.error('Error updating profile:', error);
                throw error;
            }
        }
    };

    return {
        user,
        userProfile,
        isLoading: isLoading || isLoadingProfile,
        error,
        login,
        logout,
        updateProfile,
    };
}; 