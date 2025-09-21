import { Platform, ToastAndroid, Alert } from "react-native";
import { CourseType, GradeType, ResponseType, SemesterType } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const getRandomColor = () =>
  `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0")}`;

export const gradeScale: Record<string, number> = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  E: 1,
  F: 0,
};

export const formatCoursesForDonut = (courses: CourseType[]) => {
  console.log("formatCoursesForDonut");

  return courses.map((course) => {
    const gradeValue = gradeScale[course.gradePoint!] ?? 0;
    const weightedValue = course.creditUnit! * gradeValue;

    return {
      value: weightedValue,
      color: getRandomColor(),
      text: `${course.name}`, // can be course.name, GradePoint, or whatever
    };
  });
};

/**
 * Fetch data from AsyncStorage and return as object
 */
export const getItem = async <T = unknown>(
  key: string
): Promise<ResponseType<T | null>> => {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw !== null) {
      return { success: true, data: JSON.parse(raw) as T };
    }
    return { success: false, data: null, msg: "No data found" };
  } catch (error) {
    return { success: false, data: null, msg: (error as Error).message };
  }
};
/**
 * Fetch an array from AsyncStorage (always return an array, even if empty)
 */
export const getArray = async <T>(key: string): Promise<ResponseType<T[]>> => {
  try {
    const existing = await AsyncStorage.getItem(key);
    const parsed = existing ? JSON.parse(existing) : [];
    const arr: T[] = Array.isArray(parsed) ? (parsed as T[]) : [];
    return { success: true, data: arr };
  } catch (error) {
    return { success: false, msg: (error as Error).message, data: [] as T[] };
  }
};
/**
 * Take object and save to AsyncStorage
 */
export const setItem = async (
  key: string,
  value: object
): Promise<ResponseType> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return { success: true, data: value };
  } catch (error) {
    return { success: false, msg: (error as Error).message };
  }
};

/**
 * Add an entry to an array in AsyncStorage
 */
export const addToArray = async <T>(
  key: string,
  newEntry: T
): Promise<ResponseType<T[]>> => {
  try {
    const existing = await AsyncStorage.getItem(key);
    if (!existing) console.log("key does not even exist");

    const parsed = existing ? JSON.parse(existing) : [];
    const arr: T[] = Array.isArray(parsed) ? (parsed as T[]) : [];

    arr.push(newEntry);
    await AsyncStorage.setItem(key, JSON.stringify(arr));

    return { success: true, data: arr };
  } catch (error) {
    return { success: false, msg: (error as Error).message, data: [] as T[] };
  }
};
/**
/**
 * Remove an entry by id (if object with `id`) or by value from an array in AsyncStorage
 */
export const removeFromArray = async <T>(
  key: string,
  itemToRemove: T
): Promise<ResponseType<T[]>> => {
  try {
    const existing = await AsyncStorage.getItem(key);
    const parsed = existing ? JSON.parse(existing) : [];
    const arr: unknown[] = Array.isArray(parsed) ? parsed : [];

    const isObjectWithId = (v: unknown): v is { id: string | number } =>
      typeof v === "object" && v !== null && "id" in v;

    const newArr: unknown[] = isObjectWithId(itemToRemove)
      ? arr.filter(
          (entry) =>
            !(
              typeof entry === "object" &&
              entry !== null &&
              "id" in entry &&
              (entry as any).id === itemToRemove.id
            )
        )
      : arr.filter((entry) => entry !== itemToRemove);

    await AsyncStorage.setItem(key, JSON.stringify(newArr));

    return { success: true, data: newArr as T[] };
  } catch (error) {
    return { success: false, msg: (error as Error).message, data: [] as T[] };
  }
};
/**
 * Clear all data in AsyncStorage
 */
export const clearStorage = async (): Promise<ResponseType> => {
  try {
    await AsyncStorage.clear();
    return { success: true, msg: "Storage cleared" };
  } catch (error) {
    return { success: false, msg: (error as Error).message };
  }
};

export async function getData<T>(key: string): Promise<T[]> {
  const { data, success } = await getArray<T>(key);

  if (success && data) {
    return data;
  }

  return [];
}

/**
 * Update a setting in AsyncStorage by id.
 * @param key - The AsyncStorage key (e.g., 'generalSettings', 'academicSettings')
 * @param id - The id of the setting to update
 * @param changes - The partial object with changes to apply
 * @returns The updated array of settings
 */
export const updateSettingInStorage = async <T extends { id: string }>(
  key: string,
  id: string,
  changes: Partial<T>
): Promise<ResponseType<T[]>> => {
  try {
    const existing = await AsyncStorage.getItem(key);
    const parsed = existing ? JSON.parse(existing) : [];
    const arr: T[] = Array.isArray(parsed) ? (parsed as T[]) : [];
    const updatedArr = arr.map((item) =>
      item.id === id ? { ...item, ...changes } : item
    );
    await AsyncStorage.setItem(key, JSON.stringify(updatedArr));
    return { success: true, data: updatedArr };
  } catch (error) {
    return { success: false, msg: (error as Error).message, data: [] as T[] };
  }
};

// export const logAllStorage = async () => {
//   try {
//     const keys = await AsyncStorage.getAllKeys();
//     const stores = await AsyncStorage.multiGet(keys);

//     stores.forEach(([key, value]) => {
//       let parsedValue;
//       try {
//         parsedValue = JSON.parse(value ?? "null");
//       } catch {
//         parsedValue = value; // fallback if it's not JSON
//       }

//       console.log(`${key}:`, parsedValue);
//     });

//     return stores.map(([key, value]) => {
//       try {
//         return [key, JSON.parse(value ?? "null")];
//       } catch {
//         return [key, value];
//       }
//     });
//   } catch (e) {
//     console.error("Error reading AsyncStorage:", e);
//   }
// };

/**
 * Update an entry in an array in AsyncStorage by id.
 * If the entry does not exist, it will not add a new one.
 * @param key - The AsyncStorage key (e.g., 'semesters')
 * @param id - The id of the entry to update
 * @param changes - The partial object with changes to apply
 * @returns The updated array
 */
export const updateArrayEntry = async <T extends { id: string }>(
  key: string,
  id: string,
  changes: Partial<T>
): Promise<ResponseType<T[]>> => {
  try {
    const existing = await AsyncStorage.getItem(key);
    const parsed = existing ? JSON.parse(existing) : [];
    const arr: T[] = Array.isArray(parsed) ? (parsed as T[]) : [];
    const updatedArr = arr.map((item) =>
      item.id === id ? { ...item, ...changes } : item
    );
    await AsyncStorage.setItem(key, JSON.stringify(updatedArr));
    return { success: true, data: updatedArr };
  } catch (error) {
    return { success: false, msg: (error as Error).message, data: [] as T[] };
  }
};

export const alert = (message: string): void => {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert("", message);
  }
};

export const gradeMap: Record<Exclude<GradeType, null>, number> = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  E: 1,
  F: 0,
};
export const gradeToPoint = (grade: GradeType) => {
  if (grade === null) return 0;
  return gradeMap[grade];
};

export const computeGPA = (courses: CourseType[]) => {
  console.log("calculating gpa");

  const filtered = courses.filter((c) => c.creditUnit && c.gradePoint);
  let totalCredits = 0;
  let totalWeighted = 0;
  for (const c of filtered) {
    const gp =
      typeof c.gradePoint === "string"
        ? gradeToPoint(c.gradePoint)
        : Number(c.gradePoint);
    const credits = Number(c.creditUnit ?? 0);
    totalCredits += credits;
    totalWeighted += gp * credits;
  }
  return totalCredits === 0 ? null : +(totalWeighted / totalCredits).toFixed(2);
};

export const computeCGPAWeighted = (semesters: SemesterType[]) => {
  console.log("calculating cgpa (weighted)");

  let totalCredits = 0;
  let totalWeighted = 0;

  for (const semester of semesters) {
    const filtered = semester.courses.filter(
      (c) => c.creditUnit && c.gradePoint
    );

    for (const c of filtered) {
      const gp =
        typeof c.gradePoint === "string"
          ? gradeToPoint(c.gradePoint) // assumes you already have this function
          : Number(c.gradePoint);

      const credits = Number(c.creditUnit ?? 0);
      totalCredits += credits;
      totalWeighted += gp * credits;
    }
  }

  return totalCredits === 0 ? null : +(totalWeighted / totalCredits).toFixed(2);
};

// export const computeCGPAAverage = (semesters: SemesterType[]) => {
//   console.log("calculating cgpa (average)");

//   const valid = semesters.filter((s) => s.gpa !== null);

//   if (valid.length === 0) return null;

//   const sum = valid.reduce((acc, s) => acc + (s.gpa ?? 0), 0);
//   return +(sum / valid.length).toFixed(2);
// };
