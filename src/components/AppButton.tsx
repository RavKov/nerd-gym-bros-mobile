import React from "react";
import { Pressable, StyleProp, StyleSheet, Text, TextStyle, ViewStyle } from "react-native";

export type AppButtonProps = {
  title: string;
  onPress?: () => void | Promise<void>;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "link";
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function AppButton({
  title,
  onPress,
  disabled,
  variant = "primary",
  style,
  textStyle,
}: AppButtonProps) {
  const isLink = variant === "link";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" && styles.primary,
        variant === "secondary" && styles.secondary,
        isLink && styles.link,
        pressed && styles.buttonPressed,
        disabled && styles.buttonDisabled,
        style,
      ]}
    >
      <Text
        style={[
          styles.textBase,
          variant === "primary" && styles.primaryText,
          (variant === "secondary" || isLink) && styles.secondaryText,
          isLink && styles.linkText,
          textStyle,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 5,
    alignItems: "center",
  },
  primary: {
    backgroundColor: "#007BFF",
  },
  secondary: {
    borderColor: "#007BFF",
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  link: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    backgroundColor: "transparent",
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  textBase: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  primaryText: {
    color: "#FFFFFF",
  },
  secondaryText: {
    color: "#007BFF",
  },
  linkText: {
    textDecorationLine: "underline",
  },
});
