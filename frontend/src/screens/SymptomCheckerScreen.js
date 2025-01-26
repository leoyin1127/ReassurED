import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
// If you have a searchable dropdown library, you would import it here
// For voice input, you might use @react-native-community/voice or similar

export function SymptomCheckerScreen({ navigation }) {
    const [symptom, setSymptom] = useState('');
    const [painLevel, setPainLevel] = useState('');
    const [duration, setDuration] = useState('');

    const handleNext = () => {
        // For now, just navigate to TriageResults
        // You could pass the form data in params
        navigation.navigate('TriageResults', {
            symptom,
            painLevel,
            duration,
        });
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Symptom Checker</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>What's bothering you?</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="E.g. Chest pain, Headache"
                        value={symptom}
                        onChangeText={setSymptom}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Pain Level (1-10)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="E.g. 7"
                        value={painLevel}
                        onChangeText={setPainLevel}
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>How long have you been experiencing this?</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="E.g. 2 days"
                        value={duration}
                        onChangeText={setDuration}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, (!symptom || !painLevel || !duration) && styles.buttonDisabled]}
                    onPress={handleNext}
                    disabled={!symptom || !painLevel || !duration}
                >
                    <Text style={styles.buttonText}>Next</Text>
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
        marginBottom: 24,
        color: '#333',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f8f9fa',
    },
    button: {
        backgroundColor: '#0056b3',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
}); 