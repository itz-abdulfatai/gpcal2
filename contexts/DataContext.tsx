import {
  DataContextType,
  SemesterType,
  CourseType,
  SettingsType,
  UtilitiesType,
  AppInfoType,
  UserType,
  ResponseType,
  GradingSystem,
} from "@/types";
import { updateSettingInStorage } from "@/utils";
import { createContext, FC, useContext, useState, useEffect } from "react";
import {
  ChatCenteredTextIcon,
  HeadphonesIcon,
  InfoIcon,
} from "phosphor-react-native";
// import { colors } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";

import Realm from "realm";
import { SemesterSchema, CourseSchema } from "@/models/realmSchemas";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ------------------------------------------------------------------------------------------------
// realm matters
// ------------------------------------------------------------------------------------------------

const realmConfig = {
  schema: [SemesterSchema, CourseSchema],
  schemaVersion: 6,
  deleteRealmIfMigrationNeeded: true, // ⚠️ this clears old data
};

let realm: Realm | null = null;

const openRealm = async () => {
  if (!realm) {
    realm = await Realm.open(realmConfig);
  }
  // console.log("Realm file path:", realm.path);
  return realm;
};
// ------------------------------------------------------------------------------------------------
// realm matters
// ------------------------------------------------------------------------------------------------

// ----------------------------------
// Default Data
// ----------------------------------

const siteInfo: AppInfoType[] = [
  {
    id: "1",
    title: "Send Feedback/ Feature Requests",
    Icon: (props) => <ChatCenteredTextIcon {...props} />,
    route: "/", // can accept an external link
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
    route: "/(modals)/aboutModal",
  },
];

/**
 * Seed AsyncStorage with initial app data for first-time users.
 * Only runs if no settings/courses/semesters exist.
 */

// ----------------------------------
// Context Setup
// ----------------------------------
const DataContext = createContext<DataContextType | null>(null);

export const DataContextProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { colors, theme, setTheme } = useTheme();
  const [sendNotifications, setSendNotifications] = useState<boolean>(false);
  const [language, setLanguage] = useState("English");
  const [gradingScheme, setGradingScheme] =
    useState<GradingSystem>("A, B, C, D, E, F");
  const [gradeRounding, setGradeRounding] =
    useState<string>("Keep two decimals");
  const [requireBioMetric, setRequireBioMetric] = useState<boolean>(false);

  const [infos, setInfos] = useState<AppInfoType[]>(siteInfo);
  const [semesters, setSemesters] = useState<SemesterType[]>([]);
  const [courses] = useState<CourseType[]>([]);
  const [user, setUser] = useState<UserType>({
    name: "kamaru Doe",
    image: null,
    createdAt: new Date(),
    onboarded: false,
    uid: "user123",
  });

  useEffect(() => {
    const fetchSendNotifications = async () => {
      try {
        const value = await AsyncStorage.getItem("sendNotifications");
        setSendNotifications(value === "true");
        await updateGeneralSetting("2", { toggled: value === "true" });
      } catch (error) {
        console.log("failed to load/sync sendNotifications", error);
      }
    };
    fetchSendNotifications();
  }, []);
  const changeSendNotifications = (value: boolean) => {
    setSendNotifications(value);
    AsyncStorage.setItem("sendNotifications", JSON.stringify(value));
  };

  useEffect(() => {
    const fetchLanguage = async () => {
      const value = await AsyncStorage.getItem("language");
      setLanguage(value || "English");
      try {
        (async () => {
          await updateGeneralSetting("3", { selectedOption: value });
        })();
      } catch (e) {
        console.log("failed to update generalSettings for language", e);
      }
    };
    fetchLanguage();
  }, []);

  useEffect(() => {
    const fetchGradingScheme = async () => {
      const value = await AsyncStorage.getItem("gradingScheme");
      setGradingScheme((value as GradingSystem) || "A, B, C, D, E, F");
      try {
        (async () => {
          await updateAcademicSetting("1", { selectedOption: value });
        })();
      } catch (e) {
        console.log("failed to update academicSettings for grading scheme", e);
      }
    };
    fetchGradingScheme();
  }, []);

  const changeGradingScheme = (value: string) => {
    setGradingScheme(value as GradingSystem);
    AsyncStorage.setItem("gradingScheme", value);
  };

  useEffect(() => {
    const fetchGradeRounding = async () => {
      const value = await AsyncStorage.getItem("gradeRoundingRules");
      setGradeRounding(value || "Keep two decimals");
      try {
        (async () => {
          await updateAcademicSetting("3", { selectedOption: value });
        })();
      } catch (e) {
        console.log("failed to update academicSettings for grade rounding", e);
      }
    };
    fetchGradeRounding();
  }, []);

  const changeGradeRounding = (value: string) => {
    setGradeRounding(value);
    AsyncStorage.setItem("gradeRoundingRules", value);
  };

  const changeLanguage = (value: string) => {
    setLanguage(value);
    AsyncStorage.setItem("language", value);
  };

  useEffect(() => {
    const fetchRequireBioMetric = async () => {
      try {
        const value = await AsyncStorage.getItem("requireBioMetric");
        setRequireBioMetric(value === "true");
        await updateGeneralSetting("4", { toggled: value === "true" });
      } catch (error) {
        console.log("failed to load/sync requireBioMetric", error);
      }
    };
    fetchRequireBioMetric();
  }, []);

  const changeRequireBioMetric = (value: boolean) => {
    setRequireBioMetric(value);
    AsyncStorage.setItem("requireBioMetric", JSON.stringify(value));
  };

  // Update general settings when theme changes
  useEffect(() => {
    setGeneralSettings((prev) =>
      prev.map((setting) =>
        setting.id === "1" ? { ...setting, toggled: theme === "dark" } : setting
      )
    );
  }, [theme]);

  const defaultUtilities: UtilitiesType[] = [
    {
      id: "1",
      title: "Export Data",
      subtitle: "Download a backup of your academic data",
      color: colors.white,
      onTap() {
        // TODO: Implement export data functionality
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
        // TODO: Implement export data functionality
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
        // TODO: Implement export data functionality
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
      title: "Dark Theme",
      subtitle: "Toggle between Light and Dark mode",
      type: "toggle",
      toggled: theme === "dark",
      iconName: "MoonIcon",
      onToggle(value) {
        console.log("toggle theme tapped (dataContext)", value);
        setTheme(value ? "dark" : "light");
        updateGeneralSetting("1", { toggled: value }).catch((e) => {
          console.log("failed to update generalSettings for dark theme", e);
        });
      },
    },
    {
      id: "2",
      title: "Notifications",
      subtitle: "Receive notifications about important academic updates",
      type: "toggle",
      toggled: sendNotifications,
      iconName: "BellIcon",
      onToggle(value) {
        console.log("toggle notifications changed to (dataContext)", value);
        changeSendNotifications(value);
        try {
          (async () => {
            await updateGeneralSetting("2", { toggled: value });
          })();
        } catch (e) {
          console.log("failed to update generalSettings for notifications", e);
        }
      },
    },
    {
      id: "3",
      title: "Language",
      subtitle: "Select your preferred language",
      type: "dropdown",
      options: ["English", "Spanish", "French", "German"],
      selectedOption: language,
      iconName: "GlobeHemisphereWestIcon",
      onSelectOption(option) {
        console.log("language changed to (dataContext)", option);
        // setLanguage(option);
        changeLanguage(option);
        try {
          (async () => {
            await updateGeneralSetting("3", { selectedOption: option });
          })();
        } catch (e) {
          console.log("failed to update generalSettings for language", e);
        }
      },
    },
    {
      id: "4",
      title: "Screen Lock",
      subtitle: "Require PIN or biometric authentication to open the app",
      type: "toggle",
      toggled: requireBioMetric,
      iconName: "SunIcon",
      onToggle(value) {
        console.log("toggle requireBioMetric changed to (dataContext)", value);
        changeRequireBioMetric(value);
        try {
          (async () => {
            await updateGeneralSetting("4", { toggled: value });
          })();
        } catch (e) {
          console.log(
            "failed to update generalSettings for requireBioMetric",
            e
          );
        }
      },
    },
  ];

  const academicsSettings: SettingsType[] = [
    {
      id: "1",
      title: "Grading Scheme",
      subtitle: "Choose how grades are represented",
      type: "dropdown",
      iconName: "GraduationCapIcon",
      options: [
        "A, B, C, D, E, F",
        "A, B, C, D, F",
        "A+, A, A−, B+, B, B−, C+, C, C−, D+, D, D−, F",
        "Percentage",
      ],
      selectedOption: "A, B, C, D, E, F",
      onSelectOption(option) {
        console.log("Selected grading scheme:", option);
        changeGradingScheme(option);

        try {
          (async () => {
            await updateAcademicSetting("1", { selectedOption: option });
          })();
        } catch (error) {
          console.log(
            "Failed to update academicSettings for grading scheme",
            error
          );
        }
      },
    },
    // {
    //   id: "2",
    //   title: "Pass/Fail Option",
    //   subtitle: "Allow pass/fail grading for eligible courses",
    //   type: "toggle",
    //   iconName: "CheckCircleIcon",
    //   toggled: false,
    // },
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
      onSelectOption(option) {
        console.log("Selected grade rounding:", option);
        changeGradeRounding(option);

        try {
          (async () => {
            await updateAcademicSetting("3", { selectedOption: option });
          })();
        } catch (error) {
          console.log(
            "Failed to update academicSettings for grade rounding",
            error
          );
        }
      },
    },
  ];

  const [generalSettings, setGeneralSettings] = useState<SettingsType[]>(
    defaultGeneralSettings
  );
  const [academicSettings, setAcademicSettings] =
    useState<SettingsType[]>(academicsSettings);
  const [utilities, setUtilities] = useState<UtilitiesType[]>(defaultUtilities);

  // const seedInitialData = async () => {
  //   // Check if data already exists
  //   const [semesters, courses, academicSettings, utilities, generalSettings] =
  //     await Promise.all([
  //       getData<SemesterType>("semesters"),
  //       getData<CourseType>("courses"),
  //       getData<SettingsType>("academicSettings"),
  //       getData<UtilitiesType>("utilities"),
  //       getData<SettingsType>("generalSettings"),
  //     ]);

  //   // Only seed if all are empty
  //   if (
  //     semesters.length === 0 &&
  //     courses.length === 0 &&
  //     academicSettings.length === 0 &&
  //     utilities.length === 0 &&
  //     generalSettings.length === 0
  //   ) {
  //     await setItem("semesters", []);
  //     await setItem("courses", []);
  //     await setItem("academicSettings", academicsSettings);
  //     await setItem("utilities", defaultUtilities);
  //     await setItem("generalSettings", defaultGeneralSettings);
  //   }
  // };

  useEffect(() => {
    AsyncStorage.getItem("user").then((stored) => {
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser({
          name: "Tap to set name",
          image: null,
          createdAt: new Date(),
          onboarded: false,
          uid: "user123",
        });
      }
    });
  }, []);

  useEffect(() => {
    if (user) {
      AsyncStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);
  useEffect(() => {
    getSemesters(); // Loads semesters from Realm and sets state
    // logAllStorage();

    const init = async () => {
      // await seedInitialData();
      await loadData();
    };
    init();

    const loadData = async () => {
      setGeneralSettings(defaultGeneralSettings);
      setAcademicSettings(academicsSettings);
      setUtilities(defaultUtilities);
      setInfos(siteInfo);
      // }
    };
  }, []);

  useEffect(() => {
    let realmInstance: Realm;
    let semesters: Realm.Results<any>;

    const setupListener = async () => {
      try {
        realmInstance = await openRealm();
        semesters = realmInstance.objects<SemesterType>("Semester");
        setSemesters([...semesters]);
        semesters.addListener(() => {
          setSemesters([...semesters]);
        });
      } catch (error) {
        console.error("Failed to setup Realm listener: (dataContext)", error);
      }
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
    // await updateSettingInStorage<SettingsType>("generalSettings", id, changes);
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

  // CREATE
  const addSemester = async (semester: SemesterType): Promise<ResponseType> => {
    try {
      const realm = await openRealm();

      const created = realm.write(() => {
        return realm.create("Semester", semester);
      });

      setSemesters([...realm.objects<SemesterType>("Semester")]);

      return { success: true, data: { ...created } };
    } catch (error: any) {
      console.log("error occured (addSemester)", error);
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
    } catch (error: any) {
      console.log("error occured (getSemesterById)", error);
      throw new Error(error.message);
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
        const semester = realm.objectForPrimaryKey(
          "Semester",
          new Realm.BSON.UUID(id)
        ) as any;

        if (semester) {
          if (semester.courses && semester.courses.length > 0) {
            realm.delete(semester.courses);
          }

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
        const uuid = new Realm.BSON.UUID(id);
        const course = realm.objectForPrimaryKey("Course", uuid);
        if (course) {
          realm.delete(course);
        }
      });

      // Refresh semesters so UI reflects changes
      setSemesters([...realm.objects<SemesterType>("Semester")]);

      return { success: true };
    } catch (error: any) {
      console.log("error occured (deleteCourse)", error);
      return { success: false, msg: error.message };
    }
  };

  const contextValue: DataContextType = {
    user,
    setUser,
    semesters,
    courses,
    generalSettings,
    academicSettings,
    utilities,
    infos,
    language,
    gradingScheme,
    gradeRounding,
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
