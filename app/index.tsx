import React from "react";
import { StyleSheet, View } from "react-native";

const Index = () => {
  return (
    <View style={styles.container}>
      {/* <Image resizeMode="contain" style={styles.logo} source={} /> */}
    </View>
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
