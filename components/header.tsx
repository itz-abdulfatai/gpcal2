import { HeaderProps } from "@/types";
import React from "react";
import { StyleSheet, View } from "react-native";
import Typo from "./typo";
import { spacingY } from "@/constants/theme";

const Header = ({ title = "", leftIcon, style, rightIcon }: HeaderProps) => {
  return (
    <View style={[styles.container, style]}>
      {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
      {title && (
        <Typo
          size={22}
          fontWeight={"600"}
          style={{
            textAlign: "center",
            width: leftIcon ? "82%" : "100%",
            textTransform: "capitalize",
          }}
        >
          {title}
        </Typo>
      )}
      {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    paddingVertical: spacingY._10,
  },
  leftIcon: {
    alignSelf: "flex-start",
  },
  rightIcon: {
    alignSelf: "flex-end",
  },
});
