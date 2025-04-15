import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons"

// Screens
import HomeScreen from "../screens/HomeScreen"
import ActivityScreen from "../screens/ActivityScreen"

// Types
import type { MainTabParamList } from "../types/navigation"

const Tab = createBottomTabNavigator<MainTabParamList>()

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline"
          } else {
            iconName = focused ? "notifications" : "notifications-outline"
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: "#1a1a1a",
        tabBarInactiveTintColor: "#686868",
        tabBarShowLabel: false,
        headerShown: true,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Medic Action",
          headerTitleStyle: {
            fontWeight: "600",
          },
        }}
      />
      <Tab.Screen
        name="Activity"
        component={ActivityScreen}
        options={{
          title: "Actividad",
          headerTitleStyle: {
            fontWeight: "600",
          },
          tabBarBadge: " ",
          tabBarBadgeStyle: {
            backgroundColor: "#eb4335",
            transform: [{ scale: 0.5 }],
            minWidth: 8,
            height: 8,
            borderRadius: 4,
          },
        }}
      />
    </Tab.Navigator>
  )
}
