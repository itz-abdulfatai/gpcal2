import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { CalculationCardProps, CalculationsListType } from "@/types";

const CalculationsList = ({ data: calculations }: CalculationsListType) => {
  return (
    <View>
      <Text>CalculationsList</Text>
      {calculations.map((calc) => (
        <CalculationCard key={calc.id} calculation={calc} />
      ))}
    </View>
  );
};

export default CalculationsList;

const styles = StyleSheet.create({});

const CalculationCard = ({ calculation }: CalculationCardProps) => {
  return (
    <View>
      <Text>{calculation.name}</Text>
    </View>
  );
};
