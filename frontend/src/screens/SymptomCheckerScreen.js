import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetPicker } from '../components/BottomSheetPicker';
import { db } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuthContext } from '../context/AuthContext';
import { symptomService } from '../services/symptomService';
// If you have a searchable dropdown library, you would import it here
// For voice input, you might use @react-native-community/voice or similar

export function SymptomCheckerScreen({ navigation }) {
    const { userProfile } = useAuthContext();
    const [symptom, setSymptom] = useState('');
    const [painLevel, setPainLevel] = useState('');
    const [duration, setDuration] = useState('');
    // New state variables for additional checks
    const [consciousness, setConsciousness] = useState('alert'); // alert, confused, unconscious
    const [breathing, setBreathing] = useState('normal'); // normal, difficult, severe
    const [bleeding, setBleeding] = useState('none'); // none, mild, severe
    const [chronicConditions, setChronicConditions] = useState([]);
    const [age, setAge] = useState('');
    const [isPregnant, setIsPregnant] = useState(false);
    const [recentTrauma, setRecentTrauma] = useState(false);
    const [temperature, setTemperature] = useState('');

    const chronicConditionsList = [
        'Diabetes',
        'Heart Disease',
        'Hypertension',
        'Asthma',
        'Immunocompromised',
        'None'
    ];

    const toggleChronicCondition = (condition) => {
        if (condition === 'None') {
            setChronicConditions(['None']);
            return;
        }

        let updatedConditions = [...chronicConditions];
        if (updatedConditions.includes(condition)) {
            updatedConditions = updatedConditions.filter(c => c !== condition);
        } else {
            updatedConditions = updatedConditions.filter(c => c !== 'None');
            updatedConditions.push(condition);
        }
        setChronicConditions(updatedConditions);
    };

    const saveSymptoms = async (symptoms, triageLevel) => {
        try {
            if (!userProfile?.auth0Id) {
                console.warn('No user ID available');
                return;
            }

            const symptomData = {
                symptoms: symptoms,
                triageLevel: triageLevel,
                responses: {
                    primarySymptom: symptom,
                    painLevel,
                    duration,
                    consciousness,
                    breathing,
                    bleeding,
                    chronicConditions,
                    age,
                    isPregnant,
                    recentTrauma,
                    temperature
                }
            };

            const symptomId = await symptomService.saveSymptoms(userProfile.auth0Id, symptomData);
            return symptomId;
        } catch (error) {
            console.error('Error saving symptoms:', error);
            throw error;
        }
    };

    const handleComplete = async (triageLevel) => {
        try {
            const symptoms = {
                primary: symptom,
                painLevel,
                duration,
                // Include other symptom data
            };

            const symptomId = await saveSymptoms(symptoms, triageLevel);

            navigation.navigate('HospitalRecommendation', {
                triageLevel: triageLevel,
                symptoms: symptoms,
                symptomId: symptomId
            });
        } catch (error) {
            Alert.alert(
                'Error',
                'Failed to save your symptoms. Please try again.',
                [
                    {
                        text: 'Retry',
                        onPress: () => handleComplete(triageLevel)
                    },
                    {
                        text: 'Continue Anyway',
                        onPress: () => navigation.navigate('HospitalRecommendation', {
                            triageLevel: triageLevel,
                            symptoms: symptoms
                        })
                    }
                ]
            );
        }
    };

    const handleNext = () => {
        navigation.navigate('TriageResults', {
            symptom,
            painLevel,
            duration,
            // Additional parameters
            consciousness,
            breathing,
            bleeding,
            chronicConditions,
            age,
            isPregnant,
            recentTrauma,
            temperature: temperature ? parseFloat(temperature) : null,
        });
    };

    const isValid = () => {
        return symptom && painLevel && duration; // Add more required fields as needed
    };

    const painLevelOptions = [...Array(11)].map((_, i) => ({
        value: i.toString(),
        label: `${i} - ${i === 0 ? 'No pain' : i === 10 ? 'Worst pain imaginable' : i < 4 ? 'Mild' : i < 7 ? 'Moderate' : 'Severe'}`
    }));

    const durationOptions = [
        { value: 'Just started', label: 'Just started' },
        { value: '< 1 hour', label: 'Less than 1 hour' },
        { value: 'Few hours', label: 'Few hours' },
        { value: '1 day', label: '1 day' },
        { value: 'Several days', label: 'Several days' },
        { value: '> 1 week', label: 'More than a week' }
    ];

    const consciousnessOptions = [
        { value: 'alert', label: 'Alert and oriented' },
        { value: 'confused', label: 'Confused/Disoriented' },
        { value: 'unconscious', label: 'Unconscious' }
    ];

    const breathingOptions = [
        { value: 'normal', label: 'Normal breathing' },
        { value: 'difficult', label: 'Slightly difficult' },
        { value: 'severe', label: 'Severe difficulty' }
    ];

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                {/* <View style={styles.headerContainer}>
                    <Ionicons name="medical" size={32} color="#0056b3" />
                    <Text style={styles.title}>Symptom Checker</Text>
                </View> */}

                {/* Primary Symptoms Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="warning-outline" size={24} color="#0056b3" />
                        <Text style={styles.sectionTitle}>Primary Symptoms</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <View style={styles.labelContainer}>
                            <Text style={styles.label}>What's bothering you?</Text>
                            <Text style={styles.requiredStar}>*</Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="E.g. Chest pain, Headache"
                            value={symptom}
                            onChangeText={setSymptom}
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <View style={styles.labelContainer}>
                            <Text style={styles.label}>Pain Level</Text>
                            <Text style={styles.requiredStar}>*</Text>
                        </View>
                        <BottomSheetPicker
                            value={painLevel}
                            options={painLevelOptions}
                            onSelect={setPainLevel}
                            placeholder="Select pain level"
                            label="Pain Level"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <View style={styles.labelContainer}>
                            <Text style={styles.label}>Duration of Symptoms</Text>
                            <Text style={styles.requiredStar}>*</Text>
                        </View>
                        <BottomSheetPicker
                            value={duration}
                            options={durationOptions}
                            onSelect={setDuration}
                            placeholder="Select duration"
                            label="Duration"
                        />
                    </View>
                </View>

                {/* Vital Signs Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="pulse-outline" size={24} color="#0056b3" />
                        <Text style={styles.sectionTitle}>Vital Signs</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Level of Consciousness</Text>
                        <BottomSheetPicker
                            value={consciousness}
                            options={consciousnessOptions}
                            onSelect={setConsciousness}
                            placeholder="Select consciousness level"
                            label="Consciousness"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Breathing Difficulty</Text>
                        <BottomSheetPicker
                            value={breathing}
                            options={breathingOptions}
                            onSelect={setBreathing}
                            placeholder="Select breathing difficulty"
                            label="Breathing"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Temperature (°C)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="E.g. 37.5"
                            value={temperature}
                            onChangeText={setTemperature}
                            keyboardType="decimal-pad"
                            placeholderTextColor="#999"
                        />
                    </View>
                </View>

                {/* Patient Information Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="person-outline" size={24} color="#0056b3" />
                        <Text style={styles.sectionTitle}>Patient Information</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Age</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter age"
                            value={age}
                            onChangeText={setAge}
                            keyboardType="number-pad"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.switchGroup}>
                        <View>
                            <Text style={styles.label}>Pregnant</Text>
                            <Text style={styles.sublabel}>Currently pregnant or possibly pregnant</Text>
                        </View>
                        <Switch
                            value={isPregnant}
                            onValueChange={setIsPregnant}
                            trackColor={{ false: '#ddd', true: '#0056b3' }}
                            thumbColor={isPregnant ? '#fff' : '#f4f3f4'}
                        />
                    </View>

                    <View style={styles.switchGroup}>
                        <View>
                            <Text style={styles.label}>Recent Injury/Trauma</Text>
                            <Text style={styles.sublabel}>Injury within the last 24 hours</Text>
                        </View>
                        <Switch
                            value={recentTrauma}
                            onValueChange={setRecentTrauma}
                            trackColor={{ false: '#ddd', true: '#0056b3' }}
                            thumbColor={recentTrauma ? '#fff' : '#f4f3f4'}
                        />
                    </View>
                </View>

                {/* Chronic Conditions Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="fitness-outline" size={24} color="#0056b3" />
                        <Text style={styles.sectionTitle}>Chronic Conditions</Text>
                    </View>
                    <Text style={styles.sublabel}>Select all that apply</Text>
                    <View style={styles.conditionsContainer}>
                        {chronicConditionsList.map((condition) => (
                            <TouchableOpacity
                                key={condition}
                                style={[
                                    styles.conditionButton,
                                    chronicConditions.includes(condition) && styles.conditionButtonSelected
                                ]}
                                onPress={() => toggleChronicCondition(condition)}
                            >
                                <Text style={[
                                    styles.conditionButtonText,
                                    chronicConditions.includes(condition) && styles.conditionButtonTextSelected
                                ]}>
                                    {condition}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.button, !isValid() && styles.buttonDisabled]}
                    onPress={handleNext}
                    disabled={!isValid()}
                >
                    <Text style={styles.buttonText}>Continue to Assessment</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
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
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#fff',
        marginTop: 4,
    },
    sublabel: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    buttonIcon: {
        marginLeft: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginLeft: 8,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#333',
    },
    picker: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginTop: -8,
    },
    switchGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    conditionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
    },
    conditionButton: {
        backgroundColor: '#f8f9fa',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 16,
        margin: 4,
        borderWidth: 1,
        borderColor: '#dee2e6',
    },
    conditionButtonSelected: {
        backgroundColor: '#0056b3',
        borderColor: '#0056b3',
    },
    conditionButtonText: {
        color: '#666',
        fontSize: 14,
    },
    conditionButtonTextSelected: {
        color: '#fff',
    },
    button: {
        backgroundColor: '#0056b3',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 24,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#cccccc',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    requiredStar: {
        color: '#dc3545',
        marginLeft: 4,
        fontSize: 16,
        fontWeight: 'bold',
    },
}); 