import React from "react";
import { StyleSheet, View } from "react-native";
import Typo from "../components/typo";
import ScreenWrapper from "@/components/ScreenWrapper";

const Index = () => {
  return (
    <ScreenWrapper style={styles.container}>
      <Typo>home</Typo>
      {/* <Image resizeMode="contain" style={styles.logo} source={} /> */}
    </ScreenWrapper>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: colors.neutral900,
  },
  logo: {
    aspectRatio: 1,
    height: "30%",
  },
});
