import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { getTriageFromDeepSeek } from '../services/deepseekApi';

const TRIAGE_LEVELS = {
    LEVEL_I: {
        id: 'LEVEL_I',
        color: '#0000FF',
        label: 'Level I - Resuscitation',
        description: 'Critical condition requiring immediate life-saving interventions',
        clinicalDescription: 'Immediate threat to airway, breathing, or circulation',
        waitTime: 'Immediate Medical Intervention',
        colorName: 'Blue',
        painThreshold: 9
    },
    LEVEL_II: {
        id: 'LEVEL_II',
        color: '#FF0000',
        label: 'Level II - Emergent',
        description: 'High-risk condition requiring rapid medical intervention',
        clinicalDescription: 'Potentially life-threatening condition requiring immediate assessment',
        waitTime: '10-15 minutes maximum',
        colorName: 'Red',
        painThreshold: 7
    },
    LEVEL_III: {
        id: 'LEVEL_III',
        color: '#FFD700',
        label: 'Level III - Urgent',
        description: 'Acute condition requiring timely intervention',
        clinicalDescription: 'Stable vital signs with serious symptoms requiring prompt treatment',
        waitTime: '30-60 minutes target',
        colorName: 'Yellow',
        painThreshold: 5
    },
    LEVEL_IV: {
        id: 'LEVEL_IV',
        color: '#008000',
        label: 'Level IV - Semi-Urgent',
        description: 'Sub-acute condition requiring non-immediate intervention',
        clinicalDescription: 'Stable condition with moderate symptoms',
        waitTime: '1-2 hours acceptable',
        colorName: 'Green',
        painThreshold: 3
    },
    LEVEL_V: {
        id: 'LEVEL_V',
        color: '#FFFFFF',
        borderColor: '#000000',
        label: 'Level V - Non-Urgent',
        description: 'Chronic or minor condition suitable for routine care',
        clinicalDescription: 'Stable condition with minor symptoms',
        waitTime: '2-4 hours acceptable',
        colorName: 'White',
        painThreshold: 0
    }
};

const determineTriageLevel = (assessmentData) => {
    const {
        painLevel,
        consciousness,
        breathing,
        bleeding,
        chronicConditions,
        age,
        isPregnant,
        recentTrauma,
        temperature,
    } = assessmentData;

    // Immediate critical conditions (Level I)
    if (
        consciousness === 'unconscious' ||
        breathing === 'severe' ||
        bleeding === 'severe' ||
        parseInt(painLevel, 10) >= TRIAGE_LEVELS.LEVEL_I.painThreshold ||
        (temperature && (parseFloat(temperature) >= 40 || parseFloat(temperature) <= 35))
    ) {
        return TRIAGE_LEVELS.LEVEL_I;
    }

    // Emergent conditions (Level II)
    if (
        consciousness === 'confused' ||
        breathing === 'difficult' ||
        parseInt(painLevel, 10) >= TRIAGE_LEVELS.LEVEL_II.painThreshold ||
        (temperature && (parseFloat(temperature) >= 39 || parseFloat(temperature) <= 35.5)) ||
        (isPregnant && recentTrauma) ||
        (parseInt(age, 10) >= 75 && recentTrauma)
    ) {
        return TRIAGE_LEVELS.LEVEL_II;
    }

    // Urgent conditions (Level III)
    if (
        parseInt(painLevel, 10) >= TRIAGE_LEVELS.LEVEL_III.painThreshold ||
        (temperature && parseFloat(temperature) >= 38.5) ||
        (chronicConditions?.length > 0 && chronicConditions[0] !== 'None') ||
        isPregnant ||
        recentTrauma ||
        parseInt(age, 10) >= 75
    ) {
        return TRIAGE_LEVELS.LEVEL_III;
    }

    // Less urgent conditions (Level IV)
    if (
        parseInt(painLevel, 10) >= TRIAGE_LEVELS.LEVEL_IV.painThreshold ||
        (temperature && parseFloat(temperature) >= 38)
    ) {
        return TRIAGE_LEVELS.LEVEL_IV;
    }

    // Non-urgent conditions (Level V)
    return TRIAGE_LEVELS.LEVEL_V;
};

export function TriageResultsScreen({ route, navigation }) {
    const assessmentData = route.params || {};
    const [llmTriage, setLlmTriage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Call the DeepSeek LLM to get triage level
        (async () => {
            try {
                const result = await getTriageFromDeepSeek(assessmentData);
                setLlmTriage(result);
            } catch (error) {
                console.error('Error getting LLM triage:', error);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [assessmentData]);

    // Get both LLM and traditional triage levels
    const llmTriageLevel = llmTriage?.triageLevel || 'LEVEL_V';
    const traditionalTriageLevel = determineTriageLevel(assessmentData);

    // Use LLM triage level for critical decision if available, otherwise fall back to traditional
    const isCritical = (llmTriage ? llmTriageLevel : traditionalTriageLevel.id) === 'LEVEL_I';

    const handleCritical = () => {
        // Implement emergency call logic
        console.log('Emergency services contacted');
    };

    const handleNonCritical = () => {
        navigation.navigate('HospitalRecommendation', {
            symptom: assessmentData.symptom,
            triageLevel: llmTriage ? llmTriageLevel : traditionalTriageLevel.id
        });
    };

    const getVitalSignsDisplay = (data) => {
        const signs = [];
        if (data.consciousness) {
            signs.push(`Mental Status: ${data.consciousness === 'alert' ? 'Alert & Oriented' :
                data.consciousness === 'confused' ? 'Altered Mental Status' : 'Unresponsive'}`);
        }
        if (data.breathing) {
            signs.push(`Respiratory Status: ${data.breathing === 'normal' ? 'Normal Respiratory Pattern' :
                data.breathing === 'difficult' ? 'Respiratory Distress' : 'Severe Respiratory Compromise'}`);
        }
        if (data.temperature) {
            signs.push(`Temperature: ${data.temperature}°C (${(data.temperature * 9 / 5 + 32).toFixed(1)}°F)`);
        }
        return signs;
    };

    return (
        <ScrollView style={styles.container}>
            {/* Clinical Assessment Summary */}
            <View style={styles.card}>
                <Text style={styles.title}>Clinical Assessment Results</Text>
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.label}>Chief Complaint</Text>
                        <Text style={styles.value}>{assessmentData.symptom}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.label}>Pain Scale Assessment</Text>
                        <Text style={styles.value}>
                            {assessmentData.painLevel}/10
                            {assessmentData.painLevel >= 7 ? ' (Severe)' :
                                assessmentData.painLevel >= 4 ? ' (Moderate)' : ' (Mild)'}
                        </Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.label}>Symptom Duration</Text>
                        <Text style={styles.value}>{assessmentData.duration}</Text>
                    </View>

                    {/* Additional Clinical Information */}
                    <View style={styles.vitalSignsContainer}>
                        {getVitalSignsDisplay(assessmentData).map((sign, index) => (
                            <Text key={index} style={styles.vitalSignText}>
                                {sign}
                            </Text>
                        ))}
                    </View>
                </View>
            </View>

            {/* AI-Enhanced Clinical Decision Support */}
            <View style={styles.card}>
                <Text style={styles.subtitle}>AI-Enhanced Clinical Assessment</Text>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#0056b3" />
                        <Text style={styles.loadingText}>Processing Clinical Data...</Text>
                    </View>
                ) : (
                    <>
                        <Text style={styles.aiResultTitle}>Clinical Decision Support Analysis:</Text>
                        <View style={[
                            styles.triageLevelBox,
                            { backgroundColor: TRIAGE_LEVELS[llmTriageLevel].color },
                            llmTriageLevel === 'LEVEL_V' && { borderWidth: 1, borderColor: TRIAGE_LEVELS.LEVEL_V.borderColor }
                        ]}>
                            <Text style={[
                                styles.triageLevelText,
                                llmTriageLevel === 'LEVEL_V' && { color: '#000' }
                            ]}>
                                {TRIAGE_LEVELS[llmTriageLevel].label}
                            </Text>
                            <Text style={[
                                styles.clinicalDescription,
                                llmTriageLevel === 'LEVEL_V' && { color: '#000' }
                            ]}>
                                Clinical Assessment: {TRIAGE_LEVELS[llmTriageLevel].clinicalDescription}
                            </Text>
                            <Text style={[
                                styles.triageDescription,
                                llmTriageLevel === 'LEVEL_V' && { color: '#000' }
                            ]}>
                                AI Reasoning: {llmTriage.reasoning}
                            </Text>
                        </View>
                    </>
                )}
            </View>

            {/* Standard Protocol Assessment */}
            <View style={styles.card}>
                <Text style={styles.subtitle}>Protocol-Based Assessment</Text>
                <View style={[
                    styles.triageLevelBox,
                    { backgroundColor: traditionalTriageLevel.color },
                    traditionalTriageLevel.id === 'LEVEL_V' && { borderWidth: 1, borderColor: traditionalTriageLevel.borderColor }
                ]}>
                    <Text style={[
                        styles.triageLevelText,
                        traditionalTriageLevel.id === 'LEVEL_V' && { color: '#000' }
                    ]}>
                        {traditionalTriageLevel.label}
                    </Text>
                    <Text style={[
                        styles.clinicalDescription,
                        traditionalTriageLevel.id === 'LEVEL_V' && { color: '#000' }
                    ]}>
                        {traditionalTriageLevel.clinicalDescription}
                    </Text>
                    <Text style={[
                        styles.triageWaitTime,
                        traditionalTriageLevel.id === 'LEVEL_V' && { color: '#000' }
                    ]}>
                        Target Response Time: {traditionalTriageLevel.waitTime}
                    </Text>
                </View>
            </View>

            {/* Clinical Action Required */}
            <View style={styles.card}>
                <TouchableOpacity
                    style={[styles.button, isCritical && styles.emergencyButton]}
                    onPress={isCritical ? handleCritical : handleNonCritical}
                >
                    <Text style={styles.buttonText}>
                        {isCritical ? 'Initiate Emergency Response' : 'Locate Appropriate Care Facility'}
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
        padding: 12,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
        color: '#2c3e50',
        letterSpacing: 0.3,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        color: '#2c3e50',
        letterSpacing: 0.2,
    },
    summaryContainer: {
        marginBottom: 12,
    },
    summaryItem: {
        marginBottom: 8,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    label: {
        fontSize: 13,
        color: '#7f8c8d',
        marginBottom: 2,
        letterSpacing: 0.2,
    },
    value: {
        fontSize: 15,
        fontWeight: '500',
        color: '#34495e',
        lineHeight: 20,
    },
    triageLevelBox: {
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        alignItems: 'center',
    },
    triageLevelText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 6,
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    triageDescription: {
        fontSize: 14,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 6,
        lineHeight: 20,
        opacity: 0.95,
    },
    clinicalDescription: {
        fontSize: 14,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 6,
        fontStyle: 'italic',
        lineHeight: 20,
        opacity: 0.9,
    },
    triageWaitTime: {
        fontSize: 13,
        color: '#fff',
        fontStyle: 'italic',
        opacity: 0.85,
    },
    button: {
        backgroundColor: '#0056b3',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    emergencyButton: {
        backgroundColor: '#dc3545',
    },
    buttonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    loadingContainer: {
        padding: 16,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 8,
        color: '#666',
        fontSize: 14,
    },
    aiResultTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 10,
        letterSpacing: 0.2,
    },
    vitalSignsContainer: {
        backgroundColor: '#f8f9fa',
        borderRadius: 6,
        padding: 10,
        marginTop: 8,
    },
    vitalSignText: {
        fontSize: 14,
        color: '#34495e',
        marginBottom: 4,
        lineHeight: 20,
    }
}); 