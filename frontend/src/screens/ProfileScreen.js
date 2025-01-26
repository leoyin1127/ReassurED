import React, { useEffect } from 'react';
import { ScrollView, View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import config from '../../auth0-configuration';

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
        try {
            await clearAsyncStorage();
            await logout({
                returnTo: 'com.reassured.app.auth0://dev-uzfzx46mssm2lnwi.ca.auth0.com/ios/com.reassured.app/logout'
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    useEffect(() => {
        checkAsyncStorage();
    }, []);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <View style={styles.header}>
                    <Image
                        source={{ uri: userProfile?.picture || 'https://via.placeholder.com/150' }}
                        style={styles.profilePicture}
                    />
                    <Text style={styles.name}>{userProfile?.name || 'User Name'}</Text>
                    <Text style={styles.email}>{userProfile?.email || 'email@example.com'}</Text>
                </View>
            </View>

            <View style={styles.card}>
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="person-outline" size={24} color="#0056b3" />
                        <Text style={styles.sectionTitle}>Personal Information</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Phone</Text>
                        <Text style={styles.value}>{userProfile?.phoneNumber || 'Not set'}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Emergency Contact</Text>
                        <Text style={styles.value}>{userProfile?.emergencyContact || 'Not set'}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Date of Birth</Text>
                        <Text style={styles.value}>{userProfile?.dateOfBirth || 'Not set'}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.card}>
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="medical-outline" size={24} color="#0056b3" />
                        <Text style={styles.sectionTitle}>Medical Information</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Blood Type</Text>
                        <Text style={styles.value}>{userProfile?.bloodType || 'Not set'}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Allergies</Text>
                        <Text style={styles.value}>{userProfile?.allergies || 'None'}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Medications</Text>
                        <Text style={styles.value}>{userProfile?.medications || 'None'}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>Medical Conditions</Text>
                        <Text style={styles.value}>{userProfile?.conditions || 'None'}</Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.editButton, styles.logoutButton]}
                onPress={handleLogout}
            >
                <Text style={styles.editButtonText}>Logout</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    profilePicture: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 16,
        borderWidth: 3,
        borderColor: '#0056b3',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    email: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    section: {
        marginBottom: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginLeft: 8,
    },
    infoItem: {
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 12,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    value: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    editButton: {
        backgroundColor: '#0056b3',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 32,
    },
    editButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    logoutButton: {
        backgroundColor: '#dc3545',  // Red color for logout
        marginBottom: 32,
    },
}); 