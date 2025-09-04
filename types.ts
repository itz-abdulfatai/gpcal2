import { Dispatch, SetStateAction, ReactNode } from "react";

import { Icon } from "phosphor-react-native";
import {
  TextInput,
  TextInputProps,
  TextProps,
  TextStyle,
  TouchableOpacityProps,
  ViewStyle,
} from "react-native";

export type SettingsType = {
  id: string;
  title: string;
  subtitle: string;
  type: "toggle" | "dropdown";
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

export type GradeType = "A" | "B" | "C" | "D" | "E" | "F" | null;

export type CourseType = {
  id: string;
  name: string;
  creditUnit: number | null;
  GradePoint: GradeType | null;
  semesterId: string;
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

export type SemesterType = {
  id: string;
  name: string;
  gpa: number | null;
  lastUpdated: Date | null;
  uid: string;
};

export type semestersListType = {
  data: SemesterType[];
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
  updateSetting: (id: string, changes: Partial<SettingsType>) => void;
};

export type UtilitiesGroupProps = {
  title: string;
  utilities: UtilitiesType[];
  infos: AppInfoType[];
};

export type DataContextType = {
  user: UserType;
  semesters: SemesterType[];
  courses: CourseType[];
  generalSettings: SettingsType[];
  academicSettings: SettingsType[];
  updateGeneralSetting: (
    id: string,
    changes: Partial<SettingsType>
  ) => Promise<void>;
  updateAcademicSetting: (
    id: string,
    changes: Partial<SettingsType>
  ) => Promise<void>;
  utilities: UtilitiesType[];
  infos: AppInfoType[];
  language: string;
};


