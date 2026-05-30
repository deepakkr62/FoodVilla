import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Food Villa — Taste the Comfort",
    template: "%s · Food Villa",
  },
  description:
    "Discover the best restaurants near you. Browse menus, place orders and track them in real time. Welcome to Food Villa.",
  openGraph: {
    title: "Food Villa",
    description: "Taste the Comfort. Order food from your favorite places.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream text-ink antialiased">
        <Header />
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
