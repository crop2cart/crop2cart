import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Bricolage_Grotesque, Geist_Mono } from "next/font/google";
import { AuthProvider } from "./context/AuthContext";
import { WebSocketProvider } from "./context/WebSocketContext";
import { I18nProvider } from "@/components/i18n-provider";
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
  title: "Crop2Cart",
  description: "No middlemen. No markups. Just fresh, organic fruits delivered straight from local farmers",
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
        <I18nProvider>
          <AuthProvider>
            <WebSocketProvider>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                {children}
              </ThemeProvider>
            </WebSocketProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
