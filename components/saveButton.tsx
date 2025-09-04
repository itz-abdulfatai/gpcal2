import { colors, radius } from "@/constants/theme";
import { SaveButtonProps } from "@/types";
import { verticalScale } from "@/utils/styling";
import { useRouter } from "expo-router";
import { FloppyDiskIcon } from "phosphor-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

const SaveButton = ({ style, iconSize = 26, onPress }: SaveButtonProps) => {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={() => {
        onPress();
        console.log("seve button pressed");
      }}
    >
      <FloppyDiskIcon
        size={verticalScale(iconSize)}
        color={colors.black}
        weight="bold"
      />
    </TouchableOpacity>
  );
};

export default SaveButton;

const styles = StyleSheet.create({
  button: {
    // backgroundColor: colors.neutral,
    alignSelf: "flex-start",
    borderRadius: radius._12,
    borderCurve: "continuous",
    padding: 5,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
});
