import { Text, TextInput, TextStyle } from "react-native";

// Map fontWeight → Manrope family
const fontMap: Record<string, string> = {
  "100": "ManropeThin",
  "200": "ManropeLight", // fallback
  "300": "ManropeLight",
  "400": "ManropeRegular",
  "500": "ManropeMedium",
  "600": "ManropeSemiBold",
  "700": "ManropeBold",
  "800": "ManropeBold", // fallback
  "900": "ManropeBold", // fallback
};

function resolveFontFamily(style: TextStyle = {}): string {
  const weight = style.fontWeight ?? "400";
  return fontMap[weight] ?? "ManropeRegular";
}

export function applyCustomFont(): void {
  // Cast to `any` so TS stops complaining
  const TextAny = Text as any;
  const TextInputAny = TextInput as any;

  // Override <Text>
  const oldTextRender = TextAny.render;
  TextAny.render = function (...args: any[]) {
    const origin = oldTextRender.apply(this, args);
    const style: TextStyle = origin.props.style ?? {};
    return {
      ...origin,
      props: {
        ...origin.props,
        style: [{ fontFamily: resolveFontFamily(style) }, style],
      },
    };
  };

  // Override <TextInput>
  const oldInputRender = TextInputAny.render;
  TextInputAny.render = function (...args: any[]) {
    const origin = oldInputRender.apply(this, args);
    const style: TextStyle = origin.props.style ?? {};
    return {
      ...origin,
      props: {
        ...origin.props,
        style: [{ fontFamily: resolveFontFamily(style) }, style],
      },
    };
  };
}
