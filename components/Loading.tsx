import { colors } from "@/constants/theme";
import React from "react";
import { ActivityIndicator, ActivityIndicatorProps, View } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
  
export default function Loading({
  size = "large",
  color,
}: ActivityIndicatorProps) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size={size} color={color || colors.primary} />
    </View>
  );
}

// const styles = StyleSheet.create({});
