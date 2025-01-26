import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList, Dimensions, TouchableOpacity, Platform, Alert, Linking } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { locationService } from '../services/locationService';

const hospitals = [
    {
        id: '1',
        name: 'City Hospital',
        distance: '5 min away',
        waitTime: '10-15 minutes',
        specialties: 'Pediatrics, Trauma',
        coordinate: {
            latitude: 45.5017,  // Replace with actual coordinates
            longitude: -73.5673
        }
    },
    {
        id: '2',
        name: 'Green Valley Hospital',
        distance: '8 min away',
        waitTime: '5-10 minutes',
        specialties: 'Cardiology, Orthopedics',
        coordinate: {
            latitude: 45.5025,  // Replace with actual coordinates
            longitude: -73.5683
        }
    },
];

export function HospitalRecommendationScreen({ navigation, route }) {
    const [selectedHospital, setSelectedHospital] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
    const [region, setRegion] = useState({
        latitude: 45.5017,
        longitude: -73.5673,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

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
            navigation.navigate('RealTimePathway', { hospital: selectedHospital });
        }
    };

    const renderHospital = ({ item }) => {
        const isSelected = selectedHospital?.id === item.id;
        return (
            <TouchableOpacity
                style={[styles.hospitalRow, isSelected && styles.selectedHospital]}
                onPress={() => handleSelectHospital(item)}
            >
                <Text style={styles.hospitalName}>{item.name}</Text>
                <Text style={styles.hospitalInfo}>{item.distance}</Text>
                <Text style={styles.hospitalInfo}>Wait: {item.waitTime}</Text>
                <Text style={styles.hospitalInfo}>Specialties: {item.specialties}</Text>
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
            </View>

            <View style={styles.listContainer}>
                <Text style={styles.title}>Nearby Hospitals</Text>
                <FlatList
                    data={hospitals}
                    keyExtractor={(item) => item.id}
                    renderItem={renderHospital}
                    style={styles.list}
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
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    list: {
        flex: 1,
    },
    hospitalRow: {
        marginBottom: 12,
        padding: 16,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#dee2e6',
    },
    selectedHospital: {
        backgroundColor: '#e3f2fd',
        borderColor: '#0056b3',
    },
    hospitalName: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
        color: '#333',
    },
    hospitalInfo: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
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
}); 