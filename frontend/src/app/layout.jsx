import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata = {
  title: "Veracity AI",
  description:
    "Detect, verify, and score claims and rumours across the web in real-time.",
  icons: {
    icon: "/logo1.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans min-h-screen antialiased mesh-bg`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}