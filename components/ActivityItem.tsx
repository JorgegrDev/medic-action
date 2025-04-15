import { View, Text, StyleSheet } from "react-native"
import type { Activity } from "../types/activity"

interface ActivityItemProps {
  activity: Activity
}

export default function ActivityItem({ activity }: ActivityItemProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <View style={styles.container}>
      <View style={styles.dotContainer}>
        <View style={styles.dot} />
      </View>
      <View style={styles.content}>
        <Text style={styles.description}>{activity.description}</Text>
        <Text style={styles.timestamp}>
          {formatDate(activity.created_at)} {formatTime(activity.created_at)}
        </Text>
      </View>
    </View>
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
    backgroundColor: "#1a1a1a",
  },
  content: {
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: "#1a1a1a",
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: "#686868",
  },
})
