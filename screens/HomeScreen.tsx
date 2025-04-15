"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { supabase } from "../lib/supabase"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RootStackParamList } from "../types/navigation"
import MedicationItem from "../components/MedicationItem"
import type { Medication } from "../types/medication"

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Main">

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<"activos" | "expirados" | "todos">("activos")
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const navigation = useNavigation<HomeScreenNavigationProp>()

  useEffect(() => {
    fetchMedications()
  }, [activeTab])

  async function fetchMedications() {
    try {
      setLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      let query = supabase.from("medications").select("*").eq("user_id", user.id)

      // Filter based on active tab
      const now = new Date().toISOString()
      if (activeTab === "activos") {
        query = query.gte("end_date", now)
      } else if (activeTab === "expirados") {
        query = query.lt("end_date", now)
      }

      const { data, error } = await query.order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching medications:", error)
        return
      }

      setMedications(data || [])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMedication = () => {
    navigation.navigate("AddMedication")
  }

  const renderMedicationItem = ({ item }: { item: Medication }) => (
    <MedicationItem medication={item} onPress={() => navigation.navigate("EditMedication", { id: item.id })} />
  )

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab("activos")}
          style={[styles.tabButton, activeTab === "activos" && styles.activeTabButton]}
        >
          <Text style={[styles.tabText, activeTab === "activos" && styles.activeTabText]}>Activos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("expirados")}
          style={[styles.tabButton, activeTab === "expirados" && styles.activeTabButton]}
        >
          <Text style={[styles.tabText, activeTab === "expirados" && styles.activeTabText]}>Expirados</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("todos")}
          style={[styles.tabButton, activeTab === "todos" && styles.activeTabButton]}
        >
          <Text style={[styles.tabText, activeTab === "todos" && styles.activeTabText]}>Todos</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#1a1a1a" />
        ) : medications.length > 0 ? (
          <FlatList
            data={medications}
            renderItem={renderMedicationItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay medicamentos {activeTab}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.addButton} onPress={handleAddMedication}>
        <Ionicons name="add" size={24} color="#ffffff" />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e6e6e6",
  },
  tabButton: {
    marginRight: 16,
    paddingBottom: 8,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: "#1a1a1a",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#686868",
  },
  activeTabText: {
    color: "#1a1a1a",
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
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
})
