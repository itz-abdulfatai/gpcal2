import { ReactNode } from "react";
import { Dispatch, SetStateAction } from "react";

import { Icon } from "phosphor-react-native";
import {
  ImageSourcePropType,
  TextInput,
  TextInputProps,
  TextProps,
  TextStyle,
  TouchableOpacityProps,
  ViewStyle,
} from "react-native";

// import { Timestamp } from "@react-native-firebase/firestore";
export type FabProps = {
  onPress: () => void;
  style?: object;
};

export interface PromptDialogProps {
  visible: boolean;
  question: string;
  setResponse: (val: string) => void;
  onClose: (val?: string) => void; // <-- accept optional value
}
export type FloatingActionButtonAction = {
  title: string;
  icon: React.ReactNode;
  path?: string; // can be route name or identifier for navigation
  onPress?: () => void; // optional custom handler
};

export interface FloatingActionButtonProps {
  title: string;
  actions: FloatingActionButtonAction[];
  isDrawerOpen: boolean;
  // Optionally allow overriding the default handler
  onActionPress?: (action: FloatingActionButtonAction) => void;
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
export type accountOptionType = {
  title: string;
  icon: React.ReactNode;
  bgColor: string;
  routeName?: any;
};

export interface SideBarProps {
  visible: boolean;
  onClose: () => void;
  onCloseComplete?: () => void;
}

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

export type TransactionType = {
  id?: string;
  type: string;
  amount: number;
  category?: string;
  // date: Timestamp | Date;
  description?: string;
  image?: any;
  uid?: string;
  // walletId: string;
  goalId?: string;
};

export type CategoryType = {
  label: string;
  value: string;
  icon: Icon;
  bgColor: string;
};
export type ExpenseCategoriesType = {
  [key: string]: CategoryType;
};

export type TransactionListType = {
  data: TransactionType[];
  title?: string;
  loading?: boolean;
  emptyListMessage?: string;
};
export type BudgetListType = {
  data: BudgetType[];
  title?: string;
  loading?: boolean;
  emptyListMessage?: string;
  activeType?: "weekly" | "monthly" | "yearly";
  categoryTotals?: any;
};
export type GoalsListType = {
  data: GoalType[];
  title?: string;
  loading?: boolean;
  emptyListMessage?: string;
  setActiveGoal?: Function;
};

export type TransactionItemProps = {
  item: TransactionType;
  index: number;
  handleClick: Function;
};
export type BudgetItemProps = {
  item: BudgetType;
  index: number;
  handleClick: Function;
  style?: ViewStyle;
  activeType?: "weekly" | "monthly" | "yearly";
  categoryTotals?: any;
};
export type GoalItemProps = {
  item: GoalType;
  index: number;
  handleClick: Function;
  style?: ViewStyle;
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

export type Semester = {
  id: string;
  name: string;
  semesterId: string;
  gpa: number | null;
  uid: string;
};

export interface TableProps<T> {
  headings: string[];
  data: T[];
  keys: (keyof T)[];
}

export interface InputProps extends TextInputProps {
  icon?: React.ReactNode;
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
export type AiImageUploadProps = {
  file?: any;
  onSelect: (file: any) => void;
  onClear: () => void;
  containerStyle?: ViewStyle;
  imageStyle?: ViewStyle;
  placeholder?: string;
  setTransaction: React.Dispatch<React.SetStateAction<TransactionType>>;
  transaction: TransactionType;
};

export type SubscriptionStatusType =
  | "trial"
  | "active"
  | "canceled"
  | "grace_period"
  | "expired";

export type reminderFrequencyType = "daily" | "weekly" | "monthly";

export type UserType = {
  uid?: string;
  email: string | null;
  name: string | null;
  image: any;
  reminderFrequency?: reminderFrequencyType;
  createdAt?: Date;
  onboarded?: boolean;
  subscriptionStatus?: SubscriptionStatusType;
  trialEndDate?: Date;
  subscriptionEndDate?: Date;
} | null;

export type UserDataType = {
  name: string;
  image?: any;
  reminderFrequency?: reminderFrequencyType;
};

export type AuthContextType = {
  user: UserType;
  // setUser: Function;
  login: (email: string, password: string) => Promise<ResponseType>;
  register: (
    email: string,
    password: string,
    name: string
  ) => Promise<ResponseType>;
  updateUserData: (userId: string) => Promise<void>;
  googleLogin: () => Promise<ResponseType>;
  appleLogin: () => Promise<ResponseType>;
  logout: () => Promise<void>;
};

export type ResponseType = {
  success: boolean;
  data?: any;
  msg?: string;
};

export type WalletType = {
  id?: string;
  name: string;
  amount?: number;
  totalIncome?: number;
  totalExpenses?: number;
  image: any;
  uid?: string;
  created?: Date;
};

export type BudgetType = {
  id?: string;
  name: string;
  uid?: string;
  created?: Date;
  amount?: number;
  weeklyBudget?: number;
  monthlyBudget?: number;
  yearlyBudget?: number;
  totalReached?: number;
  category: string;
};
export type GoalType = {
  id?: string;
  name: string;
  uid?: string;
  amount: number;
  totalReached?: number;
  // created?: Timestamp | Date;
  description?: string;
  image?: any;
  // dueDate?: Timestamp | Date | undefined;
};

export interface SlideData {
  id: string;
  image: ImageSourcePropType;
  title: string;
  subtitle: string;
}

export type GoalDetailProps = {
  goal: GoalType | null;
};

export interface DashboardHeaderProps {
  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  setShowSidebar: (show: boolean) => void;
  showSidebar: boolean;
}

export interface SlideUpSheetAction {
  title: string;
  icon?: React.ReactNode;
  onPress: () => void;
}

export interface SlideUpSheetProps {
  visible: boolean;
  title?: string;
  actions: SlideUpSheetAction[];
  onClose: () => void;
  sheetStyle?: ViewStyle;
  overlayStyle?: ViewStyle;
  closeIcon?: React.ReactNode;
  renderHeader?: React.ReactNode;
}

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
