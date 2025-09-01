import Fab from "@/components/Fab";
import Header from "@/components/header";
import ScreenWrapper from "@/components/ScreenWrapper";
import SemestersList from "@/components/SemestersList";
import { dummySemesters } from "@/constants/data";
import { spacingX, spacingY } from "@/constants/theme";
import { SemesterType } from "@/types";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const [semesters, setSemesters] = useState<SemesterType[]>(dummySemesters);

  const openSemestersModal = () => {
    router.push("/(modals)/SemestersModal");
  };
  return (
    <ScreenWrapper>
      <Fab onPress={openSemestersModal} />
      <Header title="GPCal" />
      <ScrollView style={styles.container}>
        <SemestersList data={semesters} emptyListMessage="No Semesters Found" />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._20,
    marginTop: spacingY._20,
    gap: spacingY._10,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
