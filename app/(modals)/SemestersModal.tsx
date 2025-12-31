import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ModalWrapper from "@/components/ModalWrapper";

import Typo from "@/components/typo";
import Header from "@/components/header";
import BackButton from "@/components/BackButton";
import PromptDialog from "@/components/PromptDialog";
import { useLocalSearchParams, useRouter } from "expo-router";
import { radius, spacingX, spacingY } from "@/constants/theme";
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
import AddCourseForm from "@/components/addCourseForm";
import AddLinkedSemesterForm from "@/components/AddLinkedSemesterForm";

const { UUID } = BSON;

export const idToStr = (id: any): string =>
  typeof id === "string"
    ? id
    : typeof id?.toHexString === "function"
    ? id.toHexString()
    : String(id);

const SemestersModal = () => {
  const { colors } = useTheme();
  console.log("semesrer modal rendereed");

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

  const [linkedSemesterIds, setLinkedSemesterIds] = useState<string[]>(() =>
    (semester.linkedSemesters ?? []).map(idToStr)
  );

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

  const handleDelete = useCallback(
    async (id: string) => {
      const { success, msg } = await deleteCourse(id);

      if (!success) return alert(msg!);

      console.log("deleted course with id: " + id);

      const remainingCourses = (semester.courses || []).filter(
        (c) => (typeof c.id === "string" ? c.id : c.id.toHexString()) !== id
      );
      await updateSemesterGpa(remainingCourses);
    },
    [deleteCourse, semester.courses, semester.gradingSystem, semester.id]
  );

  const handleUnlinkSemester = useCallback(
    async (id: string) => {
      const { success, msg } = await unlinkSemester(
        semester.id.toHexString(),
        id
      );

      if (!success) return alert(msg!);
      setLinkedSemesterIds(semester.linkedSemesters.map(idToStr));

      console.log("unlinked semester: " + id);
    },
    [unlinkSemester, semester.id]
  );

  const handleChildLink = async (newSem: SemesterType) => {
    await saveIfUnsaved();
  };

  const handleSelectPastSemester = () => {
    setSelectingPastSemesters(true);
    handleDropDownOpen();
  };

  const getOldSemester = async () => {
    if (id) {
      oldSemester = await getSemesterById(id as string);

      if (oldSemester) {
        // setSemesterTitle(oldSemester.name);
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

  const grades = useMemo(
    () =>
      semester.gradingSystem === "Percentage"
        ? createPercentageArray()
        : semester.gradingSystem.split(", ").map((grade) => ({
            label: grade.trim(),
            value: grade.trim(),
          })),
    [semester.gradingSystem]
  );

  const router = useRouter();
  const [promptVisible, setPromptVisible] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);

  // const [semesterTitle, setSemesterTitle] = useState<string>(
  //   semester ? semester.name : ""
  // );

  const handleLinkSemester = async (idStr: string) => {
    if (!idStr || linkedIdsSet.has(idStr)) return;

    await saveIfUnsaved();
    const res = await linkSemester(semester.id.toString(), idStr);
    if (!res.success) {
      return alert(res.msg!);
    }

    setLinkedSemesterIds((prev) => [...prev, idStr]);
    setSelectingPastSemesters(false);
  };

  const semesterMap = useMemo(() => {
    const newMap = new Map(dbSemesters.map((s) => [idToStr((s as any).id), s]));
    // Optional: if dbSemesters is large, add check (but skip if not needed)
    return newMap;
  }, [dbSemesters]);

  // 2. Memoize the list using the map and current semester's links
  const linkedSemestersData = useMemo(() => {
    return (semester.linkedSemesters || [])
      .map((lid) => semesterMap.get(idToStr(lid)))
      .filter(Boolean) as SemesterType[];
  }, [semesterMap, semester.linkedSemesters]);

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

  const saveIfUnsaved = async () => {
    // If semester hasn’t been saved yet, save it first
    if (!semesterSaved) {
      const { success, msg, data } = await addSemester(semester);
      if (!success) return alert(msg!);
      setSemesterSaved(true);
      setSemester(data);
    }
  };

  const addCourse = useCallback(
    async (course: CourseType) => {
      let parsedCourse = {
        ...course,
        semesterId: semester.id,
        gradePoint: course.gradePoint?.toString() as GradeType,
      };

      if (!parsedCourse.name || !parsedCourse.creditUnit)
        return alert("invalid course name or credit unit");

      await saveIfUnsaved();

      // Now always try to add course
      const { success: addCourseSuccess, msg: addCourseMsg } =
        await addCourseToSemester(parsedCourse, semester.id);

      if (!addCourseSuccess) return alert(addCourseMsg!);

      // setCourse({
      //   id: new UUID(),
      //   uid: "",
      //   semesterId: semester.id,
      //   name: "",
      //   creditUnit: null,
      //   gradePoint: null,
      // });

      const newCourseList = [...(semester.courses || []), parsedCourse];
      await updateSemesterGpa(newCourseList);
    },
    [
      semester.id,
      semester.courses,
      semesterSaved,
      addCourseToSemester,
      updateSemester,
      // semesterTitle,
      semester.name,
    ]
  );

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

  const updateSemesterGpa = async (currentCourses: CourseType[]) => {
    console.log("test");

    const gpa = computeGPA(currentCourses, semester.gradingSystem);
    console.log("gpa is ", gpa);

    // Only update if GPA actually changed to save DB writes
    if (gpa === semester.gpa) return;

    const { success, msg } = await updateSemester(semester.id.toHexString(), {
      gpa,
    });
    if (success) {
      setSemester((prev) => ({ ...prev, gpa }));
    } else {
      alert(msg!);
    }
  };

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
      {semester.name && (
        <>
          <View style={{ paddingHorizontal: spacingX._20 }}>
            <Header
              leftIcon={<BackButton />}
              title={semester.name}
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
                <AddCourseForm
                  onAdd={addCourse}
                  grades={grades}
                  colors={colors}
                />

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
                          data={semester.courses}
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

                  <AddLinkedSemesterForm
                    onLink={handleChildLink}
                    semester={semester}
                    semesterSaved={semesterSaved}
                    setLinkedSemesterIds={setLinkedSemesterIds}
                    setSemester={setSemester}
                    setSemesterSaved={setSemesterSaved}
                  />
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
            // setSemesterTitle(val);
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
