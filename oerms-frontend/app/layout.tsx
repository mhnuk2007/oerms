import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavClient from "./components/NavClient";
import { AuthProvider } from "./components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OERMS - Online Exam & Result Management System",
  description: "Frontend for OERMS - exam creation, delivery and analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <NavClient />
              <main className="flex-1 container">{children}</main>
              <footer className="border-t py-6 text-center text-sm text-gray-500">© OERMS</footer>
            </div>
          </AuthProvider>
      </body>
    </html>
  );
}
