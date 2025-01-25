import { createStackNavigator } from '@react-navigation/stack';
import { useAuth0 } from 'react-native-auth0';
import { LoginScreen } from '../screens/LoginScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

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
                    name="Profile"
                    component={ProfileScreen}
                    options={{
                        headerTitle: 'My Profile',
                        headerLeft: null // Disable back button
                    }}
                />
            )}
        </Stack.Navigator>
    );
} 