import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vibrary.vercel.app"),
  title: {
    default: "Vibrary — The Open Library for Vibecoded Projects",
    template: "%s | Vibrary",
  },
  description:
    "Discover, share, and clone community-created vibecoded projects. The open registry for AI-built apps, components, and tools.",
  openGraph: {
    title: "Vibrary — The Open Library for Vibecoded Projects",
    description:
      "Discover, share, and clone community-created vibecoded projects.",
    type: "website",
    siteName: "Vibrary",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vibrary — The Open Library for Vibecoded Projects",
    description:
      "Discover, share, and clone community-created vibecoded projects.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${fraunces.variable}`}
    >
      <body className="flex min-h-screen flex-col font-sans">
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
