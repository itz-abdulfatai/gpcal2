import { Dropdown } from "react-native-element-dropdown";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useMemo, useState } from "react";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import Typo from "./typo";
import Input from "./Input";
import Button from "./Button";
import { PlusIcon } from "phosphor-react-native";
import { CourseType } from "@/types";
import { BSON } from "realm";

const { UUID } = BSON;

const AddCourseForm = ({ onAdd, grades, colors }: any) => {
  const [course, setCourse] = useState<CourseType>({
    id: new UUID(),
    uid: "",
    semesterId: new UUID(),
    name: "",
    creditUnit: null,
    gradePoint: null,
  });
  const handleAdd = () => {
    onAdd(course);
    // Reset local state after adding
    setCourse({
      ...course,
      id: new UUID(),
      name: "",
      creditUnit: null,
      gradePoint: null,
    });
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
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
      }),
    [colors]
  );
  return (
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
              // empty input -> clear the field
              return { ...course, creditUnit: null };
            }
            const n = Number.parseInt(t, 10);
            // invalid number -> clear; otherwise set parsed int
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
        onPress={handleAdd}
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
  );
};

export default AddCourseForm;

const styles = StyleSheet.create({});
