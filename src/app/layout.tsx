import type { Metadata } from "next";
import { Instrument_Sans, Geist_Mono } from "next/font/google";
import Navbar from "@/components/ui/navbar";
import { ThemeProvider } from "@/providers/theme-provider";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Weekly Digest - AI-Powered Investment Intelligence",
  description: "Get comprehensive weekly analysis of market trends, investment opportunities, and strategic insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${instrumentSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen bg-background`}
      >
        <ThemeProvider defaultTheme="light" storageKey="bi-weekly-digest-theme">
          <Navbar className="sticky top-0 z-50 bg-background" />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
