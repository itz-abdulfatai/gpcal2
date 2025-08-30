import { Tabs } from 'expo-router';
import React from "react";
import * as Icons from "phosphor-react-native";
import { Platform } from "react-native";


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
    </Tabs>
  );
}
