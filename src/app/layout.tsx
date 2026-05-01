import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yumm - Food Delivery",
  description: "Modern food delivery platform",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-neutral antialiased">
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
