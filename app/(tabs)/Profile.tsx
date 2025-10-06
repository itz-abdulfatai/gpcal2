import { ScrollView, StyleSheet, Switch, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { scale, verticalScale } from "@/utils/styling";
import Header from "@/components/header";
import { getProfileImage } from "@/services/imageService";
import { Image } from "expo-image";
import Button from "@/components/Button";
import {
  UserIcon,
  SunIcon,
  NotificationIcon,
  GlobeHemisphereWestIcon,
  FingerprintIcon,
  GraduationCapIcon,
  CheckCircleIcon,
  ArrowClockwiseIcon,
  ExportIcon,
  TrashIcon,
  ChatCenteredTextIcon,
  HeadphonesIcon,
  InfoIcon,
  PencilIcon
} from "phosphor-react-native";

import { SettingsType, AppInfoType, UtilitiesType } from "@/types";
import { Dropdown } from "react-native-element-dropdown";
import SettingsGroup from "@/components/SettingsGroup";
import UtilitiesGroup from "@/components/UtilitiesGroup";
import { useData } from "@/contexts/DataContext";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from "expo-file-system";
import PromptDialog from "@/components/PromptDialog";
// const generalSettings: SettingsType[] = [
//   {
//     id: "1",
//     title: "App Theme",
//     subtitle: "Toggle between Light and Dark mode",
//     type: "toggle",
//     toggled: false,
//     Icon: (props) => <SunIcon {...props} />,
//   },
//   {
//     id: "2",
//     title: "Notifications",
//     subtitle: "Receive notifications about important academic updates",
//     type: "toggle",
//     toggled: true,
//     Icon: (props) => <NotificationIcon {...props} />,
//   },
//   {
//     id: "3",
//     title: "Language",
//     subtitle: "Select your preferred language",
//     type: "dropdown",
//     options: ["English", "Spanish", "French", "German"],
//     selectedOption: "English",
//     Icon: (props) => <GlobeHemisphereWestIcon {...props} />,
//   },
//   {
//     id: "4",
//     title: "Screen Lock",
//     subtitle: "Require PIN or biometric authentication to open the app",
//     type: "toggle",
//     toggled: false,
//     Icon: (props) => <FingerprintIcon {...props} />,
//   },
// ];

// const academicSettings: SettingsType[] = [
//   {
//     id: "1",
//     title: "Grading Scheme",
//     subtitle: "Choose how grades are represented",
//     type: "dropdown",
//     Icon: (props) => <GraduationCapIcon {...props} />,
//     options: [
//       "A, B, C, D, E, F",
//       "A+, A, B+, B, C+, C, D, F",
//       "O, A+, A, B+, B, C (India system)",
//       "Percentage",
//     ],
//     selectedOption: "A, B, C, D, E, F",
//   },
//   {
//     id: "2",
//     title: "Pass/Fail Option",
//     subtitle: "Allow pass/fail grading for eligible courses",
//     type: "toggle",
//     Icon: (props) => <CheckCircleIcon {...props} />,
//     toggled: false,
//   },
//   {
//     id: "3",
//     title: "Grade Rounding Rules",
//     subtitle: "Define how decimal grades are rounded",
//     type: "dropdown",
//     Icon: (props) => <ArrowClockwiseIcon {...props} />,
//     options: [
//       "Keep two decimals",
//       "Round to nearest whole number",
//       "Always round up ",
//       "Always round down ",
//     ],
//     selectedOption: "Keep two decimals",
//   },
// ];

// const utilities: UtilitiesType[] = [
//   {
//     id: "1",
//     title: "Export Data",
//     subtitle: "Download a backup of your academic data",
//     color: colors.white,
//     onTap() {
//       console.log("export data tapped");
//     },
//     Icon: (props) => <ExportIcon {...props} />,
//     buttonText: "Export",
//     textColor: colors.black,
//   },
//   {
//     id: "2",
//     title: "Import Data",
//     subtitle: "Import a previously exported data file",
//     color: colors.white,
//     onTap() {
//       console.log("import data tapped");
//     },
//     Icon: (props) => <ExportIcon {...props} />,
//     buttonText: "Import",
//     textColor: colors.black,
//   },
//   {
//     id: "3",
//     title: "Reset All Data",
//     subtitle: "Permanently delete all your application data",
//     color: colors.rose,
//     onTap() {
//       console.log("reset data tapped");
//     },
//     Icon: (props) => <TrashIcon {...props} />,
//     buttonText: "Reset",
//     textColor: colors.white,
//   },
// ];

// const siteInfo: AppInfoType[] = [
//   {
//     id: "1",
//     title: "Send Feedback",
//     Icon: (props) => <ChatCenteredTextIcon {...props} />,
//     route: "/",
//   },
//   {
//     id: "2",
//     title: "Get Support",
//     Icon: (props) => <HeadphonesIcon {...props} />,
//     route: "/",
//   },
//   {
//     id: "3",
//     title: "About this App",
//     Icon: (props) => <InfoIcon {...props} />,
//     route: "/",
//   },
// ];

const Profile = () => {
  // const [settings, setSettings] =
  //   React.useState<SettingsType[]>(generalSettings);

  // const [academicsSettings, setAcademicsSettings] =
  //   useState<SettingsType[]>(academicSettings);
    const [promptVisible, setPromptVisible] = useState(false);
  

    const onPickImage = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need permissions to change your profile picture.');
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
      if (!result.canceled) {
        const savedImageUri = await saveImage(result.assets?.[0]?.uri);
        if (savedImageUri) {
          setUser({ ...user, image: savedImageUri, name: user?.name ?? null });
          console.log("Image saved at: (onPickImage)", savedImageUri);
        } else {
          alert('Failed to save image. Please try again.');
        }
      } else {
      }
    };
  async function saveImage(uri: string): Promise<string | null> {
  try {
    const fileUri = FileSystem.documentDirectory + "profileImage.jpg";

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

  const {
    generalSettings: settings,
    infos: siteInfo,
    academicSettings: academicsSettings,
    updateGeneralSetting,
    updateAcademicSetting,
    utilities,
    user,
    setUser,
  } = useData();
  return (
    <ScreenWrapper>
      <Header title="Profile" />
      <ScrollView>
        <View style={styles.container}>
          <View
            style={[
              styles.sectionContainer,
              {
                backgroundColor: "#f5f8fa",
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
              <PencilIcon
                size={verticalScale(20)}
                color={colors.white}
              />
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
            updateSetting={updateGeneralSetting}
          />
          <SettingsGroup
            title="Academic Settings"
            settings={academicsSettings}
            updateSetting={updateAcademicSetting}
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

const styles = StyleSheet.create({
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
});

          // <View style={styles.sectionContainer}>
          //   <Typo style={styles.headings}>General Settings</Typo>
          //   <View style={styles.settingsContainer}>
          //     {settings.map((setting) => (
          //       <View
          //         key={setting.id}
          //         style={[
          //           styles.row,
          //           {
          //             alignItems: "center",
          //             justifyContent: "space-between",
          //             gap: spacingX._10,
          //           },
          //         ]}
          //       >
          //         {/* Left side: Icon + Texts */}
          //         <View
          //           style={{
          //             flex: 1,
          //             flexDirection: "row",
          //             alignItems: "center",
          //             gap: spacingX._10,
          //           }}
          //         >
          //           <setting.Icon />
          //           <View style={{ flex: 1, gap: spacingY._5 }}>
          //             <Typo
          //               style={{ flexShrink: 1, flexWrap: "wrap" }}
          //               fontWeight={"700"}
          //             >
          //               {setting.title}
          //             </Typo>
          //             <Typo
          //               style={{ flexShrink: 1, flexWrap: "wrap" }}
          //               color={colors.neutral}
          //             >
          //               {setting.subtitle}
          //             </Typo>

          //             {setting.type === "dropdown" && (
          //               // <View style={{ width: scale(200) }}>
          //               <Dropdown
          //                 maxHeight={verticalScale(200)}
          //                 labelField="label"
          //                 valueField="value"
          //                 style={styles.dropdownContainer}
          //                 placeholderStyle={styles.dropdownPlaceholder}
          //                 selectedTextStyle={styles.dropdownSelectedText}
          //                 iconStyle={styles.dropdownIcon}
          //                 itemTextStyle={styles.dropdownItemText}
          //                 itemContainerStyle={styles.dropdownItemContainer}
          //                 containerStyle={styles.dropdownListContainer}
          //                 activeColor={colors.primary}
          //                 placeholder={`Select ${setting.title}`}
          //                 value={setting.selectedOption}
          //                 data={setting.options!.map((option) => ({
          //                   label: option,
          //                   value: option,
          //                 }))}
          //                 onChange={(val) => {
          //                   setSettings((prevSettings) =>
          //                     prevSettings.map((s) =>
          //                       s.id === setting.id
          //                         ? { ...s, selectedOption: val.value }
          //                         : s
          //                     )
          //                   );
          //                 }}
          //               />
          //               // </View>
          //             )}
          //           </View>
          //         </View>

          //         {/* Right side: Toggle or Dropdown */}
          //         {setting.type === "toggle" && (
          //           <Switch
          //             value={setting.toggled}
          //             onValueChange={(val) => {
          //               setSettings((prevSettings) =>
          //                 prevSettings.map((s) =>
          //                   s.id === setting.id ? { ...s, toggled: val } : s
          //                 )
          //               );
          //             }}
          //             trackColor={{
          //               false: colors.secondary,
          //               true: colors.primary,
          //             }}
          //             thumbColor={setting.toggled ? colors.white : colors.white}
          //           />
          //         )}
          //       </View>
          //     ))}
          //   </View>
          // </View>
          // <View style={styles.sectionContainer}>
          //   <Typo style={styles.headings}>Academic Settings</Typo>
          //   <View style={styles.settingsContainer}>
          //     {academicsSettings.map((setting) => (
          //       <View
          //         key={setting.id}
          //         style={[
          //           styles.row,
          //           {
          //             alignItems: "center",
          //             justifyContent: "space-between",
          //             gap: spacingX._10,
          //           },
          //         ]}
          //       >
          //         {/* Left side: Icon + Texts */}
          //         <View
          //           style={{
          //             flex: 1,
          //             flexDirection: "row",
          //             alignItems: "center",
          //             gap: spacingX._10,
          //           }}
          //         >
          //           <setting.Icon />
          //           <View style={{ flex: 1 }}>
          //             <Typo
          //               style={{ flexShrink: 1, flexWrap: "wrap" }}
          //               fontWeight={"700"}
          //             >
          //               {setting.title}
          //             </Typo>
          //             <Typo
          //               style={{ flexShrink: 1, flexWrap: "wrap" }}
          //               color={colors.neutral}
          //             >
          //               {setting.subtitle}
          //             </Typo>
          //           </View>
          //         </View>

          //         {/* Right side: Toggle or Dropdown */}
          //         {setting.type === "toggle" ? (
          //           <Switch
          //             value={setting.toggled}
          //             onValueChange={(val) => {
          //               setAcademicsSettings((prevSettings) =>
          //                 prevSettings.map((s) =>
          //                   s.id === setting.id ? { ...s, toggled: val } : s
          //                 )
          //               );
          //             }}
          //             trackColor={{
          //               false: colors.secondary,
          //               true: colors.primary,
          //             }}
          //             thumbColor={setting.toggled ? colors.white : colors.white}
          //           />
          //         ) : (
          //           <View style={{ width: scale(100) }}>
          //             <Dropdown
          //               maxHeight={verticalScale(100)}
          //               labelField="label"
          //               valueField="value"
          //               style={styles.dropdownContainer}
          //               placeholderStyle={styles.dropdownPlaceholder}
          //               selectedTextStyle={styles.dropdownSelectedText}
          //               iconStyle={styles.dropdownIcon}
          //               itemTextStyle={styles.dropdownItemText}
          //               itemContainerStyle={styles.dropdownItemContainer}
          //               containerStyle={styles.dropdownListContainer}
          //               placeholder={`Select ${setting.title}`}
          //               value={setting.selectedOption}
          //               data={setting.options!.map((option) => ({
          //                 label: option,
          //                 value: option,
          //               }))}
          //               onChange={(val) => {
          //                 setSettings((prevSettings) =>
          //                   prevSettings.map((s) =>
          //                     s.id === setting.id
          //                       ? { ...s, selectedOption: val.value }
          //                       : s
          //                   )
          //                 );
          //               }}
          //             />
          //           </View>
          //         )}
          //       </View>
          //     ))}
          //   </View>
          // </View>