import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GlobalContextProvider } from "@/components/context/globalcontext";
import 'katex/dist/katex.min.css';
import { ReduxProviders } from "@/components/context/reduxProvider";
import { Toaster, toast } from 'sonner'
import Navbar from "@/components/layout/navbar";
import { auth } from "@/auth";

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

export  default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth()
  console.log('====================================');
  console.log(session);
  console.log('====================================');
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProviders>


        <GlobalContextProvider>
          <Toaster/>
          <Navbar session={session!}/>
                  {children}
        </GlobalContextProvider>
                </ReduxProviders>

      </body>
    </html>
  );
}
