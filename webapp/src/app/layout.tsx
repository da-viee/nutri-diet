import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NutriWise – Personalized Nutritional Guidance",
  description: "A culturally grounded, medically safe nutritional guidance PWA for underserved communities in Nigeria.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NutriWise",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#0a0f0d" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-screen flex flex-col">
        <div className="fixed inset-0 z-0 bg-mesh" />
        <div className="relative z-10 flex-grow">
          {children}
        </div>
      </body>
    </html>
  );
}