import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

type LoadingViewProps = {
  message?: string;
  size?: "small" | "large";
};

export function LoadingView({ message, size = "large" }: LoadingViewProps) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size={size} color="#1D4ED8" />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 24,
  },
  message: {
    color: "#64748B",
    fontSize: 14,
    textAlign: "center",
  },
});
