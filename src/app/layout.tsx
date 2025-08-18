import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextAuthProvider } from "@/components/providers/session-provider";
import { BrandingProvider } from "@/providers/BrandingProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ACER Music - Plateforme Musicale",
  description: "Système de gestion musicale pour l'Église ACER PARIS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextAuthProvider>
          <BrandingProvider>
            {children}
          </BrandingProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
