import React, { use, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import { getBiometricSettingFromStorage } from "@/utils/biometricSettings";
import ScreenWrapper from "@/components/ScreenWrapper";
import Loading from "@/components/Loading";
import { useTheme } from "@/contexts/ThemeContext";
import { Image } from "expo-image";
import { verticalScale } from "@/utils/styling";
import { spacingX, spacingY } from "@/constants/theme";
import { UserFocusIcon, FingerprintSimpleIcon } from "phosphor-react-native";
import Typo from "@/components/typo";

export default function BiometricLogin() {
  const { colors, theme } = useTheme();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "failed" | "denied">(
    "loading"
  );
  const [authType, setAuthType] = useState<string>("Biometric");

  const styles = useMemo(
    () =>
      StyleSheet.create({
        headings: {
          fontSize: 20,
          fontWeight: "bold",
        },
        container: {
          maxHeight: verticalScale(400),
          position: "relative",
          top: "25%",
          // borderWidth: 1,
          flex: 1,
          paddingHorizontal: spacingX._20,
          paddingTop: spacingY._10,
          paddingBottom: spacingY._20,
          gap: spacingY._20,
        },
        avatar: {
          alignSelf: "center",
          // backgroundColor: colors.secondary,
          height: verticalScale(135),
          width: verticalScale(135),
          borderRadius: 200,
          // borderWidth: 1,
          borderColor: colors.secondary2,
          // overflow: "hidden",
          // position: "relative",
        },
      }),
    [colors]
  );
  const authenticate = async () => {
    setStatus("loading");
    try {
      const hasPermission = await LocalAuthentication.hasHardwareAsync();
      if (!hasPermission) {
        setStatus("denied");
        return;
      }

      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        setStatus("denied");
        return;
      }

      // Get supported authentication types
      const types =
        await LocalAuthentication.supportedAuthenticationTypesAsync();

      if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT))
        setAuthType("Fingerprint");
      else if (
        types.includes(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
        )
      )
        setAuthType("Face ID");

      // Verify user’s biometric preference
      const useBiometric = await getBiometricSettingFromStorage();
      if (!useBiometric) {
        router.replace("/(tabs)");
        return;
      }

      // Authenticate
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Use ${authType} to unlock`,
        fallbackLabel: "Use passcode",
        cancelLabel: "Cancel",
        disableDeviceFallback: false,
      });

      if (result.success) {
        router.replace("/(tabs)");
      } else {
        setStatus("failed");
      }
    } catch (error) {
      console.error("Biometric auth error: ( BiometricLogin)", error);
      setStatus("failed");
    }
  };

  useEffect(() => {
    authenticate();
  }, []);

  if (status === "loading") {
    return (
      <ScreenWrapper>
        <View style={styles.container}>
          <Image
            source={
              theme === "dark"
                ? require("@/assets/images/splash-icon-dark.png")
                : require("@/assets/images/splash-icon-light.png")
            }
            style={styles.avatar}
          />
          <Loading />
        </View>
      </ScreenWrapper>
    );
  }

  if (status === "failed") {
    return (
      <ScreenWrapper>
        <View style={styles.container}>
          <Image
            source={
              theme === "dark"
                ? require("@/assets/images/splash-icon-dark.png")
                : require("@/assets/images/splash-icon-light.png")
            }
            style={styles.avatar}
          />

          <View style={{ gap: spacingY._20, alignItems: "center" }}>
            <Typo style={styles.headings}>Authentication Failed</Typo>
            <Typo>Try again or use another method.</Typo>
            <TouchableOpacity
              className="bg-black px-6 py-3 rounded-full"
              onPress={authenticate}
            >
              {authType === "Fingerprint" ? (
                <FingerprintSimpleIcon size={50} color={colors.primary} />
              ) : authType === "Face ID" ? (
                <UserFocusIcon size={60} color={colors.primary} />
              ) : (
                <Typo color={colors.primary} size={30}>
                  Try Again
                </Typo>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  if (status === "denied") {
    return (
      // <View className="flex-1 justify-center items-center bg-white px-4">
      //   <Text className="text-lg font-semibold mb-2">
      //     Biometric not available
      //   </Text>
      //   <Text className="text-gray-600 mb-6">
      //     Your device doesn’t support or has no biometric setup.
      //   </Text>
      //   <TouchableOpacity
      //     className="bg-black px-6 py-3 rounded-full"
      //     onPress={() => router.replace("/(tabs)")}
      //   >
      //     <Text className="text-white font-semibold">Continue</Text>
      //   </TouchableOpacity>
      // </View>

      <ScreenWrapper>
        <View style={styles.container}>
          <Image
            source={
              theme === "dark"
                ? require("@/assets/images/splash-icon-dark.png")
                : require("@/assets/images/splash-icon-light.png")
            }
            style={styles.avatar}
          />

          <View style={{ gap: spacingY._20, alignItems: "center" }}>
            <Typo style={styles.headings}>Biometric not available</Typo>
            <Typo>Your device doesn’t support or has no biometric setup.</Typo>
            <TouchableOpacity
              className="bg-black px-6 py-3 rounded-full"
              onPress={() => router.replace("/(tabs)")}
            >
              <Typo color={colors.primary} size={25}>
                Continue
              </Typo>
            </TouchableOpacity>
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  return null;
}
