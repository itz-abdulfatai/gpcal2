import { StyleSheet, Switch, View } from "react-native";
import React, { useMemo } from "react";
import {  radius, spacingX, spacingY } from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import { Dropdown } from "react-native-element-dropdown";
import Typo from "./typo";
import { SettingsGroupProps } from "@/types";
import SettingsIcon from "./SettingsIcon";
import { useTheme } from "@/contexts/ThemeContext";
const SettingsGroup = ({
  title,
  // updateSetting,
  settings,
}: SettingsGroupProps) => {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
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
          marginTop: spacingY._5,
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
      <Typo style={styles.headings}>{title}</Typo>
      <View style={styles.settingsContainer}>
        {settings.map((setting) => {
          return (
            <View
              key={setting.id}
              style={[
                styles.row,
                {
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: spacingX._10,
                },
              ]}
            >
              {/* Left side: Icon + Texts */}
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacingX._10,
                }}
              >
                {/* {IconComponent && (
                  <IconComponent color={colors.secondary2} weight="bold" />
                )} */}
                <SettingsIcon
                  iconName={setting.iconName}
                  color={colors.secondary2}
                  weight="bold"
                />
                <View style={{ flex: 1, gap: spacingY._5 }}>
                  <Typo
                    style={{ flexShrink: 1, flexWrap: "wrap" }}
                    fontWeight={"700"}
                  >
                    {setting.title}
                  </Typo>
                  <Typo
                    style={{ flexShrink: 1, flexWrap: "wrap" }}
                    color={colors.neutral}
                  >
                    {setting.subtitle}
                  </Typo>

                  {setting.type === "dropdown" && (
                    // <View style={{ width: scale(200) }}>
                    <Dropdown
                      maxHeight={verticalScale(200)}
                      labelField="label"
                      valueField="value"
                      style={styles.dropdownContainer}
                      placeholderStyle={styles.dropdownPlaceholder}
                      selectedTextStyle={styles.dropdownSelectedText}
                      iconStyle={styles.dropdownIcon}
                      itemTextStyle={styles.dropdownItemText}
                      itemContainerStyle={styles.dropdownItemContainer}
                      containerStyle={styles.dropdownListContainer}
                      activeColor={colors.primary}
                      placeholder={`Select ${setting.title}`}
                      value={setting.selectedOption}
                      data={setting.options!.map((option) => ({
                        label: option,
                        value: option,
                      }))}
                      onChange={(val) => {
                        // updateSetting(setting.id, { selectedOption: val.value })
                        setting.onSelectOption &&
                          setting.onSelectOption(val.value);
                        console.log(setting.title + " selected:", val.value);
                      }}
                    />
                    // </View>
                  )}
                </View>
              </View>

              {/* Right side: Toggle or Dropdown */}
              {setting.type === "toggle" && (
                <Switch
                  value={setting.toggled}
                  onValueChange={(val) => {
                    // updateSetting(setting.id, { toggled: val })
                    setting.onToggle && setting.onToggle(val);
                    console.log(setting.title + " toggled:", val);
                  }}
                  trackColor={{
                    false: colors.secondary,
                    true: colors.primary,
                  }}
                  thumbColor={setting.toggled ? colors.white : colors.white}
                />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default SettingsGroup;


