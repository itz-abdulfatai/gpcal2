import React from "react";
import { TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import {  spacingX, spacingY } from "@/constants/theme";
export interface FabProps {
  onPress: () => void;
  style?: ViewStyle;
}
// If you want to keep it local, use the above. Otherwise, move it to types.ts and export from there.
// import { FabProps } from "@/types"; // Remove this line if defining locally.
import { PlusIcon } from "phosphor-react-native";
import { useTheme } from "@/contexts/ThemeContext";

const Fab: React.FC<FabProps> = ({ onPress, style }) => {
  const { colors } = useTheme();
  const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: spacingY._20,
    right: spacingX._20,
    backgroundColor: colors.primary,
    borderRadius: 99,
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 99,
  } as ViewStyle,
});
  return (
    <TouchableOpacity
      style={[styles.fab, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <PlusIcon color={colors.white} size={28} weight="bold" />
    </TouchableOpacity>
  );
};

export default Fab;


