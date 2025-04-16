import React, { useState, useEffect } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { StatusBar, View, Text, FlatList, AppRegistry, Alert, Platform, Button } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { supabase } from "./lib/supabase"
import type { Session } from "@supabase/supabase-js"
import { registerRootComponent } from "expo"
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'

// Screens
import AuthScreen from "./screens/AuthScreen"
import CreateAccountScreen from "./screens/CreateAccountScreen"
import MainTabNavigator from "./navigation/MainTabNavigator"
import AddMedicationScreen from "./screens/AddMedicationScreen"
import EditMedicationScreen from "./screens/EditMedicationScreen"

// Types
import type { RootStackParamList } from "./types/navigation"

const Stack = createNativeStackNavigator<RootStackParamList>()

async function registerForPushNotificationsAsync() {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      return new Promise((resolve) => {
        Alert.alert(
          'Notification Permission',
          'Would you like to receive notifications for your medications?',
          [
            {
              text: 'Decline',
              onPress: () => {
                console.log('Notification permission declined');
                resolve(null);
              },
              style: 'cancel',
            },
            {
              text: 'Allow',
              onPress: async () => {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
                if (finalStatus === 'granted') {
                  token = await Notifications.getExpoPushTokenAsync({
                    projectId: 'your-project-id',
                  });
                  console.log(token);
                  resolve(token);
                } else {
                  console.log('Notification permission still not granted');
                  resolve(null);
                }
              },
            },
          ],
          { cancelable: false }
        );
      });
    } else {
      token = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id',
      });
      console.log(token);
      return token;
    }
  } else {
    Alert.alert('Must use physical device for Push Notifications');
    return null;
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [notificationToken, setNotificationToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    registerForPushNotificationsAsync().then(token => {
      setNotificationToken(token || null);
    });

    return () => subscription.unsubscribe()
  }, [])

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {session ? (
            <Stack.Screen name="Main" component={MainTabNavigator} />
          ) : (
            <>
              <Stack.Screen name="Auth" component={AuthScreen} />
              <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}

registerRootComponent(App)
