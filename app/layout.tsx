import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "LexiAI - AI-Powered Lawyer Appointment Platform",
    template: "%s | LexiAI",
  },
  description:
    "Connect with verified lawyers, get instant AI legal advice, and manage your legal matters — all in one platform. Available 24/7 for Pakistani law.",
  keywords: ["lawyer", "legal advice", "AI assistant", "Pakistan law", "appointment booking"],
  authors: [{ name: "LexiAI" }],
  openGraph: {
    title: "LexiAI - AI-Powered Lawyer Appointment Platform",
    description: "Get instant AI legal advice and connect with top lawyers in Pakistan.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
   return (
     <html lang="en" suppressHydrationWarning className={cn("h-full", inter.variable, "font-sans", geist.variable)}>
       <body className="min-h-full flex flex-col antialiased" suppressHydrationWarning>
         <ThemeProvider
           attribute="class"
           defaultTheme="system"
           enableSystem
           disableTransitionOnChange
         >
           {children}
           <Toaster
             position="top-right"
             toastOptions={{
               duration: 4000,
               style: {
                 background: "hsl(var(--background))",
                 color: "hsl(var(--foreground))",
                 border: "1px solid hsl(var(--border))",
               },
             }}
           />
         </ThemeProvider>
       </body>
     </html>
   );
}
