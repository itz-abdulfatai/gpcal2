import {
  DataContextType,
  SemesterType,
  CourseType,
  SettingsType,
  UtilitiesType,
  AppInfoType,
  UserType,
} from "@/types";
import {
  getData,
  logAllStorage,
  setItem,
  updateArrayEntry,
  addToArray,
  updateSettingInStorage,
} from "@/utils";
import { createContext, FC, useContext, useState, useEffect } from "react";
import {
  GraduationCapIcon,
  CheckCircleIcon,
  ArrowClockwiseIcon,
  ExportIcon,
  TrashIcon,
  ChatCenteredTextIcon,
  HeadphonesIcon,
  InfoIcon,
  SunIcon,
  NotificationIcon,
  GlobeHemisphereWestIcon,
  FingerprintIcon,
} from "phosphor-react-native";
import { colors } from "@/constants/theme";

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
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [user, setUser] = useState<UserType>(null);
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    seedInitialData();
    // logAllStorage();
    const loadData = async () => {
      try {
        const semesters = await getData<SemesterType>("semesters");
        const courses = await getData<CourseType>("courses");
        const academicSettings = await getData<SettingsType>(
          "academicSettings"
        );
        const utilities = await getData<UtilitiesType>("utilities");
        const generalSettings = await getData<SettingsType>("generalSettings");

        setSemesters(semesters);
        setCourses(courses);
        setAcademicSettings(
          academicSettings.length > 0 ? academicSettings : academicsSettings
        );
        setUtilities(utilities.length > 0 ? utilities : defaultUtilities);
        setGeneralSettings(
          generalSettings.length > 0 ? generalSettings : defaultGeneralSettings
        );
        setInfos(siteInfo);
      } catch (error) {
        setSemesters([]);
        setCourses([]);
        setAcademicSettings(academicsSettings);
        setUtilities(defaultUtilities);
        setGeneralSettings(defaultGeneralSettings);
        setInfos(siteInfo);
      }
    };
    loadData();
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

  const addSemester = async (semester: SemesterType) => {
    console.log("add semester called");
    if (!semester.name.trim()) return;

    setSemesters((prev) => [...prev, semester]);
    await addToArray<SemesterType>("semesters", semester);
    logAllStorage();
  };

  const updateSemester = async (id: string, changes: Partial<SemesterType>) => {
    setSemesters((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...changes } : s))
    );
    await updateArrayEntry<SemesterType>("semesters", id, changes);
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
