import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import Input from "./Input";
import Button from "./Button";
import { SemesterType } from "@/types";
import { colors, spacingX } from "@/constants/theme";
import { PlusIcon } from "phosphor-react-native";
import Typo from "./typo";
import { BSON } from "realm";
import { useData } from "@/contexts/DataContext";
import { idToStr } from "@/app/(modals)/semestersModal";

const { UUID } = BSON;

const AddLinkedSemesterForm = ({
  semester,
  setSemester,
  setSemesterSaved,
  semesterSaved,
  setLinkedSemesterIds,
}: {
  semester: SemesterType;
  setSemester: React.Dispatch<React.SetStateAction<SemesterType>>;
  setSemesterSaved: React.Dispatch<React.SetStateAction<boolean>>;
  semesterSaved: boolean;
  setLinkedSemesterIds: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
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

  const { linkSemester, addSemester } = useData();

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
  return (
    <>
      <Input
        value={semesterTyped?.name}
        placeholder="Semester"
        onChangeText={(text) =>
          setSemesterTyped((semester: SemesterType) => ({
            ...semester,
            name: text,
          }))
        }
      />
      <Input
        value={semesterTyped?.gpa ? semesterTyped?.gpa.toString() : ""}
        placeholder="GPA (e.g. 3.25)"
        inputMode="numeric"
        onChangeText={(text) =>
          setSemesterTyped((semester: SemesterType) => {
            const t = text.trim();
            if (!t) return { ...semester, gpa: null };
            const n = Number.parseFloat(t);
            if (Number.isNaN(n)) return { ...semester, gpa: null };
            const clamped = Math.max(0, Math.min(5, n)); // adjust max value of gpa if needed
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
    </>
  );
};

export default AddLinkedSemesterForm;

const styles = StyleSheet.create({});
