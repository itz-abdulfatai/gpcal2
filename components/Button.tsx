import { radius } from "@/constants/theme";
import { CustomButtonProps } from "@/types";
import { verticalScale } from "@/utils/styling";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Loading from "./Loading";
import { useTheme } from "@/contexts/ThemeContext";
import { useMemo } from "react";


const Button = ({
  style,
  onPress,
  loading = false,
  children,
}: CustomButtonProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    button: {
      backgroundColor: colors.primary,
      borderRadius: radius._12,
      borderCurve: "continuous",
      height: verticalScale(60),
      justifyContent: "center",
      alignItems: "center",
    },
  }), [colors]);
  if (loading) {
    return (
      <View style={[styles.button, style, { backgroundColor: "transparent" }]}>
        <Loading />
      </View>
    );
  }
  
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, style]}>
      {children}
    </TouchableOpacity>
  );
};

export default Button;

