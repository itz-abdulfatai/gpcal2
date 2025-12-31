import { ReactNode } from "react";
import type { BSON } from "realm";

import { Icon } from "phosphor-react-native";
import {
  GestureResponderEvent,
  TextInput,
  TextInputProps,
  TextProps,
  TextStyle,
  TouchableOpacityProps,
  ViewStyle,
} from "react-native";

export type TDType = "toggle" | "dropdown";
export type SettingsType = {
  id: string;
  title: string;
  subtitle: string;
  type: TDType;
  toggled?: boolean;
  options?: string[];
  selectedOption?: string | null;
  onToggle?: (value: boolean) => void;
  onSelectOption?: (option: string) => void;
  iconName: string;
};

export type UtilitiesType = {
  id: string;
  title: string;
  subtitle: string;
  onTap: () => void;
  iconName: string;
  color: string;
  buttonText: string;
  textColor: string;
};

export type AppInfoType = {
  id: string;
  title: string;
  Icon: Icon;
  route: string;
};

export interface PromptDialogProps {
  visible: boolean;
  question: string;
  setResponse: (val: string) => void;
  onClose: (val?: string) => void; // <-- accept optional value
  initialValue?: string;
}

export type ScreenWrapperProps = {
  style?: ViewStyle;
  children: React.ReactNode;
};
export type ModalWrapperProps = {
  style?: ViewStyle;
  children: React.ReactNode;
  bg?: string;
};
// export type accountOptionType = {
//   title: string;
//   icon: Icon;
//   bgColor: string;
//   routeName?: any;
// };

export type TypoProps = {
  size?: number;
  color?: string;
  fontWeight?: TextStyle["fontWeight"];
  children: any | null;
  style?: TextStyle | TextStyle[];
  textProps?: TextProps;
};

export type IconComponent = React.ComponentType<{
  height?: number;
  width?: number;
  strokeWidth?: number;
  color?: string;
  fill?: string;
}>;

export type IconProps = {
  name: string;
  color?: string;
  size?: number;
  strokeWidth?: number;
  fill?: string;
};

export type HeaderProps = {
  title?: string;
  style?: ViewStyle;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export type BackButtonProps = {
  style?: ViewStyle;
  iconSize?: number;
};
export type DeleteButtonProps = {
  style?: ViewStyle;
  iconSize?: number;
  onPress: (event: GestureResponderEvent) => void;
};

export type SaveButtonProps = {
  style?: ViewStyle;
  onPress: () => void;
  iconSize?: number;
};

export type GradeType = string | number | null;
export type GradingSystem =
  | "A, B, C, D, E, F"
  | "A, B, C, D, F"
  | "A+, A, A−, B+, B, B−, C+, C, C−, D+, D, D−, F"
  | "Percentage";

export type CourseType = {
  id: BSON.UUID;
  name: string;
  creditUnit: number | null;
  gradePoint: GradeType | null;
  semesterId: BSON.UUID;
  uid: string;
};

// export type Semester = {
//   id: string;
//   name: string;
//   semesterId: string;
//   gpa: number | null;
//   uid: string;
// };

export interface TableProps<T> {
  headings: string[];
  data: T[];
  keys: (keyof T)[];
  handleDelete?: (id: string) => Promise<void>;
}

export interface InputProps extends TextInputProps {
  icon?: Icon;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  inputRef?: React.RefObject<TextInput>;
  //   label?: string;
  //   error?: string;
}

export interface CustomButtonProps extends TouchableOpacityProps {
  style?: ViewStyle | ViewStyle[];
  onPress?: () => void;
  loading?: boolean;
  children: React.ReactNode;
}

export type ImageUploadProps = {
  file?: any;
  onSelect: (file: any) => void;
  onClear: () => void;
  containerStyle?: ViewStyle;
  imageStyle?: ViewStyle;
  placeholder?: string;
};

export type UserType = {
  uid?: string;
  // email: string | null;
  name: string | null;
  image: any;
  // reminderFrequency?: reminderFrequencyType;
  createdAt?: Date;
  onboarded?: boolean;
  // subscriptionStatus?: SubscriptionStatusType;
  // trialEndDate?: Date;
  // subscriptionEndDate?: Date;
} | null;

export type ResponseType<T = any> = {
  success: boolean;
  data?: T;
  msg?: string;
};

export type AiInsightType = {
  reply: string;
  suggested_improvement?: string;
};

export interface SemesterType {
  id: BSON.UUID;
  name: string;
  gpa: number | null;
  lastUpdated: Date | null;
  uid: string;
  courses: CourseType[];
  linkedSemesters: BSON.UUID[];
  gradingSystem: GradingSystem;
  aiInsight?: AiInsightType | null;
}

export type semestersListType = {
  // data: SemesterType[];
  title?: string;
  loading?: boolean;
  emptyListMessage?: string;
};

export type semesterCardProps = {
  semester: SemesterType;
};

export type SettingsGroupProps = {
  title: string;
  settings: SettingsType[];
  // updateSetting: (id: string, changes: Partial<SettingsType>) => void;
};

export type UtilitiesGroupProps = {
  title: string;
  utilities: UtilitiesType[];
  infos: AppInfoType[];
};

export type DataContextType = {
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
  semesters: SemesterType[];
  // courses: CourseType[];
  generalSettings: SettingsType[];
  academicSettings: SettingsType[];
  // updateGeneralSetting: (
  //   id: string,
  //   changes: Partial<SettingsType>
  // ) => Promise<void>;
  // updateAcademicSetting: (
  //   id: string,
  //   changes: Partial<SettingsType>
  // ) => Promise<void>;
  utilities: UtilitiesType[];
  infos: AppInfoType[];
  language: string;
  gradingScheme: GradingSystem;
  gradeRounding: string;
  // addSemester: (semester: SemesterType) => Promise<void>;
  // updateSemester: (id: string, changes: Partial<SemesterType>) => Promise<void>;

  addSemester: (semester: SemesterType) => Promise<ResponseType>;
  updateSemester: (
    id: string,
    changes: Partial<SemesterType>
  ) => Promise<ResponseType>;
  deleteSemester: (id: string) => Promise<ResponseType>;
  addCourse: (
    course: CourseType,
    semesterId: BSON.UUID
  ) => Promise<ResponseType>;
  updateCourse: (id: string, changes: Partial<CourseType>) => Promise<void>;
  deleteCourse: (id: string) => Promise<ResponseType>;
  getSemesters: () => Promise<ResponseType>;
  getCourses: (semesterId: string) => Promise<CourseType[]>;
  getSemesterById: (
    id: Realm.BSON.UUID | string
  ) => Promise<SemesterType | null>;
  linkSemester: (
    semesterId: string,
    linkedSemesterId: string
  ) => Promise<ResponseType>;
  unlinkSemester: (
    semesterId: string,
    linkedSemesterId: string
  ) => Promise<ResponseType>;

  getAiInsight: (
    payload: BackendPayloadType
  ) => Promise<ResponseType<AiInsightType>>;
};

export interface ThemeColors {
  [key: string]: string;
}

export type ThemeType = "light" | "dark";

export interface ThemeContextType {
  colors: ThemeColors;
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

export type BackendPayloadType = {
  input: string;
  semester: BackendSemester;
};

export interface BackendSemester extends SemesterType {
  cgpa: number;
} 