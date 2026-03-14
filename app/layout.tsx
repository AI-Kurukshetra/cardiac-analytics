import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cardiac Care AI",
  description: "Authentication flows for patients and providers.",
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
