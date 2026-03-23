import type { Metadata } from "next";
import { Inter, Quicksand } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/src/contexts/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
});

export const metadata: Metadata = {
  title: "PathSpring - Where Stories Bloom & Hearts Grow",
  description:
    "Interactive social-emotional learning stories for Nigerian kids. Discover magical tales that teach kindness, courage, and emotional wisdom.",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${quicksand.variable}`}>
      <body className="font-sans">
         <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}