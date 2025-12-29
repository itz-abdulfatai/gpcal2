import { openRealm } from "@/models/db";
import { ResponseType } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import JSZip from "jszip";
// import RNFS from "react-native-fs";
export async function exportUserData(): Promise<ResponseType> {
  try {
    const realm = await openRealm();

    // 1. Read realm Data
    const semesters = realm.objects("Semester");
    const courses = realm.objects("Course");

    // 2. Read asyncStorage
    const asyncKeys = await AsyncStorage.getAllKeys();
    const asyncData = await AsyncStorage.multiGet(asyncKeys);

    // 3. Combine data
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      realmData: {
        semesters: semesters.map((s) => ({ ...s })),
        courses: courses.map((c) => ({ ...c })),
      },
      asyncStorage: Object.fromEntries(asyncData),
    };

    // add user image if it exists

    const userString = data.asyncStorage["user"];
    let imageBase64 = null;

    // 4. Create JSON or ZIP (you can toggle this)
    const useZip = true;
    const timestamp = new Date().toISOString().split("T")[0];
    let fileUri: string;

    if (useZip) {
      const zip = new JSZip();
      zip.file("Gpcal_backup.json", JSON.stringify(data, null, 2));
      const zipContent = await zip.generateAsync({ type: "base64" });

      const fileName = `Gpcal_backup_${timestamp}.zip`;
      fileUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, zipContent, {
        encoding: FileSystem.EncodingType.Base64,
      });
    } else {
      const fileName = `Gpcal_backup_${timestamp}.json`;
      fileUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(
        fileUri,
        JSON.stringify(data, null, 2)
      );
    }

    // 5. Save to user-visible storage
    const permission = await MediaLibrary.requestPermissionsAsync();
    if (permission.status === "granted") {
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      try {
        await MediaLibrary.createAlbumAsync("Download", asset, false);
      } catch (e) {
        // Album likely exists; add asset to existing album
        const album = await MediaLibrary.getAlbumAsync("Download");
        if (album)
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }
    }
    // TODO: Save to permanent storage

    // const path = `${
    //   RNFS.DownloadDirectoryPath
    // }/gpcal_backup_${Date.now()}.json`;

    // await RNFS.writeFile(path, JSON.stringify(data, null, 2), "utf8");
    // console.log("File saved to:", path);

    // 6. Offer share option (user can save anywhere)
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: useZip ? "application/zip" : "application/json",
        dialogTitle: "Export GPCal Backup",
      });
    }

    return { success: true, data: fileUri };
  } catch (error: any) {
    console.log("Export failed (export user data)", error);
    return { success: false, msg: error.message };
  }
}
