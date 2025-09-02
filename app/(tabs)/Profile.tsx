import { ScrollView, StyleSheet, Switch, View } from "react-native";
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
} from "phosphor-react-native";
import { SettingsType } from "@/types";
import { Dropdown } from "react-native-element-dropdown";
import SettingsGroup from "@/components/SettingsGroup";

const generalSettings: SettingsType[] = [
  {
    id: "1",
    title: "App Theme",
    subtitle: "Toggle between Light and Dark mode",
    type: "toggle",
    toggled: false,
    Icon: ({ size }) => <SunIcon size={size} color={colors.secondary2} />,
  },
  {
    id: "2",
    title: "Notifications",
    subtitle: "Receive notifications about important academic updates",
    type: "toggle",
    toggled: true,
    Icon: ({ size }) => (
      <NotificationIcon size={size} color={colors.secondary2} />
    ),
  },
  {
    id: "3",
    title: "Language",
    subtitle: "Select your preferred language",
    type: "dropdown",
    options: ["English", "Spanish", "French", "German"],
    selectedOption: "English",
    Icon: ({ size }) => (
      <GlobeHemisphereWestIcon size={size} color={colors.secondary2} />
    ),
  },
  {
    id: "4",
    title: "Screen Lock",
    subtitle: "Require PIN or biometric authentication to open the app",
    type: "toggle",
    toggled: false,
    Icon: ({ size }) => (
      <FingerprintIcon size={size} color={colors.secondary2} />
    ),
  },
];

const academicSettings: SettingsType[] = [
  {
    id: "1",
    title: "Grading Scheme",
    subtitle: "Choose how grades are represented",
    type: "dropdown",
    Icon: ({ size }) => (
      <GraduationCapIcon size={size} color={colors.secondary2} />
    ),
    options: [
      "A, B, C, D, E, F",
      "A+, A, B+, B, C+, C, D, F",
      "O, A+, A, B+, B, C (India system)",
      "Percentage",
    ],
    selectedOption: "A, B, C, D, E, F",
  },
  {
    id: "2",
    title: "Pass/Fail Option",
    subtitle: "Allow pass/fail grading for eligible courses",
    type: "toggle",
    Icon: ({ size }) => (
      <CheckCircleIcon size={size} color={colors.secondary2} />
    ),
    toggled: false,
  },
  {
    id: "3",
    title: "Grade Rounding Rules",
    subtitle: "Define how decimal grades are rounded",
    type: "dropdown",
    Icon: ({ size }) => (
      <ArrowClockwiseIcon size={size} color={colors.secondary2} />
    ),
    options: [
      "Keep two decimals",
      "Round to nearest whole number",
      "Always round up ",
      "Always round down ",
    ],
    selectedOption: "Keep two decimals",
  },
];
const Profile = () => {
  const [settings, setSettings] =
    React.useState<SettingsType[]>(generalSettings);

  const [academicsSettings, setAcademicsSettings] =
    useState<SettingsType[]>(academicSettings);
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
            <Image
              source={getProfileImage(null)}
              style={styles.avatar}
              contentFit="cover"
              transition={100}
            />
            <Typo style={styles.headings}>John Doe</Typo>

            <Typo color={colors.secondary2}>john.doe@example.com</Typo>
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
            </Button>
          </View>

          <SettingsGroup title="General Settings" settings={settings} setSettings={setSettings}/>
          <SettingsGroup title="Academic Settings" settings={academicsSettings} setSettings={setAcademicsSettings}/>

        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default Profile;

const styles = StyleSheet.create({
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