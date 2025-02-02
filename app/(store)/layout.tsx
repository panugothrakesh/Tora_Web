import type { Metadata } from "next";
import localFont from "next/font/local";
import "../globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/Header";
import { SanityLive } from "@/sanity/lib/client-live";
import Script from "next/dist/client/script";
import Footer from "@/components/footer";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Tora Fashion | Commerce Reinvented",
  description:
    "Discover Tora &ndash; your destination for trendy, high-quality fashion. Shop the latest collections of clothing, accessories, and more, crafted for style and comfort. Reinvent your wardrobe today with Tora!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider dynamic>
      <html lang="en">
        <head>
          <Script
            src="https://checkout.razorpay.com/v1/checkout.js"
            strategy="lazyOnload"
          />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <main>
            <Header />
            {children}
            <Footer />
          </main>
          <SanityLive />
        </body>
      </html>
    </ClerkProvider>
  );
}
