import AsyncStorage from "@react-native-async-storage/async-storage";

export const BIOMETRIC_KEY = "use_biometric_auth";

export const getBiometricSettingFromStorage = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(BIOMETRIC_KEY);
    return value === "true";
  } catch (error) {
    console.error("Error reading biometric setting:", error);
    return false;
  }
};

export const setBiometricSettingInStorage = async (enabled: boolean) => {
  try {
    await AsyncStorage.setItem(BIOMETRIC_KEY, enabled ? "true" : "false");
  } catch (error) {
    console.error("Error saving biometric setting:", error);
  }
};

export const toggleBiometric = async (enabled: boolean) => {
  await setBiometricSettingInStorage(enabled);
};
