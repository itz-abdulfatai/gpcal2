import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import React, { useMemo, useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/typo";
import { radius, spacingX, spacingY } from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import Header from "@/components/header";
import { getProfileImage } from "@/services/imageService";
import { Image } from "expo-image";
import { useTheme } from "@/contexts/ThemeContext";

import { PencilIcon } from "phosphor-react-native";
import SettingsGroup from "@/components/SettingsGroup";
import UtilitiesGroup from "@/components/UtilitiesGroup";
import { useData } from "@/contexts/DataContext";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import PromptDialog from "@/components/PromptDialog";
import AsyncStorage from "@react-native-async-storage/async-storage";

async function saveImage(uri: string): Promise<string | null> {
  try {
    const fileUri = FileSystem.documentDirectory + "profileImage.jpg";

    // Check if file already exists
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    }

    await FileSystem.copyAsync({
      from: uri,
      to: fileUri,
    });

    console.log("Image saved at:", fileUri);
    return fileUri;
  } catch (error) {
    console.error("Error saving image: (saveImage)", error);
    return null;
  }
}

const Profile = () => {
  // const [settings, setSettings] =
  //   React.useState<SettingsType[]>(generalSettings);

  // const [academicsSettings, setAcademicsSettings] =
  //   useState<SettingsType[]>(academicSettings);
  const [promptVisible, setPromptVisible] = useState(false);
  const { colors } = useTheme();

  const onPickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need permissions to change your profile picture.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      cameraType: ImagePicker.CameraType.back,
      // allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });
    // console.log(result.assets);
    if (result.canceled || !result.assets?.[0]?.uri) return;

    const savedImageUri = await saveImage(result.assets?.[0]?.uri);

    if (savedImageUri) {
      setUser({ ...user, image: savedImageUri, name: user?.name ?? null });
      AsyncStorage.setItem("user", JSON.stringify(user));
      console.log("Image saved at: (onPickImage)", savedImageUri);
    } else {
      alert("Failed to save image. Please try again.");
    }
  };

  const {
    generalSettings: settings,
    infos: siteInfo,
    academicSettings: academicsSettings,
    // updateGeneralSetting,
    // updateAcademicSetting,
    utilities,
    user,
    setUser,
  } = useData();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        editIcon: {
          position: "absolute",
          bottom: spacingY._5,
          right: spacingY._7,
          borderRadius: 100,
          backgroundColor: colors.neutral2,
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.25,
          shadowRadius: 10,
          elevation: 2,
          padding: spacingY._7,
        },
        avatarContainer: {
          position: "relative",
          alignSelf: "center",
        },
        settingsContainer: {
          gap: spacingY._20,
        },
        avatar: {
          alignSelf: "center",
          backgroundColor: colors.secondary,
          height: verticalScale(135),
          width: verticalScale(135),
          borderRadius: 200,
          borderWidth: 1,
          borderColor: colors.secondary2,
          // overflow: "hidden",
          // position: "relative",
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
        container: {
          flex: 1,
          paddingHorizontal: spacingX._20,
          paddingTop: spacingY._10,
          paddingBottom: spacingY._20,
          gap: spacingY._20,
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
    <ScreenWrapper>
      <Header title="Profile" />
      <ScrollView>
        <View style={styles.container}>
          <View
            style={[
              styles.sectionContainer,
              {
                backgroundColor: colors.secondary,
                alignItems: "center",
                gap: spacingY._15,
              },
            ]}
          >
            <View style={styles.avatarContainer}>
              <Image
                source={getProfileImage(user?.image)}
                style={styles.avatar}
                contentFit="cover"
                transition={100}
              />
              <TouchableOpacity style={styles.editIcon} onPress={onPickImage}>
                <PencilIcon size={verticalScale(20)} color={colors.white} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => setPromptVisible(true)}>
              <Typo style={styles.headings}>{user?.name}</Typo>
            </TouchableOpacity>

            {/* <Typo color={colors.secondary2}>john.doe@example.com</Typo>
            <Button
              style={[
                styles.row,
                {
                  alignSelf: "stretch",
                  justifyContent: "center",
                  gap: spacingX._10,
                },
              ]}
            >
              <UserIcon color={colors.white} size={15} />
              <Typo color={colors.white}>Edit Profile</Typo>
            </Button> */}
          </View>

          <SettingsGroup
            title="General Settings"
            settings={settings}
            // updateSetting={updateGeneralSetting}
          />
          <SettingsGroup
            title="Academic Settings"
            settings={academicsSettings}
            // updateSetting={updateAcademicSetting}
          />

          <UtilitiesGroup
            infos={siteInfo}
            title="Utilities"
            utilities={utilities}
          />
        </View>
      </ScrollView>
      <PromptDialog
        visible={promptVisible}
        question="Enter Your name"
        initialValue={user?.name ?? undefined}
        setResponse={(val) => {
          if (val.trim()) {
            setUser({ ...user, name: val.trim(), image: user?.image ?? null });
            AsyncStorage.setItem("user", JSON.stringify(user));
          }
        }}
        onClose={(val) => {
          setPromptVisible(false);
        }}
      />
    </ScreenWrapper>
  );
};

export default Profile;
