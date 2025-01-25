import React from 'react';
import { useAuth } from '../hooks/useAuth';

export const AuthContext = React.createContext(null);

export function AuthProvider({ children }) {
    const auth = useAuth();

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuthContext = () => React.useContext(AuthContext); 