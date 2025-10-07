import { StyleSheet, TouchableOpacity, View } from "react-native";
import React, { useMemo } from "react";
import { semesterCardProps, semestersListType, SemesterType } from "@/types";
import {  radius, spacingX, spacingY } from "@/constants/theme";
import Typo from "./typo";
import { CaretRightIcon } from "phosphor-react-native";
import { formatDate } from "@/utils/formatDate";
import Loading from "./Loading";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";

const SemestersList = ({
  data: semesters,
  emptyListMessage,
  loading,
  title,
}: semestersListType) => {
    const { colors } = useTheme();

    const styles = useMemo(() => StyleSheet.create({
  headings: {
    fontSize: 20,
    fontWeight: "bold",
  },
  semestersContainer: {
    gap: spacingY._20,
  },
  semesterCard: {
    paddingVertical: spacingY._12,
    paddingHorizontal: spacingX._20,
    borderWidth: 2,
    borderColor: colors.secondary,
    borderRadius: radius._10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
}), [colors]);
  
  return (
    <View style={styles.semestersContainer}>
      <Typo style={styles.headings}>{title ? title : "Your Semesters"}</Typo>
      {loading && (
        <View style={{ alignItems: "center" }}>
          <Loading />
        </View>
      )}
      {semesters.length > 0 ? (
        semesters.map((sem) => (
          <SemesterCard key={sem.id.toString()} semester={sem} />
        ))
      ) : (
        <View style={{ alignItems: "center", paddingTop: spacingY._10 }}>
          <Typo color={colors.secondary2}>{emptyListMessage}</Typo>
        </View>
      )}
    </View>
  );
};

export default SemestersList;

const SemesterCard = ({ semester }: semesterCardProps) => {
    const { colors } = useTheme();
  const router = useRouter();
  const handleOpenSemester = (semester: SemesterType) => {
    // Handle opening the semester
    router.push({
      pathname: "/(modals)/semestersModal",
      params: { id: semester.id?.toString() },
    });
  };

  const styles = StyleSheet.create({
  headings: {
    fontSize: 20,
    fontWeight: "bold",
  },
  semestersContainer: {
    gap: spacingY._20,
  },
  semesterCard: {
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

  return (
    <TouchableOpacity
      style={styles.semesterCard}
      onPress={() => {
        handleOpenSemester(semester);
      }}
    >
      <View>
        <Typo size={25} fontWeight={"bold"}>
          {semester.name}
        </Typo>
        {semester.gpa != null && (
          <Typo
            color={colors.primary}
            fontWeight="400"
            size={23}
            style={{ textTransform: "uppercase" }}
          >
            Gpa: {semester.gpa}
          </Typo>
        )}

        <Typo color={colors.neutral}>
          Last Updated{" "}
          {semester.lastUpdated ? formatDate(semester.lastUpdated) : "N/A"}
        </Typo>
      </View>
      <CaretRightIcon color={colors.neutral} size={15} />
    </TouchableOpacity>
  );
};


