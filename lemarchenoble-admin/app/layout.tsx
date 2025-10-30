import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/app/providers";
import { Inter, JetBrains_Mono } from "next/font/google";

const geistSans = Inter({ subsets: ["latin"] });
const geistMono = JetBrains_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Le Marche Noble - Admin Dashboard",
  description: "Admin dashboard for Le Marche Noble e-commerce platform",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${geistSans.className} ${geistMono.className}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
