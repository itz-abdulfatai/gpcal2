import { ScrollView, StyleSheet, View, Keyboard } from "react-native";
import React, { useEffect, useState } from "react";
import ModalWrapper from "@/components/ModalWrapper";
import Typo from "@/components/typo";
import Header from "@/components/header";
import BackButton from "@/components/BackButton";
import PromptDialog from "@/components/PromptDialog";
import { useRouter } from "expo-router";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import Input from "@/components/Input";
import { Dropdown } from "react-native-element-dropdown";
import { CourseType, Semester } from "@/types";
import { verticalScale } from "@/utils/styling";
import Button from "@/components/Button";
import { PlusIcon } from "phosphor-react-native";
// import { dummyCourses } from "@/constants/data";
import Table from "@/components/Table";
import { ChartLineUpIcon } from "phosphor-react-native";

const CalculationsModal = () => {
  const [calculationTitle, setCalculationTitle] = useState<string>("test cal");
  const router = useRouter();
  const [promptVisible, setPromptVisible] = useState(false);
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [course, setCourse] = useState<CourseType>({
    id: "",
    uid: "",
    calculationId: "",
    name: "",
    creditUnit: null,
    GradePoint: null,
  });
  const [semester, setSemester] = useState<Semester>({
    id: "",
    gpa: null,
    name: "",
    uid: "",
    calculationId: "1",
  });

  const [semesters, setSemesters] = useState<Semester[]>([]);

  const openChooseCalculationModal = () => {
    setPromptVisible(true);
  };

  const addCourse = () => {
    if (!course.GradePoint || !course.name || !course.creditUnit) return;

    const newCourse: CourseType = {
      id: Date.now().toString(),
      uid: "user123",
      calculationId: "1",
      name: course.name,
      creditUnit: course.creditUnit,
      GradePoint: course.GradePoint,
    };

    setCourses((prev) => [...prev, newCourse]);

    // reset refs

    setCourse({
      id: "",
      uid: "",
      calculationId: "",
      name: "",
      creditUnit: null,
      GradePoint: null,
    });
    Keyboard.dismiss();
  };
  const addSemester = () => {
    if (!semester.gpa || !semester.name) return;

    const newSemester: Semester = {
      id: Date.now().toString(),
      uid: "user123",
      calculationId: "1",
      name: semester.name,
      gpa: semester.gpa,
    };

    setSemesters((prev) => [...prev, newSemester]);

    // reset refs

    setSemester({
      id: "",
      uid: "",
      calculationId: "",
      name: "",
      gpa: null,
    });
    Keyboard.dismiss();
  };

  const analyse = () => {
    // Perform analysis on courses and semesters
    console.log("Analysing...");
  };

  useEffect(() => {
    if (!calculationTitle) {
      openChooseCalculationModal();
    }
  }, [calculationTitle]);

  return (
    <ModalWrapper>
      {/* PromptDialog */}
      <PromptDialog
        visible={promptVisible}
        question="Enter calculation title"
        setResponse={(val) => {
          if (val) setCalculationTitle(val);
        }}
        onClose={(val) => {
          setPromptVisible(false);
          if (!val) router.back();
        }}
      />

      {calculationTitle && (
        <View style={styles.container}>
          <Header
            leftIcon={<BackButton />}
            title={calculationTitle ? calculationTitle : ""}
          />

          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            <View style={{ gap: spacingX._20 }}>
              <View style={styles.sectionContainer}>
                <Typo style={styles.headings}>Add New Calculation</Typo>

                {/* 🔑 Input saves value directly into ref */}
                <Input
                  value={course?.name}
                  placeholder="Course Name (e.g. Math 101)"
                  onChangeText={(text) =>
                    setCourse((course) => ({ ...course, name: text }))
                  }
                />
                <Input
                  value={
                    course?.creditUnit ? course?.creditUnit.toString() : ""
                  }
                  placeholder="Credit Unit (e.g. 3)"
                  inputMode="numeric"
                  onChangeText={(text) =>
                    setCourse((course) => ({
                      ...course,
                      creditUnit: Number(text),
                    }))
                  }
                />

                <Dropdown
                  data={[
                    { label: "A", value: "A" },
                    { label: "B", value: "B" },
                    { label: "C", value: "C" },
                    { label: "D", value: "D" },
                    { label: "E", value: "E" },
                    { label: "F", value: "F" },
                  ]}
                  value={course.GradePoint}
                  placeholder="Grade Point"
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  onChange={(item) => {
                    setCourse((course) => ({
                      ...course,
                      GradePoint: item.value,
                    }));
                  }}
                  style={styles.dropdownContainer}
                  placeholderStyle={styles.dropdownPlaceholder}
                  selectedTextStyle={styles.dropdownSelectedText}
                  iconStyle={styles.dropdownIcon}
                  itemTextStyle={styles.dropdownItemText}
                  itemContainerStyle={styles.dropdownItemContainer}
                  containerStyle={styles.dropdownListContainer}
                  activeColor={colors.primary}
                />

                <Button
                  onPress={addCourse}
                  style={{
                    flexDirection: "row",
                    gap: spacingX._10,
                    alignItems: "center",
                  }}
                >
                  <PlusIcon size={15} color={colors.white} />
                  <Typo color={colors.white} fontWeight={"bold"}>
                    Add Course
                  </Typo>
                </Button>
              </View>

              {courses.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Typo style={styles.headings}>Added Courses</Typo>
                  <View style={styles.tableContainer}>
                    {courses.length === 0 ? (
                      <Typo>No courses added yet</Typo>
                    ) : (
                      <Table
                        headings={["Course Name", "Credit Unit", "Grade"]}
                        keys={["name", "creditUnit", "GradePoint"]}
                        data={courses}
                      />
                    )}
                  </View>
                </View>
              )}

              <View style={styles.sectionContainer}>
                <Typo style={styles.headings}>Past Semesters</Typo>

                {/* 🔑 Input saves value directly into ref */}
                <Input
                  value={semester?.name}
                  placeholder="Semester Name (e.g. 2nd semester 100L)"
                  onChangeText={(text) =>
                    setSemester((semester) => ({ ...semester, name: text }))
                  }
                />
                <Input
                  value={semester?.gpa ? semester?.gpa.toString() : ""}
                  placeholder="GPA (e.g. 3.25)"
                  inputMode="numeric"
                  onChangeText={(text) =>
                    setSemester((semester) => ({
                      ...semester,
                      gpa: Number(text),
                    }))
                  }
                />

                <Button
                  onPress={addSemester}
                  style={{
                    flexDirection: "row",
                    gap: spacingX._10,
                    alignItems: "center",
                    backgroundColor: colors.white,
                    borderWidth: 1,
                    borderColor: colors.primary,
                  }}
                >
                  <PlusIcon size={15} color={colors.primary} />
                  <Typo color={colors.primary} fontWeight={"bold"}>
                    Add Past Semester
                  </Typo>
                </Button>
              </View>

              {semesters.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Typo style={styles.headings}>Added Semesters</Typo>
                  <View style={styles.tableContainer}>
                    {semesters.length === 0 ? (
                      <Typo>No courses added yet</Typo>
                    ) : (
                      <Table
                        headings={["Semester", "GPA"]}
                        data={semesters}
                        keys={["name", "gpa"]}
                      />
                    )}
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.footerContainer}>
            <Button
              onPress={analyse}
              style={{
                flexDirection: "row",
                gap: spacingX._10,
                alignItems: "center",
              }}
            >
              <ChartLineUpIcon size={18} color={colors.white} weight="bold" />
              <Typo color={colors.white} fontWeight={"bold"}>
                Analyse
              </Typo>
            </Button>
          </View>
        </View>
      )}
    </ModalWrapper>
  );
};

export default CalculationsModal;

const styles = StyleSheet.create({
  footerContainer: {},
  tableContainer: {},
  container: {
    flex: 1,
    padding: spacingX._20,
    gap: spacingX._20,
  },
  sectionContainer: {
    padding: spacingX._10,
    gap: spacingX._20,
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: radius._10,
  },
  headings: {
    fontSize: 20,
    fontWeight: "bold",
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: colors.secondary2,
    paddingHorizontal: spacingX._15,
    height: verticalScale(54),
    borderRadius: radius._10,
    borderCurve: "continuous",
  },
  dropdownPlaceholder: {
    color: colors.secondary2,
  },
  dropdownSelectedText: {
    color: colors.black,
  },
  dropdownIcon: {
    height: verticalScale(30),
    tintColor: colors.secondary2,
  },
  dropdownItemText: { color: colors.black },
  dropdownItemContainer: {
    borderRadius: radius._10,
    marginHorizontal: spacingX._7,
  },
  dropdownListContainer: {
    backgroundColor: colors.secondary,
    borderRadius: radius._10,
    borderCurve: "continuous",
    paddingVertical: spacingY._7,
    top: 5,
    borderColor: colors.secondary2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
});
