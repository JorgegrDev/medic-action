"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native"
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native"
import DateTimePicker from "@react-native-community/datetimepicker"
import { supabase } from "../lib/supabase"
import { schedulePushNotification, cancelScheduledNotification } from "../lib/notifications"
import type { RootStackParamList } from "../types/navigation"

type EditMedicationScreenRouteProp = RouteProp<RootStackParamList, "EditMedication">

export default function EditMedicationScreen() {
  const [name, setName] = useState("")
  const [dosage, setDosage] = useState("")
  const [instructions, setInstructions] = useState("")
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  const [reminderTime, setReminderTime] = useState(new Date())
  const [showStartDatePicker, setShowStartDatePicker] = useState(false)
  const [showEndDatePicker, setShowEndDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)

  const navigation = useNavigation()
  const route = useRoute<EditMedicationScreenRouteProp>()
  const { id } = route.params

  useEffect(() => {
    fetchMedication()
  }, [id])

  async function fetchMedication() {
    try {
      setFetchLoading(true)

      const { data, error } = await supabase.from("medications").select("*").eq("id", id).single()

      if (error) throw error

      if (data) {
        setName(data.name)
        setDosage(data.dosage)
        setInstructions(data.instructions || "")
        setStartDate(new Date(data.start_date))
        setEndDate(new Date(data.end_date))
        setReminderTime(new Date(data.reminder_time))
      }
    } catch (error) {
      console.error("Error fetching medication:", error)
      Alert.alert("Error", "No se pudo cargar la información del medicamento")
      navigation.goBack()
    } finally {
      setFetchLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
  }

  async function handleUpdateMedication() {
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

      // Update medication in database
      const { data, error } = await supabase
        .from("medications")
        .update({
          name,
          dosage,
          instructions,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          reminder_time: reminderTime.toISOString(),
        })
        .eq("id", id)
        .select()

      if (error) throw error

      // Update notification
      if (data && data.length > 0) {
        // Cancel existing notification
        await cancelScheduledNotification(id.toString())

        // Schedule new notification
        await schedulePushNotification({
          title: "Recordatorio de medicamento",
          body: `Es hora de tomar ${name} - ${dosage}`,
          data: { medicationId: data[0].id },
          trigger: {
            hour: reminderTime.getHours(),
            minute: reminderTime.getMinutes(),
            repeats: true,
          },
          identifier: id.toString(),
        })

        // Log activity
        await supabase.from("activities").insert([
          {
            type: "medication",
            description: `Medicamento actualizado: ${name}`,
            user_id: user.id,
            related_id: data[0].id,
          },
        ])
      }

      Alert.alert("Éxito", "Medicamento actualizado correctamente")
      navigation.goBack()
    } catch (error: any) {
      console.error("Error updating medication:", error)
      Alert.alert("Error", error.message || "Ocurrió un error al actualizar el medicamento")
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteMedication() {
    Alert.alert("Confirmar eliminación", "¿Estás seguro de que deseas eliminar este medicamento?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true)

            // Cancel notification
            await cancelScheduledNotification(id.toString())

            // Delete from database
            const { error } = await supabase.from("medications").delete().eq("id", id)

            if (error) throw error

            // Log activity
            const {
              data: { user },
            } = await supabase.auth.getUser()
            if (user) {
              await supabase.from("activities").insert([
                {
                  type: "medication",
                  description: `Medicamento eliminado: ${name}`,
                  user_id: user.id,
                },
              ])
            }

            Alert.alert("Éxito", "Medicamento eliminado correctamente")
            navigation.goBack()
          } catch (error: any) {
            console.error("Error deleting medication:", error)
            Alert.alert("Error", error.message || "Ocurrió un error al eliminar el medicamento")
          } finally {
            setLoading(false)
          }
        },
      },
    ])
  }

  if (fetchLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#1a1a1a" />
      </View>
    )
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

        <TouchableOpacity style={styles.updateButton} onPress={handleUpdateMedication} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.updateButtonText}>Actualizar medicamento</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteMedication} disabled={loading}>
          <Text style={styles.deleteButtonText}>Eliminar medicamento</Text>
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
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
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
  updateButton: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 16,
  },
  updateButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
  deleteButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#eb4335",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 12,
  },
  deleteButtonText: {
    color: "#eb4335",
    fontSize: 16,
    fontWeight: "500",
  },
})
