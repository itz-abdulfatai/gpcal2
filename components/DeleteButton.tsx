import { colors, radius } from "@/constants/theme";
import { DeleteButtonProps } from "@/types";
import { verticalScale } from "@/utils/styling";
import { TrashIcon } from "phosphor-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

const DeleteButton = ({ style, iconSize = 26, onPress }: DeleteButtonProps) => {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <TrashIcon
        size={verticalScale(iconSize)}
        color={colors.rose}
        // weight="bold"
      />
    </TouchableOpacity>
  );
};

export default DeleteButton;

const styles = StyleSheet.create({
  button: {
    // backgroundColor: colors.neutral,
    alignSelf: "flex-end",
    borderRadius: radius._12,
    borderCurve: "continuous",
    padding: 5,
    // borderWidth: 1,
    // borderColor: colors.secondary,
  },
});
