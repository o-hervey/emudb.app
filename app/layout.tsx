import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/AuthContext";
import { FiltersProvider } from "@/components/FiltersContext";
import { Header } from "@/components/Header";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EmuDB — Emulation Software Directory",
  description: "A community-driven, filterable directory of emulation software.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        <AuthProvider>
          <FiltersProvider>
            <Header />
            <main className="flex-1">{children}</main>
          </FiltersProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
