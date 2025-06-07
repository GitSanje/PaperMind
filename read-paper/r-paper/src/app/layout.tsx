import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GlobalContextProvider } from "@/components/context/globalcontext";
import 'katex/dist/katex.min.css';
import { ReduxProviders } from "@/components/context/reduxProvider";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Paper Mind",
  description: "Landing page",
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
        <ReduxProviders>


        <GlobalContextProvider>
                  {children}
        </GlobalContextProvider>
                </ReduxProviders>

      </body>
    </html>
  );
}
