import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Hanken_Grotesk } from "next/font/google";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { LoadingScreen } from "@/components/layout/loading-screen";
import "./globals.css";

const sans = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500"],
});

const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://koboku.studio"),
  title: {
    default: "Koboku Studio — Crafted in motion",
    template: "%s · Koboku Studio",
  },
  description:
    "Koboku Studio is an independent creative studio serving yachting, hospitality, real estate, and UHNWI brands — brand systems, digital flagships, and 3D-first storytelling.",
  openGraph: {
    type: "website",
    siteName: "Koboku Studio",
    title: "Koboku Studio — Crafted in motion",
    description:
      "Independent creative studio serving yachting, hospitality, real estate, and UHNWI brands.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0E2A47",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sans.variable}>
      <body className={bodoniModa.variable}>
        <LoadingScreen />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
