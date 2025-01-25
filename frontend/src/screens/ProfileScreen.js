import React from 'react';
import { View, Text, Button } from 'react-native';
import { useAuthContext } from '../App';

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
        <View>
            <Text>Welcome {userProfile?.name}</Text>
            <Text>Email: {userProfile?.email}</Text>
            <Text>Bio: {userProfile?.bio}</Text>
            <Button title="Update Profile" onPress={handleUpdateProfile} />
            <Button title="Logout" onPress={logout} />
        </View>
    );
} 