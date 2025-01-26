/**
 * Constants for triage levels and their visual representation
 */
export const TRIAGE_LEVELS = {
    LEVEL_I: {
        id: 'LEVEL_I',
        color: '#0000FF', // Blue
        label: 'Level I - Resuscitation',
        description: 'Critical condition requiring immediate life-saving interventions',
        clinicalDescription: 'Immediate threat to airway, breathing, or circulation',
        waitTime: 'Immediate Medical Intervention',
        colorName: 'Blue',
        painThreshold: 9
    },
    LEVEL_II: {
        id: 'LEVEL_II',
        color: '#FF0000', // Red
        label: 'Level II - Emergent',
        description: 'High-risk condition requiring rapid medical intervention',
        clinicalDescription: 'Potentially life-threatening condition requiring immediate assessment',
        waitTime: '10-15 minutes maximum',
        colorName: 'Red',
        painThreshold: 7
    },
    LEVEL_III: {
        id: 'LEVEL_III',
        color: '#FFD700', // Yellow
        label: 'Level III - Urgent',
        description: 'Acute condition requiring timely intervention',
        clinicalDescription: 'Stable vital signs with serious symptoms requiring prompt treatment',
        waitTime: '30-60 minutes target',
        colorName: 'Yellow',
        painThreshold: 5
    },
    LEVEL_IV: {
        id: 'LEVEL_IV',
        color: '#008000', // Green
        label: 'Level IV - Semi-Urgent',
        description: 'Sub-acute condition requiring non-immediate intervention',
        clinicalDescription: 'Stable condition with moderate symptoms',
        waitTime: '1-2 hours acceptable',
        colorName: 'Green',
        painThreshold: 3
    },
    LEVEL_V: {
        id: 'LEVEL_V',
        color: '#FFFFFF', // White
        borderColor: '#000000',
        label: 'Level V - Non-Urgent',
        description: 'Chronic or minor condition suitable for routine care',
        clinicalDescription: 'Stable condition with minor symptoms',
        waitTime: '2-4 hours acceptable',
        colorName: 'White',
        painThreshold: 0
    }
};

/**
 * Gets triage level wait times for a hospital
 * @param {Object} hospital - Hospital object
 * @returns {Array} Array of triage level objects with times
 */
export const getTriageLevelTimes = (hospital) => {
    return [
        ['Level I', Math.round(hospital.triage_level_1 || 0)],
        ['Level II', Math.round(hospital.triage_level_2 || 0)],
        ['Level III', Math.round(hospital.triage_level_3 || 0)],
        ['Level IV', Math.round(hospital.triage_level_4 || 0)],
        ['Level V', Math.round(hospital.triage_level_5 || 0)],
    ];
};

/**
 * Gets the color for a triage level
 * @param {string} level - Triage level (e.g., "Level I")
 * @returns {string} Color code
 */
export const getTriageLevelColor = (level) => {
    const levelNumber = level.split(' ')[1];
    const triageLevel = TRIAGE_LEVELS[`LEVEL_${levelNumber}`];
    return triageLevel ? triageLevel.color : '#CCCCCC'; // Fallback color if level not found
}; 