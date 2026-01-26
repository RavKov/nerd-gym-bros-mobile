import { Drawer } from 'expo-router/drawer';
import { Ionicons } from "@expo/vector-icons";
import {router} from "expo-router";

export default function Layout() {
  return (
    <Drawer>
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
        name="all_exercises"
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
        name="exercise/[exerciseId]"
        options={{
          title: "Exercise",
          drawerItemStyle: { display: "none" },
        }}
      />
      <Drawer.Screen
        name="(onboarding)/verify_account"
        options={{
          title: "Verify Account",
          drawerItemStyle: { display: "none" },
        }}
      />
      <Drawer.Screen
        name="(onboarding)/choose_subscription"
        options={{
          title: "Choose Subscription",
          drawerItemStyle: { display: "none" },
        }}
      />
      <Drawer.Screen
        name="(onboarding)/choose_workout_plan"
        options={{
          title: "Choose Workout Plan",
          drawerItemStyle: { display: "none" },
        }}
      />

      <Drawer.Screen
        name="bug_report"
        options={{
          title: "Report a bug",
          drawerItemStyle: { display: "none" },
        }}
      />

      <Drawer.Screen
        name="new_feature_request"
        options={{
          title: "Request a feature",
          drawerItemStyle: { display: "none" },
        }}
      />
    </Drawer>
  );
}