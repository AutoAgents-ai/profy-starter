import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Profy App",
  description: "Powered by Profy Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={process.env.NEXT_PUBLIC_LOCALE || "zh"}>
      <body>{children}</body>
    </html>
  );
}
