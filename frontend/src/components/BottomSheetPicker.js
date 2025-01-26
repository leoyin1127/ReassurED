import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function BottomSheetPicker({
    value,
    options,
    onSelect,
    placeholder,
    label
}) {
    const [isVisible, setIsVisible] = useState(false);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <>
            <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setIsVisible(true)}
            >
                <Text style={[
                    styles.selectedText,
                    !selectedOption && styles.placeholderText
                ]}>
                    {selectedOption ? selectedOption.label : placeholder}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>

            <Modal
                visible={isVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setIsVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <SafeAreaView style={styles.modalContainer}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{label}</Text>
                                <TouchableOpacity
                                    onPress={() => setIsVisible(false)}
                                    style={styles.closeButton}
                                >
                                    <Ionicons name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.optionsContainer}>
                                {options.map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[
                                            styles.optionItem,
                                            value === option.value && styles.selectedOption
                                        ]}
                                        onPress={() => {
                                            onSelect(option.value);
                                            setIsVisible(false);
                                        }}
                                    >
                                        <Text style={[
                                            styles.optionText,
                                            value === option.value && styles.selectedOptionText
                                        ]}>
                                            {option.label}
                                        </Text>
                                        {value === option.value && (
                                            <Ionicons name="checkmark" size={24} color="#0056b3" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </SafeAreaView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    selectButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginTop: 4,
    },
    selectedText: {
        fontSize: 16,
        color: '#333',
    },
    placeholderText: {
        color: '#999',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    modalContainer: {
        paddingBottom: 20,
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
        color: '#333',
    },
    closeButton: {
        padding: 4,
    },
    optionsContainer: {
        padding: 8,
    },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 8,
        marginVertical: 2,
    },
    selectedOption: {
        backgroundColor: '#f0f9ff',
    },
    optionText: {
        fontSize: 16,
        color: '#333',
    },
    selectedOptionText: {
        color: '#0056b3',
        fontWeight: '500',
    },
}); 