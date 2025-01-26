import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Formats hospital data from Firestore to match component requirements
 */
const formatHospitalData = (hospital, index) => {
    return {
        id: index.toString(),
        name: hospital.name || 'Unknown Hospital',
        address: hospital.address || '',
        coordinate: {
            latitude: hospital.Lat || 45.5017,
            longitude: hospital.Lng || -73.5673
        },
        // All time values are in minutes
        avg_stretcher_time: Math.round(hospital.avg_stretcher_time) || 0,
        avg_waiting_room_time: Math.round(hospital.avg_waiting_room_time) || 0,
        estimated_waiting_time: Math.round(hospital.estimated_waiting_time) || 0,
        travel_time: Math.round(hospital.travel_time) || 0,
        // Triage level times (in minutes)
        triage_level_1: Math.round(hospital.triage_level_1) || 0,
        triage_level_2: Math.round(hospital.triage_level_2) || 0,
        triage_level_3: Math.round(hospital.triage_level_3) || 0,
        triage_level_4: Math.round(hospital.triage_level_4) || 0,
        triage_level_5: Math.round(hospital.triage_level_5) || 0,
        stretcher_occupancy: `${hospital.stretcher_occupancy}%` || '0%',
        total_people: hospital.total_people?.toString() || '0',
        total_waiting_time: Math.round(hospital.total_waiting_time) || 0,
        waiting_count: hospital.waiting_count?.toString() || '0'
    };
};

/**
 * Format minutes for display
 */
const formatMinutes = (minutes) => {
    if (!minutes) return 'N/A';

    if (minutes >= 60) {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m`;
    }

    return `${minutes}m`;
};

/**
 * Fetches and formats hospital data from Firestore
 */
export const fetchHospitals = async () => {
    try {
        const hospitalDoc = doc(db, 'hospital', 'filteredHospitals');
        const snapshot = await getDoc(hospitalDoc);

        if (!snapshot.exists()) {
            console.log('No hospital data found');
            return [];
        }

        const data = snapshot.data();
        console.log('Raw Firestore data:', data);

        const hospitalsArray = data.hospitals || [];
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
 * Formats time in minutes with appropriate unit
 */
export const formatTime = (minutes) => {
    if (!minutes) return 'N/A';
    return formatMinutes(minutes);
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

    const userLevelTime = triageLevelMap[userTriageLevel] || 0;
    const travelTime = hospital.travel_time || 0;

    // Calculate total journey time as travel time + level wait time
    const totalJourneyTime = travelTime + userLevelTime;

    return {
        waitingCount: hospital.waiting_count?.toString() || '0',
        stretcherOccupancy: hospital.stretcher_occupancy || '0%',
        avgWaitingTime: formatTime(hospital.avg_waiting_room_time),
        avgStretcherTime: formatTime(hospital.avg_stretcher_time),
        totalPeople: hospital.total_people?.toString() || '0',
        estimatedTotalTime: formatTime(totalJourneyTime), // Now just travel + level wait
        userTriageWaitTime: userLevelTime ? formatTime(userLevelTime) : 'N/A',
        travelTime: formatTime(travelTime)
    };
};

/**
 * Calculates and sorts hospitals by relevance
 */
export const getSortedHospitals = (hospitals, triageLevel, userLocation) => {
    if (!hospitals || !triageLevel) return hospitals || [];

    return [...hospitals].sort((a, b) => {
        // Get the relevant triage level wait time
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

        // Sort by travel time + triage level wait time
        const aTotalTime = (a.travel_time || 0) + getTriageTime(a, triageLevel);
        const bTotalTime = (b.travel_time || 0) + getTriageTime(b, triageLevel);

        return aTotalTime - bTotalTime;
    });
}; 