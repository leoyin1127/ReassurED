import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Formats hospital data from Firestore to match component requirements
 */
const formatHospitalData = (hospital, index) => {
    // Default coordinates for Montreal hospitals
    const montrealCoordinates = [
        { latitude: 45.4961, longitude: -73.6307 }, // Albert-Prévost
        { latitude: 45.4619, longitude: -73.5702 }, // Douglas
        // Add more default coordinates as needed
    ];

    return {
        id: index.toString(),
        name: hospital.name || 'Unknown Hospital',
        address: hospital.address || '',
        coordinate: montrealCoordinates[index] || {
            latitude: 45.5017,
            longitude: -73.5673
        },
        estimated_waiting_time: hospital.estimated_waiting_time || 'N/A',
        travel_time: parseInt(hospital.travel_time) || 0,
        triage_level_1: Math.round(hospital.triage_level_1) || 0,
        triage_level_2: Math.round(hospital.triage_level_2) || 0,
        triage_level_3: Math.round(hospital.triage_level_3) || 0,
        triage_level_4: Math.round(hospital.triage_level_4) || 0,
        triage_level_5: Math.round(hospital.triage_level_5) || 0,
        stretcher_occupancy: hospital.stretcher_occupancy || '0%',
        avg_waiting_room_time: hospital.avg_waiting_room_time || 'N/A',
        total_people: parseInt(hospital.total_people) || 0,
        avg_stretcher_time: hospital.avg_stretcher_time || 'N/A',
        waiting_count: parseInt(hospital.waiting_count) || 0
    };
};

/**
 * Fetches and formats hospital data from Firestore
 */
export const fetchHospitals = async () => {
    try {
        // Get the hospital document that contains the hospitals array
        const hospitalDoc = doc(db, 'hospital', 'filteredHospitals');
        const snapshot = await getDoc(hospitalDoc);

        if (!snapshot.exists()) {
            console.log('No hospital data found');
            return [];
        }

        const data = snapshot.data();
        console.log('Raw Firestore data:', data);

        // Access the hospitals array from the document
        const hospitalsArray = data.hospitals || [];

        // Format each hospital in the array
        const formattedHospitals = hospitalsArray.map((hospital, index) =>
            formatHospitalData(hospital, index)
        );

        console.log('Formatted hospitals data:', formattedHospitals);
        return formattedHospitals;

    } catch (error) {
        console.error('Error fetching hospitals:', error);
        throw error;
    }
};

/**
 * Formats time from seconds to minutes with appropriate unit
 */
export const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const minutes = Math.round(seconds / 60);
    return `${minutes} min`;
};

/**
 * Formats hospital statistics for display
 */
export const formatHospitalStats = (hospital, userTriageLevel) => {
    const triageLevelMap = {
        'LEVEL_I': hospital.triage_level_1,
        'LEVEL_II': hospital.triage_level_2,
        'LEVEL_III': hospital.triage_level_3,
        'LEVEL_IV': hospital.triage_level_4,
        'LEVEL_V': hospital.triage_level_5,
    };

    const userLevelTime = triageLevelMap[userTriageLevel];
    const totalWaitTime = (userLevelTime || 0) +
        (parseInt(hospital.travel_time) || 0) +
        (parseTimeStringToMinutes(hospital.estimated_waiting_time) || 0);

    return {
        waitingCount: hospital.waiting_count?.toString() || '0',
        stretcherOccupancy: hospital.stretcher_occupancy || 'N/A',
        avgWaitingTime: hospital.avg_waiting_room_time || 'N/A',
        totalPeople: hospital.total_people?.toString() || '0',
        estimatedTotalTime: `${Math.round(totalWaitTime)} min`,
        userTriageWaitTime: userLevelTime ? `${Math.round(userLevelTime)} min` : 'N/A'
    };
};

/**
 * Calculates and sorts hospitals by relevance
 * @param {Array} hospitals - Array of hospital objects
 * @param {string} triageLevel - User's triage level (e.g., 'LEVEL_I')
 * @param {Object} userLocation - User's current location
 * @returns {Array} Sorted hospitals array
 */
export const getSortedHospitals = (hospitals, triageLevel, userLocation) => {
    if (!hospitals || !triageLevel) return hospitals || [];

    return [...hospitals].sort((a, b) => {
        // Get the specific triage level wait time
        const getTriageTime = (hospital, level) => {
            const triageLevelMap = {
                'LEVEL_I': hospital.triage_level_1,
                'LEVEL_II': hospital.triage_level_2,
                'LEVEL_III': hospital.triage_level_3,
                'LEVEL_IV': hospital.triage_level_4,
                'LEVEL_V': hospital.triage_level_5,
            };
            return triageLevelMap[level] || 0;
        };

        // Calculate total waiting time (triage level time + travel time + current estimated wait)
        const calculateTotalTime = (hospital) => {
            const triageTime = getTriageTime(hospital, triageLevel);
            const travelTime = parseInt(hospital.travel_time) || 0;
            const estimatedWait = parseTimeStringToMinutes(hospital.estimated_waiting_time) || 0;
            return triageTime + travelTime + estimatedWait;
        };

        const aTotal = calculateTotalTime(a);
        const bTotal = calculateTotalTime(b);

        return aTotal - bTotal;
    });
};

/**
 * Convert time string (HH:mm) to minutes
 * @param {string} timeString - Time in format "HH:mm" or "mm:ss"
 * @returns {number} Total minutes
 */
const parseTimeStringToMinutes = (timeString) => {
    if (!timeString || timeString === 'N/A') return 0;

    const [hours, minutes] = timeString.split(':').map(Number);
    return (hours * 60) + minutes;
}; 