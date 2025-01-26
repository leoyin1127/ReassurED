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
import { useHospitalContext } from '../context/HospitalContext';

export function HospitalRecommendationScreen({ navigation, route }) {
    const { userProfile } = useAuthContext();
    const { setSelectedHospital, setTriageLevel } = useHospitalContext();
    const [selectedHospital, setSelectedHospitalState] = useState(null);
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
    const [cardHeight, setCardHeight] = useState(0);

    // Add ref for FlatList
    const listRef = React.useRef(null);

    // Add this ref at the top with other state declarations
    const cardHeightsRef = React.useRef({});

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
                // console.log('Fetched hospitals:', hospitalsData);

                const sortedHospitals = getSortedHospitals(
                    hospitalsData,
                    route.params?.triageLevel,
                    userLocation
                );
                // console.log('Sorted hospitals:', sortedHospitals);

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

    const updateMapRegion = (hospital) => {
        if (!userLocation || !hospital) return;

        setTimeout(() => {
            const newRegion = getRegionForCoordinates([
                userLocation,
                hospital.coordinate
            ]);
            setRegion(newRegion);
        }, 100);
    };

    // Update the measureCardHeight function
    const measureCardHeight = (event, hospitalId) => {
        const { height } = event.nativeEvent.layout;
        if (height > 0 && !cardHeightsRef.current[hospitalId]) {
            cardHeightsRef.current[hospitalId] = height;
            // Only update cardHeight state if it's the first measurement
            if (!cardHeight) {
                setCardHeight(height);
            }
        }
    };

    // Update handleSelectHospital function
    const handleSelectHospital = (hospital) => {
        // If clicking the same hospital, toggle expansion
        if (expandedHospital === hospital.id) {
            setExpandedHospital(null); // Collapse
        } else {
            setExpandedHospital(hospital.id); // Expand
        }

        setSelectedHospitalState(hospital);
        updateMapRegion(hospital);
        scrollToHospital(hospital);
    };

    const handleConfirmHospital = () => {
        if (selectedHospital) {
            setSelectedHospital(selectedHospital);
            setTriageLevel(route.params?.triageLevel);

            navigation.navigate('Status');
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

    const getRegionForCoordinates = (points) => {
        let minLat = points[0].latitude;
        let maxLat = points[0].latitude;
        let minLng = points[0].longitude;
        let maxLng = points[0].longitude;

        points.forEach(point => {
            minLat = Math.min(minLat, point.latitude);
            maxLat = Math.max(maxLat, point.latitude);
            minLng = Math.min(minLng, point.longitude);
            maxLng = Math.max(maxLng, point.longitude);
        });

        const midLat = (minLat + maxLat) / 2;
        const midLng = (minLng + maxLng) / 2;
        const deltaLat = (maxLat - minLat) * 1.5;
        const deltaLng = (maxLng - minLng) * 1.5;

        return {
            latitude: midLat,
            longitude: midLng,
            latitudeDelta: Math.max(deltaLat, 0.0122),
            longitudeDelta: Math.max(deltaLng, 0.0121),
        };
    };

    // Update the scrollToHospital function
    const scrollToHospital = (hospital) => {
        if (!listRef.current || !hospital) return;

        const index = hospitals.findIndex(h => h.id === hospital.id);
        if (index === -1) return;

        // Use a single attempt to scroll
        listRef.current.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0.3,
            viewOffset: 10,
        });
    };

    // Update the renderHospitalItem function
    const renderHospitalItem = React.useCallback(({ item }) => {
        const isExpanded = expandedHospital === item.id;
        const stats = formatHospitalStats(item, route.params?.triageLevel);
        const triageLevels = getTriageLevelTimes(item);
        const userTriageLevel = TRIAGE_LEVELS[route.params?.triageLevel];

        return (
            <View
                style={[
                    styles.hospitalCard,
                    selectedHospital?.id === item.id && styles.selectedHospitalCard
                ]}
                onLayout={(event) => measureCardHeight(event, item.id)}
            >
                <TouchableOpacity
                    style={styles.hospitalHeader}
                    onPress={() => handleSelectHospital(item)}
                >
                    <Text style={styles.hospitalName}>{item.name}</Text>
                    <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="#666"
                    />
                </TouchableOpacity>

                <View style={styles.basicInfo}>
                    {userTriageLevel && (
                        <View style={styles.triageLevelIndicator}>
                            <View style={[
                                styles.triageColorBadge,
                                { backgroundColor: userTriageLevel.color },
                                userTriageLevel.id === 'LEVEL_V' && { borderWidth: 1, borderColor: '#000' }
                            ]}>
                                <Text style={[
                                    styles.triageLevelText,
                                    userTriageLevel.id === 'LEVEL_V' && { color: '#000' }
                                ]}>
                                    Priority Level: {userTriageLevel.label}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* <View style={styles.algorithmScore}>
                        <Text style={styles.algorithmLabel}>Smart Routing Algorithm Score</Text>
                        <View style={styles.scoreContainer}>
                            <Ionicons name="analytics" size={20} color="#0056b3" />
                            <Text style={styles.scoreText}>98% Match</Text>
                        </View>
                    </View> */}

                    <View style={styles.timeBreakdown}>
                        <View style={styles.infoRow}>
                            <Ionicons name="navigate-outline" size={16} color="#666" />
                            <Text style={styles.infoText}>
                                Transit Duration: {formatTime(item.travel_time)}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="timer-outline" size={16} color="#666" />
                            <Text style={styles.infoText}>
                                Predicted Wait: {stats.userTriageWaitTime}
                            </Text>
                        </View>
                        <View style={styles.totalTimeRow}>
                            <Ionicons name="time" size={16} color="#0056b3" />
                            <Text style={styles.totalTimeText}>
                                Optimized Total Duration: {stats.estimatedTotalTime}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="analytics-outline" size={16} color="#666" />
                        <Text style={styles.infoText}>
                            Historical Avg. Wait: {stats.avgWaitingTime}
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
            </View>
        );
    }, [expandedHospital, selectedHospital, route.params?.triageLevel]);

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
                    {hospitals.map((hospital) => {
                        const stats = formatHospitalStats(hospital, route.params?.triageLevel);
                        const isSelected = selectedHospital?.id === hospital.id;

                        return (
                            <Marker
                                key={hospital.id}
                                coordinate={hospital.coordinate}
                                title={hospital.name}
                                description={`Total Journey Time: ${stats.estimatedTotalTime}`}
                                onPress={() => handleSelectHospital(hospital)}
                                tracksViewChanges={false}
                            >
                                {/* Use a single touchable view for the marker */}
                                <TouchableOpacity
                                    onPress={() => handleSelectHospital(hospital)}
                                    style={[
                                        styles.markerContainer,
                                        isSelected && styles.selectedMarkerContainer
                                    ]}
                                >
                                    <Ionicons
                                        name="medical"
                                        size={24}
                                        color={isSelected ? '#0056b3' : 'red'}
                                    />
                                </TouchableOpacity>
                            </Marker>
                        );
                    })}
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

                <View style={styles.mapControls}>
                    <TouchableOpacity
                        style={styles.mapButton}
                        onPress={() => {
                            if (userLocation) {
                                setRegion({
                                    ...userLocation,
                                    latitudeDelta: 0.0922,
                                    longitudeDelta: 0.0421,
                                });
                            }
                        }}
                    >
                        <Ionicons name="locate" size={24} color="#0056b3" />
                    </TouchableOpacity>

                    {selectedHospital && (
                        <TouchableOpacity
                            style={styles.mapButton}
                            onPress={() => {
                                if (userLocation && selectedHospital) {
                                    const newRegion = getRegionForCoordinates([
                                        userLocation,
                                        selectedHospital.coordinate
                                    ]);
                                    setRegion(newRegion);
                                }
                            }}
                        >
                            <Ionicons name="git-compare-outline" size={24} color="#0056b3" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.listContainer}>
                <View style={styles.headerContainer}>
                    <View style={styles.headerMain}>
                        <Text style={styles.title}>AI-Powered Recommendations</Text>
                        <Text style={styles.subtitle}>
                            Optimized for {TRIAGE_LEVELS[route.params?.triageLevel]?.label || 'Emergency'} Care
                        </Text>
                    </View>
                    <Text style={styles.lastUpdated}>
                        Last synced: {new Date().toLocaleTimeString()}
                    </Text>
                </View>
                <FlatList
                    ref={listRef}
                    data={hospitals}
                    keyExtractor={(item) => item.id}
                    renderItem={renderHospitalItem}
                    style={styles.list}
                    onScrollToIndexFailed={(info) => {
                        console.log('Scroll failed:', info);
                        // Use a single retry attempt
                        setTimeout(() => {
                            if (listRef.current) {
                                listRef.current.scrollToIndex({
                                    index: info.index,
                                    animated: true,
                                    viewPosition: 0.3,
                                    viewOffset: 10,
                                });
                            }
                        }, 500);
                    }}
                    getItemLayout={(data, index) => ({
                        length: cardHeight,
                        offset: cardHeight * index,
                        index,
                    })}
                    initialScrollIndex={null} // Remove initialScrollIndex
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
        backgroundColor: '#f5f5f5',
    },
    mapContainer: {
        flex: 1,
        position: 'relative',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    listContainer: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    headerMain: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2c3e50',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    lastUpdated: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
        marginTop: 4,
    },
    list: {
        flex: 1,
    },
    hospitalCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    hospitalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    hospitalName: {
        fontSize: 17,
        fontWeight: '600',
        color: '#2c3e50',
        flex: 1,
        letterSpacing: 0.3,
    },
    basicInfo: {
        marginBottom: 12,
    },
    triageLevelIndicator: {
        marginBottom: 16,
    },
    triageColorBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    triageLevelText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    algorithmScore: {
        backgroundColor: '#f0f7ff',
        padding: 12,
        borderRadius: 10,
        marginBottom: 16,
    },
    algorithmLabel: {
        fontSize: 13,
        color: '#0056b3',
        fontWeight: '600',
        marginBottom: 8,
    },
    scoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    scoreText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0056b3',
    },
    timeBreakdown: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#0056b3',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        paddingVertical: 2,
    },
    infoText: {
        marginLeft: 8,
        color: '#4a5568',
        fontSize: 14,
        flex: 1,
        fontWeight: '500',
    },
    totalTimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    totalTimeText: {
        marginLeft: 8,
        color: '#0056b3',
        fontSize: 15,
        fontWeight: '700',
    },
    expandedInfo: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 12,
        letterSpacing: 0.3,
    },
    detailRow: {
        marginBottom: 12,
    },
    detailLabel: {
        fontSize: 13,
        color: '#7f8c8d',
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 14,
        color: '#2c3e50',
        lineHeight: 20,
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
        padding: 14,
        borderRadius: 12,
        marginTop: 8,
    },
    statItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        paddingVertical: 2,
    },
    statLabel: {
        fontSize: 13,
        color: '#7f8c8d',
    },
    statValue: {
        fontSize: 14,
        color: '#2c3e50',
        fontWeight: '500',
    },
    markerContainer: {
        padding: 8,
        backgroundColor: 'white',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    selectedMarkerContainer: {
        borderColor: '#0056b3',
        borderWidth: 2,
        backgroundColor: 'white',
        shadowOpacity: 0.2,
        shadowRadius: 6,
    },
    userMarker: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 86, 179, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(0, 86, 179, 0.3)',
    },
    userDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#0056b3',
    },
    confirmButton: {
        backgroundColor: '#0056b3',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
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
    mapControls: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        gap: 10,
    },
    mapButton: {
        backgroundColor: 'white',
        borderRadius: 30,
        width: 46,
        height: 46,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    selectedHospitalCard: {
        borderColor: '#0056b3',
        borderWidth: 2,
        shadowOpacity: 0.12,
        shadowRadius: 10,
    },
}); 