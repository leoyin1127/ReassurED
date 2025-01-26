import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList, Dimensions, TouchableOpacity, Platform, Alert, Linking, RefreshControl } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { locationService } from '../services/locationService';
import { useAuthContext } from '../context/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import {
    fetchHospitals,
    formatTime,
    getSortedHospitals,
    formatHospitalStats
} from '../services/hospitalService';
import { TRIAGE_LEVELS, getTriageLevelTimes, getTriageLevelColor } from '../services/triageService';

export function HospitalRecommendationScreen({ navigation, route }) {
    const { userProfile } = useAuthContext();
    const [selectedHospital, setSelectedHospital] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
    const [region, setRegion] = useState({
        latitude: 45.5017,
        longitude: -73.5673,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedHospital, setExpandedHospital] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const requestLocationPermission = async () => {
        try {
            const servicesEnabled = await locationService.checkLocationServices();
            if (!servicesEnabled) return false;

            const permissionGranted = await locationService.requestPermissions();
            if (!permissionGranted) {
                setLocationPermissionDenied(true);
                Alert.alert(
                    'Location Permission Required',
                    'ReassurED needs access to your location to find nearby hospitals. Please enable location access in Settings.',
                    [
                        {
                            text: 'Open Settings',
                            onPress: () => Platform.OS === 'ios'
                                ? Linking.openURL('app-settings:')
                                : Linking.openSettings()
                        },
                        { text: 'Cancel', style: 'cancel' }
                    ]
                );
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error requesting location permission:', error);
            Alert.alert(
                'Error',
                'There was an error requesting location permissions. Please try again.'
            );
            return false;
        }
    };

    const getCurrentLocation = async () => {
        try {
            const userLoc = await locationService.getCurrentLocation();
            setUserLocation(userLoc);
            setRegion({
                ...userLoc,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            });

            if (userProfile?.auth0Id) {
                await locationService.saveUserLocation(userProfile.auth0Id, userLoc);
            }
        } catch (error) {
            Alert.alert(
                'Location Error',
                'Unable to get your current location. Please check your location settings and try again.'
            );
        }
    };

    useEffect(() => {
        (async () => {
            const hasPermission = await requestLocationPermission();
            if (hasPermission) {
                await getCurrentLocation();
            }
        })();
    }, []);

    useEffect(() => {
        const loadHospitals = async () => {
            try {
                console.log('Starting to load hospitals...');
                const hospitalsData = await fetchHospitals();
                console.log('Fetched hospitals:', hospitalsData);

                const sortedHospitals = getSortedHospitals(
                    hospitalsData,
                    route.params?.triageLevel,
                    userLocation
                );
                console.log('Sorted hospitals:', sortedHospitals);

                setHospitals(sortedHospitals);
            } catch (error) {
                console.error('Error in loadHospitals:', error);
                Alert.alert('Error', 'Failed to load hospitals. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        loadHospitals();
    }, [userLocation, route.params?.triageLevel]);

    const handleRetry = async () => {
        setLocationPermissionDenied(false);
        const hasPermission = await requestLocationPermission();
        if (hasPermission) {
            await getCurrentLocation();
        }
    };

    const handleSelectHospital = (hospital) => {
        setSelectedHospital(hospital);
        setRegion({
            ...hospital.coordinate,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        });
    };

    const handleConfirmHospital = () => {
        if (selectedHospital) {
            navigation.navigate('Status', { hospital: selectedHospital });
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            const hospitalsData = await fetchHospitals();
            const sortedHospitals = getSortedHospitals(
                hospitalsData,
                route.params?.triageLevel,
                userLocation
            );
            setHospitals(sortedHospitals);
        } catch (error) {
            Alert.alert('Error', 'Failed to refresh hospital data. Please try again.');
        } finally {
            setRefreshing(false);
        }
    };

    const renderHospitalItem = ({ item }) => {
        const isExpanded = expandedHospital === item.id;
        const stats = formatHospitalStats(item, route.params?.triageLevel);
        const triageLevels = getTriageLevelTimes(item);

        return (
            <TouchableOpacity
                style={styles.hospitalCard}
                onPress={() => setExpandedHospital(isExpanded ? null : item.id)}
            >
                <View style={styles.hospitalHeader}>
                    <Text style={styles.hospitalName}>{item.name}</Text>
                    <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="#666"
                    />
                </View>

                <View style={styles.basicInfo}>
                    <View style={styles.infoRow}>
                        <Ionicons name="time-outline" size={16} color="#666" />
                        <Text style={styles.infoText}>
                            Total Est. Time: {stats.estimatedTotalTime}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="medical-outline" size={16} color="#666" />
                        <Text style={styles.infoText}>
                            Your Level Wait: {stats.userTriageWaitTime}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="analytics-outline" size={16} color="#666" />
                        <Text style={styles.infoText}>
                            Avg. Wait: {stats.avgWaitingTime}
                        </Text>
                    </View>
                </View>

                {isExpanded && (
                    <View style={styles.expandedInfo}>
                        <Text style={styles.sectionTitle}>Detailed Information</Text>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Address:</Text>
                            <Text style={styles.detailValue}>{item.address}</Text>
                        </View>

                        <Text style={styles.sectionTitle}>Current Triage Levels (mins)</Text>
                        <View style={styles.triageLevelsContainer}>
                            {triageLevels.map(([level, time]) => {
                                const levelColor = getTriageLevelColor(level);
                                return (
                                    <View key={level} style={styles.triageRow}>
                                        <View style={[
                                            styles.triageColorIndicator,
                                            { backgroundColor: levelColor }
                                        ]} />
                                        <Text style={styles.triageText}>
                                            {level}: {time} mins
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>

                        <Text style={styles.sectionTitle}>Hospital Statistics</Text>
                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Stretcher Occupancy:</Text>
                                <Text style={styles.statValue}>{stats.stretcherOccupancy}</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Total Waiting:</Text>
                                <Text style={styles.statValue}>{stats.totalPeople} people</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Avg. Waiting Room Time:</Text>
                                <Text style={styles.statValue}>{stats.avgWaitingTime}</Text>
                            </View>
                        </View>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    if (locationPermissionDenied) {
        return (
            <View style={styles.container}>
                <View style={styles.messageContainer}>
                    <Text style={styles.messageText}>
                        Location access is required to find nearby hospitals.
                        Please enable location access in your device settings.
                    </Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={handleRetry}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.mapContainer}>
                <MapView
                    style={styles.map}
                    region={region}
                    showsUserLocation={true}
                >
                    {hospitals.map((hospital) => (
                        <Marker
                            key={hospital.id}
                            coordinate={hospital.coordinate}
                            title={hospital.name}
                            description={`Wait time: ${hospital.waitTime}`}
                            pinColor={selectedHospital?.id === hospital.id ? '#0056b3' : 'red'}
                            onPress={() => handleSelectHospital(hospital)}
                        >
                            <View style={styles.markerContainer}>
                                <Ionicons
                                    name="medical"
                                    size={24}
                                    color={selectedHospital?.id === hospital.id ? '#0056b3' : 'red'}
                                />
                            </View>
                        </Marker>
                    ))}
                    {userLocation && (
                        <Marker
                            coordinate={userLocation}
                            title="You are here"
                        >
                            <View style={styles.userMarker}>
                                <View style={styles.userDot} />
                            </View>
                        </Marker>
                    )}
                </MapView>
                <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={onRefresh}
                >
                    <Ionicons
                        name="refresh"
                        size={24}
                        color="#fff"
                        style={[
                            styles.refreshIcon,
                            refreshing && styles.refreshingIcon
                        ]}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.listContainer}>
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>Nearby Hospitals</Text>
                    <Text style={styles.lastUpdated}>
                        Last updated: {new Date().toLocaleTimeString()}
                    </Text>
                </View>
                <FlatList
                    data={hospitals}
                    keyExtractor={(item) => item.id}
                    renderItem={renderHospitalItem}
                    style={styles.list}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#0056b3"
                            colors={['#0056b3']}
                        />
                    }
                />
                {selectedHospital && (
                    <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={handleConfirmHospital}
                    >
                        <Text style={styles.confirmButtonText}>
                            Confirm {selectedHospital.name}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    mapContainer: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    listContainer: {
        flex: 1,
        padding: 16,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    lastUpdated: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
    },
    list: {
        flex: 1,
    },
    hospitalCard: {
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
    hospitalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    hospitalName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
        flex: 1,
    },
    basicInfo: {
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    infoText: {
        marginLeft: 8,
        color: '#666',
        fontSize: 14,
    },
    expandedInfo: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 8,
        marginTop: 12,
    },
    detailRow: {
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 14,
        color: '#2c3e50',
    },
    triageLevelsContainer: {
        marginTop: 8,
    },
    triageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    triageColorIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    triageText: {
        fontSize: 14,
        color: '#2c3e50',
        flex: 1,
    },
    statsContainer: {
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    statItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
    },
    statValue: {
        fontSize: 14,
        color: '#2c3e50',
        fontWeight: '500',
    },
    markerContainer: {
        padding: 4,
        backgroundColor: 'white',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    userMarker: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(0, 86, 179, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#0056b3',
    },
    confirmButton: {
        backgroundColor: '#0056b3',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    messageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    messageText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        color: '#666',
    },
    retryButton: {
        backgroundColor: '#0056b3',
        padding: 12,
        borderRadius: 8,
        minWidth: 120,
        alignItems: 'center',
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    refreshButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: '#0056b3',
        borderRadius: 30,
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    refreshIcon: {
        opacity: 0.9,
    },
    refreshingIcon: {
        transform: [{ rotate: '45deg' }],
    },
}); 