import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useAuth0 } from 'react-native-auth0';

export function LoginScreen() {
    const { authorize } = useAuth0();

    const handleLogin = async () => {
        try {
            await authorize();
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Image
                    source={require('../../assets/logo.png')} // Add your logo
                    style={styles.logo}
                />
                <Text style={styles.title}>ReassurED</Text>
                <Text style={styles.subtitle}>Your Mental Health Companion</Text>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={handleLogin}
                >
                    <Text style={styles.loginButtonText}>Sign In with Auth0</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'space-between',
        padding: 20,
    },
    header: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
    },
    footer: {
        marginBottom: 40,
    },
    loginButton: {
        backgroundColor: '#0056b3',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
}); 