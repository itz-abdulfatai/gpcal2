import { Tabs } from 'expo-router';
import React from "react";
import * as Icons from "phosphor-react-native";
import { Platform, Alert, ToastAndroid } from "react-native";

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
          tabBarIcon: () => <Icons.HouseSimpleIcon size={24} color={"black"} />,
        }}
      />
      <Tabs.Screen
        name="Analytics"
        options={{
          title: "Analytics",
          tabBarIcon: () => (
            <Icons.ChartPieSliceIcon size={24} color={"black"} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault(); // stops navigation
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
    </Tabs>
  );
}
