"use client"

import React, { useState } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, Button, Modal, ScrollView } from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { supabase } from "../lib/supabase"
import type { RootStackParamList } from "../types/navigation"
import { useGoogleAuth } from "../lib/auth/google"
import { CheckBox } from "@rneui/themed"

type AuthScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Auth">

const privacyPolicyText = `
Medic Action, desarrollada por Jorge Garza Rosales, informa a sus usuarios que la aplicación recopila y gestiona información personal con el objetivo de brindar un servicio funcional y personalizado.

Datos que recopilamos:
- Correo electrónico (para registro e inicio de sesión).
- Información relacionada con tus medicamentos (nombre, horario, estado).
- Actividades dentro de la app (historial de acciones realizadas).

Finalidad del tratamiento de los datos:
- Permitir el acceso seguro a la app mediante autenticación por correo o Google.
- Gestionar recordatorios y notificaciones sobre la toma de medicamentos.
- Mostrar un historial de actividades realizadas dentro de la aplicación.

Mecanismos de seguridad implementados:
- Autenticación segura con Supabase y Google (OAuth 2.0).
- Tokens protegidos y sesiones controladas.
- Validación de correo electrónico.
- Acceso restringido a datos solo para usuarios autenticados.

Uso de servicios de terceros:
- Supabase para autenticación y almacenamiento de datos.
- Google OAuth para inicio de sesión.
- Expo Notifications para el envío de recordatorios.

Derechos del usuario:
Puedes solicitar en cualquier momento la corrección o eliminación de tus datos personales almacenados en la aplicación, contactándonos a través del correo electrónico: [tu_correo@ejemplo.com].

Permisos solicitados:
Notificaciones push (necesarias para recordarte la toma de medicamentos).

Este aviso puede ser actualizado en futuras versiones de la app. Se recomienda revisar periódicamente para estar al tanto de posibles cambios.

Última actualización: Abril de 2025
`

export default function AuthScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [isPrivacyModalVisible, setPrivacyModalVisible] = useState(false)
  const navigation = useNavigation<AuthScreenNavigationProp>()
  const { promptAsync } = useGoogleAuth()

  async function handleGoogleSignIn() {
    try {
      if (!privacyAccepted) {
        Alert.alert("Privacy Policy", "Please accept the privacy policy to continue.")
        return
      }

      const response = await promptAsync()

      if (response?.type === "success") {
        const { id_token } = response.params

        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: id_token,
        })

        if (error) throw error

        // Navigate to the main screen after successful sign-in
        navigation.navigate("Main")
      }
    } catch (error) {
      console.error("Error signing in with Google:", error)
      Alert.alert("Error", "Ocurrió un error al iniciar sesión con Google")
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

      // Navigate to the main screen after successful sign-in
      navigation.navigate("Main")
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

          <Button title="Sign in with Google" onPress={handleGoogleSignIn} />
        </View>

        <View style={styles.privacyContainer}>
          <CheckBox
            title="I agree to the Privacy Policy"
            checked={privacyAccepted}
            onPress={() => setPrivacyModalVisible(true)}
          />
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={isPrivacyModalVisible}
        onRequestClose={() => {
          setPrivacyModalVisible(!isPrivacyModalVisible)
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Privacy Policy</Text>
            <ScrollView style={styles.modalTextContainer}>
              <Text style={styles.modalText}>{privacyPolicyText}</Text>
            </ScrollView>
            <View style={styles.modalButtons}>
              <Button
                title="Decline"
                onPress={() => {
                  setPrivacyModalVisible(false)
                  setPrivacyAccepted(false)
                }}
              />
              <Button
                title="Accept"
                onPress={() => {
                  setPrivacyModalVisible(false)
                  setPrivacyAccepted(true)
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  privacyContainer: {
    marginTop: 20,
    alignItems: "center",
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
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalTextContainer: {
    maxHeight: 300,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "justify",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
  },
})
