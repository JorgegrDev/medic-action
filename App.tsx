"use client"

import { useEffect, useState } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { StatusBar, View, Text, FlatList, AppRegistry, Alert, Platform } from "react-native"
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
  let token

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }
    if (finalStatus !== 'granted') {
      Alert.alert('Failed to get push token for push notification!')
      return
    }
    token = await Notifications.getExpoPushTokenAsync({
      projectId: '88a5aec4-a846-44e7-95cc-c05afd42dc4a',
    })
    console.log(token)
  } else {
    Alert.alert('Must use physical device for Push Notifications')
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    })
  }

  return token
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [todos, setTodos] = useState<{ id: number; title: string }[]>([])

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

    // Fetch todos
    const getTodos = async () => {
      try {
        const { data: todos, error } = await supabase.from("todos").select()
        if (error) {
          if (error instanceof Error) {
            console.error("Error fetching todos:", error instanceof Error ? error.message : String(error))
          } else {
            console.error("Error fetching todos:", error)
          }
          return
        }
        if (todos && todos.length > 0) {
          setTodos(todos)
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error fetching todos:", error.message)
        } else {
          console.error("Error fetching todos:", String(error))
        }
      }
    }

    getTodos()

    // Register for push notifications
    registerForPushNotificationsAsync()

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return null
  }

  const TodoList = () => (
    <View style={{ padding: 20 }}>
      <Text>Todo List</Text>
      <FlatList
        data={todos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <Text key={item.id}>{item.title}</Text>}
      />
    </View>
  )

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {session ? (
            <>
              <Stack.Screen
                name="Main"
                component={MainTabNavigator}
                options={{
                  headerRight: () => <TodoList />,
                  headerShown: true,
                }}
              />
              <Stack.Screen
                name="AddMedication"
                component={AddMedicationScreen}
                options={{
                  headerShown: true,
                  title: "Agregar Medicamento",
                  headerBackTitle: "Atrás",
                }}
              />
              <Stack.Screen
                name="EditMedication"
                component={EditMedicationScreen}
                options={{
                  headerShown: true,
                  title: "Editar Medicamento",
                  headerBackTitle: "Atrás",
                }}
              />
            </>
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

AppRegistry.registerComponent('main', () => App);
registerRootComponent(App);
