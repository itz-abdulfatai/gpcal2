import React from "react";
import {
  SunIcon,
  NotificationIcon,
  GlobeHemisphereWestIcon,
  FingerprintIcon,
  GraduationCapIcon,
  CheckCircleIcon,
  ArrowClockwiseIcon,
  ExportIcon,
  TrashIcon,
  ChatCenteredTextIcon,
  HeadphonesIcon,
  InfoIcon,
  MoonIcon,
  BellIcon,
  FingerprintSimpleIcon,
} from "phosphor-react-native";

type SettingsIconProps = {
  iconName: string;
  color?: string;
  weight?: "bold" | "duotone" | "fill" | "light" | "regular" | "thin";
  size?: number;
};

const SettingsIcon: React.FC<SettingsIconProps> = ({
  iconName,
  color = "#000",
  weight = "regular",
  size = 24,
}) => {
  switch (iconName) {
    case "SunIcon":
      return <SunIcon color={color} weight={weight} size={size} />;
    case "NotificationIcon":
      return <NotificationIcon color={color} weight={weight} size={size} />;
    case "GlobeHemisphereWestIcon":
      return (
        <GlobeHemisphereWestIcon color={color} weight={weight} size={size} />
      );
    case "FingerprintIcon":
      return <FingerprintIcon color={color} weight={weight} size={size} />;
    case "GraduationCapIcon":
      return <GraduationCapIcon color={color} weight={weight} size={size} />;
    case "CheckCircleIcon":
      return <CheckCircleIcon color={color} weight={weight} size={size} />;
    case "ArrowClockwiseIcon":
      return <ArrowClockwiseIcon color={color} weight={weight} size={size} />;
    case "ExportIcon":
      return <ExportIcon color={color} weight={weight} size={size} />;
    case "ImportIcon":
      return (
        <ExportIcon
          color={color}
          weight={weight}
          size={size}
          style={{ transform: [{ rotate: "180deg" }] }}
        />
      );
    case "TrashIcon":
      return <TrashIcon color={color} weight={weight} size={size} />;
    case "ChatCenteredTextIcon":
      return <ChatCenteredTextIcon color={color} weight={weight} size={size} />;
    case "HeadphonesIcon":
      return <HeadphonesIcon color={color} weight={weight} size={size} />;
    case "InfoIcon":
      return <InfoIcon color={color} weight={weight} size={size} />;
    case "MoonIcon":
      return <MoonIcon color={color} weight={weight} size={size} />;
    case "BellIcon":
      return <BellIcon color={color} weight={weight} size={size} />;
    case "FingerprintSimpleIcon":
      return (
        <FingerprintSimpleIcon color={color} weight={weight} size={size} />
      );
    default:
      return null;
  }
};

export default SettingsIcon;
