import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ProfileScreen } from '../screens/ProfileScreen';
import { HealthFlowNavigator } from './HealthFlowNavigator';
import { PathwayStatusScreen } from '../screens/PathwayStatusScreen';

const Tab = createBottomTabNavigator();

export function BottomTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    } else if (route.name === 'FindCare') {
                        iconName = focused ? 'medical' : 'medical-outline';
                    } else if (route.name === 'Status') {
                        iconName = focused ? 'time' : 'time-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#0056b3',
                tabBarInactiveTintColor: 'gray',
            })}
        >
            <Tab.Screen
                name="FindCare"
                component={HealthFlowNavigator}
                options={{
                    headerShown: false,
                    title: 'Find Care'
                }}
            />
            <Tab.Screen
                name="Status"
                component={PathwayStatusScreen}
                options={{
                    headerTitle: 'Care Status',
                    title: 'Status'
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    headerTitle: 'My Profile',
                    title: 'Profile'
                }}
            />
        </Tab.Navigator>
    );
} 