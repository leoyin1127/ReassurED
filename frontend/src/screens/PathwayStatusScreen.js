import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, ActivityIndicator,
    TouchableOpacity, Modal, TextInput, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHospitalContext } from '../context/HospitalContext';
import { formatHospitalStats } from '../services/hospitalService';
import { getPathwayGuidance } from '../services/deepseekApi';
import { format } from 'date-fns';

export function PathwayStatusScreen() {
    const { selectedHospital, triageLevel } = useHospitalContext();
    const [pathwayGuidance, setPathwayGuidance] = useState(null);
    const [loading, setLoading] = useState(true);
    const stats = selectedHospital ? formatHospitalStats(selectedHospital, triageLevel) : null;
    const [editMode, setEditMode] = useState(false);
    const [editingStep, setEditingStep] = useState(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editedPathway, setEditedPathway] = useState(null);

    useEffect(() => {
        async function loadPathwayGuidance() {
            if (!selectedHospital) return;

            try {
                const guidance = await getPathwayGuidance(
                    selectedHospital,
                    { triageLevel, currentTime: new Date().toISOString() }
                );

                // Set the first step as active by default
                if (guidance.pathway && guidance.pathway.length > 0) {
                    const initialPathway = guidance.pathway.map((step, index) => ({
                        ...step,
                        status: index === 0 ? 'active' : 'pending'
                    }));

                    setPathwayGuidance({
                        ...guidance,
                        currentStep: guidance.pathway[0].step,
                        pathway: initialPathway
                    });
                } else {
                    setPathwayGuidance(guidance);
                }
            } catch (error) {
                console.error('Error loading pathway guidance:', error);
            } finally {
                setLoading(false);
            }
        }

        loadPathwayGuidance();
    }, [selectedHospital, triageLevel]);

    // Function to handle step selection
    const handleStepSelect = (selectedIndex) => {
        const updatedPathway = pathwayGuidance.pathway.map((step, index) => {
            if (index < selectedIndex) {
                // Mark previous steps as completed
                return { ...step, status: 'completed' };
            } else if (index === selectedIndex) {
                // Mark selected step as active
                return { ...step, status: 'active' };
            } else {
                // Mark future steps as pending
                return { ...step, status: 'pending' };
            }
        });

        setPathwayGuidance({
            ...pathwayGuidance,
            currentStep: updatedPathway[selectedIndex].step,
            pathway: updatedPathway
        });
    };

    // Function to handle step editing
    const handleEditStep = (step, index) => {
        setEditingStep({ ...step, index });
        setEditModalVisible(true);
    };

    // Function to save edited step
    const handleSaveEdit = () => {
        if (!editingStep) return;

        const updatedPathway = [...pathwayGuidance.pathway];
        updatedPathway[editingStep.index] = editingStep;

        setPathwayGuidance({
            ...pathwayGuidance,
            pathway: updatedPathway
        });
        setEditModalVisible(false);
        setEditingStep(null);
    };

    // Function to handle continuing to next step
    const handleContinueToNext = (currentIndex) => {
        if (currentIndex >= pathwayGuidance.pathway.length - 1) {
            Alert.alert('End of Pathway', 'You have completed all steps in your care pathway.');
            return;
        }

        const updatedPathway = pathwayGuidance.pathway.map((step, index) => {
            if (index === currentIndex) {
                // Mark current step as completed
                return { ...step, status: 'completed' };
            } else if (index === currentIndex + 1) {
                // Mark next step as active
                return { ...step, status: 'active' };
            }
            // Keep other steps' status unchanged
            return step;
        });

        setPathwayGuidance({
            ...pathwayGuidance,
            currentStep: updatedPathway[currentIndex + 1].step,
            pathway: updatedPathway
        });
    };

    // Add Edit Modal Component
    const EditStepModal = () => (
        <Modal
            visible={editModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setEditModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Edit Step</Text>
                        <TouchableOpacity
                            onPress={() => setEditModalVisible(false)}
                            style={styles.closeButton}
                        >
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>
                    {editingStep && (
                        <ScrollView style={styles.modalBody}>
                            <Text style={styles.inputLabel}>Step Name</Text>
                            <TextInput
                                style={styles.input}
                                value={editingStep.step}
                                onChangeText={(text) => setEditingStep(prev => ({ ...prev, step: text }))}
                            />
                            <Text style={styles.inputLabel}>Location</Text>
                            <TextInput
                                style={styles.input}
                                value={editingStep.location}
                                onChangeText={(text) => setEditingStep(prev => ({ ...prev, location: text }))}
                            />
                            <Text style={styles.inputLabel}>Duration</Text>
                            <TextInput
                                style={styles.input}
                                value={editingStep.estimatedDuration}
                                onChangeText={(text) => setEditingStep(prev => ({ ...prev, estimatedDuration: text }))}
                            />
                            <Text style={styles.inputLabel}>Instructions</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={editingStep.instructions}
                                onChangeText={(text) => setEditingStep(prev => ({ ...prev, instructions: text }))}
                                multiline
                            />
                            <Text style={styles.inputLabel}>What to Expect</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={editingStep.whatToExpect}
                                onChangeText={(text) => setEditingStep(prev => ({ ...prev, whatToExpect: text }))}
                                multiline
                            />
                            <Text style={styles.inputLabel}>Requirements (comma-separated)</Text>
                            <TextInput
                                style={styles.input}
                                value={editingStep.requirements.join(', ')}
                                onChangeText={(text) => setEditingStep(prev => ({
                                    ...prev,
                                    requirements: text.split(',').map(item => item.trim()).filter(Boolean)
                                }))}
                            />
                            <Text style={styles.inputLabel}>Tips (comma-separated)</Text>
                            <TextInput
                                style={styles.input}
                                value={editingStep.tips.join(', ')}
                                onChangeText={(text) => setEditingStep(prev => ({
                                    ...prev,
                                    tips: text.split(',').map(item => item.trim()).filter(Boolean)
                                }))}
                            />
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleSaveEdit}
                            >
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    )}
                </View>
            </View>
        </Modal>
    );

    // Update the step rendering in the timeline
    const renderStep = (step, index) => (
        <View key={index} style={styles.timelineItem}>
            {/* Add a line before the dot (except for first item) */}
            {index > 0 && (
                <View
                    style={[
                        styles.timelineLine,
                        styles[`${pathwayGuidance.pathway[index - 1].status}Line`],
                        pathwayGuidance.pathway[index - 1].status === 'active' && styles.activeTimeLine
                    ]}
                />
            )}

            {/* Step Selection Button */}
            <TouchableOpacity
                style={[
                    styles.timelineDot,
                    styles[step.status],
                    step.status === 'active' && styles.activeDot
                ]}
                onPress={() => {
                    Alert.alert(
                        'Update Current Step',
                        `Are you currently at "${step.step}"?`,
                        [
                            {
                                text: 'Cancel',
                                style: 'cancel'
                            },
                            {
                                text: 'Yes',
                                onPress: () => handleStepSelect(index)
                            }
                        ]
                    );
                }}
            >
                <Ionicons
                    name={
                        step.status === 'completed' ? 'checkmark-circle' :
                            step.status === 'active' ? 'time' : 'ellipse-outline'
                    }
                    size={16}
                    color={step.status === 'pending' ? '#666' : '#fff'}
                />
            </TouchableOpacity>

            {/* Add a line after the dot (except for last item) */}
            {index < pathwayGuidance.pathway.length - 1 && (
                <View
                    style={[
                        styles.timelineLine,
                        styles[`${step.status}Line`],
                        step.status === 'active' && styles.activeTimeLine
                    ]}
                />
            )}

            {/* Step Content */}
            <View style={[
                styles.timelineContent,
                step.status === 'active' && styles.activeContent
            ]}>
                <View style={styles.stepHeader}>
                    <Text style={styles.stepTitle}>{step.step}</Text>
                    <View style={styles.stepActions}>
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => handleEditStep(step, index)}
                        >
                            <Ionicons name="pencil" size={16} color="#666" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Location and Time Info */}
                <View style={styles.stepInfoContainer}>
                    <View style={styles.stepInfo}>
                        <Ionicons name="location-outline" size={14} color="#666" />
                        <Text style={styles.stepInfoText}>{step.location}</Text>
                    </View>
                    <View style={styles.stepInfo}>
                        <Ionicons name="time-outline" size={14} color="#666" />
                        <Text style={styles.stepInfoText}>
                            {step.estimatedStartTime} ({step.estimatedDuration})
                        </Text>
                    </View>
                </View>

                {/* What to Expect & Instructions Combined */}
                <View style={styles.infoPanel}>
                    <View style={styles.panelHeader}>
                        <Ionicons name="information-circle-outline" size={18} color="#0056b3" />
                        <Text style={styles.panelTitle}>What to Expect & Instructions</Text>
                    </View>
                    <Text style={styles.expectationText}>{step.whatToExpect}</Text>
                    <View style={styles.divider} />
                    <Text style={styles.instructions}>{step.instructions}</Text>
                </View>

                {/* Requirements and Tips Combined */}
                <View style={styles.helpfulPanel}>
                    {step.requirements?.length > 0 && (
                        <View style={styles.requirementsList}>
                            <Text style={styles.requirementsTitle}>What You'll Need:</Text>
                            {step.requirements.map((req, idx) => (
                                <View key={idx} style={styles.requirementItem}>
                                    <Ionicons name="checkbox-outline" size={14} color="#0056b3" />
                                    <Text style={styles.requirementText}>{req}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {step.tips?.length > 0 && (
                        <View style={styles.tipsList}>
                            <Text style={styles.tipsTitle}>Helpful Tips:</Text>
                            {step.tips.map((tip, idx) => (
                                <View key={idx} style={styles.tipItem}>
                                    <Ionicons name="bulb-outline" size={14} color="#0056b3" />
                                    <Text style={styles.tipText}>{tip}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* Add Continue Button for Active Step */}
                {step.status === 'active' && (
                    <TouchableOpacity
                        style={styles.continueButton}
                        onPress={() => handleContinueToNext(index)}
                    >
                        <Text style={styles.continueButtonText}>Continue to Next Step</Text>
                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    if (!selectedHospital) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text style={styles.noDataText}>No hospital selected</Text>
            </View>
        );
    }

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#0056b3" />
                <Text style={styles.loadingText}>Loading your care pathway tailored</Text>
                <Text style={styles.loadingText}>to your symptoms...</Text>
            </View>
        );
    }

    return (
        <>
            <ScrollView style={styles.container}>
                {/* Hospital Info Card with Enhanced Disclaimer */}
                <View style={styles.card}>
                    <Text style={styles.title}>Your Care Journey</Text>
                    <View style={styles.hospitalInfo}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="medical" size={24} color="#4caf50" />
                        </View>
                        <View style={styles.hospitalDetails}>
                            <Text style={styles.hospitalName}>{selectedHospital.name}</Text>
                            <Text style={styles.hospitalAddress}>{selectedHospital.address}</Text>
                        </View>
                    </View>

                    <View style={styles.disclaimerContainer}>
                        <Ionicons name="information-circle-outline" size={20} color="#666" />
                        <Text style={styles.disclaimerText}>
                            This is an AI-generated care pathway based on your symptoms and triage level. The actual steps, tests, and procedures may vary based on the doctor's assessment, hospital protocols, and your specific medical needs. Our healthcare team will guide you through your actual treatment plan.
                        </Text>
                    </View>
                </View>

                {/* Current Status Card with Supportive Message */}
                <View style={[styles.card, styles.statusCard]}>
                    <View style={styles.currentStatus}>
                        <Text style={styles.statusTitle}>Where You Are Now</Text>
                        <View style={styles.statusBadgeContainer}>
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>{pathwayGuidance?.currentStep}</Text>
                            </View>
                            <View style={styles.timeContainer}>
                                <Ionicons name="time-outline" size={20} color="#666" />
                                <Text style={styles.estimatedTime}>
                                    Estimated time with us: {pathwayGuidance?.estimatedTotalDuration}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Detailed Pathway Steps */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Your Care Journey</Text>
                    <View style={styles.timeline}>
                        {pathwayGuidance?.pathway.map((step, index) => renderStep(step, index))}
                    </View>
                </View>
            </ScrollView>
            <EditStepModal />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 20,
        margin: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    statusCard: {
        backgroundColor: '#f8f9ff',
        borderWidth: 1,
        borderColor: '#e6e9fd',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 20,
    },
    hospitalInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
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
    hospitalDetails: {
        flex: 1,
        marginLeft: 12,
    },
    hospitalName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
    },
    hospitalAddress: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    currentStatus: {
        alignItems: 'center',
        padding: 16,
    },
    statusTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 12,
        textAlign: 'center',
    },
    statusBadgeContainer: {
        alignItems: 'center',
    },
    statusBadge: {
        backgroundColor: '#4caf50',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    estimatedTime: {
        fontSize: 14,
        color: '#4caf50',
        fontWeight: '500',
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 20,
    },
    timeline: {
        paddingLeft: 8,
        position: 'relative',
    },
    timelineItem: {
        position: 'relative',
        paddingLeft: 30,
        marginBottom: 24,
        ':last-child': {
            marginBottom: 0,
        },
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
        zIndex: 2,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    timelineLine: {
        position: 'absolute',
        left: 15,
        top: 0,
        bottom: -24,
        width: 2,
        height: 'auto',
        backgroundColor: '#d3d3d3',
    },
    lastTimelineLine: {
        display: 'none',
    },
    timelineContent: {
        marginLeft: 12,
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 4,
    },
    stepInfoContainer: {
        marginVertical: 8,
        gap: 4,
    },
    stepInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    stepInfoText: {
        fontSize: 14,
        color: '#666',
    },
    instructionsPanel: {
        backgroundColor: '#fafafa',
        padding: 16,
        borderRadius: 12,
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#e6e9fd',
    },
    instructionsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 4,
    },
    instructions: {
        fontSize: 14,
        color: '#4a5568',
        lineHeight: 20,
    },
    requirementsList: {
        marginTop: 8,
    },
    requirementsTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 4,
    },
    requirementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    requirementText: {
        fontSize: 13,
        color: '#4a5568',
        marginLeft: 6,
    },
    tipsList: {
        marginTop: 8,
    },
    tipsTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 4,
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    tipText: {
        fontSize: 13,
        color: '#4a5568',
        marginLeft: 6,
        flex: 1,
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
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    disclaimerContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#f1f8e9',
        padding: 16,
        borderRadius: 12,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#c5e1a5',
    },
    disclaimerText: {
        flex: 1,
        fontSize: 14,
        color: '#33691e',
        marginLeft: 8,
        lineHeight: 20,
    },
    activeDot: {
        backgroundColor: '#0056b3',
        borderWidth: 2,
        borderColor: '#e3f2fd',
    },
    activeContent: {
        backgroundColor: '#fafafa',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e3f2fd',
    },
    activeTimeLine: {
        backgroundColor: '#0056b3',
    },
    completed: {
        backgroundColor: '#4caf50',
    },
    active: {
        backgroundColor: '#0056b3',
    },
    pending: {
        backgroundColor: '#d3d3d3',
    },
    completedLine: {
        backgroundColor: '#4caf50',
    },
    pendingLine: {
        backgroundColor: '#d3d3d3',
    },
    expectationPanel: {
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    comfortPanel: {
        backgroundColor: '#f1f8e9',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    panelHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    panelTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2c3e50',
    },
    expectationText: {
        fontSize: 14,
        color: '#424242',
        lineHeight: 20,
    },
    comfortText: {
        fontSize: 14,
        color: '#33691e',
        lineHeight: 20,
    },
    infoPanel: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 12,
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#e6e9fd',
    },
    helpfulPanel: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#e6e9fd',
    },
    divider: {
        height: 1,
        backgroundColor: '#e6e9fd',
        marginVertical: 12,
    },
    expectationText: {
        fontSize: 14,
        color: '#2c3e50',
        lineHeight: 20,
    },
    instructions: {
        fontSize: 14,
        color: '#2c3e50',
        lineHeight: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
    },
    modalBody: {
        padding: 16,
    },
    closeButton: {
        padding: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 14,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 4,
    },
    saveButton: {
        backgroundColor: '#0056b3',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    stepHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    editButton: {
        padding: 4,
    },
    stepActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    continueButton: {
        backgroundColor: '#4caf50',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        marginTop: 16,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    continueButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
}); 