import CalculationsList from "@/components/CalculationsList";
import Header from "@/components/header";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/typo";
import { dummyCalculations } from "@/constants/data";
import { spacingX, spacingY } from "@/constants/theme";
import { calculationType } from "@/types";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

export default function HomeScreen() {
  const [calculations, setCalculations] =
    useState<calculationType[]>(dummyCalculations);
  return (
    <ScreenWrapper>
      <Header title="GPCal" />
      <ScrollView style={styles.container}>
        <Typo size={25} fontWeight="bold">
          Your Calculations
        </Typo>
        <CalculationsList data={calculations} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  calculationsContainer: {
    gap: spacingY._15,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacingX._20,
    marginTop: spacingY._20,
    gap: spacingY._10,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
