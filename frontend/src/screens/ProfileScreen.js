import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useAuthContext } from '../context/AuthContext';

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

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Image
                    source={{ uri: userProfile?.picture }}
                    style={styles.profilePicture}
                />
                <Text style={styles.name}>{userProfile?.name}</Text>
                <Text style={styles.email}>{userProfile?.email}</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Bio</Text>
                <Text style={styles.bio}>{userProfile?.bio || 'No bio added yet'}</Text>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.updateButton}
                    onPress={handleUpdateProfile}
                >
                    <Text style={styles.buttonText}>Update Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={logout}
                >
                    <Text style={styles.buttonText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f8f9fa',
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
    content: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        color: '#333',
    },
    bio: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
    },
    footer: {
        padding: 20,
    },
    updateButton: {
        backgroundColor: '#0056b3',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    logoutButton: {
        backgroundColor: '#dc3545',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
}); 