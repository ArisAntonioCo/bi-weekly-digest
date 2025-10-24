import type { Metadata } from "next";
import { Instrument_Sans, Geist_Mono } from "next/font/google";
import Navbar from "@/components/ui/navbar";
import { SelectiveThemeProvider } from "@/providers/selective-theme-provider";
import { SWRProvider } from "@/providers/swr-provider";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { Toaster } from "@/components/ui/sonner";
import { BannerProvider } from "@/contexts/banner-context";
import { FreemiumBanner } from "@/components/freemium-banner";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://3ymode.com'),
  title: {
    default: "3YMode - Personalized 3-Year MOIC Projections & Portfolio Analysis",
    template: "%s | 3YMode",
  },
  description:
    "3YMode delivers personalized 3-year MOIC projections and analysis through stacked expert frameworks—helping you build conviction in your long-term investment strategy.",
  keywords: [
    "3YMode",
    "MOIC",
    "3-year MOIC",
    "investment analysis",
    "expert frameworks",
    "personalized investing",
    "stock projections",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': "large",
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "3YMode - Personalized 3-Year MOIC Projections & Portfolio Analysis",
    siteName: "3YMode",
    description:
      "Personalized 3-year MOIC projections and analysis through expert frameworks.",
    images: [
      {
        url: "/3YMode.png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "3YMode - Personalized 3-Year MOIC Projections & Portfolio Analysis",
    description:
      "Personalized 3-year MOIC projections and analysis through expert frameworks.",
    images: ["/3YMode.png"],
  },
  icons: {
    icon: [
      { url: "/3YMode.svg", type: "image/svg+xml" },
      { url: "/3YMode.png", sizes: "any" },
    ],
    apple: "/3YMode.png",
    shortcut: "/3YMode.png",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
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
