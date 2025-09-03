import {
  DataContextType,
  SemesterType,
  CourseType,
  SettingsType,
  UtilitiesType,
  AppInfoType,
} from "@/types";
import { getData } from "@/utils";
import { createContext, FC, useContext } from "react";
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
const DataContext = createContext<DataContextType | null>(null);

const academicsSettings: SettingsType[] = [
  {
    id: "1",
    title: "Grading Scheme",
    subtitle: "Choose how grades are represented",
    type: "dropdown",
    Icon: (props) => <GraduationCapIcon {...props} />,
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
    Icon: (props) => <CheckCircleIcon {...props} />,
    toggled: false,
  },
  {
    id: "3",
    title: "Grade Rounding Rules",
    subtitle: "Define how decimal grades are rounded",
    type: "dropdown",
    Icon: (props) => <ArrowClockwiseIcon {...props} />,
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
    Icon: (props) => <ExportIcon {...props} />,
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
    Icon: (props) => <ExportIcon {...props} />,
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
    Icon: (props) => <TrashIcon {...props} />,
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
    Icon: (props) => <SunIcon {...props} />,
  },
  {
    id: "2",
    title: "Notifications",
    subtitle: "Receive notifications about important academic updates",
    type: "toggle",
    toggled: true,
    Icon: (props) => <NotificationIcon {...props} />,
  },
  {
    id: "3",
    title: "Language",
    subtitle: "Select your preferred language",
    type: "dropdown",
    options: ["English", "Spanish", "French", "German"],
    selectedOption: "English",
    Icon: (props) => <GlobeHemisphereWestIcon {...props} />,
  },
  {
    id: "4",
    title: "Screen Lock",
    subtitle: "Require PIN or biometric authentication to open the app",
    type: "toggle",
    toggled: false,
    Icon: (props) => <FingerprintIcon {...props} />,
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

// get semester
// get course
// add semester
// add course
// analyse

// change grading system
// set grading to pass or fail
// change gpa rounding
// change theme
// allow or disable notifications
// change language
// show fingerprint/pin
// change gpa scale

// export data
// import data
// delete data

export const DataContextProvider: FC<{ children: React.ReactNode }> = async ({
  children,
}) => {
  const contextValue: DataContextType = {
    user: null,
    semesters: await getData<SemesterType>("semesters"),
    courses: await getData<CourseType>("semesters"),
    academicSettings: [],
    utilities: [],
    infos: siteInfo,
    generalSettings: [],

    language: "en",
  };

  const academicSettings = await getData<SettingsType>("academicSettings");
  if (academicSettings.length > 0) {
    contextValue.academicSettings = academicSettings;
  } else {
    contextValue.academicSettings = academicsSettings;
  }

  const utilities = await getData<UtilitiesType>("utilities");

  if (utilities.length > 0) {
    contextValue.utilities = utilities;
  } else {
    contextValue.utilities = defaultUtilities;
  }

  const generalSettings = await getData<SettingsType>("generalSettings");

  if (generalSettings.length > 0) {
    contextValue.generalSettings = generalSettings;
  } else {
    contextValue.generalSettings = defaultGeneralSettings;
  }
  return (
    <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
  );
};

export default DataContextProvider;

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataContextProvider");
  }
  return context;
};
