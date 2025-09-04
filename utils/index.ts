import { CourseType, ResponseType } from "@/types";
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
    const gradeValue = gradeScale[course.GradePoint!] ?? 0;
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
export const getItem = async (key: string): Promise<ResponseType> => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return { success: true, data: JSON.parse(value) };
    }
    return { success: false, data: null, msg: "No data found" };
  } catch (error) {
    return { success: false, msg: (error as Error).message };
  }
};

/**
 * Fetch an array from AsyncStorage (always return an array, even if empty)
 */
export const getArray = async <T>(key: string): Promise<ResponseType<T[]>> => {
  try {
    const existing = await AsyncStorage.getItem(key);
    const arr = existing ? JSON.parse(existing) : [];
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
export const addToArray = async (
  key: string,
  newEntry: any
): Promise<ResponseType> => {
  try {
    const existing = await AsyncStorage.getItem(key);
    let arr = existing ? JSON.parse(existing) : [];
    if (!Array.isArray(arr)) arr = [];

    arr.push(newEntry);
    await AsyncStorage.setItem(key, JSON.stringify(arr));

    return { success: true, data: arr };
  } catch (error) {
    return { success: false, msg: (error as Error).message };
  }
};

/**
 * Remove an entry by index from an array in AsyncStorage
 */
export const removeFromArray = async (
  key: string,
  itemToRemove: any
): Promise<ResponseType> => {
  try {
    const existing = await AsyncStorage.getItem(key);
    let arr = existing ? JSON.parse(existing) : [];
    if (!Array.isArray(arr)) arr = [];

    let newArr = arr;

    if (typeof itemToRemove === "object" && itemToRemove?.id) {
      // Remove by matching object id
      newArr = arr.filter((entry: any) => entry.id !== itemToRemove.id);
    } else {
      // Remove by value (string, number, etc.)
      newArr = arr.filter((entry: any) => entry !== itemToRemove);
    }

    await AsyncStorage.setItem(key, JSON.stringify(newArr));

    return { success: true, data: newArr };
  } catch (error) {
    return { success: false, msg: (error as Error).message };
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
