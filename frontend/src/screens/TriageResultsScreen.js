import React from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';

export function TriageResultsScreen({ route, navigation }) {
    const { symptom, painLevel, duration } = route.params || {};

    // For demonstration, let's do a simple "critical" check
    const isCritical = parseInt(painLevel, 10) > 8; // or any custom logic

    const handleCritical = () => {
        Alert.alert('Notice', 'Calling 911...', [
            { text: 'OK', onPress: () => console.log('Call 911') },
        ]);
    };

    const handleNonCritical = () => {
        navigation.navigate('HospitalRecommendation', { symptom });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Triage Results</Text>

            <View style={styles.resultsBox}>
                {isCritical ? (
                    <Text style={styles.urgencyText}>High Urgency!</Text>
                ) : (
                    <Text style={styles.urgencyText}>
                        Moderate urgency. Evaluation recommended soon.
                    </Text>
                )}
            </View>

            {isCritical ? (
                <Button
                    title="Call 911 Now"
                    onPress={handleCritical}
                    color="#dc3545"
                />
            ) : (
                <Button
                    title="Find Nearby Hospitals"
                    onPress={handleNonCritical}
                    color="#0056b3"
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    title: {
        fontSize: 22,
        marginBottom: 20,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    resultsBox: {
        marginBottom: 30,
        alignItems: 'center',
    },
    urgencyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
}); 