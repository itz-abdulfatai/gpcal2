import Table from "@/components/Table";
import Header from "@/components/header";
import Typo from "@/components/typo";
import { radius, spacingX, spacingY } from "@/constants/theme";
import { BackendPayloadType, CourseType, GradingSystem, SemesterType } from "@/types";
import { alert, computeCGPAWeighted, formatCoursesForDonut } from "@/utils";
import { scale, verticalScale } from "@/utils/styling";
import {
  ChartBarIcon,
  ChartPieSliceIcon,
  ExportIcon,
} from "phosphor-react-native";
import React, {
  JSX,
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { BarChart, PieChart } from "react-native-gifted-charts";

import Button from "@/components/Button";
import { router, useLocalSearchParams } from "expo-router";
import { useData } from "@/contexts/DataContext";
import ModalWrapper from "@/components/ModalWrapper";
import BackButton from "@/components/BackButton";
import Loading from "@/components/Loading";
import { useTheme } from "@/contexts/ThemeContext";

import { captureRef } from "react-native-view-shot";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

const idToStr = (id: any): string => {
  return typeof id === "string"
    ? id
    : typeof id?.toHexString === "function"
    ? id.toHexString()
    : String(id);
};

const Analytics = () => {
  const { colors } = useTheme();
  const [semester, setSemester] = useState<SemesterType | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [insightLoading, setInsightLoading] = useState(false);
  const chartOptions = useMemo(
    () => [
      {
        value: "piechart",
        icon: <ChartPieSliceIcon size={20} color={colors.primary} />,
        label: "Pie Chart", // Ensure you add the label property if your Dropdown expects it
      },
      {
        value: "barchart",
        icon: <ChartBarIcon size={20} color={colors.primary} />,
        label: "Bar Chart",
      },
    ],
    [colors.primary]
  );
  const [mode, setMode] = useState<"piechart" | "barchart">(
    chartOptions[0].value as "piechart" | "barchart"
  );

  const renderDropdownItem = useCallback(
    (item: any) => (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 8,
        }}
      >
        {item.icon}
        {/* <Typo style={{ marginLeft: 8, display: "none" }}>{item.label}</Typo> */}
      </View>
    ),
    []
  );

  // useEffect(() => {
  //   if (semester && semester.linkedSemesters) {
  //     setLinkedSemesterIds(semester.linkedSemesters.map(idToStr));
  //   }
  // }, [semester]);

  // const [courses, setCourses] = React.useState<CourseType[]>([]);
  const courses = useMemo(() => semester?.courses || [], [semester]);
  // const [linkedSemesterIds, setLinkedSemesterIds] = useState<string[]>(() =>
  //   semester ? (semester.linkedSemesters ?? []).map(idToStr) : []
  // );
  const {
    getSemesterById,
    semesters: dbSemesters,
    getAiInsight,
    updateSemester,
  } = useData();
  const { id } = useLocalSearchParams();
  const DEFAULT_GRADING_SYSTEM: GradingSystem = "A, B, C, D, E, F";
  const chartData = useMemo(
    () =>
      formatCoursesForDonut(
        courses,
        (semester?.gradingSystem as GradingSystem) ?? DEFAULT_GRADING_SYSTEM
      ),
    [courses]
  );
  const linkedSemestersData = useMemo(() => {
    if (!semester?.linkedSemesters) return [];

    const targetIds = new Set(semester.linkedSemesters.map(idToStr));
    // Assuming dbSemesters is an array of objects with an id field
    return dbSemesters.filter((s) => targetIds.has(idToStr(s.id)));
  }, [dbSemesters, semester]);

  const cgpa: number = useMemo(() => {
    const value = semester
      ? computeCGPAWeighted([semester, ...linkedSemestersData])
      : 0.0;
    return value ?? 0.0; // fallback if computeCGPAWeighted returns null
  }, [semester, linkedSemestersData]);

  const aiPayload: BackendPayloadType | undefined = useMemo(() => {
    if (!semester) return undefined;
    return {
      input:
        "Give me valuable insight based on my projected semester performance",
      semester: { ...semester, cgpa },
    };
  }, [semester, cgpa]);
  const fetchAiInsight = useCallback(async () => {
    if (!aiPayload) return;
    setInsightLoading(true);

    const { success, data, msg } = await getAiInsight(aiPayload);
    setInsightLoading(false);

    if (!success) return alert(msg!);

    console.log("data: (analyticsModal)", data);

    const { success: updateSuccess, msg: updateMsg } = await updateSemester(
      semester!.id.toString(),
      { aiInsight: data }
    );
    if (!success) alert(updateMsg!);
    setSemester((prev) => ({
      ...prev!,
      aiInsight: data,
    }));
  }, [aiPayload, getAiInsight, updateSemester, semester]);

  useEffect(() => {
    if (!id) {
      alert("Please select a semester from the Home page.");
      return router.back();
    }
    // Fetch or calculate analytics data here based on semester
    const fetchData = async () => {
      setLoading(true);
      try {
        const semester = await getSemesterById(id.toString());

        if (!semester) return router.back();
        setSemester(semester);
        // setCourses(semester.courses);
      } catch (error: any) {
        console.log(
          "an error occured while fetching data (analyticsModal)",
          error
        );

        alert("Failed to load analytics data. Please try again.");
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const exportRef = useRef<View>(null);

  const exportData = useCallback(async () => {
    try {
      await new Promise((resolve) => {
        setIsCapturing(true);
        requestAnimationFrame(() => {
          setTimeout(resolve, 0);
        });
      });
      if (!exportRef.current) return alert("Nothing to export");

      // Request permission to save to gallery
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access media library is required!");
        return;
      }

      // Capture image
      const uri = await captureRef(exportRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });

      // Move to permanent file
      const filename = `Gpcal_Analytics_Export_${Date.now()}.png`;
      const dest = `${FileSystem.cacheDirectory}${filename}`;
      await FileSystem.moveAsync({ from: uri, to: dest });

      // Save to gallery inside gpcal album
      const asset = await MediaLibrary.createAssetAsync(dest);
      let album = await MediaLibrary.getAlbumAsync("Gpcal");
      if (!album) {
        album = await MediaLibrary.createAlbumAsync("Gpcal", asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      alert("Analytics image exported");
    } catch (err) {
      console.error("Export failed: (analyticsModal)", err);
      alert("Failed to export image.");
    } finally {
      setIsCapturing(false);
    }
  }, [exportRef]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        keysContainer: {
          flexWrap: "wrap",
          justifyContent: "center",
          gap: spacingX._10,
          marginTop: spacingY._10,
        },
        row: {
          flexDirection: "row",
          alignItems: "center",
        },
        btw: {
          justifyContent: "space-between",
        },
        sectionContainer: {
          padding: spacingX._10,
          gap: spacingX._20,
          borderWidth: 1,
          borderColor: colors.secondary,
          borderRadius: radius._10,
        },
        cardTitle: {
          fontSize: 20,
          color: colors.neutral,
          textAlign: "center",
        },
        cardValue: {
          fontSize: 50,
          fontWeight: "bold",
          color: colors.black,
        },
        cardscontainer: {
          flexDirection: "row",
          justifyContent: "space-between",
          gap: spacingX._15,
          // marginTop: spacingX._20,
        },
        card: {
          flex: 1,
          padding: spacingX._20,
          alignItems: "center",
          justifyContent: "center",
          gap: spacingX._10,
          borderRadius: radius._10,
          // elevation: 2,
        },
        container: {
          flex: 1,
          paddingHorizontal: spacingX._20,
          paddingTop: spacingY._10,
          paddingBottom: spacingY._20,
          gap: spacingY._20,
          backgroundColor: colors.white,
        },
        headings: {
          fontSize: 20,
          fontWeight: "bold",
        },
        dropdownContainer: {
          borderWidth: 1,
          borderColor: colors.secondary2,
          paddingHorizontal: spacingX._5,
          height: verticalScale(35),
          borderRadius: radius._10,
          borderCurve: "continuous",
        },
        dropdownPlaceholder: {
          color: colors.secondary2,
        },
        dropdownSelectedText: {
          width: 0,
          height: 0,
          display: "none",
        },
        dropdownIcon: {
          height: verticalScale(25),
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
          paddingVertical: spacingY._5,
          top: 5,
          borderColor: colors.secondary2,
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 1,
          shadowRadius: 10,
          elevation: 2,
        },
      }),
    [colors]
  );

  if (loading)
    return (
      <ModalWrapper>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Loading />
        </View>
      </ModalWrapper>
    );

  return (
    <ModalWrapper>
      <View style={{ paddingHorizontal: spacingX._20 }}>
        <Header title={semester?.name} leftIcon={<BackButton />} />
      </View>
      <ScrollView>
        <View style={styles.container} ref={exportRef} collapsable={false}>
          <Typo style={styles.headings}>Results Summary</Typo>
          <View style={styles.cardscontainer}>
            <View style={[styles.card, { backgroundColor: colors.sky }]}>
              <Typo style={styles.cardTitle}>Semester GPA</Typo>
              <Typo style={styles.cardValue}>{semester?.gpa}</Typo>
            </View>
            <View style={[styles.card, { backgroundColor: colors.lightGreen }]}>
              <Typo style={styles.cardTitle}>Cumulative GPA</Typo>
              <Typo style={styles.cardValue}>{cgpa}</Typo>
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Typo style={styles.headings}>Courses & Grades</Typo>
            <Table
              data={courses}
              headings={["Course", "Credits", "Grade"]}
              keys={["name", "creditUnit", "gradePoint"]}
            />
          </View>
          <Typo style={styles.headings}>Performance Charts</Typo>

          <View style={styles.sectionContainer}>
            <View style={[styles.row, styles.btw]}>
              <Typo style={[styles.headings, { fontSize: 18 }]}>
                Course Impact
              </Typo>

              <View style={{ width: scale(60) }}>
                <Dropdown
                  data={chartOptions}
                  renderItem={renderDropdownItem}
                  value={mode}
                  renderLeftIcon={() => {
                    const selected = chartOptions.find(
                      (opt) => opt.value === mode
                    );
                    return selected ? selected.icon : null;
                  }}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder="Select Mode"
                  onChange={(item) => setMode(item.value)}
                  style={styles.dropdownContainer}
                  placeholderStyle={styles.dropdownPlaceholder}
                  selectedTextStyle={styles.dropdownSelectedText}
                  iconStyle={styles.dropdownIcon}
                  itemTextStyle={styles.dropdownItemText}
                  itemContainerStyle={styles.dropdownItemContainer}
                  containerStyle={styles.dropdownListContainer}
                  // activeColor={colors.primary}
                />
              </View>
            </View>

            {courses.length > 0 && (
              <View style={{ alignItems: "center" }}>
                {mode === "piechart" ? (
                  <>
                    <PieChart
                      data={chartData}
                      donut
                      radius={scale(100)}
                      innerRadius={scale(80)}
                      innerCircleColor={colors.white}
                      // showText
                      textColor={colors.black}
                      textSize={13}
                      showTooltip
                      persistTooltip
                      tooltipBackgroundColor={colors.secondary}
                      // tooltipComponent={(value: string) => (
                      //   <Typo color={colors.white}>{value}</Typo>
                      // )}

                      // isAnimated={true}
                      // animationDuration={1000}
                      // animationType="easeInOut"
                    />
                    {/* colors for identifying chart segments */}
                    <View style={[styles.row, styles.keysContainer]}>
                      {chartData.map((item, index) => (
                        <View key={index} style={[styles.row, { gap: 5 }]}>
                          <View
                            style={{
                              backgroundColor: item.color,
                              height: 10,
                              width: 10,
                              borderRadius: 99,
                            }}
                          />
                          <Typo>{item.text}</Typo>
                        </View>
                      ))}
                    </View>
                  </>
                ) : (
                  <>
                    <BarChart
                      data={chartData.map((item) => ({
                        value: item.value,
                        //                        label: item.text,  show course name on x-axis
                        frontColor: item.color, // set bar color
                      }))}
                      // width={300}
                      height={verticalScale(200)}
                      barWidth={scale(15)}
                      spacing={10}
                      initialSpacing={0}
                      roundedTop
                      roundedBottom
                      yAxisThickness={0}
                      xAxisThickness={0}
                      noOfSections={5}
                      barBorderRadius={4}
                      hideRules
                      hideYAxisText
                      minHeight={5}
                      // isAnimated
                      // animationDuration={1000}
                      // animationType="easeInOut"
                    />

                    {/* colors for identifying chart segments */}
                    <View style={[styles.row, styles.keysContainer]}>
                      {chartData.map((item, index) => (
                        <View key={index} style={[styles.row, { gap: 5 }]}>
                          <View
                            style={{
                              backgroundColor: item.color,
                              height: 10,
                              width: 10,
                              borderRadius: 99,
                            }}
                          />
                          <Typo>{item.text}</Typo>
                        </View>
                      ))}
                    </View>
                  </>
                )}
              </View>
            )}
          </View>
          {(semester?.aiInsight || !isCapturing) && (
            <>
              <Typo style={styles.headings}>Ai Analysis & Insights</Typo>
              {semester?.aiInsight ? (
                <View style={styles.sectionContainer}>
                  <View>
                    <Typo style={[styles.headings, { fontSize: 18 }]}>
                      Ai Overview
                    </Typo>
                    {/* reply
                suggested_improvement */}
                    <Typo>{semester.aiInsight?.reply}</Typo>
                  </View>
                  {semester.aiInsight?.suggested_improvement && (
                    <View>
                      <Typo style={[styles.headings, { fontSize: 18 }]}>
                        Suggested improvements
                      </Typo>
                      {/* reply
                suggested_improvement */}
                      <Typo>{semester.aiInsight?.suggested_improvement}</Typo>
                    </View>
                  )}
                </View>
              ) : (
                <Button
                  disabled={insightLoading}
                  onPress={fetchAiInsight}
                  style={{
                    flexDirection: "row",
                    gap: spacingX._10,
                    alignItems: "center",
                    backgroundColor: colors.white,
                    borderWidth: 1,
                    borderColor: colors.primary,
                  }}
                >
                  {insightLoading ? (
                    <Loading />
                  ) : (
                    <Typo color={colors.primary} fontWeight={"bold"}>
                      Get Ai Insight
                    </Typo>
                  )}
                </Button>
              )}

              {!isCapturing && (
                <Button
                  onPress={exportData}
                  style={{
                    flexDirection: "row",
                    gap: spacingX._10,
                    alignItems: "center",
                    backgroundColor: colors.white,
                    borderWidth: 1,
                    borderColor: colors.primary,
                  }}
                >
                  <ExportIcon size={15} color={colors.primary} />
                  <Typo color={colors.primary} fontWeight={"bold"}>
                    Export Data
                  </Typo>
                </Button>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </ModalWrapper>
  );
};

export default Analytics;

// This section will contain AI-generated insights based on your
//                   academic performance, study habits, and course selections.
//                   Stay tuned for personalized recommendations to help you excel
//                   in your studies!