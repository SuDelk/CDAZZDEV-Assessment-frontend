import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Montserrat } from "next/font/google";
import "./globals.css";

// ✅ Load Montserrat font
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Online Learning Platform",
  description: "Built with Next.js and TypeScript",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} font-sans antialiased bg-[var(--background)] text-[var(--foreground)]`}
      >
        {/* ✅ Navbar */}
        <header className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-[var(--background)]">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <Image
              src="/logo.png" // ✅ place your logo image in /public/logo.png
              alt="Logo"
              width={40}
              height={40}
              className="rounded-md"
            />
            <span className="font-semibold text-lg">Online Learning</span>
          </Link>
        </header>

        {/* ✅ Page Content */}
        <main className="min-h-[calc(100vh-64px)]">{children}</main>
      </body>
    </html>
  );
}
