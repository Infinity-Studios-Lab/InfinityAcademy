import "./globals.css";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Infinity Academy Panel",
  description: "Tutor/Parent/Student panel",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="business">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
