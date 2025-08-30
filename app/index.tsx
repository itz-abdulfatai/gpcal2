import React from "react";
import { StyleSheet, View } from "react-native";

const index = () => {
  return (
    <View style={styles.container}>
      {/* <Image resizeMode="contain" style={styles.logo} source={} /> */}
    </View>
  );
};

export default index;

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
