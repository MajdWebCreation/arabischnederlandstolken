import {
  IBM_Plex_Sans,
  Noto_Sans_Arabic,
} from "next/font/google";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const arabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  preload: false,
});

export const baseFontVariables = plexSans.variable;
export const arabicFontVariable = arabic.variable;
