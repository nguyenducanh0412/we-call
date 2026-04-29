import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WebCall - Real-time calls, zero friction",
  description: "Video calling application with LiveKit and Socket.io",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
