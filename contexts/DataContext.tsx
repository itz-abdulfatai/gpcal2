import {
  DataContextType,
  SemesterType,
  CourseType,
  SettingsType,
  UtilitiesType,
  AppInfoType,
  UserType,
  ResponseType,
} from "@/types";
import { getData, setItem, updateSettingInStorage } from "@/utils";
import { createContext, FC, useContext, useState, useEffect } from "react";
import {
  ChatCenteredTextIcon,
  HeadphonesIcon,
  InfoIcon,
} from "phosphor-react-native";
import { colors } from "@/constants/theme";

import Realm from "realm";
import { SemesterSchema, CourseSchema } from "@/models/realmSchemas";

// ------------------------------------------------------------------------------------------------
// realm matters
// ------------------------------------------------------------------------------------------------

const realmConfig = {
  schema: [SemesterSchema, CourseSchema],
  schemaVersion: 5,
  deleteRealmIfMigrationNeeded: true, // ⚠️ this clears old data
};

let realm: Realm | null = null;

const openRealm = async () => {
  if (!realm) {
    realm = await Realm.open(realmConfig);
  }
  console.log("Realm file path:", realm.path);
  return realm;
};
// ------------------------------------------------------------------------------------------------
// realm matters
// ------------------------------------------------------------------------------------------------

// ----------------------------------
// Default Data
// ----------------------------------
const academicsSettings: SettingsType[] = [
  {
    id: "1",
    title: "Grading Scheme",
    subtitle: "Choose how grades are represented",
    type: "dropdown",
    iconName: "GraduationCapIcon",
    options: [
      "A, B, C, D, E, F",
      "A+, A, B+, B, C+, C, D, F",
      "O, A+, A, B+, B, C (India system)",
      "Percentage",
    ],
    selectedOption: "A, B, C, D, E, F",
  },
  {
    id: "2",
    title: "Pass/Fail Option",
    subtitle: "Allow pass/fail grading for eligible courses",
    type: "toggle",
    iconName: "CheckCircleIcon",
    toggled: false,
  },
  {
    id: "3",
    title: "Grade Rounding Rules",
    subtitle: "Define how decimal grades are rounded",
    type: "dropdown",
    iconName: "ArrowClockwiseIcon",
    options: [
      "Keep two decimals",
      "Round to nearest whole number",
      "Always round up ",
      "Always round down ",
    ],
    selectedOption: "Keep two decimals",
  },
];

const defaultUtilities: UtilitiesType[] = [
  {
    id: "1",
    title: "Export Data",
    subtitle: "Download a backup of your academic data",
    color: colors.white,
    onTap() {
      console.log("export data tapped");
    },
    iconName: "ExportIcon",
    buttonText: "Export",
    textColor: colors.black,
  },
  {
    id: "2",
    title: "Import Data",
    subtitle: "Import a previously exported data file",
    color: colors.white,
    onTap() {
      console.log("import data tapped");
    },
    iconName: "ExportIcon",
    buttonText: "Import",
    textColor: colors.black,
  },
  {
    id: "3",
    title: "Reset All Data",
    subtitle: "Permanently delete all your application data",
    color: colors.rose,
    onTap() {
      console.log("reset data tapped");
    },
    iconName: "TrashIcon",
    buttonText: "Reset",
    textColor: colors.white,
  },
];

const defaultGeneralSettings: SettingsType[] = [
  {
    id: "1",
    title: "App Theme",
    subtitle: "Toggle between Light and Dark mode",
    type: "toggle",
    toggled: false,
    iconName: "SunIcon",
  },
  {
    id: "2",
    title: "Notifications",
    subtitle: "Receive notifications about important academic updates",
    type: "toggle",
    toggled: true,
    iconName: "SunIcon",
  },
  {
    id: "3",
    title: "Language",
    subtitle: "Select your preferred language",
    type: "dropdown",
    options: ["English", "Spanish", "French", "German"],
    selectedOption: "English",
    iconName: "SunIcon",
  },
  {
    id: "4",
    title: "Screen Lock",
    subtitle: "Require PIN or biometric authentication to open the app",
    type: "toggle",
    toggled: false,
    iconName: "SunIcon",
  },
];

const siteInfo: AppInfoType[] = [
  {
    id: "1",
    title: "Send Feedback",
    Icon: (props) => <ChatCenteredTextIcon {...props} />,
    route: "/",
  },
  {
    id: "2",
    title: "Get Support",
    Icon: (props) => <HeadphonesIcon {...props} />,
    route: "/",
  },
  {
    id: "3",
    title: "About this App",
    Icon: (props) => <InfoIcon {...props} />,
    route: "/",
  },
];

/**
 * Seed AsyncStorage with initial app data for first-time users.
 * Only runs if no settings/courses/semesters exist.
 */
const seedInitialData = async () => {
  // Check if data already exists
  const [semesters, courses, academicSettings, utilities, generalSettings] =
    await Promise.all([
      getData<SemesterType>("semesters"),
      getData<CourseType>("courses"),
      getData<SettingsType>("academicSettings"),
      getData<UtilitiesType>("utilities"),
      getData<SettingsType>("generalSettings"),
    ]);

  // Only seed if all are empty
  if (
    semesters.length === 0 &&
    courses.length === 0 &&
    academicSettings.length === 0 &&
    utilities.length === 0 &&
    generalSettings.length === 0
  ) {
    await setItem("semesters", []);
    await setItem("courses", []);
    await setItem("academicSettings", academicsSettings);
    await setItem("utilities", defaultUtilities);
    await setItem("generalSettings", defaultGeneralSettings);
  }
};

// ----------------------------------
// Context Setup
// ----------------------------------
const DataContext = createContext<DataContextType | null>(null);

export const DataContextProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [generalSettings, setGeneralSettings] = useState<SettingsType[]>([]);
  const [academicSettings, setAcademicSettings] = useState<SettingsType[]>([]);
  const [utilities, setUtilities] = useState<UtilitiesType[]>([]);
  const [infos, setInfos] = useState<AppInfoType[]>([]);
  const [semesters, setSemesters] = useState<SemesterType[]>([]);
  const [courses] = useState<CourseType[]>([]);
  const [user] = useState<UserType>(null);
  const [language] = useState("en");

  useEffect(() => {
    getSemesters(); // Loads semesters from Realm and sets state
    // logAllStorage();

    const loadData = async () => {
      try {
        const academicSettings = await getData<SettingsType>(
          "academicSettings"
        );
        const utilities = await getData<UtilitiesType>("utilities");
        const generalSettings = await getData<SettingsType>("generalSettings");

        setAcademicSettings(
          academicSettings.length > 0 ? academicSettings : academicsSettings
        );
        setUtilities(utilities.length > 0 ? utilities : defaultUtilities);
        setGeneralSettings(
          generalSettings.length > 0 ? generalSettings : defaultGeneralSettings
        );
        setInfos(siteInfo);
      } catch (error) {
        console.log("an error occured(loadData)", error);

        setAcademicSettings(academicsSettings);
        setUtilities(defaultUtilities);
        setGeneralSettings(defaultGeneralSettings);
        setInfos(siteInfo);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    let realmInstance: Realm;
    let semesters: Realm.Results<any>;

    const setupListener = async () => {
      realmInstance = await openRealm();
      semesters = realmInstance.objects<SemesterType>("Semester");
      setSemesters([...semesters]);
      semesters.addListener(() => {
        setSemesters([...semesters]);
      });
    };

    setupListener();

    return () => {
      semesters?.removeAllListeners();
      // if (realmInstance && !realmInstance.isClosed) {
      //   realmInstance.close();
      // }
      realm = null;
    };
  }, []);

  /**
   * Update a general setting by id, persist to AsyncStorage and update state.
   */
  const updateGeneralSetting = async (
    id: string,
    changes: Partial<SettingsType>
  ) => {
    setGeneralSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...changes } : s))
    );
    await updateSettingInStorage<SettingsType>("generalSettings", id, changes);
  };

  /**
   * Update an academic setting by id, persist to AsyncStorage and update state.
   */
  const updateAcademicSetting = async (
    id: string,
    changes: Partial<SettingsType>
  ) => {
    setAcademicSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...changes } : s))
    );
    await updateSettingInStorage<SettingsType>("academicSettings", id, changes);
  };

  // const addSemester = async (semester: SemesterType) => {
  //   console.log("add semester called");
  //   if (!semester.name.trim()) return;

  //   setSemesters((prev) => [...prev, semester]);
  //   await addToArray<SemesterType>("semesters", semester);
  //   logAllStorage();
  // };

  // const updateSemester = async (id: string, changes: Partial<SemesterType>) => {
  //   setSemesters((prev) =>
  //     prev.map((s) => (s.id === id ? { ...s, ...changes } : s))
  //   );
  //   await updateArrayEntry<SemesterType>("semesters", id, changes);
  // };

  // CREATE
  const addSemester = async (semester: SemesterType): Promise<ResponseType> => {
    try {
      const realm = await openRealm();
      realm.write(() => {
        realm.create("Semester", semester);
      });
      setSemesters([...realm.objects<SemesterType>("Semester")]);
      return { success: true };
    } catch (error: any) {
      console.log("error occured (deleteCourse)", error);
      return { success: false, msg: error.message };
    }
  };

  const addCourse = async (
    course: CourseType,
    semesterId: Realm.BSON.UUID
  ): Promise<ResponseType> => {
    try {
      const realm = await openRealm();
      realm.write(() => {
        const semester = realm.objectForPrimaryKey(
          "Semester",
          semesterId
        ) as any;
        if (!semester) {
          throw new Error(`Semester with id ${semesterId} not found`);
        }
        if (semester.courses) {
          semester.courses.push(course);
        } else {
          throw new Error(`Semester courses array is not initialized`);
        }
      });
      setSemesters([...realm.objects<SemesterType>("Semester")]);
      return { success: true };
    } catch (error: any) {
      console.log("error occured (addCourse)", error);
      return { success: false, msg: error.message };
    }
  };
  // READ
  const getSemesters = async (): Promise<ResponseType> => {
    try {
      const realm = await openRealm();
      const semesters = realm.objects<SemesterType>("Semester");
      setSemesters([...semesters]);

      return { success: true, data: semesters };
    } catch (error: any) {
      console.log("error occured (getSemesters)", error);
      return { success: false, msg: error.message };
    }
  };

  const getSemesterById = async (
    id: Realm.BSON.UUID | string
  ): Promise<SemesterType | null> => {
    try {
      const realm = await openRealm();

      // Convert string to UUID if needed
      const uuid = typeof id === "string" ? new Realm.BSON.UUID(id) : id;

      const semester = realm.objectForPrimaryKey<SemesterType>(
        "Semester",
        uuid
      );
      return semester ? { ...semester } : null;
    } catch (error) {
      console.log("error occured (getSemesterById)", error);
      return null;
    }
  };

  const getCourses = async (semesterId: string) => {
    const realm = await openRealm();
    const semester = realm.objectForPrimaryKey("Semester", semesterId) as any;
    return semester ? (Array.from(semester.courses) as CourseType[]) : [];
  };

  const linkSemester = async (
    semesterId: string,
    linkedSemesterId: string
  ): Promise<ResponseType> => {
    try {
      const realm = await openRealm();
      realm.write(() => {
        const semester = realm.objectForPrimaryKey<SemesterType>(
          "Semester",
          new Realm.BSON.UUID(semesterId)
        );
        const linkedSemester = realm.objectForPrimaryKey<SemesterType>(
          "Semester",
          new Realm.BSON.UUID(linkedSemesterId)
        );

        if (!semester || !linkedSemester) {
          throw new Error("Semester not found");
        }

        // Add linkedSemesterId to semester.linkedSemesters
        if (
          !semester.linkedSemesters.some((id) =>
            id.equals(new Realm.BSON.UUID(linkedSemesterId))
          )
        ) {
          semester.linkedSemesters.push(new Realm.BSON.UUID(linkedSemesterId));
        }

        // Add semesterId to linkedSemester.linkedSemesters
        if (
          !linkedSemester.linkedSemesters.some((id) =>
            id.equals(new Realm.BSON.UUID(semesterId))
          )
        ) {
          linkedSemester.linkedSemesters.push(new Realm.BSON.UUID(semesterId));
        }
      });

      setSemesters([...realm.objects<SemesterType>("Semester")]);
      return { success: true };
    } catch (error: any) {
      console.log("error occured (linkSemester)", error);
      return { success: false, msg: error.message };
    }
  };

  const unlinkSemester = async (
    semesterId: string,
    linkedSemesterId: string
  ): Promise<ResponseType> => {
    try {
      const realm = await openRealm();
      realm.write(() => {
        const semester = realm.objectForPrimaryKey<SemesterType>(
          "Semester",
          new Realm.BSON.UUID(semesterId)
        );
        const linkedSemester = realm.objectForPrimaryKey<SemesterType>(
          "Semester",
          new Realm.BSON.UUID(linkedSemesterId)
        );

        if (!semester || !linkedSemester) {
          throw new Error("Semester not found");
        }

        // Remove linkedSemesterId from semester.linkedSemesters
        semester.linkedSemesters = semester.linkedSemesters.filter(
          (id) => !id.equals(new Realm.BSON.UUID(linkedSemesterId))
        ) as any;

        // Remove semesterId from linkedSemester.linkedSemesters
        linkedSemester.linkedSemesters = linkedSemester.linkedSemesters.filter(
          (id) => !id.equals(new Realm.BSON.UUID(semesterId))
        ) as any;
      });

      setSemesters([...realm.objects<SemesterType>("Semester")]);
      return { success: true };
    } catch (error: any) {
      console.log("error occured (unlinkSemester)", error);
      return { success: false, msg: error.message };
    }
  };


  // UPDATE
  const updateSemester = async (
    id: string,
    changes: Partial<SemesterType>
  ): Promise<ResponseType> => {
    try {
      const realm = await openRealm();
      realm.write(() => {
        const semester = realm.objectForPrimaryKey(
          "Semester",
          new Realm.BSON.UUID(id)
        );
        if (semester) {
          Object.assign(semester, changes);
        }
      });
      setSemesters([...realm.objects<SemesterType>("Semester")]);
      return { success: true };
    } catch (error: any) {
      console.log("error occured (updateSemester)", error);
      return { success: false, msg: error.message };
    }
  };

  const updateCourse = async (id: string, changes: Partial<CourseType>) => {
    const realm = await openRealm();
    realm.write(() => {
      const course = realm.objectForPrimaryKey("Course", id);
      if (course) {
        Object.assign(course, changes);
      }
    });
    setSemesters([...realm.objects<SemesterType>("Semester")]);
  };

  // DELETE
  const deleteSemester = async (id: string): Promise<ResponseType> => {
    try {
      const realm = await openRealm();
      realm.write(() => {
        const semester = realm.objectForPrimaryKey("Semester", id);
        if (semester) {
          realm.delete(semester);
        }
      });
      setSemesters([...realm.objects<SemesterType>("Semester")]);
      return { success: true };
    } catch (error: any) {
      console.log("error occured (deleteSemester)", error);
      return { success: false, msg: error.message };
    }
  };

  const deleteCourse = async (id: string): Promise<ResponseType> => {
    try {
      const realm = await openRealm();
      realm.write(() => {
        const course = realm.objectForPrimaryKey("Course", id);
        if (course) {
          realm.delete(course);
        }
      });
      setSemesters([...realm.objects<SemesterType>("Semester")]);
      return { success: true };
    } catch (error: any) {
      console.log("error occured (addSemester)", error);
      return { success: false, msg: error.message };
    }
  };

  const contextValue: DataContextType = {
    user,
    semesters,
    courses,
    generalSettings,
    academicSettings,
    utilities,
    infos,
    language,
    updateGeneralSetting,
    updateAcademicSetting,
    addSemester,
    updateSemester,

    addCourse,
    getSemesters,
    getSemesterById,
    getCourses,

    updateCourse,
    deleteSemester,
    deleteCourse,
    linkSemester,
    unlinkSemester,
  };

  if (!generalSettings.length || !academicSettings.length) {
    return null; // or a loading spinner
  }

  return (
    <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
  );
};

// Custom hook
export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataContextProvider");
  }
  return context;
};

export default DataContextProvider;
