import { colors } from "@/constants/theme";
import { Tabs } from "expo-router";
import {
  HouseSimpleIcon,
  UserIcon,
  ChartPieSliceIcon,
} from "phosphor-react-native";
import React from "react";
import { Platform, ToastAndroid } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: () => (
            <HouseSimpleIcon size={24} color={colors.primary} />
          ),
        }}
      />

      <Tabs.Screen
        name="Analytics"
        options={{
          title: "Analytics",
          tabBarIcon: () => (
            <ChartPieSliceIcon size={24} color={colors.primary} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            //e.preventDefault(); // stops navigation
            // optionally show an alert/toast here
            if (Platform.OS === "android") {
              ToastAndroid.show(
                "Please select a semester from the Home page.",
                ToastAndroid.SHORT
              );
            } else if (Platform.OS === "ios") {
              import("react-native").then(({ Alert }) => {
                Alert.alert(
                  "Notice",
                  "Please select a semester from the Home page."
                );
              });
            }
          },
        }}
      />

      <Tabs.Screen
        name="Profile"
        options={{
          title: "Profile",
          tabBarIcon: () => <UserIcon size={24} color={colors.primary} />,
        }}
      />
    </Tabs>
  );
}
