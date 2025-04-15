import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import type { Medication } from "../types/medication"

interface MedicationItemProps {
  medication: Medication
  onPress: () => void
}

export default function MedicationItem({ medication, onPress }: MedicationItemProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
  }

  const isActive = new Date(medication.end_date) >= new Date()

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.dotContainer}>
        <View style={[styles.dot, isActive ? styles.activeDot : styles.inactiveDot]} />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{medication.name}</Text>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.dosage}>{medication.dosage}</Text>
        {medication.instructions && <Text style={styles.instructions}>{medication.instructions}</Text>}
        <View style={styles.footer}>
          <Text style={styles.dateInfo}>
            {formatDate(medication.start_date)} - {formatDate(medication.end_date)}
          </Text>
          <Text style={styles.timeInfo}>Recordatorio: {formatTime(medication.reminder_time)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dotContainer: {
    marginRight: 12,
    paddingTop: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: "#34a853", // Google green
  },
  inactiveDot: {
    backgroundColor: "#eb4335", // Google red
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  editButton: {
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  editButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "500",
  },
  dosage: {
    fontSize: 14,
    color: "#1a1a1a",
    marginBottom: 4,
  },
  instructions: {
    fontSize: 14,
    color: "#686868",
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  dateInfo: {
    fontSize: 12,
    color: "#686868",
  },
  timeInfo: {
    fontSize: 12,
    color: "#686868",
  },
})
