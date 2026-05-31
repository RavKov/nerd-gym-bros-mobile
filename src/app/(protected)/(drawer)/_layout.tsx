import { Drawer } from "expo-router/drawer";
import { Ionicons } from "@expo/vector-icons";

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        // headerShown: false,
        drawerActiveTintColor: "#1D4ED8",
        drawerInactiveTintColor: "#64748B",
        drawerStyle: { backgroundColor: "#F8FAFF" },
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: "Workout progress",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="fitness-outline" size={size ?? 24} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="all_exercises"
        options={{
          title: "All Exercises",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size ?? 24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          title: "Settings",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size ?? 24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="gyms"
        options={{
          title: "Gyms",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="location-outline" size={size ?? 24} color={color} />
          ),
        }}
      />
      {/* <Drawer.Screen 
                name="current_workout"
                options={{
                    title: "Current Workout",
                    drawerItemStyle: { display: "none" },
                }}
            /> */}
    </Drawer>
  );
}
