import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Insait ICO to Image Converter",
  description: "Convert ICO icon files to high-quality JPEG or PNG images instantly — powered by Insait.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
