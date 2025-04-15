"use client"

import React, { useState } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { supabase } from "../lib/supabase"
import type { RootStackParamList } from "../types/navigation"
import * as WebBrowser from "expo-web-browser"
import * as Google from "expo-auth-session/providers/google"
import Constants from "expo-constants"

type AuthScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Auth">

WebBrowser.maybeCompleteAuthSession()

export default function AuthScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const navigation = useNavigation<AuthScreenNavigationProp>()

  // Configure Google Sign-In
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: Constants.expoConfig?.extra?.googleExpoClientId,
    androidClientId: Constants.expoConfig?.extra?.googleAndroidClientId,
    iosClientId: Constants.expoConfig?.extra?.googleIosClientId,
    webClientId: Constants.expoConfig?.extra?.googleWebClientId,
  })

  // Handle Google Sign-In response
  React.useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params
      handleGoogleSignIn(id_token)
    }
  }, [response])

  async function handleGoogleSignIn(idToken: string) {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
      })

      if (error) throw error
    } catch (error) {
      console.error("Error with Google sign in:", error)
      Alert.alert("Error", "Ocurrió un error al iniciar sesión con Google")
    } finally {
      setLoading(false)
    }
  }

  async function handleSignIn() {
    if (!email || !password) {
      Alert.alert("Error", "Por favor ingresa tu correo y contraseña")
      return
    }

    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
    } catch (error: any) {
      console.error("Error signing in:", error)
      Alert.alert("Error", error.message || "Ocurrió un error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Medic Action</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Iniciar sesión</Text>
          <Text style={styles.subtitle}>Ingresa tus credenciales para continuar</Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor="#999999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#999999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.continueButton} onPress={handleSignIn} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.continueButtonText}>Iniciar sesión</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.googleButton} onPress={() => promptAsync()} disabled={loading}>
            <View style={styles.googleIconContainer}>
              <Image
                source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" }}
                style={styles.googleIcon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.googleButtonText}>Continuar con Google</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            ¿No tienes una cuenta?{" "}
            <Text style={styles.footerLink} onPress={() => navigation.navigate("CreateAccount")}>
              Crear cuenta
            </Text>
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    padding: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e6e6e6",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  titleContainer: {
    marginTop: 32,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  subtitle: {
    fontSize: 14,
    color: "#686868",
    marginTop: 4,
  },
  formContainer: {
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1a1a1a",
  },
  continueButton: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  continueButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 8,
    padding: 12,
  },
  googleIconContainer: {
    marginRight: 8,
  },
  googleIcon: {
    width: 18,
    height: 18,
  },
  googleButtonText: {
    color: "#1a1a1a",
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    marginTop: "auto",
    marginBottom: 16,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#686868",
    textAlign: "center",
  },
  footerLink: {
    color: "#1a1a1a",
    fontWeight: "500",
  },
})
