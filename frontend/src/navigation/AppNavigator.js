import { createStackNavigator } from '@react-navigation/stack';
import { useAuth0 } from 'react-native-auth0';
import { LoginScreen } from '../screens/LoginScreen';
import { BottomTabNavigator } from './BottomTabNavigator';
import { PathwayStatusScreen } from '../screens/PathwayStatusScreen';

const Stack = createStackNavigator();

export function AppNavigator() {
    const { user } = useAuth0();

    return (
        <Stack.Navigator>
            {!user ? (
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ headerShown: false }}
                />
            ) : (
                <Stack.Screen
                    name="Main"
                    component={BottomTabNavigator}
                    options={{ headerShown: false }}
                />
            )}
            <Stack.Screen
                name="PathwayStatus"
                component={PathwayStatusScreen}
                options={{
                    title: 'Hospital Status',
                    headerBackTitle: 'Back',
                }}
            />
        </Stack.Navigator>
    );
} 