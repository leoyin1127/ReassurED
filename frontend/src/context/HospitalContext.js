import React, { createContext, useContext, useState } from 'react';

const HospitalContext = createContext();

export function HospitalProvider({ children }) {
    const [selectedHospital, setSelectedHospital] = useState(null);
    const [triageLevel, setTriageLevel] = useState(null);

    return (
        <HospitalContext.Provider value={{
            selectedHospital,
            setSelectedHospital,
            triageLevel,
            setTriageLevel
        }}>
            {children}
        </HospitalContext.Provider>
    );
}

export function useHospitalContext() {
    return useContext(HospitalContext);
} 