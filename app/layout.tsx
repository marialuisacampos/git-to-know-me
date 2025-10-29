import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { UserDataProvider } from "@/contexts/UserDataContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Git to know me",
  icons: {
    icon: "/favicon.svg",
  },
  description: "Show your code. Tell your story.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-100`}
      >
        <SessionProvider>
          <UserDataProvider>
            {children}
            <ToastProvider />
            {/* <ConsentBanner /> */}
          </UserDataProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
