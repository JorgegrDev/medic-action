"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native"
import { useNavigation } from "@react-navigation/native"
import DateTimePicker from "@react-native-community/datetimepicker"
import { supabase } from "../lib/supabase"
import { schedulePushNotification } from "../lib/notifications"

export default function AddMedicationScreen() {
  const [name, setName] = useState("")
  const [dosage, setDosage] = useState("")
  const [instructions, setInstructions] = useState("")
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) // Default to 1 week
  const [reminderTime, setReminderTime] = useState(new Date())
  const [showStartDatePicker, setShowStartDatePicker] = useState(false)
  const [showEndDatePicker, setShowEndDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [loading, setLoading] = useState(false)

  const navigation = useNavigation()

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
  }

  async function handleAddMedication() {
    if (!name || !dosage) {
      Alert.alert("Error", "Por favor completa los campos obligatorios")
      return
    }

    try {
      setLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        Alert.alert("Error", "Usuario no autenticado")
        return
      }

      // Add medication to database
      const { data, error } = await supabase
        .from("medications")
        .insert([
          {
            name,
            dosage,
            instructions,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            reminder_time: reminderTime.toISOString(),
            user_id: user.id,
          },
        ])
        .select()

      if (error) throw error

      // Schedule notification
      if (data && data.length > 0) {
        await schedulePushNotification({
          title: "Recordatorio de medicamento",
          body: `Es hora de tomar ${name} - ${dosage}`,
          data: { medicationId: data[0].id },
          trigger: {
            hour: reminderTime.getHours(),
            minute: reminderTime.getMinutes(),
            repeats: true,
          },
        })

        // Log activity
        await supabase.from("activities").insert([
          {
            type: "medication",
            description: `Medicamento agregado: ${name}`,
            user_id: user.id,
            related_id: data[0].id,
          },
        ])
      }

      Alert.alert("Éxito", "Medicamento agregado correctamente")
      navigation.goBack()
    } catch (error: any) {
      console.error("Error adding medication:", error)
      Alert.alert("Error", error.message || "Ocurrió un error al agregar el medicamento")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nombre del medicamento *</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ej. Paracetamol" />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Dosis *</Text>
          <TextInput style={styles.input} value={dosage} onChangeText={setDosage} placeholder="Ej. 500mg, 1 pastilla" />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Instrucciones</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={instructions}
            onChangeText={setInstructions}
            placeholder="Ej. Tomar con agua"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Fecha de inicio</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartDatePicker(true)}>
            <Text>{formatDate(startDate)}</Text>
          </TouchableOpacity>
          {showStartDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowStartDatePicker(false)
                if (selectedDate) {
                  setStartDate(selectedDate)
                }
              }}
            />
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Fecha de finalización</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowEndDatePicker(true)}>
            <Text>{formatDate(endDate)}</Text>
          </TouchableOpacity>
          {showEndDatePicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowEndDatePicker(false)
                if (selectedDate) {
                  setEndDate(selectedDate)
                }
              }}
            />
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Hora del recordatorio</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowTimePicker(true)}>
            <Text>{formatTime(reminderTime)}</Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={reminderTime}
              mode="time"
              display="default"
              onChange={(event, selectedDate) => {
                setShowTimePicker(false)
                if (selectedDate) {
                  setReminderTime(selectedDate)
                }
              }}
            />
          )}
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddMedication} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.addButtonText}>Agregar medicamento</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    color: "#1a1a1a",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1a1a1a",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 8,
    padding: 12,
  },
  addButton: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 16,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
})
