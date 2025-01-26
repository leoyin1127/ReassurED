import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHospitalContext } from '../context/HospitalContext';
import { formatHospitalStats } from '../services/hospitalService';

export function PathwayStatusScreen() {
    const { selectedHospital, triageLevel } = useHospitalContext();
    const stats = selectedHospital ? formatHospitalStats(selectedHospital, triageLevel) : null;

    if (!selectedHospital) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text style={styles.noDataText}>No hospital selected</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Status Card */}
            <View style={styles.card}>
                <Text style={styles.title}>Current Care Status</Text>
                <View style={styles.statusContainer}>
                    <View style={styles.statusItem}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="location" size={20} color="#0056b3" />
                        </View>
                        <View style={styles.statusContent}>
                            <Text style={styles.label}>Location</Text>
                            <Text style={styles.value}>{selectedHospital?.name || 'Not Selected'}</Text>
                            <Text style={styles.address}>{selectedHospital?.address}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.statusItem}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="people" size={20} color="#0056b3" />
                        </View>
                        <View style={styles.statusContent}>
                            <Text style={styles.label}>Queue Position</Text>
                            <Text style={styles.value}>#{selectedHospital?.waiting_count || '0'}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.statusItem}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="time" size={20} color="#0056b3" />
                        </View>
                        <View style={styles.statusContent}>
                            <Text style={styles.label}>Estimated Wait</Text>
                            <Text style={styles.value}>{stats?.estimatedTotalTime || 'Unknown'}</Text>
                            <View style={styles.timeBreakdown}>
                                <Text style={styles.timeDetail}>
                                    <Ionicons name="car-outline" size={12} color="#666" /> Travel: {stats?.travelTime || 'N/A'}
                                </Text>
                                <Text style={styles.timeDetail}>
                                    <Ionicons name="hourglass-outline" size={12} color="#666" /> Wait: {stats?.userTriageWaitTime || 'N/A'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* Hospital Stats Card */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Ionicons name="stats-chart" size={24} color="#0056b3" />
                    <Text style={styles.subtitle}>Hospital Statistics</Text>
                </View>
                <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Waiting</Text>
                        <Text style={styles.statValue}>{stats?.waitingCount}</Text>
                        <Text style={styles.statUnit}>patients</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Occupancy</Text>
                        <Text style={styles.statValue}>{stats?.stretcherOccupancy}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Avg. Wait</Text>
                        <Text style={styles.statValue}>{stats?.avgWaitingTime}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Avg. Stay</Text>
                        <Text style={styles.statValue}>{stats?.avgStretcherTime}</Text>
                    </View>
                </View>
            </View>

            {/* Timeline Card */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Ionicons name="git-branch" size={24} color="#0056b3" />
                    <Text style={styles.subtitle}>Care Timeline</Text>
                </View>
                <View style={styles.timeline}>
                    {[
                        { status: 'completed', text: 'Check-in Complete', time: '2:30 PM', icon: 'checkmark-circle' },
                        { status: 'active', text: 'Waiting for Triage', time: 'Current', icon: 'time' },
                        { status: 'pending', text: 'Doctor Consultation', time: 'Pending', icon: 'medical' },
                        { status: 'pending', text: 'Treatment', time: 'Pending', icon: 'bandage' }
                    ].map((item, index) => (
                        <View key={index} style={styles.timelineItem}>
                            <View style={[styles.timelineDot, styles[item.status]]}>
                                <Ionicons name={item.icon} size={16} color={item.status === 'pending' ? '#666' : '#fff'} />
                            </View>
                            <View style={styles.timelineContent}>
                                <Text style={[styles.timelineText, styles[`${item.status}Text`]]}>
                                    {item.text}
                                </Text>
                                <Text style={styles.timelineTime}>{item.time}</Text>
                            </View>
                            {index < 3 && <View style={[styles.timelineLine, styles[`${item.status}Line`]]} />}
                        </View>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        margin: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 20,
    },
    statusContainer: {
        gap: 16,
    },
    statusItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#e3f2fd',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    statusContent: {
        flex: 1,
    },
    divider: {
        height: 1,
        backgroundColor: '#e1e4e8',
        marginVertical: 8,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    value: {
        fontSize: 18,
        color: '#2c3e50',
        fontWeight: '600',
    },
    address: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
    timeBreakdown: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
    },
    timeDetail: {
        fontSize: 13,
        color: '#666',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 12,
    },
    subtitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#2c3e50',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    statBox: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0056b3',
    },
    statUnit: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    timeline: {
        paddingLeft: 8,
    },
    timelineItem: {
        position: 'relative',
        paddingLeft: 30,
        marginBottom: 24,
    },
    timelineDot: {
        position: 'absolute',
        left: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#d3d3d3',
    },
    timelineLine: {
        position: 'absolute',
        left: 15,
        top: 32,
        width: 2,
        height: 40,
        backgroundColor: '#d3d3d3',
    },
    timelineContent: {
        marginLeft: 12,
    },
    timelineText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 4,
    },
    timelineTime: {
        fontSize: 14,
        color: '#666',
    },
    completed: {
        backgroundColor: '#4caf50',
    },
    active: {
        backgroundColor: '#0056b3',
    },
    pending: {
        backgroundColor: '#f5f5f5',
    },
    completedText: {
        color: '#4caf50',
    },
    activeText: {
        color: '#0056b3',
    },
    pendingText: {
        color: '#666',
    },
    completedLine: {
        backgroundColor: '#4caf50',
    },
    activeLine: {
        backgroundColor: '#0056b3',
    },
    pendingLine: {
        backgroundColor: '#d3d3d3',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    noDataText: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
    },
}); 