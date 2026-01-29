import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { MotionProvider } from "@/lib/motion-provider";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LinkHub - One Link For Everything",
  description: "Create a beautiful page with all your links. Share it everywhere. Track clicks and grow your audience.",
  keywords: ["link in bio", "linktree alternative", "social media links", "creator tools"],
  authors: [{ name: "LinkHub" }],
  openGraph: {
    title: "LinkHub - One Link For Everything",
    description: "Create a beautiful page with all your links. Share it everywhere.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${plusJakarta.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <MotionProvider>
          {children}
        </MotionProvider>
      </body>
    </html>
  );
}
