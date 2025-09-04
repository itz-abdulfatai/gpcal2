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
import { CourseType, SemesterType } from "@/types";
import { verticalScale } from "@/utils/styling";
import Button from "@/components/Button";
// import { dummyCourses } from "@/constants/data";
import Table from "@/components/Table";
import { ChartPieSliceIcon, PlusIcon } from "phosphor-react-native";

const SemestersModal = () => {
  const grades = [
    { label: "A", value: "A" },
    { label: "B", value: "B" },
    { label: "C", value: "C" },
    { label: "D", value: "D" },
    { label: "E", value: "E" },
    { label: "F", value: "F" },
  ];
  const [semesterTitle, setSemesterTitle] = useState<string>("");
  const router = useRouter();
  const [promptVisible, setPromptVisible] = useState(false);
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [course, setCourse] = useState<CourseType>({
    id: "",
    uid: "",
    semesterId: "",
    name: "",
    creditUnit: null,
    GradePoint: null,
  });
  const [semester, setSemester] = useState<SemesterType>({
    id: "",
    gpa: null,
    name: "",
    uid: "",
    courses,
    lastUpdated: new Date(),
  });

  const [semesters, setSemesters] = useState<SemesterType[]>([]);

  const openChooseSemesterModal = () => {
    setPromptVisible(true);
  };

  const addCourse = () => {
    if (!course.GradePoint || !course.name || !course.creditUnit) return;

    const newCourse: CourseType = {
      id: Date.now().toString(),
      uid: "user123",
      semesterId: "1",
      name: course.name,
      creditUnit: course.creditUnit,
      GradePoint: course.GradePoint,
    };

    setCourses((prev) => [...prev, newCourse]);

    // reset refs

    setCourse({
      id: "",
      uid: "",
      semesterId: "",
      name: "",
      creditUnit: null,
      GradePoint: null,
    });
    Keyboard.dismiss();
  };
  const addSemester = () => {
    if (!semester.name.trim()) return;
    if (semester.gpa == null || Number.isNaN(semester.gpa)) return;

    const newSemester: SemesterType = {
      id: Date.now().toString(),
      uid: "user123",
      name: semester.name,
      gpa: semester.gpa,
      lastUpdated: new Date(),
    };

    setSemesters((prev) => [...prev, newSemester]);

    // reset refs

    setSemester({
      id: "",
      uid: "",
      lastUpdated: new Date(),
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
    if (!semesterTitle) {
      openChooseSemesterModal();
    }
  }, [semesterTitle]);

  return (
    <ModalWrapper>
      {/* PromptDialog */}
      <PromptDialog
        visible={promptVisible}
        question="Enter semester name"
        setResponse={(val) => {
          if (val.trim()) setSemesterTitle(val);
        }}
        onClose={(val) => {
          setPromptVisible(false);
          if (!val) router.back();
        }}
      />

      {semesterTitle && (
        <View style={styles.container}>
          <Header
            leftIcon={<BackButton />}
            title={semesterTitle ? semesterTitle : ""}
            
          />

          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            <View style={{ gap: spacingX._20 }}>
              <View style={styles.sectionContainer}>
                <Typo style={styles.headings}>Add New Course</Typo>

                {/* 🔑 Input saves value directly into ref */}
                <Input
                  value={course?.name}
                  placeholder="Course Name (e.g. Math 101)"
                  onChangeText={(text) =>
                    setCourse((course) => ({ ...course, name: text }))
                  }
                />
                <Input
                  value={course?.creditUnit ? course.creditUnit.toString() : ""}
                  placeholder="Credit Unit (e.g. 3)"
                  inputMode="numeric"
                  onChangeText={(text) =>
                    setCourse((course) => {
                      const t = text.trim();
                      if (!t) {
                        // empty input → clear the field
                        return { ...course, creditUnit: null };
                      }
                      const n = Number.parseInt(t, 10);
                      // invalid number → clear; otherwise set parsed int
                      return {
                        ...course,
                        creditUnit: Number.isNaN(n) ? null : n,
                      };
                    })
                  }
                />
                <Dropdown
                  data={grades}
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
                  placeholder="Semester"
                  onChangeText={(text) =>
                    setSemester((semester) => ({ ...semester, name: text }))
                  }
                />
                <Input
                  value={semester?.gpa ? semester?.gpa.toString() : ""}
                  placeholder="GPA (e.g. 3.25)"
                  inputMode="numeric"
                  onChangeText={(text) =>
                    setSemester((semester) => {
                      const t = text.trim();
                      if (!t) return { ...semester, gpa: null };
                      const n = Number.parseFloat(t);
                      if (Number.isNaN(n)) return { ...semester, gpa: null };
                      const clamped = Math.max(0, Math.min(5, n)); // adjust max if needed
                      return { ...semester, gpa: clamped };
                    })
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
              <ChartPieSliceIcon size={18} color={colors.white} weight="bold" />
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

export default SemestersModal;

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
