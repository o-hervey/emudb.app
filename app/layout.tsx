import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthContext";
import { FiltersProvider } from "@/components/FiltersContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "EmuDB — Emulation Software Directory",
  description:
    "EmuDB is a community-driven directory of emulation software — browse and compare emulators, frontends, compatibility layers, ROM managers, media scrapers, and more across 13 categories, 89+ gaming systems, and 171+ hardware devices.",
  openGraph: {
    title: "EmuDB — Emulation Software Directory",
    description:
      "Browse and compare emulators, frontends, compatibility layers, ROM managers, and more. Community ratings, platform filters, and compatibility data for 89+ gaming systems.",
    url: "https://emudb.app",
    siteName: "EmuDB",
    type: "website",
  },
};

// Runs before React hydration to apply the saved theme without a flash.
const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('emudb-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (stored === 'dark' || (!stored && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
        <ThemeProvider>
          <AuthProvider>
            <FiltersProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </FiltersProvider>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
