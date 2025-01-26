import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { useAuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function ProfileScreen() {
    const { userProfile, updateProfile, logout } = useAuthContext();

    const handleUpdateProfile = async () => {
        try {
            await updateProfile({
                // Add whatever fields you want to update
                bio: 'New bio content',
                phoneNumber: '+1234567890',
            });
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    // Add this function to debug AsyncStorage contents
    const checkAsyncStorage = async () => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const items = await AsyncStorage.multiGet(keys);
            console.log('AsyncStorage contents:', items);
        } catch (error) {
            console.error('Error checking AsyncStorage:', error);
        }
    };

    const clearAsyncStorage = async () => {
        try {
            await AsyncStorage.clear();
            console.log('AsyncStorage cleared');
        } catch (error) {
            console.error('Error clearing AsyncStorage:', error);
        }
    };

    // Add it to your logout function
    const handleLogout = async () => {
        await clearAsyncStorage();
        logout();  // your existing logout function
    };

    useEffect(() => {
        checkAsyncStorage();
    }, []);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Image
                    source={{ uri: userProfile?.picture }}
                    style={styles.profilePicture}
                />
                <Text style={styles.name}>{userProfile?.name}</Text>
                <Text style={styles.email}>{userProfile?.email}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                <View style={styles.infoItem}>
                    <Text style={styles.label}>Phone</Text>
                    <Text style={styles.value}>{userProfile?.phoneNumber || 'Not set'}</Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.label}>Emergency Contact</Text>
                    <Text style={styles.value}>{userProfile?.emergencyContact || 'Not set'}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Medical Information</Text>
                <View style={styles.infoItem}>
                    <Text style={styles.label}>Allergies</Text>
                    <Text style={styles.value}>{userProfile?.allergies || 'None'}</Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.label}>Medications</Text>
                    <Text style={styles.value}>{userProfile?.medications || 'None'}</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#fff',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    profilePicture: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    email: {
        fontSize: 16,
        color: '#666',
    },
    section: {
        backgroundColor: '#fff',
        margin: 10,
        padding: 15,
        borderRadius: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
        color: '#333',
    },
    infoItem: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    value: {
        fontSize: 16,
        color: '#333',
    },
    logoutButton: {
        margin: 10,
        padding: 15,
        backgroundColor: '#dc3545',
        borderRadius: 10,
        alignItems: 'center',
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
}); 