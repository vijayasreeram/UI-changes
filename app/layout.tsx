import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/context/ThemeContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Scanzaa Restaurant Admin",
  description: "Manage your restaurant menu, QR codes, and kitchen operations with elegance",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#020905",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} dark`} suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen selection:bg-emerald-500 selection:text-black transition-colors duration-200">
        <ThemeProvider>
          {children}
          <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#04150b",
              color: "#ecfdf5",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              borderRadius: "14px",
              fontSize: "13px",
              fontWeight: 500,
              padding: "12px 18px",
              boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.8), 0 0 15px rgba(16, 185, 129, 0.15)",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#020905",
              },
            },
            error: {
              iconTheme: {
                primary: "#f43f5e",
                secondary: "#fff",
              },
            },
          }}
        />
        </ThemeProvider>
      </body>
    </html>
  );
}
