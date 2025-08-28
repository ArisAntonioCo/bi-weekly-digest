import type { Metadata } from "next";
import { Instrument_Sans, Geist_Mono } from "next/font/google";
import Navbar from "@/components/ui/navbar";
import { SelectiveThemeProvider } from "@/providers/selective-theme-provider";
import { SWRProvider } from "@/providers/swr-provider";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { Toaster } from "@/components/ui/sonner";
import { FreemiumBanner } from "@/components/freemium-banner";
import { BannerProvider } from "@/contexts/banner-context";
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
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${instrumentSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen bg-background`}
        suppressHydrationWarning
      >
        <SelectiveThemeProvider 
          defaultTheme="light" 
          storageKey="bi-weekly-digest-theme"
          excludedPaths={["/", "/login", "/signup", "/auth/*"]}
        >
          <SWRProvider>
            <BannerProvider>
              <FreemiumBanner />
              <Navbar />
              <LayoutWrapper>{children}</LayoutWrapper>
              <Toaster />
            </BannerProvider>
          </SWRProvider>
        </SelectiveThemeProvider>
      </body>
    </html>
  );
}
