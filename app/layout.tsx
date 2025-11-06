import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import { CONSTANTS } from "@/lib/constants";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: CONSTANTS.META.TITLE,
  description: CONSTANTS.META.DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} font-sans antialiased bg-background text-[var(--foreground)]`}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
