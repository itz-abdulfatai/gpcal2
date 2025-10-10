import AsyncStorage from "@react-native-async-storage/async-storage";
import { openRealm } from "@/models/db";
import { ResponseType } from "@/types";
import * as FileSystem from "expo-file-system";

export async function eraseAllUserData(): Promise<ResponseType> {
  try {
    // 1. Open realm
    const realm = await openRealm();

    // 2. Clear realm data
    realm.write(() => {
      realm.deleteAll();
    });

    // 3. Clear async storage
    await AsyncStorage.clear();

    // 3. Clear FileSystem document + cache directories
    await FileSystem.deleteAsync(FileSystem.documentDirectory!, {
      idempotent: true,
    });
    await FileSystem.deleteAsync(FileSystem.cacheDirectory!, {
      idempotent: true,
    });

    await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory!, {
      intermediates: true,
    });

    return { success: true, msg: "All user data erased successfully" };
  } catch (error: any) {
    console.error("Erase failed:", error);
    return { success: false, msg: error.message };
  }
}
