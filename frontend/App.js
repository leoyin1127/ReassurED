import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Auth0Provider } from 'react-native-auth0';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import config from './auth0-configuration';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { HospitalProvider } from './src/context/HospitalContext';

function App() {
  useEffect(() => {
    // Verify AsyncStorage is working
    const testAsyncStorage = async () => {
      try {
        await AsyncStorage.setItem('test', 'test');
        await AsyncStorage.removeItem('test');
        console.log('AsyncStorage is working properly');
      } catch (error) {
        console.error('AsyncStorage test failed:', error);
      }
    };

    testAsyncStorage();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Auth0Provider
        domain={config.domain}
        clientId={config.clientId}
        redirectUri={`${config.bundleIdentifier}.auth0://${config.domain}/ios/${config.bundleIdentifier}/callback`}
        logoutUri={`${config.bundleIdentifier}.auth0://${config.domain}/ios/${config.bundleIdentifier}/logout`}
      >
        <AuthProvider>
          <HospitalProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </HospitalProvider>
        </AuthProvider>
      </Auth0Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  header: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
});

export default App;