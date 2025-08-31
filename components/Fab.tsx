import React from "react";
import { TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { FabProps } from "@/types";
import { PlusIcon } from "phosphor-react-native";

const Fab: React.FC<FabProps> = ({ onPress, style }) => {
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
