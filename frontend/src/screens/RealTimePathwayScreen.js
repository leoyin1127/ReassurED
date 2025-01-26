import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

export function RealTimePathwayScreen({ route }) {
    const { hospital } = route.params || {};

    // Example UI with a simple horizontal timeline (mocked)
    // In practice, consider a timeline package or custom step indicator
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Real-Time Pathway at {hospital?.name}</Text>

            <View style={styles.timelineContainer}>
                <Text style={styles.stepActive}>1. Triage</Text>
                <Text style={styles.step}>2. Labs</Text>
                <Text style={styles.step}>3. Doctor Consultation</Text>
                <Text style={styles.step}>4. Discharge</Text>
            </View>

            <Text style={styles.status}>
                Current Queue Status: <Text style={{ fontWeight: 'bold' }}>#3 in line</Text>
            </Text>
            <Text style={styles.status}>Estimated wait: 10 minutes</Text>

            <Button
                title="Done"
                onPress={() => console.log('User finished or exits app')}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    title: {
        fontSize: 22,
        marginBottom: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    timelineContainer: {
        marginBottom: 30,
        alignItems: 'flex-start',
    },
    step: {
        fontSize: 18,
        color: '#666',
        marginVertical: 4,
    },
    stepActive: {
        fontSize: 18,
        marginVertical: 4,
        fontWeight: 'bold',
        color: '#0056b3',
    },
    status: {
        fontSize: 16,
        marginBottom: 10,
    },
}); 