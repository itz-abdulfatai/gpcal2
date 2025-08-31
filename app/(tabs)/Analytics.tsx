import { ScrollView, StyleSheet } from "react-native";
import React, { useEffect } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import Header from "@/components/header";
import { calculationType, CourseType } from "@/types";
import { dummyCalculations, dummyCourses } from "@/constants/data";
import Typo from "@/components/typo";
import { View } from "react-native";
import { spacingX } from "@/constants/theme";

const Analytics = () => {
  const [calculation, setCalculation] = React.useState<calculationType | null>(
    null
  );

  const [courses, setCourses] = React.useState<CourseType[]>([]);

  useEffect(() => {
    // Fetch or calculate analytics data here based on calculation
    setCalculation(dummyCalculations[0]);

    // Dummy courses data
    const calculationCourses = dummyCourses.filter(
      (course) => course.calculationId === calculation?.id
    );
    if (calculationCourses) {
      setCourses(calculationCourses);
    }
  }, [calculation?.id]);

  console.log(calculation);
  console.log(courses.length);

  return (
    <ScreenWrapper>
      <Header title={calculation?.name} />
      <ScrollView style={styles.container}>
        <Typo style={styles.headings}>Results Summary</Typo>
        <View>
          <View>
            <Typo>Semester GPA</Typo>
            <Typo>{calculation?.gpa}</Typo>
          </View>
          <View>Cumulative CGPA</View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default Analytics;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacingX._20,
    gap: spacingX._20,
  },
  headings: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
