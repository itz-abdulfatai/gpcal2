import { colors, spacingY } from "@/constants/theme";
import { ModalWrapperProps } from "@/types";
import React from "react";
import { Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const isIos = Platform.OS === "ios";
const ModalWrapper = ({
  style,
  children,
  bg = colors.white,
}: ModalWrapperProps) => {
  return (
    <SafeAreaView
      style={[styles.container, style, { backgroundColor: bg }, style && style]}
    >
      {children}
    </SafeAreaView>
  );
};

export default ModalWrapper;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: isIos ? spacingY._15 : 5,
    paddingBottom: isIos ? spacingY._20 : spacingY._10,
  },
});
