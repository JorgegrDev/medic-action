"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from "react-native"
import { supabase } from "../lib/supabase"
import type { Activity } from "../types/activity"
import ActivityItem from "../components/ActivityItem"

export default function ActivityScreen() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string | null>(null)

  useEffect(() => {
    fetchActivities()
  }, [filter])

  async function fetchActivities() {
    try {
      setLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      let query = supabase.from("activities").select("*").eq("user_id", user.id)

      if (filter) {
        query = query.eq("type", filter)
      }

      const { data, error } = await query.order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching activities:", error)
        return
      }

      setActivities(data || [])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFilter = () => {
    // Simple toggle between null (all) and 'medication' for this example
    // You could expand this with a modal or dropdown for more filter options
    setFilter(filter === null ? "medication" : null)
  }

  const renderActivityItem = ({ item }: { item: Activity }) => <ActivityItem activity={item} />

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.filterButton} onPress={toggleFilter}>
          <Text style={styles.filterButtonText}>{filter ? `Filtrar: ${filter}` : "Filtrar"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#1a1a1a" />
        ) : activities.length > 0 ? (
          <FlatList
            data={activities}
            renderItem={renderActivityItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay actividades recientes</Text>
          </View>
        )}
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
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e6e6e6",
  },
  filterButton: {
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#686868",
    fontSize: 16,
  },
})
