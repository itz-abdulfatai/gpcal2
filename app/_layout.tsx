import { Stack, SplashScreen, useRouter } from "expo-router";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { applyCustomFont } from "@/providers/FontProvider";
import { DataContextProvider } from "@/contexts/DataContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
function StackLayout() {
  const [fontsLoaded] = useFonts({
    ManropeLight: require("@/assets/fonts/Manrope-Light.ttf"),
    ManropeRegular: require("@/assets/fonts/Manrope-Regular.ttf"),
    ManropeMedium: require("@/assets/fonts/Manrope-Medium.ttf"),
    ManropeSemiBold: require("@/assets/fonts/Manrope-SemiBold.ttf"),
    ManropeBold: require("@/assets/fonts/Manrope-Bold.ttf"),
    ManropeExtraBold: require("@/assets/fonts/Manrope-ExtraBold.ttf"),
    ManropeExtraLight: require("@/assets/fonts/Manrope-ExtraLight.ttf"),
  });

  const router = useRouter();
  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
    if (fontsLoaded) {
      applyCustomFont();
      console.log("✅ Manrope fonts loaded!");
      SplashScreen.hideAsync();
      router.replace("/(tabs)");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontsLoaded]);
  if (!fontsLoaded) return null;
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="(tabs)">
      <Stack.Screen
        name="(modals)/semestersModal"
        options={{ presentation: "modal" }}
      ></Stack.Screen>
      <Stack.Screen
        name="(modals)/analyticsModal"
        options={{ presentation: "modal" }}
      ></Stack.Screen>
    </Stack>
  );
}

export default function RootLayout() {
  return (
      <ThemeProvider>
    <DataContextProvider>
        <StackLayout />
    </DataContextProvider>
      </ThemeProvider>
  );
}
