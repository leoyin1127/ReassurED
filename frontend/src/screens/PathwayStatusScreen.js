import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export function PathwayStatusScreen({ route }) {
    const { hospital } = route.params || {};

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Current Care Status</Text>
                <View style={styles.statusContainer}>
                    <View style={styles.statusItem}>
                        <Text style={styles.label}>Location</Text>
                        <Text style={styles.value}>{hospital?.name || 'Not Selected'}</Text>
                    </View>
                    <View style={styles.statusItem}>
                        <Text style={styles.label}>Queue Position</Text>
                        <Text style={styles.value}>#3</Text>
                    </View>
                    <View style={styles.statusItem}>
                        <Text style={styles.label}>Estimated Wait</Text>
                        <Text style={styles.value}>{hospital?.waitTime || 'Unknown'}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.timelineCard}>
                <Text style={styles.subtitle}>Care Timeline</Text>
                <View style={styles.timeline}>
                    <View style={[styles.timelineItem, styles.completed]}>
                        <Text style={styles.timelineText}>Check-in Complete</Text>
                        <Text style={styles.timelineTime}>2:30 PM</Text>
                    </View>
                    <View style={[styles.timelineItem, styles.active]}>
                        <Text style={styles.timelineText}>Waiting for Triage</Text>
                        <Text style={styles.timelineTime}>Current</Text>
                    </View>
                    <View style={styles.timelineItem}>
                        <Text style={styles.timelineText}>Doctor Consultation</Text>
                        <Text style={styles.timelineTime}>Pending</Text>
                    </View>
                    <View style={styles.timelineItem}>
                        <Text style={styles.timelineText}>Treatment</Text>
                        <Text style={styles.timelineTime}>Pending</Text>
                    </View>
                </View>
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
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    statusItem: {
        minWidth: '30%',
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
    timelineCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    subtitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 16,
        color: '#333',
    },
    timeline: {
        paddingLeft: 8,
    },
    timelineItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderLeftWidth: 2,
        borderLeftColor: '#ddd',
    },
    completed: {
        borderLeftColor: '#4CAF50',
    },
    active: {
        borderLeftColor: '#2196F3',
    },
    timelineText: {
        fontSize: 16,
        color: '#333',
    },
    timelineTime: {
        fontSize: 14,
        color: '#666',
    },
}); 