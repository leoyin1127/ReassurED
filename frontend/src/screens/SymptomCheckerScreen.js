import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
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
        <View style={styles.container}>
            <Text style={styles.title}>Symptom Checker</Text>
            {/* Example text input for symptom or use any advanced UI */}
            <Text>Symptom:</Text>
            <TextInput
                style={styles.input}
                placeholder="E.g. Fever"
                value={symptom}
                onChangeText={setSymptom}
            />

            <Text>Pain Level (1-10):</Text>
            <TextInput
                style={styles.input}
                placeholder="E.g. 7"
                value={painLevel}
                onChangeText={setPainLevel}
                keyboardType="numeric"
            />

            <Text>Duration (hours/days/weeks):</Text>
            <TextInput
                style={styles.input}
                placeholder="E.g. 2 days"
                value={duration}
                onChangeText={setDuration}
            />

            <Button title="Next" onPress={handleNext} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#ffffff',
    },
    title: {
        fontSize: 20,
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 8,
        marginVertical: 8,
    },
}); 