import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const userService = {
    // Create or update user profile
    async saveUserProfile(auth0UserId, userData) {
        try {
            const userRef = doc(db, 'users', auth0UserId);
            await setDoc(userRef, {
                ...userData,
                lastUpdated: new Date().toISOString(),
            }, { merge: true });
        } catch (error) {
            console.error('Error saving user profile:', error);
            throw error;
        }
    },

    // Get user profile
    async getUserProfile(auth0UserId) {
        try {
            const userRef = doc(db, 'users', auth0UserId);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                return userSnap.data();
            }
            return null;
        } catch (error) {
            console.error('Error getting user profile:', error);
            throw error;
        }
    },

    // Update specific user fields
    async updateUserProfile(auth0UserId, updates) {
        try {
            const userRef = doc(db, 'users', auth0UserId);
            await updateDoc(userRef, {
                ...updates,
                lastUpdated: new Date().toISOString(),
            });
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    }
}; 