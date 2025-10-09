import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import ModalWrapper from "@/components/ModalWrapper";

import Typo from "@/components/typo";
import Header from "@/components/header";
import BackButton from "@/components/BackButton";
import PromptDialog from "@/components/PromptDialog";
import { useLocalSearchParams, useRouter } from "expo-router";
import {  radius, spacingX, spacingY } from "@/constants/theme";
import Input from "@/components/Input";
import { Dropdown } from "react-native-element-dropdown";
import { CourseType, GradeType, SemesterType } from "@/types";
import { verticalScale } from "@/utils/styling";
import Button from "@/components/Button";
import Table from "@/components/Table";
import { ChartPieSliceIcon, PlusIcon } from "phosphor-react-native";
import { alert, computeGPA, createPercentageArray } from "@/utils";
import { BSON } from "realm";
import { useData } from "@/contexts/DataContext";
import DeleteButton from "@/components/DeleteButton";
import { useTheme } from "@/contexts/ThemeContext";


const { UUID } = BSON;

const SemestersModal = () => {
  const { colors } = useTheme();

  const { id } = useLocalSearchParams();
  const dropdownRef = useRef<any>(null);
  const {
    getSemesterById,
    semesters: dbSemesters,
    linkSemester,
    addSemester,
    addCourse: addCourseToSemester,
    updateSemester,
    deleteSemester: deleteSemesterFromDb,
    unlinkSemester,
    deleteCourse,
    gradingScheme,
  } = useData();
  const [semester, setSemester] = useState<SemesterType>({
    id: new UUID(),
    gpa: null,
    name: "",
    uid: "",
    courses: [],
    lastUpdated: new Date(),
    linkedSemesters: [],
    gradingSystem: gradingScheme,
  });
  let oldSemester: SemesterType | null;
  const [selectingPastSemesters, setSelectingPastSemesters] = useState(false);

  const idToStr = (id: any): string =>
    typeof id === "string"
      ? id
      : typeof id?.toHexString === "function"
      ? id.toHexString()
      : String(id);

  const [linkedSemesterIds, setLinkedSemesterIds] = useState<string[]>(() =>
    (semester.linkedSemesters ?? []).map(idToStr)
  );

  useEffect(() => {
    setCourse((prev) => ({ ...prev, semesterId: semester.id }));
  }, [semester.id]);

  useEffect(() => {
    if (selectingPastSemesters) {
      // let render commit then open
      const t = setTimeout(() => {
        dropdownRef.current?.open?.();
      }, 0);
      return () => clearTimeout(t);
    }
  }, [selectingPastSemesters]);

  // Safe linked IDs set (derived)
  const linkedIdsSet = useMemo(
    () => new Set((linkedSemesterIds ?? []).map((s) => String(s))),
    [linkedSemesterIds]
  );

  const handleDropDownOpen = () => {
    // safe call — only call if method exists
    setTimeout(() => {
      if (dropdownRef.current?.open) {
        dropdownRef.current.open();
      } else {
        console.warn(
          "Dropdown ref or .open() not available:",
          dropdownRef.current
        );
      }
    }, 10);
  };

  const handleDelete = async (id: string) => {
    const { success, msg } = await deleteCourse(id);

    if (!success) return alert(msg!);

    coursesVersionRef.current += 1;
    setCoursesVersion((v) => v + 1);

    console.log("deleted course with id: " + id);
  };

  const handleUnlinkSemester = async (id: string) => {
    const { success, msg } = await unlinkSemester(
      semester.id.toHexString(),
      id
    );

    if (!success) return alert(msg!);
    setLinkedSemesterIds(semester.linkedSemesters.map(idToStr));

    console.log("unlinked semester: " + id);
  };

  const handleSelectPastSemester = () => {
    setSelectingPastSemesters(true);
    handleDropDownOpen();
  };

  const getOldSemester = async () => {
    if (id) {
      oldSemester = await getSemesterById(id as string);

      if (oldSemester) {
        setSemesterTitle(oldSemester.name);
        setSemesterSaved(true);
        setSemester(oldSemester);
        setPromptVisible(false);
      }
    } else {
      openChooseSemesterModal();
    }
  };
  useEffect(() => {
    getOldSemester();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const grades =
    semester.gradingSystem === "Percentage"
      ? createPercentageArray()
      : semester.gradingSystem.split(", ").map((grade) => ({
          label: grade.trim(),
          value: grade,
        }));
  console.log(grades);

  const router = useRouter();
  const [promptVisible, setPromptVisible] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);

  const [semesterTyped, setSemesterTyped] = useState<SemesterType>({
    id: new UUID(),
    gpa: null,
    name: "",
    uid: "",
    courses: [],
    lastUpdated: new Date(),
    linkedSemesters: [],
    gradingSystem: semester.gradingSystem,
  });
  const [course, setCourse] = useState<CourseType>({
    id: new UUID(),
    uid: "",
    semesterId: semester.id,
    name: "",
    creditUnit: null,
    gradePoint: null,
  });

  const [semesterTitle, setSemesterTitle] = useState<string>(
    semester ? semester.name : ""
  );

  const handleLinkSemester = async (idStr: string) => {
    if (!idStr || linkedIdsSet.has(idStr)) return;

    // If semester hasn’t been saved yet, save it first
    if (!semesterSaved) {
      const { success, msg, data } = await addSemester(semester);
      if (!success) return alert(msg!);

      setSemester(data);

      setSemesterSaved(true);
    }
    const res = await linkSemester(semester.id.toString(), idStr);
    if (!res.success) {
      return alert(res.msg!);
    }

    setLinkedSemesterIds((prev) => [...prev, idStr]);
    setSelectingPastSemesters(false);
  };

  const handleAddLinkedSemester = async () => {
    if (!semesterTyped.name || semesterTyped.gpa == null) return;

    // If semester hasn’t been saved yet, save it first
    if (!semesterSaved) {
      const { success, msg, data } = await addSemester(semester);
      if (!success) return alert(msg!);

      setSemester(data);

      setSemesterSaved(true);
    }
    const res = await addSemester(semesterTyped);
    if (!res.success) return alert(res.msg ?? "Failed to add semester");

    try {
      await linkSemester(
        semester.id.toHexString(),
        semesterTyped.id.toHexString()
      );
    } catch (error: any) {
      console.log("error linking semester (handleAddLinkedSemester)", error);
    }

    // addSemester wrote into realm and semesterTyped.id is a BSON.UUID. Convert to string for UI:
    const idStr = idToStr(semesterTyped.id);
    setLinkedSemesterIds((prev) => {
      if (prev.includes(idStr)) return prev;
      return [...prev, idStr];
    });

    setSemesterTyped({
      id: new UUID(),
      gpa: null,
      name: "",
      uid: "",
      courses: [],
      lastUpdated: new Date(),
      linkedSemesters: [],
      gradingSystem: semester.gradingSystem,
    });
  };

  const linkedSemestersData = useMemo(() => {
    const mapById = new Map(
      dbSemesters.map((s) => [idToStr((s as any).id), s])
    );
    return linkedSemesterIds
      .map((lid) => mapById.get(lid))
      .filter(Boolean) as SemesterType[];
  }, [dbSemesters, linkedSemesterIds]);

  useEffect(() => {
    if (semester && semester.linkedSemesters) {
      setLinkedSemesterIds(semester.linkedSemesters.map(idToStr));
    }
  }, [semester]);

  const [semesterSaved, setSemesterSaved] = useState(false);

  const openChooseSemesterModal = () => {
    setPromptVisible(true);
  };

  const handleSemesterName = (name: string) => {
    setSemester((prev) => ({
      ...prev,
      name,
      lastUpdated: new Date(),
      uid: "1",
    }));
  };

  const addCourse = async (course: CourseType) => {
    let parsedCourse = {
      ...course,
      semesterId: semester.id,
      gradePoint: course.gradePoint?.toString() as GradeType,
    };

    if (!parsedCourse.name || !parsedCourse.creditUnit)
      return alert("invalid course name or credit unit");

    // If semester hasn’t been saved yet, save it first
    if (!semesterSaved) {
      const { success, msg, data } = await addSemester(semester);
      if (!success) return alert(msg!);

      setSemester(data);

      setSemesterSaved(true);
    }

    // Now always try to add course
    const { success: addCourseSuccess, msg: addCourseMsg } =
      await addCourseToSemester(parsedCourse, semester.id);

    if (!addCourseSuccess) return alert(addCourseMsg!);

    setCourse({
      id: new UUID(),
      uid: "",
      semesterId: semester.id,
      name: "",
      creditUnit: null,
      gradePoint: null,
    });

    coursesVersionRef.current += 1;
    setCoursesVersion((v) => v + 1);
  };

  const deleteSemester = () => {
    Alert.alert(
      "Delete Semester",
      "Are you sure you want to delete this semester and all its courses?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          style: "destructive",
          onPress: handleDeleteSemester,
        },
      ]
    );
  };

  const handleDeleteSemester = async () => {
    if (semester.linkedSemesters.length > 0) {
      await Promise.all(
        semester.linkedSemesters.map((linkedSemester) =>
          unlinkSemester(
            semester.id.toHexString(),
            linkedSemester.toHexString()
          )
        )
      );
    }

    const { success, msg } = await deleteSemesterFromDb(
      semester.id.toHexString()
    );

    if (!success) return alert(msg!);

    setSemester({
      id: new UUID(),
      gpa: null,
      name: "",
      uid: "",
      courses: [],
      lastUpdated: new Date(),
      linkedSemesters: [],
      gradingSystem: gradingScheme,
    });

    router.back();
  };

  const coursesVersionRef = useRef(0);
  const [coursesVersion, setCoursesVersion] = useState(0);

  useEffect(() => {
    if (!semester || !semester.courses) return;
    if (!semesterSaved) return;

    let cancelled = false;

    const run = async () => {
      if (semester.courses.length > 0) {
        const coursesArray: CourseType[] = Array.from(semester.courses ?? []);
        const gpa = computeGPA(coursesArray, semester.gradingSystem);

        if (gpa === semester.gpa) return;
        console.log("actually changing the gpa in db");

        try {
          const { success, msg } = await updateSemester(
            semester.id.toHexString(),
            { gpa }
          );

          if (cancelled) return;

          if (!success) {
            alert(msg!);
          } else {
            setSemester((prev) => ({ ...prev, gpa }));
          }
        } catch (err) {
          if (!cancelled) console.error("Error updating GPA:", err);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coursesVersion, semesterSaved]);

  const analyse = () => {
    if (semester.courses.length === 0) {
      return alert("Add some courses first");
    }
    router.push({
      pathname: "/(modals)/analyticsModal",
      params: { id: semester.id.toHexString() },
    });
  };
  // dont delete
  // const linkedIds = (semester.linkedSemesters ?? []).map((id) =>
  //   id.toHexString()
  // );

  const semesterOptions = useMemo(() => {
    return dbSemesters
      .filter((s) => {
        const sId = idToStr((s as any).id);
        return sId !== idToStr(semester.id) && !linkedIdsSet.has(sId);
      })
      .map((s) => ({
        label: s.name ?? "Untitled Semester",
        value: idToStr((s as any).id),
      }));
  }, [dbSemesters, linkedIdsSet, semester.id]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: { flexDirection: "row", alignItems: "baseline" },
        btw: { justifyContent: "space-between" },
        footerContainer: {
          paddingHorizontal: spacingX._20,
          paddingVertical: spacingY._5,
        },
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
        pastSemesterTtl: {
          marginTop: verticalScale(-20),
          fontWeight: "light",
          color: colors.neutral2,
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
      }),
    [colors]
  );

  return (
    <ModalWrapper>
      {semesterTitle && (
        <>
          <View style={{ paddingHorizontal: spacingX._20 }}>
            <Header
              leftIcon={<BackButton />}
              title={semesterTitle ? semesterTitle : ""}
              rightIcon={<DeleteButton onPress={deleteSemester} />}
            />
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.container}>
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
                    value={
                      course?.creditUnit ? course.creditUnit.toString() : ""
                    }
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
                    value={course.gradePoint}
                    placeholder="Grade Point"
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    onChange={(item) => {
                      setCourse((course) => ({
                        ...course,
                        gradePoint: item.value,
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
                    disabled={!course.name || !course.creditUnit}
                    onPress={() => {
                      addCourse(course);
                    }}
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

                {semester.courses.length > 0 && (
                  <View style={styles.sectionContainer}>
                    <Typo style={styles.headings}>Added Courses</Typo>
                    <View style={styles.tableContainer}>
                      {semester.courses.length === 0 ? (
                        <Typo>No courses added yet</Typo>
                      ) : (
                        <Table
                          headings={["Course Name", "Credit Unit", "Grade"]}
                          keys={["name", "creditUnit", "gradePoint"]}
                          data={[...semester.courses]}
                          handleDelete={handleDelete}
                        />
                      )}
                    </View>
                  </View>
                )}

                <View style={styles.sectionContainer}>
                  <View style={[styles.row, styles.btw]}>
                    <Typo style={styles.headings}>Past Semesters</Typo>
                    {!selectingPastSemesters && (
                      <TouchableOpacity onPress={handleSelectPastSemester}>
                        <Typo style={styles.pastSemesterTtl}>
                          🔗 Link existing
                        </Typo>
                      </TouchableOpacity>
                    )}
                  </View>

                  {selectingPastSemesters && (
                    <Dropdown
                      onBlur={() => setSelectingPastSemesters(false)}
                      ref={dropdownRef}
                      data={semesterOptions}
                      value={selectedSemester}
                      placeholder="Select semester"
                      maxHeight={300}
                      labelField="label"
                      valueField="value"
                      search
                      onChange={(item) => {
                        if (!item?.value) return;
                        setSelectedSemester(item.value);
                        handleLinkSemester(item.value);
                        console.log(semester.linkedSemesters);
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
                  )}

                  {/* 🔑 Input saves value directly into ref */}
                  <Input
                    value={semesterTyped?.name}
                    placeholder="Semester"
                    onChangeText={(text) =>
                      setSemesterTyped((semester) => ({
                        ...semester,
                        name: text,
                      }))
                    }
                  />
                  <Input
                    value={
                      semesterTyped?.gpa ? semesterTyped?.gpa.toString() : ""
                    }
                    placeholder="GPA (e.g. 3.25)"
                    inputMode="numeric"
                    onChangeText={(text) =>
                      setSemesterTyped((semester) => {
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
                    onPress={handleAddLinkedSemester}
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

                {linkedSemestersData.length > 0 && (
                  <View style={styles.sectionContainer}>
                    <Typo style={styles.headings}>Linked Semesters</Typo>
                    <View style={styles.tableContainer}>
                      <Table<SemesterType>
                        headings={["Semester", "GPA"]}
                        data={linkedSemestersData}
                        keys={["name", "gpa"]}
                        handleDelete={handleUnlinkSemester}
                      />
                    </View>
                  </View>
                )}
              </View>
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
        </>
      )}

      {/* PromptDialog */}
      <PromptDialog
        visible={promptVisible}
        question="Enter semester name"
        setResponse={(val) => {
          if (val.trim()) {
            setSemesterTitle(val);
            handleSemesterName(val);
          }
        }}
        onClose={(val) => {
          setPromptVisible(false);
          if (!val) router.back();
        }}
      />
    </ModalWrapper>
  );
};

export default SemestersModal;


