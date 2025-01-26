import { db } from '../config/firebase';
import { doc, updateDoc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';

export const symptomService = {
    // Save symptoms under user's document
    saveSymptoms: async (auth0Id, symptomData) => {
        try {
            console.log('Saving symptoms for auth0Id:', auth0Id);
            console.log('Symptom data:', symptomData);

            // Reference to the auth0 user's symptoms collection
            const symptomsCollectionRef = collection(db, 'auth0Users', auth0Id, 'symptoms');
            const newSymptomRef = doc(symptomsCollectionRef);

            // Format the symptom data with additional fields
            const formattedSymptomData = {
                ...symptomData,
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                status: 'active'
            };

            // Set the symptom document
            await setDoc(newSymptomRef, formattedSymptomData);

            console.log('Successfully saved symptom with ID:', newSymptomRef.id);
            return newSymptomRef.id;
        } catch (error) {
            console.error('Error saving symptoms:', error);
            console.error('Error details:', error.message);
            throw error;
        }
    },

    // Get user's symptoms
    getUserSymptoms: async (auth0Id) => {
        try {
            const symptomsCollectionRef = collection(db, 'auth0Users', auth0Id, 'symptoms');
            const symptomsSnapshot = await getDocs(symptomsCollectionRef);

            return symptomsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting user symptoms:', error);
            throw error;
        }
    },

    // Update symptom status
    updateSymptomStatus: async (auth0Id, symptomId, newStatus) => {
        try {
            const symptomRef = doc(db, 'auth0Users', auth0Id, 'symptoms', symptomId);

            await updateDoc(symptomRef, {
                status: newStatus,
                lastUpdated: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error updating symptom status:', error);
            throw error;
        }
    }
}; 