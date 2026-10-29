import { extendTheme, ThemeConfig } from "@chakra-ui/react";
import { mode, StyleFunctionProps } from "@chakra-ui/theme-tools";
import { KMUTT_CI } from "@/constants/colors";

const breakpoints = {
  sm: "23.5em",
  md: "60em",
  lg: "90em",
  xl: "120em",
};

const config: ThemeConfig = {
  useSystemColorMode: false,
  initialColorMode: "light",
};

const theme = extendTheme({
  config,

  fontSizes: {
    xs: "1rem",        // ~16px
    sm: "1.35rem",     // ~20px
    md: "1.5rem",      // ~24px
    lg: "1.875rem",    // ~30px
    xl: "2.25rem",     // ~36px
    "2xl": "2.75rem",  // ~44px
    "3xl": "3rem",  // ~52px
    "4xl": "4rem",     // ~64px
  },

  letterSpacings: {
    tighter: "-0.02em",
    tight: "-0.01em",
    normal: "0",
    wide: "0.03em",
    wider: "0.05em",
    widest: "0.1em",
  },
   colors: {
    accent_purple: {
      50: "#FAEEFF",
      100: "#F1C9FF",
      200: "#E7A4FF",
      300: "#DC7EFE",
      400: "#C654EF",
      500: "#A73DCD",
      600: "#892AAB",
      700: "#6C1B89",
      800: "#F1C9FF",
      900: "#340645",
    },
    accent_blue: {
      50: "#EEF2FF",
      100: "#C7D5FF",
      200: "#A0B8FF",
      300: "#799AFF",
      400: "#4F78F4",
      500: "#3A60D2",
      600: "#294AB0",
      700: "#1A378E",
      800: "#0F266C",
      900: "#07184A",
    },
    primary: {
      50: KMUTT_CI.orangeLight,
      100: "#FFCABE",
      200: "#FFA592",
      300: "#FF8165",
      400: "#F35836",
      500: KMUTT_CI.orange,
      600: KMUTT_CI.orangeHover,
      700: "#8D2109",
      800: "#6B1401",
      900: "#490D00",
    },
    kmutt: {
      50: KMUTT_CI.orangeLight,
      100: "#FFD5C8",
      200: "#FFAA91",
      300: "#FF805B",
      400: "#FA5B2D",
      500: KMUTT_CI.orange,
      600: KMUTT_CI.orangeHover,
      700: "#B82A05",
      800: "#8A1C00",
      900: "#5C1100",
    },
    orange: {
      50: KMUTT_CI.orangeLight,
      100: "#FFD5C8",
      200: "#FFAA91",
      300: "#FF805B",
      400: "#FA5B2D",
      500: KMUTT_CI.orange,
      600: KMUTT_CI.orangeHover,
      700: "#B82A05",
      800: "#8A1C00",
      900: "#5C1100",
    },
    grayScale: {
      50: "#EDF2F7",
      100: "#D6DCE3",
      200: "#BFC7CE",
      300: "#A9B2BA",
      400: "#949DA5",
      500: "#808891",
      600: "#6C747D",
      700: "#586068",
      800: "#3B3B3B",
      900: "#343A3F",
    },
    background: {
      primary: "#0B0C0D",
      secondary: "#343A3F",
    },
    header: {
      400: "#F8F9FA",
      500: "#E0E0E0",
    },
    body: {
      primary: "F8F9FA",
      secondary: "#BDBDBD",
      LightPrimary: "#616161",
      LightSecondary: "#9E9E9E",
    },

    error: "#ed455c",
    success: "#46ada7",
    warning: "#f6925a",
  },

  fonts: {
    heading: "'DB Heavent Bd Cond', sans-serif",
    body: "'DB Heavent Cond', 'IBM Plex Sans Thai', sans-serif",
    mono: "Menlo, monospace",
  },

  breakpoints,

  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        color: mode("#000", "white")(props),
        bg: mode("#000000", "#000000")(props),
        overflowX: "hidden",
        lineHeight: "base",
        backgroundPosition: "0 -10vh",
        backgroundRepeat: "no-repeat",
        justifyContent: "center",
        backgroundSize: "cover",
        letterSpacing: "0.025rem",
      },
      td: {
        lineHeight: "22px",
      },
      th: {
        lineHeight: "22px",
      },
    }),
  },
});

export default theme;

