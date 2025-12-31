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
  BackendPayloadType,
} from "@/types";
import { alert, updateSettingInStorage } from "@/utils";
import {
  createContext,
  FC,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  ChatCenteredTextIcon,
  HeadphonesIcon,
  InfoIcon,
} from "phosphor-react-native";
import { useTheme } from "@/contexts/ThemeContext";

import Realm from "realm";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BIOMETRIC_KEY, toggleBiometric } from "@/utils/biometricSettings";
import { exportUserData } from "@/utils/exportFunction";
import { importUserData } from "@/utils/importFunction";
import { openRealm } from "@/models/db";
import { eraseAllUserData } from "@/utils/eraseFunction";
import { Alert, DevSettings } from "react-native";

let realm: Realm | null = null;
const siteInfo: AppInfoType[] = [
  {
    id: "1",
    title: "Send Feedback/ Feature Requests",
    Icon: (props) => <ChatCenteredTextIcon {...props} />,
    route: "https://abdul-portfolio-lw7s.onrender.com/contact", // can accept an external link
  },
  {
    id: "2",
    title: "Get Support",
    Icon: (props) => <HeadphonesIcon {...props} />,
    route: "https://abdul-portfolio-lw7s.onrender.com/contact",
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
  const [user, setUser] = useState<UserType>({
    name: "kamaru Doe",
    image: null,
    createdAt: new Date(),
    onboarded: false,
    uid: "user123",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [
          sendNotificationsValue,
          languageValue,
          gradingSchemeValue,
          gradeRoundingValue,
          bioMetricValue,
        ] = await Promise.all([
          AsyncStorage.getItem("sendNotifications"),
          AsyncStorage.getItem("language"),
          AsyncStorage.getItem("gradingScheme"),
          AsyncStorage.getItem("gradeRoundingRules"),
          AsyncStorage.getItem(BIOMETRIC_KEY),
        ]);

        console.log("from async", await AsyncStorage.getItem("gradingScheme"));
        console.log("from promise", gradingSchemeValue);

        setSendNotifications(sendNotificationsValue === "true");
        setLanguage(languageValue || "English");
        setGradingScheme(
          (gradingSchemeValue as GradingSystem) || "A, B, C, D, E, F"
        );
        setGradeRounding(gradeRoundingValue || "Keep two decimals");
        setRequireBioMetric(bioMetricValue === "true");

        // Update backend settings in parallel
        // updateGeneralSetting("2", {
        //   toggled: sendNotificationsValue === "true",
        // });
        // updateGeneralSetting("3", { selectedOption: languageValue });
        // updateAcademicSetting("1", { selectedOption: gradingSchemeValue });
        // updateAcademicSetting("3", { selectedOption: gradeRoundingValue });
        // updateGeneralSetting("4", { toggled: bioMetricValue === "true" });
      } catch (error) {
        console.log("Failed to load/sync settings", error);
      }
    };

    fetchSettings();
  }, []);

  const changeSendNotifications = (value: boolean) => {
    setSendNotifications(value);
    AsyncStorage.setItem("sendNotifications", JSON.stringify(value));
  };

  const changeGradingScheme = useCallback((value: GradingSystem) => {
    setGradingScheme(value);
    AsyncStorage.setItem("gradingScheme", value);
  }, []);

  const changeGradeRounding = useCallback((value: string) => {
    setGradeRounding(value);
    AsyncStorage.setItem("gradeRoundingRules", value);
  }, []);

  const changeLanguage = useCallback((value: string) => {
    setLanguage(value);
    AsyncStorage.setItem("language", value);
  }, []);

  const changeRequireBioMetric = useCallback((value: boolean) => {
    setRequireBioMetric(value);
    AsyncStorage.setItem(BIOMETRIC_KEY, JSON.stringify(value));
  }, []);

  const utilities = useMemo<UtilitiesType[]>(
    () => [
      {
        id: "1",
        title: "Export Data",
        subtitle: "Download a backup of your academic data",
        color: "#ffffff",
        async onTap() {
          const { success, data, msg } = await exportUserData();

          if (!success) return alert(msg!);

          alert("Data exported successfully");
        },
        iconName: "ExportIcon",
        buttonText: "Export",
        textColor: "#000000",
      },
      {
        id: "2",
        title: "Import Data",
        subtitle:
          "Import a previously exported data file (this will erase your existing data)",
        color: "#ffffff",
        async onTap() {
          const { success, data, msg } = await importUserData();
          if (!success) return alert(msg!);

          alert("Data imported Successfully");

          try {
            // Expo reload (works in dev + prod)
            // await Updates.reloadAsync();

            DevSettings.reload(); // TODO: delete this when Updates is available (after next prebuild)
          } catch {
            // Fallback for bare RN or if Updates unavailable
            DevSettings.reload();
          }
        },
        iconName: "ImportIcon",
        buttonText: "Import",
        textColor: "#000000",
      },
      {
        id: "3",
        title: "Reset All Data",
        subtitle: "Permanently delete all your application data",
        color: colors.rose,
        async onTap() {
          Alert.alert(
            "Reset All Data",
            "Are you sure you want to reset all your application data?",
            [
              {
                text: "No",
                style: "cancel",
              },
              {
                text: "Yes",
                style: "destructive",
                onPress: async () => {
                  const { success, data, msg } = await eraseAllUserData();

                  if (!success) return alert(msg!);

                  alert("All data deleted successfully");

                  try {
                    // Expo reload (works in dev + prod)
                    // await Updates.reloadAsync();

                    DevSettings.reload(); // TODO: delete this when Updates is available (after next prebuild)
                  } catch {
                    // Fallback for bare RN or if Updates unavailable
                    DevSettings.reload();
                  }
                },
              },
            ]
          );
        },
        iconName: "TrashIcon",
        buttonText: "Reset",
        textColor: colors.white,
      },
    ],
    [colors]
  );

  const academicSettings: SettingsType[] = useMemo(
    () => [
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
        selectedOption: gradingScheme,
        onSelectOption(option) {
          console.log("Selected grading scheme:", option);
          changeGradingScheme(option as GradingSystem);

          try {
            (async () => {
              setGradingScheme(option as GradingSystem);
              // await updateAcademicSetting("1", { selectedOption: option });
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
      // {
      //   id: "3",
      //   title: "Grade Rounding Rules",
      //   subtitle: "Define how decimal grades are rounded",
      //   type: "dropdown",
      //   iconName: "ArrowClockwiseIcon",
      //   options: [
      //     "Keep two decimals",
      //     "Round to nearest whole number",
      //     "Always round up ",
      //     "Always round down ",
      //   ],
      //   selectedOption: "Keep two decimals",
      //   onSelectOption(option) {
      //     console.log("Selected grade rounding:", option);
      //     changeGradeRounding(option);

      //     try {
      //       (async () => {
      //         await updateAcademicSetting("3", { selectedOption: option });
      //       })();
      //     } catch (error) {
      //       console.log(
      //         "Failed to update academicSettings for grade rounding",
      //         error
      //       );
      //     }
      //   },
      // },
    ],
    [gradingScheme]
  );

  const generalSettings: SettingsType[] = useMemo(
    () => [
      {
        id: "1",
        title: "Dark Theme",
        subtitle: "Toggle between Light and Dark mode",
        type: "toggle",
        toggled: theme === "dark",
        iconName: "MoonIcon",
        onToggle(value: any) {
          console.log("toggle theme tapped (dataContext)", value);
          setTheme(value ? "dark" : "light");
          // updateGeneralSetting("1", { toggled: value }).catch((e) => {
          //   console.log("failed to update generalSettings for dark theme", e);
          // });
        },
      },
      {
        id: "2",
        title: "Notifications",
        subtitle: "Receive notifications about important academic updates",
        type: "toggle",
        toggled: sendNotifications,
        iconName: "BellIcon",
        onToggle(value: any) {
          console.log("toggle notifications changed to (dataContext)", value);
          changeSendNotifications(value);
          try {
            (async () => {
              // await updateGeneralSetting("2", { toggled: value });
              setSendNotifications(value);
            })();
          } catch (e) {
            console.log(
              "failed to update generalSettings for notifications",
              e
            );
          }
        },
      },
      // {
      //   id: "3",
      //   title: "Language",
      //   subtitle: "Select your preferred language",
      //   type: "dropdown",
      //   options: ["English", "Spanish", "French", "German"],
      //   selectedOption: language,
      //   iconName: "GlobeHemisphereWestIcon",
      //   onSelectOption(option) {
      //     console.log("language changed to (dataContext)", option);
      //     // setLanguage(option);
      //     changeLanguage(option);
      //     try {
      //       (async () => {
      //         await updateGeneralSetting("3", { selectedOption: option });
      //       })();
      //     } catch (e) {
      //       console.log("failed to update generalSettings for language", e);
      //     }
      //   },
      // },
      {
        id: "4",
        title: "Screen Lock",
        subtitle: "Require biometric authentication to open the app",
        type: "toggle",
        toggled: requireBioMetric,
        iconName: "FingerprintSimpleIcon",
        onToggle(value: any) {
          console.log(
            "toggle requireBioMetric changed to (dataContext)",
            value
          );
          changeRequireBioMetric(value);
          toggleBiometric(value);
          try {
            (async () => {
              // await updateGeneralSetting("4", { toggled: value });
              setRequireBioMetric(value);
            })();
          } catch (e) {
            console.log(
              "failed to update generalSettings for requireBioMetric",
              e
            );
          }
        },
      },
    ],
    [theme, sendNotifications, requireBioMetric]
  );

  useEffect(() => {
    AsyncStorage.getItem("user").then((stored) => {
      if (stored) {
        console.log("User loaded from AsyncStorage: (dataContext)", stored);
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
  let firstLoad = true;
  useEffect(() => {
    if (user && !firstLoad) {
      AsyncStorage.setItem("user", JSON.stringify(user));
      firstLoad = false;
    }
  }, [user]);

  useEffect(() => {
    const init = async () => {
      // await seedInitialData();
      await loadData();
    };
    init();

    const loadData = async () => {
      setInfos(siteInfo);
    };
  }, []);

  useEffect(() => {
    let realmInstance: Realm;
    let semestersResults: Realm.Results<any>;
    let listener: Realm.CollectionChangeCallback<SemesterType>;

    const setupListener = async () => {
      try {
        realmInstance = await openRealm();
        semestersResults = realmInstance.objects<SemesterType>("Semester");

        // Define the listener
        listener = (collection, changes) => {
          // Only update state if there are actual insertions, deletions, or modifications
          if (
            changes.insertions.length > 0 ||
            changes.deletions.length > 0 ||
            changes.newModifications.length > 0
          ) {
            // specific overhead: converting Realm results to Array triggers React render
            setSemesters([...collection]);
          }
        };

        // Initial load
        setSemesters([...semestersResults]);

        // Attach listener
        semestersResults.addListener(listener);
      } catch (error) {
        console.error("Failed to setup Realm listener:", error);
      }
    };

    setupListener();

    return () => {
      if (semestersResults && listener) {
        semestersResults.removeListener(listener);
      }
      // Do not close realm here if other parts of the app share the instance
    };
  }, []);

  // CREATE
  const addSemester = useCallback(
    async (semester: SemesterType): Promise<ResponseType> => {
      try {
        const realm = await openRealm();

        const created = realm.write(() => {
          return realm.create("Semester", semester);
        });

        // setSemesters([...realm.objects<SemesterType>("Semester")]);

        return { success: true, data: { ...created } };
      } catch (error: any) {
        console.log("error occured (addSemester)", error);
        return { success: false, msg: error.message };
      }
    },
    []
  );

  const addCourse = useCallback(
    async (
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
        // setSemesters([...realm.objects<SemesterType>("Semester")]);
        return { success: true };
      } catch (error: any) {
        console.log("error occured (addCourse)", error);
        return { success: false, msg: error.message };
      }
    },
    []
  );
  // READ
  const getSemesters = useCallback(async (): Promise<ResponseType> => {
    try {
      const realm = await openRealm();
      const semesters = realm.objects<SemesterType>("Semester");
      setSemesters([...semesters]);

      return { success: true, data: semesters };
    } catch (error: any) {
      console.log("error occured (getSemesters)", error);
      return { success: false, msg: error.message };
    }
  }, []);

  const getSemesterById = useCallback(
    async (id: Realm.BSON.UUID | string): Promise<SemesterType | null> => {
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
    },
    []
  );

  const getCourses = useCallback(async (semesterId: string) => {
    const realm = await openRealm();
    const semester = realm.objectForPrimaryKey("Semester", semesterId) as any;
    return semester ? (Array.from(semester.courses) as CourseType[]) : [];
  }, []);

  const linkSemester = useCallback(
    async (
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
            semester.linkedSemesters.push(
              new Realm.BSON.UUID(linkedSemesterId)
            );
          }

          // Add semesterId to linkedSemester.linkedSemesters
          if (
            !linkedSemester.linkedSemesters.some((id) =>
              id.equals(new Realm.BSON.UUID(semesterId))
            )
          ) {
            linkedSemester.linkedSemesters.push(
              new Realm.BSON.UUID(semesterId)
            );
          }
        });

        // setSemesters([...realm.objects<SemesterType>("Semester")]);
        return { success: true };
      } catch (error: any) {
        console.log("error occured (linkSemester)", error);
        return { success: false, msg: error.message };
      }
    },
    []
  );

  const unlinkSemester = useCallback(
    async (
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
          linkedSemester.linkedSemesters =
            linkedSemester.linkedSemesters.filter(
              (id) => !id.equals(new Realm.BSON.UUID(semesterId))
            ) as any;
        });

        // setSemesters([...realm.objects<SemesterType>("Semester")]);
        return { success: true };
      } catch (error: any) {
        console.log("error occured (unlinkSemester)", error);
        return { success: false, msg: error.message };
      }
    },
    []
  );

  // UPDATE
  const updateSemester = useCallback(
    async (
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
        // setSemesters([...realm.objects<SemesterType>("Semester")]);
        return { success: true };
      } catch (error: any) {
        console.log("error occured (updateSemester)", error);
        return { success: false, msg: error.message };
      }
    },
    []
  );

  const updateCourse = useCallback(
    async (id: string, changes: Partial<CourseType>) => {
      const realm = await openRealm();
      realm.write(() => {
        const course = realm.objectForPrimaryKey("Course", id);
        if (course) {
          Object.assign(course, changes);
        }
      });
      // setSemesters([...realm.objects<SemesterType>("Semester")]);
    },
    []
  );

  // DELETE
  const deleteSemester = useCallback(
    async (id: string): Promise<ResponseType> => {
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

        // setSemesters([...realm.objects<SemesterType>("Semester")]);
        return { success: true };
      } catch (error: any) {
        console.log("error occured (deleteSemester)", error);
        return { success: false, msg: error.message };
      }
    },
    []
  );

  const deleteCourse = useCallback(
    async (id: string): Promise<ResponseType> => {
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
        // setSemesters([...realm.objects<SemesterType>("Semester")]);

        return { success: true };
      } catch (error: any) {
        console.log("error occured (deleteCourse)", error);
        return { success: false, msg: error.message };
      }
    },
    []
  );

  const getAiInsight = useCallback(
    async (payload: BackendPayloadType): Promise<ResponseType> => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 40000); // 30 second timeout
        const res = await fetch(
          "https://pgftxzgnqsmqoqzmkwrc.supabase.co/functions/v1/gpcal-ai",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
          }
        );
        clearTimeout(timeoutId);
        console.log("api response ", res);

        if (!res.ok) return { success: false, msg: "an Error occured." };

        const data = await res.json();

        if (!data) return { success: false, msg: "an Error occured." };
        console.log("data (datacontext): ", data);
        if (data.msg) return { success: false, msg: data.msg };

        return { success: true, data };
      } catch (error: any) {
        console.log("error occured (getAiInsight) ", error);
        return { success: false, msg: error.message };
      }
    },
    []
  );

  const userValue = useMemo(() => ({ user, setUser }), [user]);
  const settingsValue = useMemo(
    () => ({
      generalSettings,
      academicSettings,
      language,
      gradingScheme,
      gradeRounding,
    }),
    [generalSettings, academicSettings, language, gradingScheme, gradeRounding]
  );
  const dataValue = useMemo(() => ({ semesters, infos }), [semesters, infos]);
  const utilsValue = useMemo(() => ({ utilities }), [utilities]);
  const actionsValue = useMemo(
    () => ({
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
      getAiInsight,
    }),
    [
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
      getAiInsight,
    ]
  );

  const contextValue: DataContextType = useMemo(
    () => ({
      ...userValue,
      ...settingsValue,
      ...dataValue,
      ...utilsValue,
      ...actionsValue,
    }),
    [userValue, settingsValue, dataValue, utilsValue, actionsValue]
  );

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
