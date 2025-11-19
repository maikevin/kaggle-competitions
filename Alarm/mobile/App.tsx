import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from './src/screens/HomeScreen';
import AddEditAlarmScreen from './src/screens/AddEditAlarmScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { setupNotifications } from './src/services/notificationService';
import { FontSizeProvider } from './src/contexts/FontSizeContext';

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    // Initialize notification permissions and setup
    setupNotifications();
  }, []);

  return (
    <FontSizeProvider>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#6200ee',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: 'Alarms' }}
            />
            <Stack.Screen
              name="AddEditAlarm"
              component={AddEditAlarmScreen}
              options={({ route }) => ({
                title: route.params?.alarm ? 'Edit Alarm' : 'Add Alarm',
              })}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ title: 'Settings' }}
            />
          </Stack.Navigator>
          <StatusBar style="light" />
        </NavigationContainer>
      </PaperProvider>
    </FontSizeProvider>
  );
}
