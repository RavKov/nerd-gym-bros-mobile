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
                    title: "Home",
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={size ?? 24} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="all_exercises/index"
                options={{
                    title: "All Exercises",
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="barbell-outline" size={size ?? 24} color={color} />
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
                name="all_exercises/[exerciseId]"
                options={{
                    title: "Exercise",
                    drawerItemStyle: { display: "none" },
                }}
            />
        </Drawer>
    );
}