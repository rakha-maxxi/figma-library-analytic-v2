import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Componently — Design System Component Usage Tracker",
  description:
    "Track design system component usage across your registered Figma files based on scan history. An internal Design Ops dashboard for adoption, change detection, and governance.",
  keywords: [
    "design system",
    "component usage",
    "Figma analytics",
    "Design Ops",
    "UI Kit tracker",
    "component adoption",
    "design system governance",
  ],
  authors: [{ name: "Componently" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Componently — Design System Component Usage Tracker",
    description:
      "See where every design system component is used across your registered Figma files. Scan-based history, change detection, and governance insights for Design Ops.",
    url: "https://chat.z.ai",
    siteName: "Componently",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Componently — Design System Component Usage Tracker",
    description:
      "Track design system component usage across registered Figma files based on scan history.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${dmSans.variable} ${dmMono.variable} font-sans`}
    >
      <body
        className="bg-background font-sans text-foreground antialiased"
      >
        <Providers>
          {children}
        </Providers>
        <Toaster />
        <SonnerToaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
