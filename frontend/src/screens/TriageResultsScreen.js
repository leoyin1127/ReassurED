import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export function TriageResultsScreen({ route, navigation }) {
    const { symptom, painLevel, duration } = route.params || {};
    const isCritical = parseInt(painLevel, 10) > 8;

    const handleCritical = () => {
        // Implement emergency call logic
        console.log('Emergency services contacted');
    };

    const handleNonCritical = () => {
        navigation.navigate('HospitalRecommendation', { symptom });
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Triage Results</Text>

                <View style={styles.summaryContainer}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.label}>Reported Symptom</Text>
                        <Text style={styles.value}>{symptom}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.label}>Pain Level</Text>
                        <Text style={styles.value}>{painLevel}/10</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.label}>Duration</Text>
                        <Text style={styles.value}>{duration}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.subtitle}>Recommendation</Text>
                <View style={[styles.urgencyBox, isCritical ? styles.criticalUrgency : styles.moderateUrgency]}>
                    <Text style={styles.urgencyText}>
                        {isCritical
                            ? 'High Urgency - Immediate Medical Attention Required!'
                            : 'Moderate Urgency - Medical Evaluation Recommended'}
                    </Text>
                </View>

                <TouchableOpacity
                    style={[styles.button, isCritical && styles.emergencyButton]}
                    onPress={isCritical ? handleCritical : handleNonCritical}
                >
                    <Text style={styles.buttonText}>
                        {isCritical ? 'Call Emergency Services' : 'Find Nearby Hospitals'}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    subtitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 16,
        color: '#333',
    },
    summaryContainer: {
        marginBottom: 16,
    },
    summaryItem: {
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    value: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    urgencyBox: {
        padding: 16,
        borderRadius: 8,
        marginBottom: 20,
    },
    criticalUrgency: {
        backgroundColor: '#ffebee',
        borderWidth: 1,
        borderColor: '#ef5350',
    },
    moderateUrgency: {
        backgroundColor: '#fff3e0',
        borderWidth: 1,
        borderColor: '#ff9800',
    },
    urgencyText: {
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '600',
    },
    button: {
        backgroundColor: '#0056b3',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    emergencyButton: {
        backgroundColor: '#dc3545',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
}); 