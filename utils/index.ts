import { Platform, ToastAndroid, Alert } from "react-native";
import {
  CourseType,
  GradeType,
  GradingSystem,
  ResponseType,
  SemesterType,
} from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";


// ------------------------------------------------------------------
// Color helpers for distinct, stable donut-chart colors
// ------------------------------------------------------------------

/**
 * Simple string -> int hash (djb2 variant). Stable across runs.
 */
export const hashStringToInt = (str: string): number => {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (h * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(h >>> 0);
};

/**
 * Convert HSL to hex color string.
 * h: 0-360, s: 0-100, l: 0-100
 */
export const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hh = h / 60;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  let r = 0,
    g = 0,
    b = 0;

  if (hh >= 0 && hh < 1) {
    r = c;
    g = x;
    b = 0;
  } else if (hh >= 1 && hh < 2) {
    r = x;
    g = c;
    b = 0;
  } else if (hh >= 2 && hh < 3) {
    r = 0;
    g = c;
    b = x;
  } else if (hh >= 3 && hh < 4) {
    r = 0;
    g = x;
    b = c;
  } else if (hh >= 4 && hh < 5) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  const m = l - c / 2;
  const to255 = (v: number) => Math.round((v + m) * 255);

  const R = to255(r);
  const G = to255(g);
  const B = to255(b);

  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(R)}${toHex(G)}${toHex(B)}`;
};

/**
 * Return a stable, distinct hex color for a course.
 *
 * @param idOrName - unique string (course.id or course.name)
 * @param index - optional index of the course (0-based)
 * @param total - optional total number of courses (used to space hues)
 *
 * Strategy:
 *  - Use hash of idOrName as base hue.
 *  - If total > 1, offset base hue by (index * 360 / total) to ensure spacing.
 *  - Use fixed saturation / lightness for good contrast.
 */
export const getColorForCourse = (
  idOrName: string | number,
  index?: number,
  total?: number
): string => {
  const key = String(idOrName ?? "");
  const seed = hashStringToInt(key);

  // baseHue in range 0-359
  const baseHue = seed % 360;

  let hue = baseHue;
  if (typeof index === "number" && typeof total === "number" && total > 1) {
    // space colors evenly based on index so adjacent slices differ
    const offset = Math.round((index * 360) / total);
    hue = (baseHue + offset) % 360;
  } else {
    // tiny golden ratio offset to reduce collisions
    const golden = 137.50776405003785; // golden angle (degrees)
    hue = Math.round((baseHue + (seed % 1000) * golden) % 360);
  }

  const saturation = 66; // 0-100
  const lightness = 54; // 0-100

  return hslToHex(hue, saturation, lightness);
};

/**
 * Optional: given a hex background color, returns '#000' or '#fff' for readable text.
 */
export const getContrastColor = (hex: string): "#000" | "#fff" => {
  // normalize hex
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);

  // relative luminance (sRGB)
  const srgb = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });

  const lum = 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
  // WCAG-like threshold
  return lum > 0.5 ? "#000" : "#fff";
};

// Backwards-compatible alias if you still call getRandomColor elsewhere:
export const getRandomColor = (): string =>
  getColorForCourse(Math.random().toString(36).slice(2));
// export const gradeScale: Record<string, number> = {
//   A: 5,
//   B: 4,
//   C: 3,
//   D: 2,
//   E: 1,
//   F: 0,
// };

export const formatCoursesForDonut = (
  courses: CourseType[],
  gradingSystem: GradingSystem
) => {
  // keep only courses with creditUnit and gradePoint present
  const filtered = courses.filter((c) => c.creditUnit && c.gradePoint != null);

  if (filtered.length === 0) return [];

  // compute weighted contribution (gradePoint * credits) for each course
  const items = filtered.map((c) => {
    const credits = Number(c.creditUnit ?? 0);
    const gp = gradeToPoint(c.gradePoint, gradingSystem);
    const weighted = gp * credits;
    return { course: c, credits, gp, weighted };
  });

  const totalWeighted = items.reduce((s, it) => s + it.weighted, 0);
  const totalCredits = items.reduce((s, it) => s + it.credits, 0);

  // Decide basis: weighted (preferred) or credits (fallback if all weighted are zero)
  const rawPercents =
    totalWeighted > 0
      ? items.map((it) => (it.weighted / totalWeighted) * 100)
      : totalCredits > 0
      ? items.map((it) => (it.credits / totalCredits) * 100)
      : items.map(() => 0);

  // round to 2 decimals and fix rounding error so sum is exactly 100.00
  const rounded = rawPercents.map((p) => Number(p.toFixed(2)));
  const sumRounded = rounded.reduce((a, b) => a + b, 0);
  const diff = Number((100 - sumRounded).toFixed(2));

  if (Math.abs(diff) >= 0.01) {
    // Add the small rounding difference to the largest contributor (keeps visuals sensible)
    const maxIdx = rawPercents.indexOf(Math.max(...rawPercents));
    rounded[maxIdx] = Number((rounded[maxIdx] + diff).toFixed(2));
  }

  // return chart-friendly objects: value = percent, color, and text "name (xx.xx%)"
  return items.map((it, i) => ({
    value: rounded[i],
    color: getRandomColor(),
    text: `${it.course.name} (${rounded[i]}%)`,
  }));
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

const gradingMaps: Record<GradingSystem, Record<string, number>> = {
  "A, B, C, D, E, F": {
    A: 5,
    B: 4,
    C: 3,
    D: 2,
    E: 1,
    F: 0,
  },
  "A, B, C, D, F": {
    A: 4,
    B: 3,
    C: 2,
    D: 1,
    F: 0,
  },
  "A+, A, A-, B+, B, B-, C+, C, C-, D+, D, D-, F": {
    "A+": 4.0,
    A: 3.9,
    "A-": 3.7,
    "B+": 3.3,
    B: 3.0,
    "B-": 2.7,
    "C+": 2.3,
    C: 2.0,
    "C-": 1.7,
    "D+": 1.3,
    D: 1.0,
    "D-": 0.7,
    F: 0,
  },
  Percentage: {}, // handled dynamically
};
const gradeToPoint = (
  grade: GradeType,
  gradingSystem: GradingSystem
): number => {
  if (grade === null) return 0;

  if (gradingSystem === "Percentage") {
    const pct = Number(grade);
    if (isNaN(pct)) return 0;

    // Convert to 4-point scale (customizable)
    if (pct >= 70) return 4;
    if (pct >= 60) return 3;
    if (pct >= 50) return 2;
    if (pct >= 45) return 1;
    return 0;
  }

  const map = gradingMaps[gradingSystem];
  const normalized = String(grade).trim().toUpperCase();
  return map[normalized] ?? 0;
};

export const computeGPA = (
  courses: CourseType[],
  gradingSystem: GradingSystem
) => {
  const map = gradingMaps[gradingSystem];

  const filtered = courses.filter((c) => c.creditUnit && c.gradePoint != null);

  let totalCredits = 0;
  let totalWeighted = 0;

  for (const c of filtered) {
    let gp: number;

    if (gradingSystem === "Percentage") {
      // assume gradePoint is numeric (0–100)
      const pct = Number(c.gradePoint);
      if (isNaN(pct)) continue;

      // convert to 4.0 scale (customize if you prefer 5.0)
      if (pct >= 70) gp = 4;
      else if (pct >= 60) gp = 3;
      else if (pct >= 50) gp = 2;
      else if (pct >= 45) gp = 1;
      else gp = 0;
    } else {
      gp = map[String(c.gradePoint).toUpperCase()] ?? 0;
    }

    const credits = Number(c.creditUnit);
    totalCredits += credits;
    totalWeighted += gp * credits;
  }

  return totalCredits === 0 ? null : +(totalWeighted / totalCredits).toFixed(2);
};
// without linked semester fallback
// export const computeCGPAWeighted = (semesters: SemesterType[]) => {
//   console.log("calculating cgpa (weighted)");

//   let totalCredits = 0;
//   let totalWeighted = 0;

//   for (const semester of semesters) {
//     const filtered = semester.courses.filter(
//       (c) => c.creditUnit && c.gradePoint
//     );

//     for (const c of filtered) {
//       const gp =
//         typeof c.gradePoint === "string"
//           ? gradeToPoint(c.gradePoint) // assumes you already have this function
//           : Number(c.gradePoint);

//       const credits = Number(c.creditUnit ?? 0);
//       totalCredits += credits;
//       totalWeighted += gp * credits;
//     }
//   }

//   return totalCredits === 0 ? null : +(totalWeighted / totalCredits).toFixed(2);
// };

// with linked semester fallback
export const computeCGPAWeighted = (
  semesters: SemesterType[]
): number | null => {
  console.log("calculating cgpa (weighted + fallback)");

  let totalCredits = 0;
  let totalWeighted = 0;

  // Step 1: Collect course-based credits + weights
  for (const semester of semesters) {
    const filtered = semester.courses.filter(
      (c) => c.creditUnit && c.gradePoint != null
    );

    for (const c of filtered) {
      const gp = gradeToPoint(c.gradePoint, semester.gradingSystem);
      const credits = Number(c.creditUnit ?? 0);
      totalCredits += credits;
      totalWeighted += gp * credits;
    }
  }

  // Step 2: Estimate average semester load from existing data
  const semesterLoads = semesters.map((s) =>
    s.courses.reduce((sum, c) => sum + (c.creditUnit ?? 0), 0)
  );
  const validLoads = semesterLoads.filter((x) => x > 0);
  const avgLoad =
    validLoads.reduce((a, b) => a + b, 0) / Math.max(1, validLoads.length);

  // Step 3: Handle GPA-only semesters (no courses, but GPA exists)
  for (const semester of semesters) {
    const hasCourses = semester.courses.some(
      (c) => c.creditUnit && c.gradePoint != null
    );
    if (!hasCourses && semester.gpa != null) {
      const assumedCredits = avgLoad || 1;
      totalCredits += assumedCredits;
      totalWeighted += semester.gpa * assumedCredits;
    }
  }

  // Step 4: Final CGPA computation
  return totalCredits === 0 ? null : +(totalWeighted / totalCredits).toFixed(2);
};

// export const computeCGPAAverage = (semesters: SemesterType[]) => {
//   console.log("calculating cgpa (average)");

//   const valid = semesters.filter((s) => s.gpa !== null);

//   if (valid.length === 0) return null;

//   const sum = valid.reduce((acc, s) => acc + (s.gpa ?? 0), 0);
//   return +(sum / valid.length).toFixed(2);
// };

export function createPercentageArray() {
  return Array.from({ length: 101 }, (_, i) => ({
    label: `${i}%`,
    value: `${i}`,
  })).reverse();
}
