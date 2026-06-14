import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import Template from "./template";
import CommandPalette from "../components/CommandPalette";
import SmoothScroll from "../components/SmoothScroll"; // <-- NEW IMPORT

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mahamud Hasan | Software Developer",
  description: "Portfolio of Mahamud Hasan, a Full-Stack Software Developer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased selection:bg-blue-500/30`}>
        {/* NEW: Wrap the entire app in the Smooth Scroll physics engine */}
        <SmoothScroll>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            
            {/* The Custom Cursor has been completely removed from here! */}
            
            <CommandPalette />
            
            <Template>
              {children}
            </Template>
          </ThemeProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}