import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Bricolage_Grotesque, Geist_Mono } from "next/font/google";
import { AuthProvider } from "./context/AuthContext";
import { WebSocketProvider } from "./context/WebSocketContext";
import "./globals.css";
import "./skeletons.css";

const geistSans = Bricolage_Grotesque({
  variable: "--font-bricolage-grotesque",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HomeGuardian",
  description: "Find Safety in Your Home with a Tech Smart Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <WebSocketProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              {children}
            </ThemeProvider>
          </WebSocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
