import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Analytics } from "@vercel/analytics/react";

import dynamic from "next/dynamic";
import CommandMenu from "@/components/ui/CommandMenu";
import CookieConsent from "@/components/ui/CookieConsent";
import { I18nProvider } from "@/components/i18n/I18nProvider";

const CinematicPreloader = dynamic(() => import("@/components/ui/CinematicPreloader"), {
  ssr: false,
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["300", "400", "500", "600", "700"],
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
          href="https://fonts.googleapis.com/icon?family=Material+Icons&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{
          __html: `
          (function() {
            if (window.location.pathname === '/') {
              document.documentElement.classList.add('is-home');
            }
          })();
        `}} />
      </head>
      <body className={`${sora.variable} font-sans antialiased`}>
        <I18nProvider>
          <ThemeProvider>
            <AuthProvider>
              <SkipToContent />
              <CinematicPreloader />
              <main id="main-content">
                {children}
              </main>
              <Toaster position="top-right" richColors />
              <CommandMenu />
              <CookieConsent />
              <Analytics />
            </AuthProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
