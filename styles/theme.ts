import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    primary: "#F21B1B",
    secondary: "#051B46",
    tertiary: "#FFC900",
    quaternary: "#FF7903",
    accentOne: "#0D301E",
    accentTwo: "#173D22",
    accentThree: "#ff3232",
    accentFour: "#BC2E25",
    accentFive: "#FFB601",
    black: "#000000",
    white: "#FFFFFF",
    gray: "#A0A0A0",
    lightGray: "#F5F5F7",
    darkerGray: "#86868B",
    input: "#051539",
    background: "#051539",
  },
  fonts: {
    header: "var(--header )",
    body: "var(--body )",
  },
  green: {
    700: "#00BF63",
  },
  red: {
    700: "#FF3131",
  },
});

export default theme;
