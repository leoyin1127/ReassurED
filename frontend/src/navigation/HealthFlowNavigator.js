import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import your screens
import { SymptomCheckerScreen } from '../screens/SymptomCheckerScreen';
import { TriageResultsScreen } from '../screens/TriageResultsScreen';
import { HospitalRecommendationScreen } from '../screens/HospitalRecommendationScreen';

const Stack = createStackNavigator();

export function HealthFlowNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="SymptomChecker"
                component={SymptomCheckerScreen}
                options={{ headerTitle: 'Symptom Checker' }}
            />

            <Stack.Screen
                name="TriageResults"
                component={TriageResultsScreen}
                options={{ headerTitle: 'Triage Results' }}
            />

            <Stack.Screen
                name="HospitalRecommendation"
                component={HospitalRecommendationScreen}
                options={{ headerTitle: 'Hospital Recommendation' }}
            />
        </Stack.Navigator>
    );
} 