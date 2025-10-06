import { ThemeContextType, ThemeType } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, FC, useContext, useEffect, useState } from "react";
const lightColors = {
  primary: "#2577B1FF",
  secondary: "#f3f4f6",
  secondary2: "#cbcbcbff",
  white: "#ffffff",
  black: "#000000",
  text: "#000000",
  neutral: "#565D6DFF",
  neutral2: "#42799EFF",
  green: "#16a34a",
  rose: "#ef4444",
};
const darkColors = {
  primary: "#2577B1",        // Keep same for brand color
  secondary: "#222831",      // Dark background (was #f3f4f6)
  secondary2: "#393E46",     // Slightly lighter than secondary (was #cbcbcbff)
  white: "#181818",          // Use very dark for "white" surfaces
  black: "#ffffff",          // Use white for text/icons on dark backgrounds
  text: "#e5e5e5",           // Light gray for readable text
  neutral: "#A3A3A3",        // Muted gray for neutral elements
  neutral2: "#42799E",       // Slightly lighter blue for accents
  green: "#22c55e",          // Brighter green for visibility
  rose: "#f87171",           // Softer rose for dark backgrounds
}



const ThemeContext = createContext<ThemeContextType>({
    colors: lightColors,
    theme: "light",
    setTheme: (t: ThemeType) => {},
});

export const ThemeProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>("light");

  useEffect(() => {
    AsyncStorage.getItem("theme").then((stored) => {
      if (stored === "dark" || stored === "light") setThemeState(stored);
    });
  }, []);

  const setTheme = (t: ThemeType) => {
    setThemeState(t);
    AsyncStorage.setItem("theme", t);
  };
  const colors = theme === "dark" ? darkColors : lightColors;
  return (
    <ThemeContext.Provider value={{ colors, theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);