import React, { useCallback, useMemo } from "react";
import { TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { spacingX, spacingY } from "@/constants/theme";
export interface FabProps {
  // onPress: () => void;
  style?: ViewStyle;
}
import { PlusIcon } from "phosphor-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "expo-router";

const Fab: React.FC<FabProps> = ({ style }) => {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        fab: {
          position: "absolute",
          bottom: spacingY._20,
          right: spacingX._20,
          backgroundColor: colors.primary,
          borderRadius: 99,
          width: 56,
          height: 56,
          alignItems: "center",
          justifyContent: "center",
          elevation: 5,
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          zIndex: 99,
        } as ViewStyle,
      }),
    [colors]
  );

  const router = useRouter();
  const isNavigatingRef = React.useRef(false);

  const openSemestersModal = useCallback(() => {
    if (isNavigatingRef.current) return;

    isNavigatingRef.current = true;
    router.push("/(modals)/semestersModal");

    // unlock after navigation settles
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 1000);
  }, [router]);
  return (
    <TouchableOpacity
      style={[styles.fab, style]}
      onPress={openSemestersModal}
      activeOpacity={0.8}
    >
      <PlusIcon color={colors.white} size={28} weight="bold" />
    </TouchableOpacity>
  );
};

export default Fab;
