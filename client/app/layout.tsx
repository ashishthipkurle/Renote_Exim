import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Analytics } from "@vercel/analytics/react";

import CinematicPreloader from "@/components/ui/CinematicPreloader";
import Footer from "@/components/layout/Footer";
import CommandMenu from "@/components/ui/CommandMenu";
import CookieConsent from "@/components/ui/CookieConsent";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "Renote Exim - Global Import Export Platform",
    template: "%s | Renote Exim",
  },
  description: "Enterprise-grade import-export platform connecting businesses worldwide",
  keywords: ["import", "export", "trade", "global business", "B2B", "marketplace"],
  authors: [{ name: "Renote Exim" }],
  creator: "Renote Exim",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Renote Exim",
    title: "Renote Exim - Global Import Export Platform",
    description: "Enterprise-grade import-export platform connecting businesses worldwide",
    images: [
      {
        url: "/og-image.jpg", // Needs to be added to public folder
        width: 1200,
        height: 630,
        alt: "Renote Exim Cover",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Renote Exim - Global Import Export Platform",
    description: "Enterprise-grade import-export platform connecting businesses worldwide",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

import SkipToContent from "@/components/SkipToContent";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${manrope.variable} font-sans antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <SkipToContent />
            <CinematicPreloader />
            <main id="main-content">
              {children}
            </main>
            <Footer />
            <Toaster position="top-right" richColors />
            <CommandMenu />
            <CookieConsent />
            <Analytics />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
