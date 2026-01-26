import React from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  TextStyle,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
export type AppOptionsItemProps = {
  title: string;
    subtitle: string;
  onPress: () => void | Promise<void>;
  iconName: React.ComponentProps<typeof Ionicons>["name"];
};

export function AppOptionsItem({
  title,
  subtitle,
  onPress,
  iconName,
}: AppOptionsItemProps) {

  return (
    <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
        <View style={styles.rowLeft}>
            <View style={styles.iconWrap}>
                <Ionicons name={iconName} size={20} color="#1D4ED8" />
            </View>
            <View style={styles.rowTextWrap}>
                <Text style={styles.rowTitle}>{title}</Text>
                <Text style={styles.rowSubtitle}>{subtitle}</Text>
            </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#64748B" />
    </Pressable>

  );
}

const styles = StyleSheet.create({

	row: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 14,
		paddingVertical: 12,
	},
	rowPressed: {
		backgroundColor: "#EFF6FF",
	},
    	rowLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		flex: 1,
	},
	iconWrap: {
		width: 34,
		height: 34,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#EFF6FF",
	},
	rowTextWrap: {
		flex: 1,
		gap: 2,
	},
	rowTitle: {
		fontSize: 16,
		fontWeight: "700",
		color: "#0F172A",
	},
    rowTitleDanger: {
		fontSize: 16,
		fontWeight: "700",
		color: "#DC2626",
	},
	rowSubtitle: {
		fontSize: 13,
		color: "#475569",
	},

});
