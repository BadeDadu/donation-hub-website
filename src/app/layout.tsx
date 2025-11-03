import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/lib/language-context";

export const metadata: Metadata = {
   title: "DaanSetu — Donate items and help your community",
   description: "DaanSetu connects generous donors with local needs. Donate clothes, furniture, electronics, books, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <LanguageProvider>
          <ErrorReporter />
          <Script
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
            strategy="afterInteractive"
            data-target-origin="*"
            data-message-type="ROUTE_CHANGE"
            data-include-search-params="true"
            data-only-in-iframe="true"
            data-debug="true"
            data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
          />
          <Header />
          {children}
          <Footer />
          <Toaster position="top-right" />
          <VisualEditsMessenger />
        </LanguageProvider>
      </body>
    </html>
  );
}