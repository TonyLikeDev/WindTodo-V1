import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import LazyEffectsCanvas from "@/components/LazyEffectsCanvas";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "WindTodo",
  description: "A peaceful, sky-inspired task manager.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <GoogleTagManager gtmId="GTM-NG5FZLJ3" />
      <GoogleAnalytics gaId="G-8Q2FH16K5L" />
      <body className="text-foreground min-h-screen font-sans overflow-x-hidden custom-scrollbar" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <LazyEffectsCanvas />
        </ThemeProvider>
      </body>
    </html>
  );
}
