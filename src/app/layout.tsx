import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppLayout from "@/components/layout/AppLayout";
import SWRProvider from "@/lib/swr-provider";
import { ToastProvider } from "@/hooks/useToast";
import InstallPrompt from "@/components/ui/InstallPrompt";
import OfflineIndicator from "@/components/ui/OfflineIndicator";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Allergy Tracker",
  description: "Personal allergy tracking and analytics application",
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <ToastProvider>
            <SWRProvider>
              <AppLayout>{children}</AppLayout>
              <InstallPrompt />
              <OfflineIndicator />
            </SWRProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
