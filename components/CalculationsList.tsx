import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { CalculationCardProps, CalculationsListType } from "@/types";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import Typo from "./typo";
import { CaretRightIcon } from "phosphor-react-native";
import { formatDate } from "@/utils/formatDate";
import Loading from "./Loading";

const CalculationsList = ({
  data: calculations,
  emptyListMessage,
  loading,
  title,
}: CalculationsListType) => {
  return (
    <View style={styles.calculationsContainer}>
      <Typo style={styles.headings}>{title ? title : "Your Calculations"}</Typo>
      {loading && (
        <View style={{ alignItems: "center" }}>
          <Loading />
        </View>
      )}
      {calculations.length > 0 ? (
        calculations.map((calc) => (
          <CalculationCard key={calc.id} calculation={calc} />
        ))
      ) : (
        <View style={{ alignItems: "center", paddingTop: spacingY._10 }}>
          <Typo color={colors.secondary2}>{emptyListMessage}</Typo>
        </View>
      )}
    </View>
  );
};

export default CalculationsList;

const CalculationCard = ({ calculation }: CalculationCardProps) => {
  const handleOpenCalculation = (id: string) => {
    // Handle opening the calculation details
  };

  return (
    <TouchableOpacity
      style={styles.calculationCard}
      onPress={() => {
        handleOpenCalculation(calculation.id);
      }}
    >
      <View>
        <Typo size={25} fontWeight={"bold"}>
          {calculation.name}
        </Typo>
        {calculation.gpa != null && (
          <Typo
            color={colors.primary}
            fontWeight="400"
            size={23}
            style={{ textTransform: "uppercase" }}
          >
            Gpa: {calculation.gpa}
          </Typo>
        )}

        <Typo color={colors.neutral}>
          Last Updated{" "}
          {calculation.lastUpdated
            ? formatDate(calculation.lastUpdated)
            : "N/A"}
        </Typo>
      </View>
      <CaretRightIcon color={colors.neutral} size={15} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  headings: {
    fontSize: 20,
    fontWeight: "bold",
  },
  calculationsContainer: {
    gap: spacingY._20,
  },
  calculationCard: {
    paddingVertical: spacingY._12,
    paddingHorizontal: spacingX._20,
    borderWidth: 2,
    borderColor: colors.secondary,
    borderRadius: radius._10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
