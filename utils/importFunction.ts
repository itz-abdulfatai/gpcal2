import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import { openRealm } from "@/models/db";
import { ResponseType } from "@/types";
import JSZip from "jszip";
import Realm from "realm";

export async function importUserData(): Promise<ResponseType> {
  try {
    // 1. Ask user to select a backup file
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/json", "application/zip"],
    });

    if (result.canceled) return { success: false, msg: "Import canceled" };

    const fileUri = result.assets[0].uri;
    const extension = fileUri.split(".").pop()?.toLowerCase();

    // 2. Read file content
    const fileString = await FileSystem.readAsStringAsync(fileUri, {
      encoding:
        extension === "zip"
          ? FileSystem.EncodingType.Base64
          : FileSystem.EncodingType.UTF8,
    });

    // 3. Parse backup
    let parsed: any;
    if (extension === "zip") {
      const zip = await JSZip.loadAsync(fileString, { base64: true });
      const jsonFile = zip.file("Gpcal_backup.json");
      if (!jsonFile) throw new Error("Invalid backup: JSON missing inside ZIP");
      const jsonString = await jsonFile.async("string");
      parsed = JSON.parse(jsonString);
    } else {
      parsed = JSON.parse(fileString);
    }

    // 4. Validate structure
    if (!parsed.realmData || !parsed.realmData.semesters) {
      return { success: false, msg: "Invalid backup file" };
    }

    const fixSemesterUUIDs = (s: any) => {
      const safeUUID = (val: any) => {
        if (typeof val === "string") {
          try {
            return new Realm.BSON.UUID(val);
          } catch {
            return new Realm.BSON.UUID(); // fallback new UUID
          }
        }
        return val;
      };

      return {
        ...s,
        id: safeUUID(s.id),
        linkedSemesters: Array.isArray(s.linkedSemesters)
          ? s.linkedSemesters.map((x: any) => safeUUID(x))
          : [],
        courses: Array.isArray(s.courses)
          ? s.courses.map((c: any) => fixCourseUUIDs(c))
          : [],
      };
    };

    const fixCourseUUIDs = (c: any) => {
      const safeUUID = (val: any) => {
        if (typeof val === "string") {
          try {
            return new Realm.BSON.UUID(val);
          } catch {
            return new Realm.BSON.UUID();
          }
        }
        return val;
      };

      return {
        ...c,
        id: safeUUID(c.id),
        semesterId: safeUUID(c.semesterId),
      };
    };

    // 5. Restore Realm data
    const realm = await openRealm();

    realm.write(() => {
      realm.deleteAll();
    });

    realm.write(() => {
      // Create semesters without courses
      parsed.realmData.semesters.forEach((s: any) => {
        const fixed = fixSemesterUUIDs(s);
        realm.create("Semester", { ...fixed, courses: [] });
      });

      // Create courses
      parsed.realmData.courses.forEach((c: any) => {
        const fixed = fixCourseUUIDs(c);
        realm.create("Course", fixed);
      });

      // Optionally link courses back to semesters
      const semesterMap = new Map();
      realm
        .objects("Semester")
        .forEach((sem: any) => semesterMap.set(sem.id.toHexString(), sem));

      parsed.realmData.courses.forEach((c: any) => {
        const fixed = fixCourseUUIDs(c);
        const sem = semesterMap.get(fixed.semesterId.toHexString());
        if (sem)
          sem.courses.push(realm.objectForPrimaryKey("Course", fixed.id));
      });
    });

    // 6. Restore AsyncStorage data
    if (parsed.asyncStorage) {
      const asyncPairs = Object.entries(parsed.asyncStorage);
      await AsyncStorage.multiSet(asyncPairs as [string, string][]);
    }

    return { success: true, msg: "Backup imported successfully" };
  } catch (error: any) {
    console.log("Import failed (importUserData)", error);
    return { success: false, msg: error.message };
  }
}
