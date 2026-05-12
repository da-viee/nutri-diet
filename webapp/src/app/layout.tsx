import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NutriWise – Personalized Nutritional Guidance",
  description: "A culturally grounded, medically safe nutritional guidance PWA for underserved communities in Nigeria.",
  manifest: "/manifest.json",
  themeColor: "#0a0f0d",
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
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        <div className="bg-mesh" />
        <div style={{ position: "relative", zIndex: 1 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
