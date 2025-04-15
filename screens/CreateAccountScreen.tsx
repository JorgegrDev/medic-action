"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native"
import { supabase } from "../lib/supabase"

export default function CreateAccountScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSignUp() {
    if (!email || !password) {
      Alert.alert("Error", "Por favor completa todos los campos")
      return
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden")
      return
    }

    try {
      setLoading(true)
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      Alert.alert(
        "Registro exitoso",
        "Se ha enviado un correo de confirmación a tu dirección de email. Por favor verifica tu correo para continuar.",
      )
    } catch (error: any) {
      console.error("Error signing up:", error)
      Alert.alert("Error", error.message || "Ocurrió un error al crear la cuenta")
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
          <Text style={styles.title}>Crear tu cuenta</Text>
          <Text style={styles.subtitle}>Introduce tu correo para iniciar sesión</Text>
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

          <TextInput
            style={styles.input}
            placeholder="Confirmar contraseña"
            placeholderTextColor="#999999"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity style={styles.continueButton} onPress={handleSignUp} disabled={loading}>
            {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.continueButtonText}>Continuar</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Al dar clic en continuar, aceptas nuestros <Text style={styles.footerLink}>Avisos de</Text> privacidad
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
  footer: {
    marginTop: "auto",
    marginBottom: 16,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#686868",
    textAlign: "center",
  },
  footerLink: {
    color: "#1a1a1a",
    textDecorationLine: "underline",
  },
})
