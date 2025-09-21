import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import ModalWrapper from "@/components/ModalWrapper";
import Typo from "@/components/typo";
import Header from "@/components/header";
import BackButton from "@/components/BackButton";
import PromptDialog from "@/components/PromptDialog";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import Input from "@/components/Input";
import { Dropdown } from "react-native-element-dropdown";
import { CourseType, SemesterType } from "@/types";
import { verticalScale } from "@/utils/styling";
import Button from "@/components/Button";
import Table from "@/components/Table";
import { ChartPieSliceIcon, PlusIcon } from "phosphor-react-native";
import { alert, computeGPA } from "@/utils";
import { BSON } from "realm";
import { useData } from "@/contexts/DataContext";

const { UUID } = BSON;

const SemestersModal = () => {
  const [semester, setSemester] = useState<SemesterType>({
    id: new UUID(),
    gpa: null,
    name: "",
    uid: "",
    courses: [],
    lastUpdated: new Date(),
    linkedSemesters: [],
  });
  const { id } = useLocalSearchParams();
  const dropdownRef = useRef<any>(null);
  const { getSemesterById, semesters: dbSemesters, linkSemester, addSemester, addCourse: addCourseToSemester, updateSemester } = useData();
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

  const handleSelectPastSemester = () => {
    setSelectingPastSemesters(true);
    handleDropDownOpen();
  };

  
  const getOldSemester = async () => {
    if (id) {
      oldSemester = await getSemesterById(id as string);

      if (oldSemester) {
        setSemesterTitle(oldSemester.name);
        setSememsterSaved(true);
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

  const grades = [
    { label: "A", value: "A" },
    { label: "B", value: "B" },
    { label: "C", value: "C" },
    { label: "D", value: "D" },
    { label: "E", value: "E" },
    { label: "F", value: "F" },
  ];
  const router = useRouter();
  const [promptVisible, setPromptVisible] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);

  const [semesterTyped, setSememstertyped] = useState<SemesterType>({
    id: new UUID(),
    gpa: null,
    name: "",
    uid: "",
    courses: [],
    lastUpdated: new Date(),
    linkedSemesters: [],
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
      const { success, msg } = await addSemester(semester);
      if (!success) return alert(msg!);

      setSememsterSaved(true);
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
      const { success, msg } = await addSemester(semester);
      if (!success) return alert(msg!);

      setSememsterSaved(true);
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

    setSememstertyped({
      id: new UUID(),
      gpa: null,
      name: "",
      uid: "",
      courses: [],
      lastUpdated: new Date(),
      linkedSemesters: [],
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

  const [semesterSaved, setSememsterSaved] = useState(false);

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
    };

    if (!parsedCourse.name || !parsedCourse.creditUnit)
      return alert("invalid course name or credit unit");

    // If semester hasn’t been saved yet, save it first
    if (!semesterSaved) {
      const { success, msg } = await addSemester(semester);
      if (!success) return alert(msg!);

      setSememsterSaved(true);
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

    // console.log(semester);
  };

useEffect(() => {
  if (!semester || !semester.courses) return;

  let cancelled = false;

  const run = async () => {

    if (semester.courses.length > 0) {

      const gpa = computeGPA(semester.courses);
      
      // if GPA hasn’t changed, skip DB write
      if (gpa === semester.gpa) return;
      
      try {
        const { success, msg } = await updateSemester(
          semester.id.toHexString(),
          { gpa }
        );
        
        if (cancelled) return; // prevent updates after unmount

      if (!success) {
        alert( msg!);
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
}, [semester]);


  const analyse = () => {
    router.push({
      pathname: "/(modals)/analyticsModal",
      params: {id: semester.id.toHexString()}
    })
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

  return (
    <ModalWrapper>

      {semesterTitle && (

        <>
<View style={{paddingHorizontal: spacingX._20}}>

          <Header
            leftIcon={<BackButton />}
            title={semesterTitle ? semesterTitle : ""}
            // rightIcon={ <SaveButton onPress={saveSemester}/>}
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
                        data={semester.courses}
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
                    setSememstertyped((semester) => ({
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
                    setSememstertyped((semester) => {
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

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "baseline" },
  btw: { justifyContent: "space-between" },
  footerContainer: {
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._5
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
});
