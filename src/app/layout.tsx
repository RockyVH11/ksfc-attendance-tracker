import type { Metadata, Viewport } from "next";
import "./globals.css";
import { APP_NAME_FULL, APP_TAGLINE } from "@/lib/constants";

export const metadata: Metadata = {
  title: APP_NAME_FULL,
  description: APP_TAGLINE,
  applicationName: APP_NAME_FULL,
  appleWebApp: {
    capable: true,
    title: "KSFC Attendance",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#003087",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
